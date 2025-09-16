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
 * /api/courses/{courseId}/price-options:
 *   get:
 *     summary: 取得課程價格方案列表
 *     description: |
 *       取得指定課程的所有價格方案。
 *       只有課程擁有者（教師）可以查看價格方案。
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己課程的價格方案
 *     tags: [價格方案管理]
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
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PriceOptionInfo'
 *             examples:
 *               success:
 *                 summary: 成功回應範例
 *                 value:
 *                   status: "success"
 *                   message: "成功取得價格方案列表"
 *                   data:
 *                     - id: 1
 *                       name: "單堂課程"
 *                       price: 1500
 *                       quantity: 1
 *                       description: "一對一個人指導課程"
 *                       created_at: "2024-01-15T10:00:00Z"
 *                       updated_at: "2024-01-20T15:30:00Z"
 *                     - id: 2
 *                       name: "三堂套裝"
 *                       price: 4000
 *                       quantity: 3
 *                       description: "三堂課程優惠套裝"
 *                       created_at: "2024-01-15T10:00:00Z"
 *                       updated_at: "2024-01-20T15:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能查看自己的課程價格方案
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 權限不足
 *                 value:
 *                   status: "error"
 *                   message: "權限不足，只能查看自己的課程"
 *                   error_code: "COURSE_ACCESS_DENIED"
 *       404:
 *         description: 課程不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               not_found:
 *                 summary: 課程不存在
 *                 value:
 *                   status: "error"
 *                   message: "課程不存在"
 *                   error_code: "COURSE_NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:courseId/price-options', authenticateToken, priceOptionController.getPriceOptions)

/**
 * @swagger
 * /api/courses/{courseId}/price-options:
 *   post:
 *     summary: 建立課程價格方案
 *     description: |
 *       為指定課程建立新的價格方案。
 *       只有課程擁有者（教師）可以建立價格方案。
 *       
 *       **業務規則：**
 *       - 價格範圍：1 ~ 999,999 元
 *       - 堂數範圍：1 ~ 999 堂
 *       - 價格支援小數點後兩位
 *       - 每個課程最多可建立多個價格方案
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能為自己的課程建立價格方案
 *     tags: [價格方案管理]
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
 *           examples:
 *             single_lesson:
 *               summary: 單堂課程
 *               value:
 *                 name: "單堂課程"
 *                 price: 1500
 *                 quantity: 1
 *                 description: "一對一個人指導課程"
 *             package_deal:
 *               summary: 套裝課程
 *               value:
 *                 name: "五堂套裝"
 *                 price: 6500
 *                 quantity: 5
 *                 description: "五堂課程優惠套裝，平均每堂 1300 元"
 *     responses:
 *       201:
 *         description: 價格方案建立成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PriceOptionInfo'
 *             examples:
 *               success:
 *                 summary: 建立成功回應
 *                 value:
 *                   status: "success"
 *                   message: "價格方案建立成功"
 *                   data:
 *                     id: 1
 *                     name: "單堂課程"
 *                     price: 1500
 *                     quantity: 1
 *                     description: "一對一個人指導課程"
 *                     created_at: "2024-01-15T10:00:00Z"
 *                     updated_at: "2024-01-15T10:00:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能為自己的課程建立價格方案
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
 *         $ref: '#/components/responses/InternalServerError'
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
 *     summary: 更新課程價格方案
 *     description: |
 *       更新指定課程的價格方案資訊。
 *       只有課程擁有者（教師）可以更新價格方案。
 *       
 *       **業務規則：**
 *       - 可部分更新欄位
 *       - 至少需要提供一個要更新的欄位
 *       - 價格和堂數驗證規則與建立時相同
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能更新自己課程的價格方案
 *     tags: [價格方案管理]
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
 *           examples:
 *             update_price:
 *               summary: 只更新價格
 *               value:
 *                 price: 1800
 *             update_all:
 *               summary: 更新多個欄位
 *               value:
 *                 name: "單堂課程 (進階)"
 *                 price: 1800
 *                 quantity: 1
 *                 description: "一對一進階課程指導"
 *     responses:
 *       200:
 *         description: 價格方案更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PriceOptionInfo'
 *             examples:
 *               success:
 *                 summary: 更新成功回應
 *                 value:
 *                   status: "success"
 *                   message: "價格方案更新成功"
 *                   data:
 *                     id: 1
 *                     name: "單堂課程 (進階)"
 *                     price: 1800
 *                     quantity: 1
 *                     description: "一對一進階課程指導"
 *                     created_at: "2024-01-15T10:00:00Z"
 *                     updated_at: "2024-01-20T15:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能更新自己課程的價格方案
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 課程或價格方案不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               price_option_not_found:
 *                 summary: 價格方案不存在
 *                 value:
 *                   status: "error"
 *                   message: "價格方案不存在"
 *                   error_code: "PRICE_OPTION_NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 *     summary: 刪除課程價格方案
 *     description: |
 *       刪除指定課程的價格方案。
 *       只有課程擁有者（教師）可以刪除價格方案。
 *       
 *       **業務規則：**
 *       - 如果價格方案已有訂單，將不允許刪除
 *       - 刪除是永久性的，無法恢復
 *       - 至少需要保留一個價格方案
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能刪除自己課程的價格方案
 *     tags: [價格方案管理]
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
 *         description: 價格方案刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             examples:
 *               success:
 *                 summary: 刪除成功回應
 *                 value:
 *                   status: "success"
 *                   message: "價格方案刪除成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能刪除自己課程的價格方案
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 課程或價格方案不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 價格方案已有訂單，無法刪除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               has_orders:
 *                 summary: 已有訂單無法刪除
 *                 value:
 *                   status: "error"
 *                   message: "此價格方案已有訂單，無法刪除"
 *                   error_code: "PRICE_OPTION_HAS_ORDERS"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete('/:courseId/price-options/:id', authenticateToken, priceOptionController.deletePriceOption)

export default router