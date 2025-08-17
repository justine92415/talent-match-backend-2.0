/**
 * 價格方案業務常數
 * 
 * 定義價格方案管理相關的業務規則常數
 */

// ==================== 價格方案限制常數 ====================

/** 價格方案數量限制 */
export const PRICE_OPTION_LIMITS = {
  /** 每個課程最大方案數 */
  MAX_OPTIONS_PER_COURSE: 3,
  /** 最小價格 */
  MIN_PRICE: 1,
  /** 最大價格 */
  MAX_PRICE: 999999,
  /** 最小堂數 */
  MIN_QUANTITY: 1,
  /** 最大堂數 */
  MAX_QUANTITY: 999,
} as const

// ==================== 價格方案默認值 ====================

/** 價格方案預設值 */
export const PRICE_OPTION_DEFAULTS = {
  /** 預設分頁大小 */
  DEFAULT_PAGE_SIZE: 20,
  /** 最大分頁大小 */
  MAX_PAGE_SIZE: 100,
  /** 預設排序 */
  DEFAULT_ORDER: 'price ASC',
  /** 預設啟用狀態 */
  DEFAULT_IS_ACTIVE: true,
} as const

// ==================== 價格方案權限檢查 ====================

/** 價格方案操作權限 */
export const PRICE_OPTION_PERMISSIONS = {
  /** 需要教師權限的操作 */
  TEACHER_REQUIRED_ACTIONS: ['create', 'update', 'delete', 'list'] as const,
  /** 需要課程擁有權的操作 */
  COURSE_OWNER_REQUIRED_ACTIONS: ['create', 'update', 'delete', 'list'] as const,
  /** 需要草稿狀態的操作 */
  DRAFT_REQUIRED_ACTIONS: ['create', 'update', 'delete'] as const,
} as const

// ==================== 價格方案驗證規則 ====================

/** 價格方案驗證規則 */
export const PRICE_OPTION_VALIDATION_RULES = {
  /** 價格精確度（小數位數） */
  PRICE_DECIMAL_PLACES: 2,
  /** 價格驗證模式 */
  PRICE_PATTERN: /^\d{1,6}(\.\d{1,2})?$/,
  /** 堂數驗證模式 */
  QUANTITY_PATTERN: /^\d{1,3}$/,
} as const

// ==================== 價格方案錯誤訊息映射 ====================

/** 價格方案驗證錯誤映射 */
export const PRICE_OPTION_VALIDATION_MESSAGES = {
  PRICE: {
    REQUIRED: '價格為必填欄位',
    INVALID: '價格格式不正確',
    TOO_LOW: `價格必須大於 ${PRICE_OPTION_LIMITS.MIN_PRICE}`,
    TOO_HIGH: `價格不能超過 ${PRICE_OPTION_LIMITS.MAX_PRICE}`,
    DECIMAL_PLACES: `價格最多只能有 ${PRICE_OPTION_VALIDATION_RULES.PRICE_DECIMAL_PLACES} 位小數`,
  },
  QUANTITY: {
    REQUIRED: '堂數為必填欄位',
    INVALID: '堂數格式不正確',
    TOO_LOW: `堂數必須大於 ${PRICE_OPTION_LIMITS.MIN_QUANTITY}`,
    TOO_HIGH: `堂數不能超過 ${PRICE_OPTION_LIMITS.MAX_QUANTITY}`,
    NOT_INTEGER: '堂數必須是整數',
  },
  BUSINESS: {
    DUPLICATE: '此價格和堂數組合已存在',
    LIMIT_EXCEEDED: `每個課程最多只能有 ${PRICE_OPTION_LIMITS.MAX_OPTIONS_PER_COURSE} 個價格方案`,
    LAST_ONE: '不能刪除最後一個價格方案',
    HAS_PURCHASES: '此價格方案已有購買記錄，無法刪除',
  },
} as const

// ==================== 價格方案狀態檢查 ====================

/** 課程狀態允許的價格方案操作 */
export const COURSE_STATUS_PRICE_OPTION_OPERATIONS = {
  DRAFT: {
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    canView: true,
  },
  UNDER_REVIEW: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: true,
  },
  APPROVED: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: true,
  },
  PUBLISHED: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: true,
  },
  ARCHIVED: {
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canView: true,
  },
} as const

// ==================== 價格方案查詢選項 ====================

/** 價格方案查詢預設選項 */
export const PRICE_OPTION_QUERY_OPTIONS = {
  /** 預設包含的欄位 */
  DEFAULT_SELECT: [
    'id',
    'uuid', 
    'course_id',
    'price',
    'quantity',
    'is_active',
    'created_at',
    'updated_at',
  ] as const,
  /** 預設排序欄位 */
  DEFAULT_ORDER_BY: 'price',
  /** 預設排序方向 */
  DEFAULT_ORDER_DIRECTION: 'ASC' as const,
  /** 是否包含已刪除的記錄 */
  INCLUDE_DELETED: false,
} as const

// ==================== 型別定義 ====================

export type PriceOptionOperation = typeof PRICE_OPTION_PERMISSIONS.TEACHER_REQUIRED_ACTIONS[number]
export type CourseStatusKey = keyof typeof COURSE_STATUS_PRICE_OPTION_OPERATIONS
export type PriceOptionQuerySelectField = typeof PRICE_OPTION_QUERY_OPTIONS.DEFAULT_SELECT[number]
export type OrderDirection = typeof PRICE_OPTION_QUERY_OPTIONS.DEFAULT_ORDER_DIRECTION