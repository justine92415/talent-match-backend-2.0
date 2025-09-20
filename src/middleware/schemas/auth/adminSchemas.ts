/**
 * 管理員驗證 Schema
 * 遵循統一驗證中間件模式，使用 validateRequest 進行驗證
 * 錯誤訊息使用 MESSAGES 常數確保一致性
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'
import { AdminRole } from '@entities/enums'

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
 * 管理員建立請求驗證 Schema
 */
export const adminCreateSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.ADMIN_USERNAME_EMPTY,
      'any.required': MESSAGES.VALIDATION.ADMIN_USERNAME_REQUIRED,
      'string.min': '管理員帳號至少需要3個字元',
      'string.max': '管理員帳號最多50個字元',
      'string.pattern.base': '管理員帳號只能包含英文字母、數字和底線'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.ADMIN_PASSWORD_EMPTY,
      'any.required': MESSAGES.VALIDATION.ADMIN_PASSWORD_REQUIRED,
      'string.min': '管理員密碼至少需要8個字元',
      'string.max': '管理員密碼最多128個字元'
    }),

  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.ADMIN_NAME_EMPTY,
      'any.required': MESSAGES.VALIDATION.ADMIN_NAME_REQUIRED,
      'string.min': '管理員姓名不能為空',
      'string.max': '管理員姓名最多100個字元'
    }),

  email: Joi.string()
    .email()
    .max(255)
    .required()
    .messages({
      'string.empty': MESSAGES.VALIDATION.EMAIL_EMPTY,
      'any.required': MESSAGES.VALIDATION.EMAIL_REQUIRED,
      'string.email': MESSAGES.VALIDATION.EMAIL_INVALID,
      'string.max': 'Email 最多255個字元'
    }),

  role: Joi.string()
    .valid(...Object.values(AdminRole))
    .optional()
    .default(AdminRole.ADMIN)
    .messages({
      'any.only': `管理員角色必須是 ${Object.values(AdminRole).join(' 或 ')} 其中之一`
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