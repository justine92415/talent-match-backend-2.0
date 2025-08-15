/**
 * API 成功回應介面
 */
export interface ApiSuccessResponse<T = any> {
  status: 'success'
  data: T
}

/**
 * API 錯誤回應介面
 */
export interface ApiErrorResponse {
  status: 'error'
  error: {
    code: string
    message: string
    details?: any
  }
}

/**
 * API 回應聯合型別
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse