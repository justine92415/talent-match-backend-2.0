import { Router } from 'express'
import { authController } from '@controllers/AuthController'
import { authenticateToken } from '@middleware/auth'
import { 
  validateRequest,
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
} from '@middleware/validation'
import { ERROR_MESSAGES } from '@config/constants'

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
  validateRequest(registerSchema, ERROR_MESSAGES.REGISTRATION_FAILED), // 參數驗證
  authController.register // 業務邏輯
)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 使用者登入
 *     description: 透過 email 和密碼進行使用者登入驗證
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件地址
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: 使用者密碼
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: 登入成功
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
 *                   example: "登入成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         uuid:
 *                           type: string
 *                           format: uuid
 *                         nick_name:
 *                           type: string
 *                           example: "使用者暱稱"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         role:
 *                           type: string
 *                           example: "student"
 *                         account_status:
 *                           type: string
 *                           example: "active"
 *                         last_login_at:
 *                           type: string
 *                           format: date-time
 *                     access_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     token_type:
 *                       type: string
 *                       example: "Bearer"
 *                     expires_in:
 *                       type: integer
 *                       example: 3600
 *       400:
 *         description: 請求參數錯誤
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
 *                   example: "登入失敗"
 *                 errors:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["請輸入有效的電子郵件格式"]
 *       401:
 *         description: 認證失敗
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
 *                   example: "登入失敗"
 *                 errors:
 *                   type: object
 *                   properties:
 *                     credentials:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["電子郵件或密碼錯誤"]
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
 *                   example: "帳號已停用"
 *                 errors:
 *                   type: object
 *                   properties:
 *                     account:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["您的帳號已被停用，請聯絡客服"]
 */
router.post(
  '/login',
  validateRequest(loginSchema, ERROR_MESSAGES.LOGIN_FAILED), // 參數驗證
  authController.login // 業務邏輯
)

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 刷新 Access Token
 *     description: 使用有效的 refresh token 來取得新的 access token 和 refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: 有效的 refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token 刷新成功
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
 *                   example: "Token 刷新成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *                     access_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     token_type:
 *                       type: string
 *                       example: "Bearer"
 *                     expires_in:
 *                       type: number
 *                       example: 3600
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               missing_token:
 *                 summary: 缺少 refresh token
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     refresh_token: ["Refresh token 為必填欄位"]
 *       401:
 *         description: Token 無效或已過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *             examples:
 *               invalid_token:
 *                 summary: Token 無效
 *                 value:
 *                   status: "error"
 *                   message: "Token 無效或已過期"
 *                   errors:
 *                     token: ["請提供有效的 refresh token"]
 *       403:
 *         description: 帳號被停用
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema, ERROR_MESSAGES.VALIDATION_ERROR), // 參數驗證
  authController.refreshToken // 業務邏輯
)

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 忘記密碼
 *     description: |
 *       發送重設密碼郵件給使用者。
 *       基於安全考量，無論電子郵件是否存在於系統中，都會回傳相同的成功訊息。
 *       這可以防止惡意使用者探測系統中存在的電子郵件地址。
 *       
 *       **業務邏輯**：
 *       - 驗證電子郵件格式
 *       - 若使用者存在且帳號啟用，生成重設令牌並發送郵件
 *       - 若使用者不存在或帳號被停用，不進行任何操作但回傳相同訊息
 *       
 *       **安全特性**：
 *       - 防止電子郵件枚舉攻擊
 *       - 重設令牌具有時效性（1小時）
 *       - 重設令牌為加密隨機字串，難以猜測
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 要重設密碼的電子郵件地址
 *                 example: "user@example.com"
 *           examples:
 *             existing_user:
 *               summary: 現有使用者請求
 *               value:
 *                 email: "user@example.com"
 *             non_existing_user:
 *               summary: 不存在的使用者（也會成功）
 *               value:
 *                 email: "nonexistent@example.com"
 *     responses:
 *       200:
 *         description: 重設密碼請求已處理（無論使用者是否存在）
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
 *                   example: "重設密碼郵件已發送，請檢查您的信箱"
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     email: ["email 為必填欄位"]
 *               invalid_email:
 *                 summary: 電子郵件格式錯誤
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     email: ["email 格式不正確"]
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema, ERROR_MESSAGES.VALIDATION_ERROR), // 參數驗證
  authController.forgotPassword // 業務邏輯
)

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: 重設密碼
 *     description: |
 *       使用有效的重設令牌來重設使用者密碼
 *       
 *       **重要安全特性：**
 *       - 驗證重設令牌的有效性和過期時間
 *       - 檢查帳號狀態（停用帳號無法重設密碼）
 *       - 密碼加密儲存
 *       - 成功重設後清除重設令牌
 *       - 一次性令牌（使用後失效）
 *       
 *       **業務規則：**
 *       - 令牌有效期為 1 小時
 *       - 令牌只能使用一次
 *       - 新密碼須符合安全要求
 *       - 已停用帳號無法重設密碼
 *       
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *           examples:
 *             resetPassword:
 *               summary: 重設密碼範例
 *               value:
 *                 token: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
 *                 new_password: "newSecurePassword123"
 *     responses:
 *       200:
 *         description: 密碼重設成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordResponse'
 *             examples:
 *               success:
 *                 summary: 重設成功
 *                 value:
 *                   status: "success"
 *                   message: "密碼重設成功"
 *       400:
 *         description: 參數驗證失敗或令牌無效
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ValidationErrorResponse'
 *                 - $ref: '#/components/schemas/BusinessErrorResponse'
 *             examples:
 *               validationError:
 *                 summary: 參數驗證失敗
 *                 value:
 *                   status: "error"
 *                   message: "參數驗證失敗"
 *                   errors:
 *                     token: ["重設令牌為必填欄位"]
 *                     new_password: ["密碼至少需要 8 個字元"]
 *               invalidToken:
 *                 summary: 無效或過期令牌
 *                 value:
 *                   status: "error"
 *                   message: "重設令牌無效或已過期"
 *               accountSuspended:
 *                 summary: 帳號已停用
 *                 value:
 *                   status: "error"
 *                   message: "帳號已停用，無法重設密碼"
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/reset-password', validateRequest(resetPasswordSchema, ERROR_MESSAGES.VALIDATION_ERROR), authController.resetPassword)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: 取得個人資料
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得個人資料
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         uuid:
 *                           type: string
 *                           format: uuid
 *                         nick_name:
 *                           type: string
 *                           example: "使用者暱稱"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         role:
 *                           type: string
 *                           example: "student"
 *                         account_status:
 *                           type: string
 *                           example: "active"
 *       401:
 *         description: 未授權
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
 *                   example: "未提供授權 Token"
 */
router.get('/profile', authenticateToken, authController.getProfile)

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: 更新個人資料
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nick_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 example: "新暱稱"
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: "王小明"
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               contact_phone:
 *                 type: string
 *                 maxLength: 20
 *                 example: "0912345678"
 *               avatar_image:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: 個人資料更新成功
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
 *                   example: "成功更新個人資料"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *       400:
 *         description: 請求參數錯誤
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
 *                   example: "該暱稱已被使用"
 *       401:
 *         description: 未授權
 */
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema, ERROR_MESSAGES.VALIDATION_ERROR), authController.updateProfile)

/**
 * @swagger
 * /api/auth/profile:
 *   delete:
 *     summary: 刪除個人帳號
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 帳號成功刪除
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
 *                   example: "帳號已成功刪除"
 *       401:
 *         description: 未授權
 */
router.delete('/profile', authenticateToken, authController.deleteProfile)

export default router
