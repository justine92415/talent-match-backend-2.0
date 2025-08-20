/**
 * 購物車與訂單功能整合測試套件索引檔案
 * 匯出所有測試相關的 Helper 函式和工具
 */

// 測試 Helper 函式
export { CartTestHelpers } from './helpers/cartHelpers'
export { OrderTestHelpers } from './helpers/orderHelpers' 
export { PurchaseTestHelpers } from './helpers/purchaseHelpers'

// 測試 Fixtures
export * from './fixtures/cartItemFixtures'
export * from './fixtures/orderFixtures'
export * from './fixtures/paymentFixtures'

// 整合測試檔案會自動被 Jest 發現並執行：
// - ./integration/cart.test.ts
// - ./integration/order.test.ts  
// - ./integration/purchase.test.ts