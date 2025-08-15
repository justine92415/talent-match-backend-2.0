import { ERROR_CODES } from '../../config/constants'

/**
 * 業務邏輯錯誤基類
 */
export class BusinessError extends Error {
  public readonly code: string
  public readonly statusCode: number

  constructor(code: string, message: string, statusCode: number = 400) {
    super(message)
    this.name = 'BusinessError'
    this.code = code
    this.statusCode = statusCode
  }
}

/**
 * 使用者相關錯誤
 */
export class UserError extends BusinessError {
  static emailExists(): UserError {
    return new UserError(ERROR_CODES.EMAIL_EXISTS, '此電子郵件已被註冊')
  }

  static nicknameExists(): UserError {
    return new UserError(ERROR_CODES.NICKNAME_EXISTS, '此暱稱已被使用')
  }
}

/**
 * 驗證錯誤
 */
export class ValidationError extends BusinessError {
  public readonly errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super(ERROR_CODES.VALIDATION_ERROR, '參數驗證失敗', 400)
    this.errors = errors
  }
}
