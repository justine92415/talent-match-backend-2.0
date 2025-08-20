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
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 課程評價相關 API
 */

/**
 * @swagger
 * /api/reviews/courses/{courseId}:
 *   get:
 *     tags: [Reviews]
 *     summary: 取得課程評價列表
 *     description: 取得指定課程的評價列表，支援分頁查詢
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁數
 *         example: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, rating_high, rating_low]
 *           default: newest
 *         description: 排序方式
 *         example: newest
 *     responses:
 *       200:
 *         description: 成功取得課程評價列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: '取得課程評價列表成功'
 *                 data:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CourseReview'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/courses/:id', validateCourseReviewQuery, publicCourseController.getCourseReviews)

export default router