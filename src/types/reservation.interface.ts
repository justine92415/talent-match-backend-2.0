import { ReservationStatus } from '@entities/enums'

/**
 * 預約管理系統相關介面定義
 * 基於現有 Reservation 實體和 ReservationStatus 枚舉
 */

/** 預約基本資訊 */
export interface ReservationInfo {
  /** 預約ID */
  id: number
  /** 預約唯一識別碼 */
  uuid: string
  /** 課程ID */
  course_id: number
  /** 教師ID */
  teacher_id: number
  /** 學生ID */
  student_id: number
  /** 預約上課時間 */
  reserve_time: Date
  /** 教師端預約狀態 */
  teacher_status: ReservationStatus
  /** 學生端預約狀態 */
  student_status: ReservationStatus
  /** 拒絕原因（當狀態為 cancelled 時） */
  rejection_reason?: string | null
  /** 建立時間 */
  created_at: Date
  /** 更新時間 */
  updated_at: Date
}

/** 預約詳細資訊（含關聯資料） */
export interface ReservationDetail extends ReservationInfo {
  /** 課程資訊（可選，以優化效能） */
  course?: {
    id: number
    name: string
    teacher: {
      user: {
        nick_name: string
        avatar_image?: string
      }
    }
  }
  /** 參與者資訊（根據角色顯示對方資料） */
  participant?: {
    id: number
    nick_name: string
    role: 'student' | 'teacher'
    avatar_image?: string
  }
}

/** 建立預約請求 */
export interface CreateReservationRequest {
  /** 課程ID */
  course_id: number
  /** 教師ID */
  teacher_id: number
  /** 預約日期 (YYYY-MM-DD) */
  reserve_date: string
  /** 預約時間 (HH:mm) */
  reserve_time: string
}

/** 建立預約回應 */
export interface CreateReservationResponse {
  /** 預約資訊 */
  reservation: ReservationDetail
  /** 剩餘堂數資訊 */
  remaining_lessons: {
    /** 總堂數 */
    total: number
    /** 已使用堂數 */
    used: number
    /** 剩餘堂數 */
    remaining: number
  }
}

/** 預約列表查詢參數 */
export interface ReservationListQuery {
  /** 角色篩選 (teacher, student) */
  role?: 'teacher' | 'student'
  /** 狀態篩選 */
  status?: ReservationStatus
  /** 課程篩選 */
  course_id?: number
  /** 開始日期 (YYYY-MM-DD) */
  date_from?: string
  /** 結束日期 (YYYY-MM-DD) */
  date_to?: string
  /** 頁碼 */
  page?: number
  /** 每頁筆數 */
  per_page?: number
}

/** 預約列表回應 */
export interface ReservationListResponse {
  /** 預約列表 */
  reservations: ReservationDetail[]
  /** 分頁資訊 */
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/** 更新預約狀態請求 */
export interface UpdateReservationStatusRequest {
  /** 狀態類型 (teacher-complete, student-complete) */
  status_type: 'teacher-complete' | 'student-complete'
  /** 備註或回饋 (可選) */
  notes?: string
}

/** 更新預約狀態回應 */
export interface UpdateReservationStatusResponse {
  /** 更新後的預約資訊 */
  reservation: ReservationDetail
  /** 是否完全完成 (雙方都確認完成) */
  is_fully_completed: boolean
}

/** 取消預約回應 */
export interface CancelReservationResponse {
  /** 更新後的預約資訊 */
  reservation: {
    id: number
    uuid: string
    teacher_status: ReservationStatus
    student_status: ReservationStatus
    updated_at: Date
  }
  /** 退回的堂數 */
  refunded_lessons: number
}

/** 日曆檢視查詢參數 */
export interface CalendarViewQuery {
  /** 檢視模式 */
  view: 'week' | 'month'
  /** 基準日期 (YYYY-MM-DD) */
  date: string
  /** 角色 */
  role?: 'teacher' | 'student'
}

/** 日曆預約資訊 */
export interface CalendarReservation {
  /** 預約ID */
  id: number
  /** 預約唯一識別碼 */
  uuid: string
  /** 時間 (HH:mm) */
  time: string
  /** 持續時間（分鐘） */
  duration: number
  /** 預約狀態 */
  status: 'reserved' | 'completed' | 'cancelled'
  /** 課程資訊 */
  course: {
    id: number
    name: string
  }
  /** 參與者資訊 */
  participant: {
    id: number
    nick_name: string
    role: 'student' | 'teacher'
    avatar_image?: string
  }
}

/** 日曆可預約時段 */
export interface CalendarAvailableSlot {
  /** 時間 (HH:mm) */
  time: string
  /** 是否可預約 */
  is_available: boolean
}

/** 日曆日期資料 */
export interface CalendarDayData {
  /** 日期 (YYYY-MM-DD) */
  date: string
  /** 星期幾 (0=週日, 1=週一...6=週六) */
  weekday: number
  /** 星期名稱 */
  weekday_name: string
  /** 預約列表 */
  reservations: CalendarReservation[]
  /** 可預約時段 (僅週檢視) */
  available_slots?: CalendarAvailableSlot[]
}

/** 日曆月檢視日期資料 */
export interface CalendarMonthDayData {
  /** 日期 (YYYY-MM-DD) */
  date: string
  /** 星期幾 (0=週日, 1=週一...6=週六) */
  weekday: number
  /** 預約數量 */
  reservation_count: number
  /** 可預約時段數量 */
  available_slot_count: number
  /** 簡化預約列表 */
  reservations: Array<{
    id: number
    time: string
    status: ReservationStatus
    course_name: string
    participant_name: string
  }>
}

/** 週檢視回應 */
export interface WeekCalendarResponse {
  /** 檢視模式 */
  view: 'week'
  /** 期間 */
  period: {
    start_date: string
    end_date: string
  }
  /** 日曆資料 */
  calendar_data: CalendarDayData[]
}

/** 月檢視回應 */
export interface MonthCalendarResponse {
  /** 檢視模式 */
  view: 'month'
  /** 期間 */
  period: {
    year: number
    month: number
    start_date: string
    end_date: string
  }
  /** 日曆資料 */
  calendar_data: CalendarMonthDayData[]
  /** 統計摘要 */
  summary: {
    total_reservations: number
    completed_reservations: number
    upcoming_reservations: number
  }
}

/** 日曆檢視回應 */
export type CalendarViewResponse = WeekCalendarResponse | MonthCalendarResponse

/** 預約業務規則檢查 */
export interface ReservationValidation {
  /** 是否已購買課程 */
  has_purchased_course: boolean
  /** 剩餘堂數 */
  remaining_lessons: number
  /** 是否提前24小時預約 */
  is_advance_booking_valid: boolean
  /** 該時段是否在教師可預約時間內 */
  is_slot_available: boolean
  /** 該具體時段是否已被預約 */
  is_slot_occupied: boolean
  /** 檢查時間 */
  checked_at: Date
}

/** 預約衝突資訊 */
export interface ReservationConflict {
  /** 衝突類型 */
  type: 'slot_occupied' | 'teacher_unavailable' | 'course_not_purchased' | 'insufficient_lessons'
  /** 衝突描述 */
  message: string
  /** 衝突的預約ID（如果存在） */
  conflicting_reservation_id?: number
  /** 衝突時間 */
  conflict_time: Date
}

/** 預約服務介面 */
export interface ReservationService {
  /** 建立預約 */
  createReservation(studentId: number, data: CreateReservationRequest): Promise<CreateReservationResponse>
  
  /** 取得預約列表 */
  getReservations(userId: number, userRole: 'teacher' | 'student', query: ReservationListQuery): Promise<ReservationListResponse>
  
  /** 更新預約狀態 */
  updateReservationStatus(reservationId: number, userId: number, data: UpdateReservationStatusRequest): Promise<UpdateReservationStatusResponse>
  
  /** 取消預約 */
  cancelReservation(reservationId: number, userId: number): Promise<CancelReservationResponse>
  
  /** 取得日曆檢視 */
  getCalendarView(userId: number, userRole: 'teacher' | 'student', query: CalendarViewQuery): Promise<CalendarViewResponse>
  
  /** 驗證預約條件 */
  validateReservation(studentId: number, data: CreateReservationRequest): Promise<ReservationValidation>
  
  /** 檢查預約衝突 */
  checkReservationConflicts(data: CreateReservationRequest): Promise<ReservationConflict[]>
}

/** API 回應包裝器 */
export interface ReservationApiResponse<T> {
  /** 狀態 */
  status: 'success' | 'error'
  /** 訊息 */
  message: string
  /** 資料 */
  data?: T
  /** 錯誤詳情 */
  errors?: Record<string, string[]>
}

/** 預約統計資訊 */
export interface ReservationStats {
  /** 總預約數 */
  total_reservations: number
  /** 已完成預約數 */
  completed_reservations: number
  /** 進行中預約數 */
  ongoing_reservations: number
  /** 已取消預約數 */
  cancelled_reservations: number
  /** 本月預約數 */
  monthly_reservations: number
  /** 上月比較 */
  monthly_change: {
    count: number
    percentage: number
  }
}

/** 時段使用情況 */
export interface SlotUsage {
  /** 星期幾 (0=週日, 1=週一...6=週六) */
  weekday: number
  /** 時間 (HH:mm) */
  time: string
  /** 使用次數 */
  usage_count: number
  /** 使用率 (%) */
  usage_rate: number
  /** 最後使用時間 */
  last_used: Date | null
}

/** 預約趨勢資料 */
export interface ReservationTrend {
  /** 日期 (YYYY-MM-DD) */
  date: string
  /** 新增預約數 */
  new_reservations: number
  /** 完成預約數 */
  completed_reservations: number
  /** 取消預約數 */
  cancelled_reservations: number
}

// === 教師預約查詢相關介面 ===

/** 教師預約查詢參數 */
export interface TeacherReservationQuery {
  /** 課程篩選 */
  course_id?: number
  /** 時間範圍篩選 */
  time_range?: 'all' | 'today' | 'week' | 'month'
  /** 自定義日期範圍 */
  date_from?: string  // YYYY-MM-DD
  date_to?: string    // YYYY-MM-DD
  /** 預約狀態篩選 */
  status?: 'all' | 'pending' | 'reserved' | 'completed' | 'cancelled'
  /** 學生搜尋（暱稱或ID） */
  student_search?: string
  /** 分頁參數 */
  page?: number
  per_page?: number
}

/** 教師預約查詢回應中的預約項目 */
export interface TeacherReservationItem {
  /** 預約基本資訊 */
  id: number
  uuid: string
  
  /** 日期時段資訊 */
  reserve_date: string      // YYYY-MM-DD
  reserve_time: string      // HH:mm
  reserve_start_time: string // HH:mm 開始時間
  reserve_end_time: string   // HH:mm 結束時間
  reserve_datetime: string   // ISO 格式完整時間
  
  /** 學生資訊（僅暱稱和ID） */
  student: {
    id: number
    nick_name: string
  }
  
  /** 課程資訊 */
  course: {
    id: number
    name: string
  }
  
  /** 預約狀態資訊 */
  teacher_status: ReservationStatus
  student_status: ReservationStatus
  overall_status: 'pending' | 'reserved' | 'completed' | 'cancelled'
  
  /** 拒絕原因（當狀態為 cancelled 時） */
  rejection_reason?: string | null
  
  /** 時間資訊 */
  created_at: string
  updated_at: string
  response_deadline?: string  // 僅 pending 狀態時顯示
}

/** 教師預約查詢回應 */
export interface TeacherReservationResponse {
  status: 'success'
  message: string
  data: {
    reservations: TeacherReservationItem[]
    pagination: {
      current_page: number
      per_page: number
      total: number
      total_pages: number
    }
  }
}