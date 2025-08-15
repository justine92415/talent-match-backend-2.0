import { Router } from 'express'
import { authController } from '../controllers/AuthController'
import { validateRegisterRequest } from '../middleware/validation'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nick_name
 *         - email
 *         - password
 *       properties:
 *         nick_name:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: 使用者暱稱
 *           example: "王小明"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: 電子郵件地址
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           description: 密碼（至少8字元）
 *           example: "password123"
 *
 *     RegisterResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "註冊成功"
 *             data:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     uuid:
 *                       type: string
 *                       format: uuid
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     nick_name:
 *                       type: string
 *                       example: "王小明"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     role:
 *                       type: string
 *                       example: "student"
 *                     account_status:
 *                       type: string
 *                       example: "active"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00Z"
 *                 access_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refresh_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 token_type:
 *                   type: string
 *                   example: "Bearer"
 *                 expires_in:
 *                   type: integer
 *                   example: 3600
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 使用者註冊
 *     description: 註冊新的使用者帳戶，成功後自動登入並回傳 JWT Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: 註冊成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterResponse'
 *       400:
 *         description: 請求參數錯誤或資料衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "註冊失敗"
 *                   errors:
 *                     email: ["請輸入有效的電子郵件格式"]
 *                     password: ["密碼必須至少8字元且包含中英文"]
 *               email_exists:
 *                 summary: Email 已存在
 *                 value:
 *                   status: "error"
 *                   message: "註冊失敗"
 *                   errors:
 *                     email: ["此電子郵件已被註冊"]
 *               nickname_exists:
 *                 summary: 暱稱已存在
 *                 value:
 *                   status: "error"
 *                   message: "註冊失敗"
 *                   errors:
 *                     nick_name: ["此暱稱已被使用"]
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
  '/register',
  validateRegisterRequest, // 參數驗證
  authController.register // 業務邏輯
)

export default router
