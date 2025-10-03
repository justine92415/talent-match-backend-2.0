/**
 * 驗證中間件統一匯出
 * 
 * 重構後的驗證系統提供：
 * - 核心驗證工具 (core)
 * - 認證相關驗證 (auth)
 * - 使用者相關驗證 (user)
 * - 課程相關驗證 (course)
 * - 商務相關驗證 (commerce) - 明確匯出避免命名衝突
 * - 系統相關驗證 (system)
 */

// 核心驗證工具 - 優先匯出
export * from './core'

// 認證相關驗證
export * from './auth'

// 使用者相關驗證
export * from './user'

// 課程相關驗證
export * from './course'

// 商務相關驗證 - 只匯出 schemas
export {
  // 購物車相關 schemas
  addCartItemBodySchema,
  updateCartItemBodySchema,
  cartItemIdParamSchema,
  
  // 訂單相關 schemas
  createOrderBodySchema,
  getOrderListQuerySchema,
  orderIdParamSchema
} from './commerce'

// 系統相關驗證
export * from './system'