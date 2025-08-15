import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { USER_CONFIG, PASSWORD_CONFIG, VALIDATION_MESSAGES, ERROR_MESSAGES } from '../config/constants'
import { ValidationError } from '../types'
import { ResponseFormatter } from '../utils/response-formatter'

/**
 * 請求資料型別
 */
interface RequestData {
  [key: string]: unknown
}

/**
 * 格式化 Joi 驗證錯誤為標準格式
 */
function formatJoiErrors(joiError: Joi.ValidationError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  
  joiError.details.forEach((detail) => {
    const key = detail.path.join('.')
    if (!errors[key]) {
      errors[key] = []
    }
    errors[key].push(detail.message)
  })
  
  return errors
}

/**
 * 通用驗證中間件工廠函式
 */
export const validateRequest = (schema: Joi.Schema, errorMessage?: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    })

    if (error) {
      const formattedErrors = formatJoiErrors(error)
      res.status(400).json(
        ResponseFormatter.validationError(formattedErrors, errorMessage || '參數驗證失敗')
      )
      return
    }

    req.body = value
    next()
  }
}

/**
 * 教師申請驗證 Schema
 */
export const teacherApplicationSchema = Joi.object({
  nationality: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '國籍不能為空',
      'string.min': '國籍至少需要1個字元',
      'string.max': '國籍長度不能超過50個字元',
      'any.required': '國籍為必填欄位'
    }),
  introduction: Joi.string()
    .min(100)
    .max(1000)
    .required()
    .messages({
      'string.empty': '自我介紹不能為空',
      'string.min': '自我介紹至少需要100個字元',
      'string.max': '自我介紹長度不能超過1000個字元',
      'any.required': '自我介紹為必填欄位'
    })
})

/**
 * 教師申請更新驗證 Schema
 */
export const teacherApplicationUpdateSchema = Joi.object({
  nationality: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': '國籍不能為空',
      'string.min': '國籍至少需要1個字元',
      'string.max': '國籍長度不能超過50個字元'
    }),
  introduction: Joi.string()
    .min(100)
    .max(1000)
    .optional()
    .messages({
      'string.empty': '自我介紹不能為空',
      'string.min': '自我介紹至少需要100個字元',
      'string.max': '自我介紹長度不能超過1000個字元'
    })
})

/**
 * 登入請求驗證 Schema
 */
const loginSchema = Joi.object({
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
 * 刷新 Token 請求驗證 Schema
 */
// Refresh Token 驗證 Schema
export const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required().messages({
    'any.required': 'refresh_token 為必填欄位',
    'string.empty': 'refresh_token 不能為空',
    'string.base': 'refresh_token 必須為字串格式'
  })
})

// 忘記密碼驗證規則
const forgotPasswordSchema = Joi.object({
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

// 重設密碼驗證規則
const resetPasswordSchema = Joi.object({
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
    const formattedErrors = formatJoiErrors(error)
    res.status(400).json(
      ResponseFormatter.validationError(formattedErrors, ERROR_MESSAGES.REGISTRATION_FAILED)
    )
    return
  }

  next()
}

/**
 * 驗證登入請求的中間件
 */
export const validateLoginRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false })

  if (error) {
    const formattedErrors = formatJoiErrors(error)
    res.status(400).json(
      ResponseFormatter.validationError(formattedErrors, ERROR_MESSAGES.LOGIN_FAILED)
    )
    return
  }

  next()
}

/**
 * 驗證 Refresh Token 請求
 */
export const validateRefreshTokenRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = refreshTokenSchema.validate(req.body, { abortEarly: false })
  if (error) {
    const validationErrors: ValidationError = {}
    
    error.details.forEach((detail: Joi.ValidationErrorItem) => {
      const field = detail.path[0] as string
      if (!validationErrors[field]) {
        validationErrors[field] = []
      }
      validationErrors[field].push(detail.message)
    })

    res.status(400).json({
      status: 'error',
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: validationErrors
    })
    return
  }

  next()
}

/**
 * 驗證忘記密碼請求
 */
export const validateForgotPasswordRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = forgotPasswordSchema.validate(req.body, { abortEarly: false })

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
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: validationErrors
    })
    return
  }

  next()
}

/**
 * 驗證重設密碼請求
 */
export const validateResetPasswordRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = resetPasswordSchema.validate(req.body, { abortEarly: false })

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
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: validationErrors
    })
    return
  }

  next()
}

/**
 * 更新個人資料請求驗證
 */
export const updateProfileSchema = Joi.object({
  nick_name: Joi.string().min(1).max(50).optional().messages({
    "string.empty": "暱稱不能為空",
    "string.min": "暱稱至少需要1個字元",
    "string.max": "暱稱長度不能超過50個字元"
  }),
  name: Joi.string().max(100).optional().allow(null, "").messages({
    "string.max": "姓名長度不能超過100個字元"
  }),
  birthday: Joi.date().optional().allow(null).messages({
    "date.base": "生日必須是有效的日期格式"
  }),
  contact_phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).max(20).optional().allow(null, "").messages({
    "string.pattern.base": "聯絡電話格式不正確",
    "string.max": "聯絡電話長度不能超過20個字元"
  }),
  avatar_image: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "大頭貼必須是有效的網址"
  })
})

/**
 * 驗證更新個人資料請求
 */
export const validateUpdateProfileRequest = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateProfileSchema.validate(req.body, { abortEarly: false })

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
      status: "error",
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: validationErrors
    })
    return
  }

  next()
}
