/**
 * 課程圖片上傳中間件配置
 * 
 * 專門處理課程圖片上傳的 formidable 配置和驗證邏輯
 * 仿照 avatarUpload.ts 的設計模式
 */

import formidable from 'formidable'
import { Request, Response, NextFunction } from 'express'
import path from 'path'
import * as fs from 'fs'
import { MESSAGES } from '@constants/Message'
import { Errors } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'

/**
 * 清理課程圖片暫存檔案的輔助函式
 * @param filePath 檔案路徑
 * @param context 清理的上下文（用於記錄）
 */
const cleanupTempFile = (filePath: string, context: string = ''): void => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`已清理暫存課程圖片檔案 ${context}:`, filePath)
    }
  } catch (error) {
    console.warn(`清理暫存課程圖片檔案失敗 ${context}:`, filePath, error)
  }
}

/**
 * 課程圖片允許的 MIME 類型
 */
export const COURSE_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
] as const

/**
 * 課程圖片最大檔案大小 (10MB)
 */
export const COURSE_IMAGE_MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * 課程圖片上傳配置
 */
export const COURSE_IMAGE_FORMIDABLE_CONFIG = {
  multiples: false,
  maxFileSize: COURSE_IMAGE_MAX_FILE_SIZE,
  maxFiles: 1,
  keepExtensions: true,
  uploadDir: path.join(process.cwd(), 'tmp', 'course-images'),
}

/**
 * 課程圖片檔案解析中間件
 * 
 * 使用 formidable 處理課程圖片和表單資料上傳
 */
export const parseCourseImageFile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  let tempFilePath: string | null = null
  
  try {
    // 確保上傳目錄存在
    if (!fs.existsSync(COURSE_IMAGE_FORMIDABLE_CONFIG.uploadDir)) {
      fs.mkdirSync(COURSE_IMAGE_FORMIDABLE_CONFIG.uploadDir, { recursive: true })
    }

    const form = formidable(COURSE_IMAGE_FORMIDABLE_CONFIG)
    
    const [fields, files] = await form.parse(req)
    
    // 檢查是否有課程圖片檔案（可選）
    const courseImageFile = files.courseImage
    
    // 記錄暫存檔案路徑以便錯誤時清理
    if (courseImageFile) {
      const file = Array.isArray(courseImageFile) ? courseImageFile[0] : courseImageFile
      tempFilePath = (file as any).filepath
    }
    
    // 解析課程資料和方案資料
    let courseData = {}
    let priceOptions = []
    
    try {
      if (fields.courseData) {
        const courseDataString = Array.isArray(fields.courseData) ? fields.courseData[0] : fields.courseData
        courseData = JSON.parse(courseDataString as string)
      }
      
      if (fields.priceOptions) {
        const priceOptionsString = Array.isArray(fields.priceOptions) ? fields.priceOptions[0] : fields.priceOptions
        priceOptions = JSON.parse(priceOptionsString as string)
      }
    } catch (parseError) {
      // JSON 解析錯誤時清理暫存檔案
      if (tempFilePath) {
        cleanupTempFile(tempFilePath, '(JSON 解析錯誤)')
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.INVALID_JSON_FORMAT,
        { 
          courseData: ["課程資料格式錯誤，請確認 JSON 格式正確"],
          priceOptions: ["方案資料格式錯誤，請確認 JSON 格式正確"]
        },
        "表單資料格式錯誤"
      )
    }

    // 將解析結果附加到 request 物件
    ;(req as any).courseImage = courseImageFile ? (Array.isArray(courseImageFile) ? courseImageFile[0] : courseImageFile) : null
    ;(req as any).body = {
      ...courseData,
      priceOptions
    }

    next()
  } catch (error) {
    // 任何錯誤發生時都要清理暫存檔案
    if (tempFilePath) {
      cleanupTempFile(tempFilePath, '(解析錯誤)')
    }
    
    next(error)
  }
}

/**
 * 課程圖片檔案驗證中間件
 * 
 * 在 formidable 處理後進行額外的檔案內容驗證
 */
export const validateCourseImageFileMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const file = (req as any).courseImage

    // 如果沒有上傳圖片，跳過驗證（圖片是可選的）
    if (!file) {
      next()
      return
    }

    // 檢查檔案格式
    if (!COURSE_IMAGE_ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      const detailedMessage = `不支援的檔案格式 "${file.mimetype}"。僅支援: JPEG, JPG, PNG, WebP`
      
      // 檔案格式錯誤時清理暫存檔案
      if ((file as any).filepath) {
        cleanupTempFile((file as any).filepath, '(檔案格式錯誤)')
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.COURSE_IMAGE_FORMAT_INVALID,
        { 
          courseImage: [detailedMessage],
          currentFormat: [`當前格式: ${file.mimetype}`],
          fileName: [`檔案名稱: ${file.originalFilename || '未知檔案'}`]
        },
        detailedMessage
      )
    }

    // 檢查檔案大小
    if (file.size > COURSE_IMAGE_MAX_FILE_SIZE) {
      const maxSizeMB = (COURSE_IMAGE_MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      const detailedMessage = `檔案大小超過限制。當前大小: ${currentSizeMB}MB，最大允許: ${maxSizeMB}MB`
      
      // 檔案大小超過限制時清理暫存檔案
      if ((file as any).filepath) {
        cleanupTempFile((file as any).filepath, '(檔案大小超過限制)')
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.COURSE_IMAGE_TOO_LARGE,
        {
          courseImage: [detailedMessage],
          fileSize: [`當前大小: ${currentSizeMB}MB`],
          maxSize: [`最大允許: ${maxSizeMB}MB`]
        },
        detailedMessage
      )
    }

    // 檢查檔案是否存在
    if (!fs.existsSync((file as any).filepath)) {
      throw Errors.validationWithCode(
        ERROR_CODES.COURSE_IMAGE_CORRUPTED,
        {},
        "課程圖片檔案損壞"
      )
    }

    // 檔案驗證通過，繼續處理
    next()
  } catch (error) {
    // 發生任何驗證錯誤時清理暫存檔案
    const file = (req as any).courseImage
    if (file && (file as any).filepath) {
      cleanupTempFile((file as any).filepath, '(驗證失敗)')
    }
    
    next(error)
  }
}

/**
 * 清理課程圖片臨時檔案中間件
 * 
 * 在處理完成後清理臨時檔案（包括成功和錯誤情況）
 */
export const cleanupTempCourseImageFile = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const originalSend = res.send
  const originalJson = res.json

  // 清理檔案的函式
  const cleanupFile = () => {
    const file = (req as any).courseImage
    if (file && (file as any).filepath) {
      cleanupTempFile((file as any).filepath, '(請求完成)')
    }
  }

  // 覆蓋 res.send
  res.send = function(body) {
    cleanupFile()
    return originalSend.call(this, body)
  }

  // 覆蓋 res.json  
  res.json = function(body) {
    cleanupFile()
    return originalJson.call(this, body)
  }

  // 監聽 finish 事件（確保所有情況都會清理）
  res.on('finish', () => {
    cleanupFile()
  })

  // 監聽 close 事件（連線中斷時清理）
  res.on('close', () => {
    cleanupFile()
  })

  next()
}