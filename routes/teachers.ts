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

/**
 * @swagger
 * /api/teachers/profile:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得教師基本資料
 *     description: |
 *       取得當前登入教師的基本資料
 *
 *       **功能說明：**
 *       - 查詢當前使用者的教師基本資料
 *       - 包含國籍、自我介紹、申請狀態等資訊
 *       - 如果沒有教師記錄則回傳 404
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 只能查看自己的資料
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 取得教師資料成功
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
 *                         teacher:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                               example: 1
 *                             user_id:
 *                               type: number
 *                               example: 123
 *                             nationality:
 *                               type: string
 *                               example: "台灣"
 *                             introduction:
 *                               type: string
 *                               example: "我是一位資深的程式設計教師..."
 *                             application_status:
 *                               type: string
 *                               enum: [pending, approved, rejected]
 *                               example: "pending"
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:00:00.000Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:00:00.000Z"
 *             examples:
 *               success:
 *                 summary: 查詢成功
 *                 value:
 *                   status: success
 *                   message: 取得教師資料成功
 *                   data:
 *                     teacher:
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
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 無教師記錄
 *                 value:
 *                   status: error
 *                   message: 找不到教師資料
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
router.get('/profile', authenticateToken, TeachersController.getProfile)

/**
 * @swagger
 * /api/teachers/profile:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新教師基本資料
 *     description: |
 *       更新教師的基本資料（國籍和自我介紹）
 *
 *       **業務規則：**
 *       - 國籍和自我介紹為可選欄位，允許部分更新
 *       - 國籍長度限制：1-50 字
 *       - 自我介紹長度限制：100-1000 字
 *       - 空值和無效值會被拒絕
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 只能更新自己的資料
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
 *                 example: "美國"
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
 *                 nationality: "美國"
 *                 introduction: "更新後的自我介紹：我是一位擁有十五年教學經驗的資深講師，專精於全端開發技術，包括前端框架、後端架構設計、資料庫管理等領域。我致力於培養學生的實際開發能力和解決問題的思維。"
 *             update_nationality_only:
 *               summary: 只更新國籍
 *               value:
 *                 nationality: "新加坡"
 *             update_introduction_only:
 *               summary: 只更新自我介紹
 *               value:
 *                 introduction: "更新後的自我介紹：我是一位專業的軟體開發講師，擁有豐富的實務經驗和教學熱忱。我擅長將複雜的技術概念以簡單易懂的方式傳達，幫助學生建立紮實的技術基礎。"
 *     responses:
 *       200:
 *         description: 教師資料更新成功
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
 *                         teacher:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                               example: 1
 *                             user_id:
 *                               type: number
 *                               example: 123
 *                             nationality:
 *                               type: string
 *                               example: "美國"
 *                             introduction:
 *                               type: string
 *                               example: "更新後的自我介紹內容..."
 *                             application_status:
 *                               type: string
 *                               example: "pending"
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:00:00.000Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:05:00.000Z"
 *             examples:
 *               success:
 *                 summary: 更新成功
 *                 value:
 *                   status: success
 *                   message: 教師資料更新成功
 *                   data:
 *                     teacher:
 *                       id: 1
 *                       user_id: 123
 *                       nationality: "美國"
 *                       introduction: "更新後的自我介紹內容..."
 *                       application_status: "pending"
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T10:05:00.000Z"
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
 *                     nationality: ["國籍長度不能超過 50 字"]
 *                     introduction: ["自我介紹至少需要 100 字"]
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
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 無教師記錄
 *                 value:
 *                   status: error
 *                   message: 找不到教師資料
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
router.put('/profile', authenticateToken, TeachersController.updateProfile)

/**
 * @swagger
 * /api/teachers/work-experiences:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得教師工作經驗列表
 *     description: |
 *       取得當前登入教師的工作經驗列表
 *
 *       **功能說明：**
 *       - 查詢當前使用者的所有工作經驗記錄
 *       - 依開始時間倒序排列（最新的在前）
 *       - 如果沒有教師記錄則回傳 404
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 只能查看自己的工作經驗
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 取得工作經驗列表成功
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
 *                         work_experiences:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: number
 *                                 example: 1
 *                               teacher_id:
 *                                 type: number
 *                                 example: 123
 *                               is_working:
 *                                 type: boolean
 *                                 example: false
 *                               company_name:
 *                                 type: string
 *                                 example: "ABC科技股份有限公司"
 *                               workplace:
 *                                 type: string
 *                                 example: "台北市信義區"
 *                               job_category:
 *                                 type: string
 *                                 example: "軟體開發"
 *                               job_title:
 *                                 type: string
 *                                 example: "資深軟體工程師"
 *                               start_year:
 *                                 type: number
 *                                 example: 2020
 *                               start_month:
 *                                 type: number
 *                                 example: 3
 *                               end_year:
 *                                 type: number
 *                                 nullable: true
 *                                 example: 2023
 *                               end_month:
 *                                 type: number
 *                                 nullable: true
 *                                 example: 8
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-08-08T10:00:00.000Z"
 *                               updated_at:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-08-08T10:00:00.000Z"
 *             examples:
 *               success:
 *                 summary: 查詢成功
 *                 value:
 *                   status: success
 *                   message: 取得工作經驗列表成功
 *                   data:
 *                     work_experiences:
 *                       - id: 1
 *                         teacher_id: 123
 *                         is_working: false
 *                         company_name: "ABC科技股份有限公司"
 *                         workplace: "台北市信義區"
 *                         job_category: "軟體開發"
 *                         job_title: "資深軟體工程師"
 *                         start_year: 2020
 *                         start_month: 3
 *                         end_year: 2023
 *                         end_month: 8
 *                         created_at: "2025-08-08T10:00:00.000Z"
 *                         updated_at: "2025-08-08T10:00:00.000Z"
 *                       - id: 2
 *                         teacher_id: 123
 *                         is_working: true
 *                         company_name: "XYZ教育科技"
 *                         workplace: "台北市中山區"
 *                         job_category: "教育培訓"
 *                         job_title: "資深講師"
 *                         start_year: 2023
 *                         start_month: 9
 *                         end_year: null
 *                         end_month: null
 *                         created_at: "2025-08-08T11:00:00.000Z"
 *                         updated_at: "2025-08-08T11:00:00.000Z"
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
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 無教師記錄
 *                 value:
 *                   status: error
 *                   message: 找不到教師資料
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
router.get('/work-experiences', authenticateToken, TeachersController.getWorkExperiences)

/**
 * @swagger
 * /api/teachers/work-experiences:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 新增工作經驗
 *     description: |
 *       新增教師工作經驗記錄
 *
 *       **業務規則：**
 *       - 所有欄位除 end_year/end_month 外皆為必填
 *       - is_working=true 時，end_year/end_month 會被設為 null
 *       - is_working=false 時，必須提供 end_year/end_month
 *       - 結束時間必須晚於開始時間
 *       - 年份範圍：1970-當前年份
 *       - 月份範圍：1-12
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 必須有教師記錄
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_working
 *               - company_name
 *               - workplace
 *               - job_category
 *               - job_title
 *               - start_year
 *               - start_month
 *             properties:
 *               is_working:
 *                 type: boolean
 *                 description: 是否目前仍在職
 *                 example: false
 *               company_name:
 *                 type: string
 *                 description: 公司名稱
 *                 example: "ABC科技股份有限公司"
 *                 maxLength: 200
 *               workplace:
 *                 type: string
 *                 description: 工作地點
 *                 example: "台北市信義區"
 *                 maxLength: 200
 *               job_category:
 *                 type: string
 *                 description: 工作類別
 *                 example: "軟體開發"
 *                 maxLength: 100
 *               job_title:
 *                 type: string
 *                 description: 職位名稱
 *                 example: "資深軟體工程師"
 *                 maxLength: 100
 *               start_year:
 *                 type: number
 *                 description: 開始年份
 *                 example: 2020
 *                 minimum: 1970
 *               start_month:
 *                 type: number
 *                 description: 開始月份
 *                 example: 3
 *                 minimum: 1
 *                 maximum: 12
 *               end_year:
 *                 type: number
 *                 description: 結束年份（is_working=false 時必填）
 *                 example: 2023
 *                 minimum: 1970
 *               end_month:
 *                 type: number
 *                 description: 結束月份（is_working=false 時必填）
 *                 example: 8
 *                 minimum: 1
 *                 maximum: 12
 *           examples:
 *             past_job:
 *               summary: 過去工作經驗
 *               value:
 *                 is_working: false
 *                 company_name: "ABC科技股份有限公司"
 *                 workplace: "台北市信義區"
 *                 job_category: "軟體開發"
 *                 job_title: "資深軟體工程師"
 *                 start_year: 2020
 *                 start_month: 3
 *                 end_year: 2023
 *                 end_month: 8
 *             current_job:
 *               summary: 目前工作
 *               value:
 *                 is_working: true
 *                 company_name: "XYZ教育科技"
 *                 workplace: "台北市中山區"
 *                 job_category: "教育培訓"
 *                 job_title: "資深講師"
 *                 start_year: 2023
 *                 start_month: 9
 *     responses:
 *       201:
 *         description: 工作經驗新增成功
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
 *                         work_experience:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                               example: 1
 *                             teacher_id:
 *                               type: number
 *                               example: 123
 *                             is_working:
 *                               type: boolean
 *                               example: false
 *                             company_name:
 *                               type: string
 *                               example: "ABC科技股份有限公司"
 *                             workplace:
 *                               type: string
 *                               example: "台北市信義區"
 *                             job_category:
 *                               type: string
 *                               example: "軟體開發"
 *                             job_title:
 *                               type: string
 *                               example: "資深軟體工程師"
 *                             start_year:
 *                               type: number
 *                               example: 2020
 *                             start_month:
 *                               type: number
 *                               example: 3
 *                             end_year:
 *                               type: number
 *                               nullable: true
 *                               example: 2023
 *                             end_month:
 *                               type: number
 *                               nullable: true
 *                               example: 8
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:00:00.000Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:00:00.000Z"
 *             examples:
 *               success:
 *                 summary: 新增成功
 *                 value:
 *                   status: success
 *                   message: 工作經驗新增成功
 *                   data:
 *                     work_experience:
 *                       id: 1
 *                       teacher_id: 123
 *                       is_working: false
 *                       company_name: "ABC科技股份有限公司"
 *                       workplace: "台北市信義區"
 *                       job_category: "軟體開發"
 *                       job_title: "資深軟體工程師"
 *                       start_year: 2020
 *                       start_month: 3
 *                       end_year: 2023
 *                       end_month: 8
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T10:00:00.000Z"
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
 *                     company_name: ["公司名稱為必填欄位"]
 *                     start_year: ["開始年份格式錯誤或超出合理範圍"]
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
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 無教師記錄
 *                 value:
 *                   status: error
 *                   message: 找不到教師資料
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
router.post('/work-experiences', authenticateToken, TeachersController.createWorkExperience)

/**
 * @swagger
 * /api/teachers/work-experiences/{id}:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新工作經驗
 *     description: |
 *       更新指定的工作經驗記錄
 *
 *       **業務規則：**
 *       - 支援部分更新（可只更新部分欄位）
 *       - 只能更新自己的工作經驗記錄
 *       - is_working 變更為 true 時，會自動清空 end_year/end_month
 *       - 所有驗證規則與新增時相同
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 只能更新自己的記錄
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作經驗記錄 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               is_working:
 *                 type: boolean
 *                 description: 是否目前仍在職
 *                 example: true
 *               company_name:
 *                 type: string
 *                 description: 公司名稱
 *                 example: "更新後的公司名稱"
 *                 maxLength: 200
 *               workplace:
 *                 type: string
 *                 description: 工作地點
 *                 example: "更新後的工作地點"
 *                 maxLength: 200
 *               job_category:
 *                 type: string
 *                 description: 工作類別
 *                 example: "更新後的類別"
 *                 maxLength: 100
 *               job_title:
 *                 type: string
 *                 description: 職位名稱
 *                 example: "更新後的職位"
 *                 maxLength: 100
 *               start_year:
 *                 type: number
 *                 description: 開始年份
 *                 example: 2021
 *                 minimum: 1970
 *               start_month:
 *                 type: number
 *                 description: 開始月份
 *                 example: 6
 *                 minimum: 1
 *                 maximum: 12
 *               end_year:
 *                 type: number
 *                 description: 結束年份
 *                 example: 2024
 *                 minimum: 1970
 *               end_month:
 *                 type: number
 *                 description: 結束月份
 *                 example: 12
 *                 minimum: 1
 *                 maximum: 12
 *           examples:
 *             partial_update:
 *               summary: 部分更新
 *               value:
 *                 company_name: "更新後的公司名稱"
 *                 job_title: "更新後的職位"
 *             change_to_current:
 *               summary: 改為目前在職
 *               value:
 *                 is_working: true
 *     responses:
 *       200:
 *         description: 工作經驗更新成功
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
 *                         work_experience:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                               example: 1
 *                             teacher_id:
 *                               type: number
 *                               example: 123
 *                             is_working:
 *                               type: boolean
 *                               example: true
 *                             company_name:
 *                               type: string
 *                               example: "更新後的公司名稱"
 *                             workplace:
 *                               type: string
 *                               example: "台北市信義區"
 *                             job_category:
 *                               type: string
 *                               example: "軟體開發"
 *                             job_title:
 *                               type: string
 *                               example: "更新後的職位"
 *                             start_year:
 *                               type: number
 *                               example: 2020
 *                             start_month:
 *                               type: number
 *                               example: 3
 *                             end_year:
 *                               type: number
 *                               nullable: true
 *                               example: null
 *                             end_month:
 *                               type: number
 *                               nullable: true
 *                               example: null
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:00:00.000Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-08T10:05:00.000Z"
 *             examples:
 *               success:
 *                 summary: 更新成功
 *                 value:
 *                   status: success
 *                   message: 工作經驗更新成功
 *                   data:
 *                     work_experience:
 *                       id: 1
 *                       teacher_id: 123
 *                       is_working: true
 *                       company_name: "更新後的公司名稱"
 *                       workplace: "台北市信義區"
 *                       job_category: "軟體開發"
 *                       job_title: "更新後的職位"
 *                       start_year: 2020
 *                       start_month: 3
 *                       end_year: null
 *                       end_month: null
 *                       created_at: "2025-08-08T10:00:00.000Z"
 *                       updated_at: "2025-08-08T10:05:00.000Z"
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
 *                     company_name: ["公司名稱不能為空"]
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
 *       403:
 *         description: 無權限修改此記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 無權限
 *                 value:
 *                   status: error
 *                   message: 無權限修改此工作經驗記錄
 *       404:
 *         description: 找不到工作經驗記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 記錄不存在
 *                 value:
 *                   status: error
 *                   message: 找不到工作經驗記錄
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
router.put('/work-experiences/:id', authenticateToken, TeachersController.updateWorkExperience)

/**
 * @swagger
 * /api/teachers/work-experiences/{id}:
 *   delete:
 *     tags:
 *       - Teachers
 *     summary: 刪除工作經驗
 *     description: |
 *       刪除指定的工作經驗記錄
 *
 *       **業務規則：**
 *       - 只能刪除自己的工作經驗記錄
 *       - 刪除後無法復原
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 只能刪除自己的記錄
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作經驗記錄 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 工作經驗刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 刪除成功
 *                 value:
 *                   status: success
 *                   message: 工作經驗刪除成功
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
 *       403:
 *         description: 無權限刪除此記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 無權限
 *                 value:
 *                   status: error
 *                   message: 無權限刪除此工作經驗記錄
 *       404:
 *         description: 找不到工作經驗記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 記錄不存在
 *                 value:
 *                   status: error
 *                   message: 找不到工作經驗記錄
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
router.delete('/work-experiences/:id', authenticateToken, TeachersController.deleteWorkExperience)

export default router
