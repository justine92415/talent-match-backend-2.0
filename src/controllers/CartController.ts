/**
 * 購物車控制器
 * 處理購物車相關的 HTTP 請求與回應
 */

import { Request, Response } from 'express'
import { cartService } from '@services/index'
import { MESSAGES } from '@constants/index'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'

export class CartController {
  /**
   * POST /cart/items - 加入購物車項目
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  addItem = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId  // 已認證的使用者 (由 authenticateToken 中間件提供)
    const validatedData = req.body   // 已驗證的資料 (由 validateRequest 中間件驗證)

    // 呼叫服務層
    const result = await cartService.addItem(userId, validatedData)

    // 根據是否為更新操作決定狀態碼和訊息
    if (result.isUpdate) {
      res.status(200).json(handleSuccess(result.item, MESSAGES.CART.ITEM_UPDATED))
    } else {
      res.status(201).json(handleCreated(result.item, MESSAGES.CART.ITEM_ADDED))
    }
  })

  /**
   * GET /cart - 取得購物車內容
   */
  getCart = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId

    // 取得購物車內容
    const cart = await cartService.getCart(userId)

    res.status(200).json(handleSuccess({
      items: cart.cart_items,
      summary: cart.summary
    }, MESSAGES.CART.LIST_SUCCESS))
  })

  /**
   * PUT /cart/items/:itemId - 更新購物車項目
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  updateItem = handleErrorAsync(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.itemId)  // 路由參數，已通過驗證中間件
    const userId = req.user!.userId
    const validatedData = req.body  // 已驗證的資料 (由 validateRequest 中間件驗證)

    // 呼叫服務層
    const cartItem = await cartService.updateItem(itemId, validatedData, userId)

    res.status(200).json(handleSuccess(cartItem, MESSAGES.CART.ITEM_UPDATED))
  })

  /**
   * DELETE /cart/items/:itemId - 刪除購物車項目
   */
  removeItem = handleErrorAsync(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.itemId)  // 路由參數，已通過驗證中間件
    const userId = req.user!.userId

    // 呼叫服務層
    await cartService.removeItem(itemId, userId)

    res.status(200).json(handleSuccess(null, MESSAGES.CART.ITEM_REMOVED))
  })

  /**
   * DELETE /cart - 清空購物車
   */
  clearCart = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId

    // 呼叫服務層
    await cartService.clearCart(userId)

    res.status(200).json(handleSuccess(null, MESSAGES.CART.CLEARED))
  })
}

// 匯出控制器實例
export const cartController = new CartController()