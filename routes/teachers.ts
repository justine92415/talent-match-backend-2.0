import { Router } from 'express'
import { TeachersController } from '../controllers/TeachersController'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     TeacherApplyRequest:
 *       type: object
 *       required:
 *         - nationality
 *         - introduction
 *       properties:
 *         nationality:
 *           type: string
 *           description: 國籍
 *           example: "台灣"
 *           minLength: 1
 *           maxLength: 50
 *         introduction:
 *           type: string
 *           description: 自我介紹
 *           example: "我是一位擁有5年教學經驗的專業教師，專精於數學和物理領域。在過去的教學生涯中，我致力於啟發學生的學習興趣，透過生動有趣的教學方式幫助學生理解複雜的概念。我相信每個學生都有無限的潛力，只要用對方法就能激發他們的學習動力。"
 *           minLength: 100
 *           maxLength: 1000
 *     TeacherApplicationResponse:
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
 *           example: "台灣"
 *         introduction:
 *           type: string
 *           example: "我是一位擁有5年教學經驗的專業教師..."
 *         application_status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           example: "pending"
 *         applied_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-12T10:00:00.000Z"
 *         reviewed_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
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
 *             nationality: ["國籍為必填欄位"]
 *             introduction: ["自我介紹至少需要100字元"]
 */

/**
 * @swagger
 * /api/teachers/apply:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 提交教師申請
 *     description: |
 *       提交教師申請
 *
 *       **業務規則：**
 *       - 需要登入
 *       - 每個使用者只能申請一次
 *       - 國籍：1-50字元
 *       - 自我介紹：100-1000字元
 *
 *       **權限要求：**
 *       - 需要登入
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherApplyRequest'
 *     responses:
 *       201:
 *         description: 申請提交成功
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
 *                         application:
 *                           $ref: '#/components/schemas/TeacherApplicationResponse'
 *             examples:
 *               success:
 *                 summary: 申請成功
 *                 value:
 *                   status: success
 *                   message: 教師申請提交成功
 *                   data:
 *                     application:
 *                       id: 123
 *                       user_id: 456
 *                       nationality: "台灣"
 *                       introduction: "我是一位擁有5年教學經驗的專業教師..."
 *                       application_status: "pending"
 *                       applied_at: "2025-08-12T10:00:00.000Z"
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證失敗
 *                 value:
 *                   status: error
 *                   message: 參數驗證失敗
 *                   errors:
 *                     nationality: ["國籍為必填欄位"]
 *                     introduction: ["自我介紹至少需要100字元"]
 *               empty_nationality:
 *                 summary: 國籍為空
 *                 value:
 *                   status: error
 *                   message: 參數驗證失敗
 *                   errors:
 *                     nationality: ["國籍為必填欄位"]
 *               short_introduction:
 *                 summary: 自我介紹太短
 *                 value:
 *                   status: error
 *                   message: 參數驗證失敗
 *                   errors:
 *                     introduction: ["自我介紹至少需要100字元"]
 *       401:
 *         description: 未登入
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
 *       409:
 *         description: 已有申請記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicate_application:
 *                 summary: 重複申請
 *                 value:
 *                   status: error
 *                   message: 您已提交過教師申請
 *       500:
 *         description: 伺服器內部錯誤
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
router.post('/apply', authenticateToken, TeachersController.apply)

/**
 * @swagger
 * /api/teachers/application:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 查看教師申請狀態
 *     description: |
 *       查看目前使用者的教師申請狀態
 *
 *       **業務規則：**
 *       - 需要登入
 *       - 只能查看自己的申請狀態
 *
 *       **權限要求：**
 *       - 需要登入
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
 *                         application:
 *                           $ref: '#/components/schemas/TeacherApplicationResponse'
 *             examples:
 *               pending:
 *                 summary: 申請審核中
 *                 value:
 *                   status: success
 *                   message: 查詢申請狀態成功
 *                   data:
 *                     application:
 *                       id: 123
 *                       user_id: 456
 *                       nationality: "台灣"
 *                       introduction: "我是一位擁有5年教學經驗的專業教師..."
 *                       application_status: "pending"
 *                       applied_at: "2025-08-12T10:00:00.000Z"
 *                       reviewed_at: null
 *               approved:
 *                 summary: 申請已通過
 *                 value:
 *                   status: success
 *                   message: 查詢申請狀態成功
 *                   data:
 *                     application:
 *                       id: 123
 *                       user_id: 456
 *                       nationality: "台灣"
 *                       introduction: "我是一位擁有5年教學經驗的專業教師..."
 *                       application_status: "approved"
 *                       applied_at: "2025-08-12T10:00:00.000Z"
 *                       reviewed_at: "2025-08-12T12:00:00.000Z"
 *       401:
 *         description: 未登入
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
 *         description: 找不到申請記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 無申請記錄
 *                 value:
 *                   status: error
 *                   message: 找不到申請記錄
 *       500:
 *         description: 伺服器內部錯誤
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
router.get('/application', authenticateToken, TeachersController.getApplication)

export default router
