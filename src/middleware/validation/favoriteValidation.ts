/**
 * 收藏功能驗證中間件
 * 
 * 使用 Joi 驗證庫進行收藏功能的資料驗證
 * 遵循專案統一錯誤回應格式和訊息管理
 */

import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { MESSAGES } from '@constants/Message'
import { Errors, BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'

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

/**
 * 新增收藏驗證中間件
 */
export function validateAddFavorite(req: Request, res: Response, next: NextFunction): void {
  try {
    const { error, value } = addFavoriteSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    })

    if (error) {
      // 檢查是否為課程ID格式錯誤
      const courseIdError = error.details.find(detail => 
        detail.path.includes('course_id') && 
        ['number.base', 'number.integer', 'number.positive'].includes(detail.type)
      )
      
      if (courseIdError) {
        throw new BusinessError(ERROR_CODES.COURSE_ID_INVALID, MESSAGES.VALIDATION.COURSE_ID_INVALID, 400)
      }

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

    req.body = value
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 收藏列表查詢驗證中間件
 */
export function validateFavoriteListQuery(req: Request, res: Response, next: NextFunction): void {
  try {
    const { error, value } = favoriteListQuerySchema.validate(req.query, {
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
 * 路徑參數驗證：收藏的課程ID（用於移除收藏）
 */
export function validateFavoriteCourseId(req: Request, res: Response, next: NextFunction): void {
  try {
    const courseId = parseInt(req.params.course_id, 10)
    
    if (isNaN(courseId) || courseId <= 0) {
      throw new BusinessError(ERROR_CODES.COURSE_ID_INVALID, MESSAGES.VALIDATION.COURSE_ID_INVALID, 400)
    }

    req.params.course_id = courseId.toString()
    next()
  } catch (error) {
    next(error)
  }
}