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
// === 證照批次處理相關 Schema ===

/**
 * 證照項目驗證 Schema（支援 UPSERT 操作）
 * 用於批次新增或更新證照
 */
export const certificateItemSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "證照 ID 必須為數字",
      "number.integer": "證照 ID 必須為整數",
      "number.positive": "證照 ID 必須為正數"
    }),
  verifying_institution: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.VERIFYING_INSTITUTION.MAX_LENGTH)
    .required()
    .messages({
      "string.empty": "發證機構名稱不能為空",
      "string.min": "發證機構名稱至少需要 1 個字元",
      "string.max": `發證機構名稱不能超過 ${CERTIFICATE_VALIDATION.VERIFYING_INSTITUTION.MAX_LENGTH} 個字元`,
      "any.required": "發證機構名稱是必填項目"
    }),
  license_name: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.LICENSE_NAME.MAX_LENGTH)
    .required()
    .messages({
      "string.empty": "證書名稱不能為空",
      "string.min": "證書名稱至少需要 1 個字元",
      "string.max": `證書名稱不能超過 ${CERTIFICATE_VALIDATION.LICENSE_NAME.MAX_LENGTH} 個字元`,
      "any.required": "證書名稱是必填項目"
    }),
  holder_name: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.HOLDER_NAME.MAX_LENGTH)
    .required()
    .messages({
      "string.empty": "持有人姓名不能為空",
      "string.min": "持有人姓名至少需要 1 個字元",
      "string.max": `持有人姓名不能超過 ${CERTIFICATE_VALIDATION.HOLDER_NAME.MAX_LENGTH} 個字元`,
      "any.required": "持有人姓名是必填項目"
    }),
  license_number: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9\-_]+$/)
    .min(1)
    .max(CERTIFICATE_VALIDATION.LICENSE_NUMBER.MAX_LENGTH)
    .required()
    .messages({
      "string.empty": "證書號碼不能為空",
      "string.min": "證書號碼至少需要 1 個字元",
      "string.max": `證書號碼不能超過 ${CERTIFICATE_VALIDATION.LICENSE_NUMBER.MAX_LENGTH} 個字元`,
      "string.pattern.base": "證書號碼只能包含字母、數字、橫線和底線",
      "any.required": "證書號碼是必填項目"
    }),
  issue_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      "number.base": "發證年份必須為數字",
      "number.integer": "發證年份必須為整數",
      "number.min": "發證年份不能早於 1900 年",
      "number.max": "發證年份不能超過當前年份",
      "any.required": "發證年份是必填項目"
    }),
  issue_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      "number.base": "發證月份必須為數字",
      "number.integer": "發證月份必須為整數",
      "number.min": "發證月份必須在 1-12 之間",
      "number.max": "發證月份必須在 1-12 之間",
      "any.required": "發證月份是必填項目"
    }),
  expiry_year: Joi.number()
    .integer()
    .min(new Date().getFullYear())
    .max(new Date().getFullYear() + 50)
    .optional()
    .allow(null)
    .messages({
      "number.base": "到期年份必須為數字",
      "number.integer": "到期年份必須為整數",
      "number.min": "到期年份不能早於當前年份",
      "number.max": "到期年份不能超過未來 50 年"
    }),
  expiry_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .allow(null)
    .messages({
      "number.base": "到期月份必須為數字",
      "number.integer": "到期月份必須為整數",
      "number.min": "到期月份必須在 1-12 之間",
      "number.max": "到期月份必須在 1-12 之間"
    }),
  file_path: Joi.string()
    .trim()
    .min(1)
    .max(CERTIFICATE_VALIDATION.FILE_PATH.MAX_LENGTH)
    .optional()
    .allow(null, "")
    .messages({
      "string.empty": "證書文件路徑不能為空字串",
      "string.min": "證書文件路徑至少需要 1 個字元",
      "string.max": `證書文件路徑不能超過 ${CERTIFICATE_VALIDATION.FILE_PATH.MAX_LENGTH} 個字元`
    })
}).custom((value, helpers) => {
  // 自定義驗證：發證日期不能晚於當前日期
  if (value.issue_year && value.issue_month) {
    const issueDate = new Date(value.issue_year, value.issue_month - 1)
    const currentDate = new Date()
    currentDate.setDate(1) // 設定為月初以便比較
    
    if (issueDate > currentDate) {
      return helpers.error("custom.issueDate", { 
        message: "發證日期不能晚於當前日期" 
      })
    }
  }

  // 自定義驗證：到期日期不能早於發證日期
  if (value.expiry_year && value.expiry_month && value.issue_year && value.issue_month) {
    const issueDate = new Date(value.issue_year, value.issue_month - 1)
    const expiryDate = new Date(value.expiry_year, value.expiry_month - 1)
    
    if (expiryDate < issueDate) {
      return helpers.error("custom.expiryDate", { 
        message: "證書到期日期不能早於發證日期" 
      })
    }
  }
  
  return value
})

/**
 * 證照批次 UPSERT 驗證 Schema
 * 支援同時新增和更新操作
 */
export const certificateUpsertSchema = Joi.object({
  certificates: Joi.array()
    .items(certificateItemSchema)
    .min(1)
    .max(20)
    .required()
    .messages({
      "array.base": "證照必須為陣列",
      "array.min": "至少需要提供 1 張證照",
      "array.max": "一次最多只能處理 20 張證照",
      "any.required": "證照為必填欄位"
    })
})

/**
 * 證照批次建立驗證 Schema
 * 用於 POST 請求，統一使用陣列格式
 */
export const certificateCreateBatchSchema = Joi.object({
  certificates: Joi.array()
    .items(certificateCreateSchema)
    .min(1)
    .max(20)
    .required()
    .messages({
      "array.base": "證照必須為陣列",
      "array.min": "至少需要提供 1 張證照",
      "array.max": "一次最多只能建立 20 張證照",
      "any.required": "證照為必填欄位"
    })
})

