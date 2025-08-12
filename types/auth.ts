export interface RegisterRequest {
  nick_name: string
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
  password_confirmation: string
}
