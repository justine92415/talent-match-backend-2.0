import { Request, Response, NextFunction } from 'express'
import { FileUploadService } from '../services/fileUploadService'
import { isFirebaseConfigured } from '../config/firebase'
import { testFirebaseStorageConnection } from '../utils/firebaseStorageTest'
import formidable from 'formidable'
import path from 'path'
import * as fs from 'fs'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { SuccessMessages } from '@constants/Message'
import {
  FirebaseFileUploadResponse,
  FileDeleteResponse,
  MAX_FILE_SIZE,
  MAX_FILES
} from '../types/fileUpload.interface'

export class FileUploadController {
  private fileUploadService = new FileUploadService()

  uploadFiles = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const uploadDir = path.join(process.cwd(), 'tmp', 'uploads')
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      multiples: true,
      maxFileSize: MAX_FILE_SIZE,
      maxFiles: MAX_FILES,
      keepExtensions: true,
      uploadDir: uploadDir
    })

    const [fields, files] = await form.parse(req)
    
    const fileArray = Array.isArray(files.files) ? files.files : files.files ? [files.files] : []
    
    if (fileArray.length === 0) {
      res.status(400).json({
        success: false,
        message: '請選擇要上傳的檔案'
      })
      return
    }

    try {
      const category = Array.isArray(fields.category) ? fields.category[0] : fields.category || 'general'
      
      const filesToUpload = fileArray.map(file => ({
        filePath: file.filepath,
        originalName: file.originalFilename || 'unknown',
        mimeType: file.mimetype || 'application/octet-stream'
      }))

      const uploadedFiles = await this.fileUploadService.uploadMultipleFiles(filesToUpload, {
        destination: `uploads/${category}`,
        public: true
      })

      fileArray.forEach(file => {
        try {
          fs.unlinkSync(file.filepath)
        } catch (error) {
          console.warn('Failed to delete temp file:', file.filepath)
        }
      })

      const response: FirebaseFileUploadResponse = {
        success: true,
        files: uploadedFiles,
        message: '檔案上傳成功'
      }

      res.status(201).json(handleCreated(response, '檔案上傳成功'))
    } catch (error) {
      fileArray.forEach(file => {
        try {
          fs.unlinkSync(file.filepath)
        } catch (cleanupError) {
          console.warn('Failed to delete temp file during error cleanup:', file.filepath)
        }
      })
      throw error
    }
  })

  deleteFile = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { fileUrl } = req.body

    if (!fileUrl) {
      res.status(400).json({
        success: false,
        message: '請提供檔案 URL'
      })
      return
    }

    await this.fileUploadService.deleteFile(fileUrl)

    const response: FileDeleteResponse = {
      success: true,
      message: '檔案刪除成功'
    }

    res.status(200).json(handleSuccess(response, '檔案刪除成功'))
  })

  getFileMetadata = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { fileUrl } = req.params

    if (!fileUrl) {
      res.status(400).json({
        success: false,
        message: '請提供檔案 URL'
      })
      return
    }

    const decodedUrl = decodeURIComponent(fileUrl)
    const metadata = await this.fileUploadService.getFileMetadata(decodedUrl)

    res.status(200).json(handleSuccess(metadata, '取得檔案資訊成功'))
  })

  generateDownloadUrl = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { fileUrl } = req.body
    const { expiresInMinutes = 60 } = req.body

    if (!fileUrl) {
      res.status(400).json({
        success: false,
        message: '請提供檔案 URL'
      })
      return
    }

    const downloadUrl = await this.fileUploadService.generateSignedUrl(fileUrl, expiresInMinutes)

    res.status(200).json(handleSuccess({
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000)
    }, '下載連結生成成功'))
  })

  // 診斷端點，用於檢查 Firebase Storage 連接狀態
  testConnection = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const testResult = await testFirebaseStorageConnection()
    
    if (testResult.success) {
      res.status(200).json(handleSuccess({
        message: 'Firebase Storage 連接正常',
        bucketName: testResult.bucketName,
        bucketExists: testResult.bucketExists,
        recommendation: testResult.bucketExists 
          ? '✅ Bucket 存在，可以進行檔案操作'
          : '❌ Bucket 不存在，請在 Firebase Console 中創建 Storage 並確認 bucket 名稱'
      }, 'Firebase Storage 診斷完成'))
    } else {
      res.status(500).json({
        success: false,
        message: 'Firebase Storage 連接失敗',
        error: testResult.error,
        recommendation: '請檢查 Firebase 配置和 Storage 是否已啟用'
      })
    }
  })
}