/**
 * 錯誤處理中間件統一匯出
 */

// 匯出錯誤處理中間件
export { errorHandler } from './errorHandler'

// 重新匯出錯誤相關型別以便使用
export type { MiddlewareErrorResponse } from '@/types/middleware'