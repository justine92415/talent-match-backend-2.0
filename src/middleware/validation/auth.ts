import Joi from 'joi'
import { PASSWORD_CONFIG } from '@config/secret'
import { ValidationMessages } from '@constants/errorMessages'

// 使用者設定常數
const USER_CONFIG = {
  NICKNAME_MIN_LENGTH: 1,
  NICKNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100
}

/**
 * 登入請求驗證 Schema
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': ValidationMessages.EMAIL_REQUIRED,
    'string.email': ValidationMessages.EMAIL_INVALID,
    'any.required': ValidationMessages.EMAIL_REQUIRED
  }),

  password: Joi.string().required().messages({
    'string.empty': ValidationMessages.PASSWORD_REQUIRED,
    'any.required': ValidationMessages.PASSWORD_REQUIRED
  })
})

/**
 * 註冊請求驗證 Schema
 */
export const registerSchema = Joi.object({
  nick_name: Joi.string().min(USER_CONFIG.NICKNAME_MIN_LENGTH).max(USER_CONFIG.NICKNAME_MAX_LENGTH).required().messages({
    'string.empty': ValidationMessages.NICKNAME_REQUIRED,
    'string.min': `暱稱至少需要 ${USER_CONFIG.NICKNAME_MIN_LENGTH} 個字元`,
    'string.max': ValidationMessages.NICKNAME_TOO_LONG,
    'any.required': ValidationMessages.NICKNAME_REQUIRED
  }),

  email: Joi.string().email().max(USER_CONFIG.EMAIL_MAX_LENGTH).required().messages({
    'string.empty': ValidationMessages.EMAIL_REQUIRED,
    'string.email': ValidationMessages.EMAIL_INVALID,
    'string.max': `電子郵件長度不能超過 ${USER_CONFIG.EMAIL_MAX_LENGTH} 個字元`,
    'any.required': ValidationMessages.EMAIL_REQUIRED
  }),

  password: Joi.string()
    .required()
    .custom((value, helpers) => {
      // 檢查長度
      if (value.length < PASSWORD_CONFIG.MIN_LENGTH) {
        return helpers.message({ custom: ValidationMessages.PASSWORD_TOO_SHORT })
      }

      // 檢查是否包含中英文
      const hasEnglish = /[a-zA-Z]/.test(value)
      const hasChinese = /[\u4e00-\u9fff]/.test(value)

      if (!hasEnglish && !hasChinese) {
        return helpers.message({ custom: ValidationMessages.PASSWORD_TOO_SHORT })
      }

      return value
    })
    .messages({
      'string.empty': ValidationMessages.PASSWORD_REQUIRED,
      'any.required': ValidationMessages.PASSWORD_REQUIRED
    })
})

/**
 * 刷新 Token 請求驗證 Schema
 */
export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': ValidationMessages.REFRESH_TOKEN_REQUIRED,
    'string.empty': ValidationMessages.REFRESH_TOKEN_EMPTY,
    'string.base': ValidationMessages.REFRESH_TOKEN_INVALID_TYPE
  })
})

/**
 * 忘記密碼驗證規則
 */
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': ValidationMessages.FIELD_INVALID_TYPE('email', '字串'),
      'string.empty': ValidationMessages.EMAIL_EMPTY,
      'string.email': ValidationMessages.EMAIL_INVALID,
      'any.required': ValidationMessages.EMAIL_REQUIRED
    })
})

/**
 * 重設密碼驗證規則
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.base': ValidationMessages.FIELD_INVALID_TYPE('token', '字串'),
      'string.empty': ValidationMessages.RESET_TOKEN_EMPTY,
      'any.required': ValidationMessages.RESET_TOKEN_REQUIRED
    }),
  new_password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': ValidationMessages.NEW_PASSWORD_INVALID_TYPE,
      'string.empty': ValidationMessages.NEW_PASSWORD_EMPTY,
      'string.min': ValidationMessages.NEW_PASSWORD_TOO_SHORT,
      'any.required': ValidationMessages.NEW_PASSWORD_REQUIRED
    })
})