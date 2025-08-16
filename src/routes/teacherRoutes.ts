import { Router } from 'express'
import { TeacherController } from '../controllers/TeacherController'
import { authenticateToken } from '../middleware/auth'
import { validateRequest, teacherApplicationSchema, teacherApplicationUpdateSchema, teacherProfileUpdateSchema } from '../middleware/validation'

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
router.post('/apply', 
  authenticateToken, 
  validateRequest(teacherApplicationSchema, '教師申請參數驗證失敗'), 
  teacherController.apply
)

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
router.put('/application', 
  authenticateToken, 
  validateRequest(teacherApplicationUpdateSchema, '更新申請參數驗證失敗'), 
  teacherController.updateApplication
)

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
router.put('/profile', 
  authenticateToken, 
  validateRequest(teacherProfileUpdateSchema, '教師資料更新參數驗證失敗'), 
  teacherController.updateProfile
)

export default router