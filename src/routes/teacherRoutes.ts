import { Router } from 'express'
import { TeacherController } from '../controllers/TeacherController'
import { authenticateToken } from '../middleware/auth'

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
router.post('/apply', authenticateToken, teacherController.apply)

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
router.put('/application', authenticateToken, teacherController.updateApplication)

export default router