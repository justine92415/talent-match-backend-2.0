/**
 * 評價相關驗證 Schema
 * 遵循 TDD 指示文件：統一使用 MESSAGES 常數定義驗證錯誤訊息
 */

import Joi from 'joi'
import { REVIEW_VALIDATION } from '@constants/validation'
import { MESSAGES } from '@constants/Message'

/**
 * 評價提交驗證 Schema
 */
export const reviewCreateSchema = Joi.object({
  reservation_uuid: Joi.string()
    .trim()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.REVIEW.RESERVATION_UUID_REQUIRED,
      'string.uuid': MESSAGES.VALIDATION.REVIEW.RESERVATION_UUID_INVALID,
      'any.required': MESSAGES.VALIDATION.REVIEW.RESERVATION_UUID_REQUIRED
    }),

  rate: Joi.number()
    .integer()
    .min(REVIEW_VALIDATION.RATING.MIN_VALUE)
    .max(REVIEW_VALIDATION.RATING.MAX_VALUE)
    .required()
    .messages({
      'number.base': MESSAGES.VALIDATION.REVIEW.RATING_INVALID,
      'number.integer': MESSAGES.VALIDATION.REVIEW.RATING_INVALID,
      'number.min': `評分必須在 ${REVIEW_VALIDATION.RATING.MIN_VALUE} 到 ${REVIEW_VALIDATION.RATING.MAX_VALUE} 之間`,
      'number.max': `評分必須在 ${REVIEW_VALIDATION.RATING.MIN_VALUE} 到 ${REVIEW_VALIDATION.RATING.MAX_VALUE} 之間`,
      'any.required': MESSAGES.VALIDATION.REVIEW.RATING_REQUIRED
    }),

  comment: Joi.string()
    .trim()
    .min(REVIEW_VALIDATION.CONTENT.MIN_LENGTH)
    .max(REVIEW_VALIDATION.CONTENT.MAX_LENGTH)
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.REVIEW.CONTENT_REQUIRED,
      'string.min': `評價內容至少需要 ${REVIEW_VALIDATION.CONTENT.MIN_LENGTH} 個字元`,
      'string.max': `評價內容不能超過 ${REVIEW_VALIDATION.CONTENT.MAX_LENGTH} 個字元`,
      'any.required': MESSAGES.VALIDATION.REVIEW.CONTENT_REQUIRED
    })
})

/**
 * 課程評價查詢參數驗證 Schema
 */
export const courseReviewsQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
      'number.integer': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
      'number.min': MESSAGES.VALIDATION.COMMON.PAGE_INVALID
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
      'number.integer': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
      'number.min': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
      'number.max': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID
    }),

  rating: Joi.number()
    .integer()
    .min(REVIEW_VALIDATION.RATING.MIN_VALUE)
    .max(REVIEW_VALIDATION.RATING.MAX_VALUE)
    .optional()
    .messages({
      'number.base': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
      'number.integer': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
      'number.min': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
      'number.max': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID
    }),

  sort_by: Joi.string()
    .valid('created_at', 'rating')
    .default('created_at')
    .messages({
      'any.only': MESSAGES.VALIDATION.COMMON.SORT_BY_INVALID
    }),

  sort_order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': MESSAGES.VALIDATION.COMMON.SORT_ORDER_INVALID
    })
})

/**
 * 課程 UUID 路徑參數驗證 Schema
 */
export const courseUuidParamSchema = Joi.object({
  uuid: Joi.string()
    .trim()
    .uuid({ version: 'uuidv4' })
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.COMMON.COURSE_UUID_REQUIRED,
      'string.uuid': MESSAGES.VALIDATION.COMMON.COURSE_UUID_INVALID,
      'any.required': MESSAGES.VALIDATION.COMMON.COURSE_UUID_REQUIRED
    })
})