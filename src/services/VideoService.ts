/**
 * 影片服務層 (VideoService)
 * 
 * 遵循專案開發準則：
 * - 使用 TypeORM Repository 模式
 * - 實作錯誤工廠函式與統一錯誤處理
 * - 支援軟刪除機制
 * - 提供完整的 CRUD 操作
 * - 實作權限檢查和使用情況統計
 * - 支援 YouTube 和本地儲存兩種影片類型
 */

import { Repository, IsNull } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '@db/data-source'
import { Video } from '@entities/Video'
import { VideoType } from '@entities/enums'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { FileUploadService } from './fileUploadService'
import type { 
  VideoUploadRequest, 
  VideoUpdateRequest, 
  VideoListRequest,
  VideoDetailResponse,
  VideoUsageStats
} from '../types/video.interface'

// 分頁結果介面
interface PaginationResult<T> {
  items: T[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/**
 * 影片服務類別
 */
export class VideoService {
  private videoRepository: Repository<Video>
  private fileUploadService: FileUploadService

  constructor() {
    this.videoRepository = dataSource.getRepository(Video)
    this.fileUploadService = new FileUploadService()
  }

  // ========================================
  // 錯誤工廠函式
  // ========================================

  /**
   * 建立影片不存在錯誤
   * @param videoId 影片 ID
   * @returns BusinessError
   */
  private createVideoNotFoundError(videoId: number): BusinessError {
    return new BusinessError(
      ERROR_CODES.VIDEO_NOT_FOUND,
      MESSAGES.BUSINESS.VIDEO_NOT_FOUND,
      404
    )
  }

  /**
   * 建立權限不足錯誤
   * @param videoId 影片 ID
   * @param teacherId 教師 ID
   * @returns BusinessError
   */
  private createPermissionError(videoId: number, teacherId: number): BusinessError {
    return new BusinessError(
      ERROR_CODES.VIDEO_PERMISSION_REQUIRED,
      MESSAGES.BUSINESS.VIDEO_PERMISSION_REQUIRED,
      403
    )
  }

  /**
   * 建立影片使用中錯誤
   * @param videoId 影片 ID
   * @returns BusinessError
   */
  private createVideoInUseError(videoId: number): BusinessError {
    return new BusinessError(
      ERROR_CODES.VIDEO_IN_USE,
      MESSAGES.BUSINESS.VIDEO_IN_USE
    )
  }

  /**
   * 建立影片上傳失敗錯誤
   * @param reason 失敗原因
   * @returns BusinessError
   */
  private createUploadFailedError(reason: string): BusinessError {
    return new BusinessError(
      ERROR_CODES.VIDEO_UPLOAD_FAILED,
      MESSAGES.BUSINESS.VIDEO_UPLOAD_FAILED
    )
  }

  // ========================================
  // 權限檢查函式
  // ========================================

  /**
   * 驗證影片是否屬於指定教師
   * @param video 影片實體
   * @param teacherId 教師 ID
   * @throws BusinessError 當權限不足時
   */
  private validateVideoOwnership(video: Video, teacherId: number): void {
    if (video.teacher_id !== teacherId) {
      throw this.createPermissionError(video.id, teacherId)
    }
  }

  /**
   * 檢查影片是否正在被課程使用
   * @param videoId 影片 ID
   * @returns Promise<boolean>
   */
  private async isVideoInUse(videoId: number): Promise<boolean> {
    // TODO: Phase 5 實作課程關聯檢查
    // 目前暫時回傳 false，待課程管理功能完成後實作
    // 需要檢查 CourseVideo 表中是否有關聯記錄
    return false
  }

  // ========================================
  // 影片 CRUD 操作
  // ========================================

  /**
   * 建立新影片（包含檔案上傳）
   * @param teacherId 教師 ID
   * @param videoData 包含檔案的影片資料
   * @returns Promise<Video>
   */
  async createVideoWithFile(
    teacherId: number, 
    videoData: VideoUploadRequest & { videoFile?: any }
  ): Promise<Video> {
    try {
      const { videoFile, ...basicVideoData } = videoData

      // 檢查是否有檔案
      if (!videoFile) {
        throw new BusinessError(
          ERROR_CODES.VIDEO_FILE_REQUIRED,
          MESSAGES.VALIDATION.VIDEO_FILE_REQUIRED,
          400
        )
      }

      // 上傳檔案到儲存服務
      const uploadedFile = await this.uploadVideoFileToStorage(videoFile, teacherId)
      
      // 建立影片實體
      const video = this.videoRepository.create({
        uuid: uuidv4(),
        teacher_id: teacherId,
        name: basicVideoData.name,
        category: basicVideoData.category,
        intro: basicVideoData.intro,
        video_type: VideoType.STORAGE, // 統一為本地儲存
        url: uploadedFile.url
      })

      // 儲存到資料庫
      const savedVideo = await this.videoRepository.save(video)
      return savedVideo

    } catch (error) {
      if (error instanceof BusinessError) {
        throw error
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw this.createUploadFailedError(`影片建立失敗: ${errorMessage}`)
    }
  }

  /**
   * 建立新影片（原有方法，保持向後相容性）
   * @param teacherId 教師 ID
   * @param videoData 影片資料
   * @param fileUrl 檔案 URL（本地儲存類型）
   * @returns Promise<Video>
   */
  async createVideo(
    teacherId: number, 
    videoData: VideoUploadRequest, 
    fileUrl?: string
  ): Promise<Video> {
    try {
      // 檢查是否為本地儲存類型且沒有檔案 URL
      if (!fileUrl) {
        throw new BusinessError(
          ERROR_CODES.VIDEO_FILE_REQUIRED,
          MESSAGES.VALIDATION.VIDEO_FILE_REQUIRED,
          400
        )
      }

      // 建立影片實體
      const video = this.videoRepository.create({
        uuid: uuidv4(),
        teacher_id: teacherId,
        name: videoData.name,
        category: videoData.category,
        intro: videoData.intro,
        video_type: VideoType.STORAGE, // 統一為本地儲存
        url: fileUrl
      })

      // 儲存到資料庫
      const savedVideo = await this.videoRepository.save(video)
      return savedVideo

    } catch (error) {
      if (error instanceof BusinessError) {
        throw error
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw this.createUploadFailedError(`影片建立失敗: ${errorMessage}`)
    }
  }

  /**
   * 更新影片資訊（包含檔案替換）
   * @param videoId 影片 ID
   * @param teacherId 教師 ID
   * @param updateData 包含檔案的更新資料
   * @returns Promise<Video>
   */
  async updateVideoWithFile(
    videoId: number, 
    teacherId: number, 
    updateData: VideoUpdateRequest & { videoFile?: any }
  ): Promise<Video> {
    const { videoFile, ...basicUpdateData } = updateData

    // 查詢影片
    const video = await this.videoRepository.findOne({
      where: { id: videoId, deleted_at: IsNull() }
    })

    if (!video) {
      throw this.createVideoNotFoundError(videoId)
    }

    // 驗證權限
    this.validateVideoOwnership(video, teacherId)

    let newVideoUrl: string | null = video.url // 預設使用現有影片 URL
    let oldVideoUrl: string | null = null // 用於後續清理

    try {
      // 1. 處理影片檔案更新（如果有提供新檔案）
      if (videoFile) {
        try {
          // 儲存舊影片 URL 以便後續清理
          oldVideoUrl = video.url

          // 上傳新影片到 Storage
          const uploadedFile = await this.uploadVideoToFirebase(
            videoFile.filepath,
            videoFile.originalFilename || `video_${Date.now()}`,
            videoFile.mimetype,
            teacherId
          )
          newVideoUrl = uploadedFile.downloadURL
          
          // 立即清理暫存檔案
          this.cleanupTempVideoFile(videoFile.filepath, '(檔案替換成功)')
          
        } catch (error) {
          // 清理暫存檔案
          if (videoFile.filepath) {
            this.cleanupTempVideoFile(videoFile.filepath, '(檔案替換失敗)')
          }
          
          console.error('影片檔案上傳失敗:', error)
          throw new BusinessError(
            ERROR_CODES.VIDEO_UPLOAD_FAILED,
            '影片檔案上傳失敗',
            500
          )
        }
      }

      // 2. 更新影片資料
      Object.assign(video, {
        name: basicUpdateData.name || video.name,
        category: basicUpdateData.category || video.category,
        intro: basicUpdateData.intro || video.intro,
        url: newVideoUrl,
        updated_at: new Date()
      })

      // 儲存更新
      const updatedVideo = await this.videoRepository.save(video)

      // 3. 成功後清理舊影片檔案（如果有替換）
      if (videoFile && oldVideoUrl && oldVideoUrl.trim() !== '' && oldVideoUrl !== newVideoUrl) {
        console.log(`準備清理舊影片檔案: ${oldVideoUrl}`)
        try {
          const firebaseUrl = this.extractFirebaseUrlFromDownloadUrl(oldVideoUrl)
          await this.deleteVideoFile(firebaseUrl)
          console.log('✅ 舊影片檔案已清理:', oldVideoUrl)
        } catch (error) {
          console.error('❌ 清理舊影片檔案失敗:', error)
          // 不拋出錯誤，避免影響主要流程
        }
      }

      return updatedVideo

    } catch (error) {
      // 如果新檔案已上傳但更新失敗，清理新上傳的檔案
      if (videoFile && newVideoUrl && newVideoUrl !== video.url) {
        console.log(`清理失敗更新的新檔案: ${newVideoUrl}`)
        try {
          const firebaseUrl = this.extractFirebaseUrlFromDownloadUrl(newVideoUrl)
          await this.deleteVideoFile(firebaseUrl)
          console.log('✅ 失敗的新檔案已清理:', newVideoUrl)
        } catch (cleanupError) {
          console.error('❌ 清理新檔案失敗:', cleanupError)
        }
      }

      if (error instanceof BusinessError) {
        throw error
      }
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new BusinessError(
        ERROR_CODES.VIDEO_UPLOAD_FAILED,
        `影片更新失敗: ${errorMessage}`,
        500
      )
    }
  }

  /**
   * 更新影片資訊（原有方法，保持向後相容性）
   * @param videoId 影片 ID
   * @param teacherId 教師 ID
   * @param updateData 更新資料
   * @returns Promise<Video>
   */
  async updateVideo(
    videoId: number, 
    teacherId: number, 
    updateData: VideoUpdateRequest
  ): Promise<Video> {
    // 查詢影片
    const video = await this.videoRepository.findOne({
      where: { id: videoId, deleted_at: IsNull() }
    })

    if (!video) {
      throw this.createVideoNotFoundError(videoId)
    }

    // 驗證權限
    this.validateVideoOwnership(video, teacherId)

    // 更新影片資料
    Object.assign(video, updateData)

    // 儲存更新
    const updatedVideo = await this.videoRepository.save(video)
    return updatedVideo
  }

  /**
   * 軟刪除影片
   * @param videoId 影片 ID
   * @param teacherId 教師 ID
   * @returns Promise<void>
   */
  async deleteVideo(videoId: number, teacherId: number): Promise<void> {
    // 查詢影片
    const video = await this.videoRepository.findOne({
      where: { id: videoId, deleted_at: IsNull() }
    })

    if (!video) {
      throw this.createVideoNotFoundError(videoId)
    }

    // 驗證權限
    this.validateVideoOwnership(video, teacherId)

    // 檢查是否正在被使用
    const inUse = await this.isVideoInUse(videoId)
    if (inUse) {
      throw this.createVideoInUseError(videoId)
    }

    // 軟刪除
    video.deleted_at = new Date()
    await this.videoRepository.save(video)
  }

  /**
   * 取得影片詳情
   * @param videoId 影片 ID
   * @param teacherId 教師 ID
   * @returns Promise<VideoDetailResponse>
   */
  async getVideoDetail(videoId: number, teacherId: number): Promise<VideoDetailResponse> {
    // 查詢影片
    const video = await this.videoRepository.findOne({
      where: { id: videoId, deleted_at: IsNull() }
    })

    if (!video) {
      throw this.createVideoNotFoundError(videoId)
    }

    // 驗證權限
    this.validateVideoOwnership(video, teacherId)

    // 取得使用情況統計
    const usageStats = await this.getVideoUsageStats(videoId)

    return {
      video: {
        id: video.id,
        uuid: video.uuid,
        teacher_id: video.teacher_id,
        name: video.name,
        category: video.category,
        intro: video.intro,
        url: video.url,
        video_type: video.video_type,
        created_at: video.created_at.toISOString(),
        updated_at: video.updated_at.toISOString()
      },
      usage_stats: usageStats
    }
  }

  /**
   * 取得教師的影片列表
   * @param teacherId 教師 ID
   * @param query 查詢條件
   * @returns Promise<PaginationResult<Video>>
   */
  async getVideoList(
    teacherId: number, 
    query: VideoListRequest
  ): Promise<PaginationResult<Video>> {
    const { page = 1, per_page = 20, category, search } = query

    // 建立查詢條件
    const queryBuilder = this.videoRepository
      .createQueryBuilder('video')
      .where('video.teacher_id = :teacherId', { teacherId })
      .andWhere('video.deleted_at IS NULL')
      .orderBy('video.created_at', 'DESC')

    // 分類篩選
    if (category && category.trim()) {
      queryBuilder.andWhere('video.category LIKE :category', { 
        category: `%${category.trim()}%` 
      })
    }

    // 搜尋篩選
    if (search && search.trim()) {
      queryBuilder.andWhere(
        '(video.name LIKE :search OR video.intro LIKE :search)',
        { search: `%${search.trim()}%` }
      )
    }

    // 執行分頁查詢
    const skip = (page - 1) * per_page
    const [videos, total] = await queryBuilder
      .skip(skip)
      .take(per_page)
      .getManyAndCount()

    // 計算分頁資訊
    const total_pages = Math.ceil(total / per_page)

    return {
      items: videos,
      pagination: {
        current_page: page,
        per_page,
        total,
        total_pages
      }
    }
  }

  // ========================================
  // 統計與輔助功能
  // ========================================

  /**
   * 取得影片使用情況統計
   * @param videoId 影片 ID
   * @returns Promise<VideoUsageStats>
   */
  async getVideoUsageStats(videoId: number): Promise<VideoUsageStats> {
    // TODO: Phase 5 實作詳細統計
    // 目前回傳預設值，待課程管理功能完成後實作
    return {
      used_in_courses: 0, // 被多少課程使用
      total_views: 0      // 總觀看次數
    }
  }

  /**
   * 檢查教師是否有權限存取影片
   * @param videoId 影片 ID
   * @param teacherId 教師 ID
   * @returns Promise<boolean>
   */
  async hasVideoAccess(videoId: number, teacherId: number): Promise<boolean> {
    const video = await this.videoRepository.findOne({
      where: { 
        id: videoId, 
        teacher_id: teacherId,
        deleted_at: IsNull()
      }
    })

    return !!video
  }

  /**
   * 根據 UUID 查詢影片
   * @param uuid 影片 UUID
   * @returns Promise<Video | null>
   */
  async findByUuid(uuid: string): Promise<Video | null> {
    return await this.videoRepository.findOne({
      where: { uuid, deleted_at: IsNull() }
    })
  }

  /**
   * 取得教師的影片總數
   * @param teacherId 教師 ID
   * @returns Promise<number>
   */
  async getVideoCount(teacherId: number): Promise<number> {
    return await this.videoRepository.count({
      where: { 
        teacher_id: teacherId,
        deleted_at: IsNull()
      }
    })
  }

  /**
   * 批次查詢影片
   * @param videoIds 影片 ID 陣列
   * @param teacherId 教師 ID（權限檢查）
   * @returns Promise<Video[]>
   */
  async findVideosByIds(videoIds: number[], teacherId?: number): Promise<Video[]> {
    const queryBuilder = this.videoRepository
      .createQueryBuilder('video')
      .where('video.id IN (:...videoIds)', { videoIds })
      .andWhere('video.deleted_at IS NULL')

    if (teacherId) {
      queryBuilder.andWhere('video.teacher_id = :teacherId', { teacherId })
    }

    return await queryBuilder.getMany()
  }

  // ========================================
  // 檔案處理相關
  // ========================================

  /**
   * 上傳影片檔案到儲存服務
   * 
   * @param file 檔案物件
   * @param teacherId 教師 ID
   * @returns 上傳檔案資訊
   */
  private async uploadVideoFileToStorage(file: any, teacherId: number): Promise<any> {
    let tempFilePath: string | null = null
    
    try {
      tempFilePath = file.filepath
      
      // 直接使用 Firebase Storage API，繞過 FileUploadService 的檔案類型限制
      const uploadedFile = await this.uploadVideoToFirebase(
        file.filepath,
        file.originalFilename || `video_${Date.now()}`,
        file.mimetype,
        teacherId
      )

      // 上傳成功後立即清理暫存檔案
      if (tempFilePath) {
        this.cleanupTempVideoFile(tempFilePath, '(上傳成功)')
      }

      return {
        originalName: uploadedFile.originalName,
        fileName: uploadedFile.fileName,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
        url: uploadedFile.downloadURL,
        firebaseUrl: uploadedFile.firebaseUrl,
        uploadedAt: uploadedFile.uploadedAt
      }
    } catch (error) {
      // 上傳失敗時也要清理暫存檔案
      if (tempFilePath) {
        this.cleanupTempVideoFile(tempFilePath, '(上傳失敗)')
      }
      
      throw new BusinessError(
        ERROR_CODES.VIDEO_UPLOAD_FAILED,
        '影片檔案處理失敗',
        500
      )
    }
  }

  /**
   * 直接上傳影片到 Firebase Storage
   * 
   * @param filePath 本地檔案路徑
   * @param originalName 原始檔案名稱
   * @param mimeType MIME 類型
   * @param teacherId 教師 ID
   * @returns 上傳結果
   */
  private async uploadVideoToFirebase(
    filePath: string,
    originalName: string,
    mimeType: string,
    teacherId: number
  ): Promise<any> {
    const fs = require('fs')
    let fileBuffer: Buffer | null = null
    
    try {
      // 驗證影片檔案（自定義驗證邏輯）
      this.validateVideoFile(originalName, mimeType, filePath)

      // 預先讀取檔案到記憶體，避免在上傳過程中檔案被刪除
      fileBuffer = fs.readFileSync(filePath)

      // 使用既有的 FileUploadService 但繞過其檔案類型驗證
      // 直接存取其內部的 Firebase Storage 實例
      const fileUploadServiceInstance = this.fileUploadService as any
      
      // 初始化 Firebase（如果尚未初始化）
      if (typeof fileUploadServiceInstance.initializeFirebase === 'function') {
        fileUploadServiceInstance.initializeFirebase()
      }
      
      const bucket = fileUploadServiceInstance.bucket
      if (!bucket) {
        throw new Error('無法取得 Firebase Storage bucket')
      }

      // 生成檔案名稱和路徑
      const fileExtension = require('path').extname(originalName)
      const fileName = `${require('uuid').v4()}${fileExtension}`
      const destination = `videos/teacher_${teacherId}/${fileName}`

      const file = bucket.file(destination)
      
      const metadata = {
        contentType: mimeType,
        customMetadata: {
          originalName,
          teacherId: teacherId.toString(),
          uploadType: 'video',
          uploadedAt: new Date().toISOString()
        }
      }

      // 上傳檔案（使用預先讀取的 buffer）
      await file.save(fileBuffer, {
        metadata,
        public: true
      })

      // 設為公開並生成下載 URL
      await file.makePublic()
      const bucketName = bucket.name
      let downloadURL: string
      
      if (bucketName.includes('.firebasestorage.app')) {
        downloadURL = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(destination)}?alt=media`
      } else {
        downloadURL = `https://storage.googleapis.com/${bucketName}/${destination}`
      }

      const stats = fs.statSync(filePath)
      const firebaseUrl = `gs://${bucketName}/${destination}`

      return {
        originalName,
        fileName,
        mimeType,
        size: stats.size,
        downloadURL,
        firebaseUrl,
        uploadedAt: new Date()
      }
    } catch (error) {
      console.error('Firebase video upload failed:', error)
      if (error instanceof Error) {
        throw new Error(`影片上傳失敗: ${error.message}`)
      }
      throw new Error('影片上傳失敗: 未知錯誤')
    }
  }

  /**
   * 驗證影片檔案
   * 
   * @param originalName 原始檔案名稱
   * @param mimeType MIME 類型
   * @param filePath 檔案路徑
   */
  private validateVideoFile(originalName: string, mimeType: string, filePath: string): void {
    // 支援的影片類型
    const allowedVideoTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/quicktime',
      'video/x-msvideo'
    ]

    if (!allowedVideoTypes.includes(mimeType)) {
      throw new Error(`不支援的影片格式: ${mimeType}`)
    }

    const fs = require('fs')
    const stats = fs.statSync(filePath)
    const maxSize = 500 * 1024 * 1024 // 500MB
    
    if (stats.size > maxSize) {
      throw new Error(`檔案大小超過限制 (${maxSize / 1024 / 1024}MB)`)
    }

    if (!fs.existsSync(filePath)) {
      throw new Error('檔案不存在')
    }
  }

  /**
   * 清理暫存影片檔案
   * 
   * @param filePath 檔案路徑
   * @param context 清理的上下文（用於記錄）
   */
  private cleanupTempVideoFile(filePath: string, context: string = ''): void {
    try {
      const fs = require('fs')
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`已清理暫存影片檔案 ${context}:`, filePath)
      }
    } catch (error) {
      console.warn(`清理暫存影片檔案失敗 ${context}:`, filePath, error)
    }
  }

  /**
   * 從下載 URL 中解析 Firebase 檔案路徑
   * 
   * @param downloadUrl 下載 URL
   * @returns Firebase 檔案路徑
   */
  private extractFirebaseUrlFromDownloadUrl(downloadUrl: string): string {
    // 支援多種 Firebase Storage URL 格式
    
    // 格式 1: https://firebasestorage.googleapis.com/v0/b/bucket-name.firebasestorage.app/o/path?alt=media&token=xxx
    // 格式 1b: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path?alt=media&token=xxx
    let match = downloadUrl.match(/\/b\/([^\/]+)\/o\/([^?]+)/)
    if (match) {
      const [, bucketName, encodedPath] = match
      const filePath = decodeURIComponent(encodedPath)
      
      // 如果 bucketName 包含 .firebasestorage.app，需要保留完整名稱
      const result = `gs://${bucketName}/${filePath}`
      return result
    }

    // 格式 2: https://storage.googleapis.com/bucket/path/file.ext
    match = downloadUrl.match(/https:\/\/storage\.googleapis\.com\/([^\/]+)\/(.+)/)
    if (match) {
      const [, bucketName, filePath] = match
      const result = `gs://${bucketName}/${filePath}`
      return result
    }

    // 格式 3: https://bucket.storage.googleapis.com/path/file.ext
    match = downloadUrl.match(/https:\/\/([^\.]+)\.storage\.googleapis\.com\/(.+)/)
    if (match) {
      const [, bucketName, filePath] = match
      const result = `gs://${bucketName}/${filePath}`
      return result
    }

    console.error(`無法解析的影片 URL 格式: ${downloadUrl}`)
    throw new Error(`無法解析 Firebase URL 格式: ${downloadUrl}`)
  }

  /**
   * 刪除 Firebase Storage 中的影片檔案
   * 
   * @param firebaseUrl Firebase Storage URL (gs://bucket/path 格式)
   */
  private async deleteVideoFile(firebaseUrl: string): Promise<void> {
    try {
      await this.fileUploadService.deleteFile(firebaseUrl)
    } catch (error) {
      console.error('刪除影片檔案失敗:', error)
      throw error
    }
  }

  /**
   * 產生影片檔案儲存路徑
   * @param teacherId 教師 ID
   * @param originalName 原始檔案名稱
   * @returns string
   */
  generateVideoFilePath(teacherId: number, originalName: string): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const fileExtension = originalName.split('.').pop() || 'mp4'
    
    return `/uploads/videos/teacher_${teacherId}_${timestamp}_${randomId}.${fileExtension}`
  }

  /**
   * 驗證 YouTube URL 有效性（已棄用）
   * @param url YouTube URL
   * @returns boolean
   */
  validateYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|m\.youtube\.com\/watch\?v=)[\w-]{11}$/
    return youtubeRegex.test(url)
  }
}

// 匯出預設實例
export const videoService = new VideoService()
export default videoService