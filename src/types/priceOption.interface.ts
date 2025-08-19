/**
 * 價格方案相關型別定義
 * 
 * 包含價格方案 CRUD 操作、驗證、回應格式相關的介面定義
 * 與 CoursePriceOption 實體對應
 */

// ==================== 價格方案基本介面 ====================

/** 價格方案基本資訊 */
export interface PriceOption {
  id: number
  uuid: string
  course_id: number
  price: number
  quantity: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

/** 價格方案建立請求參數 */
export interface PriceOptionCreateRequest {
  price: number
  quantity: number
}

/** 價格方案更新請求參數 */
export interface PriceOptionUpdateRequest {
  price?: number
  quantity?: number
}

/** 價格方案查詢參數 */
export interface PriceOptionQueryParams {
  page?: number
  per_page?: number
  is_active?: boolean
}

// ==================== 價格方案驗證介面 ====================

/** 價格方案重複檢查資料 */
export interface PriceOptionDuplicateCheck {
  course_id: number
  price: number
  quantity: number
  exclude_id?: number  // 更新時排除自己
}

/** 價格方案業務規則驗證 */
export interface PriceOptionValidation {
  /** 價格必須大於0 */
  price: number
  /** 堂數必須大於0 */
  quantity: number
  /** 課程ID必須存在 */
  course_id: number
  /** 是否檢查重複性 */
  check_duplicate?: boolean
}

// ==================== 價格方案統計介面 ====================

/** 價格方案統計摘要 */
export interface PriceOptionSummary {
  /** 總方案數 */
  total_options: number
  /** 啟用方案數 */
  active_options: number
  /** 最低價格 */
  min_price: number
  /** 最高價格 */
  max_price: number
  /** 平均價格 */
  average_price?: number
  /** 總堂數範圍 */
  quantity_range?: {
    min: number
    max: number
  }
}

/** 價格方案使用統計 */
export interface PriceOptionUsageStats {
  /** 方案ID */
  price_option_id: number
  /** 購買次數 */
  purchase_count: number
  /** 總收入 */
  total_revenue: number
  /** 最後購買時間 */
  last_purchase_at?: Date
}

// ==================== API 回應格式介面 ====================

/** 價格方案列表回應 */
export interface PriceOptionListResponse {
  price_options: PriceOption[]
  summary: PriceOptionSummary
  pagination?: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/** 價格方案詳情回應 */
export interface PriceOptionDetailResponse {
  price_option: PriceOption
  usage_stats?: PriceOptionUsageStats
}

/** 價格方案建立回應 */
export interface PriceOptionCreateResponse {
  price_option: PriceOption
}

/** 價格方案更新回應 */
export interface PriceOptionUpdateResponse {
  price_option: PriceOption
}

// ==================== 服務層介面 ====================

/** 價格方案服務介面 */
export interface IPriceOptionService {
  /** 取得課程的價格方案列表 */
  getListByCourseId(courseId: number, params?: PriceOptionQueryParams): Promise<PriceOptionListResponse>
  
  /** 根據ID取得價格方案 */
  getById(id: number): Promise<PriceOption>
  
  /** 建立價格方案 */
  create(courseId: number, data: PriceOptionCreateRequest): Promise<PriceOption>
  
  /** 更新價格方案 */
  update(id: number, courseId: number, data: PriceOptionUpdateRequest): Promise<PriceOption>
  
  /** 刪除價格方案 */
  delete(id: number, courseId: number): Promise<void>
  
  /** 檢查價格方案重複性 */
  checkDuplicate(data: PriceOptionDuplicateCheck): Promise<boolean>
  
  /** 驗證課程擁有權 */
  validateCourseOwnership(courseId: number, teacherId: number): Promise<void>
  
  /** 取得價格方案統計摘要 */
  getSummary(courseId: number): Promise<PriceOptionSummary>
}

// ==================== 資料庫查詢介面 ====================

/** 價格方案查詢條件 */
export interface PriceOptionFindOptions {
  where?: {
    id?: number
    uuid?: string
    course_id?: number
    is_active?: boolean
    price?: number
    quantity?: number
  }
  order?: {
    [key: string]: 'ASC' | 'DESC'
  }
  take?: number
  skip?: number
}

/** 價格方案建立資料 */
export interface PriceOptionCreateData {
  uuid: string
  course_id: number
  price: number
  quantity: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

/** 價格方案更新資料 */
export interface PriceOptionUpdateData {
  price?: number
  quantity?: number
  is_active?: boolean
  updated_at: Date
}

// ==================== 業務規則常數介面 ====================

/** 價格方案限制常數 */
export interface PriceOptionLimits {
  /** 每個課程最大方案數 */
  MAX_OPTIONS_PER_COURSE: number
  /** 最小價格 */
  MIN_PRICE: number
  /** 最大價格 */
  MAX_PRICE: number
  /** 最小堂數 */
  MIN_QUANTITY: number
  /** 最大堂數 */
  MAX_QUANTITY: number
}

/** 價格方案操作權限檢查 */
export interface PriceOptionPermission {
  /** 可以查看 */
  canView: boolean
  /** 可以建立 */
  canCreate: boolean
  /** 可以更新 */
  canUpdate: boolean
  /** 可以刪除 */
  canDelete: boolean
  /** 限制原因 */
  reason?: string
}

// ==================== 錯誤處理介面 ====================

/** 價格方案錯誤詳情 */
export interface PriceOptionError {
  field: string
  message: string
  code: string
  value?: any
}

/** 價格方案驗證錯誤 */
export interface PriceOptionValidationError {
  errors: PriceOptionError[]
  total_errors: number
}

// ==================== 工具型別 ====================

/** 價格方案建立必填欄位 */
export type PriceOptionCreateRequired = Required<Pick<PriceOptionCreateRequest, 'price' | 'quantity'>>

/** 價格方案更新選填欄位 */
export type PriceOptionUpdateOptional = Partial<Pick<PriceOptionUpdateRequest, 'price' | 'quantity'>>

/** 價格方案回應欄位 */
export type PriceOptionResponse = Omit<PriceOption, 'created_at' | 'updated_at'> & {
  created_at: string
  updated_at: string
}

/** 價格方案列表項目 */
export type PriceOptionListItem = Pick<PriceOption, 'id' | 'uuid' | 'price' | 'quantity' | 'is_active' | 'created_at'>