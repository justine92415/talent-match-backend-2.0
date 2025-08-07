import { DataSource } from 'typeorm'
import config from '../config'
import { User } from '../entities/User'

export const dataSource = new DataSource({
  type: 'postgres',
  host: config.get<string>('db.host'),
  port: config.get<number>('db.port'),
  username: config.get<string>('db.username'),
  password: config.get<string>('db.password'),
  database: config.get<string>('db.database'),
  synchronize: config.get<boolean>('db.synchronize'),
  poolSize: 10,
  entities: [User],
  ssl: config.get<boolean>('db.ssl') ? { rejectUnauthorized: false } : false
})
