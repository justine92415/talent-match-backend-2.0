/**
 * 統一訊息管理
 * 
 * 管理專案中所有的成功與失敗回應訊息，用於：
 * 1. Controllers 控制器回應訊息
 * 2. Services 服務層拋錯訊息  
 * 3. Tests 測試案例預期訊息
 * 4. Routes 路由驗證訊息
 * 
 * 確保整個專案使用統一的訊息格式
 */

export const MESSAGES = {
  // === 認證相關訊息 ===
  AUTH: {
    // 成功訊息
    REGISTRATION_SUCCESS: '註冊成功',
    LOGIN_SUCCESS: '登入成功',
    TOKEN_REFRESH_SUCCESS: 'Token 刷新成功',
    PASSWORD_RESET_EMAIL_SENT: '重設密碼郵件已發送，請檢查您的信箱',
    PASSWORD_RESET_SUCCESS: '密碼重設成功',
    PROFILE_RETRIEVED: '成功取得個人資料',
    PROFILE_UPDATED: '成功更新個人資料',
    ACCOUNT_DELETED: '帳號已成功刪除',

    // 錯誤訊息
    EMAIL_EXISTS: '此電子郵件已被註冊',
    NICKNAME_EXISTS: '該暱稱已被使用',
    INVALID_CREDENTIALS: '電子郵件或密碼錯誤',
    ACCOUNT_SUSPENDED: '您的帳號已被停用，請聯絡客服',
    TOKEN_INVALID: 'Token 無效',
    TOKEN_EXPIRED: 'Token 已過期',
    TOKEN_REQUIRED: 'Access token 為必填欄位',
    TOKEN_INVALID_OR_EXPIRED: 'Token 無效或已過期',
    REFRESH_TOKEN_REQUIRED: 'Refresh token 為必填欄位',
    RESET_TOKEN_INVALID: '重設令牌無效或已過期',
    ACCOUNT_SUSPENDED_RESET: '帳號已停用，無法重設密碼',
    REGISTRATION_FAILED: '註冊失敗',
    LOGIN_FAILED: '登入失敗',
    PROFILE_UPDATE_FAILED: '更新個人資料失敗',
    PASSWORD_RESET_FAILED: '密碼重設失敗',
    TOKEN_REFRESH_FAILED: 'Token 刷新失敗',
  },

  // === 驗證相關訊息 ===
  VALIDATION: {
    // Email 驗證
    EMAIL_REQUIRED: 'Email 為必填欄位',
    EMAIL_INVALID: 'Email 格式不正確',
    EMAIL_EMPTY: 'Email 不能為空',

    // 密碼驗證
    PASSWORD_REQUIRED: '密碼為必填欄位',
    PASSWORD_TOO_SHORT: '密碼必須至少8字元且包含中英文',
    PASSWORD_EMPTY: '密碼不能為空',
    NEW_PASSWORD_REQUIRED: '新密碼為必填欄位',
    NEW_PASSWORD_EMPTY: '新密碼不能為空',
    NEW_PASSWORD_TOO_SHORT: '密碼至少需要 8 個字元',
    NEW_PASSWORD_INVALID_TYPE: '新密碼必須為字串格式',

    // 暱稱驗證
    NICKNAME_REQUIRED: '暱稱為必填欄位',
    NICKNAME_EMPTY: '暱稱不能為空',
    NICKNAME_TOO_LONG: '暱稱長度不能超過50個字元',

    // 重設令牌驗證
    RESET_TOKEN_REQUIRED: '重設令牌為必填欄位',
    RESET_TOKEN_EMPTY: '重設令牌不能為空',

    // Refresh Token 驗證
    REFRESH_TOKEN_REQUIRED: 'refresh_token 為必填欄位',
    REFRESH_TOKEN_EMPTY: 'refresh_token 不能為空',
    REFRESH_TOKEN_INVALID_TYPE: 'refresh_token 必須為字串格式',

    // 工作經驗驗證
    WORKPLACE_REQUIRED: '工作地點為必填欄位',
    END_DATE_BEFORE_START_DATE: '結束日期不得早於開始日期',
    WORKING_END_DATE_NOT_ALLOWED: '在職工作經驗不可填寫結束日期',
    NON_WORKING_END_DATE_REQUIRED: '離職工作經驗必須填寫結束日期',

    // 學習經歷驗證
    INSTITUTION_REQUIRED: '教育機構為必填欄位',
    INSTITUTION_EMPTY: '教育機構不能為空',
    DEGREE_REQUIRED: '學位為必填欄位',
    DEGREE_EMPTY: '學位不能為空',
    FIELD_OF_STUDY_REQUIRED: '專業領域為必填欄位',
    FIELD_OF_STUDY_EMPTY: '專業領域不能為空',
    START_YEAR_REQUIRED: '開始年份為必填欄位',
    START_YEAR_INVALID: '開始年份格式不正確',
    END_YEAR_REQUIRED: '結束年份為必填欄位',
    END_YEAR_INVALID: '結束年份格式不正確',
    LEARNING_END_YEAR_BEFORE_START_YEAR: '結束年份不得早於開始年份',
    LEARNING_YEAR_RANGE_INVALID: '學習年份範圍不合理',
    LEARNING_GRADUATED_NO_END_DATE: '已畢業的學習經歷必須提供結束日期',

    // 課程驗證
    COURSE_NAME_REQUIRED: '課程名稱為必填欄位',
    COURSE_NAME_TOO_LONG: '課程名稱不能超過100個字元',
    COURSE_CONTENT_REQUIRED: '課程內容為必填欄位', 
    COURSE_CONTENT_TOO_LONG: '課程內容不能超過5000個字元',
    MAIN_CATEGORY_REQUIRED: '主分類為必填欄位',
    MAIN_CATEGORY_INVALID: '主分類格式不正確',
    SUB_CATEGORY_REQUIRED: '子分類為必填欄位',
    SUB_CATEGORY_INVALID: '子分類格式不正確',
    CITY_REQUIRED: '城市為必填欄位',
    CITY_INVALID: '城市格式不正確',
    SURVEY_URL_INVALID: '問卷連結格式不正確',
    PURCHASE_MESSAGE_TOO_LONG: '購買訊息不能超過500個字元',

    // 價格方案驗證
    PRICE_REQUIRED: '價格為必填欄位',
    PRICE_INVALID: '價格格式不正確',
    PRICE_TOO_LOW: '價格必須大於0',
    PRICE_TOO_HIGH: '價格不能超過999999',
    QUANTITY_REQUIRED: '堂數為必填欄位',
    QUANTITY_INVALID: '堂數格式不正確',
    QUANTITY_TOO_LOW: '堂數必須大於0',
    QUANTITY_TOO_HIGH: '堂數不能超過999',

    // 一般驗證
    FIELD_REQUIRED: (field: string) => `${field}為必填欄位`,
    FIELD_INVALID_TYPE: (field: string, type: string) => `${field}必須為${type}格式`,
  },

  // === 業務邏輯訊息 ===
  BUSINESS: {
    // 為了向後相容性，保留原本在 BUSINESS 中的認證錯誤訊息
    REGISTRATION_FAILED: '註冊失敗',
    LOGIN_FAILED: '登入失敗',

    // 資源不存在
    USER_NOT_FOUND: '使用者不存在',
    TEACHER_NOT_FOUND: '找不到教師記錄',
    COURSE_NOT_FOUND: '課程不存在',
    APPLICATION_NOT_FOUND: '找不到申請記錄',
    WORK_EXPERIENCE_NOT_FOUND: '找不到工作經驗記錄',
    WORK_EXPERIENCE_RECORD_NOT_FOUND: '工作經驗記錄不存在',
    LEARNING_EXPERIENCE_NOT_FOUND: '找不到學習經歷記錄',
    LEARNING_EXPERIENCE_RECORD_NOT_FOUND: '學習經歷記錄不存在',
    PRICE_OPTION_NOT_FOUND: '找不到價格方案',

    // 權限與授權
    UNAUTHORIZED_ACCESS: '您沒有權限執行此操作',
    UNAUTHORIZED_WORK_EXPERIENCE_ACCESS: '無權存取此工作經驗記錄',
    UNAUTHORIZED_WORK_EXPERIENCE_DELETE: '無權刪除此工作經驗記錄',
    UNAUTHORIZED_LEARNING_EXPERIENCE_ACCESS: '無權存取此學習經歷記錄',
    UNAUTHORIZED_LEARNING_EXPERIENCE_DELETE: '無權刪除此學習經歷記錄',
    TEACHER_PERMISSION_REQUIRED: '需要教師權限才能執行此操作',

    // 業務規則
    APPLICATION_EXISTS: '您已提交過教師申請',
    STUDENT_ONLY_APPLY_TEACHER: '只有學生可以申請成為教師',
    ACCOUNT_STATUS_INVALID: '帳號狀態異常',
    APPLICATION_STATUS_INVALID: '只能在待審核或已拒絕狀態下修改申請',
    COURSE_PUBLISHED_CANNOT_DELETE: '已發布的課程不能直接刪除',
    TEACHER_NOT_APPROVED: '教師申請尚未核准',
    COURSE_NOT_DRAFT: '只能操作草稿狀態的課程',
    COURSE_NOT_APPROVED: '課程尚未通過審核',
    COURSE_ALREADY_PUBLISHED: '課程已經發布',
    COURSE_CANNOT_SUBMIT: '課程無法提交審核',
    COURSE_CANNOT_RESUBMIT: '只有被拒絕的課程才能重新提交',
    COURSE_CANNOT_PUBLISH: '課程無法發布',
    COURSE_CANNOT_ARCHIVE: '課程無法封存',
    COURSE_UNDER_REVIEW: '課程正在審核中，無法修改',
    
    // 價格方案業務規則
    PRICE_OPTION_DUPLICATE: '此價格和堂數組合已存在',
    PRICE_OPTION_LIMIT_EXCEEDED: '每個課程最多只能有3個價格方案',
    PRICE_OPTION_LAST_ONE: '不能刪除最後一個價格方案',
    PRICE_OPTION_HAS_PURCHASES: '此價格方案已有購買記錄，無法刪除',
  },

  // === 系統訊息 ===
  SYSTEM: {
    INTERNAL_ERROR: '系統內部錯誤',
    DATABASE_ERROR: '資料庫連接錯誤',
    VALIDATION_FAILED: '參數驗證失敗',
    VALIDATION_ERROR: '參數驗證失敗',
    TEACHER_APPLICATION_VALIDATION_FAILED: '教師申請參數驗證失敗',
    UNKNOWN_ERROR: '未知錯誤',
  },

  // === 工作經驗相關訊息 ===
  WORK_EXPERIENCE: {
    // 成功訊息
    LIST_SUCCESS: '取得工作經驗列表成功',
    CREATED: '工作經驗已新增',
    UPDATED: '工作經驗已更新',
    DELETED: '工作經驗已刪除',
  },

  // === 學習經歷相關訊息 ===
  LEARNING_EXPERIENCE: {
    // 成功訊息
    LIST_SUCCESS: '取得學習經歷列表成功',
    CREATED: '學習經歷已新增',
    UPDATED: '學習經歷已更新',
    DELETED: '學習經歷已刪除',
  },

  // === 課程相關訊息 ===
  COURSE: {
    // 成功訊息
    CREATED: '課程建立成功',
    UPDATED: '課程更新成功',
    DELETED: '課程已刪除',
    SUBMITTED: '課程已提交審核',
    RESUBMITTED: '課程已重新提交審核',
    PUBLISHED: '課程已成功發布',
    ARCHIVED: '課程已封存',
  },

  // === 價格方案相關訊息 ===
  PRICE_OPTION: {
    // 成功訊息
    LIST_SUCCESS: '取得價格方案列表成功',
    CREATED: '價格方案新增成功',
    UPDATED: '價格方案更新成功',
    DELETED: '價格方案已刪除',
  },
} as const

// === 便捷訪問器 ===
export const AuthMessages = MESSAGES.AUTH
export const ValidationMessages = MESSAGES.VALIDATION
export const BusinessMessages = MESSAGES.BUSINESS
export const SystemMessages = MESSAGES.SYSTEM
export const WorkExperienceMessages = MESSAGES.WORK_EXPERIENCE
export const LearningExperienceMessages = MESSAGES.LEARNING_EXPERIENCE
export const CourseMessages = MESSAGES.COURSE
export const PriceOptionMessages = MESSAGES.PRICE_OPTION

// === 向後相容性：SUCCESS 物件 ===
// 為了保持向後相容，維持原有的 SUCCESS 分組
export const SUCCESS = {
  REGISTRATION_SUCCESS: MESSAGES.AUTH.REGISTRATION_SUCCESS,
  LOGIN_SUCCESS: MESSAGES.AUTH.LOGIN_SUCCESS,
  PROFILE_RETRIEVED: MESSAGES.AUTH.PROFILE_RETRIEVED,
  PROFILE_UPDATED: MESSAGES.AUTH.PROFILE_UPDATED,
  ACCOUNT_DELETED: MESSAGES.AUTH.ACCOUNT_DELETED,
  PASSWORD_RESET_EMAIL_SENT: MESSAGES.AUTH.PASSWORD_RESET_EMAIL_SENT,
  PASSWORD_RESET_SUCCESS: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
  TOKEN_REFRESH_SUCCESS: MESSAGES.AUTH.TOKEN_REFRESH_SUCCESS,
  
  // 工作經驗相關成功訊息
  WORK_EXPERIENCE_LIST_SUCCESS: MESSAGES.WORK_EXPERIENCE.LIST_SUCCESS,
  WORK_EXPERIENCE_CREATED: MESSAGES.WORK_EXPERIENCE.CREATED,
  WORK_EXPERIENCE_UPDATED: MESSAGES.WORK_EXPERIENCE.UPDATED,
  WORK_EXPERIENCE_DELETED: MESSAGES.WORK_EXPERIENCE.DELETED,
  
  // 學習經歷相關成功訊息
  LEARNING_EXPERIENCE_LIST_SUCCESS: MESSAGES.LEARNING_EXPERIENCE.LIST_SUCCESS,
  LEARNING_EXPERIENCE_CREATED: MESSAGES.LEARNING_EXPERIENCE.CREATED,
  LEARNING_EXPERIENCE_UPDATED: MESSAGES.LEARNING_EXPERIENCE.UPDATED,
  LEARNING_EXPERIENCE_DELETED: MESSAGES.LEARNING_EXPERIENCE.DELETED,
  
  // 課程相關成功訊息
  COURSE_CREATED: MESSAGES.COURSE.CREATED,
  COURSE_UPDATED: MESSAGES.COURSE.UPDATED,
  COURSE_DELETED: MESSAGES.COURSE.DELETED,
  COURSE_SUBMITTED: MESSAGES.COURSE.SUBMITTED,
  COURSE_RESUBMITTED: MESSAGES.COURSE.RESUBMITTED,
  COURSE_PUBLISHED: MESSAGES.COURSE.PUBLISHED,
  COURSE_ARCHIVED: MESSAGES.COURSE.ARCHIVED,
  
  // 價格方案相關成功訊息
  PRICE_OPTION_LIST_SUCCESS: MESSAGES.PRICE_OPTION.LIST_SUCCESS,
  PRICE_OPTION_CREATED: MESSAGES.PRICE_OPTION.CREATED,
  PRICE_OPTION_UPDATED: MESSAGES.PRICE_OPTION.UPDATED,
  PRICE_OPTION_DELETED: MESSAGES.PRICE_OPTION.DELETED,
} as const

// 維持原有的 SuccessMessages 別名
export const SuccessMessages = SUCCESS

// === 向後相容性：ERROR_MESSAGES 結構 ===
// 維持與原始 ERROR_MESSAGES 完全相同的結構
export const ERROR_MESSAGES = {
  // 認證相關錯誤訊息
  AUTH: MESSAGES.AUTH,
  
  // 驗證相關錯誤訊息
  VALIDATION: MESSAGES.VALIDATION,
  
  // 業務邏輯錯誤訊息
  BUSINESS: MESSAGES.BUSINESS,
  
  // 系統錯誤訊息
  SYSTEM: MESSAGES.SYSTEM,
  
  // 成功訊息
  SUCCESS,
} as const

// === 型別定義 ===
export type MessageCategory = keyof typeof MESSAGES
export type AuthMessageKey = keyof typeof MESSAGES.AUTH
export type ValidationMessageKey = keyof typeof MESSAGES.VALIDATION
export type BusinessMessageKey = keyof typeof MESSAGES.BUSINESS
export type SystemMessageKey = keyof typeof MESSAGES.SYSTEM
export type WorkExperienceMessageKey = keyof typeof MESSAGES.WORK_EXPERIENCE
export type LearningExperienceMessageKey = keyof typeof MESSAGES.LEARNING_EXPERIENCE
export type CourseMessageKey = keyof typeof MESSAGES.COURSE
export type PriceOptionMessageKey = keyof typeof MESSAGES.PRICE_OPTION

// 便捷型別 - 向後相容
export type SuccessMessageKey = keyof typeof SUCCESS