/**
 * 價格方案驗證中間件
 * 
 * 提供課程價格方案的資料驗證 Schema
 * - 價格方案建立驗證
 * - 價格方案更新驗證
 * - 業務規則驗證（價格範圍、堂數限制）
 */

import Joi from 'joi'
import { ValidationMessages } from '@constants/Message'
import { PRICE_OPTION_LIMITS, PRICE_OPTION_VALIDATION_MESSAGES } from '@constants/priceOption'

/**
 * 價格方案建立驗證 Schema
 * 
 * 驗證規則：
 * - price: 必填，正數，範圍 1-999999
 * - quantity: 必填，正整數，範圍 1-999
 */
export const priceOptionCreateSchema = Joi.object({
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

/**
 * 價格方案更新驗證 Schema
 * 
 * 更新時允許部分欄位更新：
 * - price: 選填，如提供則驗證範圍
 * - quantity: 選填，如提供則驗證範圍
 */
export const priceOptionUpdateSchema = Joi.object({
  price: Joi.number()
    .positive()
    .min(PRICE_OPTION_LIMITS.MIN_PRICE)
    .max(PRICE_OPTION_LIMITS.MAX_PRICE)
    .precision(2)
    .optional()
    .messages({
      'number.base': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.INVALID,
      'number.positive': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.INVALID,
      'number.min': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.TOO_LOW,
      'number.max': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.TOO_HIGH,
      'number.precision': PRICE_OPTION_VALIDATION_MESSAGES.PRICE.DECIMAL_PLACES
    }),

  quantity: Joi.number()
    .integer()
    .positive()
    .min(PRICE_OPTION_LIMITS.MIN_QUANTITY)
    .max(PRICE_OPTION_LIMITS.MAX_QUANTITY)
    .optional()
    .messages({
      'number.base': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.INVALID,
      'number.integer': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.NOT_INTEGER,
      'number.positive': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.INVALID,
      'number.min': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.TOO_LOW,
      'number.max': PRICE_OPTION_VALIDATION_MESSAGES.QUANTITY.TOO_HIGH
    })
}).min(1) // 至少要有一個欄位進行更新

/**
 * 價格方案 ID 路徑參數驗證 Schema
 */
export const priceOptionIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '價格方案 ID 必須為數字',
      'number.integer': '價格方案 ID 必須為整數',
      'number.positive': '價格方案 ID 必須為正數',
      'any.required': '價格方案 ID 為必填參數'
    })
})

/**
 * 課程 ID 路徑參數驗證 Schema
 */
export const courseIdParamSchema = Joi.object({
  courseId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '課程 ID 必須為數字',
      'number.integer': '課程 ID 必須為整數',
      'number.positive': '課程 ID 必須為正數',
      'any.required': '課程 ID 為必填參數'
    })
})