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