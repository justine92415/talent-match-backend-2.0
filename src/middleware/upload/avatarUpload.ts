/**
 * 頭像上傳中間件配置
 * 
 * 專門處理使用者頭像上傳的 formidable 配置和驗證邏輯
 */

import formidable from 'formidable'
import { Request, Response, NextFunction } from 'express'
import path from 'path'
import * as fs from 'fs'
import { 
  AVATAR_ALLOWED_MIME_TYPES, 
  AVATAR_MAX_FILE_SIZE 
} from '../../types/userAvatar.interface'
import { MESSAGES } from '@constants/Message'
import { Errors } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'

/**
 * 頭像上傳配置
 */
export const AVATAR_FORMIDABLE_CONFIG = {
  multiples: false,
  maxFileSize: AVATAR_MAX_FILE_SIZE,
  maxFiles: 1,
  keepExtensions: true,
  uploadDir: path.join(process.cwd(), 'tmp', 'avatars'),
  // 移除 filter，讓所有檔案都能上傳到驗證階段
  // 這樣可以在後續提供更明確的錯誤訊息
}

/**
 * 頭像檔案解析中間件
 * 
 * 使用 formidable 處理頭像檔案上傳
 */
export const parseAvatarFile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // 確保上傳目錄存在
    if (!fs.existsSync(AVATAR_FORMIDABLE_CONFIG.uploadDir)) {
      fs.mkdirSync(AVATAR_FORMIDABLE_CONFIG.uploadDir, { recursive: true })
    }

    const form = formidable(AVATAR_FORMIDABLE_CONFIG)
    
    const [fields, files] = await form.parse(req)
    
    // 檢查是否有頭像檔案
    const avatarFile = files.avatar
    
    if (!avatarFile) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_REQUIRED,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
      )
    }

    // 處理單個檔案或檔案陣列
    const file = Array.isArray(avatarFile) ? avatarFile[0] : avatarFile

    if (!file) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_REQUIRED,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
      )
    }

    // 將檔案附加到 request 物件
    ;(req as any).file = file
    ;(req as any).body = fields

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 頭像檔案驗證中間件
 * 
 * 在 formidable 處理後進行額外的檔案內容驗證
 */
export const validateAvatarFileMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const file = (req as any).file

    if (!file) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_REQUIRED,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
      )
    }

    // 檢查檔案格式 - 提供更詳細的錯誤訊息
    if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      const detailedMessage = `不支援的檔案格式 "${file.mimetype}"。僅支援: JPEG, JPG, PNG, WebP`
      
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_FORMAT_INVALID,
        { 
          avatar: [detailedMessage],
          currentFormat: [`當前格式: ${file.mimetype}`],
          fileName: [`檔案名稱: ${file.originalFilename || '未知檔案'}`]
        },
        detailedMessage
      )
    }

    // 檢查檔案大小
    if (file.size > AVATAR_MAX_FILE_SIZE) {
      const maxSizeMB = (AVATAR_MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      const detailedMessage = `檔案大小超過限制。當前大小: ${currentSizeMB}MB，最大允許: ${maxSizeMB}MB`
      
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_TOO_LARGE,
        {
          avatar: [detailedMessage],
          fileSize: [`當前大小: ${currentSizeMB}MB`],
          maxSize: [`最大允許: ${maxSizeMB}MB`]
        },
        detailedMessage
      )
    }

    // 檢查檔案是否存在
    if (!fs.existsSync((file as any).filepath)) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_CORRUPTED,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_CORRUPTED
      )
    }

    // 檔案驗證通過，繼續處理
    next()
  } catch (error) {
    // 清理上傳的檔案（如果存在）
    const file = (req as any).file
    if (file && (file as any).filepath) {
      try {
        fs.unlinkSync((file as any).filepath)
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp file after validation error:', (file as any).filepath)
      }
    }
    
    next(error)
  }
}

/**
 * 清理臨時檔案中間件
 * 
 * 在處理完成後清理臨時檔案
 */
export const cleanupTempFile = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const originalSend = res.send

  res.send = function(body) {
    // 清理臨時檔案
    const file = (req as any).file
    if (file && (file as any).filepath) {
      try {
        fs.unlinkSync((file as any).filepath)
      } catch (error) {
        console.warn('Failed to cleanup temp file:', (file as any).filepath)
      }
    }
    
    return originalSend.call(this, body)
  }

  next()
}