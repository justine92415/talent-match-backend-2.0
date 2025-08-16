/**
 * 統一錯誤訊息管理
 * 
 * 所有錯誤訊息都從這裡統一管理，確保：
 * 1. 服務層拋錯使用統一訊息
 * 2. 驗證中間件使用統一訊息  
 * 3. 測試檔案預期統一訊息
 * 4. 避免不同地方有不同的客製訊息
 */

export const ERROR_MESSAGES = {
  // 認證相關錯誤訊息
  AUTH: {
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
  },

  // 驗證相關錯誤訊息
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

    // 一般驗證
    FIELD_REQUIRED: (field: string) => `${field}為必填欄位`,
    FIELD_INVALID_TYPE: (field: string, type: string) => `${field}必須為${type}格式`,
  },

  // 業務邏輯錯誤訊息
  BUSINESS: {
    USER_NOT_FOUND: '使用者不存在',
    TEACHER_NOT_FOUND: '找不到教師記錄',
    COURSE_NOT_FOUND: '課程不存在',
    APPLICATION_EXISTS: '您已提交過教師申請',
    APPLICATION_NOT_FOUND: '找不到申請記錄',
    WORK_EXPERIENCE_NOT_FOUND: '找不到工作經驗記錄',
    WORK_EXPERIENCE_RECORD_NOT_FOUND: '工作經驗記錄不存在',
    LEARNING_EXPERIENCE_NOT_FOUND: '找不到學習經歷記錄',
    LEARNING_EXPERIENCE_RECORD_NOT_FOUND: '學習經歷記錄不存在',
    UNAUTHORIZED_ACCESS: '您沒有權限執行此操作',
    UNAUTHORIZED_WORK_EXPERIENCE_ACCESS: '無權存取此工作經驗記錄',
    UNAUTHORIZED_WORK_EXPERIENCE_DELETE: '無權刪除此工作經驗記錄',
    UNAUTHORIZED_LEARNING_EXPERIENCE_ACCESS: '無權存取此學習經歷記錄',
    UNAUTHORIZED_LEARNING_EXPERIENCE_DELETE: '無權刪除此學習經歷記錄',
    TEACHER_PERMISSION_REQUIRED: '需要教師權限才能執行此操作',
    STUDENT_ONLY_APPLY_TEACHER: '只有學生可以申請成為教師',
    ACCOUNT_STATUS_INVALID: '帳號狀態異常',
    APPLICATION_STATUS_INVALID: '只能在待審核或已拒絕狀態下修改申請',
    REGISTRATION_FAILED: '註冊失敗',
    LOGIN_FAILED: '登入失敗',
    PROFILE_UPDATE_FAILED: '更新個人資料失敗',
    PASSWORD_RESET_FAILED: '密碼重設失敗',
    TOKEN_REFRESH_FAILED: 'Token 刷新失敗',
  },

  // 系統錯誤訊息
  SYSTEM: {
    INTERNAL_ERROR: '系統內部錯誤',
    DATABASE_ERROR: '資料庫連接錯誤',
    VALIDATION_FAILED: '參數驗證失敗',
    VALIDATION_ERROR: '參數驗證失敗',
    TEACHER_APPLICATION_VALIDATION_FAILED: '教師申請參數驗證失敗',
    UNKNOWN_ERROR: '未知錯誤',
  },

  // 成功訊息
  SUCCESS: {
    REGISTRATION_SUCCESS: '註冊成功',
    LOGIN_SUCCESS: '登入成功',
    PROFILE_RETRIEVED: '成功取得個人資料',
    PROFILE_UPDATED: '成功更新個人資料',
    ACCOUNT_DELETED: '帳號已成功刪除',
    PASSWORD_RESET_EMAIL_SENT: '重設密碼郵件已發送，請檢查您的信箱',
    PASSWORD_RESET_SUCCESS: '密碼重設成功',
    TOKEN_REFRESH_SUCCESS: 'Token 刷新成功',
    // 工作經驗相關成功訊息
    WORK_EXPERIENCE_LIST_SUCCESS: '取得工作經驗列表成功',
    WORK_EXPERIENCE_CREATED: '工作經驗已新增',
    WORK_EXPERIENCE_UPDATED: '工作經驗已更新',
    WORK_EXPERIENCE_DELETED: '工作經驗已刪除',
    // 學習經歷相關成功訊息
    LEARNING_EXPERIENCE_LIST_SUCCESS: '取得學習經歷列表成功',
    LEARNING_EXPERIENCE_CREATED: '學習經歷已新增',
    LEARNING_EXPERIENCE_UPDATED: '學習經歷已更新',
    LEARNING_EXPERIENCE_DELETED: '學習經歷已刪除',
  }
} as const

// 導出型別定義供 TypeScript 使用
export type ErrorMessageKeys = keyof typeof ERROR_MESSAGES
export type AuthErrorKeys = keyof typeof ERROR_MESSAGES.AUTH
export type ValidationErrorKeys = keyof typeof ERROR_MESSAGES.VALIDATION
export type BusinessErrorKeys = keyof typeof ERROR_MESSAGES.BUSINESS
export type SystemErrorKeys = keyof typeof ERROR_MESSAGES.SYSTEM
export type SuccessMessageKeys = keyof typeof ERROR_MESSAGES.SUCCESS

// 便捷的訪問器
export const AuthMessages = ERROR_MESSAGES.AUTH
export const ValidationMessages = ERROR_MESSAGES.VALIDATION
export const BusinessMessages = ERROR_MESSAGES.BUSINESS
export const SystemMessages = ERROR_MESSAGES.SYSTEM
export const SuccessMessages = ERROR_MESSAGES.SUCCESS