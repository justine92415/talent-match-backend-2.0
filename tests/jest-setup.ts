import * as dotenv from 'dotenv'

// 在所有測試開始前載入環境變數
dotenv.config()

// 設定測試環境專用的環境變數（只在沒有設定時才使用預設值）
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost'
}
if (!process.env.DB_PORT) {
  process.env.DB_PORT = '5432'
}
if (!process.env.DB_USERNAME) {
  process.env.DB_USERNAME = 'talentmatch' // 本地開發預設值
}
if (!process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = 'talentmatch10' // 本地開發預設值
}
if (!process.env.DB_DATABASE) {
  process.env.DB_DATABASE = 'talentmatch' // 本地開發預設值
}
if (!process.env.DB_SYNCHRONIZE) {
  process.env.DB_SYNCHRONIZE = 'true'
}
