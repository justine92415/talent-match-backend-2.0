import { dataSource } from '../db/data-source'

// 全域測試設定
export const setupTests = async (): Promise<void> => {
  // 只在 Jest 執行時設定測試環境
  if (typeof jest !== 'undefined' || process.env.JEST_WORKER_ID !== undefined) {
    process.env.NODE_ENV = 'test'
  }

  // 設定測試環境專用的環境變數
  if (!process.env.DB_HOST) process.env.DB_HOST = 'localhost'
  if (!process.env.DB_PORT) process.env.DB_PORT = '5432'
  if (!process.env.DB_USERNAME) process.env.DB_USERNAME = 'test_user'
  if (!process.env.DB_PASSWORD) process.env.DB_PASSWORD = 'test_password'
  if (!process.env.DB_DATABASE) process.env.DB_DATABASE = 'test_db'
  if (!process.env.DB_SYNCHRONIZE) process.env.DB_SYNCHRONIZE = 'true'
  if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test_jwt_secret_key'

  console.log('🔧 測試環境設定完成')
}

// 清理測試資源
export const teardownTests = async (): Promise<void> => {
  try {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
      console.log('✅ 測試資源清理完成')
    }
  } catch (error) {
    console.error('❌ 清理測試資源時發生錯誤:', error)
  }
}

// 移除自動執行，改為手動在測試中呼叫
// setupTests()
