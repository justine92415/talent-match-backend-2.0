import { Router } from 'express'
import { TeacherApplicationController } from '../../controllers/teachers/TeacherApplicationController'
import { authenticateToken } from '../../middleware/auth'

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
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-12T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-08-12T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/teachers/apply:
 *   post:
 *     tags:
 *       - Teachers - Application
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 提交教師申請成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       $ref: '#/components/schemas/TeacherApplicationResponse'
 *       400:
 *         description: 參數驗證錯誤
 *       401:
 *         description: 未登入
 *       409:
 *         description: 已有申請記錄
 *       500:
 *         description: 系統錯誤
 */
router.post('/apply', authenticateToken, TeacherApplicationController.apply)

/**
 * @swagger
 * /api/teachers/application:
 *   get:
 *     tags:
 *       - Teachers - Application
 *     summary: 取得教師申請狀態
 *     description: 取得當前使用者的教師申請狀態和相關資料
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 申請狀態查詢成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 查詢申請狀態成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       $ref: '#/components/schemas/TeacherApplicationResponse'
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到申請記錄
 *       500:
 *         description: 系統錯誤
 */
router.get('/application', authenticateToken, TeacherApplicationController.getApplication)

/**
 * @swagger
 * /api/teachers/application:
 *   put:
 *     tags:
 *       - Teachers - Application
 *     summary: 更新教師申請資料
 *     description: 更新教師申請的國籍和自我介紹資料
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
 *                 example: "更新後的自我介紹..."
 *                 minLength: 100
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: 申請資料更新成功
 *       400:
 *         description: 參數驗證錯誤
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到申請記錄
 *       422:
 *         description: 申請狀態不允許更新
 *       500:
 *         description: 系統錯誤
 */
router.put('/application', authenticateToken, TeacherApplicationController.updateApplication)

/**
 * @swagger
 * /api/teachers/resubmit:
 *   post:
 *     tags:
 *       - Teachers - Application
 *     summary: 重新提交被拒絕的申請
 *     description: 重新提交被拒絕的教師申請，將申請狀態重設為待審核
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 申請已重新提交
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 申請已重新提交
 *                 data:
 *                   type: object
 *                   properties:
 *                     application:
 *                       $ref: '#/components/schemas/TeacherApplicationResponse'
 *       401:
 *         description: 未授權
 *       404:
 *         description: 找不到申請記錄
 *       422:
 *         description: 申請狀態不是被拒絕
 *       500:
 *         description: 系統錯誤
 */
router.post('/resubmit', authenticateToken, TeacherApplicationController.resubmitApplication)

export default router
