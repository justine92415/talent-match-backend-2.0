import { Router } from 'express'
import { TeacherScheduleController } from '../../controllers/teachers/TeacherScheduleController'
import { authenticateToken } from '../../middleware/auth'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeSlot:
 *       type: object
 *       required:
 *         - weekday
 *         - start_time
 *         - end_time
 *       properties:
 *         weekday:
 *           type: number
 *           description: 星期幾（0=週日, 1=週一, ..., 6=週六）
 *           example: 1
 *           minimum: 0
 *           maximum: 6
 *         start_time:
 *           type: string
 *           description: 開始時間（HH:mm格式）
 *           example: "09:00"
 *           pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *         end_time:
 *           type: string
 *           description: 結束時間（HH:mm格式）
 *           example: "12:00"
 *           pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *     ScheduleUpdateRequest:
 *       type: object
 *       required:
 *         - schedule
 *       properties:
 *         schedule:
 *           type: array
 *           description: 時段設定列表
 *           items:
 *             $ref: '#/components/schemas/TimeSlot'
 *           example:
 *             - weekday: 1
 *               start_time: "09:00"
 *               end_time: "12:00"
 *             - weekday: 1
 *               start_time: "14:00"
 *               end_time: "17:00"
 *             - weekday: 3
 *               start_time: "10:00"
 *               end_time: "16:00"
 *     ScheduleResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         teacher_id:
 *           type: number
 *           example: 123
 *         weekday:
 *           type: number
 *           example: 1
 *         start_time:
 *           type: string
 *           example: "09:00"
 *         end_time:
 *           type: string
 *           example: "12:00"
 *         is_active:
 *           type: boolean
 *           example: true
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
 * /api/teachers/schedule:
 *   get:
 *     tags:
 *       - 教師時間管理
 *     summary: 查看可預約時段設定
 *     description: |
 *       查看當前教師的可預約時段設定
 *
 *       **業務規則：**
 *       - 只能查看自己的時段設定
 *       - 按星期和開始時間排序
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
 *                         schedule:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ScheduleResponse'
 *             examples:
 *               success:
 *                 summary: 成功取得時段設定
 *                 value:
 *                   status: success
 *                   message: 查詢成功
 *                   data:
 *                     schedule:
 *                       - id: 1
 *                         teacher_id: 123
 *                         weekday: 1
 *                         start_time: "09:00"
 *                         end_time: "12:00"
 *                         is_active: true
 *                         created_at: "2025-01-08T10:00:00.000Z"
 *                         updated_at: "2025-01-08T10:00:00.000Z"
 *                       - id: 2
 *                         teacher_id: 123
 *                         weekday: 1
 *                         start_time: "14:00"
 *                         end_time: "17:00"
 *                         is_active: true
 *                         created_at: "2025-01-08T10:00:00.000Z"
 *                         updated_at: "2025-01-08T10:00:00.000Z"
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
 */
router.get('/', authenticateToken, TeacherScheduleController.getSchedule)

/**
 * @swagger
 * /api/teachers/schedule:
 *   put:
 *     tags:
 *       - 教師時間管理
 *     summary: 更新可預約時段設定
 *     description: |
 *       更新教師的可預約時段設定，會覆蓋所有現有設定
 *
 *       **業務規則：**
 *       - 只能設定自己的時段
 *       - 開始時間必須早於結束時間
 *       - 同一天的時段不能重疊
 *       - 時間格式必須是HH:mm
 *       - 星期範圍：0-6（0=週日）
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
 *             $ref: '#/components/schemas/ScheduleUpdateRequest'
 *           examples:
 *             weekday_schedule:
 *               summary: 平日時段設定
 *               value:
 *                 schedule:
 *                   - weekday: 1
 *                     start_time: "09:00"
 *                     end_time: "12:00"
 *                   - weekday: 1
 *                     start_time: "14:00"
 *                     end_time: "17:00"
 *                   - weekday: 2
 *                     start_time: "10:00"
 *                     end_time: "16:00"
 *                   - weekday: 3
 *                     start_time: "09:00"
 *                     end_time: "12:00"
 *                   - weekday: 4
 *                     start_time: "14:00"
 *                     end_time: "18:00"
 *                   - weekday: 5
 *                     start_time: "10:00"
 *                     end_time: "15:00"
 *             weekend_schedule:
 *               summary: 包含週末的時段設定
 *               value:
 *                 schedule:
 *                   - weekday: 6
 *                     start_time: "09:00"
 *                     end_time: "12:00"
 *                   - weekday: 0
 *                     start_time: "14:00"
 *                     end_time: "17:00"
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
 *                         schedule:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ScheduleResponse'
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
 *                     schedule: ["時段設定為必填欄位"]
 *                     "schedule[0].weekday": ["星期必須是0-6的整數"]
 *                     "schedule[0].start_time": ["開始時間格式錯誤（必須是HH:mm）"]
 *                     "schedule[0].time_range": ["開始時間必須早於結束時間"]
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
 */
router.put('/', authenticateToken, TeacherScheduleController.updateSchedule)

/**
 * @swagger
 * /api/teachers/schedule/conflicts:
 *   get:
 *     tags:
 *       - 教師時間管理
 *     summary: 檢查時段衝突（查詢參數）
 *     description: |
 *       透過查詢參數檢查指定時段是否與現有時段衝突
 *
 *       **業務規則：**
 *       - 檢查指定時段與現有時段是否重疊
 *       - 只檢查啟用的時段
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: weekday
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 6
 *         description: 星期（0=週日，1=週一，...，6=週六）
 *         example: 1
 *       - in: query
 *         name: start_time
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *         description: 開始時間（HH:mm 格式）
 *         example: "10:00"
 *       - in: query
 *         name: end_time
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^([01]\d|2[0-3]):([0-5]\d)$'
 *         description: 結束時間（HH:mm 格式）
 *         example: "11:00"
 *     responses:
 *       200:
 *         description: 檢查完成
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
 *                         has_conflict:
 *                           type: boolean
 *                           description: 是否有衝突
 *                           example: false
 *                         conflicts:
 *                           type: array
 *                           description: 衝突的時段列表
 *                           items:
 *                             type: object
 *                             properties:
 *                               weekday:
 *                                 type: integer
 *                                 example: 1
 *                               start_time:
 *                                 type: string
 *                                 example: "09:00"
 *                               end_time:
 *                                 type: string
 *                                 example: "12:00"
 *                               conflicting_reservations:
 *                                 type: integer
 *                                 example: 0
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
router.get('/conflicts', authenticateToken, TeacherScheduleController.checkTimeSlotConflicts)

/**
 * @swagger
 * /api/teachers/schedule/conflicts:
 *   post:
 *     tags:
 *       - 教師時間管理
 *     summary: 檢查時段衝突
 *     description: |
 *       檢查時段設定是否有衝突，不會實際儲存設定
 *
 *       **業務規則：**
 *       - 檢查同一天的時段是否重疊
 *       - 檢查時間邏輯是否正確
 *       - 不會修改現有設定
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
 *             $ref: '#/components/schemas/ScheduleUpdateRequest'
 *     responses:
 *       200:
 *         description: 檢查完成
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
 *                         has_conflicts:
 *                           type: boolean
 *                           description: 是否有衝突
 *                           example: true
 *                         conflicts:
 *                           type: array
 *                           description: 衝突詳情列表
 *                           items:
 *                             type: string
 *                           example:
 *                             - "星期1 09:00-12:00 與 10:00-14:00 時段重疊"
 *             examples:
 *               no_conflicts:
 *                 summary: 無衝突
 *                 value:
 *                   status: success
 *                   message: 檢查完成
 *                   data:
 *                     has_conflicts: false
 *                     conflicts: []
 *               has_conflicts:
 *                 summary: 有衝突
 *                 value:
 *                   status: success
 *                   message: 檢查完成
 *                   data:
 *                     has_conflicts: true
 *                     conflicts:
 *                       - "星期1 09:00-12:00 與 10:00-14:00 時段重疊"
 *                       - "星期3 14:00-17:00 與 15:00-18:00 時段重疊"
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 */
router.post('/conflicts', authenticateToken, TeacherScheduleController.checkConflicts)

export default router
