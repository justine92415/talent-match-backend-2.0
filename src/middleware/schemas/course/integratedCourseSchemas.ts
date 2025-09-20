/**
 * 整合課程建立驗證中間件
 * 
 * 專門處理 multipart/form-data 格式的課程建立請求
 * 支援同時處理課程資料、價格方案和圖片上傳
 */

import Joi from 'joi'
import { ValidationMessages } from '@constants/Message'
import { PRICE_OPTION_LIMITS, PRICE_OPTION_VALIDATION_MESSAGES } from '@constants/priceOption'

/**
 * 課程資料驗證 Schema
 * 
 * 對應 multipart form 中的 courseData JSON 字串
 */
export const courseDataSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': ValidationMessages.COURSE_NAME_REQUIRED,
      'string.min': ValidationMessages.COURSE_NAME_REQUIRED,
      'string.max': ValidationMessages.COURSE_NAME_TOO_LONG,
      'any.required': ValidationMessages.COURSE_NAME_REQUIRED
    }),

  content: Joi.string()
    .trim()
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

/**
 * 價格方案陣列驗證 Schema
 * 
 * 對應 multipart form 中的 priceOptions JSON 陣列字串
 */
export const priceOptionsArraySchema = Joi.array()
  .items(
    Joi.object({
      price: Joi.number()
        .positive()
        .min(PRICE_OPTION_LIMITS.MIN_PRICE)
        .max(PRICE_OPTION_LIMITS.MAX_PRICE)
        .precision(2)
        .required()
        .messages({
          'number.base': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.INVALID,
          'number.positive': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.INVALID,
          'number.min': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.TOO_LOW,
          'number.max': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.TOO_HIGH,
          'number.precision': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.DECIMAL_PLACES,
          'any.required': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.REQUIRED
        }),

      quantity: Joi.number()
        .integer()
        .positive()
        .min(PRICE_OPTION_LIMITS.MIN_QUANTITY)
        .max(PRICE_OPTION_LIMITS.MAX_QUANTITY)
        .required()
        .messages({
          'number.base': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.INVALID,
          'number.integer': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.NOT_INTEGER,
          'number.positive': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.INVALID,
          'number.min': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.TOO_LOW,
          'number.max': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.TOO_HIGH,
          'any.required': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.REQUIRED
        })
    })
  )
  .min(1) // 至少要有一個價格方案
  .max(10) // 最多 10 個價格方案
  .unique('price') // 價格不能重複
  .unique('quantity') // 堂數不能重複
  .required()
  .messages({
    'array.min': '課程必須至少有一個價格方案',
    'array.max': '課程最多只能有 10 個價格方案',
    'array.unique': '價格方案的價格和堂數不能重複',
    'any.required': '價格方案為必填欄位'
  })

/**
 * 整合課程建立驗證 Schema
 * 
 * 驗證經過 formidable 處理後的請求資料結構
 * 包含：courseData, priceOptions, courseImage (可選)
 */
export const integratedCourseCreateSchema = Joi.object({
  // 課程基本資料（來自 courseData JSON）
  name: courseDataSchema.extract('name'),
  content: courseDataSchema.extract('content'), 
  main_category_id: courseDataSchema.extract('main_category_id'),
  sub_category_id: courseDataSchema.extract('sub_category_id'),
  city: courseDataSchema.extract('city'),
  district: courseDataSchema.extract('district'),
  address: courseDataSchema.extract('address'),
  survey_url: courseDataSchema.extract('survey_url'),
  purchase_message: courseDataSchema.extract('purchase_message'),
  
  // 價格方案陣列（來自 priceOptions JSON）
  priceOptions: priceOptionsArraySchema
})

/**
 * JSON 格式驗證輔助函式
 * 
 * 驗證 formidable 解析前的原始 JSON 字串格式
 */
export const validateJsonString = (jsonString: string, fieldName: string) => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error(`${fieldName} 格式錯誤：必須為有效的 JSON 格式`)
  }
}

/**
 * 課程圖片檔案驗證常數
 * 
 * 從 courseImageUpload.ts middleware 引用的驗證規則
 */
export const COURSE_IMAGE_VALIDATION = {
  REQUIRED: false, // 課程圖片是可選的
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const,
  FIELD_NAME: 'courseImage'
} as const