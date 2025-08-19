/**
 * API 成功回應介面
 * 統一的成功回應格式，遵循專案規範
 */
interface ApiSuccessResponse<T> {
  status: 'success'
  message?: string
  data: T
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta
}

/**
 * 處理成功回應
 * 統一的成功回應格式化函數
 */
export function handleSuccess<T>(data: T, message = '操作成功'): ApiSuccessResponse<T> {
  return {
    status: 'success',
    message,
    data
  }
}

/**
 * 處理建立成功回應 (201)
 */
export function handleCreated<T>(data: T, message = '建立成功'): ApiSuccessResponse<T> {
  return {
    status: 'success',
    message,
    data
  }
}

/**
 * 處理分頁回應
 */
export function handlePaginated<T>(
  data: T[], 
  pagination: PaginationMeta, 
  message = '查詢成功'
): PaginatedResponse<T> {
  return {
    status: 'success',
    message,
    data,
    pagination
  }
}