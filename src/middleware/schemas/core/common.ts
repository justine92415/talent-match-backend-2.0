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
 * 
 * @param joiError - Joi 驗證錯誤物件
 * @returns 格式化的錯誤物件
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
 * 驗證單一資料欄位
 * 
 * @param schema - Joi 驗證 Schema
 * @param data - 要驗證的資料
 * @param errorMessage - 自訂錯誤訊息
 * @returns 驗證後的資料
 * @throws ValidationError 當驗證失敗時
 */
export function validateData<T>(
  schema: Joi.Schema,
  data: unknown,
  errorMessage?: string
): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  })

  if (error) {
    const formattedErrors = formatJoiErrors(error)
    throw Errors.validation(formattedErrors, errorMessage || '資料驗證失敗')
  }

  return value as T
}

/**
 * 驗證配置選項
 */
export interface ValidationConfig {
  /** 請求體驗證 Schema */
  body?: Joi.Schema
  /** 路徑參數驗證 Schema */
  params?: Joi.Schema
  /** 查詢參數驗證 Schema */
  query?: Joi.Schema
  /** 請求標頭驗證 Schema */
  headers?: Joi.Schema
  /** 自訂錯誤訊息 */
  errorMessage?: string
}

/**
 * Joi 驗證選項
 */
export const DEFAULT_JOI_OPTIONS: Joi.ValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
  allowUnknown: false
}