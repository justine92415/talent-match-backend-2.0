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

router.get('/:courseId/price-options', authenticateToken, priceOptionController.getPriceOptions)

router.post(
  '/:courseId/price-options',
  authenticateToken,
  validateRequest(priceOptionCreateSchema, '價格方案建立參數驗證失敗'),
  priceOptionController.createPriceOption
)

router.put(
  '/:courseId/price-options/:id',
  authenticateToken,
  validateRequest(priceOptionUpdateSchema, '價格方案更新參數驗證失敗'),
  priceOptionController.updatePriceOption
)

router.delete('/:courseId/price-options/:id', authenticateToken, priceOptionController.deletePriceOption)

export default router