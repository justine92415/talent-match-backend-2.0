import { Request, Response, NextFunction } from 'express'
import { authService } from '@services/AuthService'
import type { RegisterUserData, LoginUserData, RefreshTokenData, ForgotPasswordData } from '@models/index'
import { SuccessMessages } from '@constants/Message'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'

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

    res.status(201).json(handleCreated(result, SuccessMessages.REGISTRATION_SUCCESS))
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

    res.status(200).json(handleSuccess(result, SuccessMessages.LOGIN_SUCCESS))
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

    res.status(200).json(handleSuccess(result, SuccessMessages.TOKEN_REFRESH_SUCCESS))
  })

  /**
   * 忘記密碼
   */
  forgotPassword = handleErrorAsync(async (req: Request, res: Response) => {
    const forgotPasswordData = req.body

    await authService.forgotPassword(forgotPasswordData)

    res.status(200).json(handleSuccess(null, SuccessMessages.PASSWORD_RESET_EMAIL_SENT))
  })

  /**
   * 重設密碼
   */
  resetPassword = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const { token, new_password } = req.body

    await authService.resetPassword({ token, new_password })

    res.status(200).json(handleSuccess(null, SuccessMessages.PASSWORD_RESET_SUCCESS))
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
    const userId = req.user!.userId

    const user = await authService.getProfile(userId)

    res.status(200).json(handleSuccess({ user }, SuccessMessages.PROFILE_RETRIEVED))
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
    const userId = req.user!.userId

    const updateData = req.body

    const user = await authService.updateProfile(userId, updateData)

    res.status(200).json(handleSuccess({ user }, SuccessMessages.PROFILE_UPDATED))
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
    const userId = req.user!.userId

    await authService.deleteProfile(userId)

    res.status(200).json(handleSuccess(null, SuccessMessages.ACCOUNT_DELETED))
  })
}

export const authController = new AuthController()
