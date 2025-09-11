/**
 * 訂單路由
 * 
 * 提供訂單管理的 API 端點，包括：
 * - POST /api/orders - 從購物車建立訂單
 * - GET /api/orders/:orderId - 取得訂單詳情
 * - GET /api/orders - 取得使用者訂單列表
 * - PUT /api/orders/:orderId/cancel - 取消訂單
 * 
 * 所有端點都需要使用者身份認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { OrderController } from '@controllers/OrderController'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { 
  createOrderBodySchema,
  getOrderListQuerySchema,
  orderIdParamSchema,
  processPaymentBodySchema 
} from '@middleware/schemas/commerce/orderSchemas'

const router = Router()
const orderController = new OrderController()

router.post('/', authenticateToken, createSchemasMiddleware({ body: createOrderBodySchema }), orderController.createOrderFromCart)

router.get('/:orderId', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.getOrderDetails)

router.get('/', authenticateToken, createSchemasMiddleware({ query: getOrderListQuerySchema }), orderController.getOrderList)

router.put('/:orderId/cancel', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.cancelOrder)

router.post('/:orderId/cancel', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.cancelOrder)

router.post('/:orderId/payment', authenticateToken, createSchemasMiddleware({ 
  params: orderIdParamSchema, 
  body: processPaymentBodySchema 
}), orderController.processPayment)

export default router