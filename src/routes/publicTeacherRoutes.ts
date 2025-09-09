/**
 * 公開教師路由
 * 
 * 提供教師公開資料的 API 端點：
 * - GET /api/teachers/public/:id - 教師公開資料
 * - GET /api/teachers/public/:id/courses - 教師課程列表
 */

import { Router } from 'express'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { teacherCourseQuerySchema } from '@middleware/schemas/course/publicCourseSchemas'
import { publicTeacherController } from '@controllers/PublicTeacherController'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Public Teachers
 *   description: 公開教師資料瀏覽 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicTeacherProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 教師ID
 *           example: 41
 *         uuid:
 *           type: string
 *           description: 教師唯一識別碼
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         nick_name:
 *           type: string
 *           description: 教師暱稱
 *           example: "程式講師王老師"
 *         avatar_image:
 *           type: string
 *           description: 頭像圖片
 *           example: "/uploads/avatars/teacher.jpg"
 *         introduction:
 *           type: string
 *           description: 自我介紹
 *           example: "我是一位經驗豐富的程式設計講師"
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *           description: 專業領域
 *           example: ["Python", "網頁開發", "資料科學"]
 *         experience_years:
 *           type: integer
 *           description: 教學經驗年數
 *           example: 5
 *         total_courses:
 *           type: integer
 *           description: 開設課程總數
 *           example: 12
 *         total_students:
 *           type: integer
 *           description: 教學學生總數
 *           example: 340
 *         average_rating:
 *           type: number
 *           description: 平均評分
 *           example: 4.8
 *         review_count:
 *           type: integer
 *           description: 評價總數
 *           example: 89
 *         city:
 *           $ref: '#/components/schemas/CitySummary'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 加入時間
 * 
 *     TeacherBasicInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 45
 *         nick_name:
 *           type: string
 *           example: "數學講師李老師"
 *         avatar_image:
 *           type: string
 *           example: "/uploads/avatars/teacher2.jpg"
 *         specialties:
 *           type: array
 *           items:
 *             type: string
 *           example: ["數學", "統計學"]
 *         average_rating:
 *           type: number
 *           example: 4.6
 *         review_count:
 *           type: integer
 *           example: 45
 * 
 *     TeacherCourse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         uuid:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440001"
 *         name:
 *           type: string
 *           example: "Python 資料分析入門"
 *         content:
 *           type: string
 *           example: "從零開始學習Python資料分析技能"
 *         main_image:
 *           type: string
 *           example: "/uploads/courses/python_analysis.jpg"
 *         min_price:
 *           type: number
 *           example: 2500
 *         max_price:
 *           type: number
 *           example: 4000
 *         rate:
 *           type: number
 *           example: 4.7
 *         review_count:
 *           type: integer
 *           example: 23
 *         student_count:
 *           type: integer
 *           example: 78
 *         main_category:
 *           $ref: '#/components/schemas/CategorySummary'
 *         sub_category:
 *           $ref: '#/components/schemas/CategorySummary'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/teachers/public/{id}:
 *   get:
 *     summary: 取得教師公開資料
 *     description: 取得指定教師的公開個人資訊，包括基本資料、統計數據等
 *     tags: [Public Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師ID
 *         example: 41
 *     responses:
 *       200:
 *         description: 成功取得教師資料
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
 *                   example: "成功取得教師公開資料"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       $ref: '#/components/schemas/PublicTeacherProfile'
 *       404:
 *         description: 教師不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       400:
 *         description: 教師ID格式錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 */
router.get('/public/:id', publicTeacherController.getPublicTeacher)

/**
 * @swagger
 * /api/teachers/public/{id}/courses:
 *   get:
 *     summary: 取得教師課程列表
 *     description: 取得指定教師的已發布課程列表，支援分頁功能
 *     tags: [Public Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師ID
 *         example: 45
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
 *         description: 成功取得教師課程列表
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
 *                   example: "成功取得教師課程列表"
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TeacherCourse'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationInfo'
 *                     teacher:
 *                       $ref: '#/components/schemas/TeacherBasicInfo'
 *       404:
 *         description: 教師不存在
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
router.get('/public/:id/courses', createSchemasMiddleware({ query: teacherCourseQuerySchema }), publicTeacherController.getTeacherCourses)

export default router