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
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { PaymentStatus, CourseStatus } from '@entities/enums'
import { BusinessError, ValidationError } from '@utils/errors'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import type { 
  PurchaseRecord,
  PurchaseRecordWithDetails,
  CoursePurchaseDetail,
  PurchasePaginatedResponse
} from '../types'

export class PurchaseService {
  private purchaseRepository: Repository<UserCoursePurchase>
  private orderRepository: Repository<Order>
  private orderItemRepository: Repository<OrderItem>
  private courseRepository: Repository<Course>
  private teacherRepository: Repository<Teacher>
  private userRepository: Repository<User>

  constructor() {
    this.purchaseRepository = dataSource.getRepository(UserCoursePurchase)
    this.orderRepository = dataSource.getRepository(Order)
    this.orderItemRepository = dataSource.getRepository(OrderItem)
    this.courseRepository = dataSource.getRepository(Course)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
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

    // 3. 建立購買記錄
    const purchases: PurchaseRecord[] = []
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      for (const orderItem of orderItems) {
        // 檢查是否已存在購買記錄
        const existingPurchase = await this.purchaseRepository.findOne({
          where: {
            user_id: order.buyer_id,
            course_id: orderItem.course_id,
            order_id: orderId
          }
        })

        if (!existingPurchase) {
          const purchase = queryRunner.manager.create(UserCoursePurchase, {
            uuid: uuidv4(),
            user_id: order.buyer_id,
            course_id: orderItem.course_id,
            order_id: orderId,
            quantity_total: orderItem.quantity,
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
   * 取得用戶購買記錄列表
   */
  async getUserPurchases(
    userId: number,
    page: number = 1,
    per_page: number = 10
  ): Promise<PurchasePaginatedResponse> {
    const queryBuilder = this.purchaseRepository
      .createQueryBuilder('purchase')
      .where('purchase.user_id = :userId', { userId })
      .orderBy('purchase.created_at', 'DESC')
      .skip((page - 1) * per_page)
      .take(per_page)

    const [purchases, total] = await queryBuilder.getManyAndCount()

    const purchasesWithDetails: PurchaseRecordWithDetails[] = []
    for (const purchase of purchases) {
      const purchaseWithDetails = await this.getPurchaseRecordWithDetails(purchase)
      purchasesWithDetails.push(purchaseWithDetails)
    }

    return {
      purchases: purchasesWithDetails,
      pagination: {
        current_page: page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page)
      }
    }
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
  async getPurchaseSummary(userId: number): Promise<any> {
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