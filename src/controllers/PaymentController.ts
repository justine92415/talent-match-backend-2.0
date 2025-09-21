/**
 * 付款控制器
 * 處理付款相關的 HTTP 請求與回應
 */

import { Request, Response } from 'express'
import { paymentService } from '@services/PaymentService'
import { orderService } from '@services/index'
import { PaymentStatus } from '@entities/enums'
import { handleErrorAsync, handleSuccess } from '@utils/index'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES, MESSAGES } from '@constants/index'

export class PaymentController {
  /**
   * POST /orders/:orderId/payment - 建立付款連結
   */
  createPayment = handleErrorAsync(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId)
    const userId = req.user!.userId

    if (!orderId || orderId <= 0) {
      throw new BusinessError(
        ERROR_CODES.FIELD_INVALID_TYPE,
        '訂單 ID 格式錯誤',
        400
      )
    }

    // 驗證訂單屬於該使用者
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
      html_form: paymentData.html_form  // 新增：官方 SDK 生成的 HTML 表單
    }, '付款連結建立成功'))
  })

  /**
   * POST /payments/ecpay/callback - 綠界付款回調 (無需認證)
   */
  handleEcpayCallback = handleErrorAsync(async (req: Request, res: Response) => {
    console.log('收到綠界付款回調:', req.body)

    try {
      await paymentService.handlePaymentCallback(req.body)
      
      // 綠界要求回應 "1|OK" 表示處理成功
      res.status(200).send('1|OK')
    } catch (error) {
      console.error('處理綠界回調時發生錯誤:', error)
      
      // 即使處理失敗，也要回應 OK 避免綠界重複發送
      res.status(200).send('1|OK')
    }
  })

  /**
   * GET /orders/:orderId/payment/status - 查詢付款狀態
   */
  getPaymentStatus = handleErrorAsync(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId)
    const userId = req.user!.userId

    if (!orderId || orderId <= 0) {
      throw new BusinessError(
        ERROR_CODES.FIELD_INVALID_TYPE,
        '訂單 ID 格式錯誤',
        400
      )
    }

    const paymentStatus = await paymentService.getPaymentStatus(orderId, userId)

    res.status(200).json(handleSuccess(paymentStatus, '付款狀態查詢成功'))
  })

  /**
   * GET /payments/ecpay/return - 綠界付款返回處理 (無需認證)
   */
  handleEcpayReturn = handleErrorAsync(async (req: Request, res: Response) => {
    console.log('綠界付款返回:', req.query)

    const merchantTradeNo = req.query.MerchantTradeNo as string
    const rtnCode = req.query.RtnCode as string

    // 根據返回結果重導向到前端頁面
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    
    if (rtnCode === '1') {
      // 付款成功
      res.redirect(`${frontendUrl}/payment/success?orderNo=${merchantTradeNo}`)
    } else {
      // 付款失敗或取消
      res.redirect(`${frontendUrl}/payment/failed?orderNo=${merchantTradeNo}&error=${req.query.RtnMsg || '付款失敗'}`)
    }
  })

  /**
   * POST /orders/:orderId/payment/check - 手動檢查付款狀態 (開發階段用)
   */
  checkPaymentManually = handleErrorAsync(async (req: Request, res: Response) => {
    const orderId = parseInt(req.params.orderId)
    const userId = req.user!.userId

    if (!orderId || orderId <= 0) {
      throw new BusinessError(
        ERROR_CODES.FIELD_INVALID_TYPE,
        '訂單 ID 格式錯誤',
        400
      )
    }

    // 這個方法在開發階段可以用來手動檢查付款狀態
    // 實際上綠界會自動回調，這裡主要用於測試
    const paymentStatus = await paymentService.getPaymentStatus(orderId, userId)

    res.status(200).json(handleSuccess({
      message: '這是手動檢查功能，實際付款狀態以綠界回調為準',
      ...paymentStatus
    }, '手動檢查完成'))
  })
}

// 匯出控制器實例
export const paymentController = new PaymentController()