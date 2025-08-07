import { DatabaseConfig } from '../types'

const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'fitness_db',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  ssl: process.env.DB_ENABLE_SSL === 'true'
}

export default dbConfig
