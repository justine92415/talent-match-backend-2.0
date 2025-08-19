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
import {
  validateAddFavorite,
  validateFavoriteListQuery,
  validateFavoriteCourseId
} from '@middleware/validation/favoriteValidation'

const router = Router()

// 所有收藏功能都需要認證
router.use(authenticateToken)

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: 收藏功能 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AddFavoriteRequest:
 *       type: object
 *       required:
 *         - course_id
 *       properties:
 *         course_id:
 *           type: integer
 *           minimum: 1
 *           description: 要收藏的課程ID
 *           example: 1
 * 
 *     FavoriteInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 收藏記錄ID
 *           example: 1
 *         uuid:
 *           type: string
 *           description: 收藏記錄唯一識別碼
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         course_id:
 *           type: integer
 *           description: 課程ID
 *           example: 1
 *         user_id:
 *           type: integer
 *           description: 用戶ID
 *           example: 1
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 建立時間
 * 
 *     FavoriteCourseItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         uuid:
 *           type: string
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         name:
 *           type: string
 *           example: "Python 基礎程式設計"
 *         description:
 *           type: string
 *           example: "學習Python基礎語法"
 *         image:
 *           type: string
 *           example: "/uploads/courses/image.jpg"
 *         rate:
 *           type: number
 *           example: 4.5
 *         review_count:
 *           type: integer
 *           example: 25
 *         student_count:
 *           type: integer
 *           example: 120
 * 
 *     FavoriteItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 收藏記錄ID
 *           example: 1
 *         course:
 *           $ref: '#/components/schemas/FavoriteCourseItem'
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 收藏時間
 * 
 *     FavoriteListResponse:
 *       type: object
 *       properties:
 *         favorites:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/FavoriteItem'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationInfo'
 */

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: 新增課程到收藏清單
 *     description: 將指定課程加入用戶的收藏清單
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFavoriteRequest'
 *     responses:
 *       201:
 *         description: 成功加入收藏
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
 *                   example: "課程已加入收藏"
 *                 data:
 *                   type: object
 *                   properties:
 *                     favorite:
 *                       $ref: '#/components/schemas/FavoriteInfo'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       409:
 *         description: 課程已在收藏清單中
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       404:
 *         description: 課程不存在或未發布
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 */
router.post('/', validateAddFavorite, favoriteController.addToFavorites)

/**
 * @swagger
 * /api/favorites/{course_id}:
 *   delete:
 *     summary: 從收藏清單移除課程
 *     description: 將指定課程從用戶的收藏清單中移除
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 要移除的課程ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功移除收藏
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
 *                   example: "已移除課程收藏"
 *                 data:
 *                   type: "null"
 *       404:
 *         description: 收藏記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BusinessErrorResponse'
 *       400:
 *         description: 課程ID格式錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 */
router.delete('/:course_id', validateFavoriteCourseId, favoriteController.removeFromFavorites)

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: 取得用戶收藏清單
 *     description: 取得目前用戶的收藏課程清單，支援分頁
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *         example: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 12
 *         description: 每頁筆數
 *         example: 12
 *     responses:
 *       200:
 *         description: 成功取得收藏清單
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
 *                   example: "取得收藏清單成功"
 *                 data:
 *                   $ref: '#/components/schemas/FavoriteListResponse'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 */
router.get('/', validateFavoriteListQuery, favoriteController.getUserFavorites)

/**
 * @swagger
 * /api/favorites/status/{course_id}:
 *   get:
 *     summary: 檢查課程收藏狀態
 *     description: 檢查指定課程是否已被目前用戶收藏
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 要檢查的課程ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得收藏狀態
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
 *                   example: "收藏狀態查詢成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     is_favorited:
 *                       type: boolean
 *                       description: 是否已收藏
 *                       example: true
 *       400:
 *         description: 課程ID格式錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未認證
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthErrorResponse'
 */
router.get('/status/:course_id', validateFavoriteCourseId, favoriteController.getFavoriteStatus)

export default router