/**
 * 付款服務
 * 使用綠界官方 SDK 處理付款相關的業務邏輯
 */

import { Repository } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Order } from '@entities/Order'
import { PaymentStatus } from '@entities/enums'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES, MESSAGES } from '@constants/index'

// 綠界官方 SDK
const ecpay_payment = require('ecpay_aio_nodejs')

export interface PaymentUrlResponse {
  payment_url: string
  form_data: Record<string, string>
  merchant_trade_no: string
  total_amount: number
  html_form?: string  // 官方 SDK 生成的 HTML 表單
}

export interface EcpayCallbackData {
  MerchantID: string
  MerchantTradeNo: string
  StoreID?: string
  RtnCode: string
  RtnMsg: string
  TradeNo: string
  TradeAmt: string
  PaymentDate: string
  PaymentType: string
  PaymentTypeChargeFee: string
  TradeDate: string
  SimulatePaid: string
  CheckMacValue: string
  // ATM 相關欄位
  BankCode?: string
  vAccount?: string
  ExpireDate?: string
  // 其他可能的欄位
  [key: string]: any
}

export class PaymentService {
  private orderRepository: Repository<Order>
  private ecpay: any

  constructor() {
    this.orderRepository = dataSource.getRepository(Order)
    
    // 初始化綠界 SDK - 強制使用測試環境
    this.ecpay = new ecpay_payment({
      OperationMode: 'Test', // 強制使用測試環境
      MercProfile: {
        MerchantID: process.env.ECPAY_MERCHANT_ID || '2000132',
        HashKey: process.env.ECPAY_HASH_KEY || '5294y06JbISpM5x9',
        HashIV: process.env.ECPAY_HASH_IV || 'v77hoKGq4kWxNNIS'
      },
      IgnorePayment: [],
      IsProjectContractor: false
    })
  }

  /**
   * 建立綠界付款連結
   * @param orderId 訂單 ID
   * @returns 付款連結資訊
   */
  async createPaymentUrl(orderId: number): Promise<PaymentUrlResponse> {
    // 取得訂單資訊
    const order = await this.orderRepository.findOne({
      where: { id: orderId }
    })

    if (!order) {
      throw new BusinessError(
        ERROR_CODES.ORDER_NOT_FOUND,
        MESSAGES.BUSINESS.ORDER_NOT_FOUND,
        404
      )
    }

    // 檢查訂單狀態
    if (order.payment_status !== PaymentStatus.PENDING) {
      throw new BusinessError(
        ERROR_CODES.FIELD_INVALID_TYPE,
        '訂單已付款或狀態異常',
        400
      )
    }

    // 生成商店訂單編號
    const merchantTradeNo = this.generateMerchantTradeNo(orderId)

    // 建立綠界付款參數
    const paymentParams = {
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: this.formatDateTime(),
      TotalAmount: Math.round(Number(order.total_amount)).toString(),
      TradeDesc: '線上課程購買',
      ItemName: '線上課程',
      ReturnURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/payments/ecpay/callback`,
      ClientBackURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/result`,
      ChoosePayment: this.getChoosePayment(order.purchase_way),
      OrderResultURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/payments/ecpay/callback`
    }

    // 使用官方 SDK 生成付款表單
    const htmlForm = this.ecpay.payment_client.aio_check_out_all(paymentParams)

    // 更新訂單，記錄商店訂單編號
    await this.orderRepository.update(orderId, {
      merchant_trade_no: merchantTradeNo,
      payment_status: PaymentStatus.PROCESSING
    })

    return {
      payment_url: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5', // 使用測試環境
      form_data: paymentParams,
      merchant_trade_no: merchantTradeNo,
      total_amount: Number(order.total_amount),
      html_form: htmlForm  // 官方 SDK 生成的完整 HTML 表單
    }
  }

  /**
   * 處理綠界付款回調
   * @param callbackData 綠界回調資料
   */
  async handlePaymentCallback(callbackData: EcpayCallbackData): Promise<void> {
    try {
      // 使用官方 SDK 驗證回調資料
      const isValid = this.ecpay.payment_client.aio_check_out_feedback(callbackData)
      
      if (!isValid) {
        console.error('綠界回調驗證失敗:', callbackData)
        throw new BusinessError(
          ERROR_CODES.TOKEN_INVALID,
          '付款回調驗證失敗',
          400
        )
      }

      // 查找對應的訂單
      const order = await this.orderRepository.findOne({
        where: { merchant_trade_no: callbackData.MerchantTradeNo }
      })

      if (!order) {
        console.error('找不到對應的訂單:', callbackData.MerchantTradeNo)
        return
      }

      // 根據回調結果更新訂單狀態
      const updateData: Partial<Order> = {
        payment_response: callbackData,
        actual_payment_method: this.getPaymentMethodName(callbackData.PaymentType)
      }

      if (callbackData.RtnCode === '1') {
        // 付款成功
        updateData.payment_status = PaymentStatus.COMPLETED
        updateData.paid_at = new Date()

        console.log(`訂單 ${order.id} 付款成功`)
      } else {
        // 付款失敗
        updateData.payment_status = PaymentStatus.FAILED

        console.log(`訂單 ${order.id} 付款失敗:`, callbackData.RtnMsg)
      }

      await this.orderRepository.update(order.id, updateData)

    } catch (error) {
      console.error('處理付款回調時發生錯誤:', error)
      throw error
    }
  }

  /**
   * 取得訂單付款狀態
   * @param orderId 訂單 ID 
   * @param userId 使用者 ID（權限檢查）
   * @returns 付款狀態資訊
   */
  async getPaymentStatus(orderId: number, userId?: number): Promise<{
    payment_status: PaymentStatus
    merchant_trade_no?: string
    actual_payment_method?: string
    paid_at?: Date
    payment_info?: any
  }> {
    const whereCondition: any = { id: orderId }
    if (userId) {
      whereCondition.buyer_id = userId
    }

    const order = await this.orderRepository.findOne({
      where: whereCondition
    })

    if (!order) {
      throw new BusinessError(
        ERROR_CODES.ORDER_NOT_FOUND,
        MESSAGES.BUSINESS.ORDER_NOT_FOUND,
        404
      )
    }

    return {
      payment_status: order.payment_status,
      merchant_trade_no: order.merchant_trade_no,
      actual_payment_method: order.actual_payment_method,
      paid_at: order.paid_at,
      payment_info: this.extractPaymentInfo(order.payment_response)
    }
  }

  /**
   * 建立綠界表單資料
   * @param order 訂單資訊
   * @param merchantTradeNo 商店訂單編號
   * @returns 表單資料
   */
  private buildEcpayFormData(order: Order, merchantTradeNo: string): Record<string, string> {
    // 這個方法在使用官方 SDK 後已不需要，因為 SDK 會自動處理
    // 保留是為了相容性，實際上建議直接使用 SDK 的 aio_check_out_all 方法
    return {}
  }

  /**
   * 生成商店訂單編號
   * @param orderId 訂單 ID
   * @returns 商店訂單編號
   */
  private generateMerchantTradeNo(orderId: number): string {
    const timestamp = Date.now().toString().slice(-8) // 取後8位時間戳
    return `ORDER${timestamp}${orderId.toString().padStart(4, '0')}`
  }

  /**
   * 格式化綠界日期時間
   * @param date 日期對象，預設為當前時間
   * @returns 綠界要求的日期時間格式 YYYY/MM/dd HH:mm:ss
   */
  private formatDateTime(date: Date = new Date()): string {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')

    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
  }

  /**
   * 根據付款方式代碼取得顯示名稱
   * @param paymentType 綠界付款方式代碼
   * @returns 付款方式顯示名稱
   */
  private getPaymentMethodName(paymentType: string): string {
    const paymentMethods: Record<string, string> = {
      'Credit_CreditCard': '信用卡',
      'ATM_LAND': 'ATM 轉帳',
      'CVS_CVS': '超商代碼繳費',
      'BARCODE_BARCODE': '超商條碼繳費',
      'WebATM_LAND': 'WebATM',
      'ApplePay': 'Apple Pay',
      'GooglePay': 'Google Pay'
    }

    return paymentMethods[paymentType] || paymentType
  }

  /**
   * 生成商品名稱
   * @param order 訂單資訊
   * @returns 商品名稱字串
   */
  private generateItemName(order: Order): string {
    // 簡化版：直接使用固定名稱
    // 未來可以根據訂單項目生成更詳細的名稱
    return '線上課程'
  }

  /**
   * 根據付款方式取得綠界參數
   * @param purchaseWay 付款方式
   * @returns 綠界 ChoosePayment 參數
   */
  private getChoosePayment(purchaseWay: string): string {
    const paymentMap: Record<string, string> = {
      'all': 'ALL',
      'credit_card': 'Credit',
      'atm': 'ATM',
      'cvs': 'CVS',
      'line_pay': 'Credit' // LinePay 暫時歸類到信用卡
    }

    return paymentMap[purchaseWay] || 'ALL'
  }

  /**
   * 從付款回應中提取有用的資訊
   * @param paymentResponse 綠界回應資料
   * @returns 簡化的付款資訊
   */
  private extractPaymentInfo(paymentResponse: any): any {
    if (!paymentResponse) return null

    const info: any = {
      trade_no: paymentResponse.TradeNo,
      payment_date: paymentResponse.PaymentDate,
      payment_type: paymentResponse.PaymentType
    }

    // ATM 相關資訊
    if (paymentResponse.BankCode) {
      info.bank_code = paymentResponse.BankCode
    }
    if (paymentResponse.vAccount) {
      info.v_account = paymentResponse.vAccount
    }
    if (paymentResponse.ExpireDate) {
      info.expire_date = paymentResponse.ExpireDate
    }

    return info
  }
}

// 匯出服務實例
export const paymentService = new PaymentService()