import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/authService'
import type { RegisterUserData, LoginUserData, RefreshTokenData, ForgotPasswordData } from '../types'
import { BusinessError, UserError } from '../core/errors/BusinessError'
import { ERROR_MESSAGES } from '../config/constants'
import { handleErrorAsync } from '../utils'

export class AuthController {
  /**
   * 使用者註冊
   */
  register = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
  })

  /**
   * 使用者登入
   */
  login = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body

    // 呼叫服務層處理登入邏輯
    const result = await authService.login({
      email,
      password
    })

    res.status(200).json({
      status: 'success',
      message: ERROR_MESSAGES.LOGIN_SUCCESS,
      data: result
    })
  })

  /**
   * 刷新 Token
   */
  refreshToken = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { refresh_token } = req.body

    // 呼叫服務層處理刷新 Token 邏輯
    const result = await authService.refreshToken({
      refresh_token
    })

    res.status(200).json({
      status: 'success',
      message: 'Token 刷新成功',
      data: result
    })
  })

  /**
   * 忘記密碼
   */
  forgotPassword = handleErrorAsync(async (req: Request, res: Response) => {
    const forgotPasswordData = req.body

    await authService.forgotPassword(forgotPasswordData)

    res.status(200).json({
      status: 'success',
      message: '重設密碼郵件已發送，請檢查您的信箱'
    })
  })

  /**
   * 重設密碼
   */
  resetPassword = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const { token, new_password } = req.body
    
    await authService.resetPassword({ token, new_password })

    res.status(200).json({
      status: 'success',
      message: '密碼重設成功'
    })
  })

  /**
   * 取得使用者個人資料
   * 
   * @description 取得當前已認證使用者的完整個人資料
   * @route GET /api/auth/profile
   * @access Private (需要 JWT Token)
   * @param req Express Request (包含認證使用者資訊)
   * @param res Express Response
   * @returns Promise<void>
   */
  getProfile = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new BusinessError('USER_NOT_FOUND', '使用者資訊不存在', 401)
    }
    
    const user = await authService.getProfile(userId)

    res.status(200).json({
      status: 'success',
      message: '成功取得個人資料',
      data: {
        user
      }
    })
  })

  /**
   * 更新使用者個人資料
   * 
   * @description 更新當前已認證使用者的個人資料（部分更新）
   * @route PUT /api/auth/profile
   * @access Private (需要 JWT Token)
   * @param req Express Request (包含要更新的資料)
   * @param res Express Response
   * @returns Promise<void>
   */
  updateProfile = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new BusinessError('USER_NOT_FOUND', '使用者資訊不存在', 401)
    }
    const updateData = req.body
    
    const user = await authService.updateProfile(userId, updateData)

    res.status(200).json({
      status: 'success',
      message: '成功更新個人資料',
      data: {
        user
      }
    })
  })

  /**
   * 刪除使用者帳號
   * 
   * @description 軟刪除當前已認證使用者的帳號
   * @route DELETE /api/auth/profile
   * @access Private (需要 JWT Token)
   * @param req Express Request (包含認證使用者資訊)
   * @param res Express Response
   * @returns Promise<void>
   */
  deleteProfile = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      throw new BusinessError('USER_NOT_FOUND', '使用者資訊不存在', 401)
    }

    await authService.deleteProfile(userId)

    res.status(200).json({
      status: 'success',
      message: '帳號已成功刪除'
    })
  })

  /**
   * 格式化業務錯誤為前端需要的格式
   * @deprecated 此方法已移至全域錯誤處理中間件
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
