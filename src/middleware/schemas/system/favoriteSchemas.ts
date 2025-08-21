/**
 * 收藏功能驗證 Schemas
 * 
 * 純 Schema 定義，使用標準 createValidationMiddleware
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

// 新增收藏請求驗證 Schema
export const addFavoriteSchema = Joi.object({
  course_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'number.integer': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'number.positive': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'any.required': MESSAGES.VALIDATION.COURSE_ID_REQUIRED
    })
})

// 收藏列表查詢參數驗證 Schema
export const favoriteListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .positive()
    .default(1)
    .messages({
      'number.base': MESSAGES.VALIDATION.PAGE_MUST_BE_NUMBER,
      'number.integer': MESSAGES.VALIDATION.PAGE_MUST_BE_INTEGER,
      'number.positive': MESSAGES.VALIDATION.PAGE_MUST_BE_POSITIVE
    }),

  per_page: Joi.number()
    .integer()
    .positive()
    .max(100)
    .default(12)
    .messages({
      'number.base': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_NUMBER,
      'number.integer': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_INTEGER,
      'number.positive': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_POSITIVE,
      'number.max': MESSAGES.VALIDATION.PER_PAGE_TOO_LARGE
    })
})

// 收藏課程ID路徑參數驗證 Schema
export const favoriteCourseIdParamSchema = Joi.object({
  course_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'number.integer': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'number.positive': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'any.required': MESSAGES.VALIDATION.COURSE_ID_REQUIRED
    })
})