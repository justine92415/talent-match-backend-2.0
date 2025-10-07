/**
 * 首頁路由
 *
 * 提供首頁的 API 端點，包括：
 * - GET /api/home/reviews-summary - 取得評論摘要
 * - GET /api/home/short-videos - 取得短影片列表
 * - GET /api/home/recommended-courses - 取得推薦課程
 */

import { Router } from 'express'
import { homeController } from '@controllers/homeController'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { reviewsSummaryQuerySchema } from '@middleware/schemas/system/homeSchemas'
import { recommendedCoursesQuerySchema, shortVideosQuerySchema } from '@middleware/schemas/home'

const router = Router()

/**
 * @swagger
 * /api/home/reviews-summary:
 *   get:
 *     tags:
 *       - Home
 *     summary: 取得評論摘要
 *     description: |
 *       取得首頁評論摘要資訊，包含整體平均評分和精選評論列表。
 *       
 *       **業務邏輯**：
 *       - 計算所有可見評論的平均評分（四捨五入到小數點第一位）
 *       - 篩選精選評論條件：評分 >= 4、內容長度 >= 20 字、評論可見、學生身份
 *       - 每位學生最多顯示一則評論（取最新的）
 *       - 可透過 limit 參數控制精選評論數量（預設 6，最大 20）
 *       
 *       **公開路由**：不需要認證
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 6
 *         description: 精選評論數量（預設 6，最小 1，最大 20）
 *         required: false
 *     responses:
 *       200:
 *         description: 成功取得評論摘要
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReviewsSummarySuccessResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomeValidationErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/reviews-summary', createSchemasMiddleware({ query: reviewsSummaryQuerySchema }), homeController.getReviewsSummary)

/**
 * @swagger
 * /api/home/short-videos:
 *   get:
 *     tags:
 *       - Home
 *     summary: 取得短影片列表
 *     description: |
 *       取得首頁短影片推薦列表，依據評分、熱門度、完整度排序。
 *       
 *       **業務邏輯**：
 *       - 僅顯示已發布課程的影片
 *       - 可依主分類篩選（選填）
 *       - 排序優先權（由高到低）：
 *         1. 課程評分高（>= 4.5 優先）
 *         2. 近期熱門（最近 30 天預約數多）
 *         3. 影片完整度（有標題、videoUrl）
 *         4. 最新發布（createdAt DESC）
 *       
 *       **公開路由**：不需要認證
 *     parameters:
 *       - in: query
 *         name: mainCategoryId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 主分類 ID，用於篩選特定分類的影片（選填）
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: 返回數量（預設 5，最小 1，最大 20）
 *         required: false
 *     responses:
 *       200:
 *         description: 成功取得短影片列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShortVideosSuccessResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomeValidationErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/short-videos', createSchemasMiddleware({ query: shortVideosQuerySchema }), homeController.getShortVideos)

/**
 * @swagger
 * /api/home/recommended-courses:
 *   get:
 *     tags:
 *       - Home
 *     summary: 取得推薦課程
 *     description: |
 *       取得首頁推薦課程列表，依據地區匹配、評分、可預約性、完整度排序。
 *       
 *       **業務邏輯**：
 *       - 僅顯示已發布課程且教師帳號啟用中
 *       - 可依城市名稱優先顯示該地區課程（選填）
 *       - 排序優先權（由高到低）：
 *         1. 地區匹配優先（如有 city，該地區課程排前面）
 *         2. 評分加權：(平均評分 × 0.7) + (評論數量 × 0.3 / 100)
 *         3. 可預約性：教師有設定 TeacherAvailableSlot
 *         4. 課程完整度：有 coverImage、description、price
 *       - 多樣性控制：同一教師最多顯示 1 堂課
 *       
 *       **公開路由**：不需要認證
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: 城市名稱，用於優先顯示該地區課程（選填，例如：臺北市、新北市）
 *         required: false
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 6
 *         description: 返回數量（預設 6，最小 1，最大 20）
 *         required: false
 *     responses:
 *       200:
 *         description: 成功取得推薦課程
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecommendedCoursesSuccessResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HomeValidationErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/recommended-courses', createSchemasMiddleware({ query: recommendedCoursesQuerySchema }), homeController.getRecommendedCourses)

export default router
