/**
 * 教師申請請求介面
 */
export interface TeacherApplicationData {
  city: string
  district: string
  address: string
  main_category_id: number
  sub_category_ids: number[]
  introduction: string
}

/**
 * 教師申請更新請求介面
 */
export interface TeacherApplicationUpdateData {
  city?: string
  district?: string
  address?: string
  main_category_id?: number
  sub_category_ids?: number[]
  introduction?: string
}

/**
 * 教師基本資料介面
 */
export interface TeacherProfileData {
  id: number
  uuid: string
  user_id: number
  city: string
  district: string
  address: string
  main_category_id: number
  sub_category_ids: number[]
  introduction: string
  application_status: string
  application_submitted_at: Date | null
  application_reviewed_at: Date | null
  reviewer_id: number | null
  review_notes: string | null
  total_students: number
  total_courses: number
  average_rating: number
  total_earnings: number
  created_at: Date
  updated_at: Date
}

/**
 * 教師基本資料更新請求介面
 */
export interface TeacherProfileUpdateRequest {
  city?: string
  district?: string
  address?: string
  main_category_id?: number
  sub_category_ids?: number[]
  introduction?: string
}

/**
 * 工作經驗資料介面
 */
export interface WorkExperienceData {
  id?: number
  teacher_id?: number
  is_working: boolean
  company_name: string
  workplace: string
  job_category: string
  job_title: string
  start_year: number
  start_month: number
  end_year: number | null
  end_month: number | null
}

/**
 * 工作經驗建立請求介面
 */
export interface CreateWorkExperienceRequest {
  is_working: boolean
  company_name: string
  workplace: string
  job_category: string
  job_title: string
  start_year: number
  start_month: number
  end_year?: number
  end_month?: number
}

/**
 * 工作經驗更新請求介面
 */
export interface UpdateWorkExperienceRequest {
  is_working?: boolean
  company_name?: string
  workplace?: string
  job_category?: string
  job_title?: string
  start_year?: number
  start_month?: number
  end_year?: number | null
  end_month?: number | null
}

/**
 * 學習經歷建立請求介面
 */
export interface CreateLearningExperienceRequest {
  is_in_school: boolean
  degree: string
  school_name: string
  department: string
  region: boolean
  start_year: number
  start_month: number
  end_year?: number | null
  end_month?: number | null
  // TODO: 檔案上傳系統完成後新增
  // certificate_file?: File | Express.Multer.File
}

/**
 * 學習經歷更新請求介面
 */
export interface UpdateLearningExperienceRequest {
  is_in_school?: boolean
  degree?: string
  school_name?: string
  department?: string
  region?: boolean
  start_year?: number
  start_month?: number
  end_year?: number | null
  end_month?: number | null
  // TODO: 檔案上傳系統完成後新增
  // certificate_file?: File | Express.Multer.File
}

/**
 * 學習經歷資料介面
 */
export interface LearningExperienceData {
  id: number
  teacher_id: number
  is_in_school: boolean
  degree: string
  school_name: string
  department: string
  region: boolean
  start_year: number
  start_month: number
  end_year: number | null
  end_month: number | null
  file_path: string | null // TODO: 檔案上傳系統完成後完善檔案處理
  created_at: Date
  updated_at: Date
}

/**
 * 證書資料介面
 */
export interface CertificateData {
  id?: number
  teacher_id?: number
  verifying_institution: string
  license_name: string
  holder_name: string
  license_number: string
  category_id: string
  subject: string
  file_path: string
}

/**
 * 證書建立請求介面
 */
export interface CreateCertificateRequest {
  verifying_institution: string
  license_name: string
  holder_name: string
  license_number: string
  category_id: string
  subject: string
}

/**
 * 證書更新請求介面
 */
export interface UpdateCertificateRequest {
  verifying_institution?: string
  license_name?: string
  holder_name?: string
  license_number?: string
  category_id?: string
  subject?: string
}

/**
 * 教師時間管理資料介面
 */
export interface TeacherScheduleData {
  id?: number
  teacher_id?: number
  weekday: number
  start_time: string
  end_time: string
  is_active: boolean
}

/**
 * 教師時間衝突檢查介面
 */
export interface ScheduleConflict {
  weekday: number
  start_time: string
  end_time: string
  conflicted_slots: TeacherScheduleData[]
}

/**
 * 學習經歷回應介面
 */
export interface LearningExperienceResponse {
  id: number
  teacher_id: number
  is_in_school: boolean
  degree: string
  school_name: string
  department: string
  region: boolean
  start_year: number
  start_month: number
  end_year: number | null
  end_month: number | null
  file_path: string | null // TODO: 檔案路徑處理
  created_at: string
  updated_at: string
}

export interface FileUploadResponse {
  file_path: string
  original_name: string
  file_size: number
  mime_type: string
}