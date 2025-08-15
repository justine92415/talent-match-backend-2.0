import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '../db/data-source'
import { User } from '../entities/User'
import { UserRole, AccountStatus } from '../entities/enums'
import { UserError } from '../core/errors/BusinessError'
import { JWT_CONFIG, PASSWORD_CONFIG, ERROR_MESSAGES } from '../config/constants'

export interface RegisterUserData {
  nick_name: string
  email: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  user: Partial<User>
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export class AuthService {
  private userRepository = dataSource.getRepository(User)

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
      role: UserRole.STUDENT,
      account_status: AccountStatus.ACTIVE
    })

    const savedUser = await this.userRepository.save(newUser)

    // 生成 Token
    const tokens = this.generateTokens(savedUser.id, savedUser.role)

    // 回傳使用者資料（不包含敏感資訊）
    const userResponse = this.formatUserResponse(savedUser)

    return {
      user: userResponse,
      ...tokens
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
      throw UserError.emailExists()
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
      throw UserError.nicknameExists()
    }
  }

  /**
   * 加密密碼
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, PASSWORD_CONFIG.BCRYPT_SALT_ROUNDS)
  }

  /**
   * 格式化使用者回應資料
   */
  private formatUserResponse(user: User): Partial<User> {
    return {
      id: user.id,
      uuid: user.uuid,
      nick_name: user.nick_name,
      email: user.email,
      role: user.role,
      account_status: user.account_status,
      created_at: user.created_at
    }
  }

  /**
   * 生成 JWT Tokens
   */
  private generateTokens(userId: number, role: UserRole): AuthTokens {
    const accessToken = jwt.sign({ userId, role, type: 'access' }, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN })

    const refreshToken = jwt.sign({ userId, role, type: 'refresh' }, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN })

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: JWT_CONFIG.TOKEN_TYPE,
      expires_in: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_SECONDS
    }
  }
}

export const authService = new AuthService()
