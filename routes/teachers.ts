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
 *             email: ["Email 格式不正確"]
 *             password: ["密碼長度至少 8 位"]
 *     TeacherLearningExperienceRequest:
 *       type: object
 *       required:
 *         - is_in_school
 *         - degree
 *         - school_name
 *         - department
 *         - region
 *         - start_year
 *         - start_month
 *       properties:
 *         is_in_school:
 *           type: boolean
 *           description: 是否仍在學
 *           example: false
 *         degree:
 *           type: string
 *           description: 學位
 *           example: "學士"
 *           minLength: 1
 *           maxLength: 50
 *         school_name:
 *           type: string
 *           description: 學校名稱
 *           example: "台灣大學"
 *           minLength: 1
 *           maxLength: 200
 *         department:
 *           type: string
 *           description: 科系
 *           example: "資訊工程學系"
 *           minLength: 1
 *           maxLength: 200
 *         region:
 *           type: boolean
 *           description: 地區 (true=台灣, false=海外)
 *           example: true
 *         start_year:
 *           type: integer
 *           description: 開始年份
 *           example: 2010
 *           minimum: 1900
 *           maximum: 2050
 *         start_month:
 *           type: integer
 *           description: 開始月份
 *           example: 9
 *           minimum: 1
 *           maximum: 12
 *         end_year:
 *           type: integer
 *           nullable: true
 *           description: 結束年份 (在學中時可為空)
 *           example: 2014
 *           minimum: 1900
 *           maximum: 2050
 *         end_month:
 *           type: integer
 *           nullable: true
 *           description: 結束月份 (在學中時可為空)
 *           example: 6
 *           minimum: 1
 *           maximum: 12
 *         file_path:
 *           type: string
 *           nullable: true
 *           description: 學歷證明檔案路徑
 *           example: "uploads/certificates/degree.pdf"
 *     TeacherLearningExperienceUpdateRequest:
 *       type: object
 *       properties:
 *         is_in_school:
 *           type: boolean
 *           description: 是否仍在學
 *           example: false
 *         degree:
 *           type: string
 *           description: 學位
 *           example: "碩士"
 *           minLength: 1
 *           maxLength: 50
 *         school_name:
 *           type: string
 *           description: 學校名稱
 *           example: "政治大學"
 *           minLength: 1
 *           maxLength: 200
 *         department:
 *           type: string
 *           description: 科系
 *           example: "企業管理學系"
 *           minLength: 1
 *           maxLength: 200
 *         region:
 *           type: boolean
 *           description: 地區 (true=台灣, false=海外)
 *           example: true
 *         start_year:
 *           type: integer
 *           description: 開始年份
 *           example: 2014
 *           minimum: 1900
 *           maximum: 2050
 *         start_month:
 *           type: integer
 *           description: 開始月份
 *           example: 9
 *           minimum: 1
 *           maximum: 12
 *         end_year:
 *           type: integer
 *           nullable: true
 *           description: 結束年份
 *           example: 2016
 *           minimum: 1900
 *           maximum: 2050
 *         end_month:
 *           type: integer
 *           nullable: true
 *           description: 結束月份
 *           example: 6
 *           minimum: 1
 *           maximum: 12
 *         file_path:
 *           type: string
 *           nullable: true
 *           description: 學歷證明檔案路徑
 *           example: "uploads/certificates/master_degree.pdf"
 *     TeacherLearningExperience:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 學習經歷ID
 *           example: 1
 *         teacher_id:
 *           type: integer
 *           description: 教師ID
 *           example: 123
 *         is_in_school:
 *           type: boolean
 *           description: 是否仍在學
 *           example: false
 *         degree:
 *           type: string
 *           description: 學位
 *           example: "學士"
 *         school_name:
 *           type: string
 *           description: 學校名稱
 *           example: "台灣大學"
 *         department:
 *           type: string
 *           description: 科系
 *           example: "資訊工程學系"
 *         region:
 *           type: boolean
 *           description: 地區 (true=台灣, false=海外)
 *           example: true
 *         start_year:
 *           type: integer
 *           description: 開始年份
 *           example: 2010
 *         start_month:
 *           type: integer
 *           description: 開始月份
 *           example: 9
 *         end_year:
 *           type: integer
 *           nullable: true
 *           description: 結束年份
 *           example: 2014
 *         end_month:
 *           type: integer
 *           nullable: true
 *           description: 結束月份
 *           example: 6
 *         file_path:
 *           type: string
 *           nullable: true
 *           description: 學歷證明檔案路徑
 *           example: "uploads/certificates/degree.pdf"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *           example: "2025-08-12T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 *           example: "2025-08-12T10:00:00.000Z"
 *     TeacherAvailableSlot:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: 時段ID
 *           example: 1
 *         teacher_id:
 *           type: number
 *           description: 教師ID
 *           example: 1
 *         weekday:
 *           type: number
 *           description: 星期 (0=週日, 1=週一, ..., 6=週六)
 *           minimum: 0
 *           maximum: 6
 *           example: 1
 *         start_time:
 *           type: string
 *           description: 開始時間 (HH:MM 格式)
 *           pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *           example: "09:00"
 *         end_time:
 *           type: string
 *           description: 結束時間 (HH:MM 格式)
 *           pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *           example: "17:00"
 *         is_active:
 *           type: boolean
 *           description: 是否啟用
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *           example: "2025-08-13T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 *           example: "2025-08-13T10:00:00.000Z"
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

/**
 * @swagger
 * /api/teachers/learning-experiences:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得學習經歷列表
 *     description: |
 *       取得教師的學習經歷列表
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 僅能查看自己的學習經歷
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 取得學習經歷列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 取得學習經歷列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     learning_experiences:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TeacherLearningExperience'
 *             examples:
 *               success:
 *                 summary: 成功取得學習經歷列表
 *                 value:
 *                   status: success
 *                   message: 取得學習經歷列表成功
 *                   data:
 *                     learning_experiences:
 *                       - id: 1
 *                         teacher_id: 123
 *                         is_in_school: false
 *                         degree: 學士
 *                         school_name: 台灣大學
 *                         department: 資訊工程學系
 *                         region: true
 *                         start_year: 2010
 *                         start_month: 9
 *                         end_year: 2014
 *                         end_month: 6
 *                         file_path: uploads/certificates/degree.pdf
 *                         created_at: "2025-08-12T10:00:00.000Z"
 *                         updated_at: "2025-08-12T10:00:00.000Z"
 *               empty_list:
 *                 summary: 空的學習經歷列表
 *                 value:
 *                   status: success
 *                   message: 取得學習經歷列表成功
 *                   data:
 *                     learning_experiences: []
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
router.get('/learning-experiences', authenticateToken, TeachersController.getLearningExperiences)

/**
 * @swagger
 * /api/teachers/learning-experiences:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 新增學習經歷
 *     description: |
 *       新增教師的學習經歷記錄
 *
 *       **業務規則：**
 *       - 非在學狀態必須提供結束時間
 *       - 結束時間不能早於開始時間
 *       - 學位、學校名稱、科系為必填欄位
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 僅能新增自己的學習經歷
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherLearningExperienceRequest'
 *           examples:
 *             graduated:
 *               summary: 已畢業的學習經歷
 *               value:
 *                 is_in_school: false
 *                 degree: 碩士
 *                 school_name: 政治大學
 *                 department: 企業管理學系
 *                 region: true
 *                 start_year: 2014
 *                 start_month: 9
 *                 end_year: 2016
 *                 end_month: 6
 *                 file_path: uploads/certificates/master_degree.pdf
 *             current_student:
 *               summary: 在學中的學習經歷
 *               value:
 *                 is_in_school: true
 *                 degree: 博士
 *                 school_name: 清華大學
 *                 department: 電機工程學系
 *                 region: true
 *                 start_year: 2020
 *                 start_month: 9
 *     responses:
 *       201:
 *         description: 新增學習經歷成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 新增學習經歷成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     learning_experience:
 *                       $ref: '#/components/schemas/TeacherLearningExperience'
 *             examples:
 *               success:
 *                 summary: 成功新增學習經歷
 *                 value:
 *                   status: success
 *                   message: 新增學習經歷成功
 *                   data:
 *                     learning_experience:
 *                       id: 1
 *                       teacher_id: 123
 *                       is_in_school: false
 *                       degree: 碩士
 *                       school_name: 政治大學
 *                       department: 企業管理學系
 *                       region: true
 *                       start_year: 2014
 *                       start_month: 9
 *                       end_year: 2016
 *                       end_month: 6
 *                       file_path: uploads/certificates/master_degree.pdf
 *                       created_at: "2025-08-12T10:00:00.000Z"
 *                       updated_at: "2025-08-12T10:00:00.000Z"
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
 *                     degree: ["學位為必填欄位"]
 *                     school_name: ["學校名稱為必填欄位"]
 *                     department: ["科系為必填欄位"]
 *               business_rule_error:
 *                 summary: 業務規則錯誤
 *                 value:
 *                   status: error
 *                   message: 非在學狀態必須提供結束時間
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
router.post('/learning-experiences', authenticateToken, TeachersController.createLearningExperience)

/**
 * @swagger
 * /api/teachers/learning-experiences/{id}:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新學習經歷
 *     description: |
 *       更新教師的學習經歷記錄
 *
 *       **業務規則：**
 *       - 只能更新自己的學習經歷
 *       - 可以部分更新欄位
 *       - 時間驗證規則與新增相同
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 僅能更新自己的學習經歷
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 學習經歷ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherLearningExperienceUpdateRequest'
 *           examples:
 *             partial_update:
 *               summary: 部分更新
 *               value:
 *                 degree: 碩士
 *                 school_name: 政治大學
 *                 end_year: 2016
 *                 end_month: 6
 *             full_update:
 *               summary: 完整更新
 *               value:
 *                 is_in_school: false
 *                 degree: 碩士
 *                 school_name: 台灣科技大學
 *                 department: 資訊管理學系
 *                 region: true
 *                 start_year: 2015
 *                 start_month: 9
 *                 end_year: 2017
 *                 end_month: 6
 *                 file_path: uploads/certificates/updated_degree.pdf
 *     responses:
 *       200:
 *         description: 更新學習經歷成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 更新學習經歷成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     learning_experience:
 *                       $ref: '#/components/schemas/TeacherLearningExperience'
 *             examples:
 *               success:
 *                 summary: 成功更新學習經歷
 *                 value:
 *                   status: success
 *                   message: 更新學習經歷成功
 *                   data:
 *                     learning_experience:
 *                       id: 1
 *                       teacher_id: 123
 *                       is_in_school: false
 *                       degree: 碩士
 *                       school_name: 政治大學
 *                       department: 企業管理學系
 *                       region: true
 *                       start_year: 2014
 *                       start_month: 9
 *                       end_year: 2016
 *                       end_month: 6
 *                       file_path: uploads/certificates/master_degree.pdf
 *                       created_at: "2025-08-12T10:00:00.000Z"
 *                       updated_at: "2025-08-12T10:05:00.000Z"
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
 *                     degree: ["學位不能為空"]
 *                     end_year: ["結束年份必須為有效的年份"]
 *               invalid_id:
 *                 summary: 無效的ID
 *                 value:
 *                   status: error
 *                   message: 無效的學習經歷ID
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
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 權限不足
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法修改此學習經歷
 *       404:
 *         description: 學習經歷不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 學習經歷不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的學習經歷
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
router.put('/learning-experiences/:id', authenticateToken, TeachersController.updateLearningExperience)

/**
 * @swagger
 * /api/teachers/learning-experiences/{id}:
 *   delete:
 *     tags:
 *       - Teachers
 *     summary: 刪除學習經歷
 *     description: |
 *       刪除教師的學習經歷記錄
 *
 *       **業務規則：**
 *       - 只能刪除自己的學習經歷
 *       - 刪除後無法復原
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 僅能刪除自己的學習經歷
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 學習經歷ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 刪除學習經歷成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 刪除學習經歷成功
 *             examples:
 *               success:
 *                 summary: 成功刪除學習經歷
 *                 value:
 *                   status: success
 *                   message: 刪除學習經歷成功
 *       400:
 *         description: 參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_id:
 *                 summary: 無效的ID
 *                 value:
 *                   status: error
 *                   message: 無效的學習經歷ID
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
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 權限不足
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法刪除此學習經歷
 *       404:
 *         description: 學習經歷不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 學習經歷不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的學習經歷
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
router.delete('/learning-experiences/:id', authenticateToken, TeachersController.deleteLearningExperience)

// === 證書管理相關路由 ===

/**
 * @swagger
 * /api/teachers/certificates:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得教師證書列表
 *     description: |
 *       取得當前教師的所有證書列表
 *
 *       **業務規則：**
 *       - 僅已登入的教師可以查看自己的證書
 *       - 證書按建立時間降序排列（最新的在前）
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
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
 *                         certificates:
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
 *                               verifying_institution:
 *                                 type: string
 *                                 example: "行政院勞動部"
 *                               license_name:
 *                                 type: string
 *                                 example: "丙級電腦軟體應用技術士"
 *                               holder_name:
 *                                 type: string
 *                                 example: "王小明"
 *                               license_number:
 *                                 type: string
 *                                 example: "123-456789"
 *                               file_path:
 *                                 type: string
 *                                 example: "uploads/certificates/software_cert.pdf"
 *                               category_id:
 *                                 type: string
 *                                 example: "tech"
 *                               subject:
 *                                 type: string
 *                                 example: "程式設計"
 *                               created_at:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-08-13T10:00:00.000Z"
 *                               updated_at:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-08-13T10:00:00.000Z"
 *             examples:
 *               success_with_data:
 *                 summary: 有證書資料
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     certificates:
 *                       - id: 1
 *                         teacher_id: 123
 *                         verifying_institution: "行政院勞動部"
 *                         license_name: "丙級電腦軟體應用技術士"
 *                         holder_name: "王小明"
 *                         license_number: "123-456789"
 *                         file_path: "uploads/certificates/software_cert.pdf"
 *                         category_id: "tech"
 *                         subject: "程式設計"
 *                         created_at: "2025-08-13T10:00:00.000Z"
 *                         updated_at: "2025-08-13T10:00:00.000Z"
 *               success_empty:
 *                 summary: 無證書資料
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     certificates: []
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
router.get('/certificates', authenticateToken, TeachersController.getCertificates)

/**
 * @swagger
 * /api/teachers/certificates:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 建立新證書
 *     description: |
 *       為當前教師建立新的證書記錄
 *
 *       **業務規則：**
 *       - 所有欄位都是必填的
 *       - 發證機構和證書名稱最長200字
 *       - 持有人姓名、證書編號、證書主題最長100字
 *       - 證書類別最長50字
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verifying_institution
 *               - license_name
 *               - holder_name
 *               - license_number
 *               - file_path
 *               - category_id
 *               - subject
 *             properties:
 *               verifying_institution:
 *                 type: string
 *                 description: 發證機構
 *                 example: "行政院勞動部"
 *                 minLength: 1
 *                 maxLength: 200
 *               license_name:
 *                 type: string
 *                 description: 證書名稱
 *                 example: "丙級電腦軟體應用技術士"
 *                 minLength: 1
 *                 maxLength: 200
 *               holder_name:
 *                 type: string
 *                 description: 證書持有人姓名
 *                 example: "王小明"
 *                 minLength: 1
 *                 maxLength: 100
 *               license_number:
 *                 type: string
 *                 description: 證書編號
 *                 example: "123-456789"
 *                 minLength: 1
 *                 maxLength: 100
 *               file_path:
 *                 type: string
 *                 description: 證書檔案路徑
 *                 example: "uploads/certificates/software_cert.pdf"
 *               category_id:
 *                 type: string
 *                 description: 證書類別ID
 *                 example: "tech"
 *                 minLength: 1
 *                 maxLength: 50
 *               subject:
 *                 type: string
 *                 description: 證書主題
 *                 example: "程式設計"
 *                 minLength: 1
 *                 maxLength: 100
 *     responses:
 *       201:
 *         description: 建立成功
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
 *                         certificate:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                               example: 1
 *                             teacher_id:
 *                               type: number
 *                               example: 123
 *                             verifying_institution:
 *                               type: string
 *                               example: "行政院勞動部"
 *                             license_name:
 *                               type: string
 *                               example: "丙級電腦軟體應用技術士"
 *                             holder_name:
 *                               type: string
 *                               example: "王小明"
 *                             license_number:
 *                               type: string
 *                               example: "123-456789"
 *                             file_path:
 *                               type: string
 *                               example: "uploads/certificates/software_cert.pdf"
 *                             category_id:
 *                               type: string
 *                               example: "tech"
 *                             subject:
 *                               type: string
 *                               example: "程式設計"
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-13T10:00:00.000Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-13T10:00:00.000Z"
 *             examples:
 *               success:
 *                 summary: 建立成功
 *                 value:
 *                   status: success
 *                   message: 建立證書成功
 *                   data:
 *                     certificate:
 *                       id: 1
 *                       teacher_id: 123
 *                       verifying_institution: "行政院勞動部"
 *                       license_name: "丙級電腦軟體應用技術士"
 *                       holder_name: "王小明"
 *                       license_number: "123-456789"
 *                       file_path: "uploads/certificates/software_cert.pdf"
 *                       category_id: "tech"
 *                       subject: "程式設計"
 *                       created_at: "2025-08-13T10:00:00.000Z"
 *                       updated_at: "2025-08-13T10:00:00.000Z"
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
 *                     verifying_institution: ["發證機構為必填欄位"]
 *                     license_name: ["證書名稱為必填欄位"]
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
router.post('/certificates', authenticateToken, TeachersController.createCertificate)

/**
 * @swagger
 * /api/teachers/certificates/{id}:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新證書資訊
 *     description: |
 *       更新指定的證書資訊
 *
 *       **業務規則：**
 *       - 只能更新自己的證書
 *       - 支援部分欄位更新
 *       - 至少需要提供一個要更新的欄位
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 僅證書擁有者可以更新
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 證書ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verifying_institution:
 *                 type: string
 *                 description: 發證機構
 *                 example: "新發證機構"
 *                 maxLength: 200
 *               license_name:
 *                 type: string
 *                 description: 證書名稱
 *                 example: "更新後證書名稱"
 *                 maxLength: 200
 *               holder_name:
 *                 type: string
 *                 description: 證書持有人姓名
 *                 example: "更新後姓名"
 *                 maxLength: 100
 *               license_number:
 *                 type: string
 *                 description: 證書編號
 *                 example: "NEW-123456"
 *                 maxLength: 100
 *               file_path:
 *                 type: string
 *                 description: 證書檔案路徑
 *                 example: "uploads/certificates/new_cert.pdf"
 *               category_id:
 *                 type: string
 *                 description: 證書類別ID
 *                 example: "new_category"
 *                 maxLength: 50
 *               subject:
 *                 type: string
 *                 description: 證書主題
 *                 example: "新主題"
 *                 maxLength: 100
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
 *                         certificate:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: number
 *                               example: 1
 *                             teacher_id:
 *                               type: number
 *                               example: 123
 *                             verifying_institution:
 *                               type: string
 *                               example: "新發證機構"
 *                             license_name:
 *                               type: string
 *                               example: "更新後證書名稱"
 *                             holder_name:
 *                               type: string
 *                               example: "更新後姓名"
 *                             license_number:
 *                               type: string
 *                               example: "NEW-123456"
 *                             file_path:
 *                               type: string
 *                               example: "uploads/certificates/new_cert.pdf"
 *                             category_id:
 *                               type: string
 *                               example: "new_category"
 *                             subject:
 *                               type: string
 *                               example: "新主題"
 *                             created_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-13T10:00:00.000Z"
 *                             updated_at:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-08-13T10:30:00.000Z"
 *             examples:
 *               success:
 *                 summary: 更新成功
 *                 value:
 *                   status: success
 *                   message: 更新證書成功
 *                   data:
 *                     certificate:
 *                       id: 1
 *                       teacher_id: 123
 *                       verifying_institution: "新發證機構"
 *                       license_name: "更新後證書名稱"
 *                       holder_name: "更新後姓名"
 *                       license_number: "NEW-123456"
 *                       file_path: "uploads/certificates/new_cert.pdf"
 *                       category_id: "new_category"
 *                       subject: "新主題"
 *                       created_at: "2025-08-13T10:00:00.000Z"
 *                       updated_at: "2025-08-13T10:30:00.000Z"
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
 *                     verifying_institution: ["發證機構不能為空"]
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
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 權限不足
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法修改此證書
 *       404:
 *         description: 證書不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 證書不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的證書
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
router.put('/certificates/:id', authenticateToken, TeachersController.updateCertificate)

/**
 * @swagger
 * /api/teachers/certificates/{id}:
 *   delete:
 *     tags:
 *       - Teachers
 *     summary: 刪除證書
 *     description: |
 *       刪除指定的證書
 *
 *       **業務規則：**
 *       - 只能刪除自己的證書
 *       - 刪除後無法復原
 *
 *       **權限要求：**
 *       - 需要登入（Bearer Token）
 *       - 僅證書擁有者可以刪除
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 證書ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 刪除成功
 *                 value:
 *                   status: success
 *                   message: 刪除證書成功
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
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 權限不足
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法刪除此證書
 *       404:
 *         description: 證書不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 證書不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的證書
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
router.delete('/certificates/:id', authenticateToken, TeachersController.deleteCertificate)

// === 時間管理路由 ===

/**
 * @swagger
 * /api/teachers/schedule:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得可預約時段設定
 *     description: |
 *       取得教師的可預約時段設定
 *
 *       **業務規則：**
 *       - 返回所有已設定的時段
 *       - 按星期和時間排序
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 僅教師可存取
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
 *                         slots:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherAvailableSlot'
 *             examples:
 *               success:
 *                 summary: 成功取得時段設定
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     slots:
 *                       - id: 1
 *                         teacher_id: 1
 *                         weekday: 1
 *                         start_time: "09:00"
 *                         end_time: "12:00"
 *                         is_active: true
 *                         created_at: "2025-08-13T10:00:00.000Z"
 *                         updated_at: "2025-08-13T10:00:00.000Z"
 *       401:
 *         description: 未登入
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 教師資料不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/schedule', authenticateToken, TeachersController.getSchedule)

/**
 * @swagger
 * /api/teachers/schedule:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新可預約時段設定
 *     description: |
 *       更新教師的可預約時段設定
 *
 *       **業務規則：**
 *       - 會完全取代現有的時段設定
 *       - 星期範圍：0-6（0=週日）
 *       - 時間格式：HH:MM（24小時制）
 *       - 結束時間必須晚於開始時間
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 僅教師可存取
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slots
 *             properties:
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - weekday
 *                     - start_time
 *                     - end_time
 *                   properties:
 *                     weekday:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 6
 *                       description: 星期（0=週日, 1=週一, ..., 6=週六）
 *                       example: 1
 *                     start_time:
 *                       type: string
 *                       pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *                       description: 開始時間（HH:MM 格式）
 *                       example: "09:00"
 *                     end_time:
 *                       type: string
 *                       pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *                       description: 結束時間（HH:MM 格式）
 *                       example: "12:00"
 *                     is_active:
 *                       type: boolean
 *                       description: 是否啟用（預設為 true）
 *                       example: true
 *           examples:
 *             weekday_schedule:
 *               summary: 週一到週五的時段設定
 *               value:
 *                 slots:
 *                   - weekday: 1
 *                     start_time: "09:00"
 *                     end_time: "12:00"
 *                     is_active: true
 *                   - weekday: 1
 *                     start_time: "14:00"
 *                     end_time: "17:00"
 *                     is_active: true
 *                   - weekday: 2
 *                     start_time: "09:00"
 *                     end_time: "17:00"
 *                     is_active: true
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
 *                         slots:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherAvailableSlot'
 *             examples:
 *               success:
 *                 summary: 成功更新時段設定
 *                 value:
 *                   status: success
 *                   message: 更新時間設定成功
 *                   data:
 *                     slots:
 *                       - id: 1
 *                         teacher_id: 1
 *                         weekday: 1
 *                         start_time: "09:00"
 *                         end_time: "12:00"
 *                         is_active: true
 *                         created_at: "2025-08-13T10:00:00.000Z"
 *                         updated_at: "2025-08-13T10:00:00.000Z"
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
 *                     "slots[0]": ["星期必須為 0-6 的數字"]
 *                     "slots[1]": ["結束時間必須晚於開始時間"]
 *       401:
 *         description: 未登入
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 教師資料不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/schedule', authenticateToken, TeachersController.updateSchedule)

/**
 * @swagger
 * /api/teachers/schedule/conflicts:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 檢查時段衝突
 *     description: |
 *       檢查現有預約與時段設定的衝突
 *
 *       **業務規則：**
 *       - 返回與現有預約衝突的時段
 *       - 包含衝突的預約數量
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 僅教師可存取
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
 *                         conflicts:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               weekday:
 *                                 type: number
 *                                 example: 1
 *                               start_time:
 *                                 type: string
 *                                 example: "10:00"
 *                               end_time:
 *                                 type: string
 *                                 example: "11:00"
 *                               conflicting_reservations:
 *                                 type: number
 *                                 example: 2
 *             examples:
 *               no_conflicts:
 *                 summary: 無衝突
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     conflicts: []
 *               has_conflicts:
 *                 summary: 有衝突
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     conflicts:
 *                       - weekday: 1
 *                         start_time: "10:00"
 *                         end_time: "11:00"
 *                         conflicting_reservations: 2
 *       401:
 *         description: 未登入
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 教師資料不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/schedule/conflicts', authenticateToken, TeachersController.getScheduleConflicts)

export default router
