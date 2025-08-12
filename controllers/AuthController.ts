import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '../db/data-source'
import { User } from '../entities/User'
import { UserRole, AccountStatus } from '../entities/enums'
import { RegisterRequest, RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth'
import crypto from 'crypto'

export class AuthController {
  /**
   * 使用者註冊
   */
  static async register(req: Request<{}, {}, RegisterRequest>, res: Response) {
    try {
      const { nick_name, email, password } = req.body
      const errors: Record<string, string[]> = {}

      // 檢查必填欄位
      if (!nick_name || nick_name.trim() === '') {
        errors.nick_name = ['暱稱為必填欄位']
      } else if (nick_name.length > 50) {
        errors.nick_name = ['暱稱長度不能超過50字元']
      }

      if (!email || email.trim() === '') {
        errors.email = ['請輸入有效的電子郵件格式']
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = ['請輸入有效的電子郵件格式']
      } else if (email.length > 255) {
        errors.email = ['電子郵件長度不能超過255字元']
      }

      if (!password || password.trim() === '') {
        errors.password = ['密碼必須至少8字元且包含中英文']
      } else if (password.length < 8) {
        errors.password = ['密碼必須至少8字元且包含中英文']
      } else if (!/(?=.*[a-zA-Z])(?=.*[\u4e00-\u9fa5])/.test(password)) {
        errors.password = ['密碼必須至少8字元且包含中英文']
      }

      // 如果有驗證錯誤，直接回傳
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          status: 'error',
          message: '註冊失敗',
          errors
        })
      }

      // 檢查 email 是否已被註冊
      const userRepository = dataSource.getRepository(User)
      const existingUser = await userRepository.findOne({ where: { email } })

      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: '註冊失敗',
          errors: {
            email: ['此電子郵件已被註冊']
          }
        })
      }

      // 密碼加密
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // 建立新使用者
      const user = new User()
      user.uuid = uuidv4()
      user.nick_name = nick_name.trim()
      user.email = email.trim().toLowerCase()
      user.password = hashedPassword
      user.role = UserRole.STUDENT
      user.account_status = AccountStatus.ACTIVE

      await userRepository.save(user)

      // 生成 JWT tokens
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      const accessToken = jwt.sign(
        {
          sub: user.uuid,
          user_id: user.id,
          role: user.role,
          account_status: user.account_status,
          jti: uuidv4()
        },
        jwtSecret,
        { expiresIn: '1h' }
      )

      const refreshToken = jwt.sign(
        {
          sub: user.uuid,
          user_id: user.id,
          token_type: 'refresh',
          jti: uuidv4()
        },
        jwtSecret,
        { expiresIn: '30d' }
      )

      // 回傳成功結果
      return res.status(201).json({
        status: 'success',
        message: '註冊成功',
        data: {
          user: {
            id: user.id,
            uuid: user.uuid,
            nick_name: user.nick_name,
            email: user.email,
            role: user.role,
            account_status: user.account_status,
            created_at: user.created_at?.toISOString()
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: 3600
        }
      })
    } catch (error) {
      console.error('註冊錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 使用者登入
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      const errors: Record<string, string[]> = {}

      // 必填欄位驗證
      if (!email || email.trim() === '') {
        errors.email = ['請輸入有效的電子郵件格式']
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = ['請輸入有效的電子郵件格式']
      }
      if (!password || password.trim() === '') {
        errors.password = ['密碼為必填欄位']
      }
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          status: 'error',
          message: '登入失敗',
          errors
        })
      }

      // 查詢使用者
      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { email: email.trim().toLowerCase() } })
      if (!user || !user.password) {
        return res.status(401).json({
          status: 'error',
          message: '登入失敗',
          errors: { credentials: ['電子郵件或密碼錯誤'] }
        })
      }

      // 檢查帳號狀態
      if (user.account_status === AccountStatus.DEACTIVATED) {
        return res.status(403).json({
          status: 'error',
          message: '帳號停用',
          errors: { account: ['您的帳號已被停用，請聯絡客服'] }
        })
      }

      // 密碼比對
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: '登入失敗',
          errors: { credentials: ['電子郵件或密碼錯誤'] }
        })
      }

      // 產生 JWT/Refresh Token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      const accessToken = jwt.sign(
        {
          sub: user.uuid,
          user_id: user.id,
          role: user.role,
          account_status: user.account_status,
          jti: uuidv4()
        },
        jwtSecret,
        { expiresIn: '1h' }
      )
      const refreshToken = jwt.sign(
        {
          sub: user.uuid,
          user_id: user.id,
          token_type: 'refresh',
          jti: uuidv4()
        },
        jwtSecret,
        { expiresIn: '30d' }
      )

      // 更新最後登入時間
      user.last_login_at = new Date()
      await userRepository.save(user)

      // 回傳成功
      return res.status(200).json({
        status: 'success',
        message: '登入成功',
        data: {
          user: {
            id: user.id,
            uuid: user.uuid,
            nick_name: user.nick_name,
            email: user.email,
            role: user.role,
            account_status: user.account_status,
            created_at: user.created_at?.toISOString()
          },
          access_token: accessToken,
          refresh_token: refreshToken,
          token_type: 'Bearer',
          expires_in: 3600
        }
      })
    } catch (error) {
      console.error('登入錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 重新整理 Token
   */
  static async refresh(req: Request<{}, {}, RefreshTokenRequest>, res: Response) {
    try {
      const { refresh_token } = req.body
      const errors: Record<string, string[]> = {}

      // 檢查必填欄位
      if (!refresh_token || refresh_token.trim() === '') {
        errors.refresh_token = ['Refresh Token 為必填欄位']
      }

      // 如果有驗證錯誤，直接回傳
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Token 更新失敗',
          errors
        })
      }

      // 驗證 Refresh Token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      let decoded: any

      try {
        decoded = jwt.verify(refresh_token, jwtSecret)
      } catch (error) {
        return res.status(401).json({
          status: 'error',
          message: 'Token 更新失敗',
          errors: {
            refresh_token: ['無效或已過期的 Refresh Token']
          }
        })
      }

      // 檢查 token 類型
      if (decoded.token_type !== 'refresh') {
        return res.status(401).json({
          status: 'error',
          message: 'Token 更新失敗',
          errors: {
            refresh_token: ['無效或已過期的 Refresh Token']
          }
        })
      }

      // 查詢使用者
      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: {
          id: decoded.user_id,
          uuid: decoded.sub
        }
      })

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Token 更新失敗',
          errors: {
            refresh_token: ['無效或已過期的 Refresh Token']
          }
        })
      }

      // 檢查帳號狀態
      if (user.account_status === AccountStatus.DEACTIVATED) {
        return res.status(401).json({
          status: 'error',
          message: 'Token 更新失敗',
          errors: {
            refresh_token: ['無效或已過期的 Refresh Token']
          }
        })
      }

      // 生成新的 JWT tokens
      const newAccessToken = jwt.sign(
        {
          sub: user.uuid,
          user_id: user.id,
          role: user.role,
          account_status: user.account_status,
          jti: uuidv4() // 加入唯一識別符
        },
        jwtSecret,
        { expiresIn: '1h' }
      )

      const newRefreshToken = jwt.sign(
        {
          sub: user.uuid,
          user_id: user.id,
          token_type: 'refresh',
          jti: uuidv4() // 加入唯一識別符
        },
        jwtSecret,
        { expiresIn: '30d' }
      )

      // 回傳成功結果
      return res.status(200).json({
        status: 'success',
        message: 'Token 更新成功',
        data: {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          token_type: 'Bearer',
          expires_in: 3600
        }
      })
    } catch (error) {
      console.error('Token 更新錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 忘記密碼：產生重設令牌（安全考量：不透露 email 是否存在）
   */
  static async forgotPassword(req: Request<{}, {}, ForgotPasswordRequest>, res: Response) {
    try {
      const { email } = req.body
      const errors: Record<string, string[]> = {}

      if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = ['請輸入有效的電子郵件格式']
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: 'error', message: '請求失敗', errors })
      }

      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { email: email.trim().toLowerCase() } })

      if (user && user.account_status !== AccountStatus.DEACTIVATED) {
        // 產生安全令牌與到期時間（1 小時）
        const token = crypto.randomBytes(32).toString('hex')
        user.password_reset_token = token
        user.password_reset_expires_at = new Date(Date.now() + 60 * 60 * 1000)
        await userRepository.save(user)
        // 備註：此處省略實際寄信實作
      }

      // 不論 email 是否存在，皆回傳成功（安全考量）
      return res.status(200).json({
        status: 'success',
        message: '如果該電子郵件已註冊，您將收到密碼重設指示',
        data: null
      })
    } catch (error) {
      console.error('忘記密碼錯誤:', error)
      return res.status(500).json({ status: 'error', message: '系統錯誤，請稍後再試' })
    }
  }

  /**
   * 重設密碼：驗證令牌與新密碼，更新後清除令牌
   */
  static async resetPassword(req: Request<{}, {}, ResetPasswordRequest>, res: Response) {
    try {
      const { token, password, password_confirmation } = req.body
      const errors: Record<string, string[]> = {}

      if (!token || token.trim() === '') {
        errors.token = ['無效或已過期的重設令牌']
      }
      if (!password || password.length < 8 || !/(?=.*[a-zA-Z])(?=.*[\u4e00-\u9fa5])/.test(password)) {
        errors.password = ['密碼必須至少8字元且包含中英文']
      }
      if (password_confirmation === undefined || password_confirmation !== password) {
        errors.password_confirmation = ['密碼確認不一致']
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ status: 'error', message: '密碼重設失敗', errors })
      }

      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { password_reset_token: token } })

      if (!user || !user.password_reset_expires_at || user.password_reset_expires_at.getTime() <= Date.now()) {
        return res.status(400).json({
          status: 'error',
          message: '密碼重設失敗',
          errors: { token: ['無效或已過期的重設令牌'] }
        })
      }

      // 更新密碼與清除令牌
      const saltRounds = 12
      const hashed = await bcrypt.hash(password, saltRounds)
      user.password = hashed
      user.password_reset_token = null as unknown as string
      user.password_reset_expires_at = null as unknown as Date
      await userRepository.save(user)

      return res.status(200).json({ status: 'success', message: '密碼重設成功', data: null })
    } catch (error) {
      console.error('重設密碼錯誤:', error)
      return res.status(500).json({ status: 'error', message: '系統錯誤，請稍後再試' })
    }
  }
}
