/**
 * 影片相關測試 fixtures
 * 提供影片測試案例中需要的各種測試資料
 */

import { v4 as uuidv4 } from 'uuid'
import { VideoType } from '@entities/enums'

// ========================================
// 影片上傳測試資料
// ========================================

/** 有效的 YouTube 影片上傳資料 */
export const validYouTubeVideoData = {
  name: 'Python 基礎教學',
  category: '程式設計',
  intro: 'Python 語言的基礎概念介紹，適合初學者學習',
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
}

/** 有效的本地儲存影片上傳資料 */
export const validStorageVideoData = {
  name: 'JavaScript 進階技巧',
  category: '前端開發',
  intro: 'JavaScript 進階程式設計技巧與最佳實踐',
  video_type: VideoType.STORAGE
}

/** 有效的影片上傳資料（通用） */
export const validVideoUploadData = {
  name: '資料結構與演算法',
  category: '電腦科學',
  intro: '深入淺出的資料結構與演算法教學',
  video_type: VideoType.STORAGE
}

// ========================================
// 影片更新測試資料
// ========================================

/** 有效的影片更新資料 */
export const validVideoUpdateData = {
  name: 'Python 進階開發技巧',
  category: '後端開發',
  intro: 'Python 進階程式設計技巧與最佳實踐分享，包含框架使用、效能優化等內容'
}

/** 部分更新的影片資料 */
export const partialVideoUpdateData = {
  intro: '更新後的影片介紹，內容更加詳細和豐富'
}

// ========================================
// 影片查詢測試資料
// ========================================

/** 有效的影片列表查詢參數 */
export const validVideoListQuery = {
  category: '程式設計',
  page: 1,
  per_page: 10
}

/** 空的影片列表查詢參數（全部影片） */
export const emptyVideoListQuery = {}

/** 分頁查詢參數 */
export const paginationVideoListQuery = {
  page: 2,
  per_page: 5
}

// ========================================
// 無效測試資料
// ========================================

/** 缺少必填欄位的影片上傳資料 */
export const missingNameVideoData = {
  category: '程式設計',
  intro: '影片介紹',
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://www.youtube.com/watch?v=test'
}

/** 缺少分類的影片上傳資料 */
export const missingCategoryVideoData = {
  name: '測試影片',
  intro: '影片介紹',
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://www.youtube.com/watch?v=test'
}

/** 缺少介紹的影片上傳資料 */
export const missingIntroVideoData = {
  name: '測試影片',
  category: '程式設計',
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://www.youtube.com/watch?v=test'
}

/** 缺少影片類型的上傳資料 */
export const missingVideoTypeData = {
  name: '測試影片',
  category: '程式設計',
  intro: '影片介紹',
  youtube_url: 'https://www.youtube.com/watch?v=test'
}

/** YouTube 類型但缺少網址的上傳資料 */
export const missingYouTubeUrlData = {
  name: '測試影片',
  category: '程式設計',
  intro: '影片介紹',
  video_type: VideoType.YOUTUBE
}

/** 無效的 YouTube 網址資料 */
export const invalidYouTubeUrlData = {
  name: '測試影片',
  category: '程式設計',
  intro: '影片介紹',
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://invalid-url.com/video'
}

/** 影片名稱過長的上傳資料 */
export const tooLongNameVideoData = {
  name: 'A'.repeat(201), // 超過200字元限制
  category: '程式設計',
  intro: '影片介紹',
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://www.youtube.com/watch?v=test'
}

/** 影片分類過長的上傳資料 */
export const tooLongCategoryVideoData = {
  name: '測試影片',
  category: 'A'.repeat(101), // 超過100字元限制
  intro: '影片介紹',
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://www.youtube.com/watch?v=test'
}

/** 影片介紹過長的上傳資料 */
export const tooLongIntroVideoData = {
  name: '測試影片',
  category: '程式設計',
  intro: 'A'.repeat(2001), // 超過2000字元限制
  video_type: VideoType.YOUTUBE,
  youtube_url: 'https://www.youtube.com/watch?v=test'
}

/** 無效的影片類型資料 */
export const invalidVideoTypeData = {
  name: '測試影片',
  category: '程式設計',
  intro: '影片介紹',
  video_type: 'invalid_type' as any
}

// ========================================
// 影片實體建立資料
// ========================================

/** 建立影片實體的預設資料 */
export const createVideoEntityData = (overrides: any = {}) => ({
  uuid: uuidv4(),
  teacher_id: 1,
  name: '預設測試影片',
  category: '程式設計',
  intro: '預設的影片介紹內容',
  url: 'https://www.youtube.com/watch?v=test123',
  video_type: VideoType.YOUTUBE,
  deleted_at: null,
  ...overrides
})

/** 建立本地儲存影片實體資料 */
export const createStorageVideoEntityData = (overrides: any = {}) => ({
  uuid: uuidv4(),
  teacher_id: 1,
  name: '本地儲存影片',
  category: '影片製作',
  intro: '儲存在本地的影片檔案',
  url: '/uploads/videos/test-video.mp4',
  video_type: VideoType.STORAGE,
  deleted_at: null,
  ...overrides
})

/** 建立已刪除影片實體資料 */
export const createDeletedVideoEntityData = (overrides: any = {}) => ({
  uuid: uuidv4(),
  teacher_id: 1,
  name: '已刪除影片',
  category: '測試分類',
  intro: '這是一個已被軟刪除的影片',
  url: 'https://www.youtube.com/watch?v=deleted',
  video_type: VideoType.YOUTUBE,
  deleted_at: new Date(),
  ...overrides
})

// ========================================
// 模擬檔案資料
// ========================================

/** 模擬有效的影片檔案 */
export const mockVideoFile = {
  fieldname: 'video_file',
  originalname: 'test-video.mp4',
  encoding: '7bit',
  mimetype: 'video/mp4',
  buffer: Buffer.from('fake video content'),
  size: 1024 * 1024 * 50 // 50MB
}

/** 模擬過大的影片檔案 */
export const mockLargeVideoFile = {
  fieldname: 'video_file',
  originalname: 'large-video.mp4',
  encoding: '7bit',
  mimetype: 'video/mp4',
  buffer: Buffer.from('fake large video content'),
  size: 1024 * 1024 * 600 // 600MB，超過500MB限制
}

/** 模擬無效格式的影片檔案 */
export const mockInvalidVideoFile = {
  fieldname: 'video_file',
  originalname: 'invalid-video.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  buffer: Buffer.from('not a video file'),
  size: 1024
}

/** 模擬有效的縮圖檔案 */
export const mockThumbnailFile = {
  fieldname: 'thumbnail',
  originalname: 'thumbnail.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake thumbnail content'),
  size: 1024 * 512 // 512KB
}

/** 模擬過大的縮圖檔案 */
export const mockLargeThumbnailFile = {
  fieldname: 'thumbnail',
  originalname: 'large-thumbnail.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  buffer: Buffer.from('fake large thumbnail content'),
  size: 1024 * 1024 * 6 // 6MB，超過5MB限制
}

// ========================================
// 測試用常數
// ========================================

/** 測試用的有效 YouTube 影片 ID */
export const validYouTubeVideoIds = [
  'dQw4w9WgXcQ',
  'ScNNfyq3d_w',
  'oHg5SJYRHA0'
]

/** 測試用的無效 YouTube 網址 */
export const invalidYouTubeUrls = [
  'https://vimeo.com/123456789',
  'https://www.dailymotion.com/video/test',
  'https://example.com/video.mp4',
  'not-a-url-at-all',
  ''
]

/** 測試用的有效 YouTube 網址 */
export const validYouTubeUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://m.youtube.com/watch?v=dQw4w9WgXcQ'
]

/** 支援的影片檔案格式 */
export const supportedVideoFormats = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv'
]

/** 不支援的影片檔案格式 */
export const unsupportedVideoFormats = [
  'text/plain',
  'image/jpeg',
  'audio/mp3',
  'application/pdf',
  'video/webm'
]