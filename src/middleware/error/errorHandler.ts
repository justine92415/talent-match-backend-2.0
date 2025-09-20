import { Request, Response, NextFunction } from 'express'
import { 
  AppError, 
  ValidationError, 
  SystemError,
  isAppError 
} from '@utils/errors'
import getLogger from '@utils/logger'

const logger = getLogger('ErrorHandler')

/**
 * 錯誤回應介面
 * 
 * @interface ErrorResponse
 * @property {string} status - 固定為 'error'
 * @property {string} code - 錯誤代碼
 * @property {string} message - 錯誤訊息
 * @property {Record<string, string[]>} [errors] - 驗證錯誤詳情（可選）
 */
interface ErrorResponse {
  status: 'error'
  code: string
  message: string
  errors?: Record<string, string[]>  // 只在驗證錯誤時存在
}

/**
 * 建立錯誤回應物件
 * 
 * @param error - AppError 實例
 * @param errors - 驗證錯誤詳情（可選）
 * @returns 錯誤回應物件
 */
function createErrorResponse(error: AppError, errors?: Record<string, string[]>): ErrorResponse {
  const response: ErrorResponse = {
    status: 'error',
    code: error.code,
    message: error.message
  }

  if (errors) {
    response.errors = errors
  }

  return response
}

/**
 * 全域錯誤處理中間件
 * 
 * 統一處理所有錯誤並回傳格式：
 * - 一般錯誤：{ status: 'error', code, message }
 * - 驗證錯誤：{ status: 'error', code, message, errors? }
 * 
 * 格式特點：
 * - 使用 status: 'error' 標記錯誤回應
 * - 使用 code 欄位作為錯誤代碼
 * - errors 欄位只在驗證錯誤且有 details 時存在
 * - 回應結構符合 API 規範
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 記錄錯誤資訊供調試使用
  logger.error('Request failed:', undefined)

  // 處理非 AppError：轉換為系統錯誤
  if (!isAppError(error)) {
    const systemError = new SystemError(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error.message : '系統發生內部錯誤'
    )
    
    const response = createErrorResponse(systemError)
    res.status(500).json(response)
    return
  }

  // 處理 ValidationError：只在有 details 時包含 errors 欄位
  if (error instanceof ValidationError) {
    const response = createErrorResponse(error, error.details)
    res.status(error.statusCode).json(response)
    return
  }

  // 處理其他 AppError：使用簡潔格式
  const response = createErrorResponse(error)
  res.status(error.statusCode).json(response)
}
