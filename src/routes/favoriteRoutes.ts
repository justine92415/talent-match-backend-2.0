/**
 * 收藏功能路由
 * 
 * 提供用戶收藏課程的 API 端點，包括：
 * - POST /api/favorites - 新增收藏
 * - DELETE /api/favorites/:course_id - 移除收藏
 * - GET /api/favorites - 取得收藏清單
 * - GET /api/favorites/status/:course_id - 檢查收藏狀態
 * 
 * 所有端點都需要用戶認證
 */

import { Router } from 'express'
import { authenticateToken } from '@middleware/auth'
import { favoriteController } from '@controllers/FavoriteController'
import { createSchemasMiddleware, validateParams, validateQuery } from '@middleware/schemas/core'
import { 
  addFavoriteSchema,
  favoriteListQuerySchema,
  favoriteCourseIdParamSchema
} from '@middleware/schemas/system/favoriteSchemas'

const router = Router()

// 所有收藏功能都需要認證
router.use(authenticateToken)



router.post('/', createSchemasMiddleware({ body: addFavoriteSchema }), favoriteController.addToFavorites)

router.delete('/:course_id', validateParams(favoriteCourseIdParamSchema), favoriteController.removeFromFavorites)

router.get('/', validateQuery(favoriteListQuerySchema), favoriteController.getUserFavorites)

router.get('/status/:course_id', validateParams(favoriteCourseIdParamSchema), favoriteController.getFavoriteStatus)

export default router