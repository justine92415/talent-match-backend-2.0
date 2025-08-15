import { Response } from 'express'
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/errorMessages'

export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  data?: T
  errors?: Record<string, string[]>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  meta?: Record<string, any>
}

export interface PaginationOptions {
  page: number
  limit: number
  total: number
}

export class ResponseHelper {
  /**
   * 成功回應
   */
  static success<T>(res: Response, message: string, data?: T, statusCode = 200, meta?: Record<string, any>): void {
    const response: ApiResponse<T> = {
      status: 'success',
      message,
      data,
      ...(meta && { meta })
    }
    res.status(statusCode).json(response)
  }

  /**
   * 成功回應 - 使用預定義訊息
   */
  static successWithMessage<T>(res: Response, messageKey: keyof typeof SUCCESS_MESSAGES, data?: T, statusCode = 200): void {
    this.success(res, SUCCESS_MESSAGES[messageKey], data, statusCode)
  }

  /**
   * 分頁資料成功回應
   */
  static successWithPagination<T>(res: Response, message: string, data: T[], pagination: PaginationOptions, meta?: Record<string, any>): void {
    const totalPages = Math.ceil(pagination.total / pagination.limit)

    const response: ApiResponse<T[]> = {
      status: 'success',
      message,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages
      },
      ...(meta && { meta })
    }
    res.status(200).json(response)
  }

  /**
   * 建立成功回應 (201)
   */
  static created<T>(res: Response, message: string, data?: T): void {
    this.success(res, message, data, 201)
  }

  /**
   * 刪除成功回應 (204)
   */
  static deleted(res: Response): void {
    res.status(204).send()
  }

  /**
   * 錯誤回應
   */
  static error(res: Response, message: string, errors?: Record<string, string[]>, statusCode = 400, meta?: Record<string, any>): void {
    const response: ApiResponse = {
      status: 'error',
      message,
      ...(errors && { errors }),
      ...(meta && { meta })
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
  static forbidden(res: Response, message: string): void {
    this.error(res, message, undefined, 403)
  }

  /**
   * 資源不存在回應
   */
  static notFound(res: Response, message: string): void {
    this.error(res, message, undefined, 404)
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
  static serverError(res: Response, message?: string): void {
    this.error(res, message || ERROR_MESSAGES.SYSTEM.INTERNAL_ERROR, undefined, 500)
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

  /**
   * 處理分頁參數
   */
  static processPagination(page?: number, limit?: number): { page: number; limit: number; offset: number } {
    const processedPage = Math.max(1, page || 1)
    const processedLimit = Math.min(100, Math.max(1, limit || 10))
    const offset = (processedPage - 1) * processedLimit

    return {
      page: processedPage,
      limit: processedLimit,
      offset
    }
  }

  /**
   * 格式化排序參數
   */
  static formatOrderBy(sortBy?: string, sortOrder?: 'asc' | 'desc'): Record<string, 'ASC' | 'DESC'> {
    const validSortBy = sortBy || 'createdAt'
    const validSortOrder = (sortOrder || 'desc').toUpperCase() as 'ASC' | 'DESC'

    return { [validSortBy]: validSortOrder }
  }
}
