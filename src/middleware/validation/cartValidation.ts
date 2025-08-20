/**
 * 購物車驗證中間件
 * 提供購物車相關的請求驗證邏輯
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

// === 購物車項目新增驗證 ===
export const addCartItemBodySchema = Joi.object({
  course_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須大於 0',
      'any.required': '課程 ID 為必填欄位'
    }),
  price_option_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '價格方案 ID 必須是數字',
      'number.integer': '價格方案 ID 必須是整數',
      'number.positive': '價格方案 ID 必須大於 0',
      'any.required': '價格方案 ID 為必填欄位'
    }),
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .default(1)
    .messages({
      'number.base': '數量必須是數字',
      'number.integer': '數量必須是整數',
      'number.min': '數量必須大於 0',
      'number.max': '數量不可超過 999'
    })
})

// === 購物車項目更新驗證 ===
export const updateCartItemBodySchema = Joi.object({
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .required()
    .messages({
      'number.base': '數量必須是數字',
      'number.integer': '數量必須是整數',
      'number.min': '數量必須大於 0',
      'number.max': '數量不可超過 999',
      'any.required': '數量為必填欄位'
    })
})

// === 購物車項目 ID 路徑參數驗證 ===
export const cartItemIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '購物車項目 ID 必須是數字',
      'number.integer': '購物車項目 ID 必須是整數',
      'number.positive': '購物車項目 ID 必須大於 0',
      'any.required': '購物車項目 ID 為必填參數'
    })
})

// === 驗證中間件函式 ===
export const validateAddCartItem = (req: Request, res: Response, next: NextFunction) => {
  const { error } = addCartItemBodySchema.validate(req.body)
  
  if (error) {
    const formattedErrors = formatJoiErrors(error)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }
  
  next()
}

export const validateUpdateCartItem = (req: Request, res: Response, next: NextFunction) => {
  // 驗證路徑參數
  const { error: paramError } = cartItemIdParamSchema.validate({ 
    id: parseInt(req.params.itemId) 
  })
  if (paramError) {
    const formattedErrors = formatJoiErrors(paramError)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }

  // 驗證請求體
  const { error: bodyError } = updateCartItemBodySchema.validate(req.body)
  if (bodyError) {
    const formattedErrors = formatJoiErrors(bodyError)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }
  
  next()
}

export const validateCartItemId = (req: Request, res: Response, next: NextFunction) => {
  const { error } = cartItemIdParamSchema.validate({ 
    id: parseInt(req.params.itemId) 
  })
  
  if (error) {
    const formattedErrors = formatJoiErrors(error)
    return next(Errors.validation(formattedErrors, SystemMessages.VALIDATION_FAILED))
  }
  
  next()
}

// 統一匯出所有 Schema
export const cartSchemas = {
  addCartItemBody: addCartItemBodySchema,
  updateCartItemBody: updateCartItemBodySchema,
  cartItemIdParam: cartItemIdParamSchema
}