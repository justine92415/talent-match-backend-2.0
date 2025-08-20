/**
 * 預約管理驗證中間件
 * 用於驗證預約管理 API 的請求參數
 */

import Joi from 'joi'

// 建立預約驗證 Schema
const createReservationSchema = Joi.object({
  course_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '課程ID必須為數字',
      'number.integer': '課程ID必須為整數',
      'number.positive': '課程ID必須為正數',
      'any.required': '課程ID為必填欄位'
    }),

  teacher_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '教師ID必須為數字',
      'number.integer': '教師ID必須為整數',
      'number.positive': '教師ID必須為正數',
      'any.required': '教師ID為必填欄位'
    }),

  reserve_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .custom((value, helpers) => {
      const date = new Date(value)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // 檢查日期是否有效
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      
      // 檢查不能為過去日期
      if (date < today) {
        return helpers.error('date.past')
      }
      
      // 檢查必須至少提前24小時預約
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      
      if (date < tomorrow) {
        return helpers.error('date.shortNotice')
      }
      
      return value
    })
    .messages({
      'string.pattern.base': '預約日期格式必須為 YYYY-MM-DD',
      'any.required': '預約日期為必填欄位',
      'date.invalid': '預約日期格式無效',
      'date.past': '不能預約過去的日期',
      'date.shortNotice': '預約必須至少提前24小時'
    }),

  reserve_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .required()
    .messages({
      'string.pattern.base': '預約時間格式必須為 H:MM 或 HH:MM (如: 9:00 或 09:00)',
      'any.required': '預約時間為必填欄位'
    })
})

// 預約列表查詢驗證 Schema
const reservationListQuerySchema = Joi.object({
  role: Joi.string()
    .valid('student', 'teacher')
    .default('student')
    .messages({
      'any.only': '角色必須為 student 或 teacher'
    }),

  status: Joi.string()
    .valid('reserved', 'completed', 'cancelled')
    .optional()
    .messages({
      'any.only': '狀態必須為 reserved、completed 或 cancelled 其中之一'
    }),

  date_from: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .messages({
      'string.pattern.base': '開始日期格式必須為 YYYY-MM-DD'
    }),

  date_to: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .when('date_from', {
      is: Joi.exist(),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .custom((value, helpers) => {
      const { date_from } = helpers.state.ancestors[0]
      if (date_from && value) {
        const fromDate = new Date(date_from)
        const toDate = new Date(value)
        
        if (toDate < fromDate) {
          return helpers.error('date.range.invalid')
        }
      }
      return value
    })
    .messages({
      'string.pattern.base': '結束日期格式必須為 YYYY-MM-DD',
      'any.required': '當指定開始日期時，結束日期為必填',
      'date.range.invalid': '結束日期不能早於開始日期'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '頁碼必須為數字',
      'number.integer': '頁碼必須為整數',
      'number.min': '頁碼最小值為1'
    }),

  per_page: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': '每頁數量必須為數字',
      'number.integer': '每頁數量必須為整數',
      'number.min': '每頁數量最小值為1',
      'number.max': '每頁數量最大值為100'
    })
})

// 更新預約狀態驗證 Schema
const updateReservationStatusSchema = Joi.object({
  status_type: Joi.string()
    .valid('teacher-complete', 'student-complete')
    .required()
    .messages({
      'any.only': '狀態類型必須為 teacher-complete 或 student-complete',
      'any.required': '狀態類型為必填欄位'
    }),

  notes: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': '備註最多500字元'
    })
})

// 預約ID參數驗證 Schema
const reservationIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '預約ID必須為數字',
      'number.integer': '預約ID必須為整數',
      'number.positive': '預約ID必須為正數',
      'any.required': '預約ID為必填欄位'
    })
})

// 日曆檢視查詢驗證 Schema
const calendarViewQuerySchema = Joi.object({
  view: Joi.string()
    .valid('week', 'month')
    .required()
    .messages({
      'any.only': '檢視類型必須為 week 或 month',
      'any.required': '檢視類型為必填欄位'
    }),

  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '日期格式必須為 YYYY-MM-DD',
      'any.required': '日期為必填欄位',
      'date.invalid': '日期格式無效'
    }),

  role: Joi.string()
    .valid('student', 'teacher')
    .default('student')
    .messages({
      'any.only': '角色必須為 student 或 teacher'
    })
})

export {
  createReservationSchema,
  reservationListQuerySchema,
  updateReservationStatusSchema,
  reservationIdParamSchema,
  calendarViewQuerySchema
}

// 驗證中介層函式

import { Request, Response, NextFunction } from 'express'

/**
 * 建立預約驗證中介層
 */
export const validateCreateReservation = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createReservationSchema.validate(req.body, { abortEarly: false })
  
  if (error) {
    const errors: Record<string, string[]> = {}
    
    error.details.forEach(detail => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '資料驗證失敗',
      errors
    })
  }
  
  req.body = value
  next()
}

/**
 * 預約列表查詢驗證中介層
 */
export const validateReservationListQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = reservationListQuerySchema.validate(req.query, { abortEarly: false })
  
  if (error) {
    const errors: Record<string, string[]> = {}
    
    error.details.forEach(detail => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '資料驗證失敗',
      errors
    })
  }
  
  req.query = value
  next()
}

/**
 * 更新預約狀態驗證中介層
 */
export const validateUpdateReservationStatus = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = updateReservationStatusSchema.validate(req.body, { abortEarly: false })
  
  if (error) {
    const errors: Record<string, string[]> = {}
    
    error.details.forEach(detail => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '資料驗證失敗',
      errors
    })
  }
  
  req.body = value
  next()
}

/**
 * 預約ID參數驗證中介層
 */
export const validateReservationIdParam = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = reservationIdParamSchema.validate(req.params, { abortEarly: false })
  
  if (error) {
    const errors: Record<string, string[]> = {}
    
    error.details.forEach(detail => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '資料驗證失敗',
      errors
    })
  }
  
  req.params = value
  next()
}

/**
 * 日曆檢視查詢驗證中介層
 */
export const validateCalendarViewQuery = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = calendarViewQuerySchema.validate(req.query, { abortEarly: false })
  
  if (error) {
    const errors: Record<string, string[]> = {}
    
    error.details.forEach(detail => {
      const field = detail.path.join('.')
      if (!errors[field]) {
        errors[field] = []
      }
      errors[field].push(detail.message)
    })
    
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '資料驗證失敗',
      errors
    })
  }
  
  req.query = value
  next()
}