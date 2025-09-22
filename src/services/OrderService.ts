/**
 * 訂單服務層
 * 處理訂單相關的業務邏輯和資料庫操作
 */

import { v4 as uuidv4 } from 'uuid'
import { Repository, In } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Order } from '@entities/Order'
import { OrderItem } from '@entities/OrderItem'
import { UserCartItem } from '@entities/UserCartItem'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { PaymentStatus, CourseStatus, PurchaseWay } from '@entities/enums'
import { BusinessError, ValidationError } from '@utils/errors'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import type { 
  OrderCreateRequest,
  OrderWithDetails,
  OrderItemWithDetails,
  OrderCreateResponse,
  OrderListItem,
  OrderPaginatedResponse
} from '../types'

export class OrderService {
  private orderRepository: Repository<Order>
  private orderItemRepository: Repository<OrderItem>
  private cartRepository: Repository<UserCartItem>
  private courseRepository: Repository<Course>
  private priceOptionRepository: Repository<CoursePriceOption>
  private teacherRepository: Repository<Teacher>
  private userRepository: Repository<User>

  constructor() {
    this.orderRepository = dataSource.getRepository(Order)
    this.orderItemRepository = dataSource.getRepository(OrderItem)
    this.cartRepository = dataSource.getRepository(UserCartItem)
    this.courseRepository = dataSource.getRepository(Course)
    this.priceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
  }

  /**
   * 建立訂單 - 從購物車建立
   */
  async createOrderFromCart(
    userId: number, 
    cartItemIds: number[],
    orderData: OrderCreateRequest
  ): Promise<OrderCreateResponse> {
    // 1. 驗證購物車項目
    const cartItems = await this.validateCartItems(userId, cartItemIds)
    
    // 2. 計算訂單總金額
    const totalAmount = await this.calculateOrderTotal(cartItems)
    
    // 3. 建立訂單
    const orderQueryRunner = dataSource.createQueryRunner()
    await orderQueryRunner.connect()
    await orderQueryRunner.startTransaction()

    try {
      // 建立主訂單
      const order = orderQueryRunner.manager.create(Order, {
        uuid: uuidv4(),
        buyer_id: userId,
        purchase_way: orderData.purchase_way,
        buyer_name: orderData.buyer_name,
        buyer_phone: orderData.buyer_phone,
        buyer_email: orderData.buyer_email,
        total_amount: totalAmount,
        payment_status: PaymentStatus.PENDING
      })
      const savedOrder = await orderQueryRunner.manager.save(order)

      // 建立訂單項目
      const orderItems: OrderItem[] = []
      for (const cartItem of cartItems) {
        const priceOption = await this.priceOptionRepository.findOne({
          where: { id: cartItem.price_option_id }
        })

        if (!priceOption) {
          throw new BusinessError(
            ERROR_CODES.PRICE_OPTION_NOT_FOUND,
            MESSAGES.BUSINESS.PRICE_OPTION_NOT_FOUND,
            404
          )
        }

        const orderItem = orderQueryRunner.manager.create(OrderItem, {
          uuid: uuidv4(),
          order_id: savedOrder.id,
          course_id: cartItem.course_id,
          price_option_id: cartItem.price_option_id,
          quantity: cartItem.quantity,
          unit_price: priceOption.price,
          total_price: priceOption.price * cartItem.quantity
        })
        orderItems.push(orderItem)
      }

      await orderQueryRunner.manager.save(OrderItem, orderItems)

      // 清除已下單的購物車項目
      await orderQueryRunner.manager.delete(UserCartItem, {
        id: In(cartItemIds),
        user_id: userId
      })

      await orderQueryRunner.commitTransaction()

      // 回傳完整訂單資料
      const orderWithDetails = await this.getOrderWithDetails(savedOrder.id, userId)
      const orderItemsWithDetails = await this.getOrderItemsWithDetails(savedOrder.id)

      return {
        order: orderWithDetails,
        order_items: orderItemsWithDetails
      }
    } catch (error) {
      await orderQueryRunner.rollbackTransaction()
      throw error
    } finally {
      await orderQueryRunner.release()
    }
  }

  /**
   * 取得訂單詳情
   */
  async getOrderWithDetails(orderId: number, userId: number): Promise<OrderWithDetails> {
    // 先檢查訂單是否存在
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

    // 再檢查是否屬於該用戶（權限檢查）
    if (order.buyer_id !== userId) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ORDER_ACCESS,
        MESSAGES.BUSINESS.UNAUTHORIZED_ORDER_ACCESS,
        403
      )
    }

    return {
      id: order.id,
      uuid: order.uuid,
      buyer_id: order.buyer_id,
      purchase_way: order.purchase_way,
      buyer_name: order.buyer_name,
      buyer_phone: order.buyer_phone,
      buyer_email: order.buyer_email,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      paid_at: order.paid_at,
      created_at: order.created_at,
      updated_at: order.updated_at
    }
  }

  /**
   * 取得用戶訂單列表
   */
  async getOrderList(
    userId: number,
    status?: PaymentStatus,
    page: number = 1,
    per_page: number = 10
  ): Promise<OrderPaginatedResponse> {
    // 首先獲得總數和訂單列表
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .where('order.buyer_id = :userId', { userId })

    if (status) {
      queryBuilder.andWhere('order.payment_status = :status', { status })
    }

    queryBuilder
      .orderBy('order.created_at', 'DESC')
      .skip((page - 1) * per_page)
      .take(per_page)

    const [orders, total] = await queryBuilder.getManyAndCount()

    if (orders.length === 0) {
      return {
        orders: [],
        pagination: {
          current_page: page,
          per_page,
          total,
          total_pages: Math.ceil(total / per_page)
        }
      }
    }

    // 批量查詢所有相關的 orderItems 
    const orderIds = orders.map(order => order.id)
    
    const orderItemsData = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .where('orderItem.order_id IN (:...orderIds)', { orderIds })
      .getMany()

    // 批量查詢相關的課程資料
    const courseIds = orderItemsData.map(item => item.course_id)
    const courses = courseIds.length > 0 ? await this.courseRepository
      .find({ where: { id: In(courseIds) } }) : []

    // 建立課程 Map 以加速查詢
    const courseMap = new Map(courses.map(course => [course.id, course]))

    // 將 orderItems 按 order_id 分組
    const orderItemsMap = new Map<number, any[]>()
    orderItemsData.forEach(item => {
      if (!orderItemsMap.has(item.order_id)) {
        orderItemsMap.set(item.order_id, [])
      }
      orderItemsMap.get(item.order_id)!.push(item)
    })

    const orderListItems: OrderListItem[] = orders.map(order => {
      const orderItems = orderItemsMap.get(order.id) || []
      
      // 建立課程摘要
      const coursesSummary = orderItems.map(item => {
        const course = courseMap.get(item.course_id)
        return {
          course_name: course?.name || '課程未找到',
          total_quantity: item.quantity
        }
      })

      return {
        id: order.id,
        uuid: order.uuid,
        purchase_way: order.purchase_way,
        buyer_name: order.buyer_name,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        paid_at: order.paid_at,
        created_at: order.created_at,
        items_count: orderItems.length,
        courses_summary: coursesSummary
      }
    })

    return {
      orders: orderListItems,
      pagination: {
        current_page: page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page)
      }
    }
  }

  /**
   * 取消訂單
   */
  async cancelOrder(orderId: number, userId: number): Promise<void> {
    // 先檢查訂單是否存在
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

    // 再檢查是否屬於該用戶（權限檢查）
    if (order.buyer_id !== userId) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ORDER_ACCESS,
        MESSAGES.BUSINESS.UNAUTHORIZED_ORDER_ACCESS,
        403
      )
    }

    // 檢查訂單狀態
    if (order.payment_status === PaymentStatus.CANCELLED) {
      throw new BusinessError(
        ERROR_CODES.ORDER_ALREADY_CANCELLED,
        MESSAGES.BUSINESS.ORDER_ALREADY_CANCELLED,
        400
      )
    }

    if (order.payment_status !== PaymentStatus.PENDING) {
      throw new BusinessError(
        ERROR_CODES.ORDER_STATUS_INVALID_FOR_CANCEL,
        MESSAGES.BUSINESS.ORDER_STATUS_INVALID_FOR_CANCEL,
        400
      )
    }

    await this.orderRepository.update(orderId, {
      payment_status: PaymentStatus.CANCELLED
    })
  }

  /**
   * 取得訂單項目詳情（公開方法）
   */
  async getOrderItemsDetails(orderId: number): Promise<OrderItemWithDetails[]> {
    return await this.getOrderItemsWithDetails(orderId)
  }

  /**
   * 驗證購物車項目
   */
  private async validateCartItems(userId: number, cartItemIds: number[]): Promise<UserCartItem[]> {
    if (!cartItemIds || cartItemIds.length === 0) {
      throw new BusinessError(
        ERROR_CODES.CART_ITEMS_REQUIRED,
        MESSAGES.BUSINESS.CART_EMPTY,
        400
      )
    }

    const cartItems = await this.cartRepository.find({
      where: { 
        id: In(cartItemIds),
        user_id: userId 
      }
    })

    if (cartItems.length !== cartItemIds.length) {
      throw new BusinessError(
        ERROR_CODES.CART_ITEM_NOT_FOUND,
        MESSAGES.BUSINESS.CART_ITEM_NOT_FOUND,
        404
      )
    }

    // 驗證每個項目的有效性
    for (const item of cartItems) {
      await this.validateCartItemValidity(item)
    }

    return cartItems
  }

  /**
   * 驗證單一購物車項目有效性
   */
  private async validateCartItemValidity(cartItem: UserCartItem): Promise<void> {
    // 檢查課程是否存在且已發布
    const course = await this.courseRepository.findOne({
      where: { id: cartItem.course_id }
    })

    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_NOT_FOUND,
        404
      )
    }

    // 檢查價格方案是否存在
    const priceOption = await this.priceOptionRepository.findOne({
      where: { 
        id: cartItem.price_option_id,
        course_id: cartItem.course_id 
      }
    })

    if (!priceOption) {
      throw new BusinessError(
        ERROR_CODES.PRICE_OPTION_NOT_FOUND,
        MESSAGES.BUSINESS.PRICE_OPTION_NOT_FOUND,
        404
      )
    }
  }

  /**
   * 計算訂單總金額
   */
  private async calculateOrderTotal(cartItems: UserCartItem[]): Promise<number> {
    if (cartItems.length === 0) {
      return 0
    }

    // 批量查詢所有價格選項
    const priceOptionIds = cartItems.map(item => item.price_option_id)
    const priceOptions = await this.priceOptionRepository
      .find({ where: { id: In(priceOptionIds) } })

    // 建立價格選項 Map 以加速查詢
    const priceOptionMap = new Map(priceOptions.map(option => [option.id, option]))

    let total = 0
    for (const item of cartItems) {
      const priceOption = priceOptionMap.get(item.price_option_id)
      if (priceOption) {
        total += priceOption.price * item.quantity
      }
    }

    return total
  }

  /**
   * 取得訂單項目詳細資訊
   */
  private async getOrderItemsWithDetails(orderId: number): Promise<OrderItemWithDetails[]> {
    // 先獲取訂單項目
    const orderItems = await this.orderItemRepository.find({
      where: { order_id: orderId }
    })

    if (orderItems.length === 0) {
      return []
    }

    const courseIds = orderItems.map(item => item.course_id)
    const priceOptionIds = orderItems.map(item => item.price_option_id)

    // 批量查詢課程和教師資料
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .getMany()

    // 獲取教師 IDs 並批量查詢教師和用戶資料
    const teacherIds = courses.map(course => course.teacher_id).filter(id => id)
    const teachers = teacherIds.length > 0 ? await this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .where('teacher.id IN (:...teacherIds)', { teacherIds })
      .getMany() : []

    // 批量查詢價格選項
    const priceOptions = await this.priceOptionRepository
      .find({ where: { id: In(priceOptionIds) } })

    // 建立索引 Map 以加速查詢
    const courseMap = new Map(courses.map(course => [course.id, course]))
    const teacherMap = new Map(teachers.map(teacher => [teacher.id, teacher]))
    const priceOptionMap = new Map(priceOptions.map(option => [option.id, option]))

    return orderItems.map(orderItem => {
      const course = courseMap.get(orderItem.course_id)
      const teacher = course ? teacherMap.get(course.teacher_id) : null
      const priceOption = priceOptionMap.get(orderItem.price_option_id)

      return {
        id: orderItem.id,
        uuid: orderItem.uuid,
        order_id: orderItem.order_id,
        course_id: orderItem.course_id,
        price_option_id: orderItem.price_option_id,
        quantity: orderItem.quantity,
        unit_price: orderItem.unit_price,
        total_price: orderItem.total_price,
        created_at: orderItem.created_at,
        updated_at: orderItem.updated_at,
        course: course ? {
          id: course.id,
          uuid: course.uuid,
          name: course.name,
          main_image: course.main_image || '',
          teacher: teacher ? {
            user: teacher.user ? {
              nick_name: teacher.user.nick_name || teacher.user.name || ''
            } : { nick_name: '' }
          } : { user: { nick_name: '' } }
        } : {
          id: 0,
          uuid: '',
          name: '課程未找到',
          main_image: '',
          teacher: { user: { nick_name: '' } }
        },
        price_option: priceOption ? {
          id: priceOption.id,
          uuid: priceOption.uuid,
          price: priceOption.price,
          quantity: priceOption.quantity
        } : {
          id: 0,
          uuid: '',
          price: 0,
          quantity: 0
        }
      }
    })
  }

  /**
   * 取得單一訂單項目詳細資訊
   */
  private async getOrderItemWithDetails(orderItem: OrderItem): Promise<OrderItemWithDetails> {
    const course = await this.courseRepository.findOne({
      where: { id: orderItem.course_id }
    })

    let teacher = null
    if (course) {
      teacher = await this.teacherRepository.findOne({
        where: { id: course.teacher_id },
        relations: ['user']
      })
    }

    const priceOption = await this.priceOptionRepository.findOne({
      where: { id: orderItem.price_option_id }
    })

    return {
      id: orderItem.id,
      uuid: orderItem.uuid,
      order_id: orderItem.order_id,
      course_id: orderItem.course_id,
      price_option_id: orderItem.price_option_id,
      quantity: orderItem.quantity,
      unit_price: orderItem.unit_price,
      total_price: orderItem.total_price,
      created_at: orderItem.created_at,
      updated_at: orderItem.updated_at,
      course: course && teacher ? {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        main_image: course.main_image,
        teacher: {
          user: {
            nick_name: teacher.user.nick_name
          }
        }
      } : {
        id: 0,
        uuid: '',
        name: '課程不存在',
        main_image: '',
        teacher: {
          user: {
            nick_name: ''
          }
        }
      },
      price_option: priceOption ? {
        id: priceOption.id,
        uuid: priceOption.uuid,
        price: priceOption.price,
        quantity: priceOption.quantity
      } : {
        id: 0,
        uuid: '',
        price: 0,
        quantity: 0
      }
    }
  }
}

// 匯出服務實例
export const orderService = new OrderService()