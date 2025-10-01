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
