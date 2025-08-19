/**
 * 評價路由
 * 
 * 提供課程評價相關的 API 端點：
 * - GET /api/reviews/courses/:id - 課程評價列表
 */

import { Router } from 'express'
import { publicCourseController } from '@controllers/PublicCourseController'
import { validateCourseReviewQuery } from '@middleware/validation/publicCourseValidation'

const router = Router()

/**
 * 取得課程評價列表
 * GET /api/reviews/courses/:id
 */
router.get('/courses/:id', validateCourseReviewQuery, publicCourseController.getCourseReviews)

export default router