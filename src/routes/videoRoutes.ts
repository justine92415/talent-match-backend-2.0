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
import {
  parseVideoFile,
  parseOptionalVideoFile,
  validateVideoFileMiddleware,
  validateOptionalVideoFileMiddleware,
  cleanupTempVideoFile
} from '@middleware/upload/videoFileUpload'

const router = Router()

/**
 * @swagger
 * /api/videos:
 *   post:
 *     tags:
 *       - Video Management
 *     summary: 上傳影片檔案
 *     description: |
 *       教師上傳影片檔案到系統。統一採用本地儲存方式，不再支援 YouTube 連結。
 *       
 *       **業務邏輯**：
 *       - 驗證教師身份和權限
 *       - 解析 multipart/form-data 表單資料
 *       - 驗證影片檔案格式和大小（支援 MP4, AVI, MOV, WMV，最大 500MB）
 *       - 驗證影片基本資料（名稱、分類、介紹）
 *       - 上傳檔案到 Firebase Storage
 *       - 建立影片記錄到資料庫
 *       - 自動清理暫存檔案
 *       
 *       **檔案要求**：
 *       - 支援格式：MP4, AVI, MOV, WMV, QuickTime
 *       - 檔案大小：最大 500MB
 *       - 儲存位置：Firebase Storage (`videos/teacher_{teacherId}/`)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/VideoUploadRequest'
 *     responses:
 *       201:
 *         description: 影片上傳成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUploadSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或檔案格式錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/VideoUploadValidationErrorResponse'
 *                 - $ref: '#/components/schemas/VideoFileFormatErrorResponse'
 *                 - $ref: '#/components/schemas/VideoFileSizeErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     name: ["影片名稱為必填欄位"]
 *                     videoFile: ["影片檔案為必填欄位"]
 *               file_format_error:
 *                 summary: 檔案格式錯誤
 *                 value:
 *                   status: "error"
 *                   message: "檔案格式錯誤"
 *                   errors:
 *                     videoFile: ["不支援的檔案格式 \"video/mpeg\"。僅支援: MP4, AVI, MOV, WMV, QuickTime"]
 *               file_size_error:
 *                 summary: 檔案大小超過限制
 *                 value:
 *                   status: "error"
 *                   message: "檔案大小超過限制"
 *                   errors:
 *                     videoFile: ["檔案大小超過限制。當前大小: 600.0MB，最大允許: 500.0MB"]
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoPermissionErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤 - 檔案處理失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUploadFailedErrorResponse'
 */
router.post('/', 
  ...authMiddlewareChains.teacherAuth, 
  parseVideoFile,
  validateVideoFileMiddleware,
  validateRequest(uploadVideoSchema),
  videoController.uploadVideo,
  cleanupTempVideoFile
)

/**
 * @swagger
 * /api/videos:
 *   get:
 *     tags:
 *       - Video Management
 *     summary: 取得教師影片列表
 *     description: |
 *       取得目前登入教師的影片列表。支援分頁、分類篩選和關鍵字搜尋。
 *       
 *       **業務邏輯**：
 *       - 驗證教師身份和權限
 *       - 驗證查詢參數
 *       - 只回傳該教師的影片（權限隔離）
 *       - 支援分類模糊搜尋篩選
 *       - 支援關鍵字搜尋（影片名稱和介紹）
 *       - 分頁查詢，預設每頁 20 筆
 *       - 依建立時間倒序排列
 *       - 排除已軟刪除的影片
 *       
 *       **查詢功能**：
 *       - `category`: 分類篩選（模糊搜尋）
 *       - `search`: 關鍵字搜尋（搜尋標題和介紹）
 *       - `page`: 分頁頁碼
 *       - `per_page`: 每頁筆數（最大 100）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 頁碼 (預設 1)
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - name: per_page
 *         in: query
 *         description: 每頁數量 (預設 20，最大 100)
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           example: 20
 *       - name: category
 *         in: query
 *         description: 分類篩選 (模糊搜尋)
 *         required: false
 *         schema:
 *           type: string
 *           maxLength: 100
 *           example: "程式設計"
 *       - name: search
 *         in: query
 *         description: 搜尋關鍵字 (搜尋標題和介紹)
 *         required: false
 *         schema:
 *           type: string
 *           maxLength: 200
 *           example: "JavaScript"
 *     responses:
 *       200:
 *         description: 查詢成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoListSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               invalid_params:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     page: ["頁碼必須為正整數"]
 *                     per_page: ["每頁數量不能超過100"]
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoPermissionErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */

router.get('/', ...authMiddlewareChains.teacherAuth, validateRequest(videoListQuerySchema), videoController.getVideoList)

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     tags:
 *       - Video Management
 *     summary: 取得影片詳細資訊
 *     description: |
 *       取得指定影片的詳細資訊和使用統計。只能查看自己上傳的影片。
 *       
 *       **業務邏輯**：
 *       - 驗證教師身份和權限
 *       - 驗證影片 ID 格式
 *       - 查詢影片基本資訊
 *       - 驗證影片所有權（只能查看自己的影片）
 *       - 取得影片使用統計資訊
 *       - 排除已軟刪除的影片
 *       
 *       **權限控制**：
 *       - 需要教師身份認證
 *       - 只能查看自己上傳的影片
 *       - 無法查看已刪除的影片
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 影片 ID
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 取得影片詳情成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoDetailSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               invalid_id:
 *                 summary: 影片 ID 格式錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     id: ["影片 ID 必須為正整數"]
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 無權限查看此影片
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoPermissionErrorResponse'
 *       404:
 *         description: 影片不存在或已被刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/:id', ...authMiddlewareChains.teacherAuth, videoController.getVideoDetail)

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     tags:
 *       - Video Management
 *     summary: 更新影片資訊
 *     description: |
 *       更新指定影片的基本資訊和檔案。支援部分欄位更新和檔案替換，只能更新自己上傳的影片。
 *       
 *       **業務邏輯**：
 *       - 驗證教師身份和權限
 *       - 解析 multipart/form-data 表單資料（支援檔案替換）
 *       - 驗證影片檔案格式和大小（如有提供新檔案）
 *       - 查詢現有影片記錄並驗證所有權
 *       - 上傳新檔案到 Firebase Storage（如有提供）
 *       - 更新影片資訊到資料庫
 *       - 清理舊影片檔案（如有替換檔案）
 *       - 自動清理暫存檔案
 *       
 *       **可更新欄位**：
 *       - `name`: 影片名稱（1-200字元）
 *       - `category`: 影片分類（1-100字元） 
 *       - `intro`: 影片介紹（1-2000字元）
 *       - `videoFile`: 影片檔案（可選，支援 MP4, AVI, MOV, WMV，最大 500MB）
 *       
 *       **檔案替換功能**：
 *       - 支援可選影片檔案上傳
 *       - 上傳新檔案時自動刪除舊檔案
 *       - 檔案上傳失敗時自動回滾
 *       - 支援與課程編輯相同的檔案替換邏輯
 *       
 *       **注意事項**：
 *       - 所有欄位均為可選（至少需要提供一個欄位）
 *       - 檔案為可選，不提供時保持原有檔案
 *       - 檔案格式限制：MP4, AVI, MOV, WMV, QuickTime
 *       - 檔案大小限制：最大 500MB
 *       - 無法更新已刪除的影片
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 影片 ID
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 影片名稱（可選）
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: "更新的影片名稱"
 *               category:
 *                 type: string
 *                 description: 影片分類（可選）
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "程式設計"
 *               intro:
 *                 type: string
 *                 description: 影片介紹（可選）
 *                 minLength: 1
 *                 maxLength: 2000
 *                 example: "這是更新後的影片介紹"
 *               videoFile:
 *                 type: string
 *                 format: binary
 *                 description: 影片檔案（可選）
 *           examples:
 *             update_info_only:
 *               summary: 只更新基本資訊
 *               value:
 *                 name: "更新的影片名稱"
 *                 category: "程式設計"
 *                 intro: "更新的影片介紹"
 *             update_with_file:
 *               summary: 更新資訊並替換檔案
 *               value:
 *                 name: "更新的影片名稱"
 *                 category: "程式設計"
 *                 intro: "更新的影片介紹"
 *                 videoFile: "[影片檔案]"
 *     responses:
 *       200:
 *         description: 影片資訊更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUpdateSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或檔案格式錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUpdateValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 基本資料驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     name: ["影片名稱長度不能超過200字元"]
 *                     category: ["影片分類不能為空"]
 *               file_format_error:
 *                 summary: 檔案格式錯誤
 *                 value:
 *                   status: "error"
 *                   message: "不支援的檔案格式 \"video/x-msvideo\"。僅支援: MP4, AVI, MOV, WMV, QuickTime"
 *                   code: "VIDEO_FILE_FORMAT_INVALID"
 *                   errors:
 *                     videoFile: ["不支援的檔案格式 \"video/x-msvideo\"。僅支援: MP4, AVI, MOV, WMV, QuickTime"]
 *                     currentFormat: ["當前格式: video/x-msvideo"]
 *                     fileName: ["檔案名稱: example.avi"]
 *               file_size_error:
 *                 summary: 檔案大小超過限制
 *                 value:
 *                   status: "error"
 *                   message: "檔案大小超過限制。當前大小: 600.0MB，最大允許: 500.0MB"
 *                   code: "VIDEO_FILE_TOO_LARGE"
 *                   errors:
 *                     videoFile: ["檔案大小超過限制。當前大小: 600.0MB，最大允許: 500.0MB"]
 *                     fileSize: ["當前大小: 600.0MB"]
 *                     maxSize: ["最大允許: 500.0MB"]
 *               no_update_data:
 *                 summary: 沒有提供更新資料
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     body: ["至少需要提供一個欄位進行更新"]
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 無權限更新此影片
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoPermissionErrorResponse'
 *       404:
 *         description: 影片不存在或已被刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤 - 檔案處理失敗或資料庫錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VideoUpdateFailedErrorResponse'
 *             examples:
 *               upload_failed:
 *                 summary: 檔案上傳失敗
 *                 value:
 *                   status: "error"
 *                   message: "影片檔案上傳失敗"
 *                   code: "VIDEO_UPLOAD_FAILED"
 *               database_error:
 *                 summary: 資料庫更新失敗
 *                 value:
 *                   status: "error"
 *                   message: "影片資訊更新失敗"
 *                   code: "SERVER_ERROR"
 */

router.put('/:id', 
  ...authMiddlewareChains.teacherAuth, 
  parseOptionalVideoFile,
  validateOptionalVideoFileMiddleware,
  validateRequest(updateVideoSchema),
  videoController.updateVideo,
  cleanupTempVideoFile
)

router.delete('/:id', ...authMiddlewareChains.teacherAuth, videoController.deleteVideo)

export default router