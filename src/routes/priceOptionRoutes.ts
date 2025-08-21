/**
 * 課程價格方案路由
 * 
 * 提供課程價格方案管理的 API 端點，包括：
 * - GET /api/courses/:courseId/price-options - 查詢價格方案列表
 * - POST /api/courses/:courseId/price-options - 建立價格方案
 * - PUT /api/courses/:courseId/price-options/:id - 更新價格方案
 * - DELETE /api/courses/:courseId/price-options/:id - 刪除價格方案
 * 
 * 所有端點都需要教師身份認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { priceOptionController } from '@controllers/PriceOptionController'
import { validateRequest } from '@middleware/schemas/core'
import {
  priceOptionCreateSchema,
  priceOptionUpdateSchema
} from '@middleware/schemas/index'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Price Options
 *   description: 課程價格方案管理 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PriceOptionCreateRequest:
 *       type: object
 *       required:
 *         - price
 *         - quantity
 *       properties:
 *         price:
 *           type: number
 *           format: decimal
 *           minimum: 1
 *           maximum: 999999
 *           multipleOf: 0.01
 *           description: 價格（元）
 *           example: 1500
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 999
 *           description: 堂數
 *           example: 10
 *           
 *     PriceOptionUpdateRequest:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         price:
 *           type: number
 *           format: decimal
 *           minimum: 1
 *           maximum: 999999
 *           multipleOf: 0.01
 *           description: 價格（元）
 *           example: 1800
 *         quantity:
 *           type: integer
 *           minimum: 1
 *           maximum: 999
 *           description: 堂數
 *           example: 12
 *           
 *     PriceOptionResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 價格方案 ID
 *           example: 1
 *         uuid:
 *           type: string
 *           format: uuid
 *           description: 價格方案唯一識別碼
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         course_id:
 *           type: integer
 *           description: 課程 ID
 *           example: 1
 *         price:
 *           type: number
 *           format: decimal
 *           description: 價格（元）
 *           example: 1500
 *         quantity:
 *           type: integer
 *           description: 堂數
 *           example: 10
 *         is_active:
 *           type: boolean
 *           description: 是否啟用
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 *           example: "2024-01-15T10:30:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新時間
 *           example: "2024-01-15T10:30:00Z"
 */

/**
 * @swagger
 * /api/courses/{courseId}/price-options:
 *   get:
 *     tags: [Price Options]
 *     summary: 查詢課程價格方案列表
 *     description: 取得指定課程的所有啟用價格方案，按價格排序
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得價格方案列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PriceOptionResponse'
 *                 message:
 *                   type: string
 *                   example: "成功取得價格方案列表"
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TOKEN_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "Access token 為必填欄位"
 *       403:
 *         description: 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TEACHER_PERMISSION_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "需要教師權限才能執行此操作"
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "COURSE_NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "課程不存在"
 */
router.get('/:courseId/price-options', authenticateToken, priceOptionController.getPriceOptions)

/**
 * @swagger
 * /api/courses/{courseId}/price-options:
 *   post:
 *     tags: [Price Options]
 *     summary: 建立新價格方案
 *     description: 為指定課程建立新的價格方案（每個課程最多3個方案）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PriceOptionCreateRequest'
 *     responses:
 *       201:
 *         description: 成功建立價格方案
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/PriceOptionResponse'
 *                 message:
 *                   type: string
 *                   example: "價格方案建立成功"
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "error"
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "參數驗證失敗"
 *                     errors:
 *                       type: object
 *                       additionalProperties:
 *                         type: array
 *                         items:
 *                           type: string
 *                       example:
 *                         price: ["價格為必填欄位"]
 *                         quantity: ["堂數為必填欄位"]
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "error"
 *                     code:
 *                       type: string
 *                       example: "PRICE_OPTION_LIMIT_EXCEEDED"
 *                     message:
 *                       type: string
 *                       example: "每個課程最多只能有3個價格方案"
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TOKEN_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "Access token 為必填欄位"
 *       403:
 *         description: 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TEACHER_PERMISSION_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "需要教師權限才能執行此操作"
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "COURSE_NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "課程不存在"
 *       409:
 *         description: 價格方案重複
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "PRICE_OPTION_DUPLICATE"
 *                 message:
 *                   type: string
 *                   example: "此價格和堂數組合已存在"
 */
router.post(
  '/:courseId/price-options',
  authenticateToken,
  validateRequest(priceOptionCreateSchema, '價格方案建立參數驗證失敗'),
  priceOptionController.createPriceOption
)

/**
 * @swagger
 * /api/courses/{courseId}/price-options/{id}:
 *   put:
 *     tags: [Price Options]
 *     summary: 更新價格方案
 *     description: 更新指定的價格方案資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 價格方案 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PriceOptionUpdateRequest'
 *     responses:
 *       200:
 *         description: 成功更新價格方案
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/PriceOptionResponse'
 *                 message:
 *                   type: string
 *                   example: "價格方案更新成功"
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 message:
 *                   type: string
 *                   example: "參數驗證失敗"
 *                 errors:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: string
 *                   example:
 *                     price: ["價格格式不正確"]
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TOKEN_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "Access token 為必填欄位"
 *       403:
 *         description: 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TEACHER_PERMISSION_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "需要教師權限才能執行此操作"
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "error"
 *                     code:
 *                       type: string
 *                       example: "COURSE_NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "課程不存在"
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "error"
 *                     code:
 *                       type: string
 *                       example: "PRICE_OPTION_NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "找不到價格方案"
 *       409:
 *         description: 價格方案重複
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "PRICE_OPTION_DUPLICATE"
 *                 message:
 *                   type: string
 *                   example: "此價格和堂數組合已存在"
 */
router.put(
  '/:courseId/price-options/:id',
  authenticateToken,
  validateRequest(priceOptionUpdateSchema, '價格方案更新參數驗證失敗'),
  priceOptionController.updatePriceOption
)

/**
 * @swagger
 * /api/courses/{courseId}/price-options/{id}:
 *   delete:
 *     tags: [Price Options]
 *     summary: 刪除價格方案
 *     description: 刪除指定的價格方案（軟刪除，設為非啟用狀態）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 課程 ID
 *         example: 1
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 價格方案 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功刪除價格方案
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
 *                   example: "價格方案刪除成功"
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TOKEN_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "Access token 為必填欄位"
 *       403:
 *         description: 需要教師權限
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 code:
 *                   type: string
 *                   example: "TEACHER_PERMISSION_REQUIRED"
 *                 message:
 *                   type: string
 *                   example: "需要教師權限才能執行此操作"
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "error"
 *                     code:
 *                       type: string
 *                       example: "COURSE_NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "課程不存在"
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "error"
 *                     code:
 *                       type: string
 *                       example: "PRICE_OPTION_NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "找不到價格方案"
 */
router.delete('/:courseId/price-options/:id', authenticateToken, priceOptionController.deletePriceOption)

export default router