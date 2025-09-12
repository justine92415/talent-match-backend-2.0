import Joi from 'joi'
import { MESSAGES } from '@constants/Message'
import { 
  AVATAR_ALLOWED_MIME_TYPES, 
  AVATAR_MAX_FILE_SIZE,
  AVATAR_MAX_WIDTH,
  AVATAR_MAX_HEIGHT,
  AVATAR_MIN_WIDTH,
  AVATAR_MIN_HEIGHT
} from '../../../types/userAvatar.interface'

/**
 * 頭像上傳檔案驗證
 */
export const avatarFileValidation = Joi.object({
  // formidable 檔案驗證
  fieldname: Joi.string().valid('avatar').required().messages({
    'any.only': MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED,
    'any.required': MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
  }),
  
  originalname: Joi.string().required().messages({
    'any.required': MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
  }),
  
  mimetype: Joi.string().valid(...AVATAR_ALLOWED_MIME_TYPES).required().messages({
    'any.only': MESSAGES.VALIDATION.AVATAR_FILE_FORMAT_INVALID,
    'any.required': MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
  }),
  
  size: Joi.number().max(AVATAR_MAX_FILE_SIZE).required().messages({
    'number.max': MESSAGES.VALIDATION.AVATAR_FILE_TOO_LARGE,
    'any.required': MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
  }),
  
  buffer: Joi.binary().required().messages({
    'any.required': MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
  })
}).unknown(true) // 允許其他 formidable 相關欄位

/**
 * 頭像上傳驗證中間件 Schema
 * 
 * 用於驗證上傳的頭像檔案格式和尺寸
 */
export const avatarUploadSchema = Joi.object({
  avatar: avatarFileValidation.required().messages({
    'any.required': MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
  })
}).unknown(false) // 不允許其他欄位

/**
 * 頭像刪除驗證 Schema
 */
export const avatarDeleteSchema = Joi.object({
  avatarUrl: Joi.string().uri().optional().messages({
    'string.uri': '頭像網址格式不正確'
  })
}).unknown(false)

/**
 * 頭像處理選項驗證 Schema
 */
export const avatarProcessingOptionsSchema = Joi.object({
  resize: Joi.object({
    width: Joi.number().min(AVATAR_MIN_WIDTH).max(AVATAR_MAX_WIDTH).required(),
    height: Joi.number().min(AVATAR_MIN_HEIGHT).max(AVATAR_MAX_HEIGHT).required()
  }).optional(),
  
  quality: Joi.number().min(10).max(100).optional(),
  
  format: Joi.string().valid('jpeg', 'png', 'webp').optional()
}).optional()

/**
 * 檔案上傳驗證工具函式
 * 
 * 在 formidable 處理後驗證檔案內容
 */
export const validateAvatarFile = (file: any): void => {
  if (!file) {
    throw new Error(MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED)
  }

  // 驗證檔案格式
  if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
    throw new Error(MESSAGES.VALIDATION.AVATAR_FILE_FORMAT_INVALID)
  }

  // 驗證檔案大小
  if (file.size > AVATAR_MAX_FILE_SIZE) {
    throw new Error(MESSAGES.VALIDATION.AVATAR_FILE_TOO_LARGE)
  }

  // 驗證檔案內容不為空
  if (!file.buffer || file.buffer.length === 0) {
    throw new Error(MESSAGES.VALIDATION.AVATAR_FILE_CORRUPTED)
  }
}