/**
 * 公開課程搜尋驗證中間件
 * 
 * 使用 Joi 驗證庫進行公開課程搜尋和瀏覽的資料驗證
 * 遵循專案統一錯誤回應格式和訊息管理
 */

import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { MESSAGES } from '@constants/Message'
import { Errors, BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'

// 公開課程列表查詢參數驗證 Schema
export const publicCourseQuerySchema = Joi.object({
  // 搜尋方式（互斥）
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
})

// 課程評價查詢參數驗證 Schema
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
})

// 教師課程列表查詢參數驗證 Schema
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
})

/**
 * 公開課程搜尋查詢驗證中間件
 * 包含業務邏輯驗證：搜尋方式互斥、分類搜尋完整性檢查
 */
export function validatePublicCourseQuery(req: Request, res: Response, next: NextFunction): void {
  try {
    // 先進行基本格式驗證
    const { error, value } = publicCourseQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    })

    if (error) {
      const formattedErrors: Record<string, string[]> = {}
      let specificErrorCode = ERROR_CODES.VALIDATION_ERROR as string
      
      error.details.forEach((detail) => {
        const key = detail.path.join('.')
        if (!formattedErrors[key]) {
          formattedErrors[key] = []
        }
        formattedErrors[key].push(detail.message)
        
        // 檢查特定欄位錯誤，設定對應的錯誤代碼
        if (key === 'sort' && detail.type === 'any.only') {
          specificErrorCode = ERROR_CODES.SORT_OPTION_INVALID
        }
      })
      
      // 如果是特定錯誤代碼，使用該欄位的具體訊息
      const errorMessage = specificErrorCode === ERROR_CODES.SORT_OPTION_INVALID 
        ? MESSAGES.VALIDATION.SORT_OPTION_INVALID 
        : MESSAGES.SYSTEM.VALIDATION_ERROR
      
      throw Errors.validationWithCode(specificErrorCode, formattedErrors, errorMessage)
    }

    // 業務邏輯驗證：搜尋方式互斥檢查
    const hasKeyword = !!value.keyword
    const hasCategory = !!(value.main_category_id || value.sub_category_id)

    if (hasKeyword && hasCategory) {
      const formattedErrors = { search: [MESSAGES.VALIDATION.SEARCH_METHODS_EXCLUSIVE] }
      throw Errors.validationWithCode(ERROR_CODES.SEARCH_METHODS_EXCLUSIVE, formattedErrors, MESSAGES.VALIDATION.SEARCH_METHODS_EXCLUSIVE)
    }

    // 分類搜尋完整性檢查
    if (value.main_category_id && !value.sub_category_id) {
      const formattedErrors = { category: [MESSAGES.VALIDATION.CATEGORY_SEARCH_INCOMPLETE] }
      throw Errors.validationWithCode(ERROR_CODES.CATEGORY_SEARCH_INCOMPLETE, formattedErrors, MESSAGES.VALIDATION.CATEGORY_SEARCH_INCOMPLETE)
    }

    if (!value.main_category_id && value.sub_category_id) {
      const formattedErrors = { category: [MESSAGES.VALIDATION.CATEGORY_SEARCH_INCOMPLETE] }
      throw Errors.validationWithCode(ERROR_CODES.CATEGORY_SEARCH_INCOMPLETE, formattedErrors, MESSAGES.VALIDATION.CATEGORY_SEARCH_INCOMPLETE)
    }

    req.query = value
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 課程評價查詢驗證中間件
 */
export function validateCourseReviewQuery(req: Request, res: Response, next: NextFunction): void {
  try {
    const { error, value } = courseReviewQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    })

    if (error) {
      const formattedErrors: Record<string, string[]> = {}
      let specificErrorCode = ERROR_CODES.VALIDATION_ERROR as string
      
      error.details.forEach((detail) => {
        const key = detail.path.join('.')
        if (!formattedErrors[key]) {
          formattedErrors[key] = []
        }
        formattedErrors[key].push(detail.message)
        
        // 檢查特定欄位錯誤，設定對應的錯誤代碼
        if (key === 'rating' && (detail.type === 'number.min' || detail.type === 'number.max')) {
          specificErrorCode = ERROR_CODES.REVIEW_RATING_INVALID
        }
      })
      
      // 如果是特定錯誤代碼，使用該欄位的具體訊息
      const errorMessage = specificErrorCode === ERROR_CODES.REVIEW_RATING_INVALID 
        ? MESSAGES.VALIDATION.REVIEW_RATING_INVALID
        : MESSAGES.SYSTEM.VALIDATION_ERROR
      
      throw Errors.validationWithCode(specificErrorCode, formattedErrors, errorMessage)
    }

    req.query = value
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 教師課程列表查詢驗證中間件
 */
export function validateTeacherCourseQuery(req: Request, res: Response, next: NextFunction): void {
  try {
    const { error, value } = teacherCourseQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    })

    if (error) {
      const formattedErrors: Record<string, string[]> = {}
      error.details.forEach((detail) => {
        const key = detail.path.join('.')
        if (!formattedErrors[key]) {
          formattedErrors[key] = []
        }
        formattedErrors[key].push(detail.message)
      })
      throw Errors.validation(formattedErrors, MESSAGES.SYSTEM.VALIDATION_ERROR)
    }

    req.query = value
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 路徑參數驗證：課程ID
 */
export function validateCourseId(req: Request, res: Response, next: NextFunction): void {
  try {
    const courseId = parseInt(req.params.id, 10)
    
    if (isNaN(courseId) || courseId <= 0) {
      throw new BusinessError(ERROR_CODES.COURSE_ID_INVALID, MESSAGES.VALIDATION.COURSE_ID_INVALID)
    }

    req.params.id = courseId.toString()
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 路徑參數驗證：教師ID
 */
export function validateTeacherId(req: Request, res: Response, next: NextFunction): void {
  try {
    const teacherId = parseInt(req.params.id, 10)
    
    if (isNaN(teacherId) || teacherId <= 0) {
      throw new BusinessError(ERROR_CODES.VALIDATION_ERROR, '教師ID格式不正確')
    }

    req.params.id = teacherId.toString()
    next()
  } catch (error) {
    next(error)
  }
}