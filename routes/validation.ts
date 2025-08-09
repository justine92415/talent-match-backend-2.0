import { Router } from 'express'
import { ValidationController } from '../controllers/ValidationController'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailValidationRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: 要檢查的電子郵件地址
 *           example: "user@example.com"
 *           maxLength: 255
 *     EmailValidationResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *           example: success
 *         message:
 *           type: string
 *           example: "Email 可以使用"
 *         data:
 *           type: object
 *           properties:
 *             available:
 *               type: boolean
 *               description: Email 是否可用（true=可用，false=已被註冊）
 *               example: true
 */

/**
 * @swagger
 * /api/validation/email:
 *   post:
 *     tags:
 *       - Validation
 *     summary: Email 可用性驗證
 *     description: |
 *       檢查指定的 Email 是否已被註冊
 *
 *       **觸發時機：**
 *       - 使用者在註冊表單的 email 欄位失去焦點時（onBlur 事件）
 *       - 即時驗證，提供使用者友善的體驗
 *
 *       **業務規則：**
 *       - Email 格式：必須是有效的電子郵件格式
 *       - 長度限制：最多 255 字元
 *       - 大小寫不敏感：會自動轉換為小寫進行比較
 *       - 唯一性檢查：與資料庫中現有的 email 進行比較
 *
 *       **權限要求：**
 *       - 無需認證，公開 API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailValidationRequest'
 *           examples:
 *             valid_email:
 *               summary: 有效的 Email 格式
 *               value:
 *                 email: "user@example.com"
 *             uppercase_email:
 *               summary: 大寫 Email（會自動轉換）
 *               value:
 *                 email: "User@Example.Com"
 *     responses:
 *       200:
 *         description: 驗證成功（不論 Email 是否可用）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmailValidationResponse'
 *             examples:
 *               email_available:
 *                 summary: Email 可以使用
 *                 value:
 *                   status: success
 *                   message: "Email 可以使用"
 *                   data:
 *                     available: true
 *               email_taken:
 *                 summary: Email 已被註冊
 *                 value:
 *                   status: success
 *                   message: "Email 已被註冊"
 *                   data:
 *                     available: false
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       example: "驗證失敗"
 *             examples:
 *               invalid_format:
 *                 summary: Email 格式無效
 *                 value:
 *                   status: error
 *                   message: "驗證失敗"
 *                   errors:
 *                     email: ["請輸入有效的電子郵件格式"]
 *               missing_email:
 *                 summary: 缺少 Email 參數
 *                 value:
 *                   status: error
 *                   message: "驗證失敗"
 *                   errors:
 *                     email: ["請輸入有效的電子郵件格式"]
 *               empty_email:
 *                 summary: Email 為空
 *                 value:
 *                   status: error
 *                   message: "驗證失敗"
 *                   errors:
 *                     email: ["請輸入有效的電子郵件格式"]
 *               email_too_long:
 *                 summary: Email 過長
 *                 value:
 *                   status: error
 *                   message: "驗證失敗"
 *                   errors:
 *                     email: ["電子郵件長度不能超過255字元"]
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
router.post('/email', ValidationController.email)

export default router
