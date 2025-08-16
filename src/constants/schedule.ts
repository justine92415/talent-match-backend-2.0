/**
 * 教師時間管理相關常數
 */

// 時間格式常數
export const TIME_FORMAT = {
  HH_MM: /^\d{2}:\d{2}$/,
  HH_MM_SS: /^\d{2}:\d{2}:\d{2}$/,
  H_MM: /^\d:\d{2}$/,
  VALIDATION_PATTERN: /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/
} as const

// 星期天數
export const WEEKDAYS = {
  MIN: 0,
  MAX: 6,
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6
} as const

// 日期範圍限制（天數）
export const DATE_LIMITS = {
  DEFAULT_FUTURE_DAYS: 30,
  MAX_RANGE_DAYS: 365
} as const

// 時段數量限制
export const SLOT_LIMITS = {
  MAX_SLOTS_PER_TEACHER: 50
} as const

// 錯誤訊息
export const SCHEDULE_ERRORS = {
  TEACHER_NOT_FOUND: '找不到教師資料',
  INVALID_DATE_FORMAT: '日期格式錯誤',
  INVALID_DATE_RANGE: '日期範圍錯誤',
  INVALID_TIME_FORMAT: '時間格式必須為HH:MM',
  TIME_LOGIC_ERROR: '結束時間必須晚於開始時間',
  WEEKDAY_REQUIRED: '星期為必填欄位',
  WEEKDAY_INVALID: '星期必須為0-6之間的數字',
  START_TIME_REQUIRED: '開始時間為必填欄位',
  END_TIME_REQUIRED: '結束時間為必填欄位',
  VALIDATION_FAILED: '資料驗證失敗'
} as const

// 業務錯誤代碼
export const SCHEDULE_ERROR_CODES = {
  TEACHER_NOT_FOUND: 'TEACHER_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE'
} as const