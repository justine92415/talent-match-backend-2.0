import Joi from 'joi'
import { ValidationMessages } from '@constants/Message'

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

/**
 * 學習經歷建立驗證 Schema
 */
export const learningExperienceCreateSchema = Joi.object({
  is_in_school: Joi.boolean()
    .required()
    .messages({
      'boolean.base': '是否在學必須為布林值',
      'any.required': '是否在學為必填欄位'
    }),
  degree: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': ValidationMessages.DEGREE_EMPTY,
      'string.min': ValidationMessages.DEGREE_REQUIRED,
      'string.max': '學位長度不能超過50個字元',
      'any.required': ValidationMessages.DEGREE_REQUIRED
    }),
  school_name: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': ValidationMessages.INSTITUTION_EMPTY,
      'string.min': ValidationMessages.INSTITUTION_REQUIRED,
      'string.max': '學校名稱長度不能超過200個字元',
      'any.required': ValidationMessages.INSTITUTION_REQUIRED
    }),
  department: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': ValidationMessages.FIELD_OF_STUDY_EMPTY,
      'string.min': ValidationMessages.FIELD_OF_STUDY_REQUIRED,
      'string.max': '系所名稱長度不能超過200個字元',
      'any.required': ValidationMessages.FIELD_OF_STUDY_REQUIRED
    }),
  region: Joi.boolean()
    .required()
    .messages({
      'boolean.base': '地區必須為布林值',
      'any.required': '地區為必填欄位'
    }),
  start_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.base': ValidationMessages.START_YEAR_INVALID,
      'number.integer': ValidationMessages.START_YEAR_INVALID,
      'number.min': '開始年份不能早於1900年',
      'number.max': '開始年份不能超過當前年份',
      'any.required': ValidationMessages.START_YEAR_REQUIRED
    }),
  start_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      'number.base': '開始月份必須為數字',
      'number.integer': '開始月份必須為整數',
      'number.min': '開始月份必須在1-12之間',
      'number.max': '開始月份必須在1-12之間',
      'any.required': '開始月份為必填欄位'
    }),
  end_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 10)
    .optional()
    .allow(null)
    .messages({
      'number.base': ValidationMessages.END_YEAR_INVALID,
      'number.integer': ValidationMessages.END_YEAR_INVALID,
      'number.min': '結束年份不能早於1900年',
      'number.max': '結束年份不能超過未來10年'
    }),
  end_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .allow(null)
    .messages({
      'number.base': '結束月份必須為數字',
      'number.integer': '結束月份必須為整數',
      'number.min': '結束月份必須在1-12之間',
      'number.max': '結束月份必須在1-12之間'
    })
  // TODO: 檔案上傳系統完成後新增檔案驗證
  // certificate_file: Joi.object()
  //   .optional()
  //   .description('學歷證明檔案')
}).custom((value, helpers) => {
  // 自定義驗證：在學中不應該有結束日期
  if (value.is_in_school && (value.end_year !== null && value.end_year !== undefined)) {
    return helpers.error('custom.inSchoolEndDate', { 
      message: '在學中的學習經歷不應該提供結束日期' 
    })
  }

  // 自定義驗證：結束日期不能早於開始日期
  if (value.end_year && value.end_month && value.start_year && value.start_month) {
    const startDate = new Date(value.start_year, value.start_month - 1)
    const endDate = new Date(value.end_year, value.end_month - 1)
    
    if (endDate < startDate) {
      return helpers.error('custom.dateRange', { 
        message: ValidationMessages.LEARNING_END_YEAR_BEFORE_START_YEAR 
      })
    }
  }
  
  return value
})

/**
 * 學習經歷更新驗證 Schema
 */
export const learningExperienceUpdateSchema = Joi.object({
  is_in_school: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': '是否在學必須為布林值'
    }),
  degree: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': ValidationMessages.DEGREE_EMPTY,
      'string.min': ValidationMessages.DEGREE_REQUIRED,
      'string.max': '學位長度不能超過50個字元'
    }),
  school_name: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': ValidationMessages.INSTITUTION_EMPTY,
      'string.min': ValidationMessages.INSTITUTION_REQUIRED,
      'string.max': '學校名稱長度不能超過200個字元'
    }),
  department: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': ValidationMessages.FIELD_OF_STUDY_EMPTY,
      'string.min': ValidationMessages.FIELD_OF_STUDY_REQUIRED,
      'string.max': '系所名稱長度不能超過200個字元'
    }),
  region: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': '地區必須為布林值'
    }),
  start_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .optional()
    .messages({
      'number.base': ValidationMessages.START_YEAR_INVALID,
      'number.integer': ValidationMessages.START_YEAR_INVALID,
      'number.min': '開始年份不能早於1900年',
      'number.max': '開始年份不能超過當前年份'
    }),
  start_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .messages({
      'number.base': '開始月份必須為數字',
      'number.integer': '開始月份必須為整數',
      'number.min': '開始月份必須在1-12之間',
      'number.max': '開始月份必須在1-12之間'
    }),
  end_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 10)
    .optional()
    .allow(null)
    .messages({
      'number.base': ValidationMessages.END_YEAR_INVALID,
      'number.integer': ValidationMessages.END_YEAR_INVALID,
      'number.min': '結束年份不能早於1900年',
      'number.max': '結束年份不能超過未來10年'
    }),
  end_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .allow(null)
    .messages({
      'number.base': '結束月份必須為數字',
      'number.integer': '結束月份必須為整數',
      'number.min': '結束月份必須在1-12之間',
      'number.max': '結束月份必須在1-12之間'
    })
  // TODO: 檔案上傳系統完成後新增檔案驗證
  // certificate_file: Joi.object()
  //   .optional()
  //   .description('學歷證明檔案')
}).custom((value, helpers) => {
  // 自定義驗證：在學中不應該有結束日期 
  if (value.is_in_school && (value.end_year !== null && value.end_year !== undefined)) {
    return helpers.error('custom.inSchoolEndDate', { 
      message: '在學中的學習經歷不應該提供結束日期' 
    })
  }

  // 自定義驗證：結束日期不能早於開始日期
  if (value.end_year && value.end_month && value.start_year && value.start_month) {
    const startDate = new Date(value.start_year, value.start_month - 1)
    const endDate = new Date(value.end_year, value.end_month - 1)
    
    if (endDate < startDate) {
      return helpers.error('custom.dateRange', { 
        message: ValidationMessages.LEARNING_END_YEAR_BEFORE_START_YEAR 
      })
    }
  }
  
  return value
})