import { Router } from 'express'
import { TeacherController } from '@controllers/TeacherController'
import { scheduleController } from '@controllers/ScheduleController'
import { authenticateToken } from '@middleware/auth'
import {
  validateRequest,
  teacherApplicationSchema,
  teacherApplicationUpdateSchema,
  teacherProfileUpdateSchema,
  certificateCreateSchema,
  certificateUpdateSchema
} from '@middleware/validation'
import { scheduleUpdateSchema, conflictsQuerySchema } from '@middleware/validation/scheduleValidation'
import learningExperienceRoutes from '@routes/learningExperienceRoutes'
import { certificateController } from '@controllers/CertificateController'

/**
 * 教師相關路由
 *
 * 路由前綴: /api/teachers
 *
 * @swagger
 * tags:
 *   name: Teacher Features
 *   description: 教師功能相關 API，包含申請成為教師、管理申請狀態等功能
 */

const router = Router()
const teacherController = new TeacherController()

/**
 * @swagger
 * /teachers/apply:
 *   post:
 *     tags: [Teacher Features]
 *     summary: 申請成為教師
 *     description: |
 *       學生可以透過此端點申請成為教師。需要提供國籍和自我介紹資訊。
 *
 *       **業務規則:**
 *       - 只有學生角色可以申請
 *       - 帳號狀態必須為活躍
 *       - 每個使用者只能有一個申請記錄
 *       - 自我介紹至少需要100字元
 *       - 國籍欄位不可超過50字元
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherApplicationRequest'
 *           examples:
 *             example1:
 *               summary: 完整申請範例
 *               value:
 *                 nationality: "台灣"
 *                 introduction: "我是一位熱愛教育的專業人士，擁有豐富的教學經驗和深厚的學術背景。我在這個領域已經工作了多年，積累了豐富的實戰經驗。我希望能在這個平台上分享我的知識，幫助更多學生成長和進步，讓他們能夠在學習的道路上走得更遠。"
 *     responses:
 *       201:
 *         description: 申請建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherApplicationCreateResponse'
 *             example:
 *               status: "success"
 *               message: "教師申請已建立"
 *               data:
 *                 teacher:
 *                   id: 1
 *                   uuid: "550e8400-e29b-41d4-a716-446655440000"
 *                   user_id: 1
 *                   nationality: "台灣"
 *                   introduction: "我是一位熱愛教育的專業人士..."
 *                   application_status: "PENDING"
 *                   application_submitted_at: "2024-01-15T10:30:00.000Z"
 *                   created_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/apply', authenticateToken, validateRequest(teacherApplicationSchema, '教師申請參數驗證失敗'), teacherController.apply)

/**
 * @swagger
 * /teachers/application:
 *   get:
 *     tags: [Teacher Features]
 *     summary: 查詢申請狀態
 *     description: |
 *       取得當前使用者的教師申請狀態和詳細資訊。
 *
 *       **回應內容包含:**
 *       - 申請基本資訊（國籍、自我介紹）
 *       - 申請狀態（待審核、已通過、已拒絕）
 *       - 申請時間和審核時間
 *       - 審核備註（如有）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得申請狀態
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherApplicationStatusResponse'
 *             example:
 *               status: "success"
 *               message: "取得申請狀態成功"
 *               data:
 *                 teacher:
 *                   id: 1
 *                   uuid: "550e8400-e29b-41d4-a716-446655440000"
 *                   nationality: "台灣"
 *                   introduction: "我是一位熱愛教育的專業人士..."
 *                   application_status: "PENDING"
 *                   application_submitted_at: "2024-01-15T10:30:00.000Z"
 *                   application_reviewed_at: null
 *                   reviewer_id: null
 *                   review_notes: null
 *                   created_at: "2024-01-15T10:30:00.000Z"
 *                   updated_at: "2024-01-15T10:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/application', authenticateToken, teacherController.getApplication)

/**
 * @swagger
 * /teachers/application:
 *   put:
 *     tags: [Teacher Features]
 *     summary: 更新申請資料
 *     description: |
 *       更新教師申請的資料內容。只能在「待審核」或「已拒絕」狀態下進行修改。
 *
 *       **業務規則:**
 *       - 只能更新國籍和自我介紹
 *       - 已通過的申請無法修改
 *       - 被拒絕的申請修改後會重新設為待審核狀態
 *       - 自我介紹長度限制：100-1000字元
 *       - 國籍長度限制：1-50字元
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherApplicationUpdateRequest'
 *           examples:
 *             updateBoth:
 *               summary: 更新國籍和自我介紹
 *               value:
 *                 nationality: "日本"
 *                 introduction: "更新後的申請介紹內容，需要長度超過100字元以符合系統驗證規則。這是教師申請的更新版本，包含了申請人更詳細的教學背景和經驗介紹，確保更新功能的測試資料符合業務需求和系統驗證要求。"
 *             updateIntroductionOnly:
 *               summary: 只更新自我介紹
 *               value:
 *                 introduction: "這是更新後的自我介紹，內容更加豐富和詳細。我在教育領域有多年經驗，擅長各種教學方法和技巧。希望能在這個平台上貢獻我的專業知識。"
 *     responses:
 *       200:
 *         description: 申請資料更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherApplicationUpdateResponse'
 *             example:
 *               status: "success"
 *               message: "申請資料更新成功"
 *               data:
 *                 teacher:
 *                   id: 1
 *                   nationality: "日本"
 *                   introduction: "更新後的申請介紹內容..."
 *                   updated_at: "2024-01-15T11:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/application', authenticateToken, validateRequest(teacherApplicationUpdateSchema, '更新申請參數驗證失敗'), teacherController.updateApplication)

/**
 * @swagger
 * /teachers/resubmit:
 *   post:
 *     tags: [Teacher Features]
 *     summary: 重新提交申請
 *     description: |
 *       重新提交被拒絕的教師申請。只有被拒絕的申請才能重新提交。
 *
 *       **業務規則:**
 *       - 只有被拒絕狀態的申請才能重新提交
 *       - 重新提交後申請狀態會重置為待審核
 *       - 審核相關欄位會被清空（審核時間、審核員、審核備註）
 *       - 重新設定提交時間為當前時間
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 申請重新提交成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "申請已重新提交"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         uuid:
 *                           type: string
 *                           format: uuid
 *                           example: "550e8400-e29b-41d4-a716-446655440000"
 *                         application_status:
 *                           type: string
 *                           example: "PENDING"
 *                         application_submitted_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T12:00:00.000Z"
 *                         application_reviewed_at:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         reviewer_id:
 *                           type: integer
 *                           nullable: true
 *                           example: null
 *                         review_notes:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: 申請狀態不允許重新提交
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "此申請無法重新提交，請檢查申請狀態"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 找不到申請記錄
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "找不到教師申請記錄"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/resubmit', authenticateToken, teacherController.resubmitApplication)

/**
 * @swagger
 * /teachers/profile:
 *   get:
 *     tags: [Teacher Features]
 *     summary: 取得教師基本資料
 *     description: |
 *       取得已通過審核的教師基本資料，包含統計資訊。
 *
 *       **權限要求:**
 *       - 需要已通過審核的教師身份
 *       - 未通過審核的申請無法存取此端點
 *
 *       **回應內容包含:**
 *       - 基本資料（國籍、自我介紹）
 *       - 申請狀態和審核資訊
 *       - 統計數據（學生數、課程數、評分、收入）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得教師資料
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "取得教師資料成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       $ref: '#/components/schemas/TeacherProfileData'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 找不到教師資料或尚未通過審核
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "找不到教師資料或尚未通過審核"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/profile', authenticateToken, teacherController.getProfile)

/**
 * @swagger
 * /teachers/profile:
 *   put:
 *     tags: [Teacher Features]
 *     summary: 更新教師基本資料
 *     description: |
 *       更新已通過審核的教師基本資料。修改重要資料後將觸發重新審核。
 *
 *       **業務規則:**
 *       - 只有已通過審核的教師可以使用此功能
 *       - 修改重要資料後申請狀態會變為待審核
 *       - 審核相關欄位會被清空
 *       - 支援部分更新（可只更新國籍或自我介紹其中之一）
 *
 *       **驗證規則:**
 *       - 國籍：1-50字元
 *       - 自我介紹：100-1000字元
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherProfileUpdateRequest'
 *           examples:
 *             updateBoth:
 *               summary: 更新國籍和自我介紹
 *               value:
 *                 nationality: "美國"
 *                 introduction: "教師資料管理測試專用介紹，這段文字是用於測試教師基本資料更新功能的內容。包含了足夠的長度以通過系統驗證，同時也提供了清楚的識別用途。我是一位專業的教育工作者，致力於提供高品質的教學服務。"
 *             updateNationalityOnly:
 *               summary: 只更新國籍
 *               value:
 *                 nationality: "日本"
 *             updateIntroductionOnly:
 *               summary: 只更新自我介紹
 *               value:
 *                 introduction: "更新後的教師自我介紹，內容更加豐富和詳細。我在教育領域有多年經驗，擅長各種教學方法和技巧。希望能在這個平台上貢獻我的專業知識，為學生提供最好的學習體驗和指導。"
 *     responses:
 *       200:
 *         description: 教師資料更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "教師資料更新成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         nationality:
 *                           type: string
 *                           example: "美國"
 *                         introduction:
 *                           type: string
 *                           example: "更新後的教師自我介紹..."
 *                         application_status:
 *                           type: string
 *                           example: "PENDING"
 *                         updated_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-15T14:30:00.000Z"
 *                     notice:
 *                       type: string
 *                       example: "由於修改了重要資料，需要重新審核"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 找不到教師資料或尚未通過審核
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "找不到教師資料或尚未通過審核"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/profile', authenticateToken, validateRequest(teacherProfileUpdateSchema, '教師資料更新參數驗證失敗'), teacherController.updateProfile)

/**
 * @swagger
 * /teachers/work-experiences:
 *   get:
 *     tags: [Teacher Features]
 *     summary: 取得工作經驗列表
 *     description: |
 *       取得當前教師的所有工作經驗記錄列表。
 *
 *       **權限要求:**
 *       - 需要教師身份
 *       - 只能查看自己的工作經驗
 *
 *       **回應內容:**
 *       - 按建立時間降序排列
 *       - 包含完整的工作經驗資訊
 *       - 提供總筆數資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得工作經驗列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "取得工作經驗列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     work_experiences:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WorkExperience'
 *                     total:
 *                       type: integer
 *                       example: 3
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   post:
 *     tags: [Teacher Features]
 *     summary: 新增工作經驗
 *     description: |
 *       新增一筆工作經驗記錄。
 *
 *       **業務規則:**
 *       - 需要教師身份
 *       - 在職工作經驗不可填寫結束日期
 *       - 離職工作經驗必須填寫結束日期
 *       - 結束日期不得早於開始日期
 *       - 年份範圍：1900-當前年份+1
 *       - 月份範圍：1-12
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkExperienceCreateRequest'
 *     responses:
 *       201:
 *         description: 工作經驗建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkExperienceCreateResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/work-experiences', authenticateToken, teacherController.getWorkExperiences)
router.post('/work-experiences', authenticateToken, teacherController.createWorkExperience)

/**
 * @swagger
 * /teachers/work-experiences/{id}:
 *   put:
 *     tags: [Teacher Features]
 *     summary: 更新工作經驗
 *     description: |
 *       更新指定的工作經驗記錄。
 *
 *       **權限要求:**
 *       - 需要教師身份
 *       - 只能更新自己的工作經驗
 *
 *       **業務規則:**
 *       - 支援部分更新（可只更新部分欄位）
 *       - 在職工作經驗不可填寫結束日期
 *       - 離職工作經驗必須填寫結束日期
 *       - 結束日期不得早於開始日期
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作經驗記錄 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkExperienceUpdateRequest'
 *     responses:
 *       200:
 *         description: 工作經驗更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkExperienceUpdateResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags: [Teacher Features]
 *     summary: 刪除工作經驗
 *     description: |
 *       刪除指定的工作經驗記錄。
 *
 *       **權限要求:**
 *       - 需要教師身份
 *       - 只能刪除自己的工作經驗
 *
 *       **注意事項:**
 *       - 刪除操作無法復原
 *       - 建議在前端提供確認對話框
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: 工作經驗記錄 ID
 *     responses:
 *       200:
 *         description: 工作經驗刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "工作經驗刪除成功"
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/work-experiences/:id', authenticateToken, teacherController.updateWorkExperience)
router.delete('/work-experiences/:id', authenticateToken, teacherController.deleteWorkExperience)

// 掛載學習經歷相關路由
router.use('/learning-experiences', learningExperienceRoutes)

// 證書管理路由
/**
 * @swagger
 * /teachers/certificates:
 *   get:
 *     tags: [Teacher Features]
 *     summary: 取得教師證書列表
 *     description: |
 *       取得已認證教師的所有證書記錄
 *
 *       **功能特色：**
 *       - 只能查看自己的證書列表
 *       - 依建立時間倒序排列
 *       - 支援完整的證書資訊展示
 *
 *       **權限控制：**
 *       - 需要有效的 JWT Token
 *       - 自動依據 Token 中的教師ID篩選資料
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得證書列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherCertificateListResponse'
 *             examples:
 *               successWithData:
 *                 summary: 成功回傳證書列表
 *                 value:
 *                   status: "success"
 *                   message: "取得證書列表成功"
 *                   data:
 *                     certificates:
 *                       - id: 1
 *                         teacher_id: 1
 *                         verifying_institution: "教育部"
 *                         license_name: "中等學校教師證書"
 *                         holder_name: "王小明"
 *                         license_number: "TC2024001234"
 *                         file_path: "/uploads/certificates/tc_2024001234.pdf"
 *                         category_id: "teaching_license"
 *                         subject: "數學科教學"
 *                         created_at: "2024-01-15T08:00:00.000Z"
 *                         updated_at: "2024-01-15T08:00:00.000Z"
 *                       - id: 2
 *                         teacher_id: 1
 *                         verifying_institution: "國立台灣師範大學"
 *                         license_name: "英語教學能力認證"
 *                         holder_name: "王小明"
 *                         license_number: "TESOL2024567"
 *                         file_path: "/uploads/certificates/tesol_2024567.pdf"
 *                         category_id: "language_certification"
 *                         subject: "英語教學"
 *                         created_at: "2024-01-10T09:30:00.000Z"
 *                         updated_at: "2024-01-10T09:30:00.000Z"
 *               emptyList:
 *                 summary: 尚無證書記錄
 *                 value:
 *                   status: "success"
 *                   message: "取得證書列表成功"
 *                   data:
 *                     certificates: []
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足（非教師角色）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "INSUFFICIENT_PERMISSIONS"
 *                 message: "只有教師可以查看證書列表"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   post:
 *     tags: [Teacher Features]
 *     summary: 新增教師證書
 *     description: |
 *       新增教師的證書記錄，支援多種證書類型
 *
 *       **證書類型支援：**
 *       - teaching_license: 教師證書
 *       - language_certification: 語言認證
 *       - professional_certificate: 專業證照
 *       - academic_degree: 學位證書
 *
 *       **檔案規範：**
 *       - 支援格式：PDF, JPG, JPEG, PNG
 *       - 檔案大小：最大 5MB
 *       - 檔案路徑：需為有效的系統路徑
 *
 *       **驗證規則：**
 *       - 發證機構：1-100字元
 *       - 證書名稱：1-200字元
 *       - 持有人姓名：1-100字元
 *       - 證書編號：1-100字元（需唯一）
 *       - 證書主題：1-200字元
 *       - 類別ID：1-50字元
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeacherCertificateRequest'
 *           examples:
 *             teachingLicense:
 *               summary: 教師證書
 *               value:
 *                 verifying_institution: "教育部"
 *                 license_name: "中等學校教師證書"
 *                 holder_name: "王小明"
 *                 license_number: "TC2024001234"
 *                 file_path: "/uploads/certificates/tc_2024001234.pdf"
 *                 category_id: "teaching_license"
 *                 subject: "數學科教學"
 *             languageCertification:
 *               summary: 語言認證證書
 *               value:
 *                 verifying_institution: "國立台灣師範大學"
 *                 license_name: "英語教學能力認證"
 *                 holder_name: "王小明"
 *                 license_number: "TESOL2024567"
 *                 file_path: "/uploads/certificates/tesol_2024567.pdf"
 *                 category_id: "language_certification"
 *                 subject: "英語教學"
 *     responses:
 *       201:
 *         description: 證書新增成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherCertificateCreateResponse'
 *             example:
 *               status: "success"
 *               message: "證書已新增"
 *               data:
 *                 certificate:
 *                   id: 1
 *                   teacher_id: 1
 *                   verifying_institution: "教育部"
 *                   license_name: "中等學校教師證書"
 *                   holder_name: "王小明"
 *                   license_number: "TC2024001234"
 *                   file_path: "/uploads/certificates/tc_2024001234.pdf"
 *                   category_id: "teaching_license"
 *                   subject: "數學科教學"
 *                   created_at: "2024-01-15T08:00:00.000Z"
 *                   updated_at: "2024-01-15T08:00:00.000Z"
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               missingFields:
 *                 summary: 缺少必填欄位
 *                 value:
 *                   status: "error"
 *                   error:
 *                     code: "VALIDATION_ERROR"
 *                     message: "參數驗證失敗"
 *                     details:
 *                       verifying_institution: ["發證機構為必填欄位"]
 *                       license_name: ["證書名稱為必填欄位"]
 *               invalidLength:
 *                 summary: 欄位長度超過限制
 *                 value:
 *                   status: "error"
 *                   error:
 *                     code: "VALIDATION_ERROR"
 *                     message: "參數驗證失敗"
 *                     details:
 *                       license_name: ["證書名稱長度不得超過200字元"]
 *                       license_number: ["證書編號長度不得超過100字元"]
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足（非教師角色）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "INSUFFICIENT_PERMISSIONS"
 *                 message: "只有教師可以新增證書"
 *       409:
 *         description: 證書編號重複
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "CERTIFICATE_NUMBER_EXISTS"
 *                 message: "證書編號已存在"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/certificates', authenticateToken, certificateController.getCertificates)
router.post('/certificates', authenticateToken, validateRequest(certificateCreateSchema), certificateController.createCertificate)

/**
 * @swagger
 * /teachers/certificates/{id}:
 *   put:
 *     tags: [Teacher Features]
 *     summary: 更新教師證書
 *     description: |
 *       更新指定的教師證書記錄，支援部分欄位更新
 *
 *       **更新特色：**
 *       - 支援部分欄位更新（Partial Update）
 *       - 自動驗證證書所有權
 *       - 保持資料一致性和完整性
 *
 *       **可更新欄位：**
 *       - verifying_institution: 發證機構
 *       - license_name: 證書名稱
 *       - holder_name: 持有人姓名
 *       - license_number: 證書編號
 *       - file_path: 檔案路徑
 *       - category_id: 證書類別
 *       - subject: 證書主題
 *
 *       **權限控制：**
 *       - 只能更新自己的證書
 *       - 系統自動驗證證書所有權
 *       - 防止跨用戶資料篡改
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 證書ID（必須為正整數）
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeacherCertificateRequest'
 *           examples:
 *             partialUpdate:
 *               summary: 部分欄位更新
 *               value:
 *                 license_name: "高級中等學校教師證書"
 *                 subject: "高中數學科教學"
 *             fullUpdate:
 *               summary: 完整欄位更新
 *               value:
 *                 verifying_institution: "教育部師資培育及藝術教育司"
 *                 license_name: "高級中等學校教師證書"
 *                 holder_name: "王小明"
 *                 license_number: "TC2024001235"
 *                 file_path: "/uploads/certificates/tc_2024001235_updated.pdf"
 *                 category_id: "advanced_teaching_license"
 *                 subject: "高中數學科教學"
 *             licenseUpgrade:
 *               summary: 證書升級更新
 *               value:
 *                 license_name: "特殊教育教師證書"
 *                 category_id: "special_education_license"
 *                 subject: "特殊教育教學"
 *     responses:
 *       200:
 *         description: 證書更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherCertificateUpdateResponse'
 *             example:
 *               status: "success"
 *               message: "證書已更新"
 *               data:
 *                 certificate:
 *                   id: 1
 *                   teacher_id: 1
 *                   verifying_institution: "教育部師資培育及藝術教育司"
 *                   license_name: "高級中等學校教師證書"
 *                   holder_name: "王小明"
 *                   license_number: "TC2024001235"
 *                   file_path: "/uploads/certificates/tc_2024001235_updated.pdf"
 *                   category_id: "advanced_teaching_license"
 *                   subject: "高中數學科教學"
 *                   created_at: "2024-01-15T08:00:00.000Z"
 *                   updated_at: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               invalidFields:
 *                 summary: 欄位驗證失敗
 *                 value:
 *                   status: "error"
 *                   error:
 *                     code: "VALIDATION_ERROR"
 *                     message: "參數驗證失敗"
 *                     details:
 *                       license_name: ["證書名稱長度不得超過200字元"]
 *                       license_number: ["證書編號格式不正確"]
 *               emptyUpdate:
 *                 summary: 未提供任何更新欄位
 *                 value:
 *                   status: "error"
 *                   error:
 *                     code: "VALIDATION_ERROR"
 *                     message: "至少需要提供一個欄位進行更新"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足（非教師角色或非證書擁有者）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "INSUFFICIENT_PERMISSIONS"
 *                 message: "您沒有權限修改此證書"
 *       404:
 *         description: 證書不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "CERTIFICATE_NOT_FOUND"
 *                 message: "找不到指定的證書"
 *       409:
 *         description: 證書編號衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "CERTIFICATE_NUMBER_EXISTS"
 *                 message: "證書編號已被其他證書使用"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   delete:
 *     tags: [Teacher Features]
 *     summary: 刪除教師證書
 *     description: |
 *       刪除指定的教師證書記錄，操作不可逆
 *
 *       **刪除特性：**
 *       - 物理刪除（不可恢復）
 *       - 自動驗證證書所有權
 *       - 同時清理相關檔案資源
 *
 *       **安全措施：**
 *       - 只能刪除自己的證書
 *       - 系統自動驗證所有權
 *       - 防止誤刪或惡意刪除
 *
 *       **注意事項：**
 *       - 刪除後無法恢復
 *       - 建議刪除前先確認證書資訊
 *       - 相關的檔案也會一併清理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 證書ID（必須為正整數）
 *         example: 1
 *     responses:
 *       200:
 *         description: 證書刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherCertificateDeleteResponse'
 *             example:
 *               status: "success"
 *               message: "證書已刪除"
 *               data: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足（非教師角色或非證書擁有者）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "INSUFFICIENT_PERMISSIONS"
 *                 message: "您沒有權限刪除此證書"
 *       404:
 *         description: 證書不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             example:
 *               status: "error"
 *               error:
 *                 code: "CERTIFICATE_NOT_FOUND"
 *                 message: "找不到指定的證書"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/certificates/:id', authenticateToken, validateRequest(certificateUpdateSchema), certificateController.updateCertificate)
router.delete('/certificates/:id', authenticateToken, certificateController.deleteCertificate)

// === 教師時間管理路由 ===

/**
 * @swagger
 * /teachers/schedule:
 *   get:
 *     tags: [Teacher Features]
 *     summary: 取得可預約時段設定
 *     description: |
 *       教師可以查詢自己設定的可預約時段。
 *       
 *       **業務規則:**
 *       - 需要教師身份認證
 *       - 按照星期和時間排序回傳
 *       - 包含啟用/停用狀態
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得時段設定
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetScheduleResponse'
 *             example:
 *               status: "success"
 *               message: "取得教師時段設定成功"
 *               data:
 *                 available_slots:
 *                   - id: 1
 *                     teacher_id: 1
 *                     weekday: 1
 *                     start_time: "09:00"
 *                     end_time: "10:00"
 *                     is_active: true
 *                     created_at: "2025-08-16T09:00:00Z"
 *                     updated_at: "2025-08-16T09:00:00Z"
 *                 total_slots: 1
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足（非教師角色）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/schedule', authenticateToken, scheduleController.getSchedule)

/**
 * @swagger
 * /teachers/schedule:
 *   put:
 *     tags: [Teacher Features]
 *     summary: 更新可預約時段設定
 *     description: |
 *       教師可以設定或更新自己的可預約時段。
 *       
 *       **業務規則:**
 *       - 需要教師身份認證
 *       - 會完全替換現有時段設定
 *       - 傳空陣列可清空所有時段
 *       - 時間格式需為 HH:MM
 *       - 結束時間必須晚於開始時間
 *       - 星期範圍 0-6 (週日到週六)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateScheduleRequest'
 *           example:
 *             available_slots:
 *               - weekday: 1
 *                 start_time: "09:00"
 *                 end_time: "10:00"
 *                 is_active: true
 *               - weekday: 1
 *                 start_time: "14:00"
 *                 end_time: "15:00"
 *                 is_active: true
 *     responses:
 *       200:
 *         description: 成功更新時段設定
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateScheduleResponse'
 *             example:
 *               status: "success"
 *               message: "教師時段設定更新成功"
 *               data:
 *                 available_slots:
 *                   - id: 1
 *                     teacher_id: 1
 *                     weekday: 1
 *                     start_time: "09:00"
 *                     end_time: "10:00"
 *                     is_active: true
 *                     created_at: "2025-08-16T09:00:00Z"
 *                     updated_at: "2025-08-16T09:00:00Z"
 *                 updated_count: 0
 *                 created_count: 2
 *                 deleted_count: 1
 *       400:
 *         description: 驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足（非教師角色）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/schedule', authenticateToken, validateRequest(scheduleUpdateSchema), scheduleController.updateSchedule)

/**
 * @swagger
 * /teachers/schedule/conflicts:
 *   get:
 *     tags: [Teacher Features]
 *     summary: 檢查時段衝突
 *     description: |
 *       檢查教師的可預約時段與現有預約是否有衝突。
 *       
 *       **業務規則:**
 *       - 需要教師身份認證
 *       - 可指定檢查時間範圍和特定時段
 *       - 預設檢查未來30天內的衝突
 *       - 只檢查已確認的預約
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: slot_ids
 *         in: query
 *         description: 要檢查的時段ID列表，用逗號分隔
 *         required: false
 *         schema:
 *           type: string
 *           example: "1,2,3"
 *       - name: from_date
 *         in: query
 *         description: 檢查起始日期 (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-08-20"
 *       - name: to_date
 *         in: query
 *         description: 檢查結束日期 (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-09-20"
 *     responses:
 *       200:
 *         description: 成功檢查衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CheckConflictsResponse'
 *             example:
 *               status: "success"
 *               message: "時段衝突檢查完成"
 *               data:
 *                 has_conflicts: false
 *                 conflicts: []
 *                 total_conflicts: 0
 *                 check_period:
 *                   from_date: "2025-08-20"
 *                   to_date: "2025-09-20"
 *       400:
 *         description: 查詢參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 權限不足（非教師角色）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/schedule/conflicts', authenticateToken, validateRequest(conflictsQuerySchema, 'query'), scheduleController.checkConflicts)

export default router
