/**
 * 購物車路由
 * 
 * 提供購物車管理的 API 端點，包括：
 * - POST /api/cart/items - 加入商品到購物車
 * - GET /api/cart - 取得購物車內容
 * - PUT /api/cart/items/:itemId - 更新購物車商品
 * - DELETE /api/cart/items/:itemId - 移除購物車商品
 * - DELETE /api/cart - 清空購物車
 * 
 * 所有端點都需要使用者身份認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { CartController } from '@controllers/CartController'
import { 
  validateAddCartItem,
  validateUpdateCartItem,
  validateCartItemId 
} from '@middleware/validation'

const router = Router()
const cartController = new CartController()

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: 購物車管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddItemToCartRequest:
 *       type: object
 *       required:
 *         - course_id
 *         - price_option_id
 *       properties:
 *         course_id:
 *           type: integer
 *           description: 課程 ID
 *           example: 1
 *         price_option_id:
 *           type: integer
 *           description: 價格方案 ID
 *           example: 1
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 1
 *           description: 數量（選填，預設為1）
 *           example: 2
 * 
 *     UpdateCartItemRequest:
 *       type: object
 *       properties:
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: 更新後的數量
 *           example: 3
 *         price_option_id:
 *           type: integer
 *           description: 更新後的價格方案 ID
 *           example: 2
 * 
 *     CartItemResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 購物車項目 ID
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
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     CartResponse:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItemResponse'
 *         total_quantity:
 *           type: integer
 *           description: 商品總數量
 *         total_amount:
 *           type: number
 *           description: 購物車總金額
 *         item_count:
 *           type: integer
 *           description: 不同商品項目數量
 */

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: 加入商品到購物車
 *     description: 將課程商品加入使用者的購物車，如果已存在相同課程和價格方案會增加數量
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddItemToCartRequest'
 *     responses:
 *       201:
 *         description: 商品成功加入購物車
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CartItemResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 課程或價格方案不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 課程狀態不允許購買
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
router.post('/items', authenticateToken, validateAddCartItem, cartController.addItem)

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: 取得購物車內容
 *     description: 取得當前使用者的購物車所有商品和統計資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得購物車內容
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CartResponse'
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
router.get('/', authenticateToken, cartController.getCart)

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: 更新購物車商品
 *     description: 更新購物車中指定商品的數量或價格方案
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 購物車項目 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *     responses:
 *       200:
 *         description: 商品更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CartItemResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 購物車項目或價格方案不存在
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
router.put('/items/:itemId', authenticateToken, validateUpdateCartItem, cartController.updateItem)

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: 移除購物車商品
 *     description: 從購物車中移除指定的商品項目
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 購物車項目 ID
 *     responses:
 *       200:
 *         description: 商品移除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 商品已從購物車中移除
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 購物車項目不存在
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
router.delete('/items/:itemId', authenticateToken, validateCartItemId, cartController.removeItem)

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: 清空購物車
 *     description: 移除購物車中的所有商品項目
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 購物車清空成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 購物車已清空
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
router.delete('/', authenticateToken, cartController.clearCart)

export default router