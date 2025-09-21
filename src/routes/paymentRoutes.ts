/**
 * 付款路由
 * 
 * 提供付款相關的 API 端點：
 * - POST /api/orders/:orderId/payment - 建立付款連結
 * - GET /api/orders/:orderId/payment/status - 查詢付款狀態
 * - POST /api/orders/:orderId/payment/check - 手動檢查付款狀態
 * - POST /api/payments/ecpay/callback - 綠界付款回調 (無需認證)
 * - GET /api/payments/ecpay/return - 綠界付款返回 (無需認證)
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { paymentController } from '@controllers/PaymentController'

const router = Router()

/**
 * @swagger
 * /api/orders/{orderId}/payment:
 *   post:
 *     tags:
 *       - Payment
 *     summary: 建立付款連結
 *     description: |
 *       為指定訂單建立綠界付款連結。
 *       
 *       **業務邏輯**：
 *       - 驗證訂單存在且屬於該使用者
 *       - 檢查訂單付款狀態為待付款
 *       - 生成綠界商店訂單編號
 *       - 建立綠界付款表單資料
 *       - 更新訂單狀態為處理中
 *       
 *       **前端使用方式**：
 *       1. 取得回傳的 form_data
 *       2. 動態建立 HTML form
 *       3. 自動提交到 payment_url
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: 訂單 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 付款連結建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePaymentSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或訂單狀態異常
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentValidationErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 訂單不存在
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
// 建立付款連結
router.post('/orders/:orderId/payment', authenticateToken, paymentController.createPayment)

/**
 * @swagger
 * /api/orders/{orderId}/payment/status:
 *   get:
 *     tags:
 *       - Payment
 *     summary: 查詢付款狀態
 *     description: |
 *       查詢指定訂單的付款狀態。
 *       
 *       **業務邏輯**：
 *       - 驗證訂單存在且屬於該使用者
 *       - 回傳最新的付款狀態資訊
 *       - 包含綠界交易資訊 (如有)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: 訂單 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 付款狀態查詢成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentStatusSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentValidationErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 訂單不存在
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
// 查詢付款狀態
router.get('/orders/:orderId/payment/status', authenticateToken, paymentController.getPaymentStatus)

/**
 * @swagger
 * /api/orders/{orderId}/payment/check:
 *   post:
 *     tags:
 *       - Payment
 *     summary: 手動檢查付款狀態 (開發用)
 *     description: |
 *       手動檢查訂單付款狀態，主要用於開發階段測試。
 *       
 *       **注意**：正常情況下綠界會自動回調更新付款狀態，
 *       此 API 僅用於開發測試和異常狀況的手動檢查。
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: 訂單 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 手動檢查完成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentStatusSuccessResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentValidationErrorResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 訂單不存在
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
// 手動檢查付款狀態 (開發用)
router.post('/orders/:orderId/payment/check', authenticateToken, paymentController.checkPaymentManually)

/**
 * @swagger
 * /api/payments/ecpay/callback:
 *   post:
 *     tags:
 *       - Payment
 *     summary: 綠界付款回調 (Server-to-Server)
 *     description: |
 *       綠界金流的付款結果回調端點 (無需認證)。
 *       
 *       **注意**：
 *       - 此端點由綠界伺服器直接呼叫
 *       - 不需要前端呼叫
 *       - 用於接收付款成功/失敗的通知
 *       - 會自動更新訂單付款狀態
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               MerchantID:
 *                 type: string
 *                 description: 商店代號
 *               MerchantTradeNo:
 *                 type: string
 *                 description: 商店訂單編號
 *               RtnCode:
 *                 type: string
 *                 description: 交易狀態 (1=成功)
 *               RtnMsg:
 *                 type: string
 *                 description: 交易訊息
 *               TradeNo:
 *                 type: string
 *                 description: 綠界交易編號
 *               TradeAmt:
 *                 type: string
 *                 description: 交易金額
 *               PaymentDate:
 *                 type: string
 *                 description: 付款時間
 *               PaymentType:
 *                 type: string
 *                 description: 付款方式
 *               CheckMacValue:
 *                 type: string
 *                 description: 檢查碼
 *     responses:
 *       200:
 *         description: 回調處理成功
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "1|OK"
 */
// 綠界付款回調 (無需認證)
router.post('/payments/ecpay/callback', paymentController.handleEcpayCallback)

/**
 * @swagger
 * /api/payments/ecpay/return:
 *   get:
 *     tags:
 *       - Payment
 *     summary: 綠界付款返回處理
 *     description: |
 *       使用者完成付款後，綠界會將瀏覽器重導向到此端點。
 *       此端點會再次重導向到前端的結果頁面。
 *       
 *       **流程**：
 *       1. 使用者在綠界完成付款
 *       2. 綠界重導向到此端點
 *       3. 此端點重導向到前端結果頁面
 *     parameters:
 *       - name: MerchantTradeNo
 *         in: query
 *         description: 商店訂單編號
 *         schema:
 *           type: string
 *       - name: RtnCode
 *         in: query
 *         description: 交易狀態 (1=成功)
 *         schema:
 *           type: string
 *       - name: RtnMsg
 *         in: query
 *         description: 交易訊息
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: 重導向到前端結果頁面
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               example: "https://yourfrontend.com/payment/success?orderNo=ORDER123456"
 */
// 綠界付款返回 (無需認證)
router.get('/payments/ecpay/return', paymentController.handleEcpayReturn)

export default router