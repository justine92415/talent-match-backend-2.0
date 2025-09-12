import { Router } from 'express'
import { authController } from '@controllers/AuthController'
import { authenticateToken } from '@middleware/auth'
import { validateRequest } from '@middleware/schemas/core'
import { 
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '@middleware/schemas/auth/loginSchemas'
import { updateProfileSchema } from '@middleware/schemas/user/profileSchemas'
import { ERROR_MESSAGES } from '@constants/Message'

const router = Router()


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 使用者註冊
 *     description: |
 *       註冊新的使用者帳戶，成功後自動登入並回傳 JWT Token。
 *       
 *       **業務邏輯**：
 *       - 驗證請求參數
 *       - 檢查 email 是否已存在
 *       - 檢查暱稱是否已存在  
 *       - 建立新使用者（預設為學生角色）
 *       - 自動生成並回傳 JWT Token
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
 *               $ref: '#/components/schemas/RegisterSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或資料衝突
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/RegisterValidationErrorResponse'
 *                 - $ref: '#/components/schemas/RegisterBusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
  '/register',
  validateRequest(registerSchema, ERROR_MESSAGES.BUSINESS.REGISTRATION_FAILED), // 參數驗證
  authController.register // 業務邏輯
)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 使用者登入
 *     description: |
 *       使用電子郵件和密碼登入系統，成功後回傳 JWT Token。
 *       
 *       **業務邏輯**：
 *       - 驗證請求參數
 *       - 檢查使用者是否存在
 *       - 檢查帳號狀態是否為啟用
 *       - 驗證密碼正確性
 *       - 更新最後登入時間
 *       - 生成並回傳 JWT Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: 登入成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或登入失敗
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/LoginValidationErrorResponse'
 *                 - $ref: '#/components/schemas/LoginBusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
  '/login',
  validateRequest(loginSchema, ERROR_MESSAGES.BUSINESS.LOGIN_FAILED), // 參數驗證
  authController.login // 業務邏輯
)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 刷新 JWT Token
 *     description: |
 *       使用 Refresh Token 獲取新的 Access Token，延長使用者登入狀態。
 *       
 *       **業務邏輯**：
 *       - 驗證請求參數
 *       - 驗證 Refresh Token 有效性和類型
 *       - 檢查使用者是否存在且帳號狀態為啟用
 *       - 生成新的 Access Token 和 Refresh Token
 *       - 回傳新的 Token 和使用者資料
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token 刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshTokenSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或 Token 無效
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/RefreshTokenValidationErrorResponse'
 *                 - $ref: '#/components/schemas/RefreshTokenBusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
  '/refresh',
  validateRequest(refreshTokenSchema, ERROR_MESSAGES.SYSTEM.VALIDATION_ERROR), // 參數驗證
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
 *       發送重設密碼郵件到使用者的電子郵件地址。
 *       
 *       **業務邏輯**：
 *       - 驗證請求參數
 *       - 查詢使用者是否存在
 *       - 檢查帳號狀態是否為啟用
 *       - 生成重設密碼 Token
 *       - 發送重設密碼郵件
 *       
 *       **安全考量**：無論使用者是否存在，都回傳相同的成功訊息，避免洩露系統中的電子郵件地址。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: 重設密碼郵件已發送（無論使用者是否存在）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForgotPasswordValidationErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
  '/forgot-password',
  validateRequest(forgotPasswordSchema, ERROR_MESSAGES.SYSTEM.VALIDATION_ERROR), // 參數驗證
  authController.forgotPassword // 業務邏輯
)

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 重設密碼
 *     description: |
 *       使用重設密碼 Token 更新使用者密碼。
 *       
 *       **業務邏輯**：
 *       - 驗證請求參數
 *       - 查詢擁有此重設 Token 的使用者
 *       - 檢查 Token 是否已過期
 *       - 檢查帳號狀態是否為啟用
 *       - 加密並更新新密碼
 *       - 清除重設 Token 和過期時間
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: 密碼重設成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResetPasswordSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或 Token 無效
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ResetPasswordValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ResetPasswordBusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/reset-password', validateRequest(resetPasswordSchema, ERROR_MESSAGES.SYSTEM.VALIDATION_ERROR), authController.resetPassword)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: 取得使用者個人資料
 *     description: |
 *       取得當前已認證使用者的完整個人資料。
 * 
 *       **業務邏輯:**
 *       - 需要有效的 JWT Access Token
 *       - 僅返回當前認證使用者的資料
 *       - 不包含敏感資訊（密碼、重設令牌等）
 *       - 包含使用者角色資訊和帳號狀態
 * 
 *       **資料完整性:**
 *       - 返回最新的使用者資料
 *       - 包含所有關聯的角色資訊
 *       - 顯示帳號狀態和最後登入時間
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得個人資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetProfileResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 使用者不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/profile', authenticateToken, authController.getProfile)

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     tags: [Authentication]
 *     summary: 更新使用者個人資料
 *     description: |
 *       更新當前已認證使用者的個人資料，支援部分更新。
 * 
 *       **業務邏輯:**
 *       - 需要有效的 JWT Access Token
 *       - 支援部分更新，所有欄位皆為選填
 *       - 暱稱更新時會檢查唯一性
 *       - 自動驗證資料格式和長度限制
 * 
 *       **支援更新欄位:**
 *       - `nick_name`: 暱稱 (1-50字元，需唯一)
 *       - `name`: 真實姓名 (最大100字元)
 *       - `birthday`: 生日 (YYYY-MM-DD格式，可傳入空字串清空)
 *       - `contact_phone`: 聯絡電話 (最大20字元)
 *       - `avatar_image`: 大頭貼網址 (需為有效URL)
 * 
 *       **驗證規則:**
 *       - 暱稱不能為空且需唯一
 *       - 生日可為有效日期、空字串(清空)或null
 *       - 電話號碼僅支援數字、+、-、空格、括號
 *       - 大頭貼需為有效的URL格式
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: 要更新的個人資料 (支援部分更新)
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             完整更新:
 *               summary: 更新所有欄位
 *               value:
 *                 nick_name: "john_doe_2024"
 *                 name: "張小明"
 *                 birthday: "1990-01-15"
 *                 contact_phone: "+886-912-345-678"
 *                 avatar_image: "https://example.com/avatar.jpg"
 *             部分更新:
 *               summary: 僅更新暱稱和電話
 *               value:
 *                 nick_name: "new_nickname"
 *                 contact_phone: "0912-345-678"
 *             清空選填欄位:
 *               summary: 將某些欄位設為空值
 *               value:
 *                 name: null
 *                 birthday: ""
 *                 contact_phone: ""
 *                 avatar_image: null
 *     responses:
 *       200:
 *         description: 個人資料更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateProfileResponse'
 *       400:
 *         description: 資料驗證失敗或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/UpdateProfileValidationError'
 *                 - $ref: '#/components/schemas/UpdateProfileBusinessError'
 *             examples:
 *               資料驗證失敗:
 *                 summary: 欄位格式不正確
 *                 value:
 *                   status: "error"
 *                   message: "資料驗證失敗"
 *                   details:
 *                     - field: "nick_name"
 *                       message: "暱稱長度不能超過50個字元"
 *                     - field: "contact_phone"
 *                       message: "聯絡電話格式不正確"
 *               暱稱重複:
 *                 summary: 暱稱已被其他使用者使用
 *                 value:
 *                   status: "error"
 *                   message: "暱稱已存在"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 使用者不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.put('/profile', authenticateToken, validateRequest(updateProfileSchema, ERROR_MESSAGES.SYSTEM.VALIDATION_ERROR), authController.updateProfile)

/**
 * @swagger
 * /api/auth/profile:
 *   delete:
 *     tags: [Authentication]
 *     summary: 刪除使用者帳號
 *     description: |
 *       軟刪除當前已認證使用者的帳號，保留資料以供稽核和復原。
 * 
 *       **軟刪除機制:**
 *       - 使用 TypeORM 的軟刪除功能
 *       - 設定 `deleted_at` 時間戳記而非實際刪除資料
 *       - 保留歷史資料完整性
 *       - 支援未來的資料復原需求
 * 
 *       **刪除後效果:**
 *       - 使用者無法再登入系統
 *       - 暱稱和email可供新使用者註冊使用
 *       - 歷史記錄和關聯資料保持完整
 *       - 相關的教師/學生記錄狀態會相應調整
 * 
 *       **安全考量:**
 *       - 需要有效的 JWT Access Token
 *       - 僅能刪除當前認證使用者的帳號
 *       - 操作不可逆，請謹慎使用
 *       - 建議在前端實作二次確認機制
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 帳號刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteProfileResponse'
 *             example:
 *               status: "success"
 *               message: "帳號已成功刪除"
 *               data: null
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 使用者不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.delete('/profile', authenticateToken, authController.deleteProfile)

export default router
