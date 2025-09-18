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
 * /api/courses/public:
 *   get:
 *     summary: 取得公開課程列表
 *     description: |
 *       瀏覽公開課程列表，支援關鍵字搜索、分類篩選、地區篩選和多種排序方式。
 *       此 API 無需認證，所有用戶都可存取，只顯示已發布狀態的課程。
 *       
 *       **搜索方式：**
 *       - 關鍵字搜索：在課程名稱和內容中搜索
 *       - 分類篩選：支援主分類和次分類篩選
 *       - 地區篩選：依據課程地點篩選
 *       
 *       **排序選項：**
 *       - newest：最新發布優先（預設）
 *       - popular：熱門程度排序（依據瀏覽次數和評價）
 *       - price_low：價格由低到高
 *       - price_high：價格由高到低
 *     tags:
 *       - Public Courses
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: 搜索關鍵字，在課程名稱和描述中搜索
 *         example: "Python"
 *       - in: query
 *         name: main_category_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 主分類 ID
 *         example: 1
 *       - in: query
 *         name: sub_category_id
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 次分類 ID
 *         example: 2
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: 城市名稱，用於地區篩選
 *         example: '台北市'
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, popular, price_low, price_high]
 *           default: newest
 *         description: 排序方式
 *         example: "popular"
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
 *         description: 每頁顯示數量
 *         example: 12
 *     responses:
 *       200:
 *         description: 成功取得公開課程列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         courses:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PublicCourseBasicInfo'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *             examples:
 *               success:
 *                 summary: 成功回應範例
 *                 value:
 *                   status: "success"
 *                   message: "成功取得公開課程列表"
 *                   data:
 *                     courses:
 *                       - id: 1
 *                         name: "Python 程式設計基礎"
 *                         description: "完整的 Python 入門課程"
 *                         teacher_name: "張老師"
 *                         teacher_id: 1
 *                         main_category: "程式設計"
 *                         sub_category: "Python"
 *                         price_range: "1500-3000"
 *                         rating: 4.8
 *                         review_count: 25
 *                         view_count: 150
 *                         created_at: "2024-01-15T10:00:00Z"
 *                         updated_at: "2024-01-20T15:30:00Z"
 *                     pagination:
 *                       current_page: 1
 *                       per_page: 12
 *                       total: 1
 *                       total_pages: 1
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/public', validateQuery(publicCourseQuerySchema), publicCourseController.getPublicCourses)

/**
 * @swagger
 * /api/courses/public/{id}:
 *   get:
 *     summary: 取得公開課程詳情
 *     description: |
 *       瀏覽指定公開課程的詳細資訊，包含課程完整描述、教師資訊、價格方案、評價統計等。
 *       此 API 無需認證，所有用戶都可存取。
 *       
 *       **功能說明：**
 *       - 自動增加課程瀏覽次數
 *       - 只能瀏覽已發布狀態的課程
 *       - 包含教師公開資訊和課程價格方案
 *       - 提供評價統計資料
 *     tags:
 *       - Public Courses
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得課程詳情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PublicCourseDetailInfo'
 *             examples:
 *               success:
 *                 summary: 成功回應範例
 *                 value:
 *                   status: "success"
 *                   message: "成功取得課程詳情"
 *                   data:
 *                     id: 1
 *                     name: "Python 程式設計基礎"
 *                     description: "完整的 Python 程式設計入門課程，從基礎語法開始教學"
 *                     content: "詳細的課程內容說明..."
 *                     teacher:
 *                       id: 1
 *                       name: "張老師"
 *                       introduction: "資深程式設計講師"
 *                       rating: 4.9
 *                       total_students: 200
 *                     main_category: "程式設計"
 *                     sub_category: "Python"
 *                     city: "台北市"
 *                     price_options:
 *                       - id: 1
 *                         name: "單堂課程"
 *                         price: 1500
 *                         quantity: 1
 *                         description: "一對一個人指導"
 *                     rating: 4.8
 *                     review_count: 25
 *                     view_count: 151
 *                     status: "published"
 *                     created_at: "2024-01-15T10:00:00Z"
 *                     updated_at: "2024-01-20T15:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         description: 課程不存在或未發布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 課程不存在
 *                 value:
 *                   status: "error"
 *                   message: "課程不存在或未發布"
 *                   error_code: "COURSE_NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/public/:id', validateParams(courseIdParamSchema), publicCourseController.getPublicCourseDetail)

export default router