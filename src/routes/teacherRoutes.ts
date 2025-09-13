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
  learningExperienceCreateBatchSchema,
  learningExperienceUpdateSchema,
  workExperienceUpsertSchema,
  learningExperienceUpsertSchema
} from '@middleware/schemas/user/teacherSchemas'
import {
  certificateCreateSchema,
  certificateCreateBatchSchema,
  certificateUpdateSchema,
  certificateUpsertSchema
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

/**
 * @swagger
 * /api/teachers/resubmit:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 重新提交教師申請
 *     description: |
 *       重新提交被拒絕的教師申請，重設申請狀態為待審核。
 *       
 *       **業務邏輯**：
 *       - 驗證申請是否存在且為被拒絕狀態
 *       - 重設申請狀態為 pending（待審核）
 *       - 更新申請提交時間
 *       - 清除之前的審核資訊（審核時間、審核者、審核備註）
 *       - 回傳更新後的申請狀態資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 申請重新提交成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherResubmitSuccessResponse'
 *       400:
 *         description: 申請狀態不允許重新提交
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 找不到申請記錄
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
router.post('/resubmit', authenticateToken, teacherController.resubmitApplication)

/**
 * @swagger
 * /api/teachers/submit:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 提交教師申請
 *     description: |
 *       最終提交教師申請，將申請狀態設為已提交待審核。
 *       
 *       **業務邏輯**：
 *       - 驗證申請是否存在且為草稿狀態
 *       - 檢查是否已完成所有必要步驟（基本資料、工作經驗、學歷、證照）
 *       - 設定申請提交時間
 *       - 將申請狀態設為 pending（待審核）
 *       - 回傳提交後的申請狀態資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 申請提交成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherSubmitSuccessResponse'
 *       400:
 *         description: 申請資料不完整或狀態不允許提交
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 找不到申請記錄
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
router.post('/submit', authenticateToken, teacherController.submit)

// === 教師個人資料路由 ===

/**
 * @swagger
 * /api/teachers/profile:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得教師個人檔案
 *     description: |
 *       取得教師完整個人檔案，包含基本資訊、統計數據等。
 *       與 /basic-info 的差異：此路由提供完整的教師檔案資訊，包含統計數據。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 回傳完整教師檔案資訊，包含統計數據
 *       - 包含總學生數、總課程數、平均評分、總收入等資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得教師個人檔案
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherProfileSuccessResponse'
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
router.get('/profile', authenticateToken, teacherController.getProfile)

/**
 * @swagger
 * /api/teachers/profile:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新教師個人檔案
 *     description: |
 *       更新教師個人檔案基本資訊。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 驗證教授科目和專長的有效性
 *       - 更新教師基本資訊
 *       - 回傳更新後的資訊和提醒訊息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: 教師個人檔案更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherProfileUpdateSuccessResponse'
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
router.put('/profile', authenticateToken, validateRequest(teacherProfileUpdateSchema, '教師資料更新參數驗證失敗'), teacherController.updateProfile)

// === 工作經驗管理路由 ===

/**
 * @swagger
 * /api/teachers/work-experiences:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得工作經驗列表
 *     description: |
 *       取得教師的工作經驗列表。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 回傳該教師的所有工作經驗記錄
 *       - 按時間順序排列（最新的優先）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得工作經驗列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkExperienceListSuccessResponse'
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
router.get('/work-experiences', authenticateToken, teacherController.getWorkExperiences)

/**
 * @swagger
 * /api/teachers/work-experiences:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 新增工作經驗
 *     description: |
 *       新增教師工作經驗記錄，統一使用陣列格式。
 *       
 *       **請求格式**：
 *       - 統一使用 `{ work_experiences: [工作經驗陣列] }` 格式
 *       - 即使只有一筆資料，也需要包裝在陣列中
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 驗證工作經驗資料的完整性和邏輯性
 *       - 檢查開始和結束時間的合理性
 *       - 一次最多支援 20 筆工作經驗
 *       - 建立新的工作經驗記錄
 *       - 回傳建立的工作經驗資料和統計資訊
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkExperienceBatchCreateRequest'
 *           examples:
 *             single_work_experience:
 *               summary: 單筆工作經驗（陣列格式）
 *               value:
 *                 work_experiences:
 *                   - company_name: "某某科技公司"
 *                     workplace: "台北市信義區"
 *                     job_category: "軟體開發"
 *                     job_title: "資深工程師"
 *                     is_working: false
 *                     start_year: 2020
 *                     start_month: 1
 *                     end_year: 2022
 *                     end_month: 12
 *             multiple_work_experiences:
 *               summary: 多筆工作經驗
 *               value:
 *                 work_experiences:
 *                   - company_name: "某某科技公司"
 *                     workplace: "台北市信義區"
 *                     job_category: "軟體開發"
 *                     job_title: "資深工程師"
 *                     is_working: false
 *                     start_year: 2020
 *                     start_month: 1
 *                     end_year: 2022
 *                     end_month: 12
 *                   - company_name: "另一家公司"
 *                     workplace: "新北市板橋區"
 *                     job_category: "產品管理"
 *                     job_title: "產品經理"
 *                     is_working: true
 *                     start_year: 2023
 *                     start_month: 1
 *                     end_year: null
 *                     end_month: null
 *     responses:
 *       201:
 *         description: 工作經驗建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkExperienceBatchCreateSuccessResponse'
 *             examples:
 *               response:
 *                 summary: 建立成功回應
 *                 value:
 *                   status: "success"
 *                   message: "成功建立 2 筆工作經驗"
 *                   data:
 *                     work_experiences:
 *                       - id: 123
 *                         company_name: "某某科技公司"
 *                         workplace: "台北市信義區"
 *                         job_category: "軟體開發"
 *                         job_title: "資深工程師"
 *                         is_working: false
 *                         start_year: 2020
 *                         start_month: 1
 *                         end_year: 2022
 *                         end_month: 12
 *                         created_at: "2024-01-15T10:30:00.000Z"
 *                         updated_at: "2024-01-15T10:30:00.000Z"
 *                       - id: 124
 *                         company_name: "另一家公司"
 *                         workplace: "新北市板橋區"
 *                         job_category: "產品管理"
 *                         job_title: "產品經理"
 *                         is_working: true
 *                         start_year: 2023
 *                         start_month: 1
 *                         end_year: null
 *                         end_month: null
 *                         created_at: "2024-01-15T10:31:00.000Z"
 *                         updated_at: "2024-01-15T10:31:00.000Z"
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "工作經驗參數驗證失敗"
 *                   errors:
 *                     company_name: ["公司名稱為必填欄位"]
 *                     start_year: ["開始年份必須在 1900 到 2100 之間"]
 *               batch_validation_error:
 *                 summary: 批次驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "第 2 筆工作經驗：公司名稱為必填欄位"
 *               batch_limit_error:
 *                 summary: 批次數量限制錯誤
 *                 value:
 *                   status: "error"
 *                   message: "一次最多只能建立 20 筆工作經驗"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/work-experiences', authenticateToken, teacherController.createWorkExperience)

/**
 * @swagger
 * /api/teachers/work-experiences:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 批次新增或更新工作經驗
 *     description: |
 *       批次處理工作經驗記錄，支援同時新增和更新操作。
 *       
 *       **UPSERT 邏輯**：
 *       - 有 `id` 的記錄：執行更新操作
 *       - 沒有 `id` 的記錄：執行新增操作
 *       - 支援在同一個請求中混合處理新增和更新
 *       - 所有操作在單一交易中執行，確保資料一致性
 *       
 *       **使用場景**：
 *       - 使用者中途離開申請頁面後重新填寫
 *       - 需要同時修改現有資料並新增新的工作經驗
 *       - 前端不需要複雜的邏輯判斷應該呼叫 POST 還是 PUT
 *       
 *       **請求格式**：
 *       - 統一使用 `{ work_experiences: [工作經驗陣列] }` 格式
 *       - 每個工作經驗物件可選擇性包含 `id` 欄位
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師或教師申請者
 *       - 對於有 `id` 的記錄，驗證使用者擁有權
 *       - 驗證所有工作經驗資料的完整性和邏輯性
 *       - 檢查開始和結束時間的合理性
 *       - 一次最多支援 20 筆工作經驗
 *       - 在資料庫交易中執行所有操作
 *       - 回傳處理結果統計和更新後的資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkExperienceUpsertRequest'
 *           examples:
 *             mixed_operations:
 *               summary: 混合新增和更新操作
 *               value:
 *                 work_experiences:
 *                   - id: 123
 *                     company_name: "更新後的公司名稱"
 *                     workplace: "台北市信義區"
 *                     job_category: "軟體開發"
 *                     job_title: "資深工程師"
 *                     is_working: false
 *                     start_year: 2020
 *                     start_month: 1
 *                     end_year: 2023
 *                     end_month: 6
 *                   - company_name: "新公司"
 *                     workplace: "新北市板橋區"
 *                     job_category: "產品管理"
 *                     job_title: "產品經理"
 *                     is_working: true
 *                     start_year: 2023
 *                     start_month: 7
 *                     end_year: null
 *                     end_month: null
 *     responses:
 *       200:
 *         description: 批次處理成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkExperienceUpsertResponse'
 *             examples:
 *               success:
 *                 summary: 成功處理混合操作
 *                 value:
 *                   message: "工作經驗批次處理完成"
 *                   data:
 *                     work_experiences:
 *                       - id: 123
 *                         user_id: 456
 *                         company_name: "更新後的公司名稱"
 *                         workplace: "台北市信義區"
 *                         job_category: "軟體開發"
 *                         job_title: "資深工程師"
 *                         is_working: false
 *                         start_year: 2020
 *                         start_month: 1
 *                         end_year: 2023
 *                         end_month: 6
 *                         created_at: "2024-01-15T10:30:00.000Z"
 *                         updated_at: "2024-01-20T14:25:00.000Z"
 *                       - id: 789
 *                         user_id: 456
 *                         company_name: "新公司"
 *                         workplace: "新北市板橋區"
 *                         job_category: "產品管理"
 *                         job_title: "產品經理"
 *                         is_working: true
 *                         start_year: 2023
 *                         start_month: 7
 *                         end_year: null
 *                         end_month: null
 *                         created_at: "2024-01-20T14:25:00.000Z"
 *                         updated_at: "2024-01-20T14:25:00.000Z"
 *       400:
 *         description: 請求參數錯誤或資料驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權存取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.put('/work-experiences', authenticateToken, validateRequest(workExperienceUpsertSchema, '工作經驗批次處理參數驗證失敗'), teacherController.upsertWorkExperiences)

/**
 * @swagger
 * /api/teachers/work-experiences/{id}:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新工作經驗
 *     description: |
 *       更新指定的工作經驗記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為該工作經驗的擁有者
 *       - 驗證工作經驗資料的完整性和邏輯性
 *       - 檢查開始和結束時間的合理性
 *       - 更新工作經驗記錄
 *       - 回傳更新後的工作經驗資料
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 工作經驗 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WorkExperienceUpdateRequest'
 *     responses:
 *       200:
 *         description: 工作經驗更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkExperienceUpdateSuccessResponse'
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
 *         description: 找不到工作經驗記錄
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
router.put('/work-experiences/:id', authenticateToken, teacherController.updateWorkExperience)

/**
 * @swagger
 * /api/teachers/work-experiences/{id}:
 *   delete:
 *     tags:
 *       - Teachers
 *     summary: 刪除工作經驗
 *     description: |
 *       刪除指定的工作經驗記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為該工作經驗的擁有者
 *       - 檢查工作經驗記錄是否存在
 *       - 執行軟刪除或硬刪除
 *       - 回傳刪除成功確認
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 工作經驗 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 工作經驗刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkExperienceDeleteSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 找不到工作經驗記錄
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
router.delete('/work-experiences/:id', authenticateToken, teacherController.deleteWorkExperience)

// === 學習經歷管理路由 ===

/**
 * @swagger
 * /api/teachers/learning-experiences:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得學習經歷列表
 *     description: |
 *       取得教師的學習經歷（學歷背景）列表。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 回傳該教師的所有學習經歷記錄
 *       - 按開始時間排序（最新的優先）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得學習經歷列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningExperienceListSuccessResponse'
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
router.get('/learning-experiences', authenticateToken, learningExperienceController.getLearningExperiences)

/**
 * @swagger
 * /api/teachers/learning-experiences:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 新增學習經歷
 *     description: |
 *       新增教師學習經歷（學歷背景）記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 驗證學習經歷資料的完整性和邏輯性
 *       - 檢查開始和結束時間的合理性
 *       - 驗證學位、學校、科系等資訊
 *       - 建立新的學習經歷記錄
 *       - 回傳建立的學習經歷資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LearningExperienceBatchCreateRequest'
 *     responses:
 *       201:
 *         description: 學習經歷建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningExperienceBatchCreateSuccessResponse'
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
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/learning-experiences', authenticateToken, validateRequest(learningExperienceCreateBatchSchema), learningExperienceController.createLearningExperience)

/**
 * @swagger
 * /api/teachers/learning-experiences:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 批次新增或更新學習經驗
 *     description: |
 *       批次處理學習經驗記錄，支援同時新增和更新操作。
 *       
 *       **UPSERT 邏輯**：
 *       - 有 `id` 的記錄：執行更新操作
 *       - 沒有 `id` 的記錄：執行新增操作
 *       - 支援在同一個請求中混合處理新增和更新
 *       - 所有操作在單一交易中執行，確保資料一致性
 *       
 *       **使用場景**：
 *       - 使用者中途離開申請頁面後重新填寫
 *       - 需要同時修改現有資料並新增新的學習經驗
 *       - 前端不需要複雜的邏輯判斷應該呼叫 POST 還是 PUT
 *       
 *       **請求格式**：
 *       - 統一使用 `{ learning_experiences: [學習經驗陣列] }` 格式
 *       - 每個學習經驗物件可選擇性包含 `id` 欄位
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師或教師申請者
 *       - 對於有 `id` 的記錄，驗證使用者擁有權
 *       - 驗證所有學習經驗資料的完整性和邏輯性
 *       - 檢查開始和結束時間的合理性
 *       - 一次最多支援 20 筆學習經驗
 *       - 在資料庫交易中執行所有操作
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LearningExperienceUpsertRequest'
 *           examples:
 *             mixed_operations:
 *               summary: 混合新增和更新操作
 *               value:
 *                 learning_experiences:
 *                   - id: 123
 *                     degree: "碩士"
 *                     school_name: "某某大學"
 *                     department: "資訊管理學系碩士班"
 *                     region: true
 *                     is_in_school: false
 *                     start_year: 2020
 *                     start_month: 9
 *                     end_year: 2022
 *                     end_month: 6
 *                   - degree: "博士"
 *                     school_name: "另一所大學"
 *                     department: "電腦科學系"
 *                     region: false
 *                     is_in_school: true
 *                     start_year: 2022
 *                     start_month: 9
 *                     end_year: null
 *                     end_month: null
 *     responses:
 *       200:
 *         description: 批次處理成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningExperienceUpsertResponse'
 *       400:
 *         description: 請求參數錯誤或資料驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權存取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.put('/learning-experiences', authenticateToken, validateRequest(learningExperienceUpsertSchema, '學習經驗批次處理參數驗證失敗'), learningExperienceController.upsertLearningExperiences)

/**
 * @swagger
 * /api/teachers/learning-experiences/{id}:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新學習經歷
 *     description: |
 *       更新指定的學習經歷記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為該學習經歷的擁有者
 *       - 驗證學習經歷資料的完整性和邏輯性
 *       - 檢查開始和結束時間的合理性
 *       - 驗證學位、學校、科系等資訊
 *       - 更新學習經歷記錄
 *       - 回傳更新後的學習經歷資料
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
 *             $ref: '#/components/schemas/LearningExperienceUpdateRequest'
 *     responses:
 *       200:
 *         description: 學習經歷更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LearningExperienceUpdateSuccessResponse'
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
 *         description: 找不到學習經歷記錄
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
router.put('/learning-experiences/:id', authenticateToken, validateRequest(learningExperienceUpdateSchema), learningExperienceController.updateLearningExperience)

/**
 * @swagger
 * /api/teachers/learning-experiences/{id}:
 *   delete:
 *     tags:
 *       - Teachers
 *     summary: 刪除學習經歷
 *     description: |
 *       刪除指定的學習經歷記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為該學習經歷的擁有者
 *       - 檢查學習經歷記錄是否存在
 *       - 執行刪除操作
 *       - 回傳刪除成功確認
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
 *               $ref: '#/components/schemas/LearningExperienceDeleteSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 找不到學習經歷記錄
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
router.delete('/learning-experiences/:id', authenticateToken, learningExperienceController.deleteLearningExperience)

/**
 * @swagger
 * /api/teachers/certificates:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得證書列表
 *     description: |
 *       取得教師的證書列表。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 回傳該教師的所有證書記錄
 *       - 按建立時間排序（最新的優先）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得證書列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateListSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/certificates', authenticateToken, certificateController.getCertificates)

/**
 * @swagger
 * /api/teachers/certificates:
 *   post:
 *     tags:
 *       - Teachers
 *     summary: 新增證書
 *     description: |
 *       新增教師證書記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 驗證證書資料的完整性
 *       - 檢查證書編號的唯一性
 *       - 驗證檔案路徑和檔案類型
 *       - 建立新的證書記錄
 *       - 回傳建立的證書資料
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateBatchCreateRequest'
 *     responses:
 *       201:
 *         description: 證書建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateBatchCreateSuccessResponse'
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
 *       409:
 *         description: 證書編號已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/certificates', authenticateToken, validateRequest(certificateCreateBatchSchema), certificateController.createCertificate)

/**
 * @swagger
 * /api/teachers/certificates:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 批次新增或更新證書
 *     description: |
 *       批次處理證書記錄，支援同時新增和更新操作。
 *       
 *       **UPSERT 邏輯**：
 *       - 有 `id` 的記錄：執行更新操作
 *       - 沒有 `id` 的記錄：執行新增操作
 *       - 支援在同一個請求中混合處理新增和更新
 *       - 所有操作在單一交易中執行，確保資料一致性
 *       
 *       **使用場景**：
 *       - 使用者中途離開申請頁面後重新填寫
 *       - 需要同時修改現有資料並新增新的證書
 *       - 前端不需要複雜的邏輯判斷應該呼叫 POST 還是 PUT
 *       
 *       **請求格式**：
 *       - 統一使用 `{ certificates: [證書陣列] }` 格式
 *       - 每個證書物件可選擇性包含 `id` 欄位
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師或教師申請者
 *       - 對於有 `id` 的記錄，驗證使用者擁有權
 *       - 驗證所有證書資料的完整性和邏輯性
 *       - 檢查證書名稱和發證機構的合理性
 *       - 一次最多支援 20 筆證書
 *       - 在資料庫交易中執行所有操作
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateUpsertRequest'
 *           examples:
 *             mixed_operations:
 *               summary: 混合新增和更新操作
 *               value:
 *                 certificates:
 *                   - id: 123
 *                     verifying_institution: "某某認證機構"
 *                     license_name: "更新後的證書名稱"
 *                     holder_name: "王小明"
 *                     license_number: "CERT-2023-001"
 *                     category_id: "programming"
 *                     subject: "程式設計"
 *                     file_path: ""
 *                   - verifying_institution: "另一個認證機構"
 *                     license_name: "新的專業證書"
 *                     holder_name: "王小明"
 *                     license_number: "CERT-2024-002"
 *                     category_id: "design"
 *                     subject: "設計"
 *                     file_path: ""
 *     responses:
 *       200:
 *         description: 批次處理成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateUpsertResponse'
 *       400:
 *         description: 請求參數錯誤或資料驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權存取
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.put('/certificates', authenticateToken, validateRequest(certificateUpsertSchema, '證書批次處理參數驗證失敗'), certificateController.upsertCertificates)

/**
 * @swagger
 * /api/teachers/certificates/{id}:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新證書
 *     description: |
 *       更新指定的證書記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為該證書的擁有者
 *       - 驗證證書資料的完整性
 *       - 檢查證書編號的唯一性（排除自己）
 *       - 驗證檔案路徑和檔案類型
 *       - 更新證書記錄
 *       - 回傳更新後的證書資料
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 證書 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CertificateUpdateRequest'
 *     responses:
 *       200:
 *         description: 證書更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateUpdateSuccessResponse'
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
 *         description: 找不到證書記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundErrorResponse'
 *       409:
 *         description: 證書編號已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.put('/certificates/:id', authenticateToken, validateRequest(certificateUpdateSchema), certificateController.updateCertificate)

/**
 * @swagger
 * /api/teachers/certificates/{id}:
 *   delete:
 *     tags:
 *       - Teachers
 *     summary: 刪除證書
 *     description: |
 *       刪除指定的證書記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為該證書的擁有者
 *       - 檢查證書記錄是否存在
 *       - 執行刪除操作
 *       - 清理相關檔案（如需要）
 *       - 回傳刪除成功確認
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 證書 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 證書刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CertificateDeleteSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 找不到證書記錄
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
router.delete('/certificates/:id', authenticateToken, certificateController.deleteCertificate)

// === 教師時間管理路由 ===

/**
 * @swagger
 * /api/teachers/schedule:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 取得教師時間表
 *     description: |
 *       取得教師的可用時間表設定。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 回傳教師設定的可用時間表
 *       - 包含每日的可用時段資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得教師時間表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduleGetSuccessResponse'
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
router.get('/schedule', authenticateToken, scheduleController.getSchedule)

/**
 * @swagger
 * /api/teachers/schedule:
 *   put:
 *     tags:
 *       - Teachers
 *     summary: 更新教師時間表
 *     description: |
 *       更新教師的可用時間表設定。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 驗證時間表格式和時間段的合理性
 *       - 檢查時間段是否重疊
 *       - 更新教師的可用時間表
 *       - 回傳更新後的時間表資訊
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleUpdateRequest'
 *     responses:
 *       200:
 *         description: 教師時間表更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduleUpdateSuccessResponse'
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
router.put('/schedule', authenticateToken, validateRequest(scheduleUpdateSchema), scheduleController.updateSchedule)

/**
 * @swagger
 * /api/teachers/schedule/conflicts:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: 檢查時間衝突
 *     description: |
 *       檢查指定時間段是否與教師現有行程衝突。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者為有效的教師
 *       - 檢查指定時間段與現有預約的衝突
 *       - 檢查時間段是否在教師可用時間內
 *       - 回傳衝突檢查結果和詳細資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: start_time
 *         in: query
 *         required: true
 *         description: 開始時間 (ISO 8601 格式)
 *         schema:
 *           type: string
 *           format: date-time
 *           example: '2024-01-15T09:00:00.000Z'
 *       - name: end_time
 *         in: query
 *         required: true
 *         description: 結束時間 (ISO 8601 格式)
 *         schema:
 *           type: string
 *           format: date-time
 *           example: '2024-01-15T10:00:00.000Z'
 *     responses:
 *       200:
 *         description: 成功檢查時間衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ScheduleConflictCheckSuccessResponse'
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
router.get('/schedule/conflicts', authenticateToken, validateRequest(conflictsQuerySchema, 'query'), scheduleController.checkConflicts)

export default router
