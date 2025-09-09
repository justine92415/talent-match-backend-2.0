/**
 * 課程檔案 Joi 驗證 Schemas
 * 
 * 遵循專案開發準則：
 * - 使用 MESSAGES 常數確保錯誤訊息一致性
 * - 支援檔案上傳驗證（格式、大小、數量限制）
 * - 支援分頁查詢驗證
 * - 整合專案既有的驗證架構
 * - TODO: 檔案上傳功能未實作，先建立 multipart 驗證架構
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

// ========================================
// 基礎驗證規則
// ========================================

/** 課程ID驗證規則 */
const courseIdSchema = Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
    'number.base': MESSAGES.BUSINESS.COURSE_NOT_FOUND,
    'number.integer': MESSAGES.BUSINESS.COURSE_NOT_FOUND,
    'number.positive': MESSAGES.BUSINESS.COURSE_NOT_FOUND,
    'any.required': MESSAGES.BUSINESS.COURSE_NOT_FOUND,
  })

/** 檔案ID驗證規則 */
const fileIdSchema = Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
    'number.base': MESSAGES.BUSINESS.COURSE_FILE_NOT_FOUND,
    'number.integer': MESSAGES.BUSINESS.COURSE_FILE_NOT_FOUND,
    'number.positive': MESSAGES.BUSINESS.COURSE_FILE_NOT_FOUND,
    'any.required': MESSAGES.BUSINESS.COURSE_FILE_NOT_FOUND,
  })

/** 分頁頁碼驗證規則 */
const pageSchema = Joi.number()
  .integer()
  .min(1)
  .default(1)
  .messages({
    'number.base': '頁碼必須為數字',
    'number.integer': '頁碼必須為整數',
    'number.min': '頁碼必須大於0',
  })

/** 每頁數量驗證規則 */
const perPageSchema = Joi.number()
  .integer()
  .min(1)
  .max(100)
  .default(10)
  .messages({
    'number.base': '每頁數量必須為數字',
    'number.integer': '每頁數量必須為整數',
    'number.min': '每頁數量必須大於0',
    'number.max': '每頁數量不能超過100',
  })

// ========================================
// 檔案驗證規則
// ========================================

/** 支援的檔案類型 */
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
]

/** 檔案大小限制 */
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TOTAL_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_FILE_COUNT = 10

/** 單一檔案驗證規則 */
const fileUploadSchema = Joi.object({
  originalname: Joi.string()
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.COURSE_FILE_NAME_REQUIRED,
      'any.required': MESSAGES.VALIDATION.COURSE_FILE_NAME_REQUIRED,
    }),
  filename: Joi.string()
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
      'any.required': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
    }),
  mimetype: Joi.string()
    .valid(...SUPPORTED_MIME_TYPES)
    .required()
    .messages({
      'any.only': MESSAGES.VALIDATION.COURSE_FILE_FORMAT_INVALID,
      'any.required': MESSAGES.VALIDATION.COURSE_FILE_FORMAT_INVALID,
    }),
  size: Joi.number()
    .integer()
    .positive()
    .max(MAX_FILE_SIZE)
    .required()
    .messages({
      'number.base': '檔案大小格式不正確',
      'number.integer': '檔案大小格式不正確',
      'number.positive': '檔案大小格式不正確',
      'number.max': MESSAGES.VALIDATION.COURSE_FILE_TOO_LARGE,
      'any.required': '檔案大小為必填欄位',
    }),
  path: Joi.string()
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
      'any.required': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
    }),
  buffer: Joi.binary().optional()
}).required()

// ========================================
// API 請求驗證 Schemas
// ========================================

/**
 * 取得課程檔案列表 - GET /api/courses/:id/files
 * 參數驗證 Schema
 */
export const getCourseFilesParamSchema = Joi.object({
  id: courseIdSchema,
}).required()

/**
 * 取得課程檔案列表 - GET /api/courses/:id/files
 * 查詢參數驗證 Schema
 */
export const getCourseFilesQuerySchema = Joi.object({
  page: pageSchema,
  per_page: perPageSchema,
}).unknown(false)

/**
 * 上傳課程檔案 - POST /api/courses/:id/files
 * 參數驗證 Schema
 */
export const uploadCourseFilesParamSchema = Joi.object({
  id: courseIdSchema,
}).required()

/**
 * 上傳課程檔案 - POST /api/courses/:id/files
 * Body 驗證 Schema（multipart/form-data）
 * TODO: 實際檔案上傳功能未實作，先建立驗證架構
 */
export const uploadCourseFilesBodySchema = Joi.object({
  files: Joi.array()
    .items(fileUploadSchema)
    .min(1)
    .max(MAX_FILE_COUNT)
    .required()
    .custom((value, helpers) => {
      // 驗證總檔案大小
      const totalSize = value.reduce((sum: number, file: any) => sum + file.size, 0)
      if (totalSize > MAX_TOTAL_SIZE) {
        return helpers.error('custom.total-size-exceeded')
      }

      // 驗證檔案名稱重複
      const filenames = value.map((file: any) => file.originalname)
      const uniqueFilenames = new Set(filenames)
      if (filenames.length !== uniqueFilenames.size) {
        return helpers.error('custom.duplicate-filename')
      }

      return value
    })
    .messages({
      'array.base': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
      'array.min': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
      'array.max': `最多只能上傳 ${MAX_FILE_COUNT} 個檔案`,
      'array.includesRequiredUnknowns': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
      'any.required': MESSAGES.VALIDATION.COURSE_FILES_REQUIRED,
      'custom.total-size-exceeded': `檔案總大小不能超過 ${Math.floor(MAX_TOTAL_SIZE / 1024 / 1024)}MB`,
      'custom.duplicate-filename': '不能上傳重複檔案名稱的檔案',
    }),
  descriptions: Joi.array()
    .items(Joi.string().max(500))
    .optional()
    .messages({
      'array.base': '檔案描述必須為字串陣列',
      'string.max': '檔案描述不能超過 500 個字元',
    }),
}).required()

/**
 * 刪除課程檔案 - DELETE /api/courses/:course_id/files/:file_id
 * 參數驗證 Schema
 */
export const deleteCourseFileParamSchema = Joi.object({
  course_id: courseIdSchema,
  file_id: fileIdSchema,
}).required()

// ========================================
// 驗證中間件函式
// ========================================

// ========================================
// 匯出所有驗證 Schemas
// ========================================

export const courseFileSchemas = {
  getCourseFilesParamSchema,
  getCourseFilesQuerySchema,
  uploadCourseFilesParamSchema,
  uploadCourseFilesBodySchema,
  deleteCourseFileParamSchema,
}

export default courseFileSchemas