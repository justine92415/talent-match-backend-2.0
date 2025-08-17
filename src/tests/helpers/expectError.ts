/**
 * 測試錯誤驗證工具函式
 * 用於簡化錯誤驗證，支援模式匹配而非硬編碼錯誤訊息
 */

import { Response } from 'supertest'
import { ERROR_CODES } from '@constants/ErrorCode'
import { ERROR_MESSAGES } from '@constants/Message'

/**
 * 預期錯誤驗證選項
 */
interface ExpectErrorOptions {
  /** 預期的HTTP狀態碼 */
  status?: number
  /** 預期的錯誤代碼 */
  code?: string
  /** 預期的錯誤訊息（支援部分匹配） */
  message?: string
  /** 預期的錯誤類型 */
  type?: 'business' | 'validation' | 'auth' | 'system'
  /** 是否檢查錯誤欄位 */
  hasErrors?: boolean
  /** 特定錯誤欄位檢查 */
  errorFields?: string[]
}

/**
 * 驗證 API 回應中的錯誤格式和內容
 * 
 * @param response Supertest Response 物件
 * @param options 預期錯誤選項
 */
export function expectError(response: Response, options: ExpectErrorOptions = {}) {
  const {
    status = 400,
    code,
    message,
    type,
    hasErrors = false,
    errorFields = []
  } = options

  // 檢查HTTP狀態碼
  expect(response.status).toBe(status)

  // 檢查回應結構
  expect(response.body).toHaveProperty('status', 'error')
  expect(response.body).toHaveProperty('message')
  expect(response.body).toHaveProperty('error')
  expect(response.body).toHaveProperty('meta')

  // 檢查錯誤物件結構
  const errorObj = response.body.error
  expect(errorObj).toHaveProperty('code')
  expect(errorObj).toHaveProperty('message')

  // 檢查錯誤代碼
  if (code) {
    expect(errorObj.code).toBe(code)
  }

  // 檢查錯誤訊息（支援部分匹配）
  if (message) {
    expect(errorObj.message).toContain(message)
  }

  // 檢查錯誤類型
  if (type) {
    expect(errorObj.type).toBe(type)
  }

  // 檢查是否有錯誤詳情欄位
  if (hasErrors) {
    expect(response.body).toHaveProperty('errors')
    expect(typeof response.body.errors).toBe('object')
  }

  // 檢查特定錯誤欄位
  if (errorFields.length > 0) {
    expect(response.body).toHaveProperty('errors')
    const errors = response.body.errors
    errorFields.forEach(field => {
      expect(errors).toHaveProperty(field)
      expect(Array.isArray(errors[field])).toBe(true)
      expect(errors[field].length).toBeGreaterThan(0)
    })
  }

  // 檢查 meta 欄位
  const meta = response.body.meta
  expect(meta).toHaveProperty('timestamp')
  expect(meta).toHaveProperty('requestId')
  expect(meta).toHaveProperty('version')

  return response.body
}

/**
 * 預期業務錯誤
 */
export function expectBusinessError(response: Response, code?: keyof typeof ErrorCodes, message?: string) {
  return expectError(response, {
    status: 400,
    code: code ? ErrorCodes[code] : undefined,
    message,
    type: 'business',
    hasErrors: true
  })
}

/**
 * 預期驗證錯誤
 */
export function expectValidationError(response: Response, message?: string, errorFields?: string[]) {
  return expectError(response, {
    status: 400,
    code: ErrorCodes.VALIDATION_ERROR,
    message,
    type: 'validation',
    hasErrors: true,
    errorFields
  })
}

/**
 * 預期認證錯誤
 */
export function expectAuthError(response: Response, code?: keyof typeof ErrorCodes, message?: string, status: number = 401) {
  return expectError(response, {
    status,
    code: code ? ErrorCodes[code] : undefined,
    message,
    type: 'auth',
    hasErrors: true
  })
}

/**
 * 預期系統錯誤
 */
export function expectSystemError(response: Response, message?: string) {
  return expectError(response, {
    status: 500,
    code: ErrorCodes.INTERNAL_ERROR,
    message,
    type: 'system',
    hasErrors: true
  })
}

/**
 * 預期未找到錯誤
 */
export function expectNotFoundError(response: Response, code?: keyof typeof ErrorCodes, message?: string) {
  return expectError(response, {
    status: 404,
    code: code ? ErrorCodes[code] : undefined,
    message,
    type: 'business',
    hasErrors: true
  })
}

/**
 * 預期衝突錯誤
 */
export function expectConflictError(response: Response, code?: keyof typeof ErrorCodes, message?: string) {
  return expectError(response, {
    status: 409,
    code: code ? ErrorCodes[code] : undefined,
    message,
    type: 'business',
    hasErrors: true
  })
}

/**
 * 預期禁止存取錯誤
 */
export function expectForbiddenError(response: Response, code?: keyof typeof ErrorCodes, message?: string) {
  return expectError(response, {
    status: 403,
    code: code ? ErrorCodes[code] : undefined,
    message,
    type: 'auth',
    hasErrors: true
  })
}

/**
 * 驗證 AppError 實例的錯誤
 * 
 * @param error 錯誤實例
 * @param expectedCode 預期錯誤代碼
 * @param expectedMessage 預期錯誤訊息（部分匹配）
 */
export function expectAppError(error: any, expectedCode?: string, expectedMessage?: string) {
  expect(isAppError(error)).toBe(true)
  
  if (expectedCode) {
    expect((error as AppError).code).toBe(expectedCode)
  }
  
  if (expectedMessage) {
    expect((error as AppError).message).toContain(expectedMessage)
  }
  
  // 檢查基本屬性
  expect((error as AppError).timestamp).toBeDefined()
  expect((error as AppError).statusCode).toBeGreaterThan(0)
  expect((error as AppError).type).toBeDefined()
}

/**
 * 常用錯誤代碼快捷方式
 */
export const ErrorMatchers = {
  // 用戶相關
  emailExists: (response: Response) => expectConflictError(response, 'EMAIL_EXISTS', '電子郵件已被註冊'),
  nicknameExists: (response: Response) => expectConflictError(response, 'NICKNAME_EXISTS', '暱稱已被使用'),
  userNotFound: (response: Response) => expectNotFoundError(response, 'USER_NOT_FOUND', '用戶不存在'),
  accountSuspended: (response: Response) => expectForbiddenError(response, 'ACCOUNT_SUSPENDED', '帳號已停用'),

  // 認證相關
  invalidCredentials: (response: Response) => expectAuthError(response, 'INVALID_CREDENTIALS', '帳號或密碼錯誤'),
  tokenExpired: (response: Response) => expectAuthError(response, 'TOKEN_EXPIRED', '登入已過期'),
  invalidToken: (response: Response) => expectAuthError(response, 'INVALID_TOKEN', '無效的認證令牌'),
  unauthorizedAccess: (response: Response) => expectForbiddenError(response, 'UNAUTHORIZED_ACCESS', '未經授權'),

  // 驗證相關
  validationFailed: (response: Response) => expectValidationError(response, '輸入資料驗證失敗'),
  passwordTooShort: (response: Response) => expectValidationError(response, '密碼長度至少需要6個字元'),
  invalidEmail: (response: Response) => expectValidationError(response, '請輸入有效的電子郵件格式'),

  // 教師相關
  applicationExists: (response: Response) => expectConflictError(response, 'APPLICATION_EXISTS', '已提交過教師申請'),
  applicationNotFound: (response: Response) => expectNotFoundError(response, 'APPLICATION_NOT_FOUND', '找不到教師申請記錄'),
  invalidApplicationStatus: (response: Response) => expectBusinessError(response, 'INVALID_APPLICATION_STATUS', '申請狀態無法執行此操作'),
  teacherNotFound: (response: Response) => expectNotFoundError(response, 'TEACHER_NOT_FOUND', '教師資料不存在'),

  // 系統錯誤
  internalError: (response: Response) => expectSystemError(response, '系統發生內部錯誤'),
  databaseError: (response: Response) => expectSystemError(response, '資料庫操作失敗'),
  serviceUnavailable: (response: Response) => expectError(response, { 
    status: 503, 
    code: ErrorCodes.SERVICE_UNAVAILABLE, 
    message: '服務暫時無法使用', 
    type: 'system' 
  })
}

export default {
  expectError,
  expectBusinessError,
  expectValidationError,
  expectAuthError,
  expectSystemError,
  expectNotFoundError,
  expectConflictError,
  expectForbiddenError,
  expectAppError,
  ErrorMatchers
}