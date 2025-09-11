/**
 * 購買記錄路由
 * 
 * 提供購買記錄管理的 API 端點，包括：
 * - POST /api/purchases/from-order - 從訂單建立購買記錄
 * - GET /api/purchases - 取得使用者購買記錄列表
 * - GET /api/purchases/courses/:courseId - 取得特定課程的購買記錄
 * - POST /api/purchases/courses/:courseId/consume - 消耗課程使用次數
 * - GET /api/purchases/courses/:courseId/check - 檢查課程購買狀態
 * 
 * 所有端點都需要使用者身份認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { PurchaseController } from '@controllers/PurchaseController'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { 
  purchaseIdParamSchema,
  usePurchaseBodySchema 
} from '@middleware/schemas/commerce/purchaseSchemas'

const router = Router()
const purchaseController = new PurchaseController()

router.post('/from-order', authenticateToken, purchaseController.createPurchaseFromOrder)

router.get('/', authenticateToken, purchaseController.getUserPurchases)

router.get('/courses/:courseId', authenticateToken, purchaseController.getCoursePurchase)

router.post('/courses/:courseId/consume', authenticateToken, purchaseController.consumePurchase)

router.get('/courses/:courseId/check', authenticateToken, purchaseController.checkCoursePurchase)

router.post('/:id/use', authenticateToken, createSchemasMiddleware({ 
  params: purchaseIdParamSchema, 
  body: usePurchaseBodySchema 
}), purchaseController.usePurchase)

router.get('/summary', authenticateToken, purchaseController.getPurchaseSummary)

router.get('/:id', authenticateToken, purchaseController.getPurchaseById)

export default router