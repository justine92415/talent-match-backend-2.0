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

// Add item to cart
router.post('/items', authenticateToken, createSchemasMiddleware({ body: addCartItemBodySchema }), cartController.addItem)

// Get cart contents
router.get('/', authenticateToken, cartController.getCart)

// Update cart item
router.put('/items/:itemId', authenticateToken, createSchemasMiddleware({ 
  params: cartItemIdParamSchema, 
  body: updateCartItemBodySchema 
}), cartController.updateItem)

// Remove cart item
router.delete('/items/:itemId', authenticateToken, createSchemasMiddleware({ params: cartItemIdParamSchema }), cartController.removeItem)

// Clear cart
router.delete('/', authenticateToken, cartController.clearCart)

export default router