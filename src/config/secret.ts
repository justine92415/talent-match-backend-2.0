const secretConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresDay: process.env.JWT_EXPIRES_DAY || '7d',
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : {},
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || ''
  }
}

// JWT 相關設定
export const JWT_CONFIG = {
  SECRET: secretConfig.jwtSecret,
  ACCESS_TOKEN_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: secretConfig.jwtExpiresDay,
  TOKEN_TYPE: 'Bearer',
  ACCESS_TOKEN_EXPIRES_SECONDS: 60 * 60 // 1 hour in seconds
}

// 密碼相關設定
export const PASSWORD_CONFIG = {
  BCRYPT_SALT_ROUNDS: 12,
  MIN_LENGTH: 8,
  MAX_LENGTH: 128
}

export default secretConfig
