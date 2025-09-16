/**
 * 影片管理路由
 * 
 * 提供課程影片管理的 API 端點，包括：
 * - POST /api/videos - 上傳影片
 * - GET /api/videos - 取得影片列表
 * - GET /api/videos/:id - 取得影片詳情
 * - PUT /api/videos/:id - 更新影片資訊
 * - DELETE /api/videos/:id - 刪除影片
 * 
 * 所有端點都需要教師身份認證
 */

import { Router } from 'express'
import { videoController } from '@controllers/VideoController'
import { authMiddlewareChains } from '@middleware/auth'
import { validateRequest } from '@middleware/schemas'
import { 
  uploadVideoSchema,
  updateVideoSchema,
  videoListQuerySchema
} from '@middleware/schemas/course'

const router = Router()

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: 上傳課程影片
 *     description: |
 *       上傳新的課程影片，支援兩種上傳方式：
 *       1. **YouTube 影片**：提供 YouTube URL 連結
 *       2. **本地儲存影片**：上傳影片檔案到伺服器
 *       
 *       **支援的影片格式：**
 *       - MP4, AVI, MOV, WMV, QuickTime
 *       - 檔案大小限制：最大 500MB
 *       
 *       **縮圖檔案（選填）：**
 *       - 格式：JPEG, JPG, PNG, WebP
 *       - 大小限制：最大 5MB
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能為自己的課程上傳影片
 *     tags: [影片管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - intro
 *               - video_type
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 200
 *                 description: 影片名稱
 *                 example: "Python 基礎語法介紹"
 *               category:
 *                 type: string
 *                 maxLength: 100
 *                 description: 影片分類
 *                 example: "基礎教學"
 *               intro:
 *                 type: string
 *                 maxLength: 2000
 *                 description: 影片介紹
 *                 example: "這個影片將介紹 Python 的基本語法和變數使用方式"
 *               video_type:
 *                 type: string
 *                 enum: [youtube, storage]
 *                 description: 影片類型
 *                 example: "youtube"
 *               youtube_url:
 *                 type: string
 *                 description: YouTube 影片 URL（當 video_type 為 youtube 時必填）
 *                 example: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *               video_file:
 *                 type: string
 *                 format: binary
 *                 description: 影片檔案（當 video_type 為 storage 時必填）
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *                 description: 影片縮圖（選填）
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VideoUploadRequest'
 *           examples:
 *             youtube_video:
 *               summary: YouTube 影片
 *               value:
 *                 name: "Python 基礎語法介紹"
 *                 category: "基礎教學"
 *                 intro: "這個影片將介紹 Python 的基本語法和變數使用方式"
 *                 video_type: "youtube"
 *                 youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *             storage_video:
 *               summary: 本地儲存影片
 *               value:
 *                 name: "進階 Python 概念"
 *                 category: "進階教學"
 *                 intro: "深入探討 Python 的物件導向程式設計"
 *                 video_type: "storage"
 *     responses:
 *       201:
 *         description: 影片上傳成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoInfo'
 *             examples:
 *               success:
 *                 summary: 上傳成功回應
 *                 value:
 *                   status: "success"
 *                   message: "影片上傳成功"
 *                   data:
 *                     id: 1
 *                     name: "Python 基礎語法介紹"
 *                     category: "基礎教學"
 *                     intro: "這個影片將介紹 Python 的基本語法和變數使用方式"
 *                     video_type: "youtube"
 *                     youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                     file_url: null
 *                     thumbnail_url: null
 *                     duration: null
 *                     file_size: null
 *                     created_at: "2024-01-15T10:00:00Z"
 *                     updated_at: "2024-01-15T10:00:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只有教師可以上傳影片
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: 檔案過大
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               file_too_large:
 *                 summary: 影片檔案過大
 *                 value:
 *                   status: "error"
 *                   message: "影片檔案過大，最大限制為 500MB"
 *                   error_code: "FILE_TOO_LARGE"
 *       415:
 *         description: 不支援的檔案格式
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', ...authMiddlewareChains.teacherAuth, validateRequest(uploadVideoSchema), videoController.uploadVideo)

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: 取得影片列表
 *     description: |
 *       取得教師的影片列表，支援分頁、搜索和分類篩選。
 *       只能查看自己上傳的影片。
 *       
 *       **功能特色：**
 *       - 支援分頁瀏覽
 *       - 支援影片名稱搜索
 *       - 支援分類篩選
 *       - 按上傳時間排序（最新優先）
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的影片
 *     tags: [影片管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *         example: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每頁顯示數量
 *         example: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: 依分類篩選（空字串或不提供表示不篩選）
 *         example: "基礎教學"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: 搜索關鍵字，在影片名稱中搜索
 *         example: "Python"
 *     responses:
 *       200:
 *         description: 成功取得影片列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         videos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/VideoBasicInfo'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *             examples:
 *               success:
 *                 summary: 成功回應範例
 *                 value:
 *                   status: "success"
 *                   message: "成功取得影片列表"
 *                   data:
 *                     videos:
 *                       - id: 1
 *                         name: "Python 基礎語法介紹"
 *                         category: "基礎教學"
 *                         video_type: "youtube"
 *                         thumbnail_url: null
 *                         duration: 1800
 *                         created_at: "2024-01-15T10:00:00Z"
 *                       - id: 2
 *                         name: "進階 Python 概念"
 *                         category: "進階教學"
 *                         video_type: "storage"
 *                         thumbnail_url: "/uploads/thumbnails/thumb2.jpg"
 *                         duration: 2400
 *                         created_at: "2024-01-16T14:30:00Z"
 *                     pagination:
 *                       current_page: 1
 *                       per_page: 20
 *                       total: 2
 *                       total_pages: 1
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只有教師可以查看影片列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', ...authMiddlewareChains.teacherAuth, validateRequest(videoListQuerySchema), videoController.getVideoList)

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: 取得影片詳情
 *     description: |
 *       取得指定影片的詳細資訊，包含完整的影片資料和統計資訊。
 *       只能查看自己上傳的影片。
 *       
 *       **返回資訊：**
 *       - 影片基本資訊（名稱、分類、介紹）
 *       - 影片檔案資訊（URL、大小、時長）
 *       - 縮圖資訊
 *       - 上傳和更新時間
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的影片
 *     tags: [影片管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 影片 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得影片詳情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoDetailInfo'
 *             examples:
 *               youtube_video:
 *                 summary: YouTube 影片詳情
 *                 value:
 *                   status: "success"
 *                   message: "成功取得影片詳情"
 *                   data:
 *                     id: 1
 *                     name: "Python 基礎語法介紹"
 *                     category: "基礎教學"
 *                     intro: "這個影片將介紹 Python 的基本語法和變數使用方式"
 *                     video_type: "youtube"
 *                     youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                     file_url: null
 *                     thumbnail_url: null
 *                     duration: 1800
 *                     file_size: null
 *                     view_count: 25
 *                     created_at: "2024-01-15T10:00:00Z"
 *                     updated_at: "2024-01-15T10:00:00Z"
 *               storage_video:
 *                 summary: 本地儲存影片詳情
 *                 value:
 *                   status: "success"
 *                   message: "成功取得影片詳情"
 *                   data:
 *                     id: 2
 *                     name: "進階 Python 概念"
 *                     category: "進階教學"
 *                     intro: "深入探討 Python 的物件導向程式設計"
 *                     video_type: "storage"
 *                     youtube_url: null
 *                     file_url: "/uploads/videos/video2.mp4"
 *                     thumbnail_url: "/uploads/thumbnails/thumb2.jpg"
 *                     duration: 2400
 *                     file_size: 150000000
 *                     view_count: 12
 *                     created_at: "2024-01-16T14:30:00Z"
 *                     updated_at: "2024-01-16T14:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能查看自己的影片
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 影片不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 影片不存在
 *                 value:
 *                   status: "error"
 *                   message: "影片不存在"
 *                   error_code: "VIDEO_NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', ...authMiddlewareChains.teacherAuth, videoController.getVideoDetail)

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: 更新影片資訊
 *     description: |
 *       更新指定影片的基本資訊，包含名稱、分類和介紹。
 *       只能更新自己上傳的影片。
 *       
 *       **可更新欄位：**
 *       - name：影片名稱
 *       - category：影片分類
 *       - intro：影片介紹
 *       
 *       **注意事項：**
 *       - 至少需要提供一個要更新的欄位
 *       - 不能更改影片類型或檔案
 *       - 縮圖更新需使用專門的上傳端點
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能更新自己的影片
 *     tags: [影片管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 影片 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VideoUpdateRequest'
 *           examples:
 *             update_name:
 *               summary: 只更新名稱
 *               value:
 *                 name: "Python 基礎語法介紹（更新版）"
 *             update_all:
 *               summary: 更新多個欄位
 *               value:
 *                 name: "Python 基礎語法完整介紹"
 *                 category: "基礎教學"
 *                 intro: "這個影片將完整介紹 Python 的基本語法、變數使用方式和基礎概念"
 *     responses:
 *       200:
 *         description: 影片資訊更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/VideoInfo'
 *             examples:
 *               success:
 *                 summary: 更新成功回應
 *                 value:
 *                   status: "success"
 *                   message: "影片資訊更新成功"
 *                   data:
 *                     id: 1
 *                     name: "Python 基礎語法完整介紹"
 *                     category: "基礎教學"
 *                     intro: "這個影片將完整介紹 Python 的基本語法、變數使用方式和基礎概念"
 *                     video_type: "youtube"
 *                     youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                     file_url: null
 *                     thumbnail_url: null
 *                     duration: 1800
 *                     file_size: null
 *                     created_at: "2024-01-15T10:00:00Z"
 *                     updated_at: "2024-01-20T15:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能更新自己的影片
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 影片不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', ...authMiddlewareChains.teacherAuth, validateRequest(updateVideoSchema), videoController.updateVideo)

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: 刪除影片
 *     description: |
 *       刪除指定的影片及相關檔案。
 *       只能刪除自己上傳的影片。
 *       
 *       **刪除內容：**
 *       - 影片資料庫記錄
 *       - 影片檔案（如果是本地儲存）
 *       - 縮圖檔案（如果有）
 *       - 相關的觀看記錄和統計資料
 *       
 *       **注意事項：**
 *       - 刪除是永久性的，無法恢復
 *       - YouTube 影片只會刪除資料庫記錄，不會影響 YouTube 上的影片
 *       - 如果影片正在被課程使用，可能會被拒絕刪除
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能刪除自己的影片
 *     tags: [影片管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 影片 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 影片刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 刪除成功回應
 *                 value:
 *                   status: "success"
 *                   message: "影片刪除成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能刪除自己的影片
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 影片不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 影片正在使用中，無法刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               in_use:
 *                 summary: 影片使用中
 *                 value:
 *                   status: "error"
 *                   message: "影片正在被課程使用，無法刪除"
 *                   error_code: "VIDEO_IN_USE"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', ...authMiddlewareChains.teacherAuth, videoController.deleteVideo)

export default router