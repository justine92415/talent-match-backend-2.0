import crypto from 'crypto'

/**
 * 擴展的 API 回應介面，基於現有的 api.interface.ts
 * 增加 meta 資訊以提供更詳細的回應資料
 */
interface EnhancedApiSuccessResponse<T> {
  status: 'success'
  message?: string
  data: T
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

interface EnhancedApiErrorResponse {
  status: 'error'
  message: string
  errors?: Record<string, string[]>
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PaginatedResponse<T> extends EnhancedApiSuccessResponse<T[]> {
  pagination: PaginationMeta
}

/**
 * 統一回應格式器
 * 
 * 基於現有專案架構提供標準化的 API 回應格式，
 * 與現有的 errorHandler 中間件配合使用。
 */
export class ResponseFormatter {
  private static readonly API_VERSION = '2.0.0'

  /**
   * 產生請求唯一識別碼
   */
  private static generateRequestId(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * 產生回應 metadata
   */
  private static generateMeta() {
    return {
      timestamp: new Date().toISOString(),
      requestId: this.generateRequestId(),
      version: this.API_VERSION
    }
  }

  /**
   * 格式化成功回應
   */
  static success<T>(data: T, message = '操作成功'): EnhancedApiSuccessResponse<T> {
    return {
      status: 'success',
      message,
      data,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化建立成功回應 (201)
   */
  static created<T>(data: T, message = '建立成功'): EnhancedApiSuccessResponse<T> {
    return {
      status: 'success',
      message,
      data,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化錯誤回應
   */
  static error(message: string, errors?: Record<string, string[]>): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      errors,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化驗證錯誤回應 (400)
   */
  static validationError(
    errors: Record<string, string[]>, 
    message = '參數驗證失敗'
  ): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      errors,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化未授權錯誤回應 (401)
   */
  static unauthorized(message = '請先登入'): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化權限不足錯誤回應 (403)
   */
  static forbidden(message = '權限不足，無法執行此操作'): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化資源不存在錯誤回應 (404)
   */
  static notFound(message = '找不到指定的資源'): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化資源衝突錯誤回應 (409)
   */
  static conflict(message = '資源已存在或發生衝突'): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化業務邏輯錯誤回應 (422)
   */
  static businessError(message: string): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化系統錯誤回應 (500)
   */
  static serverError(message = '系統錯誤，請稍後再試'): EnhancedApiErrorResponse {
    return {
      status: 'error',
      message,
      meta: this.generateMeta()
    }
  }

  /**
   * 格式化分頁回應
   */
  static paginated<T>(
    data: T[], 
    pagination: PaginationMeta, 
    message = '查詢成功'
  ): PaginatedResponse<T> {
    return {
      status: 'success',
      message,
      data,
      pagination,
      meta: this.generateMeta()
    }
  }
}