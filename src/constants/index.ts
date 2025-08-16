/**
 * Constants 統一匯出入口
 * 
 * 統一管理和匯出所有常數檔案，方便其他模組匯入使用
 */

// 錯誤訊息常數
export * from './errorMessages'

// 驗證常數
export * from './validation'

// 學習經歷常數
export * from './learningExperience'

// 時間管理常數
export * from './schedule'

// 便捷的預設匯出
export { ERROR_MESSAGES as ErrorMessages } from './errorMessages'
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