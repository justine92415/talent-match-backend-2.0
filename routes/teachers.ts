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
 *     summary: 取得教師申請狀態
 *     description: |
 *       取得當前使用者的教師申請狀態和相關資料
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *
 *       **功能說明：**
 *       - 查詢當前使用者的教師申請記錄
 *       - 回傳申請狀態、國籍、自我介紹等資訊
 *       - 如果沒有申請記錄則回傳 404
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 申請狀態查詢成功
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
 *                           $ref: '#/components/schemas/TeacherApplication'
 *             examples:
 *               success:
 *                 summary: 查詢成功
 *                 value:
 *                   status: success
 *                   message: 申請狀態查詢成功
 *                   data:
 *                     application:
 *                       id: 1
 *                       user_id: 123
 *                       nationality: "台灣"
 *                       introduction: "我是一位資深的程式設計教師，具有十年以上的教學經驗..."
 *                       application_status: "pending"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T10:00:00.000Z"
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
 *                   message: 未授權
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
router.get('/application', authenticateToken, TeachersController.getApplication)

/**
 * @swagger
 * /api/teachers/application:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新教師申請資料
 *     description: |
 *       更新教師申請的國籍和自我介紹資料
 *
 *       **業務規則：**
 *       - 只有待審核（pending）或被拒絕（rejected）的申請才能更新
 *       - 國籍和自我介紹為可選欄位，至少需要提供一個
 *       - 國籍長度限制：1-50 字
 *       - 自我介紹長度限制：100-1000 字
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 只能更新自己的申請資料
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nationality:
 *                 type: string
 *                 description: 國籍
 *                 example: "中國"
 *                 minLength: 1
 *                 maxLength: 50
 *               introduction:
 *                 type: string
 *                 description: 自我介紹
 *                 example: "更新後的自我介紹：我是一位擁有十五年教學經驗的資深講師，專精於全端開發技術，包括前端框架、後端架構設計、資料庫管理等領域。我致力於培養學生的實際開發能力和解決問題的思維。"
 *                 minLength: 100
 *                 maxLength: 1000
 *           examples:
 *             update_both:
 *               summary: 更新國籍和自我介紹
 *               value:
 *                 nationality: "中國"
 *                 introduction: "更新後的自我介紹：我是一位擁有十五年教學經驗的資深講師，專精於全端開發技術，包括前端框架、後端架構設計、資料庫管理等領域。我致力於培養學生的實際開發能力和解決問題的思維。"
 *             update_nationality_only:
 *               summary: 只更新國籍
 *               value:
 *                 nationality: "美國"
 *             update_introduction_only:
 *               summary: 只更新自我介紹
 *               value:
 *                 introduction: "更新後的自我介紹：我是一位專業的軟體開發講師，擁有豐富的實務經驗和教學熱忱。我擅長將複雜的技術概念以簡單易懂的方式傳達，幫助學生建立紮實的技術基礎。"
 *     responses:
 *       200:
 *         description: 申請資料更新成功
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
 *                           $ref: '#/components/schemas/TeacherApplication'
 *             examples:
 *               success:
 *                 summary: 更新成功
 *                 value:
 *                   status: success
 *                   message: 申請資料更新成功
 *                   data:
 *                     application:
 *                       id: 1
 *                       user_id: 123
 *                       nationality: "中國"
 *                       introduction: "更新後的自我介紹內容..."
 *                       application_status: "pending"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T10:05:00.000Z"
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
 *                     nationality: ["國籍長度不能超過 50 字"]
 *                     introduction: ["自我介紹至少需要 100 字"]
 *               no_fields:
 *                 summary: 缺少更新欄位
 *                 value:
 *                   status: error
 *                   message: 至少需要提供一個欄位進行更新
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
 *                   message: 未授權
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
 *       422:
 *         description: 申請狀態不允許更新
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               status_not_allowed:
 *                 summary: 狀態不允許更新
 *                 value:
 *                   status: error
 *                   message: 只有待審核或被拒絕的申請才能更新
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
router.put('/application', authenticateToken, TeachersController.updateApplication)

/**
 * @swagger
 * /api/teachers/resubmit:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 重新提交被拒絕的申請
 *     description: |
 *       重新提交被拒絕的教師申請，將申請狀態重設為待審核
 *
 *       **業務規則：**
 *       - 只有被拒絕（rejected）的申請才能重新提交
 *       - 重新提交後狀態會變更為待審核（pending）
 *       - 保留所有原有的申請資料
 *       - 更新 updated_at 時間戳記
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 只能重新提交自己的申請
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 申請已重新提交
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
 *                           $ref: '#/components/schemas/TeacherApplication'
 *             examples:
 *               success:
 *                 summary: 重新提交成功
 *                 value:
 *                   status: success
 *                   message: 申請已重新提交
 *                   data:
 *                     application:
 *                       id: 1
 *                       user_id: 123
 *                       nationality: "台灣"
 *                       introduction: "我是一位資深的程式設計教師..."
 *                       application_status: "pending"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T11:00:00.000Z"
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
 *                   message: 未授權
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
 *       422:
 *         description: 申請狀態不是被拒絕
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               status_not_rejected:
 *                 summary: 狀態不是被拒絕
 *                 value:
 *                   status: error
 *                   message: 只有被拒絕的申請才能重新提交
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
router.post('/resubmit', authenticateToken, TeachersController.resubmitApplication)

export default router
