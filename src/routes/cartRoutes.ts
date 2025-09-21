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
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { 
  addCartItemBodySchema,
  updateCartItemBodySchema,
  cartItemIdParamSchema 
} from '@middleware/schemas/commerce/cartSchemas'

const router = Router()
const cartController = new CartController()

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags:
 *       - Cart
 *     summary: 加入商品到購物車
 *     description: |
 *       將課程及其價格方案加入購物車。
 *       
 *       **業務邏輯**：
 *       - 驗證課程存在且已發布
 *       - 驗證價格方案存在且屬於該課程
 *       - 檢查使用者不是該課程的教師
 *       - 如果購物車中已有相同的課程+價格方案組合，則增加數量
 *       - 否則新增購物車項目
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartItemRequest'
 *     responses:
 *       201:
 *         description: 課程已加入購物車 (新增項目)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddCartItemSuccessResponse'
 *       200:
 *         description: 購物車項目已更新 (增加數量)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateCartItemSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CartValidationErrorResponse'
 *                 - $ref: '#/components/schemas/CartBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "購物車請求參數驗證失敗"
 *                   errors:
 *                     course_id: ["課程 ID 必須是正整數"]
 *                     quantity: ["數量必須大於 0 且不超過 999"]
 *               business_error:
 *                 summary: 業務邏輯錯誤
 *                 value:
 *                   status: "error"
 *                   message: "課程不存在或未發布"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 不能購買自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartAccessForbiddenErrorResponse'
 *             example:
 *               status: "error"
 *               message: "不能購買自己的課程"
 *       404:
 *         description: 課程或價格方案不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Add item to cart
router.post('/items', authenticateToken, createSchemasMiddleware({ body: addCartItemBodySchema }), cartController.addItem)

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: 取得購物車內容
 *     description: |
 *       取得目前使用者的購物車內容，包含所有項目詳細資料和摘要統計。
 *       
 *       **業務邏輯**：
 *       - 查詢使用者的所有購物車項目
 *       - 載入每個項目的課程和價格方案詳細資料
 *       - 檢查項目有效性（課程是否存在且已發布、價格方案是否存在）
 *       - 計算購物車摘要統計（總數量、總金額、有效/無效項目數）
 *       - 僅有效項目計入總金額
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 取得購物車內容成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCartSuccessResponse'
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
// Get cart contents
router.get('/', authenticateToken, cartController.getCart)

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   put:
 *     tags:
 *       - Cart
 *     summary: 更新購物車項目
 *     description: |
 *       更新購物車中指定項目的數量。
 *       
 *       **業務邏輯**：
 *       - 驗證購物車項目存在且屬於該使用者
 *       - 更新項目數量
 *       - 回傳更新後的項目詳細資料
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: 購物車項目 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartItemRequest'
 *     responses:
 *       200:
 *         description: 購物車項目已更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateCartItemSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartValidationErrorResponse'
 *             example:
 *               status: "error"
 *               message: "購物車請求參數驗證失敗"
 *               errors:
 *                 quantity: ["數量必須大於 0 且不超過 999"]
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 無權存取此購物車項目
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartAccessForbiddenErrorResponse'
 *       404:
 *         description: 購物車項目不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Update cart item
router.put('/items/:itemId', authenticateToken, createSchemasMiddleware({ 
  params: cartItemIdParamSchema, 
  body: updateCartItemBodySchema 
}), cartController.updateItem)

/**
 * @swagger
 * /api/cart/items/{itemId}:
 *   delete:
 *     tags:
 *       - Cart
 *     summary: 移除購物車項目
 *     description: |
 *       從購物車中移除指定項目。
 *       
 *       **業務邏輯**：
 *       - 驗證購物車項目存在且屬於該使用者
 *       - 從購物車中刪除該項目
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: itemId
 *         in: path
 *         required: true
 *         description: 購物車項目 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 商品已從購物車移除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RemoveCartItemSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartValidationErrorResponse'
 *             example:
 *               status: "error"
 *               message: "購物車請求參數驗證失敗"
 *               errors:
 *                 itemId: ["購物車項目 ID 必須是正整數"]
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 無權存取此購物車項目
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartAccessForbiddenErrorResponse'
 *       404:
 *         description: 購物車項目不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartItemNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Remove cart item
router.delete('/items/:itemId', authenticateToken, createSchemasMiddleware({ params: cartItemIdParamSchema }), cartController.removeItem)

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags:
 *       - Cart
 *     summary: 清空購物車
 *     description: |
 *       清空目前使用者的整個購物車，移除所有項目。
 *       
 *       **業務邏輯**：
 *       - 刪除使用者購物車中的所有項目
 *       - 此操作無法復原
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 購物車已清空
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClearCartSuccessResponse'
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
// Clear cart
router.delete('/', authenticateToken, cartController.clearCart)

export default router