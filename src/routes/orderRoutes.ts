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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: 訂單管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateOrderRequest:
 *       type: object
 *       properties:
 *         payment_method:
 *           type: string
 *           enum: [credit_card, bank_transfer, cash]
 *           description: 支付方式（選填，預設為credit_card）
 *           example: credit_card
 *         note:
 *           type: string
 *           maxLength: 500
 *           description: 訂單備註（選填）
 *           example: 請盡快安排課程
 * 
 *     OrderItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 訂單項目 ID
 *         course_id:
 *           type: integer
 *           description: 課程 ID
 *         price_option_id:
 *           type: integer
 *           description: 價格方案 ID
 *         quantity:
 *           type: integer
 *           description: 數量
 *         unit_price:
 *           type: number
 *           description: 單價
 *         total_price:
 *           type: number
 *           description: 總價
 *         course:
 *           type: object
 *           description: 課程資訊
 *           properties:
 *             id:
 *               type: integer
 *             uuid:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             main_image:
 *               type: string
 *               nullable: true
 *         price_option:
 *           type: object
 *           description: 價格方案資訊
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             price:
 *               type: number
 *             duration_days:
 *               type: integer
 *               nullable: true
 *             session_count:
 *               type: integer
 *               nullable: true
 * 
 *     OrderResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 訂單 ID
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: 訂單 UUID
 *         user_id:
 *           type: integer
 *           description: 使用者 ID
 *         order_number:
 *           type: string
 *           description: 訂單編號
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           description: 訂單狀態
 *         payment_method:
 *           type: string
 *           enum: [credit_card, bank_transfer, cash]
 *           description: 支付方式
 *         total_amount:
 *           type: number
 *           description: 訂單總金額
 *         note:
 *           type: string
 *           nullable: true
 *           description: 訂單備註
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItemResponse'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 * 
 *     OrderListItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 訂單 ID
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: 訂單 UUID
 *         order_number:
 *           type: string
 *           description: 訂單編號
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           description: 訂單狀態
 *         payment_method:
 *           type: string
 *           enum: [credit_card, bank_transfer, cash]
 *           description: 支付方式
 *         total_amount:
 *           type: number
 *           description: 訂單總金額
 *         item_count:
 *           type: integer
 *           description: 商品項目數量
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: 從購物車建立訂單
 *     description: 將使用者購物車中的所有商品建立為新訂單，購物車會被清空
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: 請求參數驗證失敗或購物車為空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 購物車為空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, createSchemasMiddleware({ body: createOrderBodySchema }), orderController.createOrderFromCart)

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: 取得訂單詳情
 *     description: 取得指定訂單的完整資訊，包含所有商品項目詳情
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 訂單 ID
 *     responses:
 *       200:
 *         description: 成功取得訂單詳情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 訂單不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:orderId', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.getOrderDetails)

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: 取得使用者訂單列表
 *     description: 取得當前使用者的所有訂單列表，支援分頁和狀態篩選
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁數
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: 訂單狀態篩選
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [created_at, total_amount, status]
 *           default: created_at
 *         description: 排序欄位
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方式
 *     responses:
 *       200:
 *         description: 成功取得訂單列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderListItemResponse'
 *                     total:
 *                       type: integer
 *                       description: 總訂單數量
 *                     page:
 *                       type: integer
 *                       description: 當前頁數
 *                     limit:
 *                       type: integer
 *                       description: 每頁筆數
 *                     total_pages:
 *                       type: integer
 *                       description: 總頁數
 *       400:
 *         description: 查詢參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, createSchemasMiddleware({ query: getOrderListQuerySchema }), orderController.getOrderList)

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: 取消訂單
 *     description: 取消指定的訂單，只有處於待確認狀態的訂單可以被取消
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 訂單 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: 取消原因（選填）
 *                 example: 臨時有事無法參加
 *     responses:
 *       200:
 *         description: 訂單取消成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: 訂單狀態不允許取消
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 訂單不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:orderId/cancel', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.cancelOrder)

/**
 * @swagger
 * /api/orders/{orderId}/cancel:
 *   post:
 *     tags: [Orders]
 *     summary: 取消訂單 (POST方法)
 *     description: 取消指定的訂單，只有處於待確認狀態的訂單可以被取消
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 訂單 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: 取消原因（選填）
 *                 example: 臨時有事無法參加
 *     responses:
 *       200:
 *         description: 訂單取消成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/OrderResponse'
 *       400:
 *         description: 訂單狀態不允許取消
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 訂單不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:orderId/cancel', authenticateToken, createSchemasMiddleware({ params: orderIdParamSchema }), orderController.cancelOrder)

/**
 * @swagger
 * /api/orders/{orderId}/payment:
 *   post:
 *     tags: [Orders]
 *     summary: 處理訂單付款
 *     description: 處理指定訂單的付款流程
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 訂單 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - purchase_way
 *               - amount
 *             properties:
 *               purchase_way:
 *                 type: string
 *                 enum: [line_pay, credit_card, bank_transfer]
 *                 description: 付款方式
 *                 example: line_pay
 *               amount:
 *                 type: number
 *                 description: 付款金額
 *                 example: 1000
 *     responses:
 *       200:
 *         description: 付款處理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 付款處理成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/OrderResponse'
 *                     payment_info:
 *                       type: object
 *                       description: 付款資訊
 *       400:
 *         description: 付款參數錯誤或訂單狀態不允許付款
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 訂單不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:orderId/payment', authenticateToken, createSchemasMiddleware({ 
  params: orderIdParamSchema, 
  body: processPaymentBodySchema 
}), orderController.processPayment)

export default router