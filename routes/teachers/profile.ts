import { Router } from 'express'
import { TeacherProfileController } from '../../controllers/teachers/TeacherProfileController'
import { authenticateToken } from '../../middleware/auth'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     TeacherProfileUpdateRequest:
 *       type: object
 *       properties:
 *         teacher_data:
 *           type: object
 *           properties:
 *             nationality:
 *               type: string
 *               description: 國籍
 *               example: "中華民國"
 *               maxLength: 50
 *             introduction:
 *               type: string
 *               description: 個人介紹
 *               example: "我是一位專業的程式設計教師..."
 *               maxLength: 1000
 *         user_data:
 *           type: object
 *           properties:
 *             nick_name:
 *               type: string
 *               description: 暱稱
 *               example: "Alex老師"
 *               maxLength: 50
 *             contact_phone:
 *               type: string
 *               description: 聯絡電話
 *               example: "0912345678"
 *               maxLength: 20
 *     TeacherProfileResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 123
 *         user_id:
 *           type: number
 *           example: 456
 *         nationality:
 *           type: string
 *           example: "中華民國"
 *         introduction:
 *           type: string
 *           example: "我是一位專業的程式設計教師..."
 *         application_status:
 *           type: string
 *           example: "approved"
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *               example: 456
 *             nick_name:
 *               type: string
 *               example: "Alex老師"
 *             email:
 *               type: string
 *               example: "alex@example.com"
 *             contact_phone:
 *               type: string
 *               example: "0912345678"
 *             avatar_image:
 *               type: string
 *               example: "/uploads/avatars/user_456.jpg"
 *             avatar_google_url:
 *               type: string
 *               example: "https://lh3.googleusercontent.com/..."
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-08T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-08T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/teachers/profile:
 *   get:
 *     tags:
 *       - 教師資料管理
 *     summary: 查看教師基本資料
 *     description: |
 *       查看當前教師的基本資料，包含教師資料和使用者資料
 *
 *       **業務規則：**
 *       - 只能查看自己的基本資料
 *       - 包含教師專屬欄位和使用者基本資料
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 查詢成功
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
 *                         profile:
 *                           $ref: '#/components/schemas/TeacherProfileResponse'
 *             examples:
 *               success:
 *                 summary: 成功取得教師基本資料
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     profile:
 *                       id: 123
 *                       user_id: 456
 *                       nationality: "中華民國"
 *                       introduction: "我是一位專業的程式設計教師，具有5年以上的教學經驗..."
 *                       application_status: "approved"
 *                       user:
 *                         id: 456
 *                         nick_name: "Alex老師"
 *                         email: "alex@example.com"
 *                         contact_phone: "0912345678"
 *                         avatar_image: "/uploads/avatars/user_456.jpg"
 *                         avatar_google_url: null
 *                       created_at: "2025-01-08T10:00:00.000Z"
 *                       updated_at: "2025-01-08T10:00:00.000Z"
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 未登入
 *                 value:
 *                   status: error
 *                   message: 請先登入
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 教師資料不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的教師資料
 */
router.get('/', authenticateToken, TeacherProfileController.getProfile)

/**
 * @swagger
 * /api/teachers/profile:
 *   put:
 *     tags:
 *       - 教師資料管理
 *     summary: 更新教師基本資料
 *     description: |
 *       更新教師基本資料，可分別更新教師資料和使用者資料
 *
 *       **業務規則：**
 *       - 只能更新自己的基本資料
 *       - 可以只更新部分欄位
 *       - 教師資料和使用者資料可以分別更新
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherProfileUpdateRequest'
 *           examples:
 *             update_teacher_data:
 *               summary: 只更新教師資料
 *               value:
 *                 teacher_data:
 *                   nationality: "中華民國"
 *                   introduction: "我是一位專業的程式設計教師，具有10年以上的教學經驗..."
 *             update_user_data:
 *               summary: 只更新使用者資料
 *               value:
 *                 user_data:
 *                   nick_name: "Alex資深老師"
 *                   contact_phone: "0987654321"
 *             update_both:
 *               summary: 同時更新教師和使用者資料
 *               value:
 *                 teacher_data:
 *                   nationality: "中華民國"
 *                   introduction: "更新後的個人介紹..."
 *                 user_data:
 *                   nick_name: "Alex老師"
 *                   contact_phone: "0912345678"
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                         profile:
 *                           $ref: '#/components/schemas/TeacherProfileResponse'
 *             examples:
 *               success:
 *                 summary: 成功更新教師基本資料
 *                 value:
 *                   status: success
 *                   message: 更新個人資料成功
 *                   data:
 *                     profile:
 *                       id: 123
 *                       user_id: 456
 *                       nationality: "中華民國"
 *                       introduction: "更新後的個人介紹..."
 *                       application_status: "approved"
 *                       user:
 *                         id: 456
 *                         nick_name: "Alex老師"
 *                         email: "alex@example.com"
 *                         contact_phone: "0987654321"
 *                         avatar_image: "/uploads/avatars/user_456.jpg"
 *                         avatar_google_url: null
 *                       created_at: "2025-01-08T10:00:00.000Z"
 *                       updated_at: "2025-01-08T15:30:00.000Z"
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
 *                   message: 參數驗證失敗
 *                   errors:
 *                     "teacher_data.introduction": ["個人介紹不得超過1000字"]
 *                     "user_data.nick_name": ["暱稱不得超過50字"]
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/', authenticateToken, TeacherProfileController.updateProfile)

export default router
