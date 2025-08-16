import { Request, Response, NextFunction } from 'express';
import { BusinessError, UserError, ValidationError } from '@core/errors/BusinessError';
import { ERROR_MESSAGES } from '@config/constants';
import { TEACHER_ERROR_MESSAGES } from '@constants/teacher';
import { ResponseFormatter } from '@utils/response-formatter';
import { ApiErrorResponseWithDetails } from '@models/index';
import getLogger from '@utils/logger';

const logger = getLogger('ErrorHandler');

/**
 * 錯誤物件介面
 */
interface ErrorObject {
  message?: string
  stack?: string
  name?: string
  statusCode?: number
  details?: Record<string, unknown>
}

/**
 * 將業務錯誤代碼映射到標準 HTTP 錯誤代碼
 */
function mapErrorCode(businessCode: string): string {
  switch (businessCode) {
    case 'ROLE_FORBIDDEN':
      return 'FORBIDDEN'
    case 'WORK_EXPERIENCE_NOT_FOUND':
    case 'LEARNING_EXPERIENCE_NOT_FOUND':
    case 'CERTIFICATE_NOT_FOUND':
    case 'APPLICATION_NOT_FOUND':
    case 'TEACHER_NOT_FOUND':
    case 'USER_NOT_FOUND':
      return 'NOT_FOUND'
    case 'DUPLICATE_APPLICATION':
      return 'CONFLICT'
    case 'ACCOUNT_INACTIVE':
      return 'UNAUTHORIZED'
    default:
      return businessCode // 保留原始代碼
  }
}

/**
 * 全域錯誤處理中間件
 * 
 * 處理從控制器傳遞過來的錯誤，包括：
 * - 業務邏輯錯誤 (BusinessError)
 * - 系統錯誤
 * - 未知錯誤
 */
export const errorHandler = (
  error: ErrorObject,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 記錄錯誤日誌
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // 處理業務邏輯錯誤
  if (error instanceof BusinessError) {
    const errorResponse = {
      status: 'error' as const,
      message: getErrorMessage(error), // 添加根層級的 message
      error: {
        code: mapErrorCode(error.code),
        message: getErrorMessage(error)
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(2, 15),
        version: '2.0.0'
      }
    };
    
    // 添加詳細錯誤資訊
    if (error instanceof ValidationError) {
      (errorResponse as ApiErrorResponseWithDetails).errors = error.errors;
    } else {
      (errorResponse as ApiErrorResponseWithDetails).errors = formatBusinessError(error);
    }
    
    res.status(error.statusCode).json(errorResponse);
    return;
  }

  // 處理其他已知錯誤類型
  if (error.name === 'ValidationError') {
    const errorDetails = error.details as Record<string, string[]> | undefined
    res.status(400).json(
      ResponseFormatter.validationError(
        errorDetails || {},
        ERROR_MESSAGES.VALIDATION_ERROR
      )
    );
    return;
  }

  // 處理未知錯誤
  const serverErrorResponse = ResponseFormatter.serverError(ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
  if (process.env.NODE_ENV === 'development') {
    serverErrorResponse.errors = { details: [error.message || '未知錯誤'] };
  }
  
  res.status(500).json(serverErrorResponse);
};

/**
 * 根據錯誤類型獲取適當的錯誤訊息
 */
function getErrorMessage(error: BusinessError): string {
  // 先檢查教師相關錯誤訊息
  if (error.code in TEACHER_ERROR_MESSAGES) {
    return TEACHER_ERROR_MESSAGES[error.code as keyof typeof TEACHER_ERROR_MESSAGES];
  }
  
  // 處理使用者相關錯誤
  if (error instanceof UserError) {
    switch (error.code) {
      case 'EMAIL_EXISTS':
      case 'NICKNAME_EXISTS':
        return ERROR_MESSAGES.REGISTRATION_FAILED;
      case 'ACCOUNT_SUSPENDED':
        return '帳號已停用';
      default:
        return error.message; // 直接返回原始錯誤訊息
    }
  }
  
  return error.message;
}

/**
 * 格式化業務錯誤為前端需要的格式
 */
function formatBusinessError(error: BusinessError): Record<string, string[]> {
  if (error instanceof UserError) {
    switch (error.code) {
      case 'EMAIL_EXISTS':
        return { email: [error.message] };
      case 'NICKNAME_EXISTS':
        return { nick_name: [error.message] };
      case 'INVALID_CREDENTIALS':
        return { credentials: [error.message] };
      case 'ACCOUNT_SUSPENDED':
        return { account: [error.message] };
      default:
        return { general: [error.message] };
    }
  }
  
  // 處理其他 BusinessError
  switch (error.code) {
    case 'INVALID_TOKEN':
      return { token: [error.message] };
    default:
      return { general: [error.message] };
  }
}