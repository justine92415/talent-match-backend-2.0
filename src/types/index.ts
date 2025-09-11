export * from './handleErrorAsync.interface'
export * from './auth.interface'
export * from './admin.interface'
export * from './teacher.interface'
export * from './teacherDashboard.interface'
export * from './validation.interface'
export * from './api.interface'
export * from './test.interface'
export * from './schedule.interface'
export * from './course.interface'
export * from './priceOption.interface'
export * from './video.interface'
export * from './courseVideo.interface'
export * from './courseFile.interface'
export * from './publicCourse.interface'
export * from './publicTeacher.interface'
export * from './cart.interface'
export * from './order.interface'
export * from './payment.interface'
export * from './reservation.interface'
export * from './fileUpload.interface'

// 解決命名衝突：明確重新匯出評價相關型別
export {
  ReviewSubmitRequest,
  ReviewCreateData,
  CourseReviewsQueryParams,
  MyReviewsQueryParams,
  ReceivedReviewsQueryParams,
  ReviewFilterParams,
  ReviewBasicInfo,
  ReviewUserInfo,
  ReviewCourseInfo,
  ReviewTeacherInfo,
  ReviewReservationInfo,
  PublicReviewItem,
  MyReviewItem,
  ReceivedReviewItem,
  MonthlyTrend,
  KeywordStat,
  CourseReviewStats,
  MyReviewsSummary,
  ReceivedReviewsSummary,
  ReviewSubmitResponse,
  CourseReviewsResponse,
  MyReviewsResponse,
  ReceivedReviewsResponse,
  ReviewFilterResponse,
  ReviewEntityBase,
  ReviewEntityCreateData,
  ReviewQueryCondition,
  ReviewSortOption,
  PaginationParams
} from './review'

// 明確指定匯出來源以避免衝突
export type { RatingDistribution as ReviewRatingDistribution } from './review'
export type { PaginationInfo as ReviewPaginationInfo } from './review'