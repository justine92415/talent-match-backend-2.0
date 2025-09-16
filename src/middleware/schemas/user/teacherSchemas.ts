import Joi from 'joi'
import { ValidationMessages } from '@constants/Message'

/**
 * 教師申請驗證 Schema
 */
export const teacherApplicationSchema = Joi.object({
  city: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '縣市不能為空',
      'string.min': '縣市至少需要1個字元',
      'string.max': '縣市長度不能超過50個字元',
      'any.required': '縣市為必填欄位'
    }),
  district: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '區域不能為空',
      'string.min': '區域至少需要1個字元',
      'string.max': '區域長度不能超過50個字元',
      'any.required': '區域為必填欄位'
    }),
  address: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': '地址不能為空',
      'string.min': '地址至少需要1個字元',
      'string.max': '地址長度不能超過200個字元',
      'any.required': '地址為必填欄位'
    }),
  main_category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '教授科目必須為數字',
      'number.integer': '教授科目必須為整數',
      'number.positive': '教授科目必須為正數',
      'any.required': '教授科目為必填欄位'
    }),
  sub_category_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
        .messages({
          'number.base': '專長必須為數字',
          'number.integer': '專長必須為整數',
          'number.positive': '專長必須為正數'
        })
    )
    .min(1)
    .max(3)
    .unique()
    .required()
    .messages({
      'array.base': '專長必須為陣列格式',
      'array.min': '至少需要選擇1個專長',
      'array.max': '最多只能選擇3個專長',
      'array.unique': '專長不能重複選擇',
      'any.required': '專長為必填欄位'
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
  city: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': '縣市不能為空',
      'string.min': '縣市至少需要1個字元',
      'string.max': '縣市長度不能超過50個字元'
    }),
  district: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': '區域不能為空',
      'string.min': '區域至少需要1個字元',
      'string.max': '區域長度不能超過50個字元'
    }),
  address: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': '地址不能為空',
      'string.min': '地址至少需要1個字元',
      'string.max': '地址長度不能超過200個字元'
    }),
  main_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': '教授科目必須為數字',
      'number.integer': '教授科目必須為整數',
      'number.positive': '教授科目必須為正數'
    }),
  sub_category_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
        .messages({
          'number.base': '專長必須為數字',
          'number.integer': '專長必須為整數',
          'number.positive': '專長必須為正數'
        })
    )
    .min(1)
    .max(3)
    .unique()
    .optional()
    .messages({
      'array.base': '專長必須為陣列格式',
      'array.min': '至少需要選擇1個專長',
      'array.max': '最多只能選擇3個專長',
      'array.unique': '專長不能重複選擇'
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
  city: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': '縣市不能為空',
      'string.min': '縣市至少需要1個字元',
      'string.max': '縣市長度不能超過50個字元'
    }),
  district: Joi.string()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': '區域不能為空',
      'string.min': '區域至少需要1個字元',
      'string.max': '區域長度不能超過50個字元'
    }),
  address: Joi.string()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': '地址不能為空',
      'string.min': '地址至少需要1個字元',
      'string.max': '地址長度不能超過200個字元'
    }),
  main_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': '教授科目必須為數字',
      'number.integer': '教授科目必須為整數',
      'number.positive': '教授科目必須為正數'
    }),
  sub_category_ids: Joi.array()
    .items(
      Joi.number()
        .integer()
        .positive()
        .messages({
          'number.base': '專長必須為數字',
          'number.integer': '專長必須為整數',
          'number.positive': '專長必須為正數'
        })
    )
    .min(1)
    .max(3)
    .unique()
    .optional()
    .messages({
      'array.base': '專長必須為陣列格式',
      'array.min': '至少需要選擇1個專長',
      'array.max': '最多只能選擇3個專長',
      'array.unique': '專長不能重複選擇'
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
/**
 * 單筆工作經驗驗證 Schema
 */
const workExperienceItemSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'ID必須為數字',
      'number.integer': 'ID必須為整數',
      'number.positive': 'ID必須為正數'
    }),
  company_name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': '公司名稱不能為空',
      'string.min': '公司名稱至少需要1個字元',
      'string.max': '公司名稱長度不能超過100個字元',
      'any.required': '公司名稱為必填欄位'
    }),
  city: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '工作縣市不能為空',
      'string.min': '工作縣市至少需要1個字元',
      'string.max': '工作縣市長度不能超過50個字元',
      'any.required': '工作縣市為必填欄位'
    }),
  district: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '工作地區不能為空',
      'string.min': '工作地區至少需要1個字元',
      'string.max': '工作地區長度不能超過50個字元',
      'any.required': '工作地區為必填欄位'
    }),
  job_category: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '職業類別不能為空',
      'string.min': '職業類別至少需要1個字元',
      'string.max': '職業類別長度不能超過50個字元',
      'any.required': '職業類別為必填欄位'
    }),
  job_title: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.empty': '職稱不能為空',
      'string.min': '職稱至少需要1個字元',
      'string.max': '職稱長度不能超過100個字元',
      'any.required': '職稱為必填欄位'
    }),
  is_working: Joi.boolean()
    .required()
    .messages({
      'boolean.base': '是否在職必須為布林值',
      'any.required': '是否在職為必填欄位'
    }),
  start_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      'number.base': '開始年份必須為數字',
      'number.integer': '開始年份必須為整數',
      'number.min': '開始年份不能早於1900年',
      'number.max': '開始年份不能超過今年',
      'any.required': '開始年份為必填欄位'
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
      'number.base': '結束年份必須為數字',
      'number.integer': '結束年份必須為整數',
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
}).custom((value: any, helpers: any) => {
  // 自定義驗證：在職中不應該有結束日期
  if (value.is_working && (value.end_year !== null && value.end_year !== undefined)) {
    return helpers.error('custom.workingEndDate', { 
      message: '在職中的工作經驗不應該提供結束日期' 
    })
  }

  // 自定義驗證：結束日期不能早於開始日期
  if (value.end_year && value.end_month && value.start_year && value.start_month) {
    const startDate = new Date(value.start_year, value.start_month - 1)
    const endDate = new Date(value.end_year, value.end_month - 1)
    
    if (endDate < startDate) {
      return helpers.error('custom.workDateRange', { 
        message: '結束日期不能早於開始日期' 
      })
    }
  }
  
  return value
})

/**
 * 工作經驗批次新增驗證 Schema
 */
export const workExperienceCreateBatchSchema = Joi.object({
  work_experiences: Joi.array()
    .items(workExperienceItemSchema)
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.base': '工作經驗必須為陣列格式',
      'array.min': '至少需要提供一筆工作經驗',
      'array.max': '一次最多只能建立20筆工作經驗',
      'any.required': '工作經驗為必填欄位'
    })
})

/**
 * 工作經驗批次 UPSERT 驗證 Schema
 */
export const workExperienceUpsertSchema = Joi.object({
  work_experiences: Joi.array()
    .items(workExperienceItemSchema)
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.base': '工作經驗必須為陣列格式',
      'array.min': '至少需要提供一筆工作經驗',
      'array.max': '一次最多只能處理20筆工作經驗',
      'any.required': '工作經驗為必填欄位'
    })
})

/**
 * 單筆工作經驗更新驗證 Schema
 */
export const workExperienceUpdateSchema = workExperienceItemSchema.fork(['id'], (schema: any) => schema.forbidden())

// === 學習經歷批次處理相關 Schema ===

/**
 * 學習經歷項目驗證 Schema（支援 UPSERT 操作）
 * 用於批次新增或更新學習經歷
 */
export const learningExperienceItemSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      "number.base": "學習經歷 ID 必須為數字",
      "number.integer": "學習經歷 ID 必須為整數",
      "number.positive": "學習經歷 ID 必須為正數"
    }),
  is_in_school: Joi.boolean()
    .required()
    .messages({
      "boolean.base": "是否在學必須為布林值",
      "any.required": "是否在學為必填欄位"
    }),
  degree: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      "string.empty": ValidationMessages.DEGREE_EMPTY,
      "string.min": ValidationMessages.DEGREE_REQUIRED,
      "string.max": "學位長度不能超過50個字元",
      "any.required": ValidationMessages.DEGREE_REQUIRED
    }),
  school_name: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      "string.empty": ValidationMessages.INSTITUTION_EMPTY,
      "string.min": ValidationMessages.INSTITUTION_REQUIRED,
      "string.max": "學校名稱長度不能超過200個字元",
      "any.required": ValidationMessages.INSTITUTION_REQUIRED
    }),
  department: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      "string.empty": ValidationMessages.FIELD_OF_STUDY_EMPTY,
      "string.min": ValidationMessages.FIELD_OF_STUDY_REQUIRED,
      "string.max": "系所名稱長度不能超過200個字元",
      "any.required": ValidationMessages.FIELD_OF_STUDY_REQUIRED
    }),
  start_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear())
    .required()
    .messages({
      "number.base": ValidationMessages.START_YEAR_INVALID,
      "number.integer": ValidationMessages.START_YEAR_INVALID,
      "number.min": "開始年份不能早於1900年",
      "number.max": "開始年份不能超過當前年份",
      "any.required": ValidationMessages.START_YEAR_REQUIRED
    }),
  start_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({
      "number.base": "開始月份必須為數字",
      "number.integer": "開始月份必須為整數",
      "number.min": "開始月份必須在1-12之間",
      "number.max": "開始月份必須在1-12之間",
      "any.required": "開始月份為必填欄位"
    }),
  end_year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 10)
    .optional()
    .allow(null)
    .messages({
      "number.base": ValidationMessages.END_YEAR_INVALID,
      "number.integer": ValidationMessages.END_YEAR_INVALID,
      "number.min": "結束年份不能早於1900年",
      "number.max": "結束年份不能超過未來10年"
    }),
  end_month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .allow(null)
    .messages({
      "number.base": "結束月份必須為數字",
      "number.integer": "結束月份必須為整數",
      "number.min": "結束月份必須在1-12之間",
      "number.max": "結束月份必須在1-12之間"
    })
}).custom((value, helpers) => {
  // 自定義驗證：在學中不應該有結束日期
  if (value.is_in_school && (value.end_year !== null && value.end_year !== undefined)) {
    return helpers.error("custom.inSchoolEndDate", { 
      message: "在學中的學習經歷不應該提供結束日期" 
    })
  }

  // 自定義驗證：結束日期不能早於開始日期
  if (value.end_year && value.end_month && value.start_year && value.start_month) {
    const startDate = new Date(value.start_year, value.start_month - 1)
    const endDate = new Date(value.end_year, value.end_month - 1)
    
    if (endDate < startDate) {
      return helpers.error("custom.dateRange", { 
        message: ValidationMessages.LEARNING_END_YEAR_BEFORE_START_YEAR 
      })
    }
  }
  
  return value
})

/**
 * 學習經歷批次 UPSERT 驗證 Schema
 * 支援同時新增和更新操作
 */
export const learningExperienceUpsertSchema = Joi.object({
  learning_experiences: Joi.array()
    .items(learningExperienceItemSchema)
    .min(1)
    .max(20)
    .required()
    .messages({
      "array.base": "學習經歷必須為陣列",
      "array.min": "至少需要提供 1 筆學習經歷",
      "array.max": "一次最多只能處理 20 筆學習經歷",
      "any.required": "學習經歷為必填欄位"
    })
})

/**
 * 學習經歷批次建立驗證 Schema
 * 用於 POST 請求，統一使用陣列格式
 */
export const learningExperienceCreateBatchSchema = Joi.object({
  learning_experiences: Joi.array()
    .items(learningExperienceCreateSchema)
    .min(1)
    .max(20)
    .required()
    .messages({
      "array.base": "學習經歷必須為陣列",
      "array.min": "至少需要提供 1 筆學習經歷",
      "array.max": "一次最多只能建立 20 筆學習經歷",
      "any.required": "學習經歷為必填欄位"
    })
})

