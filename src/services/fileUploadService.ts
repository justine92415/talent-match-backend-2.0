import { getFirebaseStorage, isFirebaseConfigured } from '../config/firebase'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import * as fs from 'fs'
import {
  UploadedFile,
  FirebaseUploadOptions,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
} from '../types/fileUpload.interface'

export class FileUploadService {
  private storage: any = null
  private bucket: any = null

  private initializeFirebase() {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase is not properly configured. Please set FIREBASE_SERVICE_ACCOUNT_PATH and FIREBASE_STORAGE_BUCKET environment variables.')
    }
    
    if (!this.storage) {
      this.storage = getFirebaseStorage()
      this.bucket = this.storage.bucket()
    }
  }

  async uploadFile(
    filePath: string,
    originalName: string,
    mimeType: string,
    options: FirebaseUploadOptions = {}
  ): Promise<UploadedFile> {
    try {
      this.initializeFirebase()
      this.validateFile(originalName, mimeType, filePath)

      const fileExtension = path.extname(originalName)
      const fileName = `${uuidv4()}${fileExtension}`
      const destination = options.destination 
        ? `${options.destination}/${fileName}` 
        : fileName

      const file = this.bucket.file(destination)
      
      const metadata = {
        contentType: mimeType,
        ...options.metadata,
        customMetadata: {
          originalName,
          uploadedAt: new Date().toISOString(),
          ...options.metadata?.customMetadata
        }
      }

      await file.save(fs.readFileSync(filePath), {
        metadata,
        public: options.public ?? false
      })

      let downloadURL: string
      if (options.public) {
        await file.makePublic()
        // 支援新的 firebasestorage.app 和舊的 appspot.com 格式
        const bucketName = this.bucket.name
        if (bucketName.includes('.firebasestorage.app')) {
          downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media`
        } else {
          downloadURL = `https://storage.googleapis.com/${bucketName}/${destination}`
        }
      } else {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        downloadURL = url
      }

      const stats = fs.statSync(filePath)

      return {
        originalName,
        fileName,
        mimeType,
        size: stats.size,
        downloadURL,
        firebaseUrl: `gs://${this.bucket.name}/${destination}`,
        uploadedAt: new Date()
      }
    } catch (error) {
      console.error('File upload failed:', error)
      throw new Error(`檔案上傳失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  async uploadMultipleFiles(
    files: Array<{ filePath: string; originalName: string; mimeType: string }>,
    options: FirebaseUploadOptions = {}
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file =>
      this.uploadFile(file.filePath, file.originalName, file.mimeType, options)
    )

    return Promise.all(uploadPromises)
  }

  async deleteFile(firebaseUrl: string): Promise<void> {
    try {
      this.initializeFirebase()
      const pathMatch = firebaseUrl.match(/gs:\/\/([^\/]+)\/(.+)/)
      if (!pathMatch) {
        throw new Error('Invalid Firebase URL format')
      }

      const [, , filePath] = pathMatch
      const file = this.bucket.file(filePath)
      
      const [exists] = await file.exists()
      if (exists) {
        await file.delete()
      }
    } catch (error) {
      console.error('File deletion failed:', error)
      throw new Error(`檔案刪除失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  async getFileMetadata(firebaseUrl: string) {
    try {
      this.initializeFirebase()
      const pathMatch = firebaseUrl.match(/gs:\/\/([^\/]+)\/(.+)/)
      if (!pathMatch) {
        throw new Error('Invalid Firebase URL format')
      }

      const [, , filePath] = pathMatch
      const file = this.bucket.file(filePath)
      
      const [metadata] = await file.getMetadata()
      return metadata
    } catch (error) {
      console.error('Failed to get file metadata:', error)
      throw new Error(`取得檔案資訊失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  private validateFile(originalName: string, mimeType: string, filePath: string): void {
    if (!ALLOWED_MIME_TYPES.includes(mimeType as any)) {
      throw new Error(`不支援的檔案類型: ${mimeType}`)
    }

    const stats = fs.statSync(filePath)
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`檔案大小超過限制 (${MAX_FILE_SIZE / 1024 / 1024}MB)`)
    }

    if (!fs.existsSync(filePath)) {
      throw new Error('檔案不存在')
    }
  }

  generateSignedUrl(firebaseUrl: string, expiresInMinutes: number = 60): Promise<string> {
    try {
      this.initializeFirebase()
      const pathMatch = firebaseUrl.match(/gs:\/\/([^\/]+)\/(.+)/)
      if (!pathMatch) {
        throw new Error('Invalid Firebase URL format')
      }

      const [, , filePath] = pathMatch
      const file = this.bucket.file(filePath)
      
      return file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000
      }).then((urls: string[]) => urls[0])
    } catch (error) {
      console.error('Failed to generate signed URL:', error)
      throw new Error(`生成下載連結失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }
}