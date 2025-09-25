/**
 * 課程資料驗證 Schemas
 * 
 * 使用 Joi 驗證庫進行課程建立和更新的資料驗證
 * 遵循專案統一錯誤回應格式
 */

import Joi from 'joi'
import { ValidationMessages } from '@constants/Message'

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
    .min(1)
    .max(5000)
    .optional()
    .allow('', null)
    .messages({
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

  city: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': '城市名稱長度不能超過100字元'
    }),

  district: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': '區域名稱長度不能超過100字元'
    }),

  address: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': '地址長度不能超過500字元'
    }),

  survey_url: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.uri': ValidationMessages.SURVEY_URL_INVALID
    }),

  purchase_message: Joi.string()
    .max(500)
    .allow('', null)
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

  city: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': '城市名稱長度不能超過100字元'
    }),

  district: Joi.string()
    .max(100)
    .optional()
    .allow('', null)
    .messages({
      'string.max': '區域名稱長度不能超過100字元'
    }),

  address: Joi.string()
    .max(500)
    .optional()
    .allow('', null)
    .messages({
      'string.max': '地址長度不能超過500字元'
    }),

  survey_url: Joi.string()
    .uri()
    .allow('', null)
    .optional()
    .messages({
      'string.uri': ValidationMessages.SURVEY_URL_INVALID
    }),

  purchase_message: Joi.string()
    .max(500)
    .allow('', null)
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

// 查詢可預約時段參數驗證
export const availableSlotsParamsSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須大於 0',
      'any.required': '課程 ID 是必填的'
    })
})

export const availableSlotsQuerySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      // 檢查日期是否有效
      const date = new Date(value + 'T00:00:00.000Z')
      
      // 檢查是否為有效日期
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      
      // 檢查日期字串是否與實際解析的日期一致（防止如 2025-02-30 這種情況）
      const year = date.getUTCFullYear()
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
      const day = date.getUTCDate().toString().padStart(2, '0')
      const reconstructedDate = `${year}-${month}-${day}`
      
      if (value !== reconstructedDate) {
        return helpers.error('date.invalid')
      }
      
      // 檢查日期不能是過去的日期（可選，根據業務需求決定）
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (date < today) {
        return helpers.error('date.past')
      }
      
      return value
    })
    .required()
    .messages({
      'string.base': '日期必須是字串格式',
      'string.pattern.base': '日期格式不正確，請使用 YYYY-MM-DD 格式',
      'date.invalid': '日期無效，請提供正確的日期',
      'date.past': '不能查詢過去的日期',
      'any.required': '日期是必填的'
    })
})