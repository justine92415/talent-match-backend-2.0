/**
 * 訂單測試 Helper 函式
 */

import { dataSource } from '@db/data-source'
import { Order } from '@entities/Order'
import { OrderItem } from '@entities/OrderItem'
import { PaymentStatus, PurchaseWay } from '@entities/enums'

/**
 * 訂單測試 Helper 函式
 */
export class OrderTestHelpers {
  /**
   * 建立測試用的訂單
   */
  static async createOrder(buyerId: number, overrides: any = {}) {
    const orderRepository = dataSource.getRepository(Order)
    const orderData = {
      uuid: require('uuid').v4(),
      buyer_id: buyerId,
      purchase_way: PurchaseWay.LINE_PAY,
      buyer_name: '測試購買者',
      buyer_phone: '0987654321',
      buyer_email: 'buyer@example.com',
      payment_status: PaymentStatus.PENDING,
      total_amount: 1000,
      ...overrides
    }
    
    const order = orderRepository.create(orderData)
    return await orderRepository.save(order)
  }

  /**
   * 建立測試用的訂單項目
   */
  static async createOrderItem(orderId: number, overrides: any = {}) {
    const orderItemRepository = dataSource.getRepository(OrderItem)
    const orderItemData = {
      uuid: require('uuid').v4(),
      order_id: orderId,
      course_id: 1,
      price_option_id: 1,
      quantity: 1,
      unit_price: 500,
      total_price: 500,
      ...overrides
    }
    
    const orderItem = orderItemRepository.create(orderItemData)
    return await orderItemRepository.save(orderItem)
  }

  /**
   * 建立完整的訂單（含項目）
   */
  static async createCompleteOrder(
    buyerId: number, 
    itemsData: any[] = [], 
    orderOverrides: any = {}
  ) {
    // 計算總金額
    const totalAmount = itemsData.reduce((sum, item) => sum + (item.total_price || 1000), 0)
    
    const order = await this.createOrder(buyerId, {
      total_amount: totalAmount || 1000,
      ...orderOverrides
    })

    const orderItems = []
    if (itemsData.length > 0) {
      for (const itemData of itemsData) {
        const item = await this.createOrderItem((order as any).id, itemData)
        orderItems.push(item)
      }
    }

    return { order, orderItems }
  }

  /**
   * 建立不同狀態的訂單集合
   */
  static async createOrderVariations(buyerId: number) {
    const pending = await this.createOrder(buyerId, {
      payment_status: PaymentStatus.PENDING
    })

    const paid = await this.createOrder(buyerId, {
      payment_status: PaymentStatus.COMPLETED,
      paid_at: new Date()
    })

    const cancelled = await this.createOrder(buyerId, {
      payment_status: PaymentStatus.CANCELLED
    })

    return { pending, paid, cancelled }
  }

  /**
   * 更新訂單狀態
   */
  static async updateOrderStatus(
    orderId: number, 
    paymentStatus: PaymentStatus, 
    paidAt?: Date
  ) {
    const orderRepository = dataSource.getRepository(Order)
    const updateData: any = { payment_status: paymentStatus }
    
    if (paidAt) updateData.paid_at = paidAt
    
    await orderRepository.update(orderId, updateData)
  }

  /**
   * 取得使用者的訂單列表
   */
  static async getUserOrders(buyerId: number) {
    const orderRepository = dataSource.getRepository(Order)
    return await orderRepository.find({
      where: { buyer_id: buyerId },
      order: { created_at: 'DESC' }
    })
  }

  /**
   * 清理訂單測試資料
   */
  static async cleanupOrderTestData() {
    const orderItemRepository = dataSource.getRepository(OrderItem)
    const orderRepository = dataSource.getRepository(Order)
    
    await orderItemRepository.delete({})
    await orderRepository.delete({})
  }
}