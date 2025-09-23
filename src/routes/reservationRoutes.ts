import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { 
  createReservationSchema, 
  reservationListQuerySchema, 
  updateReservationStatusSchema, 
  reservationIdParamSchema, 
  calendarViewQuerySchema 
} from '@middleware/schemas/system/reservationSchemas'
import { reservationController } from '@controllers/ReservationController'

const router = Router()

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags:
 *       - Reservation Management
 *     summary: 建立預約
 *     description: |
 *       學生建立課程預約，系統會驗證學生購買記錄、教師可預約時段、時間衝突等條件。
 *       
 *       **業務邏輯**：
 *       - 驗證學生身份認證
 *       - 驗證學生是否有該課程的購買記錄和剩餘堂數
 *       - 驗證教師在指定日期時間是否有可預約時段
 *       - 檢查時間衝突（教師該時段是否已被預約）
 *       - 建立預約記錄並扣除一堂課
 *       - 同時設定教師和學生狀態為 "reserved"
 *       - 回傳預約詳情和剩餘堂數資訊
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReservationRequest'
 *     responses:
 *       201:
 *         description: 預約建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateReservationSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ReservationValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ReservationBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "預約參數驗證失敗"
 *                   errors:
 *                     course_id: ["課程 ID 為必填欄位"]
 *                     reserve_date: ["預約日期格式不正確"]
 *               business_error:
 *                 summary: 業務邏輯錯誤
 *                 value:
 *                   status: "error"
 *                   message: "課程已售完或剩餘堂數不足"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationUnauthorizedErrorResponse'
 *       404:
 *         description: 資源不存在 - 課程不存在或已下架
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationNotFoundErrorResponse'
 *       409:
 *         description: 衝突 - 時間衝突或其他業務衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationBusinessErrorResponse'
 *             examples:
 *               time_conflict:
 *                 summary: 時間衝突
 *                 value:
 *                   status: "error"
 *                   message: "該時段已被預約"
 *               insufficient_lessons:
 *                 summary: 堂數不足
 *                 value:
 *                   status: "error"
 *                   message: "剩餘堂數不足"
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/', 
  authenticateToken,
  createSchemasMiddleware({ body: createReservationSchema }),
  reservationController.createReservation
)

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags:
 *       - Reservation Management
 *     summary: 查詢預約列表
 *     description: |
 *       根據使用者角色查詢預約記錄，支援多種篩選條件。
 *       
 *       **業務邏輯**：
 *       - 學生（role=student）：查詢自己的預約記錄
 *       - 教師（role=teacher）：查詢自己收到的預約記錄
 *       - 支援依課程 ID 篩選（course_id）
 *       - 支援分頁查詢（page, per_page）
 *       - 支援狀態篩選（status）
 *       - 支援日期範圍篩選（date_from, date_to）
 *       - 回傳預約列表和分頁資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: role
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, teacher]
 *         description: 查詢角色（學生或教師視角）
 *         example: student
 *       - name: course_id
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID，篩選特定課程的預約記錄
 *         example: 2
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁數
 *         example: 1
 *       - name: per_page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *         example: 10
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [reserved, completed, cancelled]
 *         description: 預約狀態篩選
 *         example: reserved
 *       - name: date_from
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 查詢起始日期（YYYY-MM-DD）
 *         example: "2024-01-01"
 *       - name: date_to
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 查詢結束日期（YYYY-MM-DD）
 *         example: "2024-01-31"
 *     responses:
 *       200:
 *         description: 查詢成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationListSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationValidationErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationUnauthorizedErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.get('/', 
  authenticateToken,
  createSchemasMiddleware({ query: reservationListQuerySchema }),
  reservationController.getReservationList
)

router.put('/:id/status', 
  authenticateToken,
  createSchemasMiddleware({ params: reservationIdParamSchema, body: updateReservationStatusSchema }),
  reservationController.updateReservationStatus
)

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     tags:
 *       - Reservation Management
 *     summary: 取消預約
 *     description: |
 *       學生或教師取消預約，系統會自動退還課程堂數並更新預約狀態。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者身份認證和權限
 *       - 檢查預約是否存在且屬於該使用者
 *       - 驗證取消條件（時間限制等）
 *       - 將教師和學生狀態都更新為 "cancelled"
 *       - 退還一堂課程堂數給學生
 *       - 回傳取消後的預約資訊和退還堂數
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 預約 ID
 *         example: 123
 *     responses:
 *       200:
 *         description: 預約取消成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CancelReservationSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/ReservationValidationErrorResponse'
 *                 - $ref: '#/components/schemas/ReservationBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 參數驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "預約參數驗證失敗"
 *                   errors:
 *                     id: ["預約 ID 必須為正整數"]
 *               business_error:
 *                 summary: 取消條件不符
 *                 value:
 *                   status: "error"
 *                   message: "預約已開始或已過期，無法取消"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationUnauthorizedErrorResponse'
 *       403:
 *         description: 禁止存取 - 無權限操作此預約
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationBusinessErrorResponse'
 *             examples:
 *               unauthorized_access:
 *                 summary: 權限不足
 *                 value:
 *                   status: "error"
 *                   message: "無權限操作此預約"
 *       404:
 *         description: 預約不存在或已被刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationNotFoundErrorResponse'
 *             examples:
 *               reservation_not_found:
 *                 summary: 預約不存在
 *                 value:
 *                   status: "error"
 *                   message: "預約不存在或已被刪除"
 *       409:
 *         description: 衝突 - 預約狀態衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationBusinessErrorResponse'
 *             examples:
 *               already_cancelled:
 *                 summary: 預約已取消
 *                 value:
 *                   status: "error"
 *                   message: "預約已被取消"
 *               already_completed:
 *                 summary: 預約已完成
 *                 value:
 *                   status: "error"
 *                   message: "預約已完成，無法取消"
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.delete('/:id', 
  authenticateToken,
  createSchemasMiddleware({ params: reservationIdParamSchema }),
  reservationController.cancelReservation
)

router.get('/calendar', 
  authenticateToken,
  createSchemasMiddleware({ query: calendarViewQuerySchema }),
  reservationController.getCalendarView
)

export default router