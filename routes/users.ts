import { Router } from 'express'
import { UsersController } from '../controllers/UsersController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfileResponse:
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
 *         name:
 *           type: string
 *           nullable: true
 *           example: "王小明"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         phone:
 *           type: string
 *           nullable: true
 *           example: "0987654321"
 *         avatar_image:
 *           type: string
 *           nullable: true
 *           example: "/uploads/avatars/user-avatar.jpg"
 *         avatar_google_url:
 *           type: string
 *           nullable: true
 *           example: "https://lh3.googleusercontent.com/..."
 *         google_id:
 *           type: string
 *           nullable: true
 *           example: "google_user_id"
 *         role:
 *           type: string
 *           enum: [student, teacher, admin]
 *           example: "student"
 *         account_status:
 *           type: string
 *           enum: [active, suspended, locked, deactivated]
 *           example: "active"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-08T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-08T10:30:00.000Z"
 *         last_login_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2025-08-08T10:00:00.000Z"
 *     UpdateProfileRequest:
 *       type: object
 *       properties:
 *         nick_name:
 *           type: string
 *           description: 使用者暱稱
 *           example: "新的暱稱"
 *           minLength: 1
 *           maxLength: 50
 *         name:
 *           type: string
 *           description: 真實姓名
 *           example: "王小明"
 *           maxLength: 100
 *         phone:
 *           type: string
 *           description: 台灣手機號碼
 *           example: "0987654321"
 *           pattern: "^09\\d{8}$"
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: 取得個人資料
 *     description: |
 *       取得當前登入使用者的完整個人資料
 *
 *       **業務規則：**
 *       - 需要有效的 Access Token
 *       - 只能取得自己的個人資料
 *       - 回傳資料不包含密碼等敏感資訊
 *
 *       **權限要求：**
 *       - 需要使用者認證
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得個人資料
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
 *                           $ref: '#/components/schemas/UserProfileResponse'
 *             examples:
 *               success:
 *                 summary: 成功取得個人資料
 *                 value:
 *                   status: success
 *                   message: "取得個人資料成功"
 *                   data:
 *                     user:
 *                       id: 123
 *                       uuid: "550e8400-e29b-41d4-a716-446655440000"
 *                       nick_name: "使用者暱稱"
 *                       name: "王小明"
 *                       email: "user@example.com"
 *                       phone: "0987654321"
 *                       avatar_image: "/uploads/avatars/user-avatar.jpg"
 *                       avatar_google_url: null
 *                       google_id: null
 *                       role: "student"
 *                       account_status: "active"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T10:30:00.000Z"
 *                       last_login_at: "2025-08-08T10:00:00.000Z"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_token:
 *                 summary: 未提供 Token
 *                 value:
 *                   status: error
 *                   message: "未授權"
 *                   errors:
 *                     token: ["請提供有效的存取令牌"]
 *               invalid_token:
 *                 summary: 無效 Token
 *                 value:
 *                   status: error
 *                   message: "未授權"
 *                   errors:
 *                     token: ["無效或已過期的存取令牌"]
 *               account_deactivated:
 *                 summary: 帳號已停用
 *                 value:
 *                   status: error
 *                   message: "未授權"
 *                   errors:
 *                     account: ["您的帳號已被停用，請聯絡客服"]
 *       404:
 *         description: 使用者不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               user_not_found:
 *                 summary: 使用者不存在
 *                 value:
 *                   status: error
 *                   message: "使用者不存在"
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
 *                   message: "系統錯誤，請稍後再試"
 */
router.get('/profile', authenticateToken, UsersController.getProfile)

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     tags:
 *       - Users
 *     summary: 更新個人資料
 *     description: |
 *       更新當前登入使用者的個人資料
 *
 *       **業務規則：**
 *       - 需要有效的 Access Token
 *       - 只能更新自己的個人資料
 *       - 可選擇性更新欄位（傳入的欄位才會被更新）
 *       - 不允許更新：email、password、role、id 等敏感欄位
 *
 *       **驗證規則：**
 *       - nick_name：1-50 字元，不能為空
 *       - name：1-100 字元，可以為空
 *       - phone：台灣手機號碼格式（09xxxxxxxx），可以為空
 *
 *       **權限要求：**
 *       - 需要使用者認證
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           examples:
 *             update_all:
 *               summary: 更新所有欄位
 *               value:
 *                 nick_name: "新的暱稱"
 *                 name: "王小明"
 *                 phone: "0987654321"
 *             update_partial:
 *               summary: 部分更新
 *               value:
 *                 nick_name: "只更新暱稱"
 *             update_empty:
 *               summary: 清空某些欄位
 *               value:
 *                 name: ""
 *                 phone: ""
 *     responses:
 *       200:
 *         description: 成功更新個人資料
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
 *                           $ref: '#/components/schemas/UserProfileResponse'
 *             examples:
 *               success:
 *                 summary: 成功更新個人資料
 *                 value:
 *                   status: success
 *                   message: "個人資料更新成功"
 *                   data:
 *                     user:
 *                       id: 123
 *                       uuid: "550e8400-e29b-41d4-a716-446655440000"
 *                       nick_name: "新的暱稱"
 *                       name: "王小明"
 *                       email: "user@example.com"
 *                       phone: "0987654321"
 *                       avatar_image: "/uploads/avatars/user-avatar.jpg"
 *                       avatar_google_url: null
 *                       google_id: null
 *                       role: "student"
 *                       account_status: "active"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T11:00:00.000Z"
 *                       last_login_at: "2025-08-08T10:00:00.000Z"
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 驗證失敗
 *                 value:
 *                   status: error
 *                   message: "個人資料更新失敗"
 *                   errors:
 *                     nick_name: ["暱稱長度不能超過50字元"]
 *                     phone: ["請輸入有效的台灣手機號碼格式"]
 *               empty_nick_name:
 *                 summary: 暱稱為空
 *                 value:
 *                   status: error
 *                   message: "個人資料更新失敗"
 *                   errors:
 *                     nick_name: ["暱稱不能為空"]
 *               invalid_phone:
 *                 summary: 無效電話格式
 *                 value:
 *                   status: error
 *                   message: "個人資料更新失敗"
 *                   errors:
 *                     phone: ["請輸入有效的台灣手機號碼格式"]
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_token:
 *                 summary: 未提供 Token
 *                 value:
 *                   status: error
 *                   message: "未授權"
 *               invalid_token:
 *                 summary: 無效 Token
 *                 value:
 *                   status: error
 *                   message: "未授權"
 *       404:
 *         description: 使用者不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               user_not_found:
 *                 summary: 使用者不存在
 *                 value:
 *                   status: error
 *                   message: "使用者不存在"
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
 *                   message: "系統錯誤，請稍後再試"
 */
router.put('/profile', authenticateToken, UsersController.updateProfile)

export default router
