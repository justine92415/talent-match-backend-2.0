import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { UserRole, AccountStatus } from '@entities/enums'
import { Errors, BusinessError } from '@utils/errors'
import { AuthMessages } from '@constants/Message'
import { JWT_CONFIG, PASSWORD_CONFIG } from '@config/secret'
import { UserRoleService } from '@services/UserRoleService'
import {
  RegisterUserData,
  LoginUserData,
  RefreshTokenData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthTokens,
  AuthResponse,
  JwtTokenPayload,
  UpdateUserProfileData,
  FormattedUserResponse
} from '@models/index'

export class AuthService {
  private userRepository = dataSource.getRepository(User)
  private userRoleService = new UserRoleService()

  /**
   * 註冊新使用者
   */
  async register(userData: RegisterUserData): Promise<AuthResponse> {
    // 檢查 email 是否已存在
    await this.checkEmailExists(userData.email)

    // 檢查暱稱是否已存在
    await this.checkNicknameExists(userData.nick_name)

    // 加密密碼
    const hashedPassword = await this.hashPassword(userData.password)

    // 建立新使用者
    const newUser = this.userRepository.create({
      uuid: uuidv4(),
      nick_name: userData.nick_name,
      email: userData.email,
      password: hashedPassword,
      account_status: AccountStatus.ACTIVE
    })

    const savedUser = await this.userRepository.save(newUser)

    // 為新使用者設定預設學生角色
    await this.userRoleService.initializeDefaultRole(savedUser.id)

    // 生成 Token
    const tokens = await this.generateTokens(savedUser.id)

    // 回傳使用者資料（不包含敏感資訊）
    const userResponse = this.formatUserResponse(savedUser)

    return {
      user: userResponse,
      ...tokens
    }
  }

  /**
   * 使用者登入
   */
  async login(userData: LoginUserData): Promise<AuthResponse> {
    // 查找使用者
    const user = await this.userRepository.findOne({
      where: { email: userData.email },
      relations: ['roles']
    })

    // 檢查使用者是否存在
    if (!user) {
      throw Errors.invalidCredentials()
    }

    // 檢查帳號狀態
    if (user.account_status !== AccountStatus.ACTIVE) {
      throw Errors.accountSuspended()
    }

    // 驗證密碼
    const isPasswordValid = await this.verifyPassword(userData.password, user.password!)
    if (!isPasswordValid) {
      throw Errors.invalidCredentials()
    }

    // 更新最後登入時間
    await this.updateLastLoginTime(user.id)

    // 生成 Token
    const tokens = await this.generateTokens(user.id)

    // 回傳使用者資料（不包含敏感資訊）
    const userResponse = this.formatUserResponse({
      ...user,
      last_login_at: new Date()
    })

    return {
      user: userResponse,
      ...tokens
    }
  }

  /**
   * 刷新 Access Token
   */
  async refreshToken(tokenData: RefreshTokenData): Promise<AuthResponse> {
    try {
      // 驗證 refresh token
      const decoded = jwt.verify(tokenData.refresh_token, JWT_CONFIG.SECRET) as JwtTokenPayload

      // 檢查 token 型別
      if (decoded.type !== 'refresh') {
        throw Errors.invalidToken()
      }

      // 查詢使用者並檢查狀態
      const user = await this.userRepository.findOne({ 
        where: { id: decoded.userId },
        relations: ['roles']
      })
      if (!user) {
        throw Errors.invalidToken()
      }

      if (user.account_status !== AccountStatus.ACTIVE) {
        throw Errors.accountSuspended()
      }

      // 生成新的 tokens
      const tokens = await this.generateTokens(user.id)
      
      // 準備使用者回應資料（排除敏感欄位）
      const userResponse = this.sanitizeUser(user)

      return {
        user: userResponse,
        ...tokens
      }

    } catch (error) {
      if (error instanceof Error && ['BusinessError', 'ValidationError', 'AuthError', 'SystemError'].includes(error.name)) {
        throw error
      }

      // JWT 驗證失敗或其他錯誤
      if (error && typeof error === 'object' && 'name' in error) {
        const errObj = error as { name: string }
        if (errObj.name === 'JsonWebTokenError' || errObj.name === 'TokenExpiredError' || errObj.name === 'NotBeforeError') {
          throw Errors.tokenInvalidOrExpired()
        }
      }

      throw Errors.internalError()
    }
  }

  /**
   * 檢查 email 是否已存在
   */
  private async checkEmailExists(email: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { email }
    })
    if (existingUser) {
      throw Errors.emailExists()
    }
  }

  /**
   * 檢查暱稱是否已存在
   */
  private async checkNicknameExists(nickname: string): Promise<void> {
    const existingUser = await this.userRepository.findOne({
      where: { nick_name: nickname }
    })
    if (existingUser) {
      throw Errors.nicknameExists()
    }
  }

  /**
   * 加密密碼
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_CONFIG.BCRYPT_SALT_ROUNDS)
  }

  /**
   * 驗證密碼
   */
  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  /**
   * 更新使用者最後登入時間
   */
  private async updateLastLoginTime(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      last_login_at: new Date()
    })
  }

  /**
   * 取得使用者個人資料
   * 
   * @param userId 使用者ID
   * @returns Promise<FormattedUserResponse> 使用者完整資料（不包含敏感資訊）
   * @throws {ApiError} 當使用者不存在時
   */
  async getProfile(userId: number): Promise<FormattedUserResponse> {
    const userRepository = dataSource.getRepository(User)
    
    const user = await userRepository.findOne({
      where: { id: userId }
    })

    if (!user) {
      throw Errors.userNotFound()
    }

    return this.formatUserResponse(user)
  }

  /**
   * 更新使用者個人資料
   * 
   * 支援更新欄位：
   * - nick_name: 暱稱（1-50字元，需檢查唯一性）
   * - name: 真實姓名（最大100字元）
   * - birthday: 生日
   * - contact_phone: 聯絡電話（最大20字元）
   * - avatar_image: 大頭貼網址
   * 
   * @param userId 使用者ID
   * @param updateData 要更新的資料
   * @returns Promise<FormattedUserResponse> 更新後的使用者資料
   * @throws {UserApiError} 當暱稱重複時
   * @throws {ApiError} 當使用者不存在時
   */
  async updateProfile(userId: number, updateData: UpdateUserProfileData): Promise<FormattedUserResponse> {
    const userRepository = dataSource.getRepository(User)
    
    const user = await userRepository.findOne({
      where: { id: userId }
    })

    if (!user) {
      throw Errors.userNotFound()
    }

    // 如果要更新暱稱，檢查是否重複
    if (updateData.nick_name && updateData.nick_name !== user.nick_name) {
      const existingNickname = await userRepository.findOne({
        where: { nick_name: updateData.nick_name }
      })
      
      if (existingNickname) {
        throw Errors.nicknameExists()
      }
    }

    // 處理生日欄位：將空字串轉換為 null
    const processedUpdateData = { ...updateData }
    if ('birthday' in processedUpdateData && processedUpdateData.birthday === '') {
      processedUpdateData.birthday = null
    }

    // 更新使用者資料
    await userRepository.update(userId, processedUpdateData)
    
    // 取得更新後的使用者資料
    const updatedUser = await userRepository.findOne({
      where: { id: userId },
      relations: ['roles']
    })

    if (!updatedUser) {
      throw Errors.internalError()
    }

    return this.formatUserResponse(updatedUser)
  }

  /**
   * 刪除使用者帳號（軟刪除）
   * 
   * 功能：
   * - 使用 TypeORM 的軟刪除機制
   * - 設定 deleted_at 時間戳記
   * - 保留資料以供稽核和復原
   * 
   * 安全考量：
   * - 刪除後使用者無法登入
   * - 暱稱和email可供新用戶使用
   * - 歷史資料保持完整性
   * 
   * @param userId 使用者ID
   * @returns Promise<void>
   * @throws {ApiError} 當使用者不存在時
   */
  async deleteProfile(userId: number): Promise<void> {
    const userRepository = dataSource.getRepository(User)
    
    const user = await userRepository.findOne({
      where: { id: userId }
    })

    if (!user) {
      throw Errors.userNotFound()
    }

    // 執行軟刪除
    await userRepository.softDelete(userId)
  }

  /**
   * 格式化使用者回應資料
   */
  private formatUserResponse(user: User): Omit<User, 'password' | 'login_attempts' | 'locked_until' | 'password_reset_token' | 'password_reset_expires_at'> {
    return {
      id: user.id,
      uuid: user.uuid,
      google_id: user.google_id,
      name: user.name,
      nick_name: user.nick_name,
      email: user.email,
      birthday: user.birthday,
      contact_phone: user.contact_phone,
      avatar_image: user.avatar_image,
      avatar_google_url: user.avatar_google_url,
      roles: user.roles,
      account_status: user.account_status,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      deleted_at: user.deleted_at
    }
  }

  /**
   * 生成 JWT Tokens - 僅使用多重角色系統
   */
  private async generateTokens(userId: number): Promise<AuthTokens> {
    // 使用高精度時間戳確保每次生成的 token 都不同
    const accessTokenTime = Date.now()
    const refreshTokenTime = Date.now() + 1 // 確保 refresh token 時間戳不同
    
    // 獲取使用者的所有有效角色
    const roles = await this.userRoleService.getUserRoles(userId)
    
    const accessToken = jwt.sign({ 
      userId, 
      roles,  // 只使用角色陣列
      type: 'access',
      timestamp: accessTokenTime
    }, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN })

    const refreshToken = jwt.sign({ 
      userId, 
      roles,  // 只使用角色陣列
      type: 'refresh',
      timestamp: refreshTokenTime
    }, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: JWT_CONFIG.TOKEN_TYPE,
      expires_in: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_SECONDS
    }
  }

  /**
   * 清理使用者物件，移除敏感資訊
   */
  private sanitizeUser(user: User): Omit<User, 'password' | 'login_attempts' | 'locked_until' | 'password_reset_token' | 'password_reset_expires_at'> {
    const { password, login_attempts, locked_until, password_reset_token, password_reset_expires_at, ...sanitized } = user
    return sanitized
  }

  /**
   * 重設密碼
   */
  async resetPassword(resetPasswordData: ResetPasswordData): Promise<void> {
    const { token, new_password } = resetPasswordData

    // 查詢擁有此重設令牌且尚未過期的使用者
    const user = await this.userRepository.findOne({ 
      where: { 
        password_reset_token: token,
      } 
    })

    // 檢查令牌是否存在
    if (!user) {
      throw Errors.resetTokenInvalid()
    }

    // 檢查令牌是否已過期
    if (!user.password_reset_expires_at || user.password_reset_expires_at < new Date()) {
      throw Errors.resetTokenInvalid()
    }

    // 檢查帳號狀態
    if (user.account_status !== AccountStatus.ACTIVE) {
      throw new BusinessError('ACCOUNT_SUSPENDED_RESET', AuthMessages.ACCOUNT_SUSPENDED_RESET, 400)
    }

    // 加密新密碼
    const hashedPassword = await this.hashPassword(new_password)

    // 更新密碼並清除重設令牌
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires_at: null,
      updated_at: new Date()
    })
  }

  /**
   * 忘記密碼 - 發送重設密碼郵件
   */
  async forgotPassword(forgotPasswordData: ForgotPasswordData): Promise<void> {
    try {
      // 查詢使用者
      const user = await this.userRepository.findOne({ 
        where: { email: forgotPasswordData.email } 
      })

      // 基於安全考量，無論使用者是否存在都回傳相同訊息
      // 避免洩露系統中存在的電子郵件地址
      if (!user) {
        // 使用者不存在，但不透露此資訊
        return
      }

      // 檢查帳號狀態 - 即使帳號被停用也不透露狀態
      if (user.account_status !== AccountStatus.ACTIVE) {
        // 帳號已停用，但不透露此資訊
        return
      }

      // 生成重設密碼令牌
      const resetToken = this.generateResetToken()
      const resetExpires = this.getResetTokenExpiry()

      // 更新使用者記錄
      await this.userRepository.update(user.id, {
        password_reset_token: resetToken,
        password_reset_expires_at: resetExpires
      })

      // TODO: 實際發送郵件功能
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken)
      
    } catch (error) {
      // 記錄錯誤但不拋出，保持統一回應
      console.error('Forgot password error:', error)
    }
  }

  /**
   * 生成重設密碼令牌
   */
  private generateResetToken(): string {
    // 使用加密隨機字串作為重設令牌
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('hex')
  }

  /**
   * 取得重設令牌過期時間
   */
  private getResetTokenExpiry(): Date {
    // 令牌 1 小時後過期
    const expiry = new Date()
    expiry.setHours(expiry.getHours() + 1)
    return expiry
  }
}

export const authService = new AuthService()
