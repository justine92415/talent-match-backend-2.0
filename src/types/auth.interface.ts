import { User } from '../entities/User'

/**
 * 註冊使用者資料介面
 */
export interface RegisterUserData {
  nick_name: string
  email: string
  password: string
}

/**
 * 登入使用者資料介面
 */
export interface LoginUserData {
  email: string
  password: string
}

/**
 * 刷新 Token 資料介面
 */
export interface RefreshTokenData {
  refresh_token: string
}

/**
 * 忘記密碼資料介面
 */
export interface ForgotPasswordData {
  email: string
}

/**
 * 重設密碼資料介面
 */
export interface ResetPasswordData {
  token: string
  new_password: string
}

/**
 * Token 組合介面
 */
export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

/**
 * 認證回應介面
 */
export interface AuthResponse {
  user: Omit<User, 'password' | 'login_attempts' | 'locked_until' | 'password_reset_token' | 'password_reset_expires_at'>
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}