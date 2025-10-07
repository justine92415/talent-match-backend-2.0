/**
 * 推薦課程查詢參數驗證 Schema
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

/**
 * 推薦課程查詢參數驗證 Schema
 */
export const recommendedCoursesQuerySchema = Joi.object({
  city: Joi.string().optional().messages({
    'string.base': '城市名稱必須是字串'
  }),

  limit: Joi.number().integer().min(1).max(50).default(6).messages({
    'number.base': '返回數量必須是數字',
    'number.integer': '返回數量必須是整數',
    'number.min': '返回數量最少為 1',
    'number.max': '返回數量最多為 50'
  })
}).options({ allowUnknown: false, abortEarly: false })
