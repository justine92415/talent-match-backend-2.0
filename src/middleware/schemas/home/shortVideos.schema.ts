/**
 * 首頁短影音查詢參數驗證 Schema
 *
 * 用於驗證 GET /api/home/short-videos 的查詢參數
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

/**
 * 首頁短影音查詢參數驗證 Schema
 *
 * 查詢參數：
 * - mainCategoryId (optional): 主分類 ID 篩選
 * - limit (optional, default: 5): 返回數量，範圍 1-50
 */
export const shortVideosQuerySchema = Joi.object({
  mainCategoryId: Joi.number().integer().positive().optional().messages({
    'number.base': MESSAGES.VALIDATION.MAIN_CATEGORY_INVALID,
    'number.integer': MESSAGES.VALIDATION.MAIN_CATEGORY_INVALID,
    'number.positive': MESSAGES.VALIDATION.MAIN_CATEGORY_INVALID
  }),

  limit: Joi.number().integer().min(1).max(50).default(5).optional().messages({
    'number.base': '影片數量必須為數字',
    'number.integer': '影片數量必須為整數',
    'number.min': '影片數量至少為 1',
    'number.max': '影片數量最多為 50'
  })
}).options({ allowUnknown: false, abortEarly: false })
