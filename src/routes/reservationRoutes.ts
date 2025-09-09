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
 * tags:
 *   - name: Reservation Management
 *     description: 預約管理相關 API
 * 
 * components:
 *   schemas:
 *     CreateReservationRequest:
 *       type: object
 *       required:
 *         - course_id
 *         - teacher_id
 *         - reserve_date
 *         - reserve_time
 *       properties:
 *         course_id:
 *           type: integer
 *           description: 課程ID
 *           example: 1
 *         teacher_id:
 *           type: integer
 *           description: 教師ID
 *           example: 1
 *         reserve_date:
 *           type: string
 *           format: date
 *           description: 預約日期 (YYYY-MM-DD)
 *           example: "2025-08-25"
 *         reserve_time:
 *           type: string
 *           pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$'
 *           description: 預約時間 (HH:MM)
 *           example: "10:00"
 * 
 *     UpdateReservationStatusRequest:
 *       type: object
 *       required:
 *         - status_type
 *       properties:
 *         status_type:
 *           type: string
 *           enum: [teacher-complete, student-complete]
 *           description: 狀態更新類型
 *           example: "teacher-complete"
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: 備註
 *           example: "課程順利完成"
 * 
 *     ReservationDetail:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 預約ID
 *         uuid:
 *           type: string
 *           description: 預約唯一識別碼
 *         course_id:
 *           type: integer
 *           description: 課程ID
 *         teacher_id:
 *           type: integer
 *           description: 教師ID
 *         student_id:
 *           type: integer
 *           description: 學生ID
 *         reserve_time:
 *           type: string
 *           format: date-time
 *           description: 預約時間
 *         teacher_status:
 *           type: string
 *           enum: [reserved, completed, cancelled]
 *           description: 教師狀態
 *         student_status:
 *           type: string
 *           enum: [reserved, completed, cancelled]
 *           description: 學生狀態
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 *         course:
 *           type: object
 *           description: 課程資訊
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             teacher:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     nick_name:
 *                       type: string
 * 
 *     CreateReservationResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 reservation:
 *                   $ref: '#/components/schemas/ReservationDetail'
 *                 remaining_lessons:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: 總堂數
 *                     used:
 *                       type: integer
 *                       description: 已使用堂數
 *                     remaining:
 *                       type: integer
 *                       description: 剩餘堂數
 * 
 *     ReservationListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 reservations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ReservationDetail'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationResponse'
 * 
 *     CalendarViewResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/SuccessResponse'
 *         - type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 view:
 *                   type: string
 *                   enum: [week, month]
 *                   description: 檢視模式
 *                 period:
 *                   oneOf:
 *                     - type: object
 *                       description: 週檢視期間
 *                       properties:
 *                         start_date:
 *                           type: string
 *                           format: date
 *                         end_date:
 *                           type: string
 *                           format: date
 *                     - type: object
 *                       description: 月檢視期間
 *                       properties:
 *                         year:
 *                           type: integer
 *                         month:
 *                           type: integer
 *                         start_date:
 *                           type: string
 *                           format: date
 *                         end_date:
 *                           type: string
 *                           format: date
 *                 calendar_data:
 *                   type: array
 *                   description: 日曆資料
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                         description: 日期
 *                       weekday:
 *                         type: integer
 *                         minimum: 0
 *                         maximum: 6
 *                         description: 星期 (0=週日, 6=週六)
 *                       reservations:
 *                         type: array
 *                         description: 該日的預約
 *                         items:
 *                           $ref: '#/components/schemas/ReservationDetail'
 *                 summary:
 *                   type: object
 *                   description: 月檢視才有的統計資料
 *                   properties:
 *                     total_reservations:
 *                       type: integer
 *                       description: 總預約數
 *                     completed_reservations:
 *                       type: integer
 *                       description: 已完成預約數
 *                     cancelled_reservations:
 *                       type: integer
 *                       description: 已取消預約數
 */

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags: [Reservation Management]
 *     summary: 建立預約
 *     description: 學生為購買的課程建立預約時段
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
 *               $ref: '#/components/schemas/CreateReservationResponse'
 *       400:
 *         description: 請求資料驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 *             examples:
 *               missing_fields:
 *                 summary: 缺少必填欄位
 *                 value:
 *                   status: "error"
 *                   code: "VALIDATION_ERROR"
 *                   message: "驗證失敗"
 *                   errors:
 *                     course_id: ["課程ID為必填欄位"]
 *               past_time:
 *                 summary: 預約過去時間
 *                 value:
 *                   status: "error"
 *                   code: "RESERVATION_PAST_TIME_NOT_ALLOWED"
 *                   message: "不能預約過去的時間"
 *               advance_booking:
 *                 summary: 未滿足提前預約要求
 *                 value:
 *                   status: "error"
 *                   code: "RESERVATION_ADVANCE_BOOKING_REQUIRED"
 *                   message: "預約須提前24小時"
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 課程或教師不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 時段衝突或業務邏輯違反
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               time_conflict:
 *                 summary: 時段已被預約
 *                 value:
 *                   status: "error"
 *                   code: "RESERVATION_CONFLICT"
 *                   message: "該時段已被其他學生預約"
 *               insufficient_lessons:
 *                 summary: 課程堂數不足
 *                 value:
 *                   status: "error"
 *                   code: "RESERVATION_INSUFFICIENT_LESSONS"
 *                   message: "課程堂數不足"
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
 *     tags: [Reservation Management]
 *     summary: 查詢預約列表
 *     description: 根據使用者角色查詢預約列表，支援篩選和分頁
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [student, teacher]
 *         description: 使用者角色
 *         example: student
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [reserved, completed, cancelled]
 *         description: 預約狀態篩選
 *         example: reserved
 *       - in: query
 *         name: date_from
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日期 (YYYY-MM-DD)
 *         example: "2025-08-01"
 *       - in: query
 *         name: date_to
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 結束日期 (YYYY-MM-DD)
 *         example: "2025-08-31"
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *         example: 1
 *       - in: query
 *         name: per_page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *         example: 10
 *     responses:
 *       200:
 *         description: 查詢成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationListResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', 
  authenticateToken,
  createSchemasMiddleware({ query: reservationListQuerySchema }),
  reservationController.getReservationList
)

/**
 * @swagger
 * /api/reservations/{id}/status:
 *   put:
 *     tags: [Reservation Management]
 *     summary: 更新預約狀態
 *     description: 教師或學生標記課程完成狀態
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 預約ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReservationStatusRequest'
 *     responses:
 *       200:
 *         description: 狀態更新成功
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
 *                         reservation:
 *                           $ref: '#/components/schemas/ReservationDetail'
 *                         is_fully_completed:
 *                           type: boolean
 *                           description: 是否雙方都已完成確認
 *       400:
 *         description: 請求資料驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 無權限操作此預約
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 預約不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id/status', 
  authenticateToken,
  createSchemasMiddleware({ params: reservationIdParamSchema, body: updateReservationStatusSchema }),
  reservationController.updateReservationStatus
)

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     tags: [Reservation Management]
 *     summary: 取消預約
 *     description: 學生或教師取消預約，需滿足提前24小時要求
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 預約ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 預約取消成功
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
 *                         reservation:
 *                           $ref: '#/components/schemas/ReservationDetail'
 *                         refunded_lessons:
 *                           type: integer
 *                           description: 退還的課程堂數
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 無權限操作此預約
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 預約不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 業務邏輯違反
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               too_late_to_cancel:
 *                 summary: 距離開始時間不足24小時
 *                 value:
 *                   status: "error"
 *                   code: "RESERVATION_CANCEL_TIME_LIMIT"
 *                   message: "距離課程開始不足24小時，無法取消"
 *               already_completed:
 *                 summary: 預約已完成
 *                 value:
 *                   status: "error"
 *                   code: "RESERVATION_ALREADY_COMPLETED"
 *                   message: "已完成的預約無法取消"
 */
router.delete('/:id', 
  authenticateToken,
  createSchemasMiddleware({ params: reservationIdParamSchema }),
  reservationController.cancelReservation
)

/**
 * @swagger
 * /api/reservations/calendar:
 *   get:
 *     tags: [Reservation Management]
 *     summary: 取得日曆檢視
 *     description: 以週或月檢視查看預約日曆
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: view
 *         required: true
 *         schema:
 *           type: string
 *           enum: [week, month]
 *         description: 檢視模式
 *         example: month
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 目標日期 (YYYY-MM-DD)
 *         example: "2025-08-25"
 *       - in: query
 *         name: role
 *         required: false
 *         schema:
 *           type: string
 *           enum: [student, teacher]
 *           default: student
 *         description: 使用者角色
 *         example: student
 *     responses:
 *       200:
 *         description: 查詢成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalendarViewResponse'
 *       400:
 *         description: 請求參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SchemasError'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/calendar', 
  authenticateToken,
  createSchemasMiddleware({ query: calendarViewQuerySchema }),
  reservationController.getCalendarView
)

export default router