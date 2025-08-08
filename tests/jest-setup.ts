import * as dotenv from 'dotenv'

// 在所有測試開始前載入環境變數
dotenv.config()

// 設定測試環境專用的環境變數
process.env.DB_HOST = 'localhost'
process.env.DB_PORT = '5432'
process.env.DB_USERNAME = 'talentmatch'
process.env.DB_PASSWORD = 'talentmatch10'
process.env.DB_DATABASE = 'talentmatch'
process.env.DB_SYNCHRONIZE = 'true'
