import { Router } from 'express'
import { videoController } from '@controllers/VideoController'
import { authenticateToken, requireTeacher } from '@middleware/auth'
import { validateRequest } from '@middleware/schemas'
import { 
  uploadVideoSchema,
  updateVideoSchema,
  videoListQuerySchema
} from '@middleware/schemas/course'

/**
 * 影片管理相關路由
 *
 * 路由前綴: /api/videos
 *
 * @swagger
 * tags:
 *   name: Video Management
 *   description: 影片管理功能 API，提供教師上傳、管理影片的完整功能
 */

const router = Router()

/**
 * @swagger
 * /videos:
 *   post:
 *     tags: [Video Management]
 *     summary: 上傳影片
 *     description: |
 *       教師可以透過此端點上傳影片。支援兩種上傳方式：
 *       1. **檔案上傳**: 上傳本地影片檔案 (video_type: storage)
 *       2. **YouTube 連結**: 提供 YouTube 影片連結 (video_type: youtube)
 *
 *       **業務規則:**
 *       - 需要教師權限
 *       - 影片名稱必填且不能超過 100 字元
 *       - 分類欄位不能超過 50 字元
 *       - 介紹欄位不能超過 1000 字元
 *       - YouTube 連結必須是有效的 YouTube URL
 *       - 支援的檔案格式: mp4, avi, mov, wmv
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VideoUploadRequest'
 *           examples:
 *             youtube_upload:
 *               summary: YouTube 影片上傳
 *               value:
 *                 name: "JavaScript 基礎教學第一課"
 *                 category: "程式設計"
 *                 intro: "這堂課將教授 JavaScript 的基本語法和概念，適合初學者學習。"
 *                 video_type: "youtube"
 *                 youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *             file_upload:
 *               summary: 檔案上傳（需要 multipart/form-data）
 *               value:
 *                 name: "Python 進階應用"
 *                 category: "程式設計"
 *                 intro: "深入探討 Python 的進階特性和應用場景。"
 *                 video_type: "storage"
 *     responses:
 *       201:
 *         description: 影片上傳成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUploadResponse'
 *             example:
 *               status: "success"
 *               message: "影片上傳成功"
 *               data:
 *                 id: 1
 *                 uuid: "550e8400-e29b-41d4-a716-446655440001"
 *                 teacher_id: 1
 *                 name: "JavaScript 基礎教學第一課"
 *                 category: "程式設計"
 *                 intro: "這堂課將教授 JavaScript 的基本語法和概念，適合初學者學習。"
 *                 url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                 video_type: "youtube"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 驗證錯誤
 *                 value:
 *                   status: "error"
 *                   code: "VALIDATION_ERROR"
 *                   message: "驗證失敗"
 *                   errors:
 *                     name: ["影片名稱為必填欄位"]
 *                     video_type: ["影片類型必須是 storage 或 youtube"]
 *               invalid_youtube_url:
 *                 summary: YouTube 連結無效
 *                 value:
 *                   status: "error"
 *                   code: "YOUTUBE_URL_INVALID"
 *                   message: "YouTube 連結格式無效"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "TEACHER_PERMISSION_REQUIRED"
 *               message: "需要教師權限才能執行此操作"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticateToken, requireTeacher, validateRequest(uploadVideoSchema), videoController.uploadVideo)

/**
 * @swagger
 * /videos:
 *   get:
 *     tags: [Video Management]
 *     summary: 取得影片列表
 *     description: |
 *       取得當前教師的影片列表，支援分頁、搜尋和篩選功能。
 *
 *       **查詢功能:**
 *       - 依分類篩選影片
 *       - 依關鍵字搜尋影片名稱和介紹
 *       - 分頁查詢結果
 *       - 只顯示該教師上傳的影片
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 依分類篩選影片
 *         example: "程式設計"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜尋關鍵字（搜尋影片名稱和介紹）
 *         example: "JavaScript"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *     responses:
 *       200:
 *         description: 取得影片列表成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoListResponse'
 *             example:
 *               status: "success"
 *               message: "取得影片列表成功"
 *               data:
 *                 videos:
 *                   - id: 1
 *                     uuid: "550e8400-e29b-41d4-a716-446655440001"
 *                     teacher_id: 1
 *                     name: "JavaScript 基礎教學第一課"
 *                     category: "程式設計"
 *                     intro: "這堂課將教授 JavaScript 的基本語法和概念。"
 *                     url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                     video_type: "youtube"
 *                     created_at: "2024-01-15T10:30:00.000Z"
 *                     updated_at: "2024-01-15T10:30:00.000Z"
 *                   - id: 2
 *                     uuid: "550e8400-e29b-41d4-a716-446655440002"
 *                     teacher_id: 1
 *                     name: "Python 進階應用"
 *                     category: "程式設計"
 *                     intro: "深入探討 Python 的進階特性和應用場景。"
 *                     url: "/uploads/videos/teacher_1/python_advanced.mp4"
 *                     video_type: "storage"
 *                     created_at: "2024-01-15T11:30:00.000Z"
 *                     updated_at: "2024-01-15T11:30:00.000Z"
 *                 pagination:
 *                   page: 1
 *                   per_page: 10
 *                   total: 2
 *                   total_pages: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "TEACHER_PERMISSION_REQUIRED"
 *               message: "需要教師權限才能執行此操作"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', authenticateToken, requireTeacher, validateRequest(videoListQuerySchema), videoController.getVideoList)

/**
 * @swagger
 * /videos/{id}:
 *   get:
 *     tags: [Video Management]
 *     summary: 取得影片詳細資訊
 *     description: |
 *       取得指定影片的詳細資訊。只能取得該教師上傳的影片詳情。
 *
 *       **業務規則:**
 *       - 只能查看自己上傳的影片
 *       - 影片ID必須為有效的數字
 *       - 不會顯示已刪除的影片
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 影片ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 取得影片詳情成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoDetailResponse'
 *             example:
 *               status: "success"
 *               message: "取得影片詳情成功"
 *               data:
 *                 id: 1
 *                 uuid: "550e8400-e29b-41d4-a716-446655440001"
 *                 teacher_id: 1
 *                 name: "JavaScript 基礎教學第一課"
 *                 category: "程式設計"
 *                 intro: "這堂課將教授 JavaScript 的基本語法和概念，適合初學者學習。"
 *                 url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                 video_type: "youtube"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T10:30:00.000Z"
 *                 deleted_at: null
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "INVALID_VIDEO_ID"
 *               message: "無效的影片ID"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "VIDEO_PERMISSION_REQUIRED"
 *               message: "沒有權限存取此影片"
 *       404:
 *         description: 影片不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "VIDEO_NOT_FOUND"
 *               message: "找不到指定的影片"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', authenticateToken, requireTeacher, videoController.getVideoDetail)

/**
 * @swagger
 * /videos/{id}:
 *   put:
 *     tags: [Video Management]
 *     summary: 更新影片資訊
 *     description: |
 *       更新指定影片的資訊。支援部分欄位更新。
 *
 *       **可更新欄位:**
 *       - 影片名稱 (name)
 *       - 分類 (category)
 *       - 介紹 (intro)
 *
 *       **業務規則:**
 *       - 只能更新自己上傳的影片
 *       - 至少需要提供一個要更新的欄位
 *       - 不能修改影片類型 (video_type)
 *       - 不能修改檔案路徑或 YouTube 連結
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 影片ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VideoUpdateRequest'
 *           examples:
 *             partial_update:
 *               summary: 部分欄位更新
 *               value:
 *                 name: "JavaScript 基礎教學第一課 - 更新版"
 *                 intro: "這堂課將教授 JavaScript 的基本語法和概念，適合初學者學習。課程已更新最新內容。"
 *             category_update:
 *               summary: 更新分類
 *               value:
 *                 category: "前端開發"
 *     responses:
 *       200:
 *         description: 影片更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUpdateResponse'
 *             example:
 *               status: "success"
 *               message: "影片資訊更新成功"
 *               data:
 *                 id: 1
 *                 uuid: "550e8400-e29b-41d4-a716-446655440001"
 *                 teacher_id: 1
 *                 name: "JavaScript 基礎教學第一課 - 更新版"
 *                 category: "程式設計"
 *                 intro: "這堂課將教授 JavaScript 的基本語法和概念，適合初學者學習。課程已更新最新內容。"
 *                 url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
 *                 video_type: "youtube"
 *                 created_at: "2024-01-15T10:30:00.000Z"
 *                 updated_at: "2024-01-15T14:30:00.000Z"
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 驗證錯誤
 *                 value:
 *                   status: "error"
 *                   code: "VALIDATION_ERROR"
 *                   message: "驗證失敗"
 *                   errors:
 *                     name: ["影片名稱不能超過 100 字元"]
 *               no_fields_provided:
 *                 summary: 未提供更新欄位
 *                 value:
 *                   status: "error"
 *                   code: "VIDEO_UPDATE_FIELDS_REQUIRED"
 *                   message: "至少需要提供一個要更新的欄位"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "VIDEO_PERMISSION_REQUIRED"
 *               message: "沒有權限更新此影片"
 *       404:
 *         description: 影片不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "VIDEO_NOT_FOUND"
 *               message: "找不到指定的影片"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', authenticateToken, requireTeacher, validateRequest(updateVideoSchema), videoController.updateVideo)

/**
 * @swagger
 * /videos/{id}:
 *   delete:
 *     tags: [Video Management]
 *     summary: 刪除影片
 *     description: |
 *       刪除指定的影片（軟刪除）。影片不會被實際刪除，只是標記為已刪除狀態。
 *
 *       **業務規則:**
 *       - 只能刪除自己上傳的影片
 *       - 使用軟刪除機制，不會實際刪除資料
 *       - 已刪除的影片無法再次刪除
 *       - 刪除後的影片不會出現在列表中
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 影片ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 影片刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               status: "success"
 *               message: "影片刪除成功"
 *               data: null
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "INVALID_VIDEO_ID"
 *               message: "無效的影片ID"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "VIDEO_PERMISSION_REQUIRED"
 *               message: "沒有權限刪除此影片"
 *       404:
 *         description: 影片不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "VIDEO_NOT_FOUND"
 *               message: "找不到指定的影片"
 *       409:
 *         description: 影片狀態衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               code: "VIDEO_ALREADY_DELETED"
 *               message: "影片已被刪除"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', authenticateToken, requireTeacher, videoController.deleteVideo)

export default router