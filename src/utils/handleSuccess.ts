import crypto from 'crypto'

/**
 * API 成功回應介面
 * 統一的成功回應格式，包含 meta 資訊
 */
interface ApiSuccessResponse<T> {
  status: 'success'
  message?: string
  data: T
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

interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta
}

const API_VERSION = '2.0.0'

/**
 * 產生請求唯一識別碼
 */
function generateRequestId(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * 產生回應 metadata
 */
function generateMeta() {
  return {
    timestamp: new Date().toISOString(),
    requestId: generateRequestId(),
    version: API_VERSION
  }
}

/**
 * 處理成功回應
 * 統一的成功回應格式化函數
 */
export function handleSuccess<T>(data: T, message = '操作成功'): ApiSuccessResponse<T> {
  return {
    status: 'success',
    message,
    data,
    meta: generateMeta()
  }
}

/**
 * 處理建立成功回應 (201)
 */
export function handleCreated<T>(data: T, message = '建立成功'): ApiSuccessResponse<T> {
  return {
    status: 'success',
    message,
    data,
    meta: generateMeta()
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
    pagination,
    meta: generateMeta()
  }
}