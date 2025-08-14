import { Router } from 'express'
import { CourseController } from '../controllers/CourseController'
import { authenticateToken } from '../middleware/auth'
import { validateTeacherAccess } from '../middleware/teacherValidation'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCourseRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: 課程名稱
 *           example: "JavaScript 基礎入門課程"
 *           minLength: 1
 *           maxLength: 200
 *         content:
 *           type: string
 *           description: 課程描述（草稿時可選）
 *           example: "這是一門專為初學者設計的 JavaScript 基礎課程"
 *         main_category_id:
 *           type: integer
 *           description: 主分類ID（草稿時可選）
 *           example: 1
 *         sub_category_id:
 *           type: integer
 *           description: 次分類ID（草稿時可選）
 *           example: 1
 *         city_id:
 *           type: integer
 *           description: 城市ID（草稿時可選）
 *           example: 1
 *         survey_url:
 *           type: string
 *           description: 問卷網址（選填）
 *           example: "https://forms.google.com/survey123"
 *         purchase_message:
 *           type: string
 *           description: 購買後訊息（選填）
 *           example: "感謝您購買本課程，請加入 LINE 群組"
 *
 *     UpdateCourseRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 課程名稱
 *           example: "JavaScript 進階課程"
 *           maxLength: 200
 *         content:
 *           type: string
 *           description: 課程描述
 *           example: "這是一門進階的 JavaScript 課程"
 *         main_category_id:
 *           type: integer
 *           description: 主分類ID
 *           example: 1
 *         sub_category_id:
 *           type: integer
 *           description: 次分類ID
 *           example: 2
 *         city_id:
 *           type: integer
 *           description: 城市ID
 *           example: 1
 *         survey_url:
 *           type: string
 *           description: 問卷網址
 *           example: "https://forms.google.com/survey456"
 *         purchase_message:
 *           type: string
 *           description: 購買後訊息
 *           example: "歡迎加入進階學習群組"
 *
 *     CourseResponse:
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
 *         teacher_id:
 *           type: integer
 *           description: 教師ID
 *           example: 123
 *         name:
 *           type: string
 *           description: 課程名稱
 *           example: "JavaScript 基礎入門課程"
 *         main_image:
 *           type: string
 *           description: 課程封面圖片
 *           example: "/uploads/courses/course-123.jpg"
 *         content:
 *           type: string
 *           description: 課程描述
 *           example: "這是一門專為初學者設計的課程"
 *         rate:
 *           type: number
 *           description: 課程平均評分
 *           example: 4.5
 *         review_count:
 *           type: integer
 *           description: 評價總數
 *           example: 20
 *         view_count:
 *           type: integer
 *           description: 瀏覽次數
 *           example: 1500
 *         purchase_count:
 *           type: integer
 *           description: 購買次數
 *           example: 45
 *         student_count:
 *           type: integer
 *           description: 學生總數
 *           example: 40
 *         main_category_id:
 *           type: integer
 *           description: 主分類ID
 *           example: 1
 *         sub_category_id:
 *           type: integer
 *           description: 次分類ID
 *           example: 1
 *         city_id:
 *           type: integer
 *           description: 城市ID
 *           example: 1
 *         survey_url:
 *           type: string
 *           description: 問卷網址
 *           example: "https://forms.google.com/survey123"
 *         purchase_message:
 *           type: string
 *           description: 購買後訊息
 *           example: "感謝購買，請加入群組"
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: 課程狀態
 *           example: "draft"
 *         application_status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: 申請審核狀態
 *           example: null
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *           example: "2025-08-13T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 *           example: "2025-08-13T10:30:00.000Z"
 *
 *     CourseListResponse:
 *       type: object
 *       properties:
 *         courses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CourseResponse'
 *         total:
 *           type: integer
 *           description: 總課程數
 *           example: 5
 *         page:
 *           type: integer
 *           description: 當前頁碼
 *           example: 1
 *         per_page:
 *           type: integer
 *           description: 每頁筆數
 *           example: 10
 *         total_pages:
 *           type: integer
 *           description: 總頁數
 *           example: 1
 *
 *   responses:
 *     CourseCreateSuccess:
 *       description: 課程建立成功
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [success]
 *                 example: success
 *               message:
 *                 type: string
 *                 example: 建立課程成功
 *               data:
 *                 type: object
 *                 properties:
 *                   course:
 *                     $ref: '#/components/schemas/CourseResponse'
 *
 *     CourseDetailSuccess:
 *       description: 課程詳情查詢成功
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [success]
 *                 example: success
 *               message:
 *                 type: string
 *                 example: 查詢成功
 *               data:
 *                 type: object
 *                 properties:
 *                   course:
 *                     $ref: '#/components/schemas/CourseResponse'
 *
 *     CourseListSuccess:
 *       description: 課程列表查詢成功
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [success]
 *                 example: success
 *               message:
 *                 type: string
 *                 example: 查詢成功
 *               data:
 *                 $ref: '#/components/schemas/CourseListResponse'
 */

/**
 * @swagger
 * /api/courses:
 *   post:
 *     tags: [Courses]
 *     summary: 建立課程草稿
 *     description: |
 *       教師建立新課程草稿
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 必須是已審核通過的教師
 *
 *       **業務規則：**
 *       - 課程名稱為必填
 *       - 其他欄位在草稿階段均為選填
 *       - 建立後狀態為 draft
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *           examples:
 *             complete:
 *               summary: 完整課程資料
 *               value:
 *                 name: "JavaScript 基礎入門課程"
 *                 content: "這是一門專為初學者設計的 JavaScript 基礎課程"
 *                 main_category_id: 1
 *                 sub_category_id: 1
 *                 city_id: 1
 *                 survey_url: "https://forms.google.com/survey123"
 *                 purchase_message: "感謝您購買本課程"
 *             minimal:
 *               summary: 最小課程草稿
 *               value:
 *                 name: "課程草稿"
 *     responses:
 *       201:
 *         $ref: '#/components/responses/CourseCreateSuccess'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               name_required:
 *                 summary: 課程名稱必填
 *                 value:
 *                   status: error
 *                   message: 參數驗證失敗
 *                   errors:
 *                     name: ["課程名稱為必填欄位"]
 *               name_too_long:
 *                 summary: 課程名稱過長
 *                 value:
 *                   status: error
 *                   message: 參數驗證失敗
 *                   errors:
 *                     name: ["課程名稱長度不得超過200字"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_teacher:
 *                 summary: 非教師用戶
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法建立課程
 *               teacher_not_approved:
 *                 summary: 教師未通過審核
 *                 value:
 *                   status: error
 *                   message: 教師申請尚未通過審核
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticateToken, validateTeacherAccess, CourseController.createCourse)

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: 取得課程詳情
 *     description: |
 *       取得指定課程的詳細資訊
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 只能查看自己的課程
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程ID
 *         example: 1
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CourseDetailSuccess'
 *       400:
 *         description: 參數格式錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               invalid_id:
 *                 summary: 無效的課程ID
 *                 value:
 *                   status: error
 *                   message: 參數驗證失敗
 *                   errors:
 *                     id: ["課程ID格式不正確"]
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_owner:
 *                 summary: 非課程擁有者
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法查看此課程
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 課程不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的課程
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *   put:
 *     tags: [Courses]
 *     summary: 更新課程資料
 *     description: |
 *       更新課程的基本資料
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 只能更新自己的課程
 *       - 課程必須為草稿狀態且未在審核中
 *
 *       **業務規則：**
 *       - 只有草稿狀態的課程可以修改
 *       - 審核中的課程無法修改
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCourseRequest'
 *           examples:
 *             update_name:
 *               summary: 更新課程名稱
 *               value:
 *                 name: "JavaScript 進階課程"
 *             update_content:
 *               summary: 更新課程描述
 *               value:
 *                 content: "這是一門進階的 JavaScript 課程，適合有基礎的學員"
 *             update_multiple:
 *               summary: 更新多個欄位
 *               value:
 *                 name: "React 實戰課程"
 *                 content: "學習 React 框架的實戰應用"
 *                 main_category_id: 2
 *                 city_id: 1
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 更新課程成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/CourseResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足或狀態不允許
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_owner:
 *                 summary: 非課程擁有者
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法查看此課程
 *               status_not_allowed:
 *                 summary: 課程狀態不允許修改
 *                 value:
 *                   status: error
 *                   message: 課程狀態不允許修改
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', authenticateToken, validateTeacherAccess, CourseController.updateCourse)

/**
 * @swagger
 * /api/courses:
 *   get:
 *     tags: [Courses]
 *     summary: 取得教師課程列表
 *     description: |
 *       取得當前教師的所有課程列表，支援分頁和狀態篩選
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 必須是已審核通過的教師
 *
 *       **查詢功能：**
 *       - 支援課程狀態篩選
 *       - 支援分頁查詢
 *       - 預設按建立時間倒序排列
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: 課程狀態篩選
 *         example: draft
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
 *           maximum: 50
 *           default: 10
 *         description: 每頁筆數
 *         example: 10
 *     responses:
 *       200:
 *         $ref: '#/components/responses/CourseListSuccess'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_teacher:
 *                 summary: 非教師用戶
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法查看課程列表
 *               teacher_not_approved:
 *                 summary: 教師未通過審核
 *                 value:
 *                   status: error
 *                   message: 教師申請尚未通過審核
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', authenticateToken, validateTeacherAccess, CourseController.getCourseList)
router.get('/:id', authenticateToken, validateTeacherAccess, CourseController.getCourseById)

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     tags: [Courses]
 *     summary: 刪除課程
 *     description: |
 *       刪除指定的課程
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 只能刪除自己的課程
 *       - 只有草稿狀態的課程可以刪除
 *
 *       **業務規則：**
 *       - 軟刪除，不會真正從資料庫移除
 *       - 已發布或封存的課程無法刪除
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 刪除課程成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_owner:
 *                 summary: 非課程擁有者
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法刪除此課程
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               status_not_allowed:
 *                 summary: 課程狀態不允許刪除
 *                 value:
 *                   status: error
 *                   message: 只有草稿狀態的課程可以刪除
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', authenticateToken, validateTeacherAccess, CourseController.deleteCourse)

/**
 * @swagger
 * /api/courses/{id}/submit:
 *   post:
 *     tags: [Courses]
 *     summary: 提交課程審核
 *     description: |
 *       將草稿狀態的課程提交審核
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 只能提交自己的課程
 *       - 只有草稿狀態的課程可以提交
 *
 *       **業務規則：**
 *       - 提交後課程狀態仍為 draft，但 application_status 變為 pending
 *       - 審核中的課程無法再次提交
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程ID
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submission_notes:
 *                 type: string
 *                 description: 提交說明
 *                 example: "請審核我的課程"
 *           examples:
 *             with_notes:
 *               summary: 帶提交說明
 *               value:
 *                 submission_notes: "請審核我的課程，已完成所有內容"
 *             without_notes:
 *               summary: 不帶說明
 *               value: {}
 *     responses:
 *       200:
 *         description: 提交成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 課程已提交審核
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_owner:
 *                 summary: 非課程擁有者
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法提交此課程
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               status_not_allowed:
 *                 summary: 課程狀態不允許提交
 *                 value:
 *                   status: error
 *                   message: 只有草稿狀態的課程可以提交審核
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/submit', authenticateToken, validateTeacherAccess, CourseController.submitCourse)

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   post:
 *     tags: [Courses]
 *     summary: 發布課程
 *     description: |
 *       發布已審核通過的課程
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 只能發布自己的課程
 *       - 只有審核通過的課程可以發布
 *
 *       **業務規則：**
 *       - 課程 application_status 必須為 approved
 *       - 發布後課程狀態變為 published
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 發布成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 課程已成功發布
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_owner:
 *                 summary: 非課程擁有者
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法發布此課程
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_approved:
 *                 summary: 課程未審核通過
 *                 value:
 *                   status: error
 *                   message: 只有審核通過的課程可以發布
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/publish', authenticateToken, validateTeacherAccess, CourseController.publishCourse)

/**
 * @swagger
 * /api/courses/{id}/archive:
 *   post:
 *     tags: [Courses]
 *     summary: 封存課程
 *     description: |
 *       封存課程，使其不再對外顯示
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 只能封存自己的課程
 *       - 可封存草稿或已發布的課程
 *
 *       **業務規則：**
 *       - 封存後課程狀態變為 archived
 *       - 已封存的課程不會重複封存
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程ID
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               archive_reason:
 *                 type: string
 *                 description: 封存原因
 *                 example: "暫時不開課"
 *           examples:
 *             with_reason:
 *               summary: 帶封存原因
 *               value:
 *                 archive_reason: "課程內容需要重新設計"
 *             without_reason:
 *               summary: 不帶原因
 *               value: {}
 *     responses:
 *       200:
 *         description: 封存成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 課程已封存
 *                 data:
 *                   type: object
 *                   properties:
 *                     course:
 *                       $ref: '#/components/schemas/CourseResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_owner:
 *                 summary: 非課程擁有者
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法封存此課程
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: 業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               already_archived:
 *                 summary: 課程已封存
 *                 value:
 *                   status: error
 *                   message: 課程已處於封存狀態
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:id/archive', authenticateToken, validateTeacherAccess, CourseController.archiveCourse)

export default router
