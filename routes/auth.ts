import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *           example: success
 *         message:
 *           type: string
 *           example: 操作成功
 *         data:
 *           type: object
 *           description: 回傳的資料物件
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [error]
 *           example: error
 *         message:
 *           type: string
 *           example: 操作失敗
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             email: ["Email 格式不正確"]
 *             password: ["密碼長度至少 8 位"]
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [error]
 *           example: error
 *         message:
 *           type: string
 *           example: 參數驗證失敗
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 *           example:
 *             nick_name: ["暱稱為必填欄位"]
 *             email: ["Email 格式不正確"]
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 123
 *         uuid:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         nick_name:
 *           type: string
 *           example: "使用者暱稱"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         role:
 *           type: string
 *           enum: [STUDENT, TEACHER, ADMIN]
 *           example: "STUDENT"
 *         account_status:
 *           type: string
 *           enum: [ACTIVE, DEACTIVATED, PENDING]
 *           example: "ACTIVE"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-08T10:00:00.000Z"
 *     AuthToken:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refresh_token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         token_type:
 *           type: string
 *           example: "Bearer"
 *         expires_in:
 *           type: number
 *           example: 3600
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 使用者註冊
 *     description: |
 *       使用 email 和密碼註冊新帳號
 *
 *       **業務規則：**
 *       - 暱稱：必填，最多 50 字元
 *       - Email：必須唯一，有效格式，最多 255 字元
 *       - 密碼：至少 8 字元，須包含中英文字符
 *       - 預設角色：STUDENT
 *       - 預設狀態：ACTIVE
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nick_name
 *               - email
 *               - password
 *             properties:
 *               nick_name:
 *                 type: string
 *                 description: 使用者暱稱
 *                 example: "小明"
 *                 minLength: 1
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *                 example: "user@example.com"
 *                 maxLength: 255
 *               password:
 *                 type: string
 *                 description: 密碼（至少8字元，須包含中英文）
 *                 example: "Password123中文"
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: 註冊成功
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         access_token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refresh_token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         token_type:
 *                           type: string
 *                           example: "Bearer"
 *                         expires_in:
 *                           type: number
 *                           example: 3600
 *             examples:
 *               success:
 *                 summary: 註冊成功範例
 *                 value:
 *                   status: success
 *                   message: 註冊成功
 *                   data:
 *                     user:
 *                       id: 123
 *                       uuid: "550e8400-e29b-41d4-a716-446655440000"
 *                       nick_name: "小明"
 *                       email: "user@example.com"
 *                       role: "STUDENT"
 *                       account_status: "ACTIVE"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     token_type: "Bearer"
 *                     expires_in: 3600
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證失敗
 *                 value:
 *                   status: error
 *                   message: 註冊失敗
 *                   errors:
 *                     nick_name: ["暱稱為必填欄位"]
 *                     email: ["請輸入有效的電子郵件格式"]
 *                     password: ["密碼必須至少8字元且包含中英文"]
 *               missing_required:
 *                 summary: 缺少必填欄位
 *                 value:
 *                   status: error
 *                   message: 註冊失敗
 *                   errors:
 *                     email: ["請輸入有效的電子郵件格式"]
 *       409:
 *         description: Email 已被註冊
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_exists:
 *                 summary: Email 重複
 *                 value:
 *                   status: error
 *                   message: 註冊失敗
 *                   errors:
 *                     email: ["此電子郵件已被註冊"]
 *       500:
 *         description: 系統錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server_error:
 *                 summary: 系統錯誤
 *                 value:
 *                   status: error
 *                   message: 系統錯誤，請稍後再試
 */
router.post('/register', AuthController.register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 使用者登入
 *     description: |
 *       使用 email 和密碼登入系統
 *
 *       **業務規則：**
 *       - Email：有效格式的已註冊 email
 *       - 密碼：與註冊時設定的密碼一致
 *       - 帳號狀態：必須為 ACTIVE（非 DEACTIVATED）
 *       - 成功後：更新最後登入時間，回傳 JWT tokens
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
 *                 description: 註冊時使用的電子郵件
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: 註冊時設定的密碼
 *                 example: "Password123中文"
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
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         access_token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refresh_token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         token_type:
 *                           type: string
 *                           example: "Bearer"
 *                         expires_in:
 *                           type: number
 *                           example: 3600
 *             examples:
 *               success:
 *                 summary: 登入成功範例
 *                 value:
 *                   status: success
 *                   message: 登入成功
 *                   data:
 *                     user:
 *                       id: 123
 *                       uuid: "550e8400-e29b-41d4-a716-446655440000"
 *                       nick_name: "小明"
 *                       email: "user@example.com"
 *                       role: "STUDENT"
 *                       account_status: "ACTIVE"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     token_type: "Bearer"
 *                     expires_in: 3600
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證失敗
 *                 value:
 *                   status: error
 *                   message: 登入失敗
 *                   errors:
 *                     email: ["請輸入有效的電子郵件格式"]
 *                     password: ["密碼為必填欄位"]
 *               missing_required:
 *                 summary: 缺少必填欄位
 *                 value:
 *                   status: error
 *                   message: 登入失敗
 *                   errors:
 *                     email: ["請輸入有效的電子郵件格式"]
 *       401:
 *         description: 認證失敗 - Email 或密碼錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_credentials:
 *                 summary: 登入憑證錯誤
 *                 value:
 *                   status: error
 *                   message: 登入失敗
 *                   errors:
 *                     credentials: ["電子郵件或密碼錯誤"]
 *       403:
 *         description: 帳號已停用
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               account_deactivated:
 *                 summary: 帳號停用
 *                 value:
 *                   status: error
 *                   message: 帳號停用
 *                   errors:
 *                     account: ["您的帳號已被停用，請聯絡客服"]
 *       500:
 *         description: 系統錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server_error:
 *                 summary: 系統錯誤
 *                 value:
 *                   status: error
 *                   message: 系統錯誤，請稍後再試
 */
router.post('/login', AuthController.login)

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 重新整理 Token
 *     description: |
 *       使用有效的 Refresh Token 重新生成新的 Access Token 和 Refresh Token
 *
 *       **業務規則：**
 *       - Refresh Token：必須是有效且未過期的 JWT token
 *       - Token 類型：必須是 refresh 類型的 token（非 access token）
 *       - 使用者狀態：對應的使用者帳號必須為 ACTIVE 狀態
 *       - Token 輪換：每次更新會生成全新的 Access Token 和 Refresh Token
 *       - 安全性：舊的 tokens 不再有效，實現 token 輪換機制
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
 *                 description: 有效的 Refresh Token（JWT 格式）
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJ1c2VyX2lkIjoxMjMsInRva2VuX3R5cGUiOiJyZWZyZXNoIiwiaWF0IjoxNjQwOTkxNjAwLCJleHAiOjE2NDM1ODM2MDB9.example_signature"
 *     responses:
 *       200:
 *         description: Token 更新成功
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
 *                           description: 新的 Access Token（有效期 1 小時）
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token_payload.new_signature"
 *                         refresh_token:
 *                           type: string
 *                           description: 新的 Refresh Token（有效期 30 天）
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh_token_payload.new_signature"
 *                         token_type:
 *                           type: string
 *                           description: Token 類型
 *                           example: "Bearer"
 *                         expires_in:
 *                           type: number
 *                           description: Access Token 過期時間（秒）
 *                           example: 3600
 *             examples:
 *               success:
 *                 summary: Token 更新成功範例
 *                 value:
 *                   status: success
 *                   message: Token 更新成功
 *                   data:
 *                     access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_access_token"
 *                     refresh_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_refresh_token"
 *                     token_type: "Bearer"
 *                     expires_in: 3600
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               missing_token:
 *                 summary: 缺少 Refresh Token
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["Refresh Token 為必填欄位"]
 *               empty_token:
 *                 summary: Refresh Token 為空
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["Refresh Token 為必填欄位"]
 *       401:
 *         description: Refresh Token 無效或已過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_token:
 *                 summary: 無效的 Token 格式
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["無效或已過期的 Refresh Token"]
 *               expired_token:
 *                 summary: Token 已過期
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["無效或已過期的 Refresh Token"]
 *               wrong_token_type:
 *                 summary: 使用 Access Token 而非 Refresh Token
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["無效或已過期的 Refresh Token"]
 *               user_not_found:
 *                 summary: 對應使用者不存在
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["無效或已過期的 Refresh Token"]
 *               account_deactivated:
 *                 summary: 使用者帳號已停用
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["無效或已過期的 Refresh Token"]
 *               wrong_signature:
 *                 summary: JWT 簽章驗證失敗
 *                 value:
 *                   status: error
 *                   message: Token 更新失敗
 *                   errors:
 *                     refresh_token: ["無效或已過期的 Refresh Token"]
 *       500:
 *         description: 系統錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               server_error:
 *                 summary: 系統錯誤
 *                 value:
 *                   status: error
 *                   message: 系統錯誤，請稍後再試
 */
router.post('/refresh', AuthController.refresh)

export default router
