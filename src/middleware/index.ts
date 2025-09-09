/**
 * 中間件統一匯出
 * 
 * 重構後的中間件系統提供：
 * - 認證中間件 (auth)
 * - Schema 定義 (schemas) 
 * - 錯誤處理中間件 (error)
 */

// 認證中間件
export * from './auth'

// Schema 定義
export * from './schemas'

// 錯誤處理中間件
export * from './error'

// 型別匯出
export type {
  AuthenticatedUser,
  AuthenticatedRequest,
  AdminAuthenticatedRequest,
  FullAuthenticatedRequest,
  ValidationErrorDetails,
  ValidationConfig,
  MiddlewareErrorResponse
} from '@/types/middleware'