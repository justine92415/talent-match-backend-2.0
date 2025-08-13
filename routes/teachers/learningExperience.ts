import { Router } from 'express'
import { TeacherLearningExperienceController } from '../../controllers/teachers/TeacherLearningExperienceController'
import { authenticateToken } from '../../middleware/auth'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     TeacherLearningExperienceRequest:
 *       type: object
 *       required:
 *         - is_in_school
 *         - school_name
 *         - department
 *         - degree
 *         - start_year
 *         - start_month
 *       properties:
 *         is_in_school:
 *           type: boolean
 *           description: 是否為目前就學
 *           example: true
 *         school_name:
 *           type: string
 *           description: 學校名稱
 *           example: "國立台灣大學"
 *           minLength: 1
 *           maxLength: 100
 *         department:
 *           type: string
 *           description: 科系名稱
 *           example: "資訊工程學系"
 *           minLength: 1
 *           maxLength: 100
 *         degree:
 *           type: string
 *           description: 學位
 *           example: "學士"
 *           minLength: 1
 *           maxLength: 50
 *         region:
 *           type: string
 *           description: 地區
 *           example: "台灣"
 *           minLength: 1
 *           maxLength: 50
 *         start_year:
 *           type: number
 *           description: 開始年份
 *           example: 2020
 *           minimum: 1900
 *         start_month:
 *           type: number
 *           description: 開始月份
 *           example: 9
 *           minimum: 1
 *           maximum: 12
 *         end_year:
 *           type: number
 *           description: 結束年份（目前就學可選）
 *           example: 2024
 *           minimum: 1900
 *         end_month:
 *           type: number
 *           description: 結束月份（目前就學可選）
 *           example: 6
 *           minimum: 1
 *           maximum: 12
 *     TeacherLearningExperienceResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         teacher_id:
 *           type: number
 *           example: 123
 *         is_in_school:
 *           type: boolean
 *           example: true
 *         school_name:
 *           type: string
 *           example: "國立台灣大學"
 *         department:
 *           type: string
 *           example: "資訊工程學系"
 *         degree:
 *           type: string
 *           example: "學士"
 *         region:
 *           type: string
 *           example: "台灣"
 *         start_year:
 *           type: number
 *           example: 2020
 *         start_month:
 *           type: number
 *           example: 9
 *         end_year:
 *           type: number
 *           example: 2024
 *         end_month:
 *           type: number
 *           example: 6
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-08T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-08T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/teachers/learning-experiences:
 *   get:
 *     tags:
 *       - 教師學習經歷
 *     summary: 取得學習經歷列表
 *     description: |
 *       取得當前教師的學習經歷列表
 *
 *       **業務規則：**
 *       - 只能查看自己的學習經歷
 *       - 按建立時間排序
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 查詢成功
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
 *                         learning_experiences:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherLearningExperienceResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, TeacherLearningExperienceController.getLearningExperiences)

/**
 * @swagger
 * /api/teachers/learning-experiences:
 *   post:
 *     tags:
 *       - 教師學習經歷
 *     summary: 建立學習經歷
 *     description: |
 *       新增一筆學習經歷記錄
 *
 *       **業務規則：**
 *       - 目前就學不需要填寫結束時間
 *       - 已畢業必須填寫結束時間
 *       - 結束時間必須晚於開始時間
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherLearningExperienceRequest'
 *     responses:
 *       201:
 *         description: 建立成功
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
 *                         learning_experience:
 *                           $ref: '#/components/schemas/TeacherLearningExperienceResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, TeacherLearningExperienceController.createLearningExperience)

/**
 * @swagger
 * /api/teachers/learning-experiences/{id}:
 *   put:
 *     tags:
 *       - 教師學習經歷
 *     summary: 更新學習經歷
 *     description: |
 *       更新指定的學習經歷記錄
 *
 *       **業務規則：**
 *       - 只能更新自己的學習經歷
 *       - 目前就學不需要填寫結束時間
 *       - 已畢業必須填寫結束時間
 *       - 結束時間必須晚於開始時間
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師且為資源擁有者
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 學習經歷ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherLearningExperienceRequest'
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                         learning_experience:
 *                           $ref: '#/components/schemas/TeacherLearningExperienceResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticateToken, TeacherLearningExperienceController.updateLearningExperience)

/**
 * @swagger
 * /api/teachers/learning-experiences/{id}:
 *   delete:
 *     tags:
 *       - 教師學習經歷
 *     summary: 刪除學習經歷
 *     description: |
 *       刪除指定的學習經歷記錄
 *
 *       **業務規則：**
 *       - 只能刪除自己的學習經歷
 *       - 刪除操作不可恢復
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師且為資源擁有者
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 學習經歷ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticateToken, TeacherLearningExperienceController.deleteLearningExperience)

export default router
