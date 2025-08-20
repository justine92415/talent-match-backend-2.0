import { PaymentStatus, OrderStatus } from '@entities/enums'
import { PaymentCreateRequest } from '../../types'

/**
 * 付款相關測試 Fixtures
 */

// 有效的付款請求資料
export const validPaymentData: PaymentCreateRequest = {
  order_id: 1
}

// 無效的付款資料集合
export const invalidPaymentData = {
  missingOrderId: {},
  invalidOrderId: {
    order_id: 'invalid'
  },
  negativeOrderId: {
    order_id: -1
  },
  zeroOrderId: {
    order_id: 0
  }
}

/**
 * 建立購買記錄實體資料
 */
export function createPurchaseEntityData(overrides: any = {}) {
  const { v4: uuidv4 } = require('uuid')
  
  return {
    uuid: uuidv4(),
    user_id: 1,
    course_id: 1,
    order_id: 1,
    quantity_total: 5,
    quantity_used: 0,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  }
}

/**
 * 不同使用狀態的購買記錄
 */
export const purchaseUsageVariations = {
  unused: createPurchaseEntityData({
    quantity_total: 10,
    quantity_used: 0
  }),
  partiallyUsed: createPurchaseEntityData({
    quantity_total: 10,
    quantity_used: 3
  }),
  fullyUsed: createPurchaseEntityData({
    quantity_total: 10,
    quantity_used: 10
  }),
  overused: createPurchaseEntityData({
    quantity_total: 10,
    quantity_used: 12 // 測試異常情況
  })
}

/**
 * 建立多個購買記錄的測試資料
 */
export function createMultiplePurchasesData(count: number, userId: number = 1) {
  return Array.from({ length: count }, (_, index) => 
    createPurchaseEntityData({
      user_id: userId,
      course_id: index + 1,
      order_id: index + 1,
      quantity_total: (index + 1) * 5,
      quantity_used: index
    })
  )
}

/**
 * 同課程多次購買的測試場景
 */
export const sameCourseMultiplePurchases = {
  firstPurchase: createPurchaseEntityData({
    course_id: 1,
    order_id: 1,
    quantity_total: 5,
    quantity_used: 5, // 已用完
    created_at: new Date('2024-01-01')
  }),
  secondPurchase: createPurchaseEntityData({
    course_id: 1,
    order_id: 2,
    quantity_total: 10,
    quantity_used: 2, // 還有8堂
    created_at: new Date('2024-02-01')
  })
}

/**
 * 課程使用歷史測試資料
 */
export const courseUsageHistory = [
  {
    reservation_id: 1,
    reserved_at: new Date('2024-01-15T10:00:00Z'),
    status: 'completed'
  },
  {
    reservation_id: 2,
    reserved_at: new Date('2024-01-20T14:00:00Z'),
    status: 'completed'
  },
  {
    reservation_id: 3,
    reserved_at: new Date('2024-01-25T16:00:00Z'),
    status: 'completed'
  }
]

/**
 * 付款處理結果的測試資料
 */
export const paymentResultVariations = {
  successful: {
    order_id: 1,
    payment_status: PaymentStatus.COMPLETED,
    paid_at: new Date()
  },
  failed: {
    order_id: 1,
    payment_status: PaymentStatus.FAILED,
    paid_at: null
  },
  processing: {
    order_id: 1,
    payment_status: PaymentStatus.PROCESSING,
    paid_at: null
  }
}

/**
 * 建立完整的購買流程測試資料
 */
export function createCompletePurchaseFlowData(userId: number = 1) {
  const { v4: uuidv4 } = require('uuid')
  const orderId = Math.floor(Math.random() * 1000) + 1
  
  // 訂單資料
  const order = {
    id: orderId,
    uuid: uuidv4(),
    buyer_id: userId,
    status: OrderStatus.PENDING,
    total_amount: 2800.00,
    payment_status: PaymentStatus.PENDING
  }

  // 訂單項目（兩個不同方案）
  const orderItems = [
    {
      order_id: orderId,
      course_id: 1,
      price_option_id: 1,
      quantity: 1,
      unit_price: 1000.00,
      total_price: 1000.00
    },
    {
      order_id: orderId,
      course_id: 1,
      price_option_id: 2,
      quantity: 1,
      unit_price: 1800.00,
      total_price: 1800.00
    }
  ]

  // 合併後的購買記錄
  const purchase = {
    user_id: userId,
    course_id: 1,
    order_id: orderId,
    quantity_total: 15, // 5 + 10 堂合併
    quantity_used: 0
  }

  return { order, orderItems, purchase }
}