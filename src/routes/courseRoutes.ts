/**
 * 課程路由
 * 
 * 提供課程管理的 API 端點，包括：
 * - POST /api/courses - 建立課程
 * - PUT /api/courses/:id - 更新課程
 * - GET /api/courses/:id - 取得課程詳情
 * - GET /api/courses - 教師課程列表
 * - DELETE /api/courses/:id - 刪除課程
 * 
 * 所有端點都需要教師身份認證
 */

import { Router } from 'express'
import { CourseController } from '@controllers/CourseController'
import { CourseVideoController } from '@controllers/CourseVideoController'
import { CourseFileController } from '@controllers/CourseFileController'
import { reviewController } from '@controllers/ReviewController'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { 
  createCourseSchema,
  updateCourseSchema,
  courseIdSchema,
  courseListQuerySchema
} from '@middleware/schemas/course/courseSchemas'
import { integratedCourseCreateSchema } from '@middleware/schemas/course/integratedCourseSchemas'
import {
  parseCourseImageFile,
  validateCourseImageFileMiddleware,
  cleanupTempCourseImageFile
} from '@middleware/upload/courseImageUpload'
import {
  linkVideosToCourseBodySchema,
  updateVideoOrderBodySchema,
  removeCourseVideoParamSchema,
  courseVideoIdParamSchema,
  courseIdForUpdateParamSchema
} from '@middleware/schemas/course/videoValidationSchemas'
import {
  getCourseFilesParamSchema,
  getCourseFilesQuerySchema,
  uploadCourseFilesParamSchema,
  uploadCourseFilesBodySchema,
  deleteCourseFileParamSchema
} from '@middleware/schemas/course/fileSchemas'
import {
  courseReviewQuerySchema
} from '@middleware/schemas/course/publicCourseSchemas'
import { authenticateToken } from '@middleware/auth/userAuth'

const router = Router()
const courseController = new CourseController()
const courseVideoController = new CourseVideoController()
const courseFileController = new CourseFileController()

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags:
 *       - Course Management
 *     summary: 建立新課程 (支援圖片上傳)
 *     description: |
 *       建立新的課程，需要教師身份認證。支援同時上傳課程圖片、設定課程資訊和價格方案。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限且審核通過
 *       - 處理 multipart/form-data 格式請求 (courseData JSON + priceOptions JSON + courseImage 檔案)
 *       - 驗證課程資料、價格方案和圖片檔案 (可選)
 *       - 上傳課程圖片到 Firebase Storage (如有提供)
 *       - 在資料庫交易中建立課程和所有價格方案
 *       - 自動生成課程 UUID 和設定預設值
 *       - 建立課程記錄，狀態為草稿 (draft)
 *       - 回傳建立的課程完整資訊
 *       
 *       **表單欄位**：
 *       - courseData: JSON 字串，包含課程基本資訊
 *       - priceOptions: JSON 陣列字串，包含價格方案列表
 *       - courseImage: 圖片檔案 (可選，支援 JPEG/PNG/WebP，最大 10MB)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - courseData
 *               - priceOptions
 *             properties:
 *               courseData:
 *                 type: string
 *                 format: json
 *                 description: '課程基本資料 (JSON 字串格式)'
 *                 example: '{"name":"JavaScript 基礎入門課程","content":"<p>完整的 JavaScript 基礎教學，適合初學者</p>","main_category_id":1,"sub_category_id":2,"city_id":1,"survey_url":"https://forms.google.com/survey123","purchase_message":"請準備筆記本，課程需要大量練習"}'
 *               priceOptions:
 *                 type: string
 *                 format: json
 *                 description: '價格方案陣列 (JSON 字串格式)'
 *                 example: '[{"price":1500,"quantity":1},{"price":4200,"quantity":3},{"price":7500,"quantity":6}]'
 *               courseImage:
 *                 type: string
 *                 format: binary
 *                 description: '課程主圖 (可選，支援 JPEG/PNG/WebP，最大 10MB)'
 *           encoding:
 *             courseData:
 *               contentType: application/json
 *             priceOptions:
 *               contentType: application/json
 *             courseImage:
 *               contentType: image/*
 *     responses:
 *       201:
 *         description: 課程建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCourseSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CreateCourseValidationErrorResponse'
 *                 - $ref: '#/components/schemas/CreateCourseBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     name: ["課程名稱為必填欄位"]
 *                     content: ["課程內容為必填欄位"]
 *                     priceOptions: ["課程必須至少有一個價格方案"]
 *               image_validation_error:
 *                 summary: 圖片驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "圖片檔案驗證失敗"
 *                   errors:
 *                     courseImage: ["不支援的檔案格式 \"image/gif\"。僅支援: JPEG, JPG, PNG, WebP"]
 *               json_format_error:
 *                 summary: JSON 格式錯誤
 *                 value:
 *                   status: "error"
 *                   message: "表單資料格式錯誤"
 *                   errors:
 *                     courseData: ["課程資料格式錯誤，請確認 JSON 格式正確"]
 *                     priceOptions: ["方案資料格式錯誤，請確認 JSON 格式正確"]
 *               business_error:
 *                 summary: 業務邏輯錯誤
 *                 value:
 *                   status: "error"
 *                   message: "教師審核尚未通過，無法建立課程"
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
 *               $ref: '#/components/schemas/CreateCourseTeacherPermissionErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Create course with integrated multipart data support
router.post('/', 
  authenticateToken, 
  parseCourseImageFile,
  validateCourseImageFileMiddleware,
  createSchemasMiddleware({ body: integratedCourseCreateSchema }),
  cleanupTempCourseImageFile,
  courseController.createCourse
)

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     tags:
 *       - Course Management
 *     summary: 更新課程資訊（支援圖片上傳和價格方案編輯）
 *     description: |
 *       更新指定的課程資訊，需要教師身份認證。只能更新自己的課程。
 *       
 *       **功能特性**：
 *       - 支援課程基本資料更新
 *       - 支援課程圖片上傳和替換（自動清理舊圖片）
 *       - 支援價格方案的完整替換（新增、修改、刪除）
 *       - 使用 multipart/form-data 格式上傳
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限且已通過審核
 *       - 驗證課程存在且為使用者所擁有
 *       - 如有上傳新圖片，會自動替換並清理舊圖片
 *       - 價格方案會完全替換（不是增量更新）
 *       - 所有參數皆為選填，未提供的欄位保持原值
 *       - 自動更新 updated_at 時間戳
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/IntegratedCourseCreateRequest'
 *     responses:
 *       200:
 *         description: 課程更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCourseSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/CreateCourseValidationErrorResponse'
 *                 - $ref: '#/components/schemas/CreateCourseBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     courseData: ["課程資料格式錯誤"]
 *                     priceOptions: ["價格方案至少需要一個"]
 *               business_error:
 *                 summary: 業務邏輯錯誤
 *                 value:
 *                   status: "error"
 *                   message: "需要教師權限才能更新課程"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 權限不足或只能更新自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateCoursePermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateCourseNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Update course with integrated multipart data support (similar to create)
router.put('/:id', 
  authenticateToken, 
  parseCourseImageFile,
  validateCourseImageFileMiddleware,
  createSchemasMiddleware({ params: courseIdSchema, body: integratedCourseCreateSchema }),
  cleanupTempCourseImageFile,
  courseController.updateCourse
)

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags:
 *       - Course Management
 *     summary: 取得課程詳細資訊
 *     description: |
 *       取得指定課程的詳細資訊。根據使用者身份和課程狀態決定存取權限。
 *       
 *       **存取權限規則**：
 *       - 未登入：只能查看已發布 (published) 的課程
 *       - 課程擁有者：可以查看自己的所有課程 (包含草稿、審核中等)
 *       - 其他教師：只能查看已發布的課程
 *       - 一般使用者：只能查看已發布的課程
 *       
 *       **業務邏輯**：
 *       - 查詢指定 ID 的課程
 *       - 檢查課程是否存在
 *       - 根據使用者身份驗證存取權限
 *       - 回傳完整的課程資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得課程資訊
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCourseSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 只能查看自己的課程或已發布的公開課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCoursePermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCourseNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Get course by ID
router.get('/:id', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.getCourse)

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags:
 *       - Course Management
 *     summary: 取得教師課程列表
 *     description: |
 *       取得目前登入教師的所有課程列表，支援分頁查詢。需要教師身份認證。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限
 *       - 查詢該教師的所有課程 (所有狀態：草稿、審核中、已發布、已封存)
 *       - 依建立時間降序排列 (最新的在前)
 *       - 支援分頁查詢，預設每頁 20 筆
 *       - 回傳課程列表和分頁資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 頁碼 (預設為 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 每頁數量 (預設為 20，最大 100)
 *         example: 20
 *     responses:
 *       200:
 *         description: 成功取得教師課程列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCourseListSuccessResponse'
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
 *               $ref: '#/components/schemas/GetCourseListPermissionErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Get teacher's course list
router.get('/', authenticateToken, createSchemasMiddleware({ query: courseListQuerySchema }), courseController.getCourseList)

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags:
 *       - Course Management
 *     summary: 刪除課程
 *     description: |
 *       刪除指定的課程，需要教師身份認證。只能刪除自己的課程且有狀態限制。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限
 *       - 驗證課程存在且為使用者所擁有
 *       - 檢查課程狀態：已發布的課程不能直接刪除
 *       - 只能刪除草稿、審核中、已拒絕或已封存的課程
 *       - 執行硬刪除操作 (從資料庫移除)
 *       
 *       **注意事項**：
 *       - 已發布的課程請先封存後再刪除
 *       - 刪除操作無法復原，請謹慎使用
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     responses:
 *       200:
 *         description: 課程刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteCourseSuccessResponse'
 *       400:
 *         description: 業務邏輯錯誤 - 已發布的課程不能直接刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteCourseBusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 只能刪除自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteCoursePermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteCourseNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Delete course
router.delete('/:id', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.deleteCourse)

/**
 * @swagger
 * /api/courses/{id}/edit:
 *   get:
 *     tags:
 *       - Course Management
 *     summary: 取得課程編輯資料
 *     description: |
 *       取得課程的完整編輯資料，包含基本資訊和價格方案。專門供編輯頁面使用。
 *       
 *       **權限限制**：
 *       - 只有課程擁有者可以存取
 *       - 需要教師身份認證
 *       - 不限課程狀態（可編輯任何狀態的自有課程）
 *       
 *       **回應資料**：
 *       - 完整的課程基本資訊
 *       - 所有價格方案列表（按價格排序）
 *       - 供前端編輯表單初始化使用
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限
 *       - 驗證課程所有權
 *       - 查詢完整課程資料
 *       - 查詢關聯的價格方案
 *       - 回傳整合資料
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得課程編輯資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCourseForEditSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 只能編輯自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCourseEditPermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCourseEditNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Get course edit data
router.get('/:id/edit', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.getCourseForEdit)

/**
 * @swagger
 * /api/courses/{id}/submit:
 *   post:
 *     tags:
 *       - Course Status Management
 *     summary: 提交課程審核
 *     description: |
 *       提交課程給管理員進行審核。需要教師身份認證且課程必須符合提交條件。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限和課程所有權
 *       - 檢查課程狀態：只有草稿 (draft) 且未在審核中的課程可以提交
 *       - 將課程審核狀態設為待審核 (pending)
 *       - 可選擇性添加提交備註供審核者參考
 *       - 提交後等待管理員審核 (核准/拒絕)
 *       
 *       **前置條件**：
 *       - 課程狀態必須為 draft
 *       - 課程審核狀態不能是 pending
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitCourseRequest'
 *     responses:
 *       200:
 *         description: 課程提交審核成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmitCourseSuccessResponse'
 *       400:
 *         description: 業務邏輯錯誤 - 課程狀態不允許提交
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmitCourseBusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 只能管理自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusPermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Submit course for review
router.post('/:id/submit', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.submitCourse)

/**
 * @swagger
 * /api/courses/{id}/resubmit:
 *   post:
 *     tags:
 *       - Course Status Management
 *     summary: 重新提交課程審核
 *     description: |
 *       重新提交被拒絕的課程給管理員進行審核。需要教師身份認證且課程必須是被拒絕狀態。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限和課程所有權
 *       - 檢查課程審核狀態：只有被拒絕 (rejected) 的課程可以重新提交
 *       - 將課程審核狀態重新設為待審核 (pending)
 *       - 建議添加重新提交備註說明修正的內容
 *       - 重新提交後等待管理員重新審核
 *       
 *       **前置條件**：
 *       - 課程審核狀態必須為 rejected
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResubmitCourseRequest'
 *     responses:
 *       200:
 *         description: 課程重新提交審核成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResubmitCourseSuccessResponse'
 *       400:
 *         description: 業務邏輯錯誤 - 只有被拒絕的課程可以重新提交
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResubmitCourseBusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 只能管理自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusPermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Resubmit course for review
router.post('/:id/resubmit', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.resubmitCourse)

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   post:
 *     tags:
 *       - Course Status Management
 *     summary: 發布課程
 *     description: |
 *       將審核通過的課程發布到平台上，讓學生可以瀏覽和購買。需要教師身份認證。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限和課程所有權
 *       - 檢查課程狀態：必須是草稿 (draft) 且審核通過 (approved)
 *       - 將課程狀態設為已發布 (published)
 *       - 發布後課程將在公開平台上可見
 *       - 學生可以搜尋、瀏覽和購買該課程
 *       
 *       **前置條件**：
 *       - 課程狀態必須為 draft
 *       - 課程審核狀態必須為 approved
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     responses:
 *       200:
 *         description: 課程發布成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublishCourseSuccessResponse'
 *       400:
 *         description: 業務邏輯錯誤 - 課程狀態不允許發布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublishCourseBusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 只能管理自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusPermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Publish course
router.post('/:id/publish', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.publishCourse)

/**
 * @swagger
 * /api/courses/{id}/archive:
 *   post:
 *     tags:
 *       - Course Status Management
 *     summary: 封存課程
 *     description: |
 *       將已發布的課程封存，讓課程從公開平台下架但保留資料。需要教師身份認證。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者具有教師權限和課程所有權
 *       - 檢查課程狀態：只有已發布 (published) 的課程可以封存
 *       - 將課程狀態設為已封存 (archived)
 *       - 封存後課程將從公開平台移除，學生無法搜尋或購買
 *       - 可選擇性添加封存原因說明
 *       - 封存的課程可以透過重新審核流程再次發布
 *       
 *       **前置條件**：
 *       - 課程狀態必須為 published
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID (數字)
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ArchiveCourseRequest'
 *     responses:
 *       200:
 *         description: 課程封存成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArchiveCourseSuccessResponse'
 *       400:
 *         description: 業務邏輯錯誤 - 只有已發布的課程可以封存
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ArchiveCourseBusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 只能管理自己的課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusPermissionErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseStatusNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
// Archive course
router.post('/:id/archive', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.archiveCourse)

// Link videos to course
router.post('/:id/videos', authenticateToken, createSchemasMiddleware({ body: linkVideosToCourseBodySchema }), CourseVideoController.linkVideos)

// Update video order
router.put('/:course_id/videos/order', authenticateToken, createSchemasMiddleware({ params: courseIdForUpdateParamSchema, body: updateVideoOrderBodySchema }), CourseVideoController.updateVideoOrder)

// Remove video from course
router.delete('/:course_id/videos/:video_id', authenticateToken, createSchemasMiddleware({ params: removeCourseVideoParamSchema }), CourseVideoController.removeCourseVideo)

// Get course videos
router.get('/:id/videos', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), CourseVideoController.getCourseVideos)

// Get course files
router.get('/:id/files', authenticateToken, createSchemasMiddleware({ params: getCourseFilesParamSchema, query: getCourseFilesQuerySchema }), CourseFileController.getCourseFiles)

// Upload course files
router.post('/:id/files', authenticateToken, createSchemasMiddleware({ params: uploadCourseFilesParamSchema, body: uploadCourseFilesBodySchema }), CourseFileController.uploadCourseFiles)

// Delete course file
router.delete('/:course_id/files/:file_id', authenticateToken, createSchemasMiddleware({ params: deleteCourseFileParamSchema }), CourseFileController.deleteCourseFile)

// Get course reviews
router.get('/:id/reviews', authenticateToken, createSchemasMiddleware({ params: courseIdSchema, query: courseReviewQuerySchema }), reviewController.getCourseReviews)

export default router