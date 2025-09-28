/**
 * 影片檔案上傳中間件配置
 * 
 * 專門處理影片檔案上傳的 formidable 配置和驗證邏輯
 * 參考 courseImageUpload.ts 的設計模式
 */

import formidable from 'formidable'
import { Request, Response, NextFunction } from 'express'
import path from 'path'
import * as fs from 'fs'
import { MESSAGES } from '@constants/Message'
import { Errors } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'

/**
 * 清理影片暫存檔案的輔助函式
 * @param filePath 檔案路徑
 * @param context 清理的上下文（用於記錄）
 */
const cleanupTempFile = (filePath: string, context: string = ''): void => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`已清理暫存影片檔案 ${context}:`, filePath)
    }
  } catch (error) {
    console.warn(`清理暫存影片檔案失敗 ${context}:`, filePath, error)
  }
}

/**
 * 影片檔案允許的 MIME 類型
 */
export const VIDEO_ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/avi', 
  'video/mov',
  'video/wmv',
  'video/quicktime',
  'video/x-msvideo'
] as const

/**
 * 影片檔案最大檔案大小 (500MB)
 */
export const VIDEO_MAX_FILE_SIZE = 500 * 1024 * 1024

/**
 * 影片檔案上傳配置
 */
export const VIDEO_FORMIDABLE_CONFIG = {
  multiples: false,
  maxFileSize: VIDEO_MAX_FILE_SIZE,
  maxFiles: 1,
  keepExtensions: true,
  uploadDir: path.join(process.cwd(), 'tmp', 'videos'),
}

/**
 * 影片檔案解析中間件
 * 
 * 使用 formidable 處理影片檔案和表單資料上傳
 */
export const parseVideoFile = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  let tempFilePath: string | null = null
  
  try {
    // 確保上傳目錄存在
    if (!fs.existsSync(VIDEO_FORMIDABLE_CONFIG.uploadDir)) {
      fs.mkdirSync(VIDEO_FORMIDABLE_CONFIG.uploadDir, { recursive: true })
    }

    const form = formidable(VIDEO_FORMIDABLE_CONFIG)
    
    const [fields, files] = await form.parse(req)
    
    // 檢查是否有影片檔案（必填）
    const videoFile = files.videoFile
    
    if (!videoFile) {
      throw Errors.validationWithCode(
        ERROR_CODES.VIDEO_FILE_REQUIRED,
        { videoFile: [MESSAGES.VALIDATION.VIDEO_FILE_REQUIRED] },
        "影片檔案為必填欄位"
      )
    }
    
    // 記錄暫存檔案路徑以便錯誤時清理
    const file = Array.isArray(videoFile) ? videoFile[0] : videoFile
    tempFilePath = (file as any).filepath
    
    // 解析影片資料
    let videoData = {}
    
    try {
      // 從表單欄位中提取影片資訊
      if (fields.name) {
        videoData = {
          name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
          category: fields.category ? (Array.isArray(fields.category) ? fields.category[0] : fields.category) : '',
          intro: fields.intro ? (Array.isArray(fields.intro) ? fields.intro[0] : fields.intro) : ''
        }
      }
    } catch (parseError) {
      // 資料解析錯誤時清理暫存檔案
      if (tempFilePath) {
        cleanupTempFile(tempFilePath, '(資料解析錯誤)')
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.INVALID_JSON_FORMAT,
        { 
          videoData: ["影片資料格式錯誤"]
        },
        "表單資料格式錯誤"
      )
    }

    // 將解析結果附加到 request 物件
    ;(req as any).videoFile = file
    ;(req as any).body = videoData

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
 * 影片檔案驗證中間件
 * 
 * 在 formidable 處理後進行額外的檔案內容驗證
 */
export const validateVideoFileMiddleware = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const file = (req as any).videoFile

    // 檢查檔案是否存在（已在 parseVideoFile 中檢查，這裡再次確認）
    if (!file) {
      throw Errors.validationWithCode(
        ERROR_CODES.VIDEO_FILE_REQUIRED,
        { videoFile: [MESSAGES.VALIDATION.VIDEO_FILE_REQUIRED] },
        "影片檔案為必填欄位"
      )
    }

    // 檢查檔案格式
    if (!VIDEO_ALLOWED_MIME_TYPES.includes(file.mimetype as any)) {
      const detailedMessage = `不支援的檔案格式 "${file.mimetype}"。僅支援: MP4, AVI, MOV, WMV, QuickTime`
      
      // 檔案格式錯誤時清理暫存檔案
      if ((file as any).filepath) {
        cleanupTempFile((file as any).filepath, '(檔案格式錯誤)')
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.VIDEO_FILE_FORMAT_INVALID,
        { 
          videoFile: [detailedMessage],
          currentFormat: [`當前格式: ${file.mimetype}`],
          fileName: [`檔案名稱: ${file.originalFilename || '未知檔案'}`]
        },
        detailedMessage
      )
    }

    // 檢查檔案大小
    if (file.size > VIDEO_MAX_FILE_SIZE) {
      const maxSizeMB = (VIDEO_MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)
      const currentSizeMB = (file.size / (1024 * 1024)).toFixed(1)
      const detailedMessage = `檔案大小超過限制。當前大小: ${currentSizeMB}MB，最大允許: ${maxSizeMB}MB`
      
      // 檔案大小超過限制時清理暫存檔案
      if ((file as any).filepath) {
        cleanupTempFile((file as any).filepath, '(檔案大小超過限制)')
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.VIDEO_FILE_TOO_LARGE,
        {
          videoFile: [detailedMessage],
          fileSize: [`當前大小: ${currentSizeMB}MB`],
          maxSize: [`最大允許: ${maxSizeMB}MB`]
        },
        detailedMessage
      )
    }

    // 檢查檔案是否存在
    if (!fs.existsSync((file as any).filepath)) {
      throw Errors.validationWithCode(
        ERROR_CODES.VIDEO_FILE_CORRUPTED,
        { videoFile: ["影片檔案損壞"] },
        "影片檔案損壞"
      )
    }

    // 檔案驗證通過，繼續處理
    next()
  } catch (error) {
    // 發生任何驗證錯誤時清理暫存檔案
    const file = (req as any).videoFile
    if (file && (file as any).filepath) {
      cleanupTempFile((file as any).filepath, '(驗證失敗)')
    }
    
    next(error)
  }
}

/**
 * 清理影片臨時檔案中間件
 * 
 * 在處理完成後清理臨時檔案（包括成功和錯誤情況）
 */
export const cleanupTempVideoFile = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const originalSend = res.send
  const originalJson = res.json

  // 清理檔案的函式
  const cleanupFile = () => {
    const file = (req as any).videoFile
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