/**
 * 訂單路由
 * 
 * 提供訂單管理的 API 端點，包括：
 * - POST /api/orders - 從購物車建立訂單
 * - GET /api/orders/:orderId - 取得訂單詳情
 * - GET /api/orders - 取得使用者訂單列表
 * - POST /api/orders/:orderId/cancel - 取消訂單
 * - POST /api/orders/:orderId/payment - 處理付款
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
  orderIdParamSchema
} from '@middleware/schemas/commerce/orderSchemas'

const router = Router()
const orderController = new OrderController()

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: 從購物車建立訂單
 *     description: |
 *       從用戶的購物車項目建立新訂單，成功後將清空指定的購物車項目。
 *       
 *       **業務邏輯**：
 *       - 驗證請求參數（購物車項目、付款方式、購買者資訊）
 *       - 檢查購物車項目是否存在且屬於該用戶
 *       - 計算訂單總金額
 *       - 建立訂單記錄（狀態為 pending）
 *       - 建立訂單項目記錄
 *       - 清空指定的購物車項目
 *       - 回傳完整訂單資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: 訂單建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateOrderSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/OrderValidationErrorResponse'
 *                 - $ref: '#/components/schemas/OrderBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "訂單參數驗證失敗"
 *                   errors:
 *                     cart_item_ids: ["請選擇要結帳的購物車項目"]
 *                     buyer_phone: ["手機號碼格式不正確"]
 *               business_error:
 *                 summary: 業務邏輯錯誤
 *                 value:
 *                   status: "error"
 *                   message: "購物車項目不存在或已被移除"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/', authenticateToken, createSchemasMiddleware({ body: createOrderBodySchema }), orderController.createOrderFromCart)

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: 取得訂單詳情
 *     description: |
 *       取得指定訂單的詳細資料，包含訂單項目清單。
 *       
 *       **業務邏輯**：
 *       - 驗證訂單ID格式（必須是正整數）
 *       - 檢查訂單是否存在
 *       - 驗證訂單所有權（只能查看自己的訂單）
 *       - 取得訂單基本資料
 *       - 取得訂單項目詳情
 *       - 回傳完整訂單資料
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         description: 訂單ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 取得訂單詳情成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderDetailSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderValidationErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 訂單不存在或無權限存取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrderBusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/:orderId', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.getOrderDetails)

router.get('/', authenticateToken, createSchemasMiddleware({ query: getOrderListQuerySchema }), orderController.getOrderList)

router.post('/:orderId/cancel', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.cancelOrder)

router.post('/:orderId/payment', authenticateToken, createSchemasMiddleware({ 
  params: orderIdParamSchema
}), orderController.processPayment)

export default router