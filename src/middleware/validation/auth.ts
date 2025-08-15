import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { USER_CONFIG, PASSWORD_CONFIG, VALIDATION_MESSAGES, ERROR_MESSAGES } from '../../config/constants'
import { ValidationError } from '../../types'
import { ResponseFormatter } from '../../utils/response-formatter'
import { formatJoiErrors } from './common'

/**
 * 登入請求驗證 Schema
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': VALIDATION_MESSAGES.EMAIL_REQUIRED,
    'string.email': VALIDATION_MESSAGES.EMAIL_INVALID,
    'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED
  }),

  password: Joi.string().required().messages({
    'string.empty': VALIDATION_MESSAGES.PASSWORD_REQUIRED,
    'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED
  })
})

/**
 * 註冊請求驗證 Schema
 */
export const registerSchema = Joi.object({
  nick_name: Joi.string().min(USER_CONFIG.NICKNAME_MIN_LENGTH).max(USER_CONFIG.NICKNAME_MAX_LENGTH).required().messages({
    'string.empty': VALIDATION_MESSAGES.NICKNAME_REQUIRED,
    'string.min': VALIDATION_MESSAGES.NICKNAME_LENGTH,
    'string.max': VALIDATION_MESSAGES.NICKNAME_LENGTH,
    'any.required': VALIDATION_MESSAGES.NICKNAME_REQUIRED
  }),

  email: Joi.string().email().max(USER_CONFIG.EMAIL_MAX_LENGTH).required().messages({
    'string.empty': VALIDATION_MESSAGES.EMAIL_REQUIRED,
    'string.email': VALIDATION_MESSAGES.EMAIL_INVALID,
    'string.max': VALIDATION_MESSAGES.EMAIL_TOO_LONG,
    'any.required': VALIDATION_MESSAGES.EMAIL_REQUIRED
  }),

  password: Joi.string()
    .required()
    .custom((value, helpers) => {
      // 檢查長度
      if (value.length < PASSWORD_CONFIG.MIN_LENGTH) {
        return helpers.message({ custom: VALIDATION_MESSAGES.PASSWORD_INVALID })
      }

      // 檢查是否包含中英文
      const hasEnglish = /[a-zA-Z]/.test(value)
      const hasChinese = /[\u4e00-\u9fff]/.test(value)

      if (!hasEnglish && !hasChinese) {
        return helpers.message({ custom: VALIDATION_MESSAGES.PASSWORD_INVALID })
      }

      return value
    })
    .messages({
      'string.empty': VALIDATION_MESSAGES.PASSWORD_REQUIRED,
      'any.required': VALIDATION_MESSAGES.PASSWORD_REQUIRED
    })
})

/**
 * 刷新 Token 請求驗證 Schema
 */
export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': 'refresh_token 為必填欄位',
    'string.empty': 'refresh_token 不能為空',
    'string.base': 'refresh_token 必須為字串格式'
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
      'string.base': 'email 必須為字串格式',
      'string.empty': 'email 不能為空',
      'string.email': 'email 格式不正確',
      'any.required': 'email 為必填欄位'
    })
})

/**
 * 重設密碼驗證規則
 */
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.base': 'token 必須為字串格式',
      'string.empty': '重設令牌不能為空',
      'any.required': '重設令牌為必填欄位'
    }),
  new_password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.base': '新密碼必須為字串格式',
      'string.empty': '新密碼不能為空',
      'string.min': '密碼至少需要 8 個字元',
      'any.required': '新密碼為必填欄位'
    })
})