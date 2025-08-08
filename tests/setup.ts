import { DataSource } from 'typeorm'
import { User } from '../entities/User'

// 測試資料庫配置
const testDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'talentmatch',
  password: process.env.DB_PASSWORD || 'talentmatch10',
  database: process.env.DB_DATABASE || 'talentmatch',
  entities: [User],
  synchronize: true,
  dropSchema: true, // 測試時重置資料庫
  logging: false
})

export { testDataSource }
