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
import { reviewCreateSchema, myReviewsQuerySchema, receivedReviewsQuerySchema } from '@middleware/schemas/system/reviewSchemas'

const router = Router()

router.get('/my', authenticateToken, createSchemasMiddleware({ query: myReviewsQuerySchema }), reviewController.getMyReviews)

router.get('/received', authenticateToken, createSchemasMiddleware({ query: receivedReviewsQuerySchema }), reviewController.getReceivedReviews)

export default router
