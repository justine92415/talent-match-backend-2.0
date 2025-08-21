import { Router } from 'express'
import { adminController } from '@controllers/AdminController'
import { authenticateAdmin, requireAdminPermission } from '@middleware/adminAuth'
import { 
  validateRequest,
  adminLoginSchema,
  rejectionRequestSchema
} from '@middleware/validation'
import { MESSAGES } from '@constants/Message'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     AdminLoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: 管理員帳號
 *           example: "admin"
 *         password:
 *           type: string
 *           minLength: 8
 *           description: 管理員密碼
 *           example: "adminPassword123"
 *
 *     AdminLoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "管理員登入成功"
 *         data:
 *           type: object
 *           properties:
 *             admin:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 username:
 *                   type: string
 *                   example: "admin"
 *                 name:
 *                   type: string
 *                   example: "系統管理員"
 *                 email:
 *                   type: string
 *                   example: "admin@example.com"
 *                 role:
 *                   type: string
 *                   example: "super_admin"
 *                 last_login_at:
 *                   type: string
 *                   nullable: true
 *                   example: "2024-01-15T10:30:00Z"
 *             access_token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             refresh_token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     TeacherApprovalResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "教師申請已核准"
 *         data:
 *           type: object
 *           properties:
 *             teacher:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 uuid:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 user_id:
 *                   type: integer
 *                   example: 10
 *                 application_status:
 *                   type: string
 *                   example: "approved"
 *                 application_reviewed_at:
 *                   type: string
 *                   example: "2024-01-15T10:30:00Z"
 *                 reviewer_id:
 *                   type: integer
 *                   example: 1
 *             user:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 10
 *                 role:
 *                   type: string
 *                   example: "teacher"
 *
 *     RejectionRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: 拒絕原因
 *           example: "資料不完整，請重新提交相關證明文件"
 *
 *     CourseApprovalResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: "success"
 *         message:
 *           type: string
 *           example: "課程申請已核准"
 *         data:
 *           type: object
 *           properties:
 *             course:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 uuid:
 *                   type: string
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 name:
 *                   type: string
 *                   example: "JavaScript 基礎課程"
 *                 teacher_id:
 *                   type: integer
 *                   example: 5
 *                 status:
 *                   type: string
 *                   example: "approved"
 *                 application_status:
 *                   type: string
 *                   example: "approved"
 *                 created_at:
 *                   type: string
 *                   example: "2024-01-10T08:00:00Z"
 *                 updated_at:
 *                   type: string
 *                   example: "2024-01-15T10:30:00Z"
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     tags:
 *       - Admin Authentication
 *     summary: 管理員登入
 *     description: |
 *       管理員登入系統，用於取得管理權限。
 *       
 *       **安全特性：**
 *       - 驗證管理員帳號和密碼
 *       - 檢查帳號是否為啟用狀態
 *       - 產生 JWT access token 和 refresh token
 *       - 記錄登入時間
 *       
 *       **業務規則：**
 *       - 只有啟用的管理員帳號可以登入
 *       - 登入成功後更新最後登入時間
 *       - Token 具有時效性，需要定期刷新
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *           examples:
 *             adminLogin:
 *               summary: 管理員登入範例
 *               value:
 *                 username: "admin"
 *                 password: "adminPassword123"
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "參數驗證失敗"
 *                 errors:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["管理員帳號為必填欄位"]
 *       401:
 *         description: 帳號或密碼錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "管理員帳號或密碼錯誤"
 *       403:
 *         description: 帳號被停用
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "管理員帳號已停用"
 */
router.post(
  '/login',
  validateRequest(adminLoginSchema, MESSAGES.BUSINESS.LOGIN_FAILED),
  adminController.login
)

/**
 * @swagger
 * /api/admin/logout:
 *   post:
 *     tags:
 *       - Admin Authentication
 *     summary: 管理員登出
 *     description: 管理員登出系統，清除登入狀態
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "管理員登出成功"
 *                 data:
 *                   type: object
 *       401:
 *         description: 未提供有效的管理員 Token
 */
router.post('/logout', authenticateAdmin, adminController.logout)

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     tags:
 *       - Admin Profile
 *     summary: 取得管理員個人資訊
 *     description: 取得當前登入管理員的基本資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得管理員資訊
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "成功取得個人資料"
 *                 data:
 *                   type: object
 *                   properties:
 *                     adminId:
 *                       type: integer
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: "admin"
 *                     role:
 *                       type: string
 *                       example: "super_admin"
 *                     type:
 *                       type: string
 *                       example: "access"
 *       401:
 *         description: 管理員認證失敗
 */
router.get('/profile', authenticateAdmin, adminController.getProfile)

/**
 * @swagger
 * /api/admin/teachers/{teacherId}/approve:
 *   post:
 *     tags:
 *       - Teacher Management
 *     summary: 核准教師申請
 *     description: |
 *       核准指定的教師申請，將申請狀態更新為已核准。
 *       
 *       **業務流程：**
 *       1. 驗證管理員權限
 *       2. 檢查教師申請是否存在
 *       3. 驗證申請狀態為待審核
 *       4. 更新申請狀態為已核准
 *       5. 記錄審核時間和審核者
 *       6. 更新使用者角色為教師
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         description: 教師ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 教師申請核准成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherApprovalResponse'
 *       400:
 *         description: 無效的教師ID
 *       401:
 *         description: 管理員認證失敗
 *       404:
 *         description: 教師申請不存在
 *       409:
 *         description: 申請已被審核
 *       422:
 *         description: 申請狀態不允許審核
 */
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
 *     tags:
 *       - Teacher Management
 *     summary: 拒絕教師申請
 *     description: |
 *       拒絕指定的教師申請，並提供拒絕原因。
 *       
 *       **業務流程：**
 *       1. 驗證管理員權限和拒絕原因
 *       2. 檢查教師申請是否存在
 *       3. 驗證申請狀態為待審核
 *       4. 更新申請狀態為已拒絕
 *       5. 記錄審核時間、審核者和拒絕原因
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         description: 教師ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectionRequest'
 *           examples:
 *             rejectionReason:
 *               summary: 拒絕原因範例
 *               value:
 *                 reason: "資料不完整，請重新提交相關證明文件"
 *     responses:
 *       200:
 *         description: 教師申請拒絕成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "教師申請已拒絕"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         uuid:
 *                           type: string
 *                           example: "123e4567-e89b-12d3-a456-426614174000"
 *                         user_id:
 *                           type: integer
 *                           example: 10
 *                         application_status:
 *                           type: string
 *                           example: "rejected"
 *                         application_reviewed_at:
 *                           type: string
 *                           example: "2024-01-15T10:30:00Z"
 *                         reviewer_id:
 *                           type: integer
 *                           example: 1
 *                         review_notes:
 *                           type: string
 *                           example: "資料不完整，請重新提交相關證明文件"
 *       400:
 *         description: 參數驗證錯誤或無效的教師ID
 *       401:
 *         description: 管理員認證失敗
 *       404:
 *         description: 教師申請不存在
 *       409:
 *         description: 申請已被審核
 */
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
 *     tags:
 *       - Course Management
 *     summary: 核准課程申請
 *     description: |
 *       核准指定的課程申請，將課程狀態更新為已核准。
 *       
 *       **注意：** 目前Course實體沒有完整的審核相關欄位，
 *       此API實作了基本的核准流程，待Course實體擴展後將支援完整功能。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: 課程ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 課程申請核准成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseApprovalResponse'
 *       400:
 *         description: 無效的課程ID
 *       401:
 *         description: 管理員認證失敗
 *       404:
 *         description: 課程申請不存在
 */
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
 *     tags:
 *       - Course Management
 *     summary: 拒絕課程申請
 *     description: |
 *       拒絕指定的課程申請，並提供拒絕原因。
 *       
 *       **注意：** 目前Course實體沒有完整的審核相關欄位，
 *       此API實作了基本的拒絕流程，待Course實體擴展後將支援完整功能。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         description: 課程ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectionRequest'
 *           examples:
 *             rejectionReason:
 *               summary: 拒絕原因範例
 *               value:
 *                 reason: "課程內容不符合平台規範，請修改後重新提交"
 *     responses:
 *       200:
 *         description: 課程申請拒絕成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseApprovalResponse'
 *       400:
 *         description: 參數驗證錯誤或無效的課程ID
 *       401:
 *         description: 管理員認證失敗
 *       404:
 *         description: 課程申請不存在
 */
router.post(
  '/courses/:courseId/reject',
  authenticateAdmin,
  requireAdminPermission,
  validateRequest(rejectionRequestSchema, MESSAGES.ADMIN.COURSE_APPLICATION_REJECTED),
  adminController.rejectCourseApplication
)

export default router