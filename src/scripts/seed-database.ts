#!/usr/bin/env ts-node-esm

/**
 * 資料庫種子資料執行腳本
 * 使用方式: npm run db:seed
 */

import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { DatabaseSeeder } from '@db/seeds/index'

// 載入環境變數
dotenv.config()

import { User } from '@entities/User'
import { City } from '@entities/City'
import { MainCategory } from '@entities/MainCategory'
import { SubCategory } from '@entities/SubCategory'
import { AuditLog } from '@entities/AuditLog'
import { Teacher } from '@entities/Teacher'
import { TeacherWorkExperience } from '@entities/TeacherWorkExperience'
import { TeacherLearningExperience } from '@entities/TeacherLearningExperience'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { Course } from '@entities/Course'
import { CourseRatingStat } from '@entities/CourseRatingStat'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { CourseVideo } from '@entities/CourseVideo'
import { CourseFile } from '@entities/CourseFile'
import { Video } from '@entities/Video'
import { Reservation } from '@entities/Reservation'
import { Review } from '@entities/Review'
import { Order } from '@entities/Order'
import { OrderItem } from '@entities/OrderItem'
import { UserCartItem } from '@entities/UserCartItem'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'
import { UserPreference } from '@entities/UserPreference'
import { UserFavorite } from '@entities/UserFavorite'
import { Chat } from '@entities/Chat'
import { ChatParticipant } from '@entities/ChatParticipant'
import { Message } from '@entities/Message'
import { MessageReceiver } from '@entities/MessageReceiver'
import { MessageCourse } from '@entities/MessageCourse'
import { Notification } from '@entities/Notification'
import { TeacherEarning } from '@entities/TeacherEarning'
import { TeacherSettlement } from '@entities/TeacherSettlement'
import { AdminUser } from '@entities/AdminUser'
import { CourseApplication } from '@entities/CourseApplication'

// 建立專用於種子資料的資料源配置
const seedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST === 'postgres' ? 'localhost' : (process.env.DB_HOST || 'localhost'), // 修正 Docker 容器名稱
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'postgres',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  entities: [
    User,
    City,
    MainCategory,
    SubCategory,
    AuditLog,
    Teacher,
    TeacherWorkExperience,
    TeacherLearningExperience,
    TeacherCertificate,
    TeacherAvailableSlot,
    Course,
    CourseRatingStat,
    CoursePriceOption,
    CourseVideo,
    CourseFile,
    Video,
    Reservation,
    Review,
    Order,
    OrderItem,
    UserCartItem,
    UserCoursePurchase,
    UserPreference,
    UserFavorite,
    Chat,
    ChatParticipant,
    Message,
    MessageReceiver,
    MessageCourse,
    Notification,
    TeacherEarning,
    TeacherSettlement,
    AdminUser,
    CourseApplication
  ],
  ssl: process.env.DB_ENABLE_SSL === 'true' ? { rejectUnauthorized: false } : false
})

async function main() {
  try {
    console.log('🌱 開始執行資料庫種子資料...')
    
    // 初始化資料庫連線
    if (!seedDataSource.isInitialized) {
      await seedDataSource.initialize()
      console.log('✅ 資料庫連線成功')
    }
    
    // 執行種子資料
    const seeder = new DatabaseSeeder()
    await seeder.run(seedDataSource)
    
    console.log('🎉 種子資料執行完成')
  } catch (error) {
    console.error('❌ 種子資料執行失敗:', error)
    process.exit(1)
  } finally {
    // 確保資料庫連線關閉
    if (seedDataSource.isInitialized) {
      await seedDataSource.destroy()
      console.log('📴 資料庫連線已關閉')
    }
    process.exit(0)
  }
}

// 處理程式終止信號
process.on('SIGINT', async () => {
  console.log('\n收到終止信號，正在關閉...')
  if (seedDataSource.isInitialized) {
    await seedDataSource.destroy()
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('\n收到終止信號，正在關閉...')
  if (seedDataSource.isInitialized) {
    await seedDataSource.destroy()
  }
  process.exit(0)
})

// 執行主函式
main().catch(console.error)