/**
 * 購買記錄驗證中間件
 * 提供購買記錄相關的請求驗證邏輯
 */

import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { Errors } from '@utils/errors'
import { SystemMessages } from '@constants/Message'

// === 輔助函式 ===
function formatJoiErrors(joiError: Joi.ValidationError): Record<string, string[]> {
  const errors: Record<string, string[]> = {}
  
  joiError.details.forEach((detail) => {
    const key = detail.path.join('.')
    if (!errors[key]) {
      errors[key] = []
    }
    errors[key].push(detail.message)
  })
  
  return errors
}

// === 購買記錄使用堂數驗證 ===
export const usePurchaseBodySchema = Joi.object({
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .required()
    .messages({
      'number.base': '使用數量必須是數字',
      'number.integer': '使用數量必須是整數',
      'number.min': '使用數量必須大於 0',
      'number.max': '使用數量不可超過 999',
      'any.required': '使用數量為必填欄位'
    })
})

// === 購買記錄 ID 路徑參數驗證 ===
export const purchaseIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '購買記錄 ID 必須是數字',
      'number.integer': '購買記錄 ID 必須是整數',
      'number.positive': '購買記錄 ID 必須大於 0',
      'any.required': '購買記錄 ID 為必填參數'
    })
})

// === 課程 ID 路徑參數驗證 ===
export const courseIdParamSchema = Joi.object({
  courseId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須大於 0',
      'any.required': '課程 ID 為必填參數'
    })
})

// === 購買記錄列表查詢驗證 ===
export const getPurchaseListQuerySchema = Joi.object({
  course_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須大於 0'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.base': '頁數必須是數字',
      'number.integer': '頁數必須是整數',
      'number.min': '頁數必須大於 0'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .messages({
      'number.base': '每頁筆數必須是數字',
      'number.integer': '每頁筆數必須是整數',
      'number.min': '每頁筆數必須大於 0',
      'number.max': '每頁筆數不可超過 100'
    })
})

// === 驗證中間件函式 ===
export const validateUsePurchase = (req: Request, res: Response, next: NextFunction) => {
  // 驗證路徑參數
  const { error: paramError } = purchaseIdParamSchema.validate({ 
    id: parseInt(req.params.id) 
  })
  if (paramError) {
    const formattedErrors = formatJoiErrors(paramError)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }

  // 驗證請求體
  const { error: bodyError } = usePurchaseBodySchema.validate(req.body)
  if (bodyError) {
    const formattedErrors = formatJoiErrors(bodyError)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }
  
  next()
}

export const validatePurchaseId = (req: Request, res: Response, next: NextFunction) => {
  const { error } = purchaseIdParamSchema.validate({ 
    id: parseInt(req.params.id) 
  })
  
  if (error) {
    const formattedErrors = formatJoiErrors(error)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }
  
  next()
}

export const validateCourseId = (req: Request, res: Response, next: NextFunction) => {
  const { error } = courseIdParamSchema.validate({ 
    courseId: parseInt(req.params.courseId) 
  })
  
  if (error) {
    const formattedErrors = formatJoiErrors(error)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }
  
  next()
}

export const validateGetPurchaseList = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = getPurchaseListQuerySchema.validate(req.query)
  
  if (error) {
    const formattedErrors = formatJoiErrors(error)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }
  
  // 設定處理後的值
  req.query = value
  next()
}

// 統一匯出所有 Schema
export const purchaseSchemas = {
  usePurchaseBody: usePurchaseBodySchema,
  purchaseIdParam: purchaseIdParamSchema,
  courseIdParam: courseIdParamSchema,
  getPurchaseListQuery: getPurchaseListQuerySchema
}