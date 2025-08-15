/**
 * API 成功回應介面
 */
export interface ApiSuccessResponse<T = unknown> {
  status: 'success'
  data: T
}

/**
 * 錯誤詳細資訊型別
 */
export interface ErrorDetails {
  [field: string]: string[]
}

/**
 * API 錯誤回應介面
 */
export interface ApiErrorResponse {
  status: 'error'
  error: {
    code: string
    message: string
    details?: ErrorDetails
  }
}

/**
 * API 回應聯合型別
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse