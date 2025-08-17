import { VideoType } from '@entities/enums'

// ========================================
// 基礎影片介面
// ========================================

/** 影片實體基礎介面 */
export interface VideoBase {
  id: number
  uuid: string
  teacher_id: number
  name: string
  category: string | null
  intro: string | null
  url: string | null
  video_type: VideoType
  created_at: Date
  updated_at: Date
  deleted_at: Date | null
}

// ========================================
// 影片上傳相關介面
// ========================================

/** 影片上傳請求介面 */
export interface VideoUploadRequest {
  name: string
  category: string
  intro: string
  video_type: VideoType
  youtube_url?: string
}

/** 影片檔案上傳介面 */
export interface VideoFileUpload {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

/** 縮圖檔案上傳介面 */
export interface ThumbnailFileUpload {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  buffer: Buffer
  size: number
}

// ========================================
// 影片更新相關介面
// ========================================

/** 影片更新請求介面 */
export interface VideoUpdateRequest {
  name?: string
  category?: string
  intro?: string
}

// ========================================
// 影片查詢相關介面
// ========================================

/** 影片列表查詢請求介面 */
export interface VideoListRequest {
  category?: string
  search?: string
  page?: number
  per_page?: number
}

/** 影片列表查詢選項介面 */
export interface VideoListOptions {
  category?: string
  page: number
  per_page: number
  teacher_id: number
}

// ========================================
// 影片回應相關介面
// ========================================

/** 影片詳情回應介面 */
export interface VideoDetailResponse {
  video: VideoDetailItemResponse
  usage_stats: VideoUsageStats
}

/** 影片詳情項目回應介面 */
export interface VideoDetailItemResponse {
  id: number
  uuid: string
  teacher_id: number
  name: string
  category: string | null
  intro: string | null
  url: string | null
  video_type: VideoType
  created_at: string
  updated_at: string
}

/** 影片列表項目回應介面 */
export interface VideoListItemResponse {
  id: number
  uuid: string
  teacher_id: number
  name: string
  category: string | null
  intro: string | null
  url: string | null
  video_type: VideoType
  created_at: string
}

/** 影片使用統計介面 */
export interface VideoUsageStats {
  used_in_courses: number
  total_views: number
}

/** 影片完整詳情回應介面 */
export interface VideoFullResponse {
  video: VideoDetailResponse
  usage_stats: VideoUsageStats
}

// ========================================
// 影片驗證相關介面
// ========================================

/** 影片檔案驗證結果介面 */
export interface VideoFileValidationResult {
  isValid: boolean
  errors: string[]
}

/** YouTube URL 驗證結果介面 */
export interface YouTubeUrlValidationResult {
  isValid: boolean
  errors: string[]
  videoId?: string
}

// ========================================
// 影片業務邏輯介面
// ========================================

/** 影片使用檢查結果介面 */
export interface VideoUsageCheckResult {
  isInUse: boolean
  usedInCourses: string[]
}

/** 影片刪除前檢查結果介面 */
export interface VideoDeleteCheckResult {
  canDelete: boolean
  reasons: string[]
  usedInCourses?: string[]
}

// ========================================
// 分頁相關介面
// ========================================

/** 影片列表分頁回應介面 */
export interface VideoListPaginatedResponse {
  videos: VideoListItemResponse[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}