import Joi from 'joi'
import { CERTIFICATE_VALIDATION } from '@constants/validation'

/**
 * 證書建立驗證 Schema
 */
export const certificateCreateSchema = Joi.object({
  verifying_institution: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.VERIFYING_INSTITUTION.MAX_LENGTH)
    .required()
    .messages({
      'string.empty': '發證機構名稱不能為空',
      'string.min': '發證機構名稱至少需要 1 個字元',
      'string.max': `發證機構名稱不能超過 ${CERTIFICATE_VALIDATION.VERIFYING_INSTITUTION.MAX_LENGTH} 個字元`,
      'any.required': '發證機構名稱是必填項目'
    }),

  license_name: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.LICENSE_NAME.MAX_LENGTH)
    .required()
    .messages({
      'string.empty': '證書名稱不能為空',
      'string.min': '證書名稱至少需要 1 個字元',
      'string.max': `證書名稱不能超過 ${CERTIFICATE_VALIDATION.LICENSE_NAME.MAX_LENGTH} 個字元`,
      'any.required': '證書名稱是必填項目'
    }),

  holder_name: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.HOLDER_NAME.MAX_LENGTH)
    .required()
    .messages({
      'string.empty': '持有人姓名不能為空',
      'string.min': '持有人姓名至少需要 1 個字元',
      'string.max': `持有人姓名不能超過 ${CERTIFICATE_VALIDATION.HOLDER_NAME.MAX_LENGTH} 個字元`,
      'any.required': '持有人姓名是必填項目'
    }),

  license_number: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9\-_]+$/)
    .min(1)
    .max(CERTIFICATE_VALIDATION.LICENSE_NUMBER.MAX_LENGTH)
    .required()
    .messages({
      'string.empty': '證書號碼不能為空',
      'string.pattern.base': '證書號碼只能包含英數字、連字號和底線',
      'string.min': '證書號碼至少需要 1 個字元',
      'string.max': `證書號碼不能超過 ${CERTIFICATE_VALIDATION.LICENSE_NUMBER.MAX_LENGTH} 個字元`,
      'any.required': '證書號碼是必填項目'
    }),

  category_id: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.CATEGORY_ID.MAX_LENGTH)
    .required()
    .messages({
      'string.empty': '證書類別不能為空',
      'string.min': '證書類別至少需要 1 個字元',
      'string.max': `證書類別不能超過 ${CERTIFICATE_VALIDATION.CATEGORY_ID.MAX_LENGTH} 個字元`,
      'any.required': '證書類別是必填項目'
    }),

  subject: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.SUBJECT.MAX_LENGTH)
    .required()
    .messages({
      'string.empty': '證書主題不能為空',
      'string.min': '證書主題至少需要 1 個字元',
      'string.max': `證書主題不能超過 ${CERTIFICATE_VALIDATION.SUBJECT.MAX_LENGTH} 個字元`,
      'any.required': '證書主題是必填項目'
    }),

  file_path: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9\/\-_.]+$/)
    .max(CERTIFICATE_VALIDATION.FILE_PATH.MAX_LENGTH)
    .optional()
    .messages({
      'string.pattern.base': '檔案路徑格式不正確',
      'string.max': `檔案路徑不能超過 ${CERTIFICATE_VALIDATION.FILE_PATH.MAX_LENGTH} 個字元`
    })
})

/**
 * 證書更新驗證 Schema
 */
export const certificateUpdateSchema = Joi.object({
  verifying_institution: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.VERIFYING_INSTITUTION.MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': '發證機構名稱不能為空',
      'string.min': '發證機構名稱至少需要 1 個字元',
      'string.max': `發證機構名稱不能超過 ${CERTIFICATE_VALIDATION.VERIFYING_INSTITUTION.MAX_LENGTH} 個字元`
    }),

  license_name: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.LICENSE_NAME.MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': '證書名稱不能為空',
      'string.min': '證書名稱至少需要 1 個字元',
      'string.max': `證書名稱不能超過 ${CERTIFICATE_VALIDATION.LICENSE_NAME.MAX_LENGTH} 個字元`
    }),

  holder_name: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.HOLDER_NAME.MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': '持有人姓名不能為空',
      'string.min': '持有人姓名至少需要 1 個字元',
      'string.max': `持有人姓名不能超過 ${CERTIFICATE_VALIDATION.HOLDER_NAME.MAX_LENGTH} 個字元`
    }),

  license_number: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9\-_]+$/)
    .min(1)
    .max(CERTIFICATE_VALIDATION.LICENSE_NUMBER.MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': '證書號碼不能為空',
      'string.pattern.base': '證書號碼只能包含英數字、連字號和底線',
      'string.min': '證書號碼至少需要 1 個字元',
      'string.max': `證書號碼不能超過 ${CERTIFICATE_VALIDATION.LICENSE_NUMBER.MAX_LENGTH} 個字元`
    }),

  category_id: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.CATEGORY_ID.MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': '證書類別不能為空',
      'string.min': '證書類別至少需要 1 個字元',
      'string.max': `證書類別不能超過 ${CERTIFICATE_VALIDATION.CATEGORY_ID.MAX_LENGTH} 個字元`
    }),

  subject: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.SUBJECT.MAX_LENGTH)
    .optional()
    .messages({
      'string.empty': '證書主題不能為空',
      'string.min': '證書主題至少需要 1 個字元',
      'string.max': `證書主題不能超過 ${CERTIFICATE_VALIDATION.SUBJECT.MAX_LENGTH} 個字元`
    }),

  file_path: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9\/\-_.]+$/)
    .max(CERTIFICATE_VALIDATION.FILE_PATH.MAX_LENGTH)
    .optional()
    .messages({
      'string.pattern.base': '檔案路徑格式不正確',
      'string.max': `檔案路徑不能超過 ${CERTIFICATE_VALIDATION.FILE_PATH.MAX_LENGTH} 個字元`
    })
}).min(1).messages({
  'object.min': '至少需要提供一個要更新的欄位'
})