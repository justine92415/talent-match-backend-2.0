import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/authService'
import { BusinessError, UserError } from '../core/errors/BusinessError'
import { ERROR_MESSAGES } from '../config/constants'

export class AuthController {
  /**
   * 使用者註冊
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nick_name, email, password } = req.body

      // 呼叫服務層處理註冊邏輯
      const result = await authService.register({
        nick_name,
        email,
        password
      })

      res.status(201).json({
        status: 'success',
        message: ERROR_MESSAGES.REGISTRATION_SUCCESS,
        data: result
      })
    } catch (error) {
      // 處理業務邏輯錯誤
      if (error instanceof BusinessError) {
        res.status(error.statusCode).json({
          status: 'error',
          message: ERROR_MESSAGES.REGISTRATION_FAILED,
          errors: AuthController.formatBusinessError(error)
        })
        return
      }

      // 其他未知錯誤交給全域錯誤處理器
      next(error)
    }
  }

  /**
   * 格式化業務錯誤為前端需要的格式
   */
  private static formatBusinessError(error: BusinessError): Record<string, string[]> {
    if (error instanceof UserError) {
      switch (error.code) {
        case 'EMAIL_EXISTS':
          return { email: [error.message] }
        case 'NICKNAME_EXISTS':
          return { nick_name: [error.message] }
        default:
          return { general: [error.message] }
      }
    }
    return { general: [error.message] }
  }
}

export const authController = new AuthController()
