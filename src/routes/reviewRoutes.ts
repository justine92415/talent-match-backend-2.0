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
import { 
  validateBody, 
  validateQuery, 
  submitReviewSchema,
  myReviewsQuerySchema,
  receivedReviewsQuerySchema
} from '@/validation/index'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: 評價系統 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewSubmitRequest:
 *       type: object
 *       required:
 *         - reservation_id
 *         - rate
 *         - comment
 *       properties:
 *         reservation_id:
 *           type: integer
 *           description: 預約 ID
 *           example: 1
 *         rate:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: 評分 (1-5)
 *           example: 5
 *         comment:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: 評價內容 (10-500 字元)
 *           example: "這個課程非常實用，老師教學認真，內容豐富，強烈推薦給想學習的朋友們！"
 *     
 *     ReviewResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 評價 ID
 *           example: 1
 *         rate:
 *           type: integer
 *           description: 評分
 *           example: 5
 *         comment:
 *           type: string
 *           description: 評價內容
 *           example: "這個課程非常實用"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *           example: "2025-01-23T10:30:00.000Z"
 *         student:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nick_name:
 *               type: string
 *               example: "學生小王"
 *     
 *     CourseReviewsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReviewResponse'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationResponse'
 *         course:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             uuid:
 *               type: string
 *               example: "550e8400-e29b-41d4-a716-446655440000"
 *             name:
 *               type: string
 *               example: "JavaScript 入門課程"
 *             rate:
 *               type: number
 *               example: 4.5
 *             review_count:
 *               type: integer
 *               example: 25
 *     
 *     PaginationResponse:
 *       type: object
 *       properties:
 *         current_page:
 *           type: integer
 *           example: 1
 *         per_page:
 *           type: integer
 *           example: 10
 *         total:
 *           type: integer
 *           example: 50
 *         total_pages:
 *           type: integer
 *           example: 5
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "錯誤訊息"
 *         code:
 *           type: string
 *           example: "BUSINESS_ERROR_CODE"
 *         data:
 *           type: object
 *           nullable: true
 *           example: null
 */

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: 提交評價
 *     description: 學生對已完成的課程預約提交評價
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "評價提交成功"
 *                 data:
 *                   $ref: '#/components/schemas/ReviewResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 預約不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 評價已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 資料驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  '/',
  authenticateToken,
  validateBody(submitReviewSchema),
  reviewController.submitReview
)

/**
 * @swagger
 * /api/reviews/courses/{uuid}:
 *   get:
 *     tags: [Reviews]
 *     summary: 取得課程評價列表
 *     description: 取得指定課程的所有評價，支援分頁、篩選和排序
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: 課程 UUID
 *         schema:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: page
 *         description: 頁碼
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: 每頁筆數
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *       - in: query
 *         name: rating
 *         description: 評分篩選 (1-5)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *       - in: query
 *         name: sort_by
 *         description: 排序欄位
 *         schema:
 *           type: string
 *           enum: [created_at, rating]
 *           default: created_at
 *           example: created_at
 *       - in: query
 *         name: sort_order
 *         description: 排序順序
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: desc
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
 *                   example: "取得課程評價成功"
 *                 data:
 *                   $ref: '#/components/schemas/CourseReviewsResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 查詢參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 注意：這個路由實際上會在課程路由中處理
// 但為了完整性，我們也在這裡定義
// router.get(
//   '/courses/:uuid',
//   reviewController.getCourseReviews
// )

/**
 * @swagger
 * /api/reviews/my-reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: 取得我的評價列表
 *     description: 取得當前使用者提交的所有評價
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 頁碼
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: 每頁筆數
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *       - in: query
 *         name: sort_by
 *         description: 排序欄位
 *         schema:
 *           type: string
 *           enum: [created_at, rating]
 *           default: created_at
 *           example: created_at
 *       - in: query
 *         name: sort_order
 *         description: 排序順序
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: desc
 *     responses:
 *       200:
 *         description: 成功取得我的評價列表
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
 *                   example: "取得我的評價列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReviewResponse'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 查詢參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/my',
  authenticateToken,
  validateQuery(myReviewsQuerySchema),
  reviewController.getMyReviews
)

/**
 * @swagger
 * /api/reviews/received:
 *   get:
 *     tags: [Reviews]
 *     summary: 取得教師收到的評價列表
 *     description: 教師取得自己收到的所有評價，支援分頁、篩選和排序
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: 頁碼
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: 每頁筆數
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *       - in: query
 *         name: course_id
 *         description: 課程 ID 篩選
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: rating
 *         description: 評分篩選 (1-5)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 5
 *       - in: query
 *         name: sort_by
 *         description: 排序欄位
 *         schema:
 *           type: string
 *           enum: [created_at, rating]
 *           default: created_at
 *           example: created_at
 *       - in: query
 *         name: sort_order
 *         description: 排序順序
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *           example: desc
 *     responses:
 *       200:
 *         description: 成功取得收到的評價列表
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
 *                   example: "取得收到的評價成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ReviewResponse'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足（非教師使用者）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 查詢參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/received',
  authenticateToken,
  validateQuery(receivedReviewsQuerySchema),
  reviewController.getReceivedReviews
)

export default router