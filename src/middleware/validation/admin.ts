/**
 * 管理員驗證 Schema
 * 遵循統一驗證中間件模式，使用 validateRequest 進行驗證
 * 錯誤訊息使用 MESSAGES 常數確保一致性
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

/**
 * 管理員登入請求驗證 Schema
 */
export const adminLoginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': MESSAGES.VALIDATION.ADMIN_USERNAME_EMPTY,
    'any.required': MESSAGES.VALIDATION.ADMIN_USERNAME_REQUIRED
  }),

  password: Joi.string().required().messages({
    'string.empty': MESSAGES.VALIDATION.ADMIN_PASSWORD_EMPTY,
    'any.required': MESSAGES.VALIDATION.ADMIN_PASSWORD_REQUIRED
  })
})

/**
 * 申請拒絕請求驗證 Schema
 * 用於教師申請拒絕和課程申請拒絕
 */
export const rejectionRequestSchema = Joi.object({
  rejectionReason: Joi.string().required().messages({
    'string.empty': MESSAGES.VALIDATION.REJECTION_REASON_EMPTY,
    'any.required': MESSAGES.VALIDATION.REJECTION_REASON_REQUIRED
  })
})