/**
 * 課程資料驗證中間件
 * 
 * 使用 Joi 驗證庫進行課程建立和更新的資料驗證
 * 遵循專案統一錯誤回應格式
 */

import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { ValidationMessages } from '@constants/errorMessages'

// 課程建立驗證 Schema
export const createCourseSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': ValidationMessages.COURSE_NAME_REQUIRED,
      'string.min': ValidationMessages.COURSE_NAME_REQUIRED,
      'string.max': ValidationMessages.COURSE_NAME_TOO_LONG,
      'any.required': ValidationMessages.COURSE_NAME_REQUIRED
    }),
  
  content: Joi.string()
    .required()
    .min(1)
    .max(5000)
    .messages({
      'string.empty': ValidationMessages.COURSE_CONTENT_REQUIRED,
      'string.min': ValidationMessages.COURSE_CONTENT_REQUIRED,
      'string.max': ValidationMessages.COURSE_CONTENT_TOO_LONG,
      'any.required': ValidationMessages.COURSE_CONTENT_REQUIRED
    }),

  main_category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': ValidationMessages.MAIN_CATEGORY_INVALID,
      'number.integer': ValidationMessages.MAIN_CATEGORY_INVALID,
      'number.positive': ValidationMessages.MAIN_CATEGORY_INVALID,
      'any.required': ValidationMessages.MAIN_CATEGORY_REQUIRED
    }),

  sub_category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': ValidationMessages.SUB_CATEGORY_INVALID,
      'number.integer': ValidationMessages.SUB_CATEGORY_INVALID,
      'number.positive': ValidationMessages.SUB_CATEGORY_INVALID,
      'any.required': ValidationMessages.SUB_CATEGORY_REQUIRED
    }),

  city_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': ValidationMessages.CITY_INVALID,
      'number.integer': ValidationMessages.CITY_INVALID,
      'number.positive': ValidationMessages.CITY_INVALID,
      'any.required': ValidationMessages.CITY_REQUIRED
    }),

  survey_url: Joi.string()
    .uri()
    .allow('')
    .optional()
    .messages({
      'string.uri': ValidationMessages.SURVEY_URL_INVALID
    }),

  purchase_message: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': ValidationMessages.PURCHASE_MESSAGE_TOO_LONG
    })
})

// 課程更新驗證 Schema（所有欄位都是可選的）
export const updateCourseSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.empty': ValidationMessages.COURSE_NAME_REQUIRED,
      'string.min': ValidationMessages.COURSE_NAME_REQUIRED,
      'string.max': ValidationMessages.COURSE_NAME_TOO_LONG
    }),
  
  content: Joi.string()
    .min(1)
    .max(5000)
    .optional()
    .messages({
      'string.empty': ValidationMessages.COURSE_CONTENT_REQUIRED,
      'string.min': ValidationMessages.COURSE_CONTENT_REQUIRED,
      'string.max': ValidationMessages.COURSE_CONTENT_TOO_LONG
    }),

  main_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': ValidationMessages.MAIN_CATEGORY_INVALID,
      'number.integer': ValidationMessages.MAIN_CATEGORY_INVALID,
      'number.positive': ValidationMessages.MAIN_CATEGORY_INVALID
    }),

  sub_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': ValidationMessages.SUB_CATEGORY_INVALID,
      'number.integer': ValidationMessages.SUB_CATEGORY_INVALID,
      'number.positive': ValidationMessages.SUB_CATEGORY_INVALID
    }),

  city_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': ValidationMessages.CITY_INVALID,
      'number.integer': ValidationMessages.CITY_INVALID,
      'number.positive': ValidationMessages.CITY_INVALID
    }),

  survey_url: Joi.string()
    .uri()
    .allow('')
    .optional()
    .messages({
      'string.uri': ValidationMessages.SURVEY_URL_INVALID
    }),

  purchase_message: Joi.string()
    .max(500)
    .allow('')
    .optional()
    .messages({
      'string.max': ValidationMessages.PURCHASE_MESSAGE_TOO_LONG
    })
})

// 課程 ID 驗證 Schema
export const courseIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須是正數',
      'any.required': '課程 ID 為必填欄位'
    })
})

// 分頁查詢驗證 Schema
export const courseListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.base': '頁碼必須是數字',
      'number.integer': '頁碼必須是整數',
      'number.min': '頁碼必須大於 0'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional()
    .messages({
      'number.base': '每頁數量必須是數字',
      'number.integer': '每頁數量必須是整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    })
})

/**
 * 建立課程驗證中間件
 */
export const validateCreateCourse = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createCourseSchema.validate(req.body, { abortEarly: false })
  
  if (error) {
    const errors: Record<string, string[]> = {}
    
    error.details.forEach(detail => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '資料驗證失敗',
      errors
    })
  }
  
  req.body = value
  next()
}

/**
 * 更新課程驗證中間件
 */
export const validateUpdateCourse = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = updateCourseSchema.validate(req.body, { abortEarly: false })
  
  if (error) {
    const errors: Record<string, string[]> = {}
    
    error.details.forEach(detail => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '資料驗證失敗',
      errors
    })
  }
  
  req.body = value
  next()
}

/**
 * 課程 ID 驗證中間件
 */
export const validateCourseId = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = courseIdSchema.validate({ id: parseInt(req.params.id) })
  
  if (error) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: error.details[0].message
    })
  }
  
  req.params.id = value.id.toString()
  next()
}

/**
 * 課程列表查詢驗證中間件
 */
export const validateCourseListQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = courseListQuerySchema.validate(req.query)
  
  if (error) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: error.details[0].message
    })
  }
  
  req.query = value
  next()
}