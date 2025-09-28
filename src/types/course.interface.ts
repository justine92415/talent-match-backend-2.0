/**
 * 課程相關型別定義
 * 
 * 包含課程建立、管理相關的介面定義
 * 與 Course 實體對應
 * 
 * 注意：價格方案相關型別已遷移至 priceOption.interface.ts
 */

import { CourseStatus } from '@entities/enums'
import { PriceOption, PriceOptionSummary } from './priceOption.interface'

// ==================== 課程相關介面 ====================

/** 可預約時段 */
export interface AvailableSlot {
  slot_id: number
  start_time: string
  end_time: string
  status: 'available' | 'unavailable'
}

/** 查詢可預約時段的回應 */
export interface AvailableSlotsResponse {
  date: string
  available_slots: AvailableSlot[]
}

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
  city: string | null
  district: string | null
  address: string | null
  survey_url: string | null
  purchase_message: string | null
  status: CourseStatus
  submission_notes: string | null
  archive_reason: string | null
  created_at: Date
  updated_at: Date
}

/** 包含價格方案的課程資訊（供編輯使用） */
export interface CourseWithPriceOptions extends CourseBasicInfo {
  price_options: PriceOption[]
}

/** 課程建立請求參數 */
export interface CreateCourseRequest {
  name: string
  content?: string
  main_category_id?: number
  sub_category_id?: number
  city?: string
  district?: string
  address?: string
  survey_url?: string
  purchase_message?: string
}

/** 課程更新請求參數 */
export interface UpdateCourseRequest {
  name?: string
  content?: string
  main_category_id?: number
  sub_category_id?: number
  city?: string
  district?: string
  address?: string
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
// 注意：詳細的價格方案型別已遷移至 priceOption.interface.ts

/** 價格方案驗證資料 */
export interface PriceOptionData {
  price: number
  quantity: number
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
  price_options: PriceOption[]
  categories: {
    main_category: MainCategoryInfo | null
    sub_category: SubCategoryInfo | null
  }
  city: CityInfo | null
}

/** 課程列表回應 */
export interface CourseListResponse {
  courses: Array<Pick<CourseBasicInfo, 
    'id' | 'uuid' | 'name' | 'main_image' | 'status' | 
    'student_count' | 'rate' | 'review_count' | 'created_at' | 'updated_at'
  >>
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
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
  city?: string
  district?: string
  address?: string
  price_options: PriceOptionData[]
}

// ==================== 課程狀態管理相關介面 ====================

/** 課程提交審核請求參數 */
export interface SubmitCourseRequest {
  submission_notes?: string
}

/** 課程重新提交審核請求參數 */
export interface ResubmitCourseRequest {
  submission_notes?: string
}

/** 課程封存請求參數 */
export interface ArchiveCourseRequest {
  archive_reason?: string
}

/** 課程狀態檢查結果 */
export interface CourseStatusCheck {
  canSubmit: boolean
  canResubmit: boolean
  canPublish: boolean
  canArchive: boolean
  canEdit: boolean
  canDelete: boolean
  reason?: string
}