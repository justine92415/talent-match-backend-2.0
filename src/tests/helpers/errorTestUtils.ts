/**
 * 簡化的測試錯誤驗證工具 - 更新為新的簡潔格式
 * 統一驗證錯誤回應格式：{ status, code, message, errors? }
 */

import { Response } from 'supertest'
import { ERROR_MESSAGES } from '@constants/Message'

/**
 * 驗證錯誤回應的基本結構和訊息
 */
export const expectErrorResponse = {
  /**
   * 驗證業務邏輯錯誤 - 簡潔格式（無 errors 欄位）
   */
  business: (response: Response, expectedMessage: string, statusCode: number = 400) => {
    expect(response.status).toBe(statusCode)
    expect(response.body).toMatchObject({
      status: 'error',
      code: expect.any(String),
      message: expectedMessage
    })
    // 業務錯誤不應該有 errors 欄位
    expect(response.body.errors).toBeUndefined()
  },

  /**
   * 驗證認證錯誤 - 簡潔格式（無 errors 欄位）
   */
  auth: (response: Response, expectedMessage: string, statusCode: number = 401) => {
    expect(response.status).toBe(statusCode)
    expect(response.body).toMatchObject({
      status: 'error',
      code: expect.any(String),
      message: expectedMessage
    })
    // 認證錯誤不應該有 errors 欄位
    expect(response.body.errors).toBeUndefined()
  },

  /**
   * 驗證驗證錯誤 - 包含 errors 欄位
   */
  validation: (response: Response, expectedFields: string[], statusCode: number = 400) => {
    expect(response.status).toBe(statusCode)
    expect(response.body).toMatchObject({
      status: 'error',
      code: expect.any(String),
      message: expect.any(String)
    })
    
    // 驗證錯誤應該包含 errors 欄位
    expect(response.body.errors).toBeDefined()
    
    // 檢查預期的錯誤欄位是否存在
    expectedFields.forEach(field => {
      expect(response.body.errors[field]).toBeDefined()
      expect(Array.isArray(response.body.errors[field])).toBe(true)
    })
  },

  /**
   * 驗證系統錯誤 - 簡潔格式（無 errors 欄位）
   */
  system: (response: Response, expectedMessage: string, statusCode: number = 500) => {
    expect(response.status).toBe(statusCode)
    expect(response.body).toMatchObject({
      status: 'error',
      code: expect.any(String),
      message: expectedMessage
    })
    // 系統錯誤不應該有 errors 欄位
    expect(response.body.errors).toBeUndefined()
  },

  /**
   * 通用錯誤格式驗證 - 確保回應符合新的簡潔格式
   */
  format: (response: Response, expectErrors: boolean = false) => {
    // 基本格式檢查
    expect(response.body).toHaveProperty('status', 'error')
    expect(response.body).toHaveProperty('code')
    expect(response.body).toHaveProperty('message')
    
    // 確認沒有舊格式的 error 物件
    expect(response.body.error).toBeUndefined()
    
    // errors 欄位的條件性檢查
    if (expectErrors) {
      expect(response.body.errors).toBeDefined()
      expect(typeof response.body.errors).toBe('object')
    } else {
      expect(response.body.errors).toBeUndefined()
    }
  }
}

/**
 * 常用錯誤訊息快速訪問
 * 方便在測試中直接使用統一的錯誤訊息
 */
export const TestErrorMessages = ERROR_MESSAGES

export default { expectErrorResponse, TestErrorMessages }