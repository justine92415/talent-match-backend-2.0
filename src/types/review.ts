/**
 * 評價系統相關型別定義
 * 
 * 基於實體定義衍生的業務型別，用於：
 * - API 請求/回應資料結構
 * - 服務層業務邏輯處理
 * - 控制器層資料驗證
 * - 資料庫查詢條件
 */

import { Review } from '@entities/Review'
import { Course } from '@entities/Course'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { Reservation } from '@entities/Reservation'

// ============= 評價提交相關型別 =============

/**
 * 評價提交請求資料
 */
export interface ReviewSubmitRequest {
  /** 預約ID（一對一關聯） */
  reservation_id: number
  /** 評分（1-5分） */
  rate: number
  /** 評價內容（50-500字元） */
  comment: string
}

/**
 * 評價提交服務層資料
 */
export interface ReviewCreateData extends ReviewSubmitRequest {
  /** 課程ID（從預約取得） */
  course_id: number
  /** 評價者ID（從認證取得） */
  user_id: number
  /** 被評價的教師ID（從預約取得） */
  teacher_id: number
}

// ============= 評價查詢相關型別 =============

/**
 * 課程評價列表查詢參數（對應驗證 schema）
 */
export interface CourseReviewsQueryParams {
  /** 頁碼 */
  page?: number
  /** 每頁筆數 */
  limit?: number
  /** 評分篩選（1-5） */
  rating?: number
  /** 排序欄位 */
  sort_by?: 'created_at' | 'rating'
  /** 排序順序 */
  sort_order?: 'asc' | 'desc'
}

/**
 * 評價篩選查詢參數
 */
export interface ReviewFilterParams extends CourseReviewsQueryParams {
  /** 評分篩選（1-5） */
  rating?: number
  /** 開始日期 */
  date_from?: string
  /** 結束日期 */
  date_to?: string
  /** 關鍵字搜尋 */
  keyword?: string
}

// ============= 評價回應相關型別 =============

/**
 * 評價基本資訊（公開顯示）
 */
export interface ReviewBasicInfo {
  /** 評價ID */
  id: number
  /** 評分 */
  rate: number
  /** 評價內容 */
  comment: string
  /** 建立時間 */
  created_at: string
}

/**
 * 評價者資訊（公開顯示）
 */
export interface ReviewUserInfo {
  /** 使用者暱稱 */
  nick_name: string
  /** 使用者頭像 */
  avatar_image: string | null
}

/**
 * 課程基本資訊（評價中顯示）
 */
export interface ReviewCourseInfo {
  /** 課程ID */
  id: number
  /** 課程名稱 */
  name: string
  /** 課程封面圖片 */
  main_image: string | null
}

/**
 * 教師基本資訊（評價中顯示）
 */
export interface ReviewTeacherInfo {
  /** 教師用戶資訊 */
  user: {
    /** 暱稱 */
    nick_name: string
  }
}

/**
 * 預約基本資訊（評價中顯示）
 */
export interface ReviewReservationInfo {
  /** 預約ID */
  id: number
  /** 預約時間 */
  reserve_time: string
}

/**
 * 公開課程評價項目
 */
export interface PublicReviewItem extends ReviewBasicInfo {
  /** 評價者資訊 */
  user: ReviewUserInfo
}

/**
 * 我的評價項目
 */
export interface MyReviewItem extends ReviewBasicInfo {
  /** 課程資訊 */
  course: ReviewCourseInfo
  /** 教師資訊 */
  teacher: ReviewTeacherInfo
  /** 預約資訊 */
  reservation: ReviewReservationInfo
}

/**
 * 教師收到的評價項目
 */
export interface ReceivedReviewItem extends ReviewBasicInfo {
  /** 評價者資訊 */
  user: ReviewUserInfo
  /** 課程資訊 */
  course: ReviewCourseInfo
  /** 預約資訊 */
  reservation: ReviewReservationInfo
}

// ============= 評價統計相關型別 =============

/**
 * 評分分佈統計
 */
export interface RatingDistribution {
  /** 5星評價 */
  '5_star': {
    count: number
    percentage: number
  }
  /** 4星評價 */
  '4_star': {
    count: number
    percentage: number
  }
  /** 3星評價 */
  '3_star': {
    count: number
    percentage: number
  }
  /** 2星評價 */
  '2_star': {
    count: number
    percentage: number
  }
  /** 1星評價 */
  '1_star': {
    count: number
    percentage: number
  }
}

/**
 * 月度趨勢資料
 */
export interface MonthlyTrend {
  /** 月份（YYYY-MM） */
  month: string
  /** 評價數量 */
  review_count: number
  /** 平均評分 */
  average_rating: number
}

/**
 * 關鍵字統計
 */
export interface KeywordStat {
  /** 關鍵字 */
  keyword: string
  /** 出現次數 */
  count: number
}

/**
 * 課程評價統計摘要
 */
export interface CourseReviewStats {
  /** 課程基本資訊 */
  course_info: {
    id: number
    name: string
    total_reviews: number
    average_rating: number
  }
  /** 評分分佈 */
  rating_distribution: RatingDistribution
  /** 月度趨勢 */
  monthly_trends: MonthlyTrend[]
  /** 熱門關鍵字 */
  top_keywords: KeywordStat[]
}

/**
 * 我的評價摘要統計
 */
export interface MyReviewsSummary {
  /** 總評價數 */
  total_reviews: number
  /** 給出的平均評分 */
  average_rating_given: number
  /** 已評價的課程數 */
  courses_reviewed: number
}

/**
 * 教師收到評價摘要統計
 */
export interface ReceivedReviewsSummary {
  /** 總評價數 */
  total_reviews: number
  /** 平均評分 */
  average_rating: number
  /** 評分分佈 */
  rating_distribution: {
    '5_star': number
    '4_star': number
    '3_star': number
    '2_star': number
    '1_star': number
  }
}

// ============= 評價回應格式型別 =============

/**
 * 評價提交成功回應
 */
export interface ReviewSubmitResponse {
  /** 建立的評價記錄 */
  review: {
    id: number
    uuid: string
    reservation_id: number
    course_id: number
    user_id: number
    teacher_id: number
    rate: number
    comment: string
    is_visible: boolean
    created_at: string
  }
  /** 課程統計更新資訊 */
  course_updated: {
    course_id: number
    new_average_rate: number
    new_review_count: number
  }
}

/**
 * 課程評價列表回應
 */
export interface CourseReviewsResponse {
  /** 評價列表 */
  reviews: PublicReviewItem[]
  /** 分頁資訊 */
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  /** 課程基本資訊 */
  course_info: {
    id: number
    name: string
    average_rate: number
    review_count: number
  }
}

/**
 * 我的評價列表回應
 */
export interface MyReviewsResponse {
  /** 評價列表 */
  reviews: MyReviewItem[]
  /** 分頁資訊 */
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  /** 摘要統計 */
  summary: MyReviewsSummary
}

/**
 * 教師收到評價列表回應
 */
export interface ReceivedReviewsResponse {
  /** 評價列表 */
  reviews: ReceivedReviewItem[]
  /** 分頁資訊 */
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  /** 摘要統計 */
  summary: ReceivedReviewsSummary
}

/**
 * 評價篩選回應
 */
export interface ReviewFilterResponse {
  /** 評價列表 */
  reviews: PublicReviewItem[]
  /** 分頁資訊 */
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  /** 已應用的篩選條件 */
  filters_applied: {
    rating?: number
    date_from?: string
    date_to?: string
    keyword?: string
    sort?: string
  }
  /** 篩選結果摘要 */
  filter_results_summary: {
    total_matching: number
    average_rating: number
  }
}

// ============= 工具型別 =============

/**
 * 評價實體基本欄位（基於實體 Omit 部分欄位）
 */
export type ReviewEntityBase = Omit<Review, 'created_at' | 'updated_at' | 'deleted_at'>

/**
 * 評價實體創建資料（Omit 自動生成欄位）
 */
export type ReviewEntityCreateData = Omit<Review, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>

/**
 * 評價查詢條件基本型別
 */
export interface ReviewQueryCondition {
  course_id?: number
  user_id?: number
  teacher_id?: number
  is_visible?: boolean
  rate?: number
}

/**
 * 評價排序選項
 */
export type ReviewSortOption = 'newest' | 'oldest' | 'rating_high' | 'rating_low'

/**
 * 分頁參數型別
 */
export interface PaginationParams {
  page: number
  per_page: number
}

/**
 * 分頁資訊回應型別
 */
export interface PaginationInfo {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}