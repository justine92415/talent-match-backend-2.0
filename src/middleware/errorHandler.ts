import { Request, Response, NextFunction } from 'express'
import { 
  AppError, 
  ValidationError, 
  BusinessError, 
  AuthError, 
  SystemError,
  isAppError 
} from '@utils/errors'
import getLogger from '@utils/logger'

const logger = getLogger('ErrorHandler')

/**
 * 標準錯誤回應介面
 */
interface ErrorResponse {
  status: 'error'
  message: string
  error?: {
    code: string
    message: string
  }
  errors?: Record<string, string[]>
}

/**
 * 將單一錯誤訊息格式化為標準 errors 格式
 */
function formatSingleError(code: string, message: string): Record<string, string[]> {
  // 根據錯誤代碼決定錯誤欄位歸類
  const errorFieldMappings: Record<string, string> = {
    // 用戶相關錯誤
    'EMAIL_EXISTS': 'email',
    'NICKNAME_EXISTS': 'nick_name',
    'USER_NOT_FOUND': 'user',
    
    // 認證相關錯誤
    'INVALID_CREDENTIALS': 'credentials',
    'TOKEN_EXPIRED': 'token',
    'INVALID_TOKEN': 'token',
    'TOKEN_INVALID_OR_EXPIRED': 'token',
    'UNAUTHORIZED_ACCESS': 'access',
    
    // 帳戶相關錯誤
    'ACCOUNT_SUSPENDED': 'account',
    
    // 教師相關錯誤
    'APPLICATION_EXISTS': 'application',
    'APPLICATION_NOT_FOUND': 'application',
    'TEACHER_NOT_FOUND': 'teacher',
    
    // 系統相關錯誤
    'INTERNAL_ERROR': 'system',
    'DATABASE_ERROR': 'database',
    'SERVICE_UNAVAILABLE': 'service'
  }

  const fieldName = errorFieldMappings[code] || 'general'
  return { [fieldName]: [message] }
}

/**
 * 全域錯誤處理中間件
 * 
 * 處理所有類型的錯誤並回傳統一格式：
 * - ValidationError: 包含詳細驗證錯誤訊息
 * - BusinessError: 業務邏輯錯誤
 * - AuthError: 認證授權錯誤
 * - SystemError: 系統錯誤
 * - 未知錯誤: 轉換為系統錯誤
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 記錄錯誤資訊
  logger.error('Request failed:', {
    error: error.message,
    code: error.code || 'UNKNOWN',
    type: error.type || 'UNKNOWN',
    stack: error.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    userId: req.user?.userId
  })

  // 如果不是我們的 AppError，轉換為系統錯誤
  if (!isAppError(error)) {
    const systemError = new SystemError(
      'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? error.message : '系統發生內部錯誤'
    )
    
    const response: ErrorResponse = {
      status: 'error',
      message: systemError.message,
      error: {
        code: systemError.code,
        message: systemError.message
      },
      errors: formatSingleError(systemError.code, systemError.message)
    }
    
    res.status(500).json(response)
    return
  }

  // 處理 ValidationError - 使用 details 或格式化單一錯誤
  if (error instanceof ValidationError) {
    const response: ErrorResponse = {
      status: 'error',
      message: error.message,
      error: {
        code: error.code,
        message: error.message
      },
      errors: error.details || formatSingleError(error.code, error.message)
    }
    
    res.status(error.statusCode).json(response)
    return
  }

  // 處理其他 AppError (BusinessError, AuthError, SystemError)
  const response: ErrorResponse = {
    status: 'error',
    message: error.message,
    error: {
      code: error.code,
      message: error.message
    },
    errors: formatSingleError(error.code, error.message)
  }
  
  res.status(error.statusCode).json(response)
}
