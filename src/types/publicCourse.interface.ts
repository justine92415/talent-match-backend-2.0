/**
 * 公開課程瀏覽搜尋相關型別定義
 * 
 * 包含課程瀏覽、搜尋、收藏功能相關的介面定義
 * 適用於前端使用者瀏覽課程的場景
 */

// ==================== 公開課程查詢參數介面 ====================

/** 公開課程列表查詢參數 */
export interface PublicCourseQuery {
  // 搜尋方式（互斥）
  keyword?: string              // 關鍵字搜尋
  main_category_id?: number     // 主分類ID
  sub_category_id?: number      // 次分類ID

  // 篩選條件
  city?: string                // 城市篩選

  // 排序方式
  sort?: 'newest' | 'popular' | 'price_low' | 'price_high'

  // 分頁參數
  page?: number                // 頁碼，預設1
  per_page?: number            // 每頁筆數，預設12
}

/** 公開課程搜尋篩選器 */
export interface PublicCourseFilters {
  keyword?: string
  main_category_id?: number
  sub_category_id?: number
  city?: string
  sort: string
}

// ==================== 公開課程資料格式介面 ====================

/** 分類資訊（簡化版） */
export interface CategorySummary {
  id: number
  name: string
}

/** 城市資訊（簡化版） */
export interface CitySummary {
  id: number
  city_name: string
}

/** 教師用戶資訊（簡化版） */
export interface TeacherUserSummary {
  name: string
  nick_name: string
  avatar_image?: string
}

/** 教師資訊（簡化版） */
export interface TeacherSummary {
  id: number
  user: TeacherUserSummary
}

/** 公開課程列表項目 */
export interface PublicCourseItem {
  id: number
  uuid: string
  name: string
  main_image?: string | null
  rate: number
  review_count: number
  student_count: number
  min_price: number
  max_price: number
  main_category: CategorySummary
  sub_category: CategorySummary
  city?: string | null
  district?: string | null
  address?: string | null
  teacher: TeacherSummary
  created_at: string
}

/** 分頁資訊 */
export interface PaginationInfo {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

/** 公開課程列表回應 */
export interface PublicCourseListResponse {
  courses: PublicCourseItem[]
  pagination: PaginationInfo
  filters: PublicCourseFilters
}

// ==================== 課程詳情相關介面 ====================

/** 價格方案（公開版） */
export interface PublicPriceOption {
  id: number
  uuid: string
  price: number
  quantity: number
}

/** 課程影片（公開版） */
export interface PublicCourseVideo {
  id: number
  name: string
  category: string | null
  intro: string
  url: string
  video_type: 'storage' | 'youtube'
  is_preview: boolean
}

/** 課程檔案（公開版） */
export interface PublicCourseFile {
  id: number
  name: string
  url: string
}

/** 教師詳細資訊（公開版） */
export interface PublicTeacherDetail {
  id: number
  user: {
    name: string
    nick_name: string
    avatar_image?: string
  }
  city?: string
  district?: string
  address?: string
  introduction?: string
  total_students: number
  total_courses: number
  average_rating: number
  total_completed_lessons: number
}

/** 教師工作經驗（公開版） */
export interface PublicWorkExperience {
  id: number
  company_name: string
  job_title: string
  start_year: number
  end_year: number | null
}

/** 教師學習經歷（公開版） */
export interface PublicLearningExperience {
  id: number
  school_name: string
  department: string
  degree: string
  start_year: number
  end_year: number | null
}

/** 教師證書（公開版） */
export interface PublicTeacherCertificate {
  id: number
  license_name: string
}

/** 教師可預約時段 */
export interface TeacherAvailableSlot {
  weekday: number
  start_time: string
  end_time: string
}

/** 時段狀態 */
export type SlotStatus = 'unavailable' | 'available' | 'reserved'

/** 課程時段 */
export interface CourseSlot {
  time: string
  status: SlotStatus
}

/** 每日課程表 */
export interface DaySchedule {
  week: string
  date: string
  slots: CourseSlot[]
}

/** 課程評價（公開版） */
export interface PublicReview {
  id: number
  rate: number
  comment: string
  user: {
    nick_name: string
    avatar_image?: string
  }
  created_at: string
}

/** 推薦課程項目 */
export interface RecommendedCourse {
  id: number
  uuid: string
  name: string
  main_image?: string
  rate: number
  min_price: number
  teacher: {
    user: {
      nick_name: string
    }
  }
}

/** 公開課程詳情 */
export interface PublicCourseDetail {
  id: number
  uuid: string
  name: string
  content?: string | null
  main_image?: string | null
  rate: number
  review_count: number
  student_count: number
  survey_url?: string | null
  purchase_message?: string | null
  city?: string | null
  district?: string | null
  address?: string | null
  main_category: CategorySummary
  sub_category: CategorySummary
  created_at: string
}

/** 公開課程詳情回應 */
export interface PublicCourseDetailResponse {
  course: PublicCourseDetail
  price_options: PublicPriceOption[]
  videos: PublicCourseVideo[]
  files: PublicCourseFile[]
  teacher: PublicTeacherDetail
  teacher_work_experiences: PublicWorkExperience[]
  teacher_learning_experiences: PublicLearningExperience[]
  teacher_certificates: PublicTeacherCertificate[]
  schedule: DaySchedule[]
  recent_reviews: PublicReview[]
  recommended_courses: RecommendedCourse[]
}

// ==================== 收藏功能相關介面 ====================

/** 新增收藏請求參數 */
export interface AddFavoriteRequest {
  course_id: number
}

/** 收藏記錄資訊 */
export interface FavoriteInfo {
  id: number
  uuid: string
  user_id: number
  course_id: number
  created_at: string
}

/** 收藏記錄回應 */
export interface AddFavoriteResponse {
  favorite: FavoriteInfo
}

/** 收藏列表中的課程資訊 */
export interface FavoriteCourseItem {
  id: number
  uuid: string
  name: string
  main_image?: string
  rate: number
  min_price: number
  teacher: {
    user: {
      nick_name: string
    }
  }
}

/** 收藏列表項目 */
export interface FavoriteItem {
  id: number
  created_at: string
  course: FavoriteCourseItem
}

/** 收藏列表查詢參數 */
export interface FavoriteListQuery {
  page?: number
  per_page?: number
}

/** 收藏列表回應 */
export interface FavoriteListResponse {
  favorites: FavoriteItem[]
  pagination: PaginationInfo
}

// ==================== 教師公開資料相關介面 ====================

/** 教師公開資料回應 */
export interface PublicTeacherResponse {
  teacher: {
    id: number
    user: {
      name: string
      nick_name: string
      avatar_image?: string
    }
    city?: string
    district?: string
    address?: string
    introduction?: string
    total_students: number
    total_courses: number
    average_rating: number
    total_earnings: number // 固定為 0.00，不顯示實際金額
  }
}

/** 教師課程列表查詢參數 */
export interface TeacherCourseQuery {
  page?: number
  per_page?: number
}

/** 教師課程列表項目 */
export interface TeacherCourseItem {
  id: number
  uuid: string
  name: string
  main_image?: string
  rate: number
  review_count: number
  student_count: number
  min_price: number
  created_at: string
}

/** 教師課程列表回應 */
export interface TeacherCourseListResponse {
  courses: TeacherCourseItem[]
  pagination: PaginationInfo
}

// ==================== 課程評價相關介面 ====================

/** 課程評價查詢參數 */
export interface CourseReviewQuery {
  page?: number
  per_page?: number
  rating?: number // 1-5 星級篩選
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low'
}

/** 課程評價統計資料 */
export interface CourseRatingStats {
  average_rating: number
  total_reviews: number
  rating_1_count: number
  rating_2_count: number
  rating_3_count: number
  rating_4_count: number
  rating_5_count: number
}

/** 課程評價列表回應 */
export interface CourseReviewListResponse {
  reviews: PublicReview[]
  pagination: PaginationInfo
  rating_stats: CourseRatingStats
}