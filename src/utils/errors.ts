/**
 * 簡化版錯誤處理系統
 * 適用於中小型專案的統一錯誤處理標準
 */

import { 
  ERROR_MESSAGES, 
  AuthMessages, 
  ValidationMessages, 
  BusinessMessages, 
  SystemMessages 
} from '@constants/errorMessages'

// 錯誤類型枚舉
export enum ErrorType {
  BUSINESS = 'business',    // 業務邏輯錯誤 (用戶重複註冊)
  VALIDATION = 'validation', // 輸入驗證錯誤 (密碼太短)
  AUTH = 'auth',           // 認證問題 (登入失敗)
  SYSTEM = 'system'        // 系統錯誤 (資料庫連線)
}

/**
 * 應用程式基礎錯誤類別
 */
export class AppError extends Error {
  public readonly code: string
  public readonly type: ErrorType
  public readonly statusCode: number
  public readonly timestamp: string

  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    type: ErrorType = ErrorType.BUSINESS
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.type = type
    this.statusCode = statusCode
    this.timestamp = new Date().toISOString()

    // 確保堆疊追蹤正確
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}

/**
 * 業務邏輯錯誤類別
 */
export class BusinessError extends AppError {
  constructor(code: string, message: string, statusCode: number = 400) {
    super(code, message, statusCode, ErrorType.BUSINESS)
    this.name = 'BusinessError'
  }
}

/**
 * 輸入驗證錯誤類別
 */
export class ValidationError extends AppError {
  public readonly details?: Record<string, string[]>

  constructor(code: string, message: string, details?: Record<string, string[]>) {
    super(code, message, 400, ErrorType.VALIDATION)
    this.name = 'ValidationError'
    this.details = details
  }
}

/**
 * 認證授權錯誤類別
 */
export class AuthError extends AppError {
  constructor(code: string, message: string, statusCode: number = 401) {
    super(code, message, statusCode, ErrorType.AUTH)
    this.name = 'AuthError'
  }
}

/**
 * 系統錯誤類別
 */
export class SystemError extends AppError {
  constructor(code: string, message: string, statusCode: number = 500) {
    super(code, message, statusCode, ErrorType.SYSTEM)
    this.name = 'SystemError'
  }
}

/**
 * 常用錯誤的工廠函式
 * 使用統一錯誤訊息，確保整個專案的一致性
 */
export const Errors = {
  // === 用戶相關業務錯誤 ===
  emailExists: (customMessage?: string) => 
    new BusinessError('EMAIL_EXISTS', customMessage || AuthMessages.EMAIL_EXISTS),
  
  nicknameExists: (customMessage?: string) => 
    new BusinessError('NICKNAME_EXISTS', customMessage || AuthMessages.NICKNAME_EXISTS),
  
  userNotFound: (customMessage?: string) => 
    new BusinessError('USER_NOT_FOUND', customMessage || BusinessMessages.USER_NOT_FOUND, 404),

  accountSuspended: (customMessage?: string, statusCode: number = 403) => 
    new BusinessError('ACCOUNT_SUSPENDED', customMessage || AuthMessages.ACCOUNT_SUSPENDED, statusCode),

  // === 認證相關錯誤 ===
  invalidCredentials: (customMessage?: string) => 
    new AuthError('INVALID_CREDENTIALS', customMessage || AuthMessages.INVALID_CREDENTIALS),
  
  tokenExpired: (customMessage?: string) => 
    new AuthError('TOKEN_EXPIRED', customMessage || AuthMessages.TOKEN_EXPIRED),
  
  invalidToken: (customMessage?: string) => 
    new AuthError('INVALID_TOKEN', customMessage || AuthMessages.TOKEN_INVALID),

  tokenRequired: (customMessage?: string) => 
    new AuthError('TOKEN_REQUIRED', customMessage || AuthMessages.TOKEN_REQUIRED),

  tokenInvalidOrExpired: (customMessage?: string) => 
    new AuthError('TOKEN_INVALID_OR_EXPIRED', customMessage || AuthMessages.TOKEN_INVALID_OR_EXPIRED),

  resetTokenInvalid: (customMessage?: string) => 
    new BusinessError('RESET_TOKEN_INVALID', customMessage || AuthMessages.RESET_TOKEN_INVALID, 400),
  
  unauthorizedAccess: (customMessage?: string, statusCode: number = 401) =>
    new AuthError('UNAUTHORIZED_ACCESS', customMessage || '未經授權的存取', statusCode),

  // === 驗證相關錯誤 ===
  validationFailed: (customMessage?: string) => 
    new ValidationError('VALIDATION_ERROR', customMessage || SystemMessages.VALIDATION_FAILED),
  
  validation: (details: Record<string, string[]>, customMessage?: string) => 
    new ValidationError('VALIDATION_ERROR', customMessage || SystemMessages.VALIDATION_FAILED, details),
  
  passwordTooShort: (customMessage?: string) => 
    new ValidationError('PASSWORD_TOO_SHORT', customMessage || ValidationMessages.PASSWORD_TOO_SHORT),
  
  invalidEmail: (customMessage?: string) => 
    new ValidationError('INVALID_EMAIL', customMessage || ValidationMessages.EMAIL_INVALID),
  
  invalidNickname: (customMessage?: string) => 
    new ValidationError('INVALID_NICKNAME', customMessage || ValidationMessages.NICKNAME_EMPTY),

  // === 教師相關業務錯誤 ===
  applicationExists: (customMessage?: string) =>
    new BusinessError('APPLICATION_EXISTS', customMessage || BusinessMessages.APPLICATION_EXISTS, 409),  applicationNotFound: (customMessage?: string) => 
    new BusinessError('APPLICATION_NOT_FOUND', customMessage || '找不到教師申請記錄', 404),
  
  invalidApplicationStatus: (customMessage?: string) => 
    new BusinessError('INVALID_APPLICATION_STATUS', customMessage || '目前申請狀態無法執行此操作'),
  
  teacherNotFound: (customMessage?: string) => 
    new BusinessError('TEACHER_NOT_FOUND', customMessage || BusinessMessages.TEACHER_NOT_FOUND, 404),

  // === 系統錯誤 ===
  internalError: (customMessage?: string) => 
    new SystemError('INTERNAL_ERROR', customMessage || SystemMessages.INTERNAL_ERROR),
  
  databaseError: (customMessage?: string) => 
    new SystemError('DATABASE_ERROR', customMessage || SystemMessages.DATABASE_ERROR),
  
  serviceUnavailable: (customMessage?: string) => 
    new SystemError('SERVICE_UNAVAILABLE', customMessage || '服務暫時無法使用', 503)
}

/**
 * 錯誤代碼常數
 * 用於測試和其他需要引用錯誤代碼的地方
 */
export const ErrorCodes = {
  // 用戶相關
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  NICKNAME_EXISTS: 'NICKNAME_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  
  // 認證相關
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  
  // 驗證相關
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_NICKNAME: 'INVALID_NICKNAME',
  
  // 教師相關
  APPLICATION_EXISTS: 'APPLICATION_EXISTS',
  APPLICATION_NOT_FOUND: 'APPLICATION_NOT_FOUND',
  INVALID_APPLICATION_STATUS: 'INVALID_APPLICATION_STATUS',
  TEACHER_NOT_FOUND: 'TEACHER_NOT_FOUND',
  
  // 系統相關
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const

/**
 * 檢查是否為應用程式錯誤
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError
}

/**
 * 錯誤類型檢查工具
 */
export const isErrorType = {
  business: (error: any): error is BusinessError => error instanceof BusinessError,
  validation: (error: any): error is ValidationError => error instanceof ValidationError,
  auth: (error: any): error is AuthError => error instanceof AuthError,
  system: (error: any): error is SystemError => error instanceof SystemError
}

export default {
  AppError,
  BusinessError,
  ValidationError,
  AuthError,
  SystemError,
  Errors,
  ErrorCodes,
  ErrorType,
  isAppError,
  isErrorType
}