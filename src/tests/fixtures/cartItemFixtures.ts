import { PurchaseWay, OrderStatus, PaymentStatus } from '@entities/enums'
import { 
  CartItemCreateRequest, 
  CartItemUpdateRequest,
  OrderCreateRequest,
  PaymentCreateRequest
} from '../../types'

/**
 * 購物車相關測試 Fixtures
 */

// 有效的購物車項目資料
export const validCartItemData: CartItemCreateRequest = {
  course_id: 1,
  price_option_id: 1,
  quantity: 1
}

// 購物車項目更新資料
export const validCartItemUpdateData: CartItemUpdateRequest = {
  quantity: 2
}

// 無效的購物車項目資料集合
export const invalidCartItemData = {
  missingCourseId: {
    price_option_id: 1,
    quantity: 1
  },
  missingPriceOptionId: {
    course_id: 1,
    quantity: 1
  },
  missingQuantity: {
    course_id: 1,
    price_option_id: 1
  },
  invalidCourseId: {
    course_id: 'invalid',
    price_option_id: 1,
    quantity: 1
  },
  invalidPriceOptionId: {
    course_id: 1,
    price_option_id: 'invalid',
    quantity: 1
  },
  invalidQuantity: {
    course_id: 1,
    price_option_id: 1,
    quantity: 'invalid'
  },
  negativeQuantity: {
    course_id: 1,
    price_option_id: 1,
    quantity: -1
  },
  zeroQuantity: {
    course_id: 1,
    price_option_id: 1,
    quantity: 0
  },
  tooHighQuantity: {
    course_id: 1,
    price_option_id: 1,
    quantity: 100
  }
}

// 不同數量的購物車項目資料
export const cartItemQuantityVariations = {
  single: { ...validCartItemData, quantity: 1 },
  double: { ...validCartItemData, quantity: 2 },
  multiple: { ...validCartItemData, quantity: 5 },
  maximum: { ...validCartItemData, quantity: 99 }
}

/**
 * 建立購物車項目實體資料
 */
export function createCartItemEntityData(overrides: any = {}) {
  const { v4: uuidv4 } = require('uuid')
  
  return {
    uuid: uuidv4(),
    user_id: 1,
    course_id: 1,
    price_option_id: 1,
    quantity: 1,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  }
}

/**
 * 建立多個購物車項目的測試資料
 */
export function createMultipleCartItemsData(count: number, userId: number = 1) {
  return Array.from({ length: count }, (_, index) => 
    createCartItemEntityData({
      user_id: userId,
      course_id: index + 1,
      price_option_id: index + 1,
      quantity: 1
    })
  )
}

/**
 * 建立不同課程同方案的購物車項目（用於測試重複加入）
 */
export const duplicateCartItemScenarios = {
  sameCourseAndOption: [
    createCartItemEntityData({ course_id: 1, price_option_id: 1 }),
    createCartItemEntityData({ course_id: 1, price_option_id: 1 }) // 重複
  ],
  sameCoursesDifferentOptions: [
    createCartItemEntityData({ course_id: 1, price_option_id: 1 }),
    createCartItemEntityData({ course_id: 1, price_option_id: 2 }) // 同課程不同方案
  ]
}