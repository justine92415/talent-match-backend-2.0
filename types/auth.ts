export interface RegisterRequest {
  nick_name: string
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}
