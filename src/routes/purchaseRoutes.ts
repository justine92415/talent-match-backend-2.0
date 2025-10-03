/**
 * 購買記錄路由
 * 
 * 提供購買記錄管理的 API 端點，包括：
 * - GET /api/purchases - 取得使用者購買記錄列表
 * 
 * 所有端點都需要使用者身份認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { PurchaseController } from '@controllers/PurchaseController'

const router = Router()
const purchaseController = new PurchaseController()

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     tags:
 *       - Purchase Records
 *     summary: 取得使用者購買記錄列表
 *     description: |
 *       取得目前登入使用者的所有購買記錄，包含課程詳細資訊、教師資料、訂單資訊和堂數使用情況。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者身份認證
 *       - 根據使用者 ID 查詢購買記錄
 *       - 可選擇性篩選特定課程的購買記錄
 *       - 批次查詢相關課程、教師、訂單資料以避免 N+1 查詢問題
 *       - 按購買時間降序排列回傳結果
 *       - 包含堂數統計資訊 (總堂數、已使用、剩餘堂數)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course_id
 *         required: false
 *         schema:
 *           type: integer
 *           description: 課程 ID (選填，用於篩選特定課程的購買記錄)
 *           example: 123
 *         description: 篩選特定課程的購買記錄，不提供則回傳所有購買記錄
 *     responses:
 *       200:
 *         description: 取得購買記錄成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseListSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PurchaseUnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/', authenticateToken, purchaseController.getUserPurchases)

export default router