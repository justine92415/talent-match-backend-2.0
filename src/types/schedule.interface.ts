import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { Reservation } from '@entities/Reservation'

/**
 * 教師可預約時段相關介面
 */

/** 星期幾枚舉 */
export enum Weekday {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

/** 可預約時段基本資料 */
export interface AvailableSlotData {
  /** 星期幾（0=週日, 1=週一, ..., 6=週六） */
  weekday: number
  /** 開始時間 (HH:MM 格式) */
  start_time: string
  /** 結束時間 (HH:MM 格式) */
  end_time: string
  /** 是否啟用 */
  is_active?: boolean
}

/** 可預約時段完整資訊 */
export interface AvailableSlotInfo extends AvailableSlotData {
  /** 時段ID */
  id: number
  /** 教師ID */
  teacher_id: number
  /** 建立時間 */
  created_at: Date
  /** 更新時間 */
  updated_at: Date
}

/** 取得教師時段設定請求 */
export interface GetScheduleRequest {
  /** 教師ID（從認證token取得） */
  teacher_id?: number
}

/** 取得教師時段設定回應 */
export interface GetScheduleResponse {
  /** 可預約時段列表 */
  available_slots: AvailableSlotInfo[]
  /** 總時段數量 */
  total_slots: number
}

/** 更新教師時段設定請求 */
export interface UpdateScheduleRequest {
  /** 可預約時段列表 */
  available_slots: AvailableSlotData[]
}

/** 更新教師時段設定回應 */
export interface UpdateScheduleResponse {
  /** 更新後的可預約時段列表 */
  available_slots: AvailableSlotInfo[]
  /** 更新的時段數量 */
  updated_count: number
  /** 新增的時段數量 */
  created_count: number
  /** 刪除的時段數量 */
  deleted_count: number
}

/** 時段衝突資訊 */
export interface ConflictInfo {
  /** 衝突的可預約時段ID */
  slot_id: number
  /** 衝突的預約ID */
  reservation_id: number
  /** 衝突的預約時間 */
  reserve_time: Date
  /** 預約學生ID */
  student_id: number
  /** 衝突原因 */
  reason: string
}

/** 檢查時段衝突請求 */
export interface CheckConflictsRequest {
  /** 要檢查的時段列表（可選，如果不提供則檢查所有時段） */
  slot_ids?: number[]
  /** 檢查的起始時間（可選，預設為當前時間） */
  from_date?: string
  /** 檢查的結束時間（可選，預設為30天後） */
  to_date?: string
}

/** 檢查時段衝突回應 */
export interface CheckConflictsResponse {
  /** 是否有衝突 */
  has_conflicts: boolean
  /** 衝突詳情 */
  conflicts: ConflictInfo[]
  /** 衝突總數 */
  total_conflicts: number
  /** 檢查時間範圍 */
  check_period: {
    from_date: string
    to_date: string
  }
}

/** 時段驗證錯誤 */
export interface SlotValidationError {
  /** 時段索引或ID */
  slot_index?: number
  slot_id?: number
  /** 欄位名稱 */
  field: string
  /** 錯誤訊息 */
  message: string
}

/** 批次操作結果 */
export interface BatchOperationResult {
  /** 成功處理的數量 */
  success_count: number
  /** 失敗處理的數量 */
  error_count: number
  /** 錯誤詳情 */
  errors: SlotValidationError[]
}

/** API 回應包裝器 */
export interface ScheduleApiResponse<T> {
  /** 狀態 */
  status: 'success' | 'error'
  /** 訊息 */
  message: string
  /** 資料 */
  data?: T
  /** 錯誤詳情 */
  errors?: Record<string, string[]>
}

/** 教師時段服務介面 */
export interface TeacherScheduleService {
  /** 取得教師的可預約時段 */
  getSchedule(teacherId: number): Promise<GetScheduleResponse>
  
  /** 更新教師的可預約時段 */
  updateSchedule(teacherId: number, data: UpdateScheduleRequest): Promise<UpdateScheduleResponse>
  
  /** 檢查時段衝突 */
  checkConflicts(teacherId: number, data?: CheckConflictsRequest): Promise<CheckConflictsResponse>
  
  /** 驗證時段資料 */
  validateSlot(slot: AvailableSlotData): SlotValidationError[]
  
  /** 檢查時間格式 */
  validateTimeFormat(time: string): boolean
  
  /** 檢查時間邏輯 */
  validateTimeLogic(startTime: string, endTime: string): boolean
}

/** 資料庫查詢選項 */
export interface ScheduleQueryOptions {
  /** 是否包含已刪除的記錄 */
  include_deleted?: boolean
  /** 排序方式 */
  order_by?: 'weekday' | 'start_time' | 'created_at'
  /** 排序方向 */
  order_direction?: 'ASC' | 'DESC'
}