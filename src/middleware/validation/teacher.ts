import Joi from 'joi'

/**
 * 教師申請驗證 Schema
 */
export const teacherApplicationSchema = Joi.object({
  nationality: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '國籍不能為空',
      'string.min': '國籍至少需要1個字元',
      'string.max': '國籍長度不能超過50個字元',
      'any.required': '國籍為必填欄位'
    }),
  introduction: Joi.string()
    .min(100)
    .max(1000)
    .required()
    .messages({
      'string.empty': '自我介紹不能為空',
      'string.min': '自我介紹至少需要100個字元',
      'string.max': '自我介紹長度不能超過1000個字元',
      'any.required': '自我介紹為必填欄位'
    })
})

/**
 * 教師申請更新驗證 Schema
 */
export const teacherApplicationUpdateSchema = Joi.object({
  nationality: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': '國籍不能為空',
      'string.min': '國籍至少需要1個字元',
      'string.max': '國籍長度不能超過50個字元'
    }),
  introduction: Joi.string()
    .min(100)
    .max(1000)
    .optional()
    .messages({
      'string.empty': '自我介紹不能為空',
      'string.min': '自我介紹至少需要100個字元',
      'string.max': '自我介紹長度不能超過1000個字元'
    })
})

/**
 * 教師資料更新驗證 Schema
 */
export const teacherProfileUpdateSchema = Joi.object({
  nationality: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': '國籍不能為空',
      'string.min': '國籍至少需要1個字元',
      'string.max': '國籍長度不能超過50個字元'
    }),
  introduction: Joi.string()
    .min(100)
    .max(1000)
    .optional()
    .messages({
      'string.empty': '自我介紹不能為空',
      'string.min': '自我介紹至少需要100個字元',
      'string.max': '自我介紹長度不能超過1000個字元'
    })
})