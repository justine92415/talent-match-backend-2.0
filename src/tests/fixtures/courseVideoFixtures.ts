/**
 * 課程影片關聯測試 fixtures
 * 提供課程影片關聯測試案例中需要的各種測試資料
 */

import { VideoOrderItem } from '@models/index'

// ========================================
// 課程影片關聯請求測試資料
// ========================================

/** 有效的影片關聯請求資料 */
export const validLinkVideosRequest = {
  video_ids: [1, 2, 3],
  is_preview: [true, false, false]
}

/** 單一影片關聯請求資料 */
export const singleVideoLinkRequest = {
  video_ids: [1],
  is_preview: [true]
}

/** 多個影片關聯請求（無預覽設定） */
export const multipleVideosLinkRequest = {
  video_ids: [1, 2, 3, 4, 5]
}

/** 大量影片關聯請求 */
export const bulkVideosLinkRequest = {
  video_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  is_preview: [true, false, false, false, false, false, false, false, false, false]
}

// ========================================
// 影片順序調整測試資料
// ========================================

/** 有效的影片順序更新請求 */
export const validVideoOrderUpdate: VideoOrderItem[] = [
  { video_id: 1, display_order: 1 },
  { video_id: 2, display_order: 2 },
  { video_id: 3, display_order: 3 }
]

/** 調整順序的影片排序請求 */
export const reorderedVideoOrderUpdate: VideoOrderItem[] = [
  { video_id: 3, display_order: 1 },
  { video_id: 1, display_order: 2 },
  { video_id: 2, display_order: 3 }
]

/** 單一影片順序調整 */
export const singleVideoOrderUpdate: VideoOrderItem[] = [
  { video_id: 1, display_order: 1 }
]

/** 有間隔的影片順序設定 */
export const gappedVideoOrderUpdate: VideoOrderItem[] = [
  { video_id: 1, display_order: 1 },
  { video_id: 2, display_order: 5 },
  { video_id: 3, display_order: 10 }
]

// ========================================
// 無效測試資料
// ========================================

/** 空的影片ID陣列 */
export const emptyVideoIdsRequest = {
  video_ids: []
}

/** 無效的影片ID格式 */
export const invalidVideoIdsRequest = {
  video_ids: ['invalid', 'not-number']
}

/** 不存在的影片ID */
export const nonExistentVideoIdsRequest = {
  video_ids: [999, 1000, 1001]
}

/** 負數影片ID */
export const negativeVideoIdsRequest = {
  video_ids: [-1, -2, -3]
}

/** 零值影片ID */
export const zeroVideoIdsRequest = {
  video_ids: [0, 1, 2]
}

/** 缺少 video_ids 的請求 */
export const missingVideoIdsRequest = {
  is_preview: [true, false]
}

/** is_preview 長度不匹配 */
export const mismatchedPreviewRequest = {
  video_ids: [1, 2, 3],
  is_preview: [true, false] // 少一個
}

/** 無效的 is_preview 格式 */
export const invalidPreviewRequest = {
  video_ids: [1, 2, 3],
  is_preview: ['true', 'false', 'invalid'] // 應該是 boolean
}

/** 空的影片順序陣列 */
export const emptyVideoOrderRequest = {
  video_orders: []
}

/** 無效的順序格式 */
export const invalidVideoOrderRequest = {
  video_orders: [
    { video_id: 'invalid', display_order: 1 },
    { video_id: 2, display_order: 'invalid' }
  ]
}

/** 負數順序值 */
export const negativeOrderRequest = {
  video_orders: [
    { video_id: 1, display_order: -1 },
    { video_id: 2, display_order: 0 }
  ]
}

/** 重複的影片ID */
export const duplicateVideoIdRequest = {
  video_orders: [
    { video_id: 1, display_order: 1 },
    { video_id: 1, display_order: 2 }
  ]
}

/** 重複的順序值 */
export const duplicateOrderRequest = {
  video_orders: [
    { video_id: 1, display_order: 1 },
    { video_id: 2, display_order: 1 }
  ]
}

/** 缺少必填欄位的順序請求 */
export const missingFieldsOrderRequest = {
  video_orders: [
    { video_id: 1 }, // 缺少 display_order
    { display_order: 2 } // 缺少 video_id
  ]
}

// ========================================
// 課程影片關聯實體測試資料
// ========================================

/** 建立課程影片關聯實體資料 */
export const createCourseVideoEntityData = (overrides: any = {}) => ({
  course_id: 1,
  video_id: 1,
  display_order: 1,
  is_preview: false,
  ...overrides
})

/** 建立多個課程影片關聯實體資料 */
export const createMultipleCourseVideoEntities = (courseId: number, videoIds: number[]) => {
  return videoIds.map((videoId, index) => ({
    course_id: courseId,
    video_id: videoId,
    display_order: index + 1,
    is_preview: index === 0 // 第一個設為預覽
  }))
}

/** 建立有間隙的課程影片關聯 */
export const createGappedCourseVideoEntities = (courseId: number) => [
  { course_id: courseId, video_id: 1, display_order: 1, is_preview: true },
  { course_id: courseId, video_id: 2, display_order: 5, is_preview: false },
  { course_id: courseId, video_id: 3, display_order: 10, is_preview: false }
]

// ========================================
// 測試用常數
// ========================================

/** 測試用的最大影片關聯數量 */
export const MAX_COURSE_VIDEOS = 50

/** 測試用的有效順序範圍 */
export const VALID_ORDER_RANGE = {
  MIN: 1,
  MAX: 999
}

/** 測試用錯誤場景 */
export const TEST_ERROR_SCENARIOS = {
  EMPTY_VIDEO_IDS: 'empty_video_ids',
  INVALID_VIDEO_IDS: 'invalid_video_ids',
  NON_EXISTENT_VIDEOS: 'non_existent_videos',
  UNAUTHORIZED_VIDEOS: 'unauthorized_videos',
  DUPLICATE_ORDERS: 'duplicate_orders',
  MISSING_VIDEOS: 'missing_videos'
} as const

// ========================================
// 回應驗證輔助資料
// ========================================

/** 期望的課程影片關聯回應結構 */
export const expectedCourseVideoResponse = {
  id: expect.any(Number),
  course_id: expect.any(Number),
  video_id: expect.any(Number),
  display_order: expect.any(Number),
  is_preview: expect.any(Boolean),
  created_at: expect.any(String),
  updated_at: expect.any(String),
  video: {
    id: expect.any(Number),
    uuid: expect.any(String),
    teacher_id: expect.any(Number),
    name: expect.any(String),
    category: expect.any(String),
    intro: expect.any(String),
    url: expect.any(String),
    video_type: expect.any(String),
    created_at: expect.any(String)
  }
}

/** 期望的影片順序更新回應結構 */
export const expectedVideoOrderResponse = {
  video_id: expect.any(Number),
  display_order: expect.any(Number)
}

/** 期望的課程影片列表統計結構 */
export const expectedCourseVideoStats = {
  total_videos: expect.any(Number),
  preview_videos: expect.any(Number),
  regular_videos: expect.any(Number)
}