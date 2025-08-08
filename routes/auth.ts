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

export default router
