import { AdminUser } from '@entities/AdminUser'
import { Teacher } from '@entities/Teacher'
import { Course } from '@entities/Course'
import { AdminRole } from '@entities/enums'

/**
 * 管理員相關型別定義
 * 集中管理所有管理員功能相關的介面和型別
 */

// === 管理員認證相關型別 ===

/** 管理員登入請求資料 */
export interface AdminLoginRequest {
  /** 管理員帳號 */
  username: string
  /** 管理員密碼 */
  password: string
}

/** 管理員建立請求資料 */
export interface AdminCreateRequest {
  /** 管理員帳號 */
  username: string
  /** 管理員密碼 */
  password: string
  /** 管理員姓名 */
  name: string
  /** 管理員電子郵件 */
  email: string
  /** 管理員角色 */
  role?: AdminRole
}

/** 管理員登入回應資料 */
export interface AdminLoginResponse {
  /** 管理員資訊 */
  admin: AdminUserInfo
  /** 存取令牌 */
  access_token: string
  /** 刷新令牌 */
  refresh_token: string
}

/** 管理員建立回應資料 */
export interface AdminCreateResponse {
  /** 管理員資訊 */
  admin: AdminUserInfo
}

/** 管理員基本資訊 */
export interface AdminUserInfo {
  /** 管理員ID */
  id: number
  /** 管理員帳號 */
  username: string
  /** 管理員姓名 */
  name: string
  /** 管理員電子郵件 */
  email: string
  /** 管理員角色 */
  role: string
  /** 最後登入時間 */
  last_login_at: string | null
}

// === 審核相關型別 ===

/** 審核拒絕請求資料 */
export interface RejectionRequest {
  /** 拒絕原因 */
  rejectionReason: string
}

// === 教師審核相關型別 ===

/** 教師申請審核通過回應資料 */
export interface TeacherApplicationApprovalResponse {
  /** 教師資訊 */
  teacher: TeacherApprovalInfo
  /** 使用者資訊 */
  user: UserRoleInfo
}

/** 教師申請審核拒絕回應資料 */
export interface TeacherApplicationRejectionResponse {
  /** 教師資訊 */
  teacher: TeacherRejectionInfo
}

/** 教師審核通過資訊 */
export interface TeacherApprovalInfo {
  /** 教師ID */
  id: number
  /** 教師唯一識別碼 */
  uuid: string
  /** 使用者ID */
  user_id: number
  /** 申請狀態 */
  application_status: string
  /** 審核完成時間 */
  application_reviewed_at: string
  /** 審核者ID */
  reviewer_id: number
}

/** 教師審核拒絕資訊 */
export interface TeacherRejectionInfo extends TeacherApprovalInfo {
  /** 審核備註或拒絕原因 */
  review_notes: string
}

/** 使用者角色更新資訊 */
export interface UserRoleInfo {
  /** 使用者ID */
  id: number
  /** 使用者角色 */
  role: string
}

// === 課程審核相關型別 ===

/** 課程申請審核通過回應資料 */
export interface CourseApplicationApprovalResponse {
  /** 課程資訊 */
  course: CourseApprovalInfo
}

/** 課程申請審核拒絕回應資料 */
export interface CourseApplicationRejectionResponse {
  /** 課程資訊 */
  course: CourseRejectionInfo
}

/** 課程審核通過資訊 */
export interface CourseApprovalInfo {
  /** 課程ID */
  id: number
  /** 課程唯一識別碼 */
  uuid: string
  /** 開課教師ID */
  teacher_id: number
  /** 課程名稱 */
  name: string
  /** 課程狀態 */
  status: string
  /** 申請審核狀態 */
  application_status: string
  /** 建立時間 */
  created_at: string
  /** 更新時間 */
  updated_at: string
}

/** 課程審核拒絕資訊 */
export type CourseRejectionInfo = CourseApprovalInfo

// === 課程申請列表相關型別 ===

/** 課程申請資訊（用於列表顯示） */
export interface CourseApplicationInfo {
  /** 課程ID */
  id: number
  /** 課程唯一識別碼 */
  uuid: string
  /** 課程名稱 */
  name: string
  /** 開課教師ID */
  teacher_id: number
  /** 教師資訊 */
  teacher: {
    /** 教師ID */
    id: number
    /** 教師姓名 */
    name: string
    /** 教師信箱 */
    email: string | null
  }
  /** 課程詳細描述 */
  content: string | null
  /** 主分類ID */
  main_category_id: number | null
  /** 次分類ID */
  sub_category_id: number | null
  /** 課程狀態 */
  status: string
  /** 提交審核時的備註 */
  submission_notes: string | null
  /** 建立時間 */
  created_at: string
  /** 更新時間 */
  updated_at: string
}

// === 基於實體衍生的業務型別 ===

/** 從 AdminUser 實體衍生的登入驗證型別 */
export type AdminAuthData = Pick<AdminUser, 'username' | 'password' | 'is_active'>

/** 從 AdminUser 實體衍生的個人檔案型別 */
export type AdminProfile = Omit<AdminUser, 'password'>

/** 從 Teacher 實體衍生的審核操作型別 */
export type TeacherReviewUpdate = Pick<Teacher, 'application_status' | 'application_reviewed_at' | 'reviewer_id' | 'review_notes'>

/** 從 Course 實體衍生的審核操作型別 */
export type CourseReviewUpdate = Pick<Course, 'status'>

// === JWT Token 相關型別 ===

/** 管理員 JWT Payload */
export interface AdminTokenPayload {
  /** 管理員ID */
  adminId: number
  /** 管理員帳號 */
  username: string
  /** 管理員角色 */
  role: string
  /** Token 類型 */
  type: 'access' | 'refresh'
}

// === 審核日誌相關型別 ===

/** 審核操作記錄 */
export interface ReviewLogEntry {
  /** 操作類型 */
  action: 'approve' | 'reject'
  /** 目標類型 */
  targetType: 'teacher' | 'course'
  /** 目標ID */
  targetId: number
  /** 審核者ID */
  reviewerId: number
  /** 審核原因（拒絕時使用） */
  reason?: string
  /** 審核時間 */
  reviewedAt: string
}