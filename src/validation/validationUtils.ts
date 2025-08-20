/**
 * 統一的驗證工具和中間件
 * 為購物車與訂單功能提供一致的驗證體驗
 */

import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ERROR_CODES } from '@constants/index'
import { ValidationError, BusinessError } from '@utils/errors'

/**
 * 建立統一的驗證中間件
 * @param schema - Joi 驗證模式
 * @param source - 驗證來源 ('body' | 'params' | 'query')
 * @returns Express 中間件函式
 */
export function validateRequest(schema: Joi.ObjectSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = req[source]
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message)
      throw new ValidationError(ERROR_CODES.VALIDATION_ERROR, '參數驗證失敗', { errors: errorMessages })
    }

    // 將驗證後的值寫回請求物件
    req[source] = value
    next()
  }
}

/**
 * 驗證購物車項目 ID 參數
 */
export const validateCartItemId = (schema: Joi.ObjectSchema) => validateRequest(schema, 'params')

/**
 * 驗證訂單 ID 參數
 */
export const validateOrderId = (schema: Joi.ObjectSchema) => validateRequest(schema, 'params')

/**
 * 驗證購買記錄 ID 參數
 */
export const validatePurchaseId = (schema: Joi.ObjectSchema) => validateRequest(schema, 'params')

/**
 * 驗證查詢參數
 */
export const validateQuery = (schema: Joi.ObjectSchema) => validateRequest(schema, 'query')

/**
 * 驗證請求主體
 */
export const validateBody = (schema: Joi.ObjectSchema) => validateRequest(schema, 'body')

/**
 * 複合驗證中間件產生器
 * 可同時驗證多個來源的資料
 */
export function validateMultiple(validations: { body?: Joi.ObjectSchema; params?: Joi.ObjectSchema; query?: Joi.ObjectSchema }) {
  const middlewares: Array<(req: Request, res: Response, next: NextFunction) => void> = []

  if (validations.body) {
    middlewares.push(validateRequest(validations.body, 'body'))
  }
  if (validations.params) {
    middlewares.push(validateRequest(validations.params, 'params'))
  }
  if (validations.query) {
    middlewares.push(validateRequest(validations.query, 'query'))
  }

  return middlewares
}

/**
 * 統一的參數類型轉換工具
 */
export const convertToNumber = (value: string | number): number => {
  if (typeof value === 'number') return value
  const num = Number(value)
  if (isNaN(num)) {
    throw new BusinessError(ERROR_CODES.VALIDATION_ERROR, '參數必須為數字格式', 400)
  }
  return num
}

/**
 * 統一的布林值轉換工具
 */
export const convertToBoolean = (value: string | boolean): boolean => {
  if (typeof value === 'boolean') return value
  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false
  throw new BusinessError(ERROR_CODES.VALIDATION_ERROR, '參數必須為布林值格式', 400)
}
