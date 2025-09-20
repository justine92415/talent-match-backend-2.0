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

// 標準教學時段定義
export const STANDARD_SLOTS = [
  // 上午時段 (09:00-12:00)
  '09:00', '10:00', '11:00',
  // 下午時段 (13:00-18:00)  
  '13:00', '14:00', '15:00', '16:00', '17:00',
  // 晚上時段 (19:00-21:00)
  '19:00', '20:00'
] as const

// 時段分類
export const SLOT_CATEGORIES = {
  MORNING: ['09:00', '10:00', '11:00'] as const,
  AFTERNOON: ['13:00', '14:00', '15:00', '16:00', '17:00'] as const, 
  EVENING: ['19:00', '20:00'] as const
} as const

// 週次定義 (週一=1, 週日=7)
export const WEEKLY_WEEKDAYS = {
  MONDAY: 1,
  TUESDAY: 2, 
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
  MIN: 1,
  MAX: 7
} as const

// 舊版星期天數 (向後相容用)
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
  MAX_SLOTS_PER_TEACHER: 50,
  MAX_SLOTS_PER_DAY: 10,        // 每天最多10個時段
  MAX_SLOTS_PER_WEEK: 70,       // 每週最多70個時段 (7天 * 10時段)
  TOTAL_STANDARD_SLOTS: 10      // 台灣標準時段總數
} as const

// 時段業務規則
export const SLOT_RULES = {
  SLOT_DURATION_MINUTES: 60,    // 每個時段60分鐘
  VALID_WEEK_DAYS: ['1', '2', '3', '4', '5', '6', '7'] as const,
  VALID_TIME_SLOTS: STANDARD_SLOTS
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
  VALIDATION_FAILED: '資料驗證失敗',
  // 週次時段錯誤訊息
  WEEKLY_WEEKDAY_INVALID: '週次必須為1-7之間的數字 (週一=1, 週日=7)',
  INVALID_TIME_SLOT: '時間必須為標準時段 (上午09:00-11:00, 下午13:00-17:00, 晚上19:00-20:00)',
  DUPLICATE_TIME_SLOT: '同一天不能有重複的時段',
  WEEKLY_SCHEDULE_REQUIRED: 'weekly_schedule 為必填欄位',
  INVALID_WEEKLY_SCHEDULE_FORMAT: 'weekly_schedule 格式錯誤'
} as const

// 業務錯誤代碼
export const SCHEDULE_ERROR_CODES = {
  TEACHER_NOT_FOUND: 'TEACHER_NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DATE_FORMAT: 'INVALID_DATE_FORMAT',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  // 週次時段錯誤代碼
  WEEKLY_WEEKDAY_INVALID: 'WEEKLY_WEEKDAY_INVALID',
  INVALID_TIME_SLOT: 'INVALID_TIME_SLOT',
  DUPLICATE_TIME_SLOT: 'DUPLICATE_TIME_SLOT',
  WEEKLY_SCHEDULE_REQUIRED: 'WEEKLY_SCHEDULE_REQUIRED'
} as const