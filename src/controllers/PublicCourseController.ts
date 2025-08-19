/**
 * 公開課程控制器
 * 
 * 處理公開課程瀏覽相關的 HTTP 請求，包括：
 * - GET /api/courses/public - 公開課程列表（支援搜尋）
 * - GET /api/courses/public/:id - 公開課程詳情
 * - GET /api/reviews/courses/:id - 課程評價列表
 */

import { Request, Response, NextFunction } from 'express'
import { PublicCourseService } from '@services/publicCourseService'
import { handleErrorAsync, handleSuccess } from '@utils/index'
import { SUCCESS } from '@constants/Message'

const publicCourseService = new PublicCourseService()

export class PublicCourseController {
  /**
   * @swagger
   * /api/courses/public:
   *   get:
   *     summary: 取得公開課程列表
   *     description: 支援關鍵字搜尋、分類篩選和排序功能的公開課程列表
   *     tags: [Public Courses]
   *     parameters:
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *         description: 關鍵字搜尋（搜尋課程名稱和內容）
   *         example: "Python"
   *       - in: query
   *         name: main_category_id
   *         schema:
   *           type: integer
   *         description: 主分類ID
   *         example: 1
   *       - in: query
   *         name: sub_category_id
   *         schema:
   *           type: integer
   *         description: 次分類ID（需要與main_category_id一起使用）
   *         example: 2
   *       - in: query
   *         name: city_id
   *         schema:
   *           type: integer
   *         description: 城市ID（篩選教師所在城市）
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
   *                   example: "成功取得公開課程列表"
   *                 data:
   *                   type: object
   *                   properties:
   *                     courses:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/CourseListItem'
   *                     pagination:
   *                       $ref: '#/components/schemas/PaginationInfo'
   *                     filters:
   *                       $ref: '#/components/schemas/CourseFilters'
   *       400:
   *         description: 請求參數無效
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 伺服器錯誤
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getPublicCourses = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as any
    
    const result = await publicCourseService.getPublicCourses(query)

    // 檢查是否有結果
    const message = result.courses.length === 0 
      ? SUCCESS.PUBLIC_COURSE_NO_COURSES_FOUND 
      : SUCCESS.PUBLIC_COURSE_LIST_SUCCESS

    res.json(handleSuccess(result, message))
  })

  /**
   * @swagger
   * /api/courses/public/{id}:
   *   get:
   *     summary: 取得公開課程詳情
   *     description: 取得指定課程的詳細資訊，包括課程內容、教師資訊、評價統計等
   *     tags: [Public Courses]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: 課程ID
   *         example: 41
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
   *                   example: "成功取得課程詳情"
   *                 data:
   *                   $ref: '#/components/schemas/CourseDetail'
   *       404:
   *         description: 課程不存在或未發布
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 伺服器錯誤
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getPublicCourseDetail = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.id)
    
    // 基本ID格式驗證
    if (isNaN(courseId) || courseId <= 0) {
      const { BusinessError } = await import('@utils/errors')
      const { ERROR_CODES } = await import('@constants/ErrorCode')
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, '課程不存在', 404)
    }
    
    const course = await publicCourseService.getPublicCourseDetail(courseId)

    res.json(handleSuccess(course, SUCCESS.PUBLIC_COURSE_DETAIL_SUCCESS))
  })

  /**
   * @swagger
   * /api/reviews/courses/{id}:
   *   get:
   *     summary: 取得課程評價列表
   *     description: 取得指定課程的評價列表，支援評分篩選和排序
   *     tags: [Course Reviews]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: 課程ID
   *         example: 65
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
   *                   example: "成功取得課程評價"
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
   *         description: 請求參數無效
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       404:
   *         description: 課程不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 伺服器錯誤
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getCourseReviews = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.id)
    const query = req.query as any
    
    const result = await publicCourseService.getCourseReviews(courseId, query)

    res.json(handleSuccess(result, SUCCESS.PUBLIC_COURSE_REVIEWS_SUCCESS))
  })
}

export const publicCourseController = new PublicCourseController()