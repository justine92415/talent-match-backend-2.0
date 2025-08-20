import { PurchaseWay, OrderStatus, PaymentStatus } from '@entities/enums'
import { OrderCreateRequest, PaymentCreateRequest } from '../../types'

/**
 * 訂單相關測試 Fixtures
 */

// 有效的訂單建立資料
export const validOrderData: OrderCreateRequest = {
  purchase_way: PurchaseWay.LINE_PAY,
  buyer_name: '王小明',
  buyer_phone: '0987654321',
  buyer_email: 'buyer@example.com'
}

// 不同付款方式的訂單資料
export const orderPaymentMethodVariations = {
  linePay: {
    ...validOrderData,
    purchase_way: PurchaseWay.LINE_PAY
  },
  creditCard: {
    ...validOrderData,
    purchase_way: PurchaseWay.CREDIT_CARD
  }
}

// 無效的訂單資料集合
export const invalidOrderData = {
  missingPurchaseWay: {
    buyer_name: '王小明',
    buyer_phone: '0987654321',
    buyer_email: 'buyer@example.com'
  },
  missingBuyerName: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_phone: '0987654321',
    buyer_email: 'buyer@example.com'
  },
  missingBuyerPhone: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '王小明',
    buyer_email: 'buyer@example.com'
  },
  missingBuyerEmail: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '王小明',
    buyer_phone: '0987654321'
  },
  invalidPurchaseWay: {
    purchase_way: 'invalid_method',
    buyer_name: '王小明',
    buyer_phone: '0987654321',
    buyer_email: 'buyer@example.com'
  },
  emptyBuyerName: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '',
    buyer_phone: '0987654321',
    buyer_email: 'buyer@example.com'
  },
  tooLongBuyerName: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: 'a'.repeat(101), // 超過100字元
    buyer_phone: '0987654321',
    buyer_email: 'buyer@example.com'
  },
  emptyBuyerPhone: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '王小明',
    buyer_phone: '',
    buyer_email: 'buyer@example.com'
  },
  invalidBuyerPhone: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '王小明',
    buyer_phone: 'invalid-phone',
    buyer_email: 'buyer@example.com'
  },
  emptyBuyerEmail: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '王小明',
    buyer_phone: '0987654321',
    buyer_email: ''
  },
  invalidBuyerEmail: {
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '王小明',
    buyer_phone: '0987654321',
    buyer_email: 'invalid-email'
  }
}

/**
 * 建立訂單實體資料
 */
export function createOrderEntityData(overrides: any = {}) {
  const { v4: uuidv4 } = require('uuid')
  
  return {
    uuid: uuidv4(),
    buyer_id: 1,
    status: OrderStatus.PENDING,
    purchase_way: PurchaseWay.LINE_PAY,
    buyer_name: '王小明',
    buyer_phone: '0987654321',
    buyer_email: 'buyer@example.com',
    total_amount: 1000.00,
    payment_status: PaymentStatus.PENDING,
    paid_at: null,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    ...overrides
  }
}

/**
 * 建立訂單項目實體資料
 */
export function createOrderItemEntityData(overrides: any = {}) {
  const { v4: uuidv4 } = require('uuid')
  
  return {
    uuid: uuidv4(),
    order_id: 1,
    course_id: 1,
    price_option_id: 1,
    quantity: 1,
    unit_price: 1000.00,
    total_price: 1000.00,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  }
}

/**
 * 不同狀態的訂單資料
 */
export const orderStatusVariations = {
  pending: createOrderEntityData({
    status: OrderStatus.PENDING,
    payment_status: PaymentStatus.PENDING,
    paid_at: null
  }),
  paid: createOrderEntityData({
    status: OrderStatus.PAID,
    payment_status: PaymentStatus.COMPLETED,
    paid_at: new Date()
  }),
  cancelled: createOrderEntityData({
    status: OrderStatus.CANCELLED,
    payment_status: PaymentStatus.PENDING,
    paid_at: null
  })
}

/**
 * 建立完整訂單與項目的測試資料
 */
export function createCompleteOrderData(itemCount: number = 2, buyerId: number = 1) {
  const orderId = Math.floor(Math.random() * 1000) + 1
  
  const order = createOrderEntityData({
    id: orderId,
    buyer_id: buyerId,
    total_amount: itemCount * 1000.00
  })

  const orderItems = Array.from({ length: itemCount }, (_, index) => 
    createOrderItemEntityData({
      order_id: orderId,
      course_id: index + 1,
      price_option_id: index + 1,
      unit_price: 1000.00,
      total_price: 1000.00
    })
  )

  return { order, orderItems }
}

/**
 * 多用戶的訂單場景資料
 */
export const multiUserOrderScenarios = {
  user1Orders: [
    createOrderEntityData({ buyer_id: 1, total_amount: 1000.00 }),
    createOrderEntityData({ buyer_id: 1, total_amount: 2000.00, status: OrderStatus.PAID })
  ],
  user2Orders: [
    createOrderEntityData({ buyer_id: 2, total_amount: 1500.00 }),
    createOrderEntityData({ buyer_id: 2, total_amount: 3000.00, status: OrderStatus.CANCELLED })
  ]
}