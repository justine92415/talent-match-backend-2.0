import { Router } from 'express'
import { TeacherWorkExperienceController } from '../../controllers/teachers/TeacherWorkExperienceController'
import { authenticateToken } from '../../middleware/auth'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     TeacherWorkExperienceRequest:
 *       type: object
 *       required:
 *         - is_working
 *         - company_name
 *         - workplace
 *         - job_category
 *         - job_title
 *         - start_year
 *         - start_month
 *       properties:
 *         is_working:
 *           type: boolean
 *           description: 是否為目前工作
 *           example: true
 *         company_name:
 *           type: string
 *           description: 公司名稱
 *           example: "台積電"
 *           minLength: 1
 *           maxLength: 100
 *         workplace:
 *           type: string
 *           description: 工作地點
 *           example: "新竹科學園區"
 *           minLength: 1
 *           maxLength: 100
 *         job_category:
 *           type: string
 *           description: 工作類別
 *           example: "軟體工程"
 *           minLength: 1
 *           maxLength: 50
 *         job_title:
 *           type: string
 *           description: 職稱
 *           example: "資深軟體工程師"
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
 *           example: 3
 *           minimum: 1
 *           maximum: 12
 *         end_year:
 *           type: number
 *           description: 結束年份（目前工作可選）
 *           example: 2023
 *           minimum: 1900
 *         end_month:
 *           type: number
 *           description: 結束月份（目前工作可選）
 *           example: 12
 *           minimum: 1
 *           maximum: 12
 *     TeacherWorkExperienceResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         teacher_id:
 *           type: number
 *           example: 123
 *         is_working:
 *           type: boolean
 *           example: true
 *         company_name:
 *           type: string
 *           example: "台積電"
 *         workplace:
 *           type: string
 *           example: "新竹科學園區"
 *         job_category:
 *           type: string
 *           example: "軟體工程"
 *         job_title:
 *           type: string
 *           example: "資深軟體工程師"
 *         start_year:
 *           type: number
 *           example: 2020
 *         start_month:
 *           type: number
 *           example: 3
 *         end_year:
 *           type: number
 *           example: 2023
 *         end_month:
 *           type: number
 *           example: 12
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
 * /api/teachers/work-experiences:
 *   get:
 *     tags:
 *       - 教師工作經驗
 *     summary: 取得工作經驗列表
 *     description: |
 *       取得當前教師的工作經驗列表
 *
 *       **業務規則：**
 *       - 只能查看自己的工作經驗
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
 *                         work_experiences:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherWorkExperienceResponse'
 *             examples:
 *               success:
 *                 summary: 成功取得工作經驗列表
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     work_experiences:
 *                       - id: 1
 *                         teacher_id: 123
 *                         is_working: true
 *                         company_name: "台積電"
 *                         workplace: "新竹科學園區"
 *                         job_category: "軟體工程"
 *                         job_title: "資深軟體工程師"
 *                         start_year: 2020
 *                         start_month: 3
 *                         end_year: null
 *                         end_month: null
 *                         created_at: "2025-01-08T10:00:00.000Z"
 *                         updated_at: "2025-01-08T10:00:00.000Z"
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 未登入
 *                 value:
 *                   status: error
 *                   message: 請先登入
 */
router.get('/', authenticateToken, TeacherWorkExperienceController.getWorkExperiences)

/**
 * @swagger
 * /api/teachers/work-experiences:
 *   post:
 *     tags:
 *       - 教師工作經驗
 *     summary: 建立工作經驗
 *     description: |
 *       新增一筆工作經驗記錄
 *
 *       **業務規則：**
 *       - 目前工作不需要填寫結束時間
 *       - 過去工作必須填寫結束時間
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
 *             $ref: '#/components/schemas/TeacherWorkExperienceRequest'
 *           examples:
 *             current_job:
 *               summary: 目前工作
 *               value:
 *                 is_working: true
 *                 company_name: "台積電"
 *                 workplace: "新竹科學園區"
 *                 job_category: "軟體工程"
 *                 job_title: "資深軟體工程師"
 *                 start_year: 2020
 *                 start_month: 3
 *             past_job:
 *               summary: 過去工作
 *               value:
 *                 is_working: false
 *                 company_name: "聯發科技"
 *                 workplace: "新竹竹北"
 *                 job_category: "硬體工程"
 *                 job_title: "硬體工程師"
 *                 start_year: 2018
 *                 start_month: 6
 *                 end_year: 2020
 *                 end_month: 2
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
 *                         work_experience:
 *                           $ref: '#/components/schemas/TeacherWorkExperienceResponse'
 *             examples:
 *               success:
 *                 summary: 成功建立工作經驗
 *                 value:
 *                   status: success
 *                   message: 建立工作經驗成功
 *                   data:
 *                     work_experience:
 *                       id: 1
 *                       teacher_id: 123
 *                       is_working: true
 *                       company_name: "台積電"
 *                       workplace: "新竹科學園區"
 *                       job_category: "軟體工程"
 *                       job_title: "資深軟體工程師"
 *                       start_year: 2020
 *                       start_month: 3
 *                       end_year: null
 *                       end_month: null
 *                       created_at: "2025-01-08T10:00:00.000Z"
 *                       updated_at: "2025-01-08T10:00:00.000Z"
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證失敗
 *                 value:
 *                   status: error
 *                   message: 參數驗證失敗
 *                   errors:
 *                     company_name: ["公司名稱為必填欄位"]
 *                     start_year: ["開始年份為必填欄位"]
 *       401:
 *         description: 未授權
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
 *               date_error:
 *                 summary: 時間邏輯錯誤
 *                 value:
 *                   status: error
 *                   message: 結束時間必須晚於開始時間
 */
router.post('/', authenticateToken, TeacherWorkExperienceController.createWorkExperience)

/**
 * @swagger
 * /api/teachers/work-experiences/{id}:
 *   put:
 *     tags:
 *       - 教師工作經驗
 *     summary: 更新工作經驗
 *     description: |
 *       更新指定的工作經驗記錄
 *
 *       **業務規則：**
 *       - 只能更新自己的工作經驗
 *       - 目前工作不需要填寫結束時間
 *       - 過去工作必須填寫結束時間
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
 *         description: 工作經驗ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherWorkExperienceRequest'
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
 *                         work_experience:
 *                           $ref: '#/components/schemas/TeacherWorkExperienceResponse'
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
 *             examples:
 *               forbidden:
 *                 summary: 權限不足
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法修改此工作經驗
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 工作經驗不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的工作經驗
 */
router.put('/:id', authenticateToken, TeacherWorkExperienceController.updateWorkExperience)

/**
 * @swagger
 * /api/teachers/work-experiences/{id}:
 *   delete:
 *     tags:
 *       - 教師工作經驗
 *     summary: 刪除工作經驗
 *     description: |
 *       刪除指定的工作經驗記錄
 *
 *       **業務規則：**
 *       - 只能刪除自己的工作經驗
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
 *         description: 工作經驗ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 成功刪除工作經驗
 *                 value:
 *                   status: success
 *                   message: 刪除工作經驗成功
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
 *             examples:
 *               forbidden:
 *                 summary: 權限不足
 *                 value:
 *                   status: error
 *                   message: 權限不足，無法刪除此工作經驗
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 工作經驗不存在
 *                 value:
 *                   status: error
 *                   message: 找不到指定的工作經驗
 */
router.delete('/:id', authenticateToken, TeacherWorkExperienceController.deleteWorkExperience)

export default router
