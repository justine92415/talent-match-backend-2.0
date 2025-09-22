/**
 * 付款服務
 * 使用綠界官方 SDK 處理付款相關的業務邏輯
 */

import { Repository } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Order } from '@entities/Order'
import { OrderItem } from '@entities/OrderItem'
import { Course } from '@entities/Course'
import { PaymentStatus } from '@entities/enums'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import { EcpayHelper } from '@utils/ecpayHelper'
import { purchaseService } from './PurchaseService'

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
  private orderItemRepository: Repository<OrderItem>
  private courseRepository: Repository<Course>
  private ecpay: any
  private isProduction: boolean

  constructor() {
    this.orderRepository = dataSource.getRepository(Order)
    this.orderItemRepository = dataSource.getRepository(OrderItem)
    this.courseRepository = dataSource.getRepository(Course)
    
    // 判斷是否為正式環境（決定是否跳過綠界付款流程）
    this.isProduction = process.env.NODE_ENV === 'production'
    
    // 初始化綠界 SDK - 統一使用測試環境
    this.ecpay = new ecpay_payment({
      OperationMode: 'Test', // 統一使用測試環境
      MercProfile: {
        MerchantID: process.env.ECPAY_MERCHANT_ID || '2000132',
        HashKey: process.env.ECPAY_HASH_KEY || '5294y06JbISpM5x9',
        HashIV: process.env.ECPAY_HASH_IV || 'v77hoKGq4kWxNNIS'
      },
      IgnorePayment: [],
      IsProjectContractor: false
    })
    
    if (this.isProduction) {
      console.log('🔧 正式環境：綠界付款功能已啟用（測試模式）')
    } else {
      console.log('🔧 開發環境：綠界付款功能已啟用（測試模式）')
    }
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



    // 獲取訂單項目和課程資訊
    const orderItems = await this.orderItemRepository.find({
      where: { order_id: orderId }
    })

    if (orderItems.length === 0) {
      throw new BusinessError(
        ERROR_CODES.ORDER_NOT_FOUND,
        '找不到訂單項目',
        404
      )
    }

    // 獲取課程資訊
    const courseIds = orderItems.map(item => item.course_id)
    const courses = await this.courseRepository.findByIds(courseIds)
    const courseMap = new Map(courses.map(course => [course.id, course]))

    // 生成動態的交易描述和商品名稱
    const { tradeDesc, itemName } = this.generateTradeInfo(orderItems, courseMap)

    // 生成商店訂單編號
    const merchantTradeNo = EcpayHelper.generateMerchantTradeNo(orderId)

    // 開發環境跳過綠界付款，直接完成訂單
    if (!this.isProduction) {
      console.log('🔧 開發環境：跳過綠界付款流程，直接更新訂單為已完成')
      
      // 更新訂單，記錄商店訂單編號並設為已完成
      await this.orderRepository.update(orderId, {
        merchant_trade_no: merchantTradeNo,
        payment_status: PaymentStatus.COMPLETED,
        paid_at: new Date(),
        actual_payment_method: '開發環境模擬'
      })

      // 建立課程購買記錄
      try {
        await purchaseService.createPurchaseFromOrder(orderId)
        console.log(`🔧 開發環境：訂單 ${orderId} 課程購買記錄已建立`)
      } catch (purchaseError) {
        console.error(`建立課程購買記錄失敗 (訂單 ${orderId}):`, purchaseError)
      }

      // 返回空的表單，前端可以直接導向成功頁面
      return {
        payment_url: '',
        form_data: {},
        html_form: '',
        merchant_trade_no: merchantTradeNo,
        total_amount: Number(order.total_amount)
      }
    }

    // 建立綠界付款參數
    const paymentParams = {
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: EcpayHelper.formatDateTime(),
      TotalAmount: Math.round(Number(order.total_amount)).toString(),
      TradeDesc: tradeDesc,
      ItemName: itemName,
      ReturnURL: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/payments/ecpay/callback`,
      ClientBackURL: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${orderId}/result`,
      ChoosePayment: this.getChoosePayment(order.purchase_way),
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
      // 開發環境跳過驗證邏輯，直接處理為付款成功
      if (!this.isProduction) {
        console.log('🔧 開發環境：跳過綠界回調驗證')
        
        // 查找對應的訂單
        const order = await this.orderRepository.findOne({
          where: { merchant_trade_no: callbackData.MerchantTradeNo }
        })

        if (!order) {
          console.error('找不到對應的訂單:', callbackData.MerchantTradeNo)
          return
        }

        // 開發環境直接設定為付款成功
        await this.orderRepository.update(order.id, {
          payment_status: PaymentStatus.COMPLETED,
          payment_response: { ...callbackData, dev_mode: true },
          actual_payment_method: '開發環境模擬',
          paid_at: new Date()
        })

        // 付款成功後建立課程購買記錄
        try {
          await purchaseService.createPurchaseFromOrder(order.id)
          console.log(`🔧 開發環境：訂單 ${order.id} 課程購買記錄已建立`)
        } catch (purchaseError) {
          console.error(`建立課程購買記錄失敗 (訂單 ${order.id}):`, purchaseError)
        }

        console.log(`🔧 開發環境：訂單 ${order.id} 模擬付款成功`)
        return
      }

      // 正式環境：使用綠界官方 SDK 驗證回調資料
      const data = { ...callbackData } as any
      delete data.CheckMacValue
      
      const checkValue = this.ecpay.payment_client.helper.gen_chk_mac_value(data)
      
      if (callbackData.CheckMacValue !== checkValue) {
        console.error('綠界回調驗證失敗:', {
          merchant_trade_no: callbackData.MerchantTradeNo,
          generated_check_mac: checkValue,
          received_check_mac: callbackData.CheckMacValue
        })
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
        actual_payment_method: EcpayHelper.getPaymentMethodName(callbackData.PaymentType)
      }

      if (callbackData.RtnCode === '1') {
        // 付款成功 - 先更新訂單狀態
        updateData.payment_status = PaymentStatus.COMPLETED
        updateData.paid_at = new Date()
        
        await this.orderRepository.update(order.id, updateData)
        console.log(`訂單 ${order.id} 付款成功`)

        // 訂單狀態更新後再建立課程購買記錄
        try {
          await purchaseService.createPurchaseFromOrder(order.id)
          console.log(`訂單 ${order.id} 課程購買記錄已建立`)
        } catch (purchaseError) {
          console.error(`建立課程購買記錄失敗 (訂單 ${order.id}):`, purchaseError)
          // 這裡不拋出錯誤，因為付款已經成功，購買記錄可以後續手動修復
        }
      } else {
        // 付款失敗
        updateData.payment_status = PaymentStatus.FAILED
        await this.orderRepository.update(order.id, updateData)
        console.log(`訂單 ${order.id} 付款失敗:`, callbackData.RtnMsg)
      }

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
   * 生成動態的交易描述和商品名稱
   * @param orderItems 訂單項目列表
   * @param courseMap 課程映射表
   * @returns 交易描述和商品名稱
   */
  private generateTradeInfo(orderItems: OrderItem[], courseMap: Map<number, Course>): {
    tradeDesc: string
    itemName: string
  } {
    if (orderItems.length === 0) {
      return {
        tradeDesc: '課程購買',
        itemName: '線上課程'
      }
    }

    // 單一課程的情況
    if (orderItems.length === 1) {
      const orderItem = orderItems[0]
      const course = courseMap.get(orderItem.course_id)
      
      if (course) {
        const tradeDesc = `課程購買：${course.name}`
        const itemName = `${course.name}${orderItem.quantity > 1 ? ` x${orderItem.quantity}` : ''}`
        
        return {
          tradeDesc: tradeDesc.length > 200 ? tradeDesc.substring(0, 197) + '...' : tradeDesc,
          itemName: itemName.length > 200 ? itemName.substring(0, 197) + '...' : itemName
        }
      }
    }

    // 多課程的情況
    const courseNames = orderItems.map(item => {
      const course = courseMap.get(item.course_id)
      return course ? course.name : '課程'
    })

    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0)
    
    let tradeDesc = `課程購買 (共${orderItems.length}門課程)`
    let itemName = courseNames.length <= 2 
      ? courseNames.join('、')
      : `${courseNames[0]} 等 ${orderItems.length} 門課程`
    
    if (totalItems > orderItems.length) {
      itemName += ` 共${totalItems}堂`
    }

    // 確保長度不超過綠界限制 (200字元)
    return {
      tradeDesc: tradeDesc.length > 200 ? tradeDesc.substring(0, 197) + '...' : tradeDesc,
      itemName: itemName.length > 200 ? itemName.substring(0, 197) + '...' : itemName
    }
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