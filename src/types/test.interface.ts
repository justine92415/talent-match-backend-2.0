import { User } from '../entities/User'
import { Teacher } from '../entities/Teacher'
import { UserRole, AccountStatus, ApplicationStatus } from '../entities/enums'

/**
 * 測試用使用者建立資料介面
 */
export interface TestUserCreateData {
  uuid?: string
  google_id?: string | null
  name?: string | null
  nick_name?: string
  email?: string
  password?: string | null
  birthday?: Date | null
  contact_phone?: string | null
  avatar_image?: string | null
  avatar_google_url?: string | null
  role?: UserRole
  account_status?: AccountStatus
  password_reset_token?: string | null
  password_reset_expires_at?: Date | null
  last_login_at?: Date | null
  login_attempts?: number
  locked_until?: Date | null
}

/**
 * 測試用教師建立資料介面
 */
export interface TestTeacherCreateData {
  uuid?: string
  user_id?: number
  nationality?: string
  introduction?: string
  application_status?: ApplicationStatus
  application_submitted_at?: Date | undefined
  application_reviewed_at?: Date | undefined
  reviewer_id?: number | undefined
  review_notes?: string | undefined
}

/**
 * 測試用使用者與認證 Token 組合
 */
export interface TestUserWithToken {
  user: User
  authToken: string
}

/**
 * 測試用使用者變體集合
 */
export interface TestUserVariations {
  student: TestUserWithToken
  teacher: TestUserWithToken
  suspended: TestUserWithToken
}

/**
 * 測試用教師申請變體集合
 */
export interface TestTeacherApplicationVariations {
  pending: Teacher
  approved: Teacher
  rejected: Teacher
}

/**
 * 測試用完整教師環境
 */
export interface TestTeacherEnvironment {
  user: User
  teacher: Teacher
  authToken: string
}

/**
 * HTTP 請求方法型別
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'delete'

/**
 * 測試請求資料型別
 */
export type TestRequestData = Record<string, unknown> | undefined

/**
 * 測試驗證期望結構型別
 */
export type TestValidationStructure = Record<string, unknown>

/**
 * 資料庫查詢條件型別
 */
export type DatabaseQueryCondition = Record<string, unknown>

/**
 * 測試函式型別
 */
export type TestFunction = () => Promise<unknown>