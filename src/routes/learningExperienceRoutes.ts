import { Router } from 'express'
import { learningExperienceController } from '@controllers/LearningExperienceController'
import { authenticateToken } from '@middleware/auth'
import { 
  validateRequest, 
  learningExperienceCreateSchema, 
  learningExperienceUpdateSchema 
} from '@middleware/validation'

/**
 * 學習經歷相關路由
 * 
 * 路由前綴: /api/teachers/learning-experiences
 * 
 * @swagger
 * tags:
 *   name: Learning Experience Management
 *   description: 學習經歷管理相關 API，提供教師學習經歷的 CRUD 操作
 */

const router = Router()

/**
 * @swagger
 * /teachers/learning-experiences:
 *   get:
 *     tags: [Learning Experience Management]
 *     summary: 取得學習經歷清單
 *     description: |
 *       取得目前教師的所有學習經歷記錄，依開始年份降序排列。
 *       
 *       **權限要求:**
 *       - 需要教師權限
 *       - 帳號狀態必須為活躍
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得學習經歷清單
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningExperienceListResponse'
 *             examples:
 *               example1:
 *                 summary: 學習經歷清單範例
 *                 value:
 *                   status: "success"
 *                   message: "取得學習經歷列表成功"
 *                   data:
 *                     - id: 1
 *                       teacher_id: 5
 *                       is_in_school: false
 *                       degree: "碩士"
 *                       school_name: "國立台灣大學"
 *                       department: "資訊工程學系"
 *                       region: true
 *                       start_year: 2018
 *                       start_month: 9
 *                       end_year: 2020
 *                       end_month: 6
 *                       file_path: null
 *                       created_at: "2024-01-15T10:30:00Z"
 *                       updated_at: "2024-01-15T10:30:00Z"
 *                     - id: 2
 *                       teacher_id: 5
 *                       is_in_school: false
 *                       degree: "學士"
 *                       school_name: "國立成功大學"
 *                       department: "電機工程學系"
 *                       region: true
 *                       start_year: 2014
 *                       start_month: 9
 *                       end_year: 2018
 *                       end_month: 6
 *                       file_path: null
 *                       created_at: "2024-01-15T10:25:00Z"
 *                       updated_at: "2024-01-15T10:25:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足 - 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       404:
 *         description: 教師記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', authenticateToken, learningExperienceController.getLearningExperiences)

/**
 * @swagger
 * /teachers/learning-experiences:
 *   post:
 *     tags: [Learning Experience Management]
 *     summary: 建立學習經歷
 *     description: |
 *       建立新的學習經歷記錄。
 *       
 *       **業務規則:**
 *       - 需要教師權限
 *       - 結束年月不能早於開始年月
 *       - 年份範圍必須合理（不超過20年）
 *       - 不能設定未來年份（除了預計畢業年份）
 *       
 *       **檔案上傳:**
 *       - TODO: 檔案上傳功能開發中
 *       - 支援格式：PDF, JPG, JPEG, PNG
 *       - 檔案大小限制：5MB
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLearningExperienceRequest'
 *           examples:
 *             example1:
 *               summary: 大學學歷範例
 *               value:
 *                 is_in_school: false
 *                 degree: "學士"
 *                 school_name: "國立台灣大學"
 *                 department: "資訊工程學系"
 *                 region: true
 *                 start_year: 2018
 *                 start_month: 9
 *                 end_year: 2022
 *                 end_month: 6
 *             example2:
 *               summary: 目前在學範例
 *               value:
 *                 is_in_school: true
 *                 degree: "博士"
 *                 school_name: "Stanford University"
 *                 department: "Computer Science"
 *                 region: false
 *                 start_year: 2023
 *                 start_month: 9
 *                 end_year: null
 *                 end_month: null
 *         # TODO: 檔案上傳系統完成後啟用
 *         # multipart/form-data:
 *         #   schema:
 *         #     $ref: '#/components/schemas/CreateLearningExperienceWithFile'
 *     responses:
 *       201:
 *         description: 學習經歷建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningExperienceResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *             examples:
 *               dateRangeError:
 *                 summary: 日期範圍錯誤
 *                 value:
 *                   status: "error"
 *                   error:
 *                     code: "VALIDATION_ERROR"
 *                     message: "參數驗證失敗"
 *                     details:
 *                       - field: "end_year"
 *                         message: "結束年份不得早於開始年份"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足 - 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       404:
 *         description: 教師記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post(
  '/',
  authenticateToken,
  validateRequest(learningExperienceCreateSchema),
  learningExperienceController.createLearningExperience
)

/**
 * @swagger
 * /teachers/learning-experiences/{id}:
 *   put:
 *     tags: [Learning Experience Management]
 *     summary: 更新學習經歷
 *     description: |
 *       更新指定的學習經歷記錄。只能更新屬於自己的學習經歷。
 *       
 *       **業務規則:**
 *       - 需要教師權限
 *       - 只能更新屬於自己的學習經歷
 *       - 結束年月不能早於開始年月
 *       - 年份範圍必須合理
 *       
 *       **檔案上傳:**
 *       - TODO: 檔案上傳功能開發中
 *       - 如果上傳新檔案，會取代原有檔案
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 學習經歷 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateLearningExperienceRequest'
 *           examples:
 *             example1:
 *               summary: 部分更新範例
 *               value:
 *                 degree: "碩士"
 *                 end_year: 2023
 *                 end_month: 12
 *         # TODO: 檔案上傳系統完成後啟用
 *         # multipart/form-data:
 *         #   schema:
 *         #     $ref: '#/components/schemas/UpdateLearningExperienceWithFile'
 *     responses:
 *       200:
 *         description: 學習經歷更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningExperienceResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足 - 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       404:
 *         description: 學習經歷不存在或無權限存取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             examples:
 *               notFound:
 *                 summary: 學習經歷不存在
 *                 value:
 *                   status: "error"
 *                   error:
 *                     code: "LEARNING_EXPERIENCE_NOT_FOUND"
 *                     message: "找不到學習經歷記錄"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put(
  '/:id',
  authenticateToken,
  validateRequest(learningExperienceUpdateSchema),
  learningExperienceController.updateLearningExperience
)

/**
 * @swagger
 * /teachers/learning-experiences/{id}:
 *   delete:
 *     tags: [Learning Experience Management]
 *     summary: 刪除學習經歷
 *     description: |
 *       刪除指定的學習經歷記錄。只能刪除屬於自己的學習經歷。
 *       
 *       **業務規則:**
 *       - 需要教師權限
 *       - 只能刪除屬於自己的學習經歷
 *       - 刪除後相關檔案也會一併刪除（TODO: 檔案系統開發中）
 *       
 *       **注意事項:**
 *       - 此操作無法復原
 *       - 相關證書檔案會一併刪除
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 學習經歷 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 學習經歷刪除成功
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
 *                   example: "學習經歷已刪除"
 *                 data:
 *                   type: "null"
 *                   example: null
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足 - 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *       404:
 *         description: 學習經歷不存在或無權限存取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessError'
 *             examples:
 *               notFound:
 *                 summary: 學習經歷不存在
 *                 value:
 *                   status: "error"
 *                   error:
 *                     code: "LEARNING_EXPERIENCE_NOT_FOUND"
 *                     message: "找不到學習經歷記錄"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:id', authenticateToken, learningExperienceController.deleteLearningExperience)

export default router