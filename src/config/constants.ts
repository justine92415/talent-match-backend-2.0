/**
 * 應用程式配置常數
 */

// JWT 配置
export const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'default-secret-key',
  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
  ACCESS_TOKEN_EXPIRES_SECONDS: 3600,
  TOKEN_TYPE: 'Bearer'
} as const

// 密碼配置
export const PASSWORD_CONFIG = {
  BCRYPT_SALT_ROUNDS: 12,
  MIN_LENGTH: 8,
  MAX_LENGTH: 128
} as const

// 使用者資料配置
export const USER_CONFIG = {
  NICKNAME_MIN_LENGTH: 1,
  NICKNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255
} as const

// 錯誤代碼
export const ERROR_CODES = {
  EMAIL_EXISTS: 'EMAIL_EXISTS',
  NICKNAME_EXISTS: 'NICKNAME_EXISTS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
} as const

// 錯誤訊息
export const ERROR_MESSAGES = {
  REGISTRATION_FAILED: '註冊失敗',
  EMAIL_ALREADY_REGISTERED: '此電子郵件已被註冊',
  NICKNAME_ALREADY_TAKEN: '此暱稱已被使用',
  REGISTRATION_SUCCESS: '註冊成功'
} as const

// 驗證訊息
export const VALIDATION_MESSAGES = {
  NICKNAME_REQUIRED: '暱稱為必填欄位',
  NICKNAME_LENGTH: '暱稱長度必須在1-50字元之間',
  EMAIL_REQUIRED: '電子郵件為必填欄位',
  EMAIL_INVALID: '請輸入有效的電子郵件格式',
  EMAIL_TOO_LONG: '電子郵件長度不能超過255字元',
  PASSWORD_REQUIRED: '密碼為必填欄位',
  PASSWORD_INVALID: '密碼必須至少8字元且包含中英文'
} as const
