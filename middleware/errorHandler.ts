import { Request, Response, NextFunction } from 'express'
import { ResponseHelper } from '../utils/responseHelper'

export interface AppError extends Error {
  statusCode?: number
  errors?: Record<string, string[]>
}

/**
 * 全域錯誤處理中間件
 */
export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error('Error:', err)

  // 參數驗證錯誤
  if (err.name === 'ValidationError') {
    // 檢查是否為權限錯誤
    if (err.errors && err.errors.permission) {
      ResponseHelper.error(res, err.errors.permission[0], undefined, 403)
      return
    }
    ResponseHelper.validationError(res, err.errors || {})
    return
  }

  // 未授權錯誤
  if (err.name === 'UnauthorizedError' || err.statusCode === 401) {
    ResponseHelper.unauthorized(res, err.message)
    return
  }

  // 權限不足錯誤
  if (err.name === 'ForbiddenError' || err.statusCode === 403) {
    ResponseHelper.error(res, err.message, undefined, 403)
    return
  }

  // 資源不存在錯誤
  if (err.name === 'NotFoundError' || err.statusCode === 404) {
    ResponseHelper.error(res, err.message, undefined, 404)
    return
  }

  // 資源衝突錯誤
  if (err.name === 'ConflictError' || err.statusCode === 409) {
    ResponseHelper.conflict(res, err.message)
    return
  }

  // 業務邏輯錯誤
  if (err.name === 'BusinessError' || err.statusCode === 422) {
    ResponseHelper.businessError(res, err.message)
    return
  }

  // 預設系統錯誤
  ResponseHelper.serverError(res)
}

/**
 * 建立自訂錯誤類別
 */
export class ValidationError extends Error {
  public errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('參數驗證失敗')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export class UnauthorizedError extends Error {
  constructor(message = '請先登入') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(action: string, resource: string) {
    super(`權限不足，無法${action}此${resource}`)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`找不到指定的${resource}`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictError'
  }
}

export class BusinessError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BusinessError'
  }
}
