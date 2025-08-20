/**
 * 預約測試 fixtures
 * 提供測試預約管理功能所需的測試資料
 */

import { ReservationStatus } from '../../entities/enums'
import { Reservation } from '../../entities/Reservation'
import { 
  CreateReservationRequest, 
  UpdateReservationStatusRequest, 
  CalendarViewQuery,
  ReservationListQuery 
} from '../../types/index'

/**
 * 有效的預約建立請求資料
 */
export const validReservationData: CreateReservationRequest = {
  course_id: 1,
  teacher_id: 1,
  reserve_date: '2025-08-25', // 未來日期（距離當前日期5天）
  reserve_time: '10:00'
}

/**
 * 無效的預約建立請求資料 - 缺少必填欄位
 */
export const invalidReservationDataMissingFields = {
  // course_id 缺少
  teacher_id: 1,
  reserve_date: '2025-08-25',
  reserve_time: '10:00'
}

/**
 * 無效的預約建立請求資料 - 格式錯誤
 */
export const invalidReservationDataWrongFormat: CreateReservationRequest = {
  course_id: 1,
  teacher_id: 1,
  reserve_date: '2025/08/25', // 錯誤的日期格式
  reserve_time: '25:00' // 錯誤的時間格式
}

/**
 * 過去時間的預約請求（應該失敗）
 */
export const pastTimeReservationData: CreateReservationRequest = {
  course_id: 1,
  teacher_id: 1,
  reserve_date: '2025-08-19', // 過去日期
  reserve_time: '10:00'
}

/**
 * 不足24小時提前預約的資料（應該失敗）
 */
export const shortNoticeReservationData: CreateReservationRequest = {
  course_id: 1,
  teacher_id: 1,
  reserve_date: '2025-08-21', // 明天（不足24小時）
  reserve_time: '10:00'
}

/**
 * 有效的狀態更新請求 - 教師完成
 */
export const validTeacherCompleteData: UpdateReservationStatusRequest = {
  status_type: 'teacher-complete',
  notes: '課程順利完成，學生表現很好'
}

/**
 * 有效的狀態更新請求 - 學生完成
 */
export const validStudentCompleteData: UpdateReservationStatusRequest = {
  status_type: 'student-complete',
  notes: '老師教得很好，收獲很多'
}

/**
 * 無效的狀態更新請求 - 錯誤的狀態類型
 */
export const invalidStatusUpdateData = {
  status_type: 'invalid-status', // 無效的狀態類型
  notes: '測試無效狀態'
}

/**
 * 有效的預約列表查詢參數
 */
export const validReservationListQuery: ReservationListQuery = {
  role: 'student',
  status: ReservationStatus.RESERVED,
  date_from: '2025-08-01',
  date_to: '2025-08-31',
  page: 1,
  per_page: 10
}

/**
 * 有效的日曆週檢視查詢
 */
export const validWeekCalendarQuery: CalendarViewQuery = {
  view: 'week',
  date: '2025-08-25',
  role: 'student'
}

/**
 * 有效的日曆月檢視查詢
 */
export const validMonthCalendarQuery: CalendarViewQuery = {
  view: 'month',
  date: '2025-08-01',
  role: 'teacher'
}

/**
 * 無效的日曆查詢 - 錯誤的檢視模式
 */
export const invalidCalendarQuery = {
  view: 'invalid-view', // 無效的檢視模式
  date: '2025-08-25'
}

/**
 * 建立預約實體資料
 */
export const createReservationEntityData = (overrides: Partial<Reservation> = {}): Partial<Reservation> => ({
  uuid: 'test-reservation-uuid-001',
  course_id: 1,
  teacher_id: 1,
  student_id: 1,
  reserve_time: new Date('2025-08-25T10:00:00Z'),
  teacher_status: ReservationStatus.RESERVED,
  student_status: ReservationStatus.RESERVED,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides
})

/**
 * 已完成的預約實體資料（教師已標記完成）
 */
export const teacherCompletedReservationData: Partial<Reservation> = {
  uuid: 'test-reservation-uuid-002',
  course_id: 1,
  teacher_id: 1,
  student_id: 1,
  reserve_time: new Date('2025-08-25T14:00:00Z'),
  teacher_status: ReservationStatus.COMPLETED,
  student_status: ReservationStatus.RESERVED,
  created_at: new Date(),
  updated_at: new Date()
}

/**
 * 完全完成的預約實體資料（雙方都已確認完成）
 */
export const fullyCompletedReservationData: Partial<Reservation> = {
  uuid: 'test-reservation-uuid-003',
  course_id: 1,
  teacher_id: 1,
  student_id: 1,
  reserve_time: new Date('2025-08-25T16:00:00Z'),
  teacher_status: ReservationStatus.COMPLETED,
  student_status: ReservationStatus.COMPLETED,
  created_at: new Date(),
  updated_at: new Date()
}

/**
 * 已取消的預約實體資料
 */
export const cancelledReservationData: Partial<Reservation> = {
  uuid: 'test-reservation-uuid-004',
  course_id: 1,
  teacher_id: 1,
  student_id: 1,
  reserve_time: new Date('2025-08-25T18:00:00Z'),
  teacher_status: ReservationStatus.CANCELLED,
  student_status: ReservationStatus.CANCELLED,
  created_at: new Date(),
  updated_at: new Date()
}

/**
 * 多個預約時段資料（用於衝突測試）
 */
export const multipleReservationSlots: Partial<Reservation>[] = [
  {
    uuid: 'test-reservation-uuid-101',
    course_id: 1,
    teacher_id: 1,
    student_id: 2,
    reserve_time: new Date('2025-08-25T09:00:00Z'),
    teacher_status: ReservationStatus.RESERVED,
    student_status: ReservationStatus.RESERVED,
  },
  {
    uuid: 'test-reservation-uuid-102',
    course_id: 2,
    teacher_id: 1,
    student_id: 3,
    reserve_time: new Date('2025-08-25T11:00:00Z'),
    teacher_status: ReservationStatus.RESERVED,
    student_status: ReservationStatus.RESERVED,
  },
  {
    uuid: 'test-reservation-uuid-103',
    course_id: 3,
    teacher_id: 1,
    student_id: 4,
    reserve_time: new Date('2025-08-25T15:00:00Z'),
    teacher_status: ReservationStatus.COMPLETED,
    student_status: ReservationStatus.COMPLETED,
  }
]

/**
 * 預約測試場景資料
 */
export const reservationTestScenarios = {
  // 成功場景
  validBooking: validReservationData,
  teacherComplete: validTeacherCompleteData,
  studentComplete: validStudentCompleteData,
  
  // 業務規則違反場景
  pastTimeBooking: pastTimeReservationData,
  shortNoticeBooking: shortNoticeReservationData,
  
  // 驗證失敗場景
  missingFields: invalidReservationDataMissingFields,
  wrongFormat: invalidReservationDataWrongFormat,
  invalidStatus: invalidStatusUpdateData,
  
  // 查詢場景
  listQuery: validReservationListQuery,
  weekCalendar: validWeekCalendarQuery,
  monthCalendar: validMonthCalendarQuery,
  invalidCalendar: invalidCalendarQuery,
  
  // 實體資料
  entities: {
    reserved: createReservationEntityData(),
    teacherCompleted: teacherCompletedReservationData,
    fullyCompleted: fullyCompletedReservationData,
    cancelled: cancelledReservationData,
    multiple: multipleReservationSlots
  }
}

/**
 * 預約相關的預期回應結構
 */
export const expectedReservationResponses = {
  // 成功建立預約的回應結構
  createSuccess: {
    status: 'success',
    data: {
      reservation: {
        id: expect.any(Number),
        uuid: expect.any(String),
        course_id: expect.any(Number),
        teacher_id: expect.any(Number),
        student_id: expect.any(Number),
        reserve_time: expect.any(String),
        teacher_status: 'reserved',
        student_status: 'reserved',
        created_at: expect.any(String),
        updated_at: expect.any(String),
        course: {
          id: expect.any(Number),
          name: expect.any(String),
          teacher: {
            user: {
              nick_name: expect.any(String)
            }
          }
        }
      },
      remaining_lessons: {
        total: expect.any(Number),
        used: expect.any(Number),
        remaining: expect.any(Number)
      }
    }
  },
  
  // 預約列表的回應結構
  listSuccess: {
    status: 'success',
    data: {
      reservations: expect.any(Array),
      pagination: {
        current_page: expect.any(Number),
        per_page: expect.any(Number),
        total: expect.any(Number),
        total_pages: expect.any(Number)
      }
    }
  },
  
  // 日曆檢視的回應結構
  calendarSuccess: {
    status: 'success',
    data: {
      view: expect.stringMatching(/^(week|month)$/),
      period: expect.any(Object),
      calendar_data: expect.any(Array)
    }
  },
  
  // 狀態更新的回應結構
  statusUpdateSuccess: {
    status: 'success',
    data: {
      reservation: expect.objectContaining({
        id: expect.any(Number),
        uuid: expect.any(String)
      }),
      is_fully_completed: expect.any(Boolean)
    }
  },
  
  // 取消預約的回應結構
  cancelSuccess: {
    status: 'success',
    data: {
      reservation: {
        id: expect.any(Number),
        uuid: expect.any(String),
        teacher_status: 'cancelled',
        student_status: 'cancelled',
        updated_at: expect.any(String)
      },
      refunded_lessons: expect.any(Number)
    }
  }
}