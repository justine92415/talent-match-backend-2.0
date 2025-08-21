import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { ValidationConfig, validateData, DEFAULT_JOI_OPTIONS } from './common'

/**
 * 建立驗證中間件工廠函式
 * 
 * 統一處理 body、params、query 和 headers 的驗證邏輯
 * 
 * @param config 驗證配置
 * @returns Express 中間件函式
 * 
 * @example
 * ```typescript
 * const validateLogin = createSchemasMiddleware({
 *   body: loginSchema,
 *   errorMessage: '登入資料驗證失敗'
 * })
 * 
 * router.post('/login', validateLogin, controller.login)
 * ```
 */
export function createSchemasMiddleware(config: ValidationConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 驗證請求體
      if (config.body) {
        req.body = validateData(
          config.body,
          req.body,
          config.errorMessage || '參數驗證失敗'
        )
      }

      // 驗證路徑參數
      if (config.params) {
        req.params = validateData(
          config.params,
          req.params,
          config.errorMessage || '參數驗證失敗'
        )
      }

      // 驗證查詢參數
      if (config.query) {
        req.query = validateData(
          config.query,
          req.query,
          config.errorMessage || '參數驗證失敗'
        )
      }

      // 驗證請求標頭
      if (config.headers) {
        req.headers = validateData(
          config.headers,
          req.headers,
          config.errorMessage || '參數驗證失敗'
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * 快速建立單一欄位驗證中間件（向後相容）
 * 
 * @param schema 驗證 Schema
 * @param errorMessage 自訂錯誤訊息
 * @returns Express 中間件函式
 * 
 * @deprecated 建議使用 createSchemasMiddleware 以獲得更好的靈活性
 */
export function validateRequest(schema: Joi.Schema, errorMessage?: string) {
  return createSchemasMiddleware({
    body: schema,
    errorMessage: errorMessage || '參數驗證失敗'  // 保持向後相容的錯誤訊息
  })
}

/**
 * 建立參數驗證中間件
 * 
 * @param schema 參數驗證 Schema
 * @param errorMessage 自訂錯誤訊息
 * @returns Express 中間件函式
 */
export function validateParams(schema: Joi.Schema, errorMessage?: string) {
  return createSchemasMiddleware({
    params: schema,
    errorMessage
  })
}

/**
 * 建立查詢參數驗證中間件
 * 
 * @param schema 查詢參數驗證 Schema
 * @param errorMessage 自訂錯誤訊息
 * @returns Express 中間件函式
 */
export function validateQuery(schema: Joi.Schema, errorMessage?: string) {
  return createSchemasMiddleware({
    query: schema,
    errorMessage
  })
}