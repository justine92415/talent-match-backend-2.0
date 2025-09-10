import { User } from '@entities/User'

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
 * JWT Token Payload 介面 - 支援多重角色
 */
export interface JwtTokenPayload {
  userId: number
  role: string  // 保留舊的 role 欄位以確保向後相容性
  roles: string[]  // 新增多重角色支援
  type: 'access' | 'refresh'
  timestamp?: number
  iat?: number
  exp?: number
}

/**
 * 使用者更新資料介面
 */
export interface UpdateUserProfileData {
  nick_name?: string
  name?: string | null
  birthday?: Date | null
  contact_phone?: string | null
  avatar_image?: string | null
}

/**
 * 格式化使用者回應介面（排除敏感欄位） - 支援多重角色
 */
export interface FormattedUserResponse {
  id: number
  uuid: string
  google_id?: string | null
  name?: string | null
  nick_name: string
  email: string
  birthday?: Date | null
  contact_phone?: string | null
  avatar_image?: string | null
  avatar_google_url?: string | null
  role: string  // 保留舊的 role 欄位以確保向後相容性
  roles: Array<{
    role: string
    is_active: boolean
    granted_at: Date
  }>  // 新增多重角色支援
  account_status: string
  last_login_at?: Date | null
  created_at: Date
  updated_at: Date
  deleted_at?: Date | null
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