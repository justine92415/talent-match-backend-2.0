/**
 * 課程路由
 * 
 * 提供課程管理的 API 端點，包括：
 * - POST /api/courses - 建立課程
 * - PUT /api/courses/:id - 更新課程
 * - GET /api/courses/:id - 取得課程詳情
 * - GET /api/courses - 教師課程列表
 * - DELETE /api/courses/:id - 刪除課程
 * 
 * 所有端點都需要教師身份認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { CourseController } from '@controllers/CourseController'
import { CourseVideoController } from '@controllers/CourseVideoController'
import { CourseFileController } from '@controllers/CourseFileController'
import { 
  validateCreateCourse,
  validateUpdateCourse,
  validateCourseId,
  validateCourseListQuery
} from '@middleware/validation/courseValidation'
import {
  validateLinkVideosToCourse,
  validateUpdateVideoOrder,
  validateRemoveCourseVideo,
  validateGetCourseVideos
} from '@middleware/validation'
import {
  validateGetCourseFiles,
  validateUploadCourseFiles,
  validateDeleteCourseFile
} from '@middleware/validation/courseFileValidation'

const router = Router()
const courseController = new CourseController()

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: 課程管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCourseRequest:
 *       type: object
 *       required:
 *         - name
 *         - content
 *         - main_category_id
 *         - sub_category_id
 *         - city_id
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: 課程名稱
 *           example: "JavaScript 基礎程式設計"
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           description: 課程內容描述
 *           example: "從零開始學習 JavaScript，包含基礎語法、DOM 操作等"
 *         main_category_id:
 *           type: integer
 *           description: 主分類 ID
 *           example: 1
 *         sub_category_id:
 *           type: integer
 *           description: 子分類 ID
 *           example: 1
 *         city_id:
 *           type: integer
 *           description: 城市 ID
 *           example: 1
 *         survey_url:
 *           type: string
 *           format: uri
 *           maxLength: 500
 *           description: 問卷調查連結（選填）
 *           example: "https://survey.example.com/course-feedback"
 *         purchase_message:
 *           type: string
 *           maxLength: 500
 *           description: 購買後訊息（選填）
 *           example: "感謝購買本課程，請查收課程相關資訊"
 * 
 *     UpdateCourseRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: 課程名稱
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           description: 課程內容描述
 *         main_category_id:
 *           type: integer
 *           description: 主分類 ID
 *         sub_category_id:
 *           type: integer
 *           description: 子分類 ID
 *         city_id:
 *           type: integer
 *           description: 城市 ID
 *         survey_url:
 *           type: string
 *           format: uri
 *           maxLength: 500
 *           description: 問卷調查連結
 *         purchase_message:
 *           type: string
 *           maxLength: 500
 *           description: 購買後訊息
 * 
 *     CourseResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 課程 ID
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: 課程 UUID
 *         teacher_id:
 *           type: integer
 *           description: 教師 ID
 *         name:
 *           type: string
 *           description: 課程名稱
 *         content:
 *           type: string
 *           nullable: true
 *           description: 課程內容
 *         main_image:
 *           type: string
 *           nullable: true
 *           description: 課程主圖片
 *         rate:
 *           type: number
 *           description: 課程評分
 *         review_count:
 *           type: integer
 *           description: 評價數量
 *         view_count:
 *           type: integer
 *           description: 觀看次數
 *         purchase_count:
 *           type: integer
 *           description: 購買次數
 *         student_count:
 *           type: integer
 *           description: 學生數量
 *         main_category_id:
 *           type: integer
 *           nullable: true
 *           description: 主分類 ID
 *         sub_category_id:
 *           type: integer
 *           nullable: true
 *           description: 子分類 ID
 *         city_id:
 *           type: integer
 *           nullable: true
 *           description: 城市 ID
 *         survey_url:
 *           type: string
 *           nullable: true
 *           description: 問卷調查連結
 *         purchase_message:
 *           type: string
 *           nullable: true
 *           description: 購買後訊息
 *         status:
 *           type: string
 *           enum: [draft, under_review, published, archived]
 *           description: 課程狀態
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 * 
 *     CourseListResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 課程 ID
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: 課程 UUID
 *         name:
 *           type: string
 *           description: 課程名稱
 *         main_image:
 *           type: string
 *           nullable: true
 *           description: 課程主圖片
 *         rate:
 *           type: number
 *           description: 課程評分
 *         review_count:
 *           type: integer
 *           description: 評價數量
 *         student_count:
 *           type: integer
 *           description: 學生數量
 *         status:
 *           type: string
 *           enum: [draft, under_review, published, archived]
 *           description: 課程狀態
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: 建立新課程
 *     description: 教師建立新的課程，需要提供課程基本資訊
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       201:
 *         description: 課程建立成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足，需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, validateCreateCourse, courseController.createCourse)

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     tags: [Courses]
 *     summary: 更新課程資訊
 *     description: 教師更新自己的課程資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourseRequest'
 *     responses:
 *       200:
 *         description: 課程更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足，只能更新自己的課程
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
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticateToken, validateCourseId, validateUpdateCourse, courseController.updateCourse)

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: 取得課程詳情
 *     description: 取得指定課程的詳細資訊，包含完整的課程內容
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
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
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足，只能查看自己的課程
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
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticateToken, validateCourseId, courseController.getCourse)

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: 取得教師課程列表
 *     description: 取得當前教師的所有課程列表，支援分頁和排序
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁數
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, name, price]
 *           default: createdAt
 *         description: 排序欄位
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方式
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
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CourseListResponse'
 *                     total:
 *                       type: integer
 *                       description: 總課程數量
 *                     page:
 *                       type: integer
 *                       description: 當前頁數
 *                     limit:
 *                       type: integer
 *                       description: 每頁筆數
 *       400:
 *         description: 查詢參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, validateCourseListQuery, courseController.getCourseList)

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: 刪除課程
 *     description: 教師刪除自己的課程，只能刪除尚未有學生報名的課程
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     responses:
 *       200:
 *         description: 課程刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 課程已成功刪除
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足或課程無法刪除
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
 *       409:
 *         description: 課程已有學生報名，無法刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticateToken, validateCourseId, courseController.deleteCourse)

// 課程狀態管理路由

/**
 * @swagger
 * /api/courses/{id}/submit:
 *   post:
 *     tags: [Courses]
 *     summary: 提交課程審核
 *     description: 教師將草稿狀態的課程提交審核，課程狀態會從 draft 變更為 under_review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 description: 提交備註（選填）
 *                 example: "課程內容已完成，請審核"
 *     responses:
 *       200:
 *         description: 課程提交審核成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: 課程狀態不允許提交或參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足，只能提交自己的課程
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
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/submit', authenticateToken, validateCourseId, courseController.submitCourse)

/**
 * @swagger
 * /api/courses/{id}/resubmit:
 *   post:
 *     tags: [Courses]
 *     summary: 重新提交課程審核
 *     description: 教師重新提交被退回的課程，課程狀態會從 draft 變更為 under_review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 description: 重新提交備註（選填）
 *                 example: "已修正審核意見中的問題"
 *     responses:
 *       200:
 *         description: 課程重新提交成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: 課程狀態不允許重新提交或參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足，只能重新提交自己的課程
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
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/resubmit', authenticateToken, validateCourseId, courseController.resubmitCourse)

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   post:
 *     tags: [Courses]
 *     summary: 發布課程
 *     description: 管理員或系統將已審核通過的課程發布上線，課程狀態會從 under_review 變更為 published
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     responses:
 *       200:
 *         description: 課程發布成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: 課程狀態不允許發布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足，只能發布自己的課程
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
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/publish', authenticateToken, validateCourseId, courseController.publishCourse)

/**
 * @swagger
 * /api/courses/{id}/archive:
 *   post:
 *     tags: [Courses]
 *     summary: 封存課程
 *     description: 教師將已發布的課程封存下架，課程狀態會從 published 變更為 archived
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: 封存原因（選填）
 *                 example: "課程內容需要重新調整"
 *     responses:
 *       200:
 *         description: 課程封存成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: 課程狀態不允許封存或參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足，只能封存自己的課程
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
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/archive', authenticateToken, validateCourseId, courseController.archiveCourse)

// ========================================
// 課程影片關聯路由
// ========================================

/**
 * @swagger
 * /api/courses/{id}/videos:
 *   post:
 *     tags: [Courses]
 *     summary: 連結影片到課程
 *     description: 教師將多個影片連結到課程，設定顯示順序和預覽標示
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - video_ids
 *               - order_info
 *             properties:
 *               video_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 maxItems: 50
 *                 description: 要連結的影片ID列表
 *                 example: [1, 2, 3]
 *               order_info:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - video_id
 *                     - display_order
 *                   properties:
 *                     video_id:
 *                       type: integer
 *                       description: 影片ID
 *                     display_order:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 1000
 *                       description: 顯示順序
 *                     is_preview:
 *                       type: boolean
 *                       default: false
 *                       description: 是否為預覽影片
 *                 description: 影片順序設定資訊
 *                 example:
 *                   - video_id: 1
 *                     display_order: 1
 *                     is_preview: true
 *                   - video_id: 2
 *                     display_order: 2
 *                     is_preview: false
 *     responses:
 *       201:
 *         description: 影片連結成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     linked_count:
 *                       type: integer
 *                       description: 成功連結的影片數量
 *                     course_videos:
 *                       type: array
 *                       description: 連結的課程影片列表
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *       403:
 *         description: 權限不足，只能連結到自己的課程
 *       404:
 *         description: 課程或影片不存在
 *       500:
 *         description: 伺服器內部錯誤
 */
router.post('/:id/videos', authenticateToken, validateLinkVideosToCourse, CourseVideoController.linkVideos)

/**
 * @swagger
 * /api/courses/{course_id}/videos/order:
 *   put:
 *     tags: [Courses]
 *     summary: 更新課程影片順序
 *     description: 教師更新課程中影片的顯示順序
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - video_orders
 *             properties:
 *               video_orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - video_id
 *                     - display_order
 *                   properties:
 *                     video_id:
 *                       type: integer
 *                       description: 影片ID
 *                     display_order:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 1000
 *                       description: 新的顯示順序
 *                 description: 影片順序更新資訊
 *                 example:
 *                   - video_id: 2
 *                     display_order: 1
 *                   - video_id: 1
 *                     display_order: 2
 *     responses:
 *       200:
 *         description: 順序更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     updated_count:
 *                       type: integer
 *                       description: 更新的影片數量
 *       400:
 *         description: 請求參數驗證失敗
 *       401:
 *         description: 未認證或認證失敗
 *       403:
 *         description: 權限不足，只能更新自己的課程
 *       404:
 *         description: 課程不存在
 *       500:
 *         description: 伺服器內部錯誤
 */
router.put('/:course_id/videos/order', authenticateToken, validateUpdateVideoOrder, CourseVideoController.updateVideoOrder)

/**
 * @swagger
 * /api/courses/{course_id}/videos/{video_id}:
 *   delete:
 *     tags: [Courses]
 *     summary: 移除課程影片關聯
 *     description: 教師移除課程中的特定影片
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *       - in: path
 *         name: video_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 影片 ID
 *     responses:
 *       200:
 *         description: 影片移除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 課程影片關聯已成功移除
 *       401:
 *         description: 未認證或認證失敗
 *       403:
 *         description: 權限不足，只能移除自己課程的影片
 *       404:
 *         description: 課程或影片關聯不存在
 *       500:
 *         description: 伺服器內部錯誤
 */
router.delete('/:course_id/videos/:video_id', authenticateToken, validateRemoveCourseVideo, CourseVideoController.removeCourseVideo)

/**
 * @swagger
 * /api/courses/{id}/videos:
 *   get:
 *     tags: [Courses]
 *     summary: 取得課程影片列表
 *     description: 取得指定課程的所有影片，按照顯示順序排列
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     responses:
 *       200:
 *         description: 成功取得課程影片列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     course_id:
 *                       type: integer
 *                       description: 課程ID
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 課程影片關聯ID
 *                           video_id:
 *                             type: integer
 *                             description: 影片ID
 *                           display_order:
 *                             type: integer
 *                             description: 顯示順序
 *                           is_preview:
 *                             type: boolean
 *                             description: 是否為預覽影片
 *                           video:
 *                             type: object
 *                             description: 影片詳細資訊
 *                     total_count:
 *                       type: integer
 *                       description: 總影片數量
 *       401:
 *         description: 未認證或認證失敗
 *       403:
 *         description: 權限不足，只能查看自己的課程
 *       404:
 *         description: 課程不存在
 *       500:
 *         description: 伺服器內部錯誤
 */
router.get('/:id/videos', authenticateToken, validateGetCourseVideos, CourseVideoController.getCourseVideos)

// ==================== 課程檔案管理路由 ====================

/**
 * @swagger
 * /api/courses/{id}/files:
 *   get:
 *     tags: [Courses]
 *     summary: 取得課程檔案列表
 *     description: 取得指定課程的檔案列表，支援分頁查詢。只能查看自己課程的檔案。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁數量
 *     responses:
 *       200:
 *         description: 成功取得課程檔案列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 檔案ID
 *                           uuid:
 *                             type: string
 *                             format: uuid
 *                             description: 檔案唯一識別碼
 *                           course_id:
 *                             type: integer
 *                             description: 課程ID
 *                           name:
 *                             type: string
 *                             description: 檔案名稱
 *                           file_id:
 *                             type: string
 *                             format: uuid
 *                             description: 檔案系統ID
 *                           url:
 *                             type: string
 *                             description: 檔案存取網址
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             description: 建立時間
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                             description: 更新時間
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         per_page:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         has_next_page:
 *                           type: boolean
 *                         has_prev_page:
 *                           type: boolean
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_files:
 *                           type: integer
 *                           description: 總檔案數量
 *       401:
 *         description: 未認證或認證失敗
 *       403:
 *         description: 權限不足，只能查看自己的課程檔案
 *       404:
 *         description: 課程不存在
 *       500:
 *         description: 伺服器內部錯誤
 */
router.get('/:id/files', authenticateToken, validateGetCourseFiles, CourseFileController.getCourseFiles)

/**
 * @swagger
 * /api/courses/{id}/files:
 *   post:
 *     tags: [Courses]
 *     summary: 上傳課程檔案
 *     description: 上傳檔案到指定課程。支援多檔案上傳，檔案格式和大小限制請參考文件。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 要上傳的檔案（最多10個檔案）
 *               descriptions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   maxLength: 500
 *                 description: 檔案描述（可選）
 *     responses:
 *       201:
 *         description: 檔案上傳成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       success:
 *                         type: boolean
 *                         description: 上傳是否成功
 *                       file:
 *                         type: object
 *                         description: 上傳成功的檔案資訊
 *                       error:
 *                         type: string
 *                         description: 錯誤訊息（如果上傳失敗）
 *                       originalName:
 *                         type: string
 *                         description: 原始檔案名稱
 *       400:
 *         description: 請求參數錯誤或檔案驗證失敗
 *       401:
 *         description: 未認證或認證失敗
 *       403:
 *         description: 權限不足，只能管理自己的課程檔案
 *       404:
 *         description: 課程不存在
 *       500:
 *         description: 伺服器內部錯誤
 */
router.post('/:id/files', authenticateToken, validateUploadCourseFiles, CourseFileController.uploadCourseFiles)

/**
 * @swagger
 * /api/courses/{course_id}/files/{file_id}:
 *   delete:
 *     tags: [Courses]
 *     summary: 刪除課程檔案
 *     description: 刪除指定課程的指定檔案。只能刪除自己課程的檔案。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *       - in: path
 *         name: file_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 檔案 ID
 *     responses:
 *       200:
 *         description: 檔案刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 檔案已刪除
 *       401:
 *         description: 未認證或認證失敗
 *       403:
 *         description: 權限不足，只能刪除自己課程的檔案
 *       404:
 *         description: 課程或檔案不存在
 *       500:
 *         description: 伺服器內部錯誤
 */
router.delete('/:course_id/files/:file_id', authenticateToken, validateDeleteCourseFile, CourseFileController.deleteCourseFile)

export default router