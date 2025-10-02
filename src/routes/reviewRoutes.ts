/**
 * 評價路由
 *
 * 提供評價系統的 API 端點，包括：
 * - POST /api/reviews - 提交評價
 * - GET /api/reviews/courses/:uuid - 取得課程評價列表
 * - GET /api/reviews/my-reviews - 取得我的評價列表
 * - GET /api/reviews/received - 取得教師收到的評價列表
 *
 * 遵循 TDD 指示文件：
 * - 整合 authenticateToken 和 validateRequest 中間件
 * - 完整的 Swagger JSDoc 註解
 * - 定義所有端點的請求、回應、錯誤格式
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { reviewController } from '@controllers/ReviewController'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import {
	reviewCreateSchema,
	courseUuidParamSchema,
	courseReviewsQuerySchema,
	myReviewsQuerySchema,
	receivedReviewsQuerySchema
} from '@middleware/schemas/system/reviewSchemas'

const router = Router()

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: 提交課程評價
 *     description: |
 *       學生在完成預約課程後提交評價。
 *
 *       **業務邏輯**：
 *       - 驗證請求參數（預約 UUID、評分、評語）
 *       - 確認預約屬於當前學生且雙方狀態皆為完成
 *       - 防止重複評價同一預約
 *       - 建立評價並更新課程與教師的評分統計
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReviewSubmitRequest'
 *     responses:
 *       201:
 *         description: 評價提交成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewSubmitSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或預約狀態不允許評價
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ReviewSubmitValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ReviewSubmitBusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       404:
 *         description: 找不到對應的預約或課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       409:
 *         description: 該預約已經存在評價
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post(
	'/',
	authenticateToken,
	createSchemasMiddleware({ body: reviewCreateSchema }),
	reviewController.submitReview
)

/**
 * @swagger
 * /api/reviews/courses/{uuid}:
 *   get:
 *     tags:
 *       - Reviews
 *     summary: 取得課程評價列表
 *     description: |
 *       取得指定課程的所有評價記錄，包含評價內容、學生資訊和評分統計。
 *       
 *       **業務邏輯**：
 *       - 驗證課程 UUID 格式是否正確
 *       - 確認課程存在且狀態為已發佈 (published)
 *       - 支援依評分篩選評價
 *       - 支援依建立時間或評分排序
 *       - 使用分頁機制提升效能
 *       - 並行查詢評價列表、總數與統計資訊
 *       - 回傳課程基本資訊、評價列表、分頁資訊和評分統計
 *       
 *       **查詢優化**：
 *       - 使用 LEFT JOIN 一次查詢取得學生資訊
 *       - 並行執行評價列表、總數和統計查詢
 *       - 使用資料庫索引加速排序和篩選
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 課程的唯一識別碼 (v4 UUID 格式)
 *         example: '2728eb42-48d8-4356-9091-39e971ebce0c'
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼 (選填，預設為 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數 (選填，預設 10，最大 100)
 *         example: 10
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: 依評分篩選 (選填，範圍 1-5)
 *         example: 5
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [created_at, rating]
 *           default: created_at
 *         description: 排序欄位 (選填，預設為 created_at)
 *         example: 'created_at'
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 排序方向 (選填，預設為 desc 降冪)
 *         example: 'desc'
 *     responses:
 *       200:
 *         description: 成功取得課程評價列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseReviewsSuccessResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseReviewsValidationErrorResponse'
 *       404:
 *         description: 課程不存在或未發佈
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseReviewsNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get(
	'/courses/:uuid',
	createSchemasMiddleware({ params: courseUuidParamSchema, query: courseReviewsQuerySchema }),
	reviewController.getCourseReviews
)

router.get(
	'/my-reviews',
	authenticateToken,
	createSchemasMiddleware({ query: myReviewsQuerySchema }),
	reviewController.getMyReviews
)

router.get('/received', authenticateToken, createSchemasMiddleware({ query: receivedReviewsQuerySchema }), reviewController.getReceivedReviews)

export default router
