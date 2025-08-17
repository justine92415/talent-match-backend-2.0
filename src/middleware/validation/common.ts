import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { Errors } from '@utils/errors'

/**
 * 請求資料型別
 */
export interface RequestData {
  [key: string]: unknown
}

/**
 * 格式化 Joi 驗證錯誤為標準格式
 */
export function formatJoiErrors(joiError: Joi.ValidationError): Record<string, string[]> {
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

/**
 * 通用驗證中間件工廠函式
 */
export function validateRequest(schema: Joi.Schema, errorMessage?: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      })

      if (error) {
        const formattedErrors = formatJoiErrors(error)
        throw Errors.validation(formattedErrors, errorMessage || '參數驗證失敗')
      }

      req.body = value
      next()
    } catch (error) {
      next(error)
    }
  }
}