/**
 * 推薦課程查詢參數驗證 Schema
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

/**
 * 推薦課程查詢參數驗證 Schema
 */
export const recommendedCoursesQuerySchema = Joi.object({
  cityId: Joi.number().integer().positive().optional().messages({
    'number.base': MESSAGES.VALIDATION.CITY_INVALID,
    'number.integer': MESSAGES.VALIDATION.CITY_INVALID,
    'number.positive': MESSAGES.VALIDATION.CITY_INVALID
  }),

  limit: Joi.number().integer().min(1).max(50).default(6).messages({
    'number.base': '返回數量必須是數字',
    'number.integer': '返回數量必須是整數',
    'number.min': '返回數量最少為 1',
    'number.max': '返回數量最多為 50'
  })
}).options({ allowUnknown: false, abortEarly: false })
