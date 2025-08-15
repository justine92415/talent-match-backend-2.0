import { Request, Response, NextFunction } from 'express';
import { BusinessError, UserError } from '../core/errors/BusinessError';
import { ERROR_MESSAGES } from '../config/constants';
import getLogger from '../utils/logger';

const logger = getLogger('ErrorHandler');

/**
 * 全域錯誤處理中間件
 * 
 * 處理從控制器傳遞過來的錯誤，包括：
 * - 業務邏輯錯誤 (BusinessError)
 * - 系統錯誤
 * - 未知錯誤
 */
export const errorHandler = (
  error: any,
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
    res.status(error.statusCode).json({
      status: 'error',
      message: getErrorMessage(error),
      errors: formatBusinessError(error)
    });
    return;
  }

  // 處理其他已知錯誤類型
  if (error.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors: error.details || {}
    });
    return;
  }

  // 處理未知錯誤
  res.status(500).json({
    status: 'error',
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    errors: process.env.NODE_ENV === 'development' ? { details: error.message } : {}
  });
};

/**
 * 根據錯誤類型獲取適當的錯誤訊息
 */
function getErrorMessage(error: BusinessError): string {
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