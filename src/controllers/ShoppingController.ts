/**
 * Controller 層統一匯出
 * 
 * 集中管理所有控制器模組的匯出，方便路由層引用
 */

export { cartController } from './CartController'
export { orderController } from './OrderController'
export { purchaseController } from './PurchaseController'

// 類型也一併匯出以供路由使用
export type { CartController } from './CartController'
export type { OrderController } from './OrderController'  
export type { PurchaseController } from './PurchaseController'