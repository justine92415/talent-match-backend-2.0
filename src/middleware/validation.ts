import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { USER_CONFIG, PASSWORD_CONFIG, VALIDATION_MESSAGES, ERROR_MESSAGES } from '../config/constants'

export interface ValidationError {
  [key: string]: string[]
}

/**
 * 註冊請求驗證 Schema
 */
const registerSchema = Joi.object({
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
 * 驗證註冊請求的中間件
 */
export const validateRegisterRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false })

  if (error) {
    const validationErrors: ValidationError = {}

    error.details.forEach(detail => {
      const field = detail.path[0] as string
      if (!validationErrors[field]) {
        validationErrors[field] = []
      }
      validationErrors[field].push(detail.message)
    })

    res.status(400).json({
      status: 'error',
      message: ERROR_MESSAGES.REGISTRATION_FAILED,
      errors: validationErrors
    })
    return
  }

  next()
}
