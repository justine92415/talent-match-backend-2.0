/**
 * 簡化的測試錯誤驗證工具
 * 使用統一的錯誤訊息常數進行測試驗證
 */

import { Response } from 'supertest'
import { ERROR_MESSAGES } from '@constants/errorMessages'

/**
 * 驗證錯誤回應的基本結構和訊息
 */
export const expectErrorResponse = {
  /**
   * 驗證業務邏輯錯誤
   */
  business: (response: Response, expectedMessage: string, statusCode: number = 400) => {
    expect(response.status).toBe(statusCode)
    expect(response.body).toMatchObject({
      status: 'error',
      message: expectedMessage
    })
  },

  /**
   * 驗證認證錯誤
   */
  auth: (response: Response, expectedMessage: string, statusCode: number = 401) => {
    expect(response.status).toBe(statusCode)
    expect(response.body).toMatchObject({
      status: 'error',
      message: expectedMessage
    })
  },

  /**
   * 驗證驗證錯誤（包含錯誤詳情）
   */
  validation: (response: Response, expectedFields: string[], statusCode: number = 400) => {
    expect(response.status).toBe(statusCode)
    expect(response.body).toMatchObject({
      status: 'error'
    })
    expect(response.body.errors).toBeDefined()
    
    // 檢查預期的錯誤欄位是否存在
    expectedFields.forEach(field => {
      expect(response.body.errors[field]).toBeDefined()
    })
  }
}

/**
 * 常用錯誤訊息快速訪問
 * 方便在測試中直接使用統一的錯誤訊息
 */
export const TestErrorMessages = ERROR_MESSAGES

export default { expectErrorResponse, TestErrorMessages }