/**
 * 公開課程路由
 * 
 * 提供公開課程瀏覽的 API 端點，包括：
 * - GET /api/courses/public - 公開課程列表（支援搜尋和篩選）
 * - GET /api/courses/public/:id - 公開課程詳情
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
 *     tags:
 *       - Public Courses
 *     summary: 取得公開課程列表
 *     description: |
 *       瀏覽公開課程列表，支援關鍵字搜索、分類篩選、地區篩選和多種排序方式。
 *       此 API 無需認證，所有用戶都可存取，只顯示已發布狀態的課程。
 *       
 *       **功能說明：**
 *       - 關鍵字搜索：在課程名稱和內容中搜索
 *       - 分類篩選：支援主分類和次分類篩選
 *       - 地區篩選：依據課程地點篩選
 *       - 排序選項：newest(最新)、popular(熱門)、price_low(價格低到高)、price_high(價格高到低)
 *       
 *       **業務邏輯：**
 *       - 只查詢已發布 (published) 狀態的課程
 *       - 支援分頁查詢，預設每頁 12 筆
 *       - 回傳課程基本資訊、教師資訊、價格範圍等
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: 搜尋關鍵字，在課程名稱和內容中搜尋
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
 *         description: 每頁顯示數量
 *         example: 12
 *     responses:
 *       200:
 *         description: 成功取得公開課程列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicCourseListSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/public', validateQuery(publicCourseQuerySchema), publicCourseController.getPublicCourses)

/**
 * @swagger
 * /api/courses/public/{id}:
 *   get:
 *     tags:
 *       - Public Courses
 *     summary: 取得公開課程詳情
 *     description: |
 *       瀏覽指定公開課程的詳細資訊，包含課程完整描述、教師資訊、價格方案和關聯的短影音。
 *       此 API 無需認證，所有用戶都可存取。
 *       
 *       **功能說明：**
 *       - 只能瀏覽已發布 (published) 狀態的課程
 *       - 自動增加課程瀏覽次數
 *       - 包含教師公開資訊和課程價格方案
 *       - 包含課程關聯的短影音列表（如有）
 *       - 提供完整的課程詳情資料
 *       
 *       **短影音功能：**
 *       - 回傳課程關聯的短影音列表
 *       - 包含影片標題、縮圖、播放 URL 等資訊
 *       - 按照教師設定的顯示順序排列
 *       - 學生可直接在課程詳情頁觀看相關影片
 *       
 *       **業務邏輯：**
 *       - 驗證課程存在且為已發布狀態
 *       - 查詢課程詳細資訊、教師資訊、價格方案
 *       - 查詢課程關聯的短影音資料
 *       - 異步增加瀏覽次數（不影響回應時間）
 *       - 回傳完整課程詳情資料結構
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 2
 *     responses:
 *       200:
 *         description: 成功取得課程詳情
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicCourseDetailSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: 課程不存在或未發布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublicCourseNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/public/:id', validateParams(courseIdParamSchema), publicCourseController.getPublicCourseDetail)

export default router