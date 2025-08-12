export interface TeacherApplyRequest {
  nationality: string
  introduction: string
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
  teacher: {
    id: number
    uuid: string
    user_id: number
    nationality: string
    introduction: string
    application_status: 'pending'
    application_submitted_at: string | null
    created_at: string
  }
}
