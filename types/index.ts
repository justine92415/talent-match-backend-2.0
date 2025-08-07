export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database: string
  synchronize: boolean
  ssl?: boolean
}

export interface WebConfig {
  port: number
}

// Firebase 服務帳戶金鑰的基本結構
export interface FirebaseServiceAccount {
  type?: string
  project_id?: string
  private_key_id?: string
  private_key?: string
  client_email?: string
  client_id?: string
  auth_uri?: string
  token_uri?: string
  auth_provider_x509_cert_url?: string
  client_x509_cert_url?: string
  [key: string]: unknown
}

export interface FirebaseConfig {
  serviceAccount: FirebaseServiceAccount
  storageBucket: string
}

export interface SecretConfig {
  jwtSecret: string
  jwtExpiresDay: string
  firebase: FirebaseConfig
}

export interface Config {
  db: DatabaseConfig
  web: WebConfig
  secret: SecretConfig
}
