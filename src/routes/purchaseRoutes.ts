/**
 * 購買記錄路由
 * 
 * 提供購買記錄管理的 API 端點，包括：
 * - POST /api/purchases/from-order - 從訂單建立購買記錄
 * - GET /api/purchases - 取得使用者購買記錄列表
 * - GET /api/purchases/courses/:courseId - 取得特定課程的購買記錄
 * - POST /api/purchases/courses/:courseId/consume - 消耗課程使用次數
 * - GET /api/purchases/courses/:courseId/check - 檢查課程購買狀態
 * 
 * 所有端點都需要使用者身份認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { PurchaseController } from '@controllers/PurchaseController'
import { validateUsePurchase } from '@middleware/validation'

const router = Router()
const purchaseController = new PurchaseController()

/**
 * @swagger
 * tags:
 *   name: Purchases
 *   description: 購買記錄管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreatePurchaseFromOrderRequest:
 *       type: object
 *       required:
 *         - order_id
 *       properties:
 *         order_id:
 *           type: integer
 *           description: 訂單 ID
 *           example: 1
 * 
 *     ConsumeCourseUsageRequest:
 *       type: object
 *       properties:
 *         consumption_type:
 *           type: string
 *           enum: [session, video_view, material_download]
 *           default: session
 *           description: 消耗類型（選填，預設為session）
 *           example: session
 *         note:
 *           type: string
 *           maxLength: 500
 *           description: 消耗備註（選填）
 *           example: 第一次上課
 * 
 *     PurchaseRecordResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 購買記錄 ID
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: 購買記錄 UUID
 *         user_id:
 *           type: integer
 *           description: 使用者 ID
 *         order_item_id:
 *           type: integer
 *           description: 訂單項目 ID
 *         course_id:
 *           type: integer
 *           description: 課程 ID
 *         price_option_id:
 *           type: integer
 *           description: 價格方案 ID
 *         purchased_quantity:
 *           type: integer
 *           description: 購買數量
 *         remaining_quantity:
 *           type: integer
 *           description: 剩餘數量
 *         unit_price:
 *           type: number
 *           description: 單價
 *         total_paid:
 *           type: number
 *           description: 總支付金額
 *         purchase_date:
 *           type: string
 *           format: date-time
 *           description: 購買日期
 *         expiry_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 過期日期
 *         status:
 *           type: string
 *           enum: [active, expired, consumed, cancelled]
 *           description: 狀態
 *         course:
 *           type: object
 *           description: 課程資訊
 *           properties:
 *             id:
 *               type: integer
 *             uuid:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             main_image:
 *               type: string
 *               nullable: true
 *         price_option:
 *           type: object
 *           description: 價格方案資訊
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             price:
 *               type: number
 *             duration_days:
 *               type: integer
 *               nullable: true
 *             session_count:
 *               type: integer
 *               nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 *     CheckCourseStatusResponse:
 *       type: object
 *       properties:
 *         has_purchased:
 *           type: boolean
 *           description: 是否已購買
 *         has_access:
 *           type: boolean
 *           description: 是否有存取權限
 *         total_purchased:
 *           type: integer
 *           description: 總購買次數
 *         total_remaining:
 *           type: integer
 *           description: 總剩餘次數
 *         active_purchases:
 *           type: integer
 *           description: 有效購買記錄數
 *         latest_purchase:
 *           $ref: '#/components/schemas/PurchaseRecordResponse'
 *           nullable: true
 *           description: 最新購買記錄
 */

/**
 * @swagger
 * /api/purchases/from-order:
 *   post:
 *     tags: [Purchases]
 *     summary: 從訂單建立購買記錄
 *     description: 根據已付款的訂單建立對應的購買記錄，啟用課程存取權限
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePurchaseFromOrderRequest'
 *     responses:
 *       201:
 *         description: 購買記錄建立成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PurchaseRecordResponse'
 *                   description: 建立的購買記錄列表
 *       400:
 *         description: 請求參數驗證失敗或訂單狀態不符
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 訂單不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 購買記錄已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/from-order', authenticateToken, purchaseController.createPurchaseFromOrder)

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     tags: [Purchases]
 *     summary: 取得使用者購買記錄列表
 *     description: 取得當前使用者的所有購買記錄，支援分頁和狀態篩選
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁數
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, consumed, cancelled]
 *         description: 狀態篩選
 *       - in: query
 *         name: course_id
 *         schema:
 *           type: integer
 *         description: 課程 ID 篩選
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [purchase_date, expiry_date, total_paid]
 *           default: purchase_date
 *         description: 排序欄位
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方式
 *     responses:
 *       200:
 *         description: 成功取得購買記錄列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     purchases:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PurchaseRecordResponse'
 *                     total:
 *                       type: integer
 *                       description: 總記錄數量
 *                     page:
 *                       type: integer
 *                       description: 當前頁數
 *                     limit:
 *                       type: integer
 *                       description: 每頁筆數
 *                     total_pages:
 *                       type: integer
 *                       description: 總頁數
 *       400:
 *         description: 查詢參數驗證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, purchaseController.getUserPurchases)

/**
 * @swagger
 * /api/purchases/courses/{courseId}:
 *   get:
 *     tags: [Purchases]
 *     summary: 取得特定課程的購買記錄
 *     description: 取得使用者對特定課程的所有購買記錄
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     responses:
 *       200:
 *         description: 成功取得課程購買記錄
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PurchaseRecordResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 課程不存在或無購買記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/courses/:courseId', authenticateToken, purchaseController.getCoursePurchase)

/**
 * @swagger
 * /api/purchases/courses/{courseId}/consume:
 *   post:
 *     tags: [Purchases]
 *     summary: 消耗課程使用次數
 *     description: 消耗使用者對特定課程的購買次數，用於記錄課程使用情況
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConsumeCourseUsageRequest'
 *     responses:
 *       200:
 *         description: 課程使用次數消耗成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     consumed:
 *                       type: boolean
 *                       description: 是否成功消耗
 *                     purchase_record:
 *                       $ref: '#/components/schemas/PurchaseRecordResponse'
 *                       description: 更新後的購買記錄
 *       400:
 *         description: 請求參數錯誤或無可用次數
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 課程不存在或無有效購買記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/courses/:courseId/consume', authenticateToken, purchaseController.consumePurchase)

/**
 * @swagger
 * /api/purchases/courses/{courseId}/check:
 *   get:
 *     tags: [Purchases]
 *     summary: 檢查課程購買狀態
 *     description: 檢查使用者對特定課程的購買狀態和存取權限
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 課程 ID
 *     responses:
 *       200:
 *         description: 成功取得課程購買狀態
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CheckCourseStatusResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/courses/:courseId/check', authenticateToken, purchaseController.checkCoursePurchase)

/**
 * @swagger
 * /api/purchases/{id}/use:
 *   post:
 *     tags: [Purchases]
 *     summary: 使用購買堂數
 *     description: 消耗指定購買記錄的使用次數
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 購買記錄 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: 使用數量
 *                 example: 1
 *     responses:
 *       200:
 *         description: 使用成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseRecordResponse'
 *       400:
 *         description: 使用數量無效或超過剩餘數量
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 購買記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/use', authenticateToken, validateUsePurchase, purchaseController.usePurchase)

/**
 * @swagger
 * /api/purchases/summary:
 *   get:
 *     tags: [Purchases]
 *     summary: 取得購買統計資料
 *     description: 取得使用者的購買統計資料和摘要資訊
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功取得統計資料
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_courses:
 *                       type: integer
 *                       description: 總購買課程數
 *                     total_amount_spent:
 *                       type: number
 *                       description: 總消費金額
 *                     active_purchases:
 *                       type: integer
 *                       description: 有效購買記錄數
 *                     total_sessions_remaining:
 *                       type: integer
 *                       description: 總剩餘堂數
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/summary', authenticateToken, purchaseController.getPurchaseSummary)

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     tags: [Purchases]
 *     summary: 取得單一購買記錄詳情
 *     description: 取得指定 ID 的購買記錄詳細資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 購買記錄 ID
 *     responses:
 *       200:
 *         description: 成功取得購買記錄詳情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PurchaseRecordResponse'
 *       401:
 *         description: 未認證或認證失敗
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 無權存取該購買記錄
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 購買記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', authenticateToken, purchaseController.getPurchaseById)

export default router