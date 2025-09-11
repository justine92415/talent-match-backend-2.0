import { DataSource } from 'typeorm'
import config from '@config/index'
import { User } from '@entities/User'
import { UserRole } from '@entities/UserRole'
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

export const dataSource = new DataSource({
  type: 'postgres',
  host: config.get<string>('db.host'),
  port: config.get<number>('db.port'),
  username: config.get<string>('db.username'),
  password: config.get<string>('db.password'),
  database: config.get<string>('db.database'),
  synchronize: config.get<boolean>('db.synchronize'),
  // 🔧 只在真正的測試執行時使用 dropSchema 來確保乾淨狀態
  dropSchema: process.env.NODE_ENV === 'test' && (typeof jest !== 'undefined' || process.env.JEST_WORKER_ID !== undefined),
  poolSize: process.env.NODE_ENV === 'test' ? 5 : 10, // 測試環境使用較少連線
  entities: [
    User,
    UserRole,
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
  ssl: config.get<boolean>('db.ssl') ? { rejectUnauthorized: false } : false,
  // 🔧 新增：測試環境的額外設定
  extra:
    process.env.NODE_ENV === 'test'
      ? {
          // 測試環境使用較短的連線超時
          connectionTimeoutMillis: 5000,
          idleTimeoutMillis: 5000,
          // 防止連線池問題
          max: 5
        }
      : {}
})
