import { Router } from 'express'
import { adminController } from '@controllers/AdminController'
import { authenticateAdmin, requireAdminPermission } from '@middleware/auth'
import { 
  validateRequest
} from '@middleware/schemas'
import { 
  adminLoginSchema,
  rejectionRequestSchema
} from '@middleware/schemas/auth'
import { MESSAGES } from '@constants/Message'

const router = Router()

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: 管理員登入
 *     description: |
 *       管理員使用帳號密碼登入系統，取得管理員權限的 JWT Token。
 *       管理員登入使用 username/password 組合，與一般使用者的 email/password 不同。
 *       
 *       **登入流程：**
 *       1. 驗證帳號密碼
 *       2. 檢查管理員權限
 *       3. 生成 JWT Token
 *       4. 記錄登入日誌
 *       
 *       **安全機制：**
 *       - 密碼加密驗證
 *       - 登入失敗次數限制
 *       - IP 白名單檢查（如有設定）
 *     tags:
 *       - Admin Management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: 管理員帳號
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 description: 管理員密碼
 *                 example: "admin123456"
 *           examples:
 *             admin_login:
 *               summary: 管理員登入範例
 *               value:
 *                 username: "admin"
 *                 password: "admin123456"
 *     responses:
 *       200:
 *         description: 登入成功
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
 *                         access_token:
 *                           type: string
 *                           description: JWT 存取 Token
 *                         refresh_token:
 *                           type: string
 *                           description: JWT 刷新 Token
 *                         expires_in:
 *                           type: integer
 *                           description: Token 有效期（秒）
 *                         admin:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               description: 管理員 ID
 *                             username:
 *                               type: string
 *                               description: 管理員帳號
 *                             name:
 *                               type: string
 *                               description: 管理員姓名
 *                             permissions:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               description: 管理員權限列表
 *             examples:
 *               success:
 *                 summary: 登入成功回應
 *                 value:
 *                   status: "success"
 *                   message: "管理員登入成功"
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     expires_in: 3600
 *                     admin:
 *                       id: 1
 *                       username: "admin"
 *                       name: "系統管理員"
 *                       permissions: ["teacher_management", "course_management", "system_settings"]
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: 登入失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_credentials:
 *                 summary: 帳號密碼錯誤
 *                 value:
 *                   status: "error"
 *                   message: "帳號或密碼錯誤"
 *                   error_code: "INVALID_CREDENTIALS"
 *               account_locked:
 *                 summary: 帳號被鎖定
 *                 value:
 *                   status: "error"
 *                   message: "帳號已被鎖定，請聯繫系統管理員"
 *                   error_code: "ACCOUNT_LOCKED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Admin login route
router.post(
  '/login',
  validateRequest(adminLoginSchema, MESSAGES.BUSINESS.LOGIN_FAILED),
  adminController.login
)

/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     summary: 管理員登出
 *     description: |
 *       管理員登出系統，使當前 JWT Token 失效。
 *       登出後該 Token 將無法再用於存取管理員功能。
 *       
 *       **登出流程：**
 *       1. 驗證當前 Token 有效性
 *       2. 將 Token 加入黑名單
 *       3. 清除相關會話資料
 *       4. 記錄登出日誌
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 登出成功回應
 *                 value:
 *                   status: "success"
 *                   message: "管理員登出成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Admin logout route
router.post('/logout', authenticateAdmin, adminController.logout)

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: 取得管理員個人資料
 *     description: |
 *       取得當前登入管理員的個人資料和權限資訊。
 *       包含基本資料、權限列表、最後登入時間等資訊。
 *       
 *       **返回資訊：**
 *       - 基本個人資料（帳號、姓名、聯絡資訊）
 *       - 權限列表和角色資訊
 *       - 最後登入和活動記錄
 *       - 系統設定偏好
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得管理員資料
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
 *                         id:
 *                           type: integer
 *                           description: 管理員 ID
 *                         username:
 *                           type: string
 *                           description: 管理員帳號
 *                         name:
 *                           type: string
 *                           description: 管理員姓名
 *                         email:
 *                           type: string
 *                           format: email
 *                           description: 管理員信箱
 *                         role:
 *                           type: string
 *                           description: 管理員角色
 *                         permissions:
 *                           type: array
 *                           items:
 *                             type: string
 *                           description: 權限列表
 *                         last_login_at:
 *                           type: string
 *                           format: date-time
 *                           description: 最後登入時間
 *                         created_at:
 *                           type: string
 *                           format: date-time
 *                           description: 帳號建立時間
 *             examples:
 *               success:
 *                 summary: 成功回應範例
 *                 value:
 *                   status: "success"
 *                   message: "成功取得管理員資料"
 *                   data:
 *                     id: 1
 *                     username: "admin"
 *                     name: "系統管理員"
 *                     email: "admin@example.com"
 *                     role: "super_admin"
 *                     permissions: ["teacher_management", "course_management", "system_settings"]
 *                     last_login_at: "2024-01-20T10:30:00Z"
 *                     created_at: "2023-01-01T00:00:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Get admin profile
router.get('/profile', authenticateAdmin, adminController.getProfile)

/**
 * @swagger
 * /api/admin/teacher-applications:
 *   get:
 *     summary: 取得教師申請列表
 *     description: |
 *       取得所有教師申請的列表，包含待審核、已通過、已拒絕等各種狀態的申請。
 *       管理員可以透過此 API 查看和管理所有教師申請案。
 *       
 *       **功能特色：**
 *       - 支援申請狀態篩選
 *       - 支援申請時間排序
 *       - 顯示申請者基本資訊
 *       - 支援分頁瀏覽
 *       
 *       **權限要求：**
 *       - 需要管理員身份認證
 *       - 需要教師管理權限
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 申請狀態篩選
 *         example: "pending"
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
 *           default: 20
 *         description: 每頁顯示數量
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest]
 *           default: newest
 *         description: 排序方式
 *     responses:
 *       200:
 *         description: 成功取得教師申請列表
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
 *                         applications:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherApplicationInfo'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Get teacher applications list
router.get('/teacher-applications', authenticateAdmin, requireAdminPermission, adminController.getTeacherApplications)

/**
 * @swagger
 * /api/admin/teachers/{teacherId}/approve:
 *   post:
 *     summary: 核准教師申請
 *     description: |
 *       核准指定的教師申請，將申請者的身份從 TEACHER_PENDING 升級為 TEACHER。
 *       核准後申請者將獲得教師權限，可以建立和管理課程。
 *       
 *       **核准流程：**
 *       1. 驗證申請狀態（必須是待審核狀態）
 *       2. 更新使用者角色為教師
 *       3. 記錄審核結果和時間
 *       4. 發送核准通知給申請者
 *       
 *       **權限要求：**
 *       - 需要管理員身份認證
 *       - 需要教師管理權限
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師申請 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 教師申請核准成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 核准成功回應
 *                 value:
 *                   status: "success"
 *                   message: "教師申請已核准，申請者已獲得教師權限"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       404:
 *         description: 教師申請不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 申請不存在
 *                 value:
 *                   status: "error"
 *                   message: "教師申請不存在"
 *                   error_code: "APPLICATION_NOT_FOUND"
 *       409:
 *         description: 申請狀態不允許核准
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_status:
 *                 summary: 申請狀態錯誤
 *                 value:
 *                   status: "error"
 *                   message: "申請已處理，無法重複核准"
 *                   error_code: "INVALID_APPLICATION_STATUS"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Approve teacher application
router.post(
  '/teachers/:teacherId/approve',
  authenticateAdmin,
  requireAdminPermission,
  adminController.approveTeacherApplication
)

/**
 * @swagger
 * /api/admin/teachers/{teacherId}/reject:
 *   post:
 *     summary: 拒絕教師申請
 *     description: |
 *       拒絕指定的教師申請，並記錄拒絕原因。
 *       拒絕後申請者可以查看拒絕原因，並可選擇重新提交申請。
 *       
 *       **拒絕流程：**
 *       1. 驗證申請狀態（必須是待審核狀態）
 *       2. 記錄拒絕原因和時間
 *       3. 更新申請狀態為已拒絕
 *       4. 發送拒絕通知給申請者
 *       
 *       **權限要求：**
 *       - 需要管理員身份認證
 *       - 需要教師管理權限
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師申請 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: 拒絕原因說明
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: 額外備註（內部使用）
 *           examples:
 *             incomplete_info:
 *               summary: 資料不完整
 *               value:
 *                 reason: "提供的教學經歷資料不完整，請補充相關證明文件"
 *                 notes: "申請者缺少工作經驗證明"
 *             unqualified:
 *               summary: 資格不符
 *               value:
 *                 reason: "教學經驗不足兩年，不符合平台教師資格要求"
 *     responses:
 *       200:
 *         description: 教師申請拒絕成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 拒絕成功回應
 *                 value:
 *                   status: "success"
 *                   message: "教師申請已拒絕，拒絕原因已記錄"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       404:
 *         description: 教師申請不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 申請狀態不允許拒絕
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Reject teacher application
router.post(
  '/teachers/:teacherId/reject',
  authenticateAdmin,
  requireAdminPermission,
  validateRequest(rejectionRequestSchema, MESSAGES.ADMIN.TEACHER_APPLICATION_REJECTED),
  adminController.rejectTeacherApplication
)

/**
 * @swagger
 * /api/admin/courses/{courseId}/approve:
 *   post:
 *     summary: 核准課程申請
 *     description: |
 *       核准指定的課程申請，將課程狀態從審核中改為審核通過。
 *       核准後教師可以選擇發布課程，讓學生可以瀏覽和報名。
 *       
 *       **核准流程：**
 *       1. 驗證課程狀態（必須是審核中狀態）
 *       2. 更新課程狀態為審核通過
 *       3. 記錄審核結果和時間
 *       4. 發送核准通知給教師
 *       
 *       **權限要求：**
 *       - 需要管理員身份認證
 *       - 需要課程管理權限
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 課程申請核准成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 核准成功回應
 *                 value:
 *                   status: "success"
 *                   message: "課程申請已核准，教師可以發布課程"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 課程不存在
 *                 value:
 *                   status: "error"
 *                   message: "課程不存在"
 *                   error_code: "COURSE_NOT_FOUND"
 *       409:
 *         description: 課程狀態不允許核准
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_status:
 *                 summary: 課程狀態錯誤
 *                 value:
 *                   status: "error"
 *                   message: "課程狀態不允許審核，請檢查課程狀態"
 *                   error_code: "INVALID_COURSE_STATUS"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Approve course application
router.post(
  '/courses/:courseId/approve',
  authenticateAdmin,
  requireAdminPermission,
  adminController.approveCourseApplication
)

/**
 * @swagger
 * /api/admin/courses/{courseId}/reject:
 *   post:
 *     summary: 拒絕課程申請
 *     description: |
 *       拒絕指定的課程申請，並記錄拒絕原因。
 *       拒絕後教師可以查看拒絕原因，修正課程內容後重新提交審核。
 *       
 *       **拒絕流程：**
 *       1. 驗證課程狀態（必須是審核中狀態）
 *       2. 記錄拒絕原因和時間
 *       3. 更新課程狀態為審核拒絕
 *       4. 發送拒絕通知給教師
 *       
 *       **權限要求：**
 *       - 需要管理員身份認證
 *       - 需要課程管理權限
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: 拒絕原因說明
 *               notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: 額外備註（內部使用）
 *           examples:
 *             content_issue:
 *               summary: 內容問題
 *               value:
 *                 reason: "課程內容描述不夠詳細，請補充教學大綱和學習目標"
 *                 notes: "需要更具體的課程規劃"
 *             inappropriate_content:
 *               summary: 內容不當
 *               value:
 *                 reason: "課程內容包含不適當資訊，請修正後重新提交"
 *     responses:
 *       200:
 *         description: 課程申請拒絕成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 拒絕成功回應
 *                 value:
 *                   status: "success"
 *                   message: "課程申請已拒絕，拒絕原因已記錄"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 課程狀態不允許拒絕
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// Reject course application
router.post(
  '/courses/:courseId/reject',
  authenticateAdmin,
  requireAdminPermission,
  validateRequest(rejectionRequestSchema, MESSAGES.ADMIN.COURSE_APPLICATION_REJECTED),
  adminController.rejectCourseApplication
)

export default router