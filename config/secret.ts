import { SecretConfig } from '../types'

const secretConfig: SecretConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresDay: process.env.JWT_EXPIRES_DAY || '7d',
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : {},
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || ''
  }
}

export default secretConfig
