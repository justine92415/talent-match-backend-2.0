/**
 * 收藏功能控制器
 * 
 * 處理用戶收藏課程相關的 HTTP 請求，包括：
 * - POST /api/favorites - 新增收藏
 * - DELETE /api/favorites/:course_id - 移除收藏
 * - GET /api/favorites - 取得收藏清單
 */

import { Request, Response, NextFunction } from 'express'
import { FavoriteService } from '@services/favoriteService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { SUCCESS } from '@constants/Message'

const favoriteService = new FavoriteService()

export class FavoriteController {
  /**
   * 新增課程到收藏清單
   * POST /api/favorites
   * 
   * Request Body:
   * - course_id: number - 課程ID
   */
  addToFavorites = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { course_id } = req.body
    
    const favorite = await favoriteService.addToFavorites(userId, course_id)

    res.status(201).json(handleCreated({ favorite }, SUCCESS.FAVORITE_ADDED))
  })

  /**
   * 從收藏清單移除課程
   * DELETE /api/favorites/:course_id
   * 
   * Path Parameters:
   * - course_id: number - 課程ID
   */
  removeFromFavorites = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.course_id)
    
    await favoriteService.removeFromFavorites(userId, courseId)

    res.json(handleSuccess(null, SUCCESS.FAVORITE_REMOVED))
  })

  /**
   * 取得用戶收藏清單
   * GET /api/favorites
   * 
   * Query Parameters:
   * - page?: number - 頁碼（預設1）
   * - per_page?: number - 每頁筆數（預設12）
   */
  getUserFavorites = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const query = req.query as any
    
    const result = await favoriteService.getUserFavorites(userId, query)

    res.json(handleSuccess(result, SUCCESS.FAVORITE_LIST_SUCCESS))
  })

  /**
   * 檢查課程收藏狀態
   * GET /api/favorites/status/:course_id
   * 
   * Path Parameters:
   * - course_id: number - 課程ID
   */
  getFavoriteStatus = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.course_id)
    
    const isFavorited = await favoriteService.isFavorited(userId, courseId)

    res.json(handleSuccess({ is_favorited: isFavorited }, SUCCESS.FAVORITE_STATUS_CHECK_SUCCESS))
  })
}

export const favoriteController = new FavoriteController()