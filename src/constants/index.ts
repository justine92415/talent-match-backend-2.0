/**
 * Constants 統一匯出入口
 * 
 * 統一管理和匯出所有常數檔案，方便其他模組匯入使用
 */

// === 新的統一訊息與錯誤代碼系統 ===
// 訊息管理系統
export * from './Message'

// 錯誤代碼管理系統  
export * from './ErrorCode'

// === 其他常數系統 ===
// 驗證常數
export * from './validation'

// 學習經歷常數
export * from './learningExperience'

// 時間管理常數
export * from './schedule'

// === 便捷的預設匯出 ===
// 新系統
export { 
  MESSAGES as Messages,
  AuthMessages,
  ValidationMessages,
  BusinessMessages,
  SystemMessages,
  WorkExperienceMessages,
  LearningExperienceMessages,
  CourseMessages,
  PriceOptionMessages,
  SuccessMessages,
  SUCCESS
} from './Message'

export { 
  ERROR_CODES as ErrorCodes,
  ERROR_CODE_CATEGORIES as ErrorCodeCategories,
  getErrorCategory,
  isValidErrorCode 
} from './ErrorCode'

// 向後相容性：將新系統的內容以舊的結構匯出
export { MESSAGES as ERROR_MESSAGES } from './Message'

// 驗證系統
export { 
  USER_VALIDATION as UserValidation,
  TEACHER_VALIDATION as TeacherValidation,
  COURSE_VALIDATION as CourseValidation,
  WORK_EXPERIENCE_VALIDATION as WorkExperienceValidation,
  LEARNING_EXPERIENCE_VALIDATION as LearningExperienceValidation,
  CERTIFICATE_VALIDATION as CertificateValidation,
  FILE_VALIDATION as FileValidation,
  MESSAGE_VALIDATION as MessageValidation,
  REVIEW_VALIDATION as ReviewValidation
} from './validation'