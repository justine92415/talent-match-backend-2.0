/**
 * 業界標準錯誤處理架構
 * 基於領域驅動設計和 Exception-First 策略
 */

// ==================== 錯誤碼標準化 ====================

export enum ErrorCode {
  // 認證相關 (AUTH_*)
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_TOKEN_INVALID = 'AUTH_003',
  AUTH_ACCOUNT_SUSPENDED = 'AUTH_004',
  AUTH_USER_NOT_FOUND = 'AUTH_005',

  // 驗證相關 (VALID_*)
  VALID_REQUIRED_FIELD = 'VALID_001',
  VALID_INVALID_FORMAT = 'VALID_002',
  VALID_OUT_OF_RANGE = 'VALID_003',
  VALID_MULTIPLE_VIOLATIONS = 'VALID_004',
  VALID_PASSWORD_POLICY_VIOLATION = 'VALID_005',

  // 業務邏輯 (BIZ_*)
  BIZ_DUPLICATE_EMAIL = 'BIZ_001',
  BIZ_INVALID_PASSWORD_RESET_TOKEN = 'BIZ_002',

  // 權限相關 (AUTHZ_*)
  AUTHZ_INSUFFICIENT_PERMISSIONS = 'AUTHZ_001',
  AUTHZ_RESOURCE_FORBIDDEN = 'AUTHZ_002',

  // 系統錯誤 (SYS_*)
  SYS_DATABASE_ERROR = 'SYS_001',
  SYS_EXTERNAL_SERVICE_ERROR = 'SYS_002',
  SYS_INTERNAL_ERROR = 'SYS_003'
}

// ==================== 基礎錯誤類別 ====================

/**
 * 領域錯誤基礎類別
 */
export abstract class DomainError extends Error {
  abstract readonly code: ErrorCode
  abstract readonly statusCode: number

  constructor(
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// ==================== 驗證錯誤 ====================

export interface ValidationViolation {
  field: string
  message: string
}

/**
 * 單一欄位驗證錯誤
 */
export class RequiredFieldError extends DomainError {
  readonly code = ErrorCode.VALID_REQUIRED_FIELD
  readonly statusCode = 400

  constructor(fieldName: string) {
    super(`${fieldName}為必填欄位`)
  }
}

/**
 * 格式驗證錯誤
 */
export class InvalidFormatError extends DomainError {
  readonly code = ErrorCode.VALID_INVALID_FORMAT
  readonly statusCode = 400

  constructor(fieldName: string, expectedFormat: string) {
    super(`${fieldName}必須符合${expectedFormat}`)
  }
}

/**
 * 多重驗證錯誤
 */
export class MultipleValidationError extends DomainError {
  readonly code = ErrorCode.VALID_MULTIPLE_VIOLATIONS
  readonly statusCode = 400

  constructor(public readonly violations: ValidationViolation[]) {
    super('參數驗證失敗')
  }
}

/**
 * 密碼政策違規錯誤
 */
export class PasswordPolicyViolationError extends DomainError {
  readonly code = ErrorCode.VALID_PASSWORD_POLICY_VIOLATION
  readonly statusCode = 400

  constructor(violations: string[]) {
    super('密碼不符合安全政策', { violations })
  }
}

// ==================== 認證錯誤 ====================

/**
 * 認證失敗錯誤
 */
export class InvalidCredentialsError extends DomainError {
  readonly code = ErrorCode.AUTH_INVALID_CREDENTIALS
  readonly statusCode = 401

  constructor() {
    super('電子郵件或密碼錯誤')
  }
}

/**
 * 帳號停用錯誤
 */
export class AccountSuspendedError extends DomainError {
  readonly code = ErrorCode.AUTH_ACCOUNT_SUSPENDED
  readonly statusCode = 403

  constructor() {
    super('您的帳號已被停用，請聯絡客服')
  }
}

/**
 * 使用者不存在錯誤
 */
export class UserNotFoundError extends DomainError {
  readonly code = ErrorCode.AUTH_USER_NOT_FOUND
  readonly statusCode = 401

  constructor() {
    super('使用者不存在')
  }
}

/**
 * JWT Token 錯誤
 */
export class InvalidTokenError extends DomainError {
  readonly code = ErrorCode.AUTH_TOKEN_INVALID
  readonly statusCode = 401

  constructor(reason?: string) {
    super(reason || '無效或已過期的 Token')
  }
}

/**
 * Token 過期錯誤
 */
export class TokenExpiredError extends DomainError {
  readonly code = ErrorCode.AUTH_TOKEN_EXPIRED
  readonly statusCode = 401

  constructor() {
    super('Token 已過期，請重新登入')
  }
}

// ==================== 業務邏輯錯誤 ====================

/**
 * 電子郵件重複錯誤
 */
export class DuplicateEmailError extends DomainError {
  readonly code = ErrorCode.BIZ_DUPLICATE_EMAIL
  readonly statusCode = 409

  constructor() {
    super('此電子郵件已被註冊')
  }
}

/**
 * 無效的密碼重設令牌
 */
export class InvalidPasswordResetTokenError extends DomainError {
  readonly code = ErrorCode.BIZ_INVALID_PASSWORD_RESET_TOKEN
  readonly statusCode = 400

  constructor() {
    super('無效或已過期的重設令牌')
  }
}

// ==================== 權限錯誤 ====================

/**
 * 權限不足錯誤
 */
export class InsufficientPermissionsError extends DomainError {
  readonly code = ErrorCode.AUTHZ_INSUFFICIENT_PERMISSIONS
  readonly statusCode = 403

  constructor(resource: string, action: string) {
    super(`權限不足，無法${action}此${resource}`)
  }
}

// ==================== 系統錯誤 ====================

/**
 * 資料庫錯誤
 */
export class DatabaseError extends DomainError {
  readonly code = ErrorCode.SYS_DATABASE_ERROR
  readonly statusCode = 500

  constructor(originalError?: Error) {
    super('資料庫操作失敗', { originalError: originalError?.message })
  }
}

/**
 * 系統內部錯誤
 */
export class InternalServerError extends DomainError {
  readonly code = ErrorCode.SYS_INTERNAL_ERROR
  readonly statusCode = 500

  constructor(message = '系統錯誤，請稍後再試') {
    super(message)
  }
}

// ==================== 錯誤檢查工具 ====================

/**
 * 檢查錯誤是否為領域錯誤
 */
export function isDomainError(error: Error): error is DomainError {
  return error instanceof DomainError
}

/**
 * 檢查錯誤是否為驗證錯誤
 */
export function isValidationError(error: Error): error is MultipleValidationError {
  return error instanceof MultipleValidationError
}

// ==================== 標準化回應格式 ====================

export interface ErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: Record<string, any>
    violations?: ValidationViolation[]
    timestamp: string
    requestId?: string
  }
}

export interface SuccessResponse<T = any> {
  data: T
  message?: string
  timestamp: string
  requestId?: string
}
