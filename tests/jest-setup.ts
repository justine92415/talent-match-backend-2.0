import * as dotenv from 'dotenv'

// 在所有測試開始前載入環境變數
dotenv.config()

// 立即設定測試環境變數（在任何 beforeAll 之前執行）
if (typeof jest !== 'undefined' || process.env.JEST_WORKER_ID !== undefined) {
  process.env.NODE_ENV = 'test'
  
  // 檢查是否在 CI 環境（GitHub Actions）
  if (process.env.CI === 'true') {
    // GitHub Actions 環境：使用 workflow 中定義的資料庫設定
    console.log('🔧 CI 測試環境已設定，使用資料庫:', process.env.DB_DATABASE || 'test_db')
  } else {
    // 本地開發環境：使用本地資料庫設定
    process.env.DB_HOST = 'localhost'
    process.env.DB_PORT = '5432'
    process.env.DB_USERNAME = 'talentmatch'
    process.env.DB_PASSWORD = 'talentmatch10'
    process.env.DB_DATABASE = 'talentmatch_test'
    console.log('🔧 本地測試環境已設定，使用資料庫:', process.env.DB_DATABASE)
  }
}

// 設定測試環境專用的環境變數（作為後備）
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost'
}
if (!process.env.DB_PORT) {
  process.env.DB_PORT = '5432'
}
// 移除條件檢查，確保測試環境使用正確的設定
if (process.env.NODE_ENV === 'test') {
  process.env.DB_DATABASE = 'talentmatch_test'
  process.env.DB_USERNAME = 'talentmatch'
  process.env.DB_PASSWORD = 'talentmatch10'
}
if (!process.env.DB_SYNCHRONIZE) {
  process.env.DB_SYNCHRONIZE = 'true'
}

// 設定 Jest 超時時間
jest.setTimeout(30000)

import { closeTestDatabase } from './helpers/database'

// 設定全域測試設定
beforeAll(() => {
  // 只在 Jest 執行時設定測試環境（透過檢查 jest 相關環境變數）
  if (typeof jest !== 'undefined' || process.env.JEST_WORKER_ID !== undefined) {
    process.env.NODE_ENV = 'test'
    // 強制設定測試用的資料庫主機為 localhost
    process.env.DB_HOST = 'localhost'
  }
})

afterAll(async () => {
  // 清理全域資源：確保所有測試完成後關閉資料庫連線
  await closeTestDatabase()
})
