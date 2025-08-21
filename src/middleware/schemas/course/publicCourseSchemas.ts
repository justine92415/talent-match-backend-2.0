/**
 * 公開課程搜尋驗證 Schemas
 * 
 * 純 Schema 定義，使用標準 createValidationMiddleware
 * 業務邏輯驗證（搜尋互斥性、分類完整性）交由前端或服務層處理
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

/**
 * 公開課程列表查詢參數驗證 Schema
 * 
 * 注意：複雜業務邏輯驗證（搜尋方式互斥性、分類搜尋完整性）
 * 交由前端或服務層處理，保持驗證層純粹
 */
export const publicCourseQuerySchema = Joi.object({
  // 搜尋方式
  keyword: Joi.string()
    .max(200)
    .optional()
    .messages({
      'string.max': MESSAGES.VALIDATION.SEARCH_QUERY_TOO_LONG
    }),

  main_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': MESSAGES.VALIDATION.MAIN_CATEGORY_INVALID,
      'number.integer': MESSAGES.VALIDATION.MAIN_CATEGORY_INVALID,
      'number.positive': MESSAGES.VALIDATION.MAIN_CATEGORY_INVALID
    }),

  sub_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': MESSAGES.VALIDATION.SUB_CATEGORY_INVALID,
      'number.integer': MESSAGES.VALIDATION.SUB_CATEGORY_INVALID,
      'number.positive': MESSAGES.VALIDATION.SUB_CATEGORY_INVALID
    }),

  // 篩選條件
  city_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': MESSAGES.VALIDATION.CITY_INVALID,
      'number.integer': MESSAGES.VALIDATION.CITY_INVALID,
      'number.positive': MESSAGES.VALIDATION.CITY_INVALID
    }),

  // 排序方式
  sort: Joi.string()
    .valid('newest', 'popular', 'price_low', 'price_high')
    .default('newest')
    .messages({
      'any.only': MESSAGES.VALIDATION.SORT_OPTION_INVALID
    }),

  // 分頁參數
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
}).options({ allowUnknown: false, abortEarly: false })

/**
 * 課程評價查詢參數驗證 Schema
 */
export const courseReviewQuerySchema = Joi.object({
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
    .default(10)
    .messages({
      'number.base': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_NUMBER,
      'number.integer': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_INTEGER,
      'number.positive': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_POSITIVE,
      'number.max': MESSAGES.VALIDATION.PER_PAGE_TOO_LARGE
    }),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.base': MESSAGES.VALIDATION.REVIEW_RATING_INVALID,
      'number.integer': MESSAGES.VALIDATION.REVIEW_RATING_INVALID,
      'number.min': MESSAGES.VALIDATION.REVIEW_RATING_INVALID,
      'number.max': MESSAGES.VALIDATION.REVIEW_RATING_INVALID
    }),

  sort: Joi.string()
    .valid('newest', 'oldest', 'rating_high', 'rating_low')
    .default('newest')
    .messages({
      'any.only': MESSAGES.VALIDATION.REVIEW_SORT_INVALID
    })
}).options({ allowUnknown: false, abortEarly: false })

/**
 * 教師課程列表查詢參數驗證 Schema
 */
export const teacherCourseQuerySchema = Joi.object({
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
}).options({ allowUnknown: false, abortEarly: false })

/**
 * 課程 ID 路徑參數 Schema
 */
export const courseIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'number.integer': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'number.positive': MESSAGES.VALIDATION.COURSE_ID_INVALID,
      'any.required': MESSAGES.VALIDATION.COURSE_ID_REQUIRED
    })
}).options({ allowUnknown: false })

/**
 * 教師 ID 路徑參數 Schema
 */
export const teacherIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': MESSAGES.VALIDATION.RESERVATION_TEACHER_ID_INVALID,
      'number.integer': MESSAGES.VALIDATION.RESERVATION_TEACHER_ID_INVALID,
      'number.positive': MESSAGES.VALIDATION.RESERVATION_TEACHER_ID_INVALID,
      'any.required': MESSAGES.VALIDATION.RESERVATION_TEACHER_ID_REQUIRED
    })
}).options({ allowUnknown: false })