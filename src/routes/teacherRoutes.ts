import { Router } from 'express'
import { TeacherController } from '@controllers/TeacherController'
import { scheduleController } from '@controllers/ScheduleController'
import { learningExperienceController } from '@controllers/LearningExperienceController'
import { authenticateToken } from '@middleware/auth'
import { validateRequest } from '@middleware/schemas/core'
import {
  teacherApplicationSchema,
  teacherApplicationUpdateSchema,
  teacherProfileUpdateSchema,
  learningExperienceCreateSchema,
  learningExperienceUpdateSchema
} from '@middleware/schemas/user/teacherSchemas'
import {
  certificateCreateSchema,
  certificateUpdateSchema
} from '@middleware/schemas/user/certificateSchemas'
import { scheduleUpdateSchema, conflictsQuerySchema } from '@middleware/schemas/system/scheduleSchemas'
import { certificateController } from '@controllers/CertificateController'

const router = Router()
const teacherController = new TeacherController()

// === 教師申請路由 ===

/**
 * @swagger
 * /api/teachers/apply:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 申請成為教師
 *     description: |
 *       建立新的教師申請，提交地址資訊、教授科目、專長和自我介紹資料。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者是否具有學生角色且帳號為活躍狀態
 *       - 檢查是否已有教師申請記錄（一個使用者只能有一個申請）
 *       - 驗證教授科目（主分類）是否存在且有效
 *       - 驗證專長（子分類）是否屬於所選的教授科目且有效
 *       - 建立新的教師申請記錄，狀態設為 pending（待審核）
 *       - 回傳建立的教師申請資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherApplicationRequest'
 *     responses:
 *       201:
 *         description: 教師申請建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherApplicationSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/TeacherApplicationValidationErrorResponse'
 *                 - $ref: '#/components/schemas/TeacherApplicationBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "教師申請參數驗證失敗"
 *                   errors:
 *                     city: ["縣市為必填欄位", "縣市長度不能超過50個字元"]
 *                     district: ["區域為必填欄位"]
 *                     address: ["地址為必填欄位"]
 *                     main_category_id: ["教授科目為必填欄位"]
 *                     sub_category_ids: ["至少需要選擇1個專長", "最多只能選擇3個專長"]
 *                     introduction: ["自我介紹為必填欄位", "自我介紹至少需要100個字元"]
 *               business_error:
 *                 summary: 業務邏輯錯誤
 *                 value:
 *                   status: "error"
 *                   message: "此電子郵件已被註冊或教授科目不存在或專長不存在"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 權限不足（非學生角色或帳號未啟用）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenErrorResponse'
 *       409:
 *         description: 申請衝突 - 已有教師申請記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *             example:
 *               status: "error"
 *               message: "此電子郵件已被註冊"
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/apply', authenticateToken, validateRequest(teacherApplicationSchema, '教師申請參數驗證失敗'), teacherController.apply)

/**
 * @swagger
 * /api/teachers/apply-status:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 查詢教師申請狀態與完整表單資料
 *     description: |
 *       取得使用者的教師申請狀態和所有步驟的表單資料，用於前端判斷申請進度和預填表單。
 *       
 *       **多步驟表單結構**：
 *       1. 基本資訊：地址、教授科目、專長、自我介紹
 *       2. 工作經驗：工作經歷列表
 *       3. 學歷背景：學習經歷列表  
 *       4. 教學證照：證照列表
 *       
 *       **前端判斷邏輯**：
 *       ```javascript
 *       // 判斷申請狀態
 *       if (!data) return 'FIRST_TIME'           // 第一次申請
 *       if (!data.application_submitted_at) {
 *         // 判斷進行到哪一步
 *         if (!data.basic_info.city) return 'STEP_1'           // 基本資訊未填
 *         if (data.work_experiences.length === 0) return 'STEP_2'     // 工作經驗未填
 *         if (data.learning_experiences.length === 0) return 'STEP_3' // 學歷未填
 *         if (data.certificates.length === 0) return 'STEP_4'         // 證照未填
 *         return 'READY_TO_SUBMIT'              // 可提交
 *       } else {
 *         return 'SUBMITTED'                    // 已提交
 *       }
 *       ```
 *       
 *       **業務邏輯**：
 *       - 如果使用者從未申請過，回傳 404
 *       - 如果有申請記錄，回傳完整的申請狀態和所有步驟資料
 *       - 前端可根據資料完整性判斷目前進度和預填表單
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得申請狀態與表單資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherApplyStatusSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 尚未申請 - 使用者從未建立教師申請
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *             example:
 *               status: "error"
 *               message: "尚未申請成為教師"
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/apply-status', authenticateToken, teacherController.getApplyStatus)

/**
 * @swagger
 * /api/teachers/basic-info:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得教師基本資訊
 *     description: |
 *       取得已通過申請的教師基本資訊，主要用於教師個人資料管理。
 *       與 /apply-status 的差異：
 *       - 此路由專門用於已通過申請的教師基本資料 CRUD
 *       - /apply-status 用於申請流程中的狀態判斷與表單預填
 *       
 *       **業務邏輯**：
 *       - 僅提供基本資訊欄位，不包含申請狀態相關欄位
 *       - 主要給已獲得教師身份的使用者管理個人基本資料使用
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得教師基本資訊
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherBasicInfoSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/basic-info', authenticateToken, teacherController.getBasicInfo)

/**
 * @swagger
 * /api/teachers/basic-info:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新教師基本資訊
 *     description: |
 *       更新已通過申請的教師基本資訊，專門用於個人資料管理。
 *       
 *       **業務邏輯**：
 *       - 僅允許更新基本資訊欄位
 *       - 不影響申請狀態相關欄位
 *       - 主要給已獲得教師身份的使用者更新個人基本資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherBasicInfoUpdateRequest'
 *     responses:
 *       200:
 *         description: 教師基本資訊更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherBasicInfoUpdateSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 找不到教師資料
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.put('/basic-info', authenticateToken, validateRequest(teacherProfileUpdateSchema, '教師資料更新參數驗證失敗'), teacherController.updateBasicInfo)

router.put('/application', authenticateToken, validateRequest(teacherApplicationUpdateSchema, '更新申請參數驗證失敗'), teacherController.updateApplication)


router.post('/resubmit', authenticateToken, teacherController.resubmitApplication)


router.post('/submit', authenticateToken, teacherController.submit)

// === 教師個人資料路由 ===

router.get('/profile', authenticateToken, teacherController.getProfile)


router.put('/profile', authenticateToken, validateRequest(teacherProfileUpdateSchema, '教師資料更新參數驗證失敗'), teacherController.updateProfile)

// === 工作經驗管理路由 ===

router.get('/work-experiences', authenticateToken, teacherController.getWorkExperiences)
router.post('/work-experiences', authenticateToken, teacherController.createWorkExperience)


router.put('/work-experiences/:id', authenticateToken, teacherController.updateWorkExperience)
router.delete('/work-experiences/:id', authenticateToken, teacherController.deleteWorkExperience)

// === 學習經歷管理路由 ===


router.get('/learning-experiences', authenticateToken, learningExperienceController.getLearningExperiences)


router.post('/learning-experiences', authenticateToken, validateRequest(learningExperienceCreateSchema), learningExperienceController.createLearningExperience)


router.put('/learning-experiences/:id', authenticateToken, validateRequest(learningExperienceUpdateSchema), learningExperienceController.updateLearningExperience)


router.delete('/learning-experiences/:id', authenticateToken, learningExperienceController.deleteLearningExperience)


router.get('/certificates', authenticateToken, certificateController.getCertificates)
router.post('/certificates', authenticateToken, validateRequest(certificateCreateSchema), certificateController.createCertificate)


router.put('/certificates/:id', authenticateToken, validateRequest(certificateUpdateSchema), certificateController.updateCertificate)
router.delete('/certificates/:id', authenticateToken, certificateController.deleteCertificate)

// === 教師時間管理路由 ===


router.get('/schedule', authenticateToken, scheduleController.getSchedule)


router.put('/schedule', authenticateToken, validateRequest(scheduleUpdateSchema), scheduleController.updateSchedule)


router.get('/schedule/conflicts', authenticateToken, validateRequest(conflictsQuerySchema, 'query'), scheduleController.checkConflicts)

export default router
