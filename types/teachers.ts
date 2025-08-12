export interface TeacherApplyRequest {
  nationality: string
  introduction: string
}

export interface TeacherUpdateRequest {
  nationality?: string
  introduction?: string
}

export interface TeacherProfileRequest {
  nationality?: string
  introduction?: string
}

export interface TeacherProfile {
  id: number
  uuid: string
  user_id: number
  nationality: string
  introduction: string
  application_status: 'pending' | 'approved' | 'rejected'
  application_submitted_at: string | null
  application_reviewed_at: string | null
  reviewer_id: number | null
  review_notes: string | null
  total_students: number
  total_courses: number
  average_rating: number
  created_at: string
  updated_at: string
}

export interface TeacherApplicationResponse {
  teacher: TeacherProfile
}

export interface TeacherApplyResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    application: {
      id: number
      user_id: number
      nationality: string
      introduction: string
      application_status: string
      created_at: string
      updated_at: string
    }
  }
  errors?: Record<string, string[]>
}

export interface TeacherProfileResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    teacher: {
      id: number
      user_id: number
      nationality: string
      introduction: string
      application_status: string
      created_at: string
      updated_at: string
    }
  }
  errors?: Record<string, string[]>
}

// 工作經驗相關型別
export interface TeacherWorkExperienceRequest {
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

export interface TeacherWorkExperienceUpdateRequest {
  is_working?: boolean
  company_name?: string
  workplace?: string
  job_category?: string
  job_title?: string
  start_year?: number
  start_month?: number
  end_year?: number
  end_month?: number
}

export interface TeacherWorkExperience {
  id: number
  teacher_id: number
  is_working: boolean
  company_name: string
  workplace: string
  job_category: string
  job_title: string
  start_year: number
  start_month: number
  end_year: number | null
  end_month: number | null
  created_at: string
  updated_at: string
}

export interface TeacherWorkExperienceListResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    work_experiences: TeacherWorkExperience[]
  }
  errors?: Record<string, string[]>
}

export interface TeacherWorkExperienceResponse {
  status: 'success' | 'error'
  message: string
  data?: {
    work_experience: TeacherWorkExperience
  }
  errors?: Record<string, string[]>
}
