/**
 * 影片管理 Joi 驗證 Schemas
 * 
 * 遵循專案開發準則：
 * - 使用 MESSAGES 常數確保錯誤訊息一致性
 * - 支援 YouTube URL 驗證
 * - 支援檔案格式和大小檢查
 * - 支援欄位長度限制
 * - 整合專案既有的驗證架構
 */

import Joi from 'joi'
import { VideoType } from '@entities/enums'
import { MESSAGES } from '@constants/Message'

// ========================================
// 基礎驗證規則
// ========================================

/** YouTube URL 驗證正規表達式 */
const YOUTUBE_URL_REGEX = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|m\.youtube\.com\/watch\?v=)[\w-]{11}$/

/** 影片名稱驗證規則 */
const videoNameSchema = Joi.string()
  .required()
  .min(1)
  .max(200)
  .trim()
  .messages({
    'string.empty': MESSAGES.VALIDATION.VIDEO_NAME_REQUIRED,
    'any.required': MESSAGES.VALIDATION.VIDEO_NAME_REQUIRED,
    'string.max': MESSAGES.VALIDATION.VIDEO_NAME_TOO_LONG
  })

/** 影片分類驗證規則 */
const videoCategorySchema = Joi.string()
  .required()
  .min(1)
  .max(100)
  .trim()
  .messages({
    'string.empty': MESSAGES.VALIDATION.VIDEO_CATEGORY_REQUIRED,
    'any.required': MESSAGES.VALIDATION.VIDEO_CATEGORY_REQUIRED,
    'string.max': MESSAGES.VALIDATION.VIDEO_CATEGORY_TOO_LONG
  })

/** 影片介紹驗證規則 */
const videoIntroSchema = Joi.string()
  .required()
  .min(1)
  .max(2000)
  .trim()
  .messages({
    'string.empty': MESSAGES.VALIDATION.VIDEO_INTRO_REQUIRED,
    'any.required': MESSAGES.VALIDATION.VIDEO_INTRO_REQUIRED,
    'string.max': MESSAGES.VALIDATION.VIDEO_INTRO_TOO_LONG
  })

/** 影片類型驗證規則 */
const videoTypeSchema = Joi.string()
  .required()
  .valid(...Object.values(VideoType))
  .messages({
    'any.required': MESSAGES.VALIDATION.VIDEO_TYPE_REQUIRED,
    'any.only': MESSAGES.VALIDATION.VIDEO_TYPE_INVALID
  })

/** YouTube URL 驗證規則 */
const youtubeUrlSchema = Joi.string()
  .pattern(YOUTUBE_URL_REGEX)
  .messages({
    'string.pattern.base': MESSAGES.VALIDATION.YOUTUBE_URL_INVALID,
    'string.empty': MESSAGES.VALIDATION.YOUTUBE_URL_REQUIRED,
    'any.required': MESSAGES.VALIDATION.YOUTUBE_URL_REQUIRED
  })

// ========================================
// 影片上傳驗證 Schemas
// ========================================

/** YouTube 影片上傳驗證 */
export const uploadYouTubeVideoSchema = Joi.object({
  name: videoNameSchema,
  category: videoCategorySchema,
  intro: videoIntroSchema,
  video_type: Joi.string()
    .required()
    .valid(VideoType.YOUTUBE)
    .messages({
      'any.required': MESSAGES.VALIDATION.VIDEO_TYPE_REQUIRED,
      'any.only': MESSAGES.VALIDATION.VIDEO_TYPE_INVALID
    }),
  youtube_url: youtubeUrlSchema.required()
})

/** 本地儲存影片上傳驗證 */
export const uploadStorageVideoSchema = Joi.object({
  name: videoNameSchema,
  category: videoCategorySchema,
  intro: videoIntroSchema,
  video_type: Joi.string()
    .required()
    .valid(VideoType.STORAGE)
    .messages({
      'any.required': MESSAGES.VALIDATION.VIDEO_TYPE_REQUIRED,
      'any.only': MESSAGES.VALIDATION.VIDEO_TYPE_INVALID
    }),
  youtube_url: Joi.forbidden().messages({
    'any.unknown': MESSAGES.VALIDATION.YOUTUBE_URL_NOT_ALLOWED_FOR_STORAGE
  })
})

/** 影片上傳通用驗證（根據 video_type 動態驗證） */
export const uploadVideoSchema = Joi.object({
  name: videoNameSchema,
  category: videoCategorySchema,
  intro: videoIntroSchema,
  video_type: videoTypeSchema,
  youtube_url: Joi.when('video_type', {
    is: VideoType.YOUTUBE,
    then: youtubeUrlSchema.required(),
    otherwise: Joi.forbidden().messages({
      'any.unknown': MESSAGES.VALIDATION.YOUTUBE_URL_NOT_ALLOWED_FOR_STORAGE
    })
  })
})

// ========================================
// 影片更新驗證 Schemas
// ========================================

/** 影片更新驗證（所有欄位均為選填） */
export const updateVideoSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(200)
    .trim()
    .messages({
      'string.empty': MESSAGES.VALIDATION.VIDEO_NAME_REQUIRED,
      'string.max': MESSAGES.VALIDATION.VIDEO_NAME_TOO_LONG
    }),
  category: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .messages({
      'string.empty': MESSAGES.VALIDATION.VIDEO_CATEGORY_REQUIRED,
      'string.max': MESSAGES.VALIDATION.VIDEO_CATEGORY_TOO_LONG
    }),
  intro: Joi.string()
    .min(1)
    .max(2000)
    .trim()
    .messages({
      'string.empty': MESSAGES.VALIDATION.VIDEO_INTRO_REQUIRED,
      'string.max': MESSAGES.VALIDATION.VIDEO_INTRO_TOO_LONG
    })
}).min(1).messages({
  'object.min': MESSAGES.VALIDATION.UPDATE_DATA_REQUIRED
})

// ========================================
// 影片查詢驗證 Schemas
// ========================================

/** 影片列表查詢驗證 */
export const videoListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': MESSAGES.VALIDATION.PAGE_MUST_BE_NUMBER,
      'number.integer': MESSAGES.VALIDATION.PAGE_MUST_BE_INTEGER,
      'number.min': MESSAGES.VALIDATION.PAGE_MUST_BE_POSITIVE
    }),
  per_page: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_NUMBER,
      'number.integer': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_INTEGER,
      'number.min': MESSAGES.VALIDATION.PER_PAGE_MUST_BE_POSITIVE,
      'number.max': MESSAGES.VALIDATION.PER_PAGE_TOO_LARGE
    }),
  category: Joi.string()
    .max(100)
    .trim()
    .allow('')
    .messages({
      'string.max': MESSAGES.VALIDATION.VIDEO_CATEGORY_TOO_LONG
    }),
  search: Joi.string()
    .max(200)
    .trim()
    .allow('')
    .messages({
      'string.max': MESSAGES.VALIDATION.SEARCH_QUERY_TOO_LONG
    })
})

/** 影片 ID 參數驗證 */
export const videoIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': MESSAGES.VALIDATION.VIDEO_ID_MUST_BE_NUMBER,
      'number.integer': MESSAGES.VALIDATION.VIDEO_ID_MUST_BE_INTEGER,
      'number.positive': MESSAGES.VALIDATION.VIDEO_ID_MUST_BE_POSITIVE,
      'any.required': MESSAGES.VALIDATION.VIDEO_ID_REQUIRED
    })
})

// ========================================
// 檔案上傳驗證規則
// ========================================

/** 支援的影片檔案格式 */
export const SUPPORTED_VIDEO_FORMATS = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/quicktime'
]

/** 影片檔案大小限制（位元組） */
export const VIDEO_FILE_SIZE_LIMIT = 500 * 1024 * 1024 // 500MB

/** 縮圖檔案大小限制（位元組） */
export const THUMBNAIL_SIZE_LIMIT = 5 * 1024 * 1024 // 5MB

/** 支援的縮圖檔案格式 */
export const SUPPORTED_THUMBNAIL_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
]

// ========================================
// 檔案驗證輔助函式
// ========================================

/**
 * 驗證影片檔案格式
 * @param mimetype 檔案 MIME 類型
 * @returns 是否為支援的格式
 */
export const isValidVideoFormat = (mimetype: string): boolean => {
  return SUPPORTED_VIDEO_FORMATS.includes(mimetype)
}

/**
 * 驗證影片檔案大小
 * @param size 檔案大小（位元組）
 * @returns 是否在大小限制內
 */
export const isValidVideoSize = (size: number): boolean => {
  return size <= VIDEO_FILE_SIZE_LIMIT
}

/**
 * 驗證縮圖檔案格式
 * @param mimetype 檔案 MIME 類型
 * @returns 是否為支援的格式
 */
export const isValidThumbnailFormat = (mimetype: string): boolean => {
  return SUPPORTED_THUMBNAIL_FORMATS.includes(mimetype)
}

/**
 * 驗證縮圖檔案大小
 * @param size 檔案大小（位元組）
 * @returns 是否在大小限制內
 */
export const isValidThumbnailSize = (size: number): boolean => {
  return size <= THUMBNAIL_SIZE_LIMIT
}

/**
 * 驗證 YouTube URL 格式
 * @param url YouTube URL
 * @returns 是否為有效的 YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return YOUTUBE_URL_REGEX.test(url)
}

// ========================================
// 檔案上傳錯誤檢查函式
// ========================================

/**
 * 檢查影片檔案並回傳錯誤訊息
 * @param file Express 檔案物件
 * @returns 錯誤訊息陣列
 */
export const validateVideoFile = (file: any): string[] => {
  const errors: string[] = []

  if (!file) {
    errors.push(MESSAGES.VALIDATION.VIDEO_FILE_REQUIRED)
    return errors
  }

  if (!isValidVideoFormat(file.mimetype)) {
    errors.push(MESSAGES.VALIDATION.VIDEO_FILE_FORMAT_INVALID)
  }

  if (!isValidVideoSize(file.size)) {
    errors.push(MESSAGES.VALIDATION.VIDEO_FILE_TOO_LARGE)
  }

  return errors
}

/**
 * 檢查縮圖檔案並回傳錯誤訊息
 * @param file Express 檔案物件
 * @returns 錯誤訊息陣列
 */
export const validateThumbnailFile = (file: any): string[] => {
  const errors: string[] = []

  if (!file) {
    return errors // 縮圖為選填，不檢查必填
  }

  if (!isValidThumbnailFormat(file.mimetype)) {
    errors.push(MESSAGES.VALIDATION.THUMBNAIL_FILE_FORMAT_INVALID)
  }

  if (!isValidThumbnailSize(file.size)) {
    errors.push(MESSAGES.VALIDATION.THUMBNAIL_FILE_TOO_LARGE)
  }

  return errors
}

// ========================================
// Schema 整合匯出
// ========================================

export const videoSchemas = {
  // 上傳相關
  uploadVideo: uploadVideoSchema,
  uploadYouTube: uploadYouTubeVideoSchema,
  uploadStorage: uploadStorageVideoSchema,
  
  // 更新相關
  updateVideo: updateVideoSchema,
  
  // 查詢相關
  videoList: videoListQuerySchema,
  videoId: videoIdParamSchema,
  
  // 檔案驗證
  validateVideoFile,
  validateThumbnailFile,
  
  // 格式檢查
  isValidVideoFormat,
  isValidVideoSize,
  isValidThumbnailFormat,
  isValidThumbnailSize,
  isValidYouTubeUrl
}

export default videoSchemas