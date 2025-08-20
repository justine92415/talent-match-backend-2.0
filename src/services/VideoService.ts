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
import type { 
  VideoUploadRequest, 
  VideoUpdateRequest, 
  VideoListRequest,
  VideoDetailResponse,
  VideoUsageStats
} from '@models/video.interface'

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

  constructor() {
    this.videoRepository = dataSource.getRepository(Video)
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
   * 建立新影片
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
      // 根據影片類型設定 URL
      let videoUrl = ''
      if (videoData.video_type === VideoType.YOUTUBE) {
        videoUrl = videoData.youtube_url || ''
      } else if (videoData.video_type === VideoType.STORAGE) {
        if (!fileUrl) {
          throw new BusinessError(
            ERROR_CODES.VIDEO_FILE_REQUIRED,
            MESSAGES.VALIDATION.VIDEO_FILE_REQUIRED,
            400
          )
        }
        videoUrl = fileUrl
      }

      // 建立影片實體
      const video = this.videoRepository.create({
        uuid: uuidv4(),
        teacher_id: teacherId,
        name: videoData.name,
        category: videoData.category,
        intro: videoData.intro,
        video_type: videoData.video_type,
        url: videoUrl
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
   * 更新影片資訊
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
   * 驗證 YouTube URL 有效性
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