/**
 * 綠界金流工具函式
 * 處理綠界 ECPay API 相關的加密、驗證等功能
 */

import crypto from 'crypto'

export class EcpayHelper {
  /**
   * 生成綠界 CheckMacValue
   * @param params 參數對象
   * @returns MD5 雜湊值
   */
  static generateCheckMacValue(params: Record<string, any>): string {
    const hashKey = process.env.ECPAY_HASH_KEY!
    const hashIV = process.env.ECPAY_HASH_IV!

    // 1. 移除 CheckMacValue 參數（如果存在）
    const filteredParams = { ...params }
    delete filteredParams.CheckMacValue

    // 2. 按照 key 的字母順序排序
    const sortedKeys = Object.keys(filteredParams).sort()

    // 3. 組成查詢字串格式
    const queryString = sortedKeys
      .map(key => `${key}=${filteredParams[key]}`)
      .join('&')

    // 4. 前後加上 HashKey 和 HashIV
    const rawString = `HashKey=${hashKey}&${queryString}&HashIV=${hashIV}`

    // 5. URL Encode
    const encodedString = encodeURIComponent(rawString)
      .replace(/%20/g, '+')
      .replace(/[!'()*]/g, (c) => {
        return '%' + c.charCodeAt(0).toString(16).toUpperCase()
      })

    // 6. 轉小寫
    const lowerCaseString = encodedString.toLowerCase()

    // 7. MD5 雜湊
    const md5Hash = crypto.createHash('md5').update(lowerCaseString).digest('hex')

    // 8. 轉大寫
    return md5Hash.toUpperCase()
  }

  /**
   * 驗證綠界回傳的 CheckMacValue
   * @param params 綠界回傳的參數
   * @returns 是否驗證成功
   */
  static verifyCheckMacValue(params: Record<string, any>): boolean {
    const receivedCheckMacValue = params.CheckMacValue
    if (!receivedCheckMacValue) {
      return false
    }

    const calculatedCheckMacValue = this.generateCheckMacValue(params)
    return receivedCheckMacValue === calculatedCheckMacValue
  }

  /**
   * 生成商店訂單編號
   * @param orderId 訂單 ID
   * @returns 商店訂單編號
   */
  static generateMerchantTradeNo(orderId: number): string {
    const timestamp = Date.now().toString().slice(-8) // 取後8位時間戳
    return `ORDER${timestamp}${orderId.toString().padStart(4, '0')}`
  }

  /**
   * 格式化綠界日期時間
   * @param date 日期對象，預設為當前時間
   * @returns 綠界要求的日期時間格式 YYYY/MM/dd HH:mm:ss
   */
  static formatDateTime(date: Date = new Date()): string {
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
  static getPaymentMethodName(paymentType: string): string {
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
   * 驗證環境變數是否設定完整
   * @returns 是否設定完整
   */
  static validateEnvironmentConfig(): boolean {
    const requiredEnvs = [
      'ECPAY_MERCHANT_ID',
      'ECPAY_HASH_KEY', 
      'ECPAY_HASH_IV',
      'ECPAY_API_URL'
    ]

    return requiredEnvs.every(env => process.env[env])
  }
}