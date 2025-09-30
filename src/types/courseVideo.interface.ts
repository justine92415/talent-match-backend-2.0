/**
 * 課程影片關聯型別定義
 * 
 * 包含課程與影片關聯管理相關的介面定義
 * 與 CourseVideo 實體對應
 * 
 * Phase 5: 課程影片關聯開發
 */

import { VideoListItemResponse } from './video.interface'

// ========================================
// 課程影片關聯基礎介面
// ========================================

/** 課程影片關聯基礎資訊 */
export interface CourseVideoBase {
  id: number
  course_id: number
  video_id: number
  display_order: number
  created_at: Date
  updated_at: Date
}

/** 課程影片關聯詳細資訊（包含影片資料） */
export interface CourseVideoDetail extends CourseVideoBase {
  video: VideoListItemResponse
}

// ========================================
// 課程影片關聯請求介面
// ========================================

/** 課程關聯影片請求參數 */
export interface LinkVideosRequest {
  video_ids: number[]
  order_info: VideoOrderInfo[]  // 影片順序與預覽資訊
  is_preview?: boolean[]  // 可選：對應影片是否為預覽，與 video_ids 順序對應
}

/** 影片順序資訊項目 */
export interface VideoOrderInfo {
  video_id: number
  display_order: number
  is_preview?: boolean
}

/** 調整影片順序請求參數 */
export interface UpdateVideoOrderRequest {
  video_orders: VideoOrderItem[]
}

/** 影片順序項目 */
export interface VideoOrderItem {
  video_id: number
  display_order: number
}

// ========================================
// 課程影片關聯回應介面
// ========================================

/** 課程關聯影片成功回應 */
export interface LinkVideosResponse {
  course_videos: CourseVideoDetail[]
}

/** 調整影片順序成功回應 */
export interface UpdateVideoOrderResponse {
  updated_orders: VideoOrderItem[]
}

/** 移除課程影片關聯成功回應 */
export interface RemoveCourseVideoResponse {
  course_id: number
  video_id: number
  removed: boolean
  removed_at: string
}

/** 課程影片列表回應 */
export interface CourseVideoListResponse {
  course_videos: CourseVideoDetail[]
  summary: {
    total_videos: number
  }
}

// ========================================
// 驗證相關介面
// ========================================

/** 影片ID陣列驗證介面 */
export interface VideoIdsValidation {
  video_ids: number[]
  is_preview?: boolean[]
}

/** 影片順序驗證介面 */
export interface VideoOrderValidation {
  video_orders: VideoOrderItem[]
}

// ========================================
// 業務邏輯介面
// ========================================

/** 課程影片關聯檢查結果 */
export interface CourseVideoLinkCheck {
  canLink: boolean
  existingVideos: number[]
  invalidVideos: number[]
  reasons: string[]
}

/** 影片順序調整檢查結果 */
export interface VideoOrderUpdateCheck {
  canUpdate: boolean
  missingVideos: number[]
  invalidOrders: VideoOrderItem[]
  duplicateOrders: number[]
  reasons: string[]
}

/** 課程影片移除檢查結果 */
export interface CourseVideoRemoveCheck {
  canRemove: boolean
  videoExists: boolean
  reasons: string[]
}

// ========================================
// 服務層介面
// ========================================

/** 課程影片服務選項 */
export interface CourseVideoServiceOptions {
  include_video_details?: boolean
  sort_by_order?: boolean
}

/** 批次關聯影片選項 */
export interface BatchLinkVideosOptions {
  validate_ownership?: boolean
  auto_assign_order?: boolean
  default_preview?: boolean
}

/** 課程影片關聯統計 */
export interface CourseVideoStats {
  total_videos: number
  video_types: {
    storage: number // 只保留儲存類型，因為已移除 YouTube 支援
  }
}