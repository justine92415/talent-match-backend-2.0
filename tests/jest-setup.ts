import * as dotenv from 'dotenv'

// 在所有測試開始前載入環境變數
dotenv.config()

// 設定測試環境專用的環境變數
// CI 環境會覆蓋這些設定
if (!process.env.DB_HOST) {
  process.env.DB_HOST = 'localhost'
}
if (!process.env.DB_PORT) {
  process.env.DB_PORT = '5432'
}
if (!process.env.DB_USERNAME) {
  process.env.DB_USERNAME = process.env.NODE_ENV === 'test' ? 'test_user' : 'talentmatch'
}
if (!process.env.DB_PASSWORD) {
  process.env.DB_PASSWORD = process.env.NODE_ENV === 'test' ? 'test_password' : 'talentmatch10'
}
if (!process.env.DB_DATABASE) {
  process.env.DB_DATABASE = process.env.NODE_ENV === 'test' ? 'test_db' : 'talentmatch'
}
if (!process.env.DB_SYNCHRONIZE) {
  process.env.DB_SYNCHRONIZE = 'true'
}

// 設定 Jest 超時時間
jest.setTimeout(30000)

// 設定全域測試設定
beforeAll(() => {
  // 確保測試環境
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  // 清理全域資源
})
