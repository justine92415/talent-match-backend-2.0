/**
 * 購買記錄服務層
 * 處理用戶課程購買記錄相關的業務邏輯
 */

import { v4 as uuidv4 } from 'uuid'
import { Repository, In } from 'typeorm'
import { dataSource } from '@db/data-source'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'
import { Order } from '@entities/Order'
import { OrderItem } from '@entities/OrderItem'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { PaymentStatus } from '@entities/enums';
import { BusinessError } from '@utils/errors';
import { ERROR_CODES, MESSAGES } from '@constants/index'
import type { PurchaseRecord, PurchaseRecordWithDetails, CoursePurchaseDetail } from '../types';

/**
 * 購買統計資料介面
 */
interface PurchaseSummary {
  total_courses: number
  total_amount_spent: number
  active_purchases: number
  total_sessions_remaining: number
  total_quantity_purchased: number
  total_quantity_used: number
  total_quantity_remaining: number
}

export class PurchaseService {
  private orderRepository: Repository<Order>
  private orderItemRepository: Repository<OrderItem>
  private courseRepository: Repository<Course>
  private coursePriceOptionRepository: Repository<CoursePriceOption>
  private teacherRepository: Repository<Teacher>
  private userRepository: Repository<User>
  private purchaseRepository: Repository<UserCoursePurchase>

  constructor() {
    this.orderRepository = dataSource.getRepository(Order)
    this.orderItemRepository = dataSource.getRepository(OrderItem)
    this.courseRepository = dataSource.getRepository(Course)
    this.coursePriceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
    this.purchaseRepository = dataSource.getRepository(UserCoursePurchase)
  }

  /**
   * 處理訂單付款完成後建立購買記錄
   */
  async createPurchaseFromOrder(orderId: number): Promise<PurchaseRecord[]> {
    // 1. 驗證訂單存在且已付款
    const order = await this.validatePaidOrder(orderId)
    
    // 2. 取得訂單項目
    const orderItems = await this.orderItemRepository.find({
      where: { order_id: orderId }
    })

    if (orderItems.length === 0) {
      throw new BusinessError(
        ERROR_CODES.ORDER_NOT_FOUND,
        MESSAGES.BUSINESS.ORDER_NOT_FOUND,
        404
      )
    }

    // 3. 查詢價格方案以取得實際的課程堂數
    const priceOptionIds = orderItems.map(item => item.price_option_id)
    const priceOptions = await this.coursePriceOptionRepository.find({
      where: { id: In(priceOptionIds) }
    })
    
    // 建立價格方案查找 Map
    const priceOptionMap = new Map<number, CoursePriceOption>()
    priceOptions.forEach(option => {
      priceOptionMap.set(option.id, option)
    })

    // 4. 將同一課程的不同方案合併計算總堂數
    const courseQuantityMap = new Map<number, number>()
    orderItems.forEach(item => {
      const priceOption = priceOptionMap.get(item.price_option_id)
      if (!priceOption) {
        throw new BusinessError(
          ERROR_CODES.ORDER_NOT_FOUND,
          `找不到價格方案 ID: ${item.price_option_id}`,
          404
        )
      }
      
      // 實際堂數 = 價格方案的堂數 * 購買數量
      const actualQuantity = priceOption.quantity * item.quantity
      const currentQuantity = courseQuantityMap.get(item.course_id) || 0
      courseQuantityMap.set(item.course_id, currentQuantity + actualQuantity)
    })

    // 5. 查詢用戶對這些課程的現有購買記錄（移除 order_id 限制）
    const courseIds = Array.from(courseQuantityMap.keys())
    const existingPurchases = await this.purchaseRepository.find({
      where: {
        user_id: order.buyer_id,
        course_id: In(courseIds)
        // 移除 order_id: orderId 限制，查詢所有該用戶對這些課程的購買記錄
      }
    })

    // 建構現有購買記錄的快速查找 Map
    const existingPurchaseMap = new Map<number, UserCoursePurchase>()
    existingPurchases.forEach(purchase => {
      existingPurchaseMap.set(purchase.course_id, purchase)
    })

    // 6. 更新或建立購買記錄
    const purchases: PurchaseRecord[] = []
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      for (const [courseId, totalQuantity] of courseQuantityMap) {
        const existingPurchase = existingPurchaseMap.get(courseId)
        
        if (existingPurchase) {
          // 更新現有記錄：累加數量
          existingPurchase.quantity_total += totalQuantity
          existingPurchase.updated_at = new Date()
          
          const updatedPurchase = await queryRunner.manager.save(existingPurchase)
          
          purchases.push({
            id: updatedPurchase.id,
            uuid: updatedPurchase.uuid,
            user_id: updatedPurchase.user_id,
            course_id: updatedPurchase.course_id,
            order_id: updatedPurchase.order_id, // 保留原始訂單ID
            quantity_total: updatedPurchase.quantity_total,
            quantity_used: updatedPurchase.quantity_used,
            created_at: updatedPurchase.created_at
          })
        } else {
          // 建立新記錄
          const purchase = queryRunner.manager.create(UserCoursePurchase, {
            uuid: uuidv4(),
            user_id: order.buyer_id,
            course_id: courseId,
            order_id: orderId,
            quantity_total: totalQuantity,
            quantity_used: 0
          })

          const savedPurchase = await queryRunner.manager.save(purchase)
          
          purchases.push({
            id: savedPurchase.id,
            uuid: savedPurchase.uuid,
            user_id: savedPurchase.user_id,
            course_id: savedPurchase.course_id,
            order_id: savedPurchase.order_id,
            quantity_total: savedPurchase.quantity_total,
            quantity_used: savedPurchase.quantity_used,
            created_at: savedPurchase.created_at
          })
        }
      }

      await queryRunner.commitTransaction()
      return purchases
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 取得用戶購買記錄列表（已優化，避免 N+1 查詢）
   */
  async getUserPurchases(
    userId: number, 
    courseId?: number
  ): Promise<PurchaseRecordWithDetails[]> {
    const queryBuilder = this.purchaseRepository
      .createQueryBuilder('purchase')
      .where('purchase.user_id = :userId', { userId })
      .orderBy('purchase.created_at', 'DESC')

    // 如果指定了課程ID，則增加過濾條件
    if (courseId) {
      queryBuilder.andWhere('purchase.course_id = :courseId', { courseId })
    }

    const purchases = await queryBuilder.getMany()

    if (purchases.length === 0) {
      return []
    }

    // 批次查詢相關數據以避免 N+1 問題
    const courseIds = purchases.map(p => p.course_id)
    const orderIds = purchases.map(p => p.order_id)

    const [courses, orders] = await Promise.all([
      this.courseRepository.find({
        where: { id: In(courseIds) }
      }),
      this.orderRepository.find({
        where: { id: In(orderIds) }
      })
    ])

    // 查詢教師資訊
    const teacherIds = courses.map(c => c.teacher_id).filter(Boolean)
    const teachers = teacherIds.length > 0 ? await this.teacherRepository.find({
      where: { id: In(teacherIds) },
      relations: ['user']
    }) : []

    // 建構快速查找對應表
    const courseMap = new Map(courses.map(c => [c.id, c]))
    const orderMap = new Map(orders.map(o => [o.id, o]))
    const teacherMap = new Map(teachers.map(t => [t.id, t]))

    // 組合資料
    const purchasesWithDetails: PurchaseRecordWithDetails[] = purchases.map(purchase => {
      const course = courseMap.get(purchase.course_id)
      const teacher = course ? teacherMap.get(course.teacher_id) : null
      const order = orderMap.get(purchase.order_id)

      return {
        id: purchase.id,
        uuid: purchase.uuid,
        user_id: purchase.user_id,
        course_id: purchase.course_id,
        order_id: purchase.order_id,
        quantity_total: purchase.quantity_total,
        quantity_used: purchase.quantity_used,
        quantity_remaining: purchase.quantity_total - purchase.quantity_used,
        created_at: purchase.created_at,
        course: course && teacher ? {
          id: course.id,
          uuid: course.uuid,
          name: course.name,
          main_image: course.main_image || '',
          teacher: {
            id: teacher.id,
            user: {
              name: teacher.user?.name || '',
              nick_name: teacher.user?.nick_name || ''
            }
          }
        } : {
          id: 0,
          uuid: '',
          name: '課程不存在',
          main_image: '',
          teacher: {
            id: 0,
            user: {
              name: '',
              nick_name: ''
            }
          }
        },
        order: order ? {
          id: order.id,
          uuid: order.uuid,
          total_amount: order.total_amount,
          paid_at: order.paid_at || new Date()
        } : null
      }
    })

    return purchasesWithDetails
  }

  /**
   * 取得單一購買記錄詳情
   */
  async getPurchaseById(purchaseId: number, userId: number): Promise<PurchaseRecordWithDetails> {
    // 先檢查購買記錄是否存在（不限制用戶）
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId }
    })

    if (!purchase) {
      throw new BusinessError(
        ERROR_CODES.PURCHASE_NOT_FOUND,
        MESSAGES.BUSINESS.PURCHASE_NOT_FOUND,
        404
      )
    }

    // 檢查是否為購買記錄的擁有者
    if (purchase.user_id !== userId) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ACCESS,
        MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
        403
      )
    }

    // 手動查詢課程資料
    const course = await this.courseRepository.findOne({
      where: { id: purchase.course_id }
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_NOT_FOUND,
        404
      )
    }

    // 查詢老師資料
    const teacherData = await this.teacherRepository.findOne({
      where: { id: course.teacher_id },
      relations: ['user']
    })

    // 查詢訂單資料 (可選，可能不存在)
    const order = await this.orderRepository.findOne({
      where: { id: purchase.order_id }
    })

    return {
      id: purchase.id,
      uuid: purchase.uuid,
      user_id: purchase.user_id,
      course_id: purchase.course_id,
      order_id: purchase.order_id,
      quantity_total: purchase.quantity_total,
      quantity_used: purchase.quantity_used,
      quantity_remaining: purchase.quantity_total - purchase.quantity_used,
      created_at: purchase.created_at,
      course: {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        main_image: course.main_image || '',
        teacher: {
          id: teacherData?.id || 0,
          user: {
            name: teacherData?.user?.name || 'Unknown Teacher',
            nick_name: teacherData?.user?.nick_name || ''
          }
        }
      },
      order: order ? {
        id: order.id,
        uuid: order.uuid,
        total_amount: order.total_amount,
        paid_at: order.paid_at
      } : null
    }
  }

  /**
   * 取得特定課程的購買記錄
   */
  async getCoursePurchase(userId: number, courseId: number): Promise<CoursePurchaseDetail> {
    const purchase = await this.purchaseRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })

    if (!purchase) {
      throw new BusinessError(
        ERROR_CODES.PURCHASE_NOT_FOUND,
        MESSAGES.BUSINESS.PURCHASE_NOT_FOUND,
        404
      )
    }

    const course = await this.courseRepository.findOne({
      where: { id: purchase.course_id }
    })

    let teacher = null
    if (course) {
      teacher = await this.teacherRepository.findOne({
        where: { id: course.teacher_id },
        relations: ['user']
      })
    }

    return {
      id: purchase.id,
      uuid: purchase.uuid,
      user_id: purchase.user_id,
      course_id: purchase.course_id,
      order_id: purchase.order_id,
      quantity_total: purchase.quantity_total,
      quantity_used: purchase.quantity_used,
      quantity_remaining: purchase.quantity_total - purchase.quantity_used,
      created_at: purchase.created_at,
      course: course && teacher ? {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        teacher: {
          user: {
            nick_name: teacher.user.nick_name
          }
        }
      } : null
    }
  }

  /**
   * 使用購買的課程堂數
   */
  async consumePurchase(
    userId: number, 
    courseId: number, 
    quantity: number = 1
  ): Promise<PurchaseRecord> {
    const purchase = await this.purchaseRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })

    if (!purchase) {
      throw new BusinessError(
        ERROR_CODES.PURCHASE_NOT_FOUND,
        MESSAGES.BUSINESS.PURCHASE_NOT_FOUND,
        404
      )
    }

    const remainingQuantity = purchase.quantity_total - purchase.quantity_used
    if (remainingQuantity < quantity) {
      throw new BusinessError(
        ERROR_CODES.INSUFFICIENT_PURCHASE_QUANTITY,
        MESSAGES.BUSINESS.INSUFFICIENT_PURCHASE_QUANTITY,
        400
      )
    }

    // 更新使用數量
    await this.purchaseRepository.update(purchase.id, {
      quantity_used: purchase.quantity_used + quantity
    })

    // 回傳更新後的記錄
    const updatedPurchase = await this.purchaseRepository.findOne({
      where: { id: purchase.id }
    })

    return {
      id: updatedPurchase!.id,
      uuid: updatedPurchase!.uuid,
      user_id: updatedPurchase!.user_id,
      course_id: updatedPurchase!.course_id,
      order_id: updatedPurchase!.order_id,
      quantity_total: updatedPurchase!.quantity_total,
      quantity_used: updatedPurchase!.quantity_used,
      created_at: updatedPurchase!.created_at
    }
  }

  /**
   * 檢查用戶是否已購買特定課程
   */
  async hasPurchasedCourse(userId: number, courseId: number): Promise<boolean> {
    const purchase = await this.purchaseRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })

    return !!purchase
  }

  /**
   * 取得剩餘可用堂數
   */
  async getRemainingQuantity(userId: number, courseId: number): Promise<number> {
    const purchase = await this.purchaseRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })

    if (!purchase) {
      return 0
    }

    return purchase.quantity_total - purchase.quantity_used
  }

  /**
   * 驗證訂單已付款
   */
  private async validatePaidOrder(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId }
    })

    if (!order) {
      throw new BusinessError(
        ERROR_CODES.ORDER_NOT_FOUND,
        MESSAGES.BUSINESS.ORDER_NOT_FOUND,
        404
      )
    }

    if (order.payment_status !== PaymentStatus.COMPLETED) {
      throw new BusinessError(
        ERROR_CODES.ORDER_NOT_FOUND, // 使用現有的錯誤碼
        MESSAGES.BUSINESS.ORDER_NOT_FOUND,
        400
      )
    }

    return order
  }

  /**
   * 取得購買記錄詳細資訊
   */
  private async getPurchaseRecordWithDetails(purchase: UserCoursePurchase): Promise<PurchaseRecordWithDetails> {
    const course = await this.courseRepository.findOne({
      where: { id: purchase.course_id }
    })

    let teacher = null
    if (course) {
      teacher = await this.teacherRepository.findOne({
        where: { id: course.teacher_id },
        relations: ['user']
      })
    }

    const order = await this.orderRepository.findOne({
      where: { id: purchase.order_id }
    })

    return {
      id: purchase.id,
      uuid: purchase.uuid,
      user_id: purchase.user_id,
      course_id: purchase.course_id,
      order_id: purchase.order_id,
      quantity_total: purchase.quantity_total,
      quantity_used: purchase.quantity_used,
      quantity_remaining: purchase.quantity_total - purchase.quantity_used,
      created_at: purchase.created_at,
      course: course && teacher ? {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        main_image: course.main_image,
        teacher: {
          id: teacher.id,
          user: {
            name: teacher.user.name || '',
            nick_name: teacher.user.nick_name
          }
        }
      } : {
        id: 0,
        uuid: '',
        name: '課程不存在',
        main_image: '',
        teacher: {
          id: 0,
          user: {
            name: '',
            nick_name: ''
          }
        }
      },
      order: order ? {
        id: order.id,
        uuid: order.uuid,
        total_amount: order.total_amount,
        paid_at: order.paid_at || new Date()
      } : {
        id: 0,
        uuid: '',
        total_amount: 0,
        paid_at: new Date()
      }
    }
  }

  /**
   * 使用購買堂數
   */
  async usePurchase(purchaseId: number, userId: number, quantity: number): Promise<PurchaseRecordWithDetails> {
    // 先檢查購買記錄是否存在（不限制用戶）
    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId }
    })

    if (!purchase) {
      throw new BusinessError(
        ERROR_CODES.PURCHASE_NOT_FOUND,
        MESSAGES.BUSINESS.PURCHASE_NOT_FOUND,
        404
      )
    }

    // 檢查是否為購買記錄的擁有者
    if (purchase.user_id !== userId) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ACCESS,
        MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
        403
      )
    }

    // 檢查剩餘數量
    if (purchase.quantity_used + quantity > purchase.quantity_total) {
      throw new BusinessError(
        ERROR_CODES.INSUFFICIENT_PURCHASE_QUANTITY,
        '使用數量超過剩餘數量',
        400
      )
    }

    // 更新使用數量
    await this.purchaseRepository.update(purchaseId, {
      quantity_used: purchase.quantity_used + quantity,
      updated_at: new Date()
    })

    // 取得更新後的資料
    const updatedPurchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId }
    })

    return await this.getPurchaseRecordWithDetails(updatedPurchase!)
  }

  /**
   * 取得購買統計資料
   */
  async getPurchaseSummary(userId: number): Promise<PurchaseSummary> {
    const purchases = await this.purchaseRepository.find({
      where: { user_id: userId }
    })

    const totalCourses = new Set(purchases.map(p => p.course_id)).size
    const totalAmountSpent = 0 // 這個需要從order表計算，暫時設為0
    const activePurchases = purchases.filter(p => 
      p.quantity_used < p.quantity_total
    ).length
    const totalSessionsRemaining = purchases.reduce((sum, p) => 
      sum + (p.quantity_total - p.quantity_used), 0
    )
    const totalQuantityPurchased = purchases.reduce((sum, p) => 
      sum + p.quantity_total, 0
    )
    const totalQuantityUsed = purchases.reduce((sum, p) => 
      sum + p.quantity_used, 0
    )

    return {
      total_courses: totalCourses,
      total_amount_spent: totalAmountSpent,
      active_purchases: activePurchases,
      total_sessions_remaining: totalSessionsRemaining,
      total_quantity_purchased: totalQuantityPurchased,
      total_quantity_used: totalQuantityUsed,
      total_quantity_remaining: totalSessionsRemaining // 與 total_sessions_remaining 相同
    }
  }
}

// 匯出服務實例
export const purchaseService = new PurchaseService()