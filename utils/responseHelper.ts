import { Response } from 'express'

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export class ResponseHelper {
  /**
   * 成功回應
   */
  static success<T>(res: Response, message: string, data?: T, statusCode = 200): void {
    const response: ApiResponse<T> = {
      status: 'success',
      message,
      data
    }
    res.status(statusCode).json(response)
  }

  /**
   * 錯誤回應
   */
  static error(res: Response, message: string, errors?: Record<string, string[]>, statusCode = 400): void {
    const response: ApiResponse = {
      status: 'error',
      message,
      errors
    }
    res.status(statusCode).json(response)
  }

  /**
   * 參數驗證錯誤回應
   */
  static validationError(res: Response, errors: Record<string, string[]>): void {
    this.error(res, '參數驗證失敗', errors, 400)
  }

  /**
   * 未授權回應
   */
  static unauthorized(res: Response, message = '請先登入'): void {
    this.error(res, message, undefined, 401)
  }

  /**
   * 權限不足回應
   */
  static forbidden(res: Response, action: string, resource: string): void {
    this.error(res, `權限不足，無法${action}此${resource}`, undefined, 403)
  }

  /**
   * 資源不存在回應
   */
  static notFound(res: Response, resource: string): void {
    this.error(res, `找不到指定的${resource}`, undefined, 404)
  }

  /**
   * 資源衝突回應
   */
  static conflict(res: Response, message: string): void {
    this.error(res, message, undefined, 409)
  }

  /**
   * 業務邏輯錯誤回應
   */
  static businessError(res: Response, message: string): void {
    this.error(res, message, undefined, 422)
  }

  /**
   * 系統錯誤回應
   */
  static serverError(res: Response, message = '系統錯誤，請稍後再試'): void {
    this.error(res, message, undefined, 500)
  }

  /**
   * 建立成功訊息
   */
  static createSuccessMessage(action: string, resource: string): string {
    return `${action}${resource}成功`
  }

  /**
   * 建立權限錯誤訊息
   */
  static createForbiddenMessage(action: string, resource: string): string {
    return `權限不足，無法${action}此${resource}`
  }
}
