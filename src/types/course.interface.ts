/**
 * 課程相關型別定義
 * 
 * 包含課程建立、管理、價格方案相關的介面定義
 * 與 Course、CoursePriceOption 等實體對應
 */

import { CourseStatus, ApplicationStatus } from '@entities/enums'

// ==================== 課程相關介面 ====================

/** 課程基本資訊 */
export interface CourseBasicInfo {
  id: number
  uuid: string
  teacher_id: number
  name: string
  content: string | null
  main_image: string | null
  rate: number
  review_count: number
  view_count: number
  purchase_count: number
  student_count: number
  main_category_id: number | null
  sub_category_id: number | null
  city_id: number | null
  dist_id: string | null
  survey_url: string | null
  purchase_message: string | null
  status: CourseStatus
  application_status: ApplicationStatus | null
  submission_notes: string | null
  archive_reason: string | null
  created_at: Date
  updated_at: Date
}

/** 課程建立請求參數 */
export interface CreateCourseRequest {
  name: string
  content: string
  main_category_id: number
  sub_category_id: number
  city_id: number
  survey_url?: string
  purchase_message?: string
}

/** 課程更新請求參數 */
export interface UpdateCourseRequest {
  name?: string
  content?: string
  main_category_id?: number
  sub_category_id?: number
  city_id?: number
  survey_url?: string
  purchase_message?: string
  price_options?: string  // JSON 字串格式
}

/** 課程查詢參數 */
export interface CourseQueryParams {
  status?: CourseStatus
  page?: number
  per_page?: number
}

/** 課程列表查詢參數 */
export interface CourseListQuery {
  page?: number
  limit?: number
}

// ==================== 價格方案相關介面 ====================

/** 價格方案基本資訊 */
export interface PriceOptionInfo {
  id: number
  uuid: string
  course_id: number
  price: number
  quantity: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

/** 價格方案請求資料 */
export interface PriceOptionRequest {
  price: number
  quantity: number
}

/** 價格方案統計資訊 */
export interface PriceOptionSummary {
  total_options: number
  active_options: number
  min_price: number
  max_price: number
}

// ==================== 分類和地區相關介面 ====================

/** 主分類資訊 */
export interface MainCategoryInfo {
  id: number
  name: string
  icon_url: string | null
  display_order: number
  is_active: boolean
}

/** 次分類資訊 */
export interface SubCategoryInfo {
  id: number
  main_category_id: number
  name: string
  display_order: number
  is_active: boolean
}

/** 城市資訊 */
export interface CityInfo {
  id: number
  city_code: string
  city_name: string
  is_active: boolean
}

// ==================== API 回應格式介面 ====================

/** 課程詳情回應（簡化版，不包含檔案和影片） */
export interface CourseDetailResponse {
  course: CourseBasicInfo
  price_options: PriceOptionInfo[]
  categories: {
    main_category: MainCategoryInfo | null
    sub_category: SubCategoryInfo | null
  }
  city: CityInfo | null
}

/** 課程列表回應 */
export interface CourseListResponse {
  courses: Array<Pick<CourseBasicInfo, 
    'id' | 'uuid' | 'name' | 'main_image' | 'status' | 'application_status' | 
    'student_count' | 'rate' | 'review_count' | 'created_at' | 'updated_at'
  >>
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/** 價格方案列表回應 */
export interface PriceOptionListResponse {
  price_options: PriceOptionInfo[]
  summary: PriceOptionSummary
}

// ==================== 驗證相關介面 ====================

/** 價格方案驗證資料 */
export interface PriceOptionData {
  price: number
  quantity: number
}

/** 課程提交審核驗證資料 */
export interface CourseSubmissionValidation {
  name: string
  content: string
  main_category_id: number
  sub_category_id: number
  city_id: number
  price_options: PriceOptionData[]
}