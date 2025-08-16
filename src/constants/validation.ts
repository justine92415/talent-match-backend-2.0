/**
 * 統一驗證常數管理
 * 
 * 集中管理所有驗證相關的數值限制和配置，確保：
 * 1. 驗證邏輯使用統一的限制值
 * 2. 測試檔案使用統一的邊界值
 * 3. 前後端驗證規則保持一致
 * 4. 維護時只需要修改一個地方
 */

/**
 * 使用者相關驗證常數
 */
export const USER_VALIDATION = {
  NICKNAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 100,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
  },
  NAME: {
    MAX_LENGTH: 50,
  },
  CONTACT_PHONE: {
    MAX_LENGTH: 15,
  },
} as const

/**
 * 教師相關驗證常數
 */
export const TEACHER_VALIDATION = {
  NATIONALITY: {
    MAX_LENGTH: 50,
  },
  INTRODUCTION: {
    MIN_LENGTH: 50,
    MAX_LENGTH: 1000,
  },
  TEACHING_EXPERIENCE: {
    MAX_LENGTH: 500,
  },
  HOURLY_RATE: {
    MIN_VALUE: 100,
    MAX_VALUE: 5000,
  },
} as const

/**
 * 課程相關驗證常數
 */
export const COURSE_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 20,
    MAX_LENGTH: 2000,
  },
  PRICE: {
    MIN_VALUE: 0,
    MAX_VALUE: 50000,
  },
  DURATION: {
    MIN_MINUTES: 30,
    MAX_MINUTES: 480, // 8小時
  },
} as const

/**
 * 工作經驗相關驗證常數
 */
export const WORK_EXPERIENCE_VALIDATION = {
  COMPANY_NAME: {
    MAX_LENGTH: 100,
  },
  POSITION: {
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
} as const

/**
 * 學習經驗相關驗證常數
 */
export const LEARNING_EXPERIENCE_VALIDATION = {
  INSTITUTION: {
    MAX_LENGTH: 100,
  },
  DEGREE: {
    MAX_LENGTH: 100,
  },
  FIELD_OF_STUDY: {
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
  },
} as const

/**
 * 證書相關驗證常數
 */
export const CERTIFICATE_VALIDATION = {
  VERIFYING_INSTITUTION: {
    MAX_LENGTH: 100,
  },
  LICENSE_NAME: {
    MAX_LENGTH: 200,
  },
  HOLDER_NAME: {
    MAX_LENGTH: 100,
  },
  LICENSE_NUMBER: {
    MAX_LENGTH: 100,
  },
  CATEGORY_ID: {
    MAX_LENGTH: 50,
  },
  SUBJECT: {
    MAX_LENGTH: 200,
  },
  FILE_PATH: {
    MAX_LENGTH: 500,
  },
} as const

/**
 * 檔案上傳相關驗證常數
 */
export const FILE_VALIDATION = {
  // 檔案大小限制（以 bytes 為單位）
  MAX_SIZE: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
  },
  // 允許的檔案類型
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    VIDEO: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'],
  },
} as const

/**
 * 聊天和訊息相關驗證常數
 */
export const MESSAGE_VALIDATION = {
  CONTENT: {
    MAX_LENGTH: 1000,
  },
} as const

/**
 * 評價和評論相關驗證常數
 */
export const REVIEW_VALIDATION = {
  CONTENT: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 500,
  },
  RATING: {
    MIN_VALUE: 1,
    MAX_VALUE: 5,
  },
} as const

// 導出型別定義供 TypeScript 使用
export type UserValidationKeys = keyof typeof USER_VALIDATION
export type TeacherValidationKeys = keyof typeof TEACHER_VALIDATION
export type CourseValidationKeys = keyof typeof COURSE_VALIDATION
export type WorkExperienceValidationKeys = keyof typeof WORK_EXPERIENCE_VALIDATION
export type LearningExperienceValidationKeys = keyof typeof LEARNING_EXPERIENCE_VALIDATION
export type CertificateValidationKeys = keyof typeof CERTIFICATE_VALIDATION
export type FileValidationKeys = keyof typeof FILE_VALIDATION
export type MessageValidationKeys = keyof typeof MESSAGE_VALIDATION
export type ReviewValidationKeys = keyof typeof REVIEW_VALIDATION