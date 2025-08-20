/**
 * 評價系統驗證規則
 * 
 * 定義所有評價相關 API 的輸入驗證規則
 * 遵循 TDD 指示文件：統一使用 MESSAGES 常數
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

/**
 * 提交評價驗證規則
 */
export const submitReviewSchema = Joi.object({
  reservation_uuid: Joi.string().uuid().required().messages({
    'string.empty': MESSAGES.VALIDATION.REVIEW.RESERVATION_UUID_REQUIRED,
    'string.uuid': MESSAGES.VALIDATION.REVIEW.RESERVATION_UUID_INVALID,
    'any.required': MESSAGES.VALIDATION.REVIEW.RESERVATION_UUID_REQUIRED
  }),
  
  rate: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': MESSAGES.VALIDATION.REVIEW.RATING_INVALID,
    'number.integer': MESSAGES.VALIDATION.REVIEW.RATING_INVALID,
    'number.min': MESSAGES.VALIDATION.REVIEW.RATING_INVALID,
    'number.max': MESSAGES.VALIDATION.REVIEW.RATING_INVALID,
    'any.required': MESSAGES.VALIDATION.REVIEW.RATING_REQUIRED
  }),
  
  comment: Joi.string().min(1).max(500).required().messages({
    'string.empty': MESSAGES.VALIDATION.REVIEW.CONTENT_REQUIRED,
    'string.min': MESSAGES.VALIDATION.REVIEW.CONTENT_REQUIRED,
    'string.max': '評價內容不能超過500個字符',
    'any.required': MESSAGES.VALIDATION.REVIEW.CONTENT_REQUIRED
  })
})

/**
 * 課程評價查詢驗證規則
 */
export const courseReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
    'number.integer': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
    'number.min': MESSAGES.VALIDATION.COMMON.PAGE_INVALID
  }),
  
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.integer': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.min': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.max': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID
  }),
  
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
    'number.integer': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
    'number.min': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
    'number.max': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID
  }),
  
  sort_by: Joi.string().valid('created_at', 'rating').default('created_at').messages({
    'any.only': MESSAGES.VALIDATION.COMMON.SORT_BY_INVALID
  }),
  
  sort_order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': MESSAGES.VALIDATION.COMMON.SORT_ORDER_INVALID
  })
})

/**
 * 我的評價查詢驗證規則
 */
export const myReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
    'number.integer': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
    'number.min': MESSAGES.VALIDATION.COMMON.PAGE_INVALID
  }),
  
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.integer': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.min': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.max': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID
  }),
  
  course_id: Joi.number().integer().min(1).optional().messages({
    'number.base': '課程ID必須是數字',
    'number.integer': '課程ID必須是整數',
    'number.min': '課程ID必須大於0'
  }),
  
  sort_by: Joi.string().valid('created_at', 'rating').default('created_at').messages({
    'any.only': MESSAGES.VALIDATION.COMMON.SORT_BY_INVALID
  }),
  
  sort_order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': MESSAGES.VALIDATION.COMMON.SORT_ORDER_INVALID
  })
})

/**
 * 收到的評價查詢驗證規則 (教師用)
 */
export const receivedReviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
    'number.integer': MESSAGES.VALIDATION.COMMON.PAGE_INVALID,
    'number.min': MESSAGES.VALIDATION.COMMON.PAGE_INVALID
  }),
  
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.integer': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.min': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.max': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID
  }),
  
  course_id: Joi.number().integer().min(1).optional().messages({
    'number.base': '課程ID必須是數字',
    'number.integer': '課程ID必須是整數',
    'number.min': '課程ID必須大於0'
  }),
  
  rating: Joi.number().integer().min(1).max(5).optional().messages({
    'number.base': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
    'number.integer': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
    'number.min': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID,
    'number.max': MESSAGES.VALIDATION.REVIEW.RATING_FILTER_INVALID
  }),
  
  sort_by: Joi.string().valid('created_at', 'rating').default('created_at').messages({
    'any.only': MESSAGES.VALIDATION.COMMON.SORT_BY_INVALID
  }),
  
  sort_order: Joi.string().valid('asc', 'desc').default('desc').messages({
    'any.only': MESSAGES.VALIDATION.COMMON.SORT_ORDER_INVALID
  })
})

/**
 * 課程UUID參數驗證規則
 */
export const courseUuidParamsSchema = Joi.object({
  uuid: Joi.string().uuid().required().messages({
    'string.empty': '課程UUID不能為空',
    'string.uuid': '課程UUID格式不正確',
    'any.required': '課程UUID是必填項目'
  })
})