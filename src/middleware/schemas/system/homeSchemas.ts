/**
 * 首頁相關驗證 Schema
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

/**
 * 首頁評論摘要查詢參數驗證 Schema
 */
export const reviewsSummaryQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(6).messages({
    'number.base': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.integer': MESSAGES.VALIDATION.COMMON.LIMIT_INVALID,
    'number.min': '精選評論數量至少為 1',
    'number.max': '精選評論數量不能超過 50'
  })
})
