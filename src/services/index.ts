/**
 * 服務層統一匯出
 * 
 * 集中管理所有服務層模組的匯出，方便其他模組引用
 * 
 * 設計原則：
 * 1. 統一使用 Singleton 實例模式（小寫駝峰式命名）
 * 2. 同時匯出類別供特殊情況使用（如測試、繼承等）
 * 3. 保持命名一致性：{ServiceName} → {serviceName}
 * 4. 提升記憶體效率和管理便利性
 */

// === 服務實例匯出 ===
export { adminService } from './AdminService'
export { authService } from './AuthService'
export { cartService } from './CartService'
export { certificateService } from './CertificateService'
export { courseService } from './CourseService'
export { courseFileService } from './CourseFileService'
export { courseVideoService } from './CourseVideoService'
export { favoriteService } from './FavoriteService'
export { learningExperienceService } from './LearningExperienceService'
export { orderService } from './OrderService'
export { priceOptionService } from './PriceOptionService'
export { publicCourseService } from './PublicCourseService'
export { publicTeacherService } from './PublicTeacherService'
export { purchaseService } from './PurchaseService'
export { reservationService } from './ReservationService'
export { reviewService } from './ReviewService'
export { scheduleService } from './ScheduleService'
export { teacherService } from './TeacherService'
export { teacherDashboardService } from './TeacherDashboardService'
export { userAvatarService } from './UserAvatarService'
export { videoService } from './VideoService'

// === 服務類別匯出 ===
export { AdminService } from './AdminService'
export { AuthService } from './AuthService'
export { CartService } from './CartService'
export { CertificateService } from './CertificateService'
export { CourseService } from './CourseService'
export { CourseFileService } from './CourseFileService'
export { CourseVideoService } from './CourseVideoService'
export { FavoriteService } from './FavoriteService'
export { LearningExperienceService } from './LearningExperienceService'
export { OrderService } from './OrderService'
export { PriceOptionService } from './PriceOptionService'
export { PublicCourseService } from './PublicCourseService'
export { PublicTeacherService } from './PublicTeacherService'
export { PurchaseService } from './PurchaseService'
export { ReservationService } from './ReservationService'
export { ReviewService } from './ReviewService'
export { ScheduleService } from './ScheduleService'
export { TeacherService } from './TeacherService'
export { TeacherDashboardService } from './TeacherDashboardService'
export { UserAvatarService } from './UserAvatarService'
export { VideoService } from './VideoService'