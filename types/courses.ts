// 課程相關型別定義

export interface CreateCourseRequest {
  name: string // 課程名稱
  content?: string // 課程描述（草稿時可選）
  main_category_id?: number // 主分類ID（草稿時可選）
  sub_category_id?: number // 次分類ID（草稿時可選）
  city_id?: number // 城市ID（草稿時可選）
  survey_url?: string // 問卷網址（選填）
  purchase_message?: string // 購買後訊息（選填）
}

export interface UpdateCourseRequest {
  name?: string // 課程名稱
  content?: string // 課程描述
  main_category_id?: number // 主分類ID
  sub_category_id?: number // 次分類ID
  city_id?: number // 城市ID
  survey_url?: string // 問卷網址
  purchase_message?: string // 購買後訊息
}

// 課程狀態管理相關型別
export interface CourseStatusUpdateRequest {
  review_notes?: string // 審核備註（管理員使用）
}

export interface CourseSubmitRequest {
  // 提交審核時可能需要的額外資訊
  submission_notes?: string // 提交說明
}

export interface CoursePublishRequest {
  // 發布時可能需要的設定
  publish_notes?: string // 發布說明
}

export interface CourseArchiveRequest {
  // 封存時的原因
  archive_reason?: string // 封存原因
}

export interface CourseListQuery {
  status?: 'draft' | 'published' | 'archived' // 課程狀態篩選
  page?: number // 頁碼，預設1
  per_page?: number // 每頁筆數，預設10
}

export interface CourseResponse {
  id: number
  uuid: string
  teacher_id: number
  name: string
  main_image?: string
  content?: string
  rate: number
  review_count: number
  view_count: number
  purchase_count: number
  student_count: number
  main_category_id?: number
  sub_category_id?: number
  city_id?: number
  survey_url?: string
  purchase_message?: string
  status: string
  application_status?: string | null
  submission_notes?: string
  archive_reason?: string
  created_at: string
  updated_at: string
}

export interface CourseListResponse {
  courses: CourseResponse[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface CoursePriceOptionResponse {
  id: number
  uuid: string
  course_id: number
  price: number
  quantity: number
  created_at: string
  updated_at: string
}
