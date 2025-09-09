/**
 * 公開課程路由
 * 
 * 提供公開課程瀏覽的 API 端點，包括：
 * - GET /api/courses/public - 公開課程列表（支援搜尋和篩選）
 * - GET /api/courses/public/:id - 公開課程詳情
 * - GET /api/reviews/courses/:id - 課程評價列表
 * 
 * 這些端點不需要認證，提供給所有用戶瀏覽
 */

import { Router } from 'express'
import { publicCourseController } from '@controllers/PublicCourseController'
import { validateQuery, validateParams } from '@middleware/schemas/core'
import { publicCourseQuerySchema, courseReviewQuerySchema, teacherCourseQuerySchema, courseIdParamSchema, teacherIdParamSchema } from '@middleware/schemas/course/publicCourseSchemas'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Public Courses
 *   description: 公開課程瀏覽 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicCourseItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 課程ID
 *           example: 1
 *         uuid:
 *           type: string
 *           description: 課程唯一識別碼
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           description: 課程名稱
 *           example: "Python 基礎程式設計"
 *         content:
 *           type: string
 *           description: 課程描述
 *           example: "學習Python基礎語法與程式設計觀念"
 *         main_image:
 *           type: string
 *           description: 課程封面圖片
 *           example: "/uploads/courses/image.jpg"
 *         min_price:
 *           type: number
 *           description: 最低價格
 *           example: 3000
 *         max_price:
 *           type: number
 *           description: 最高價格
 *           example: 5000
 *         rate:
 *           type: number
 *           description: 課程評分
 *           example: 4.5
 *         review_count:
 *           type: integer
 *           description: 評價數量
 *           example: 25
 *         student_count:
 *           type: integer
 *           description: 學生人數
 *           example: 120
 *         main_category:
 *           $ref: '#/components/schemas/CategorySummary'
 *         sub_category:
 *           $ref: '#/components/schemas/CategorySummary'
 *         city:
 *           $ref: '#/components/schemas/CitySummary'
 *         teacher:
 *           $ref: '#/components/schemas/TeacherUserSummary'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 * 
 *     CategorySummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "程式設計"
 * 
 *     CitySummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         city_name:
 *           type: string
 *           example: "台北市"
 * 
 *     TeacherUserSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nick_name:
 *           type: string
 *           example: "程式講師王老師"
 *         avatar_image:
 *           type: string
 *           example: "/uploads/avatars/teacher.jpg"
 * 
 *     PaginationInfo:
 *       type: object
 *       properties:
 *         current_page:
 *           type: integer
 *           example: 1
 *         per_page:
 *           type: integer
 *           example: 12
 *         total:
 *           type: integer
 *           example: 48
 *         total_pages:
 *           type: integer
 *           example: 4
 * 
 *     PublicCourseListResponse:
 *       type: object
 *       properties:
 *         courses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PublicCourseItem'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 *         filters:
 *           type: object
 *           properties:
 *             keyword:
 *               type: string
 *               nullable: true
 *               example: "Python"
 *             main_category_id:
 *               type: integer
 *               nullable: true
 *               example: 1
 *             sub_category_id:
 *               type: integer
 *               nullable: true
 *               example: 2
 *             city_id:
 *               type: integer
 *               nullable: true
 *               example: 1
 *             sort:
 *               type: string
 *               example: "newest"
 */

/**
 * @swagger
 * /api/courses/public:
 *   get:
 *     summary: 取得公開課程列表
 *     description: 取得已發布的課程列表，支援關鍵字搜尋、分類篩選、排序和分頁
 *     tags: [Public Courses]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: 搜尋關鍵字（搜尋課程名稱和描述）
 *         example: "Python"
 *       - in: query
 *         name: main_category_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 主分類ID（與 sub_category_id 需同時提供）
 *         example: 1
 *       - in: query
 *         name: sub_category_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 次分類ID（與 main_category_id 需同時提供）
 *         example: 2
 *       - in: query
 *         name: city_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 城市ID
 *         example: 1
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, popular, price_low, price_high]
 *           default: newest
 *         description: 排序方式
 *         example: "newest"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *         example: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: 每頁筆數
 *         example: 12
 *     responses:
 *       200:
 *         description: 成功取得課程列表
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
 *                   example: "取得公開課程清單成功"
 *                 data:
 *                   $ref: '#/components/schemas/PublicCourseListResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 */
router.get('/public', validateQuery(publicCourseQuerySchema), publicCourseController.getPublicCourses)

/**
 * @swagger
 * /api/courses/public/{id}:
 *   get:
 *     summary: 取得公開課程詳情
 *     description: 取得指定課程的詳細資訊，包括教師資料、課程內容等
 *     tags: [Public Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得課程詳情
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
 *                   example: "取得公開課程詳情成功"
 *                 data:
 *                   type: object
 *                   description: 詳細的課程資訊
 *       404:
 *         description: 課程不存在或未發布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       400:
 *         description: 課程ID格式錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 */
router.get('/public/:id', validateParams(courseIdParamSchema), publicCourseController.getPublicCourseDetail)

/**
 * @swagger
 * /api/reviews/courses/{id}:
 *   get:
 *     summary: 取得課程評價列表
 *     description: 取得指定課程的評價列表，支援評分篩選、排序和分頁
 *     tags: [Public Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程ID
 *         example: 1
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: 評分篩選（1-5星）
 *         example: 5
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, rating_high, rating_low]
 *           default: newest
 *         description: 排序方式
 *         example: "newest"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
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
 *     responses:
 *       200:
 *         description: 成功取得評價列表
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
 *                   example: "取得課程評價列表成功"
 *                 data:
 *                   type: object
 *                   description: 評價列表資料
 *       404:
 *         description: 課程不存在或未發布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 */
export default router