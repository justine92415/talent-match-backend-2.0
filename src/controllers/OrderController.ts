/**
 * 訂單控制器
 * 處理訂單相關的 HTTP 請求與回應
 */

import { Request, Response, NextFunction } from 'express'
import { orderService } from '@services/index'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import { OrderStatus, PaymentStatus } from '@entities/enums'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { ValidationError, BusinessError } from '@/utils/errors'

export class OrderController {
  /**
   * POST /orders - 從購物車建立訂單
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  createOrderFromCart = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { cart_item_ids, ...orderData } = req.body // 已由中間件驗證
    
    if (!cart_item_ids || !Array.isArray(cart_item_ids) || cart_item_ids.length === 0) {
      throw new ValidationError(
        ERROR_CODES.CART_ITEMS_REQUIRED, 
        '請選擇要結帳的購物車項目'
      )
    }

    // 呼叫服務層建立訂單
    const orderResult = await orderService.createOrderFromCart(userId, cart_item_ids, orderData)

    res.status(201).json(handleCreated(orderResult, MESSAGES.ORDER.CREATED))
  })

  /**
   * GET /orders/:orderId - 取得訂單詳情
   */
  getOrderDetails = handleErrorAsync(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId)
    const userId = req.user!.userId

    if (!orderId || orderId <= 0) {
      throw new ValidationError(
        ERROR_CODES.FIELD_INVALID_TYPE, 
        MESSAGES.VALIDATION.PAYMENT_ORDER_ID_INVALID
      )
    }

    // 呼叫服務層
    const order = await orderService.getOrderWithDetails(orderId, userId)
    const orderItems = await orderService.getOrderItemsDetails(orderId)

    res.status(200).json(handleSuccess({
      ...order,
      items: orderItems
    }, MESSAGES.ORDER.DETAIL_SUCCESS))
  })

  /**
   * GET /orders - 取得訂單列表
   * @description 已通過 validateRequest 中間件驗證的查詢參數
   */
  getOrderList = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { status, page = 1, limit: per_page = 10 } = req.query // 已由中間件驗證

    // 呼叫服務層
    const orderList = await orderService.getOrderList(
      userId, 
      status as OrderStatus | undefined, 
      Number(page), 
      Number(per_page)
    )

    res.status(200).json(handleSuccess({
      orders: orderList.orders
    }, MESSAGES.ORDER.LIST_SUCCESS))
  })

  /**
   * PUT /orders/:orderId/cancel - 取消訂單
   */
  cancelOrder = handleErrorAsync(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId)
    const userId = req.user!.userId

    if (!orderId || orderId <= 0) {
      throw new ValidationError(
        ERROR_CODES.FIELD_INVALID_TYPE, 
        MESSAGES.VALIDATION.PAYMENT_ORDER_ID_INVALID
      )
    }

    // 呼叫服務層
    await orderService.cancelOrder(orderId, userId)

    // 取得更新後的訂單狀態
    const updatedOrder = await orderService.getOrderWithDetails(orderId, userId)

    res.status(200).json(handleSuccess({
      id: updatedOrder.id,
      status: updatedOrder.status
    }, MESSAGES.ORDER.CANCELLED))
  })

  /**
   * POST /orders/:orderId/payment - 處理訂單付款
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  processPayment = handleErrorAsync(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId)
    const userId = req.user!.userId
    const { purchase_way, amount } = req.body // 已由中間件驗證

    if (!orderId || orderId <= 0) {
      throw new ValidationError(
        ERROR_CODES.FIELD_INVALID_TYPE, 
        MESSAGES.VALIDATION.PAYMENT_ORDER_ID_INVALID
      )
    }

    // 使用 PaymentService 建立付款連結
    const { paymentService } = await import('@services/PaymentService')
    
    // 先驗證訂單
    const order = await orderService.getOrderWithDetails(orderId, userId)
    
    if (order.payment_status !== PaymentStatus.PENDING) {
      throw new BusinessError(
        ERROR_CODES.FIELD_INVALID_TYPE,
        '訂單已付款或無效',
        400
      )
    }

    // 建立付款連結
    const paymentData = await paymentService.createPaymentUrl(orderId)

    res.status(200).json(handleSuccess({
      payment_url: paymentData.payment_url,
      form_data: paymentData.form_data,
      merchant_trade_no: paymentData.merchant_trade_no,
      total_amount: paymentData.total_amount,
      html_form: paymentData.html_form
    }, '付款連結建立成功'))
  })
}

// 匯出控制器實例
export const orderController = new OrderController()