/**
 * 教師後台管理系統驗證中間件
 * 遵循專案驗證指示文件：使用統一訊息管理、標準化錯誤格式
 * 驗證涵蓋：儀表板查詢、學生管理、預約狀態更新、收益查詢等
 */

import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { validateRequest } from '../core'
import { ReservationStatus, EarningStatus } from '@entities/enums'

// === 通用驗證 Schema ===

/**
 * 分頁參數驗證 Schema
 */
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '頁數必須為數字',
      'number.integer': '頁數必須為整數',
      'number.min': '頁數必須大於 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': '每頁數量必須為數字',
      'number.integer': '每頁數量必須為整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    })
})

/**
 * 日期範圍驗證 Schema
 */
const dateRangeSchema = Joi.object({
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '開始日期格式必須為 YYYY-MM-DD',
      'date.invalid': '開始日期格式無效'
    }),
  
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '結束日期格式必須為 YYYY-MM-DD',
      'date.invalid': '結束日期格式無效'
    })
}).custom((value, helpers) => {
  // 檢查結束日期不能早於開始日期
  if (value.startDate && value.endDate) {
    const startDate = new Date(value.startDate)
    const endDate = new Date(value.endDate)
    
    if (endDate < startDate) {
      return helpers.error('dateRange.invalid')
    }
  }
  return value
}).messages({
  'dateRange.invalid': '結束日期不能早於開始日期'
})

// === 儀表板相關驗證 Schema ===

/**
 * 儀表板總覽查詢參數驗證
 */
const dashboardOverviewQuerySchema = Joi.object({
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '開始日期格式必須為 YYYY-MM-DD',
      'date.invalid': '開始日期格式無效'
    }),
  
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '結束日期格式必須為 YYYY-MM-DD',
      'date.invalid': '結束日期格式無效'
    })
}).custom((value, helpers) => {
  // 檢查結束日期不能早於開始日期
  if (value.startDate && value.endDate) {
    const startDate = new Date(value.startDate)
    const endDate = new Date(value.endDate)
    
    if (endDate < startDate) {
      return helpers.error('dateRange.invalid')
    }
  }
  return value
}).messages({
  'dateRange.invalid': '結束日期不能早於開始日期'
}).unknown(false)

/**
 * 統計資料查詢參數驗證
 */
const statisticsQuerySchema = Joi.object({
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '開始日期格式必須為 YYYY-MM-DD',
      'date.invalid': '開始日期格式無效'
    }),
  
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      // 檢查與 startDate 的關係
      const queryObj = helpers.state.ancestors[0]
      if (queryObj && queryObj.startDate) {
        const startDate = new Date(queryObj.startDate)
        const endDate = new Date(value)
        
        if (endDate < startDate) {
          return helpers.error('dateRange.invalid')
        }
      }
      return value
    })
    .messages({
      'string.pattern.base': '結束日期格式必須為 YYYY-MM-DD',
      'date.invalid': '結束日期格式無效',
      'dateRange.invalid': '結束日期不能早於開始日期'
    }),
    
  type: Joi.string()
    .valid('overview', 'earnings', 'reservations', 'performance')
    .optional()
    .messages({
      'any.only': '統計類型必須為 overview、earnings、reservations 或 performance 其中之一'
    }),
  
  period: Joi.string()
    .valid('daily', 'weekly', 'monthly', 'yearly')
    .default('monthly')
    .messages({
      'any.only': '統計週期必須為 daily、weekly、monthly 或 yearly 其中之一'
    })
}).unknown(false)

// === 學生管理相關驗證 Schema ===

/**
 * 學生列表查詢參數驗證
 */
const studentListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '頁數必須為數字',
      'number.integer': '頁數必須為整數',
      'number.min': '頁數必須大於 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': '每頁數量必須為數字',
      'number.integer': '每頁數量必須為整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    }),
  
  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': '搜尋關鍵字至少需要 1 個字元',
      'string.max': '搜尋關鍵字不能超過 100 個字元'
    }),
  
  status: Joi.string()
    .valid('active', 'inactive', 'all')
    .default('active')
    .messages({
      'any.only': '學生狀態必須為 active、inactive 或 all 其中之一'
    }),
  
  sortBy: Joi.string()
    .valid('name', 'joinDate', 'totalReservations', 'totalSpent', 'lastActivity')
    .default('joinDate')
    .messages({
      'any.only': '排序欄位必須為 name、joinDate、totalReservations、totalSpent 或 lastActivity 其中之一'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': '排序順序必須為 asc 或 desc 其中之一'
    })
}).unknown(false)

/**
 * 學生 ID 路徑參數驗證
 * 只進行基本格式驗證，讓業務邏輯處理不存在的學生ID和權限問題
 */
const studentIdParamsSchema = Joi.object({
  studentId: Joi.string()
    .pattern(/^\d+$/)
    .custom((value, helpers) => {
      const numValue = parseInt(value, 10)
      if (numValue <= 0 || !Number.isInteger(numValue)) {
        return helpers.error('number.invalid')
      }
      return numValue
    })
    .messages({
      'string.pattern.base': '學生ID必須為數字',
      'number.invalid': '學生ID必須為正整數'
    })
}).unknown(false)

// === 預約管理相關驗證 Schema ===

/**
 * 預約列表查詢參數驗證
 */
const reservationListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '頁數必須為數字',
      'number.integer': '頁數必須為整數',
      'number.min': '頁數必須大於 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': '每頁數量必須為數字',
      'number.integer': '每頁數量必須為整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    }),
  
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '開始日期格式必須為 YYYY-MM-DD',
      'date.invalid': '開始日期格式無效'
    }),
  
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '結束日期格式必須為 YYYY-MM-DD',
      'date.invalid': '結束日期格式無效'
    }),
  
  status: Joi.string()
    .valid(...Object.values(ReservationStatus), 'pending', 'confirmed', 'all')
    .optional()
    .messages({
      'any.only': '預約狀態必須為有效的預約狀態值'
    }),
  
  studentId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': '學生ID必須為數字',
      'number.integer': '學生ID必須為整數',
      'number.positive': '學生ID必須為正數'
    }),
  
  sortBy: Joi.string()
    .valid('date', 'studentName', 'status', 'price')
    .default('date')
    .messages({
      'any.only': '排序欄位必須為 date、studentName、status 或 price 其中之一'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': '排序順序必須為 asc 或 desc 其中之一'
    })
}).custom((value, helpers) => {
  // 檢查結束日期不能早於開始日期
  if (value.startDate && value.endDate) {
    const startDate = new Date(value.startDate)
    const endDate = new Date(value.endDate)
    
    if (endDate < startDate) {
      return helpers.error('dateRange.invalid')
    }
  }
  return value
}).messages({
  'dateRange.invalid': '結束日期不能早於開始日期'
}).unknown(false)

/**
 * 預約 ID 路徑參數驗證
 * 只進行基本格式驗證，讓業務邏輯處理不存在的預約ID和權限問題
 */
const reservationIdParamsSchema = Joi.object({
  reservationId: Joi.string()
    .pattern(/^\d+$/)
    .custom((value, helpers) => {
      const numValue = parseInt(value, 10)
      if (numValue <= 0 || !Number.isInteger(numValue)) {
        return helpers.error('number.invalid')
      }
      return numValue
    })
    .messages({
      'string.pattern.base': '預約ID必須為數字',
      'number.invalid': '預約ID必須為正整數'
    })
}).unknown(false)

/**
 * 預約狀態更新請求體驗證
 */
const updateReservationStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ReservationStatus), 'pending', 'confirmed')
    .required()
    .messages({
      'any.only': '預約狀態必須為有效的預約狀態值',
      'any.required': '預約狀態為必填欄位'
    }),
  
  note: Joi.string()
    .trim()
    .min(1)
    .max(500)
    .optional()
    .messages({
      'string.min': '備註至少需要 1 個字元',
      'string.max': '備註不能超過 500 個字元'
    })
}).unknown(false)

// === 收益管理相關驗證 Schema ===

/**
 * 收益列表查詢參數驗證
 */
const earningsListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '頁數必須為數字',
      'number.integer': '頁數必須為整數',
      'number.min': '頁數必須大於 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': '每頁數量必須為數字',
      'number.integer': '每頁數量必須為整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    }),
  
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '開始日期格式必須為 YYYY-MM-DD',
      'date.invalid': '開始日期格式無效'
    }),
  
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '結束日期格式必須為 YYYY-MM-DD',
      'date.invalid': '結束日期格式無效'
    }),
  
  status: Joi.string()
    .valid(...Object.values(EarningStatus), 'all')
    .optional()
    .messages({
      'any.only': '收益狀態必須為有效的收益狀態值'
    }),
  
  minAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': '最小金額必須為數字',
      'number.min': '最小金額不能小於 0'
    }),
  
  maxAmount: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.base': '最大金額必須為數字',
      'number.min': '最大金額不能小於 0'
    }),
  
  sortBy: Joi.string()
    .valid('date', 'amount', 'status')
    .default('date')
    .messages({
      'any.only': '排序欄位必須為 date、amount 或 status 其中之一'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': '排序順序必須為 asc 或 desc 其中之一'
    })
}).custom((value, helpers) => {
  // 檢查結束日期不能早於開始日期
  if (value.startDate && value.endDate) {
    const startDate = new Date(value.startDate)
    const endDate = new Date(value.endDate)
    
    if (endDate < startDate) {
      return helpers.error('dateRange.invalid')
    }
  }
  // 檢查最大金額不能小於最小金額
  if (value.minAmount !== undefined && value.maxAmount !== undefined) {
    if (value.maxAmount < value.minAmount) {
      return helpers.error('amountRange.invalid')
    }
  }
  return value
}).messages({
  'dateRange.invalid': '結束日期不能早於開始日期',
  'amountRange.invalid': '最大金額不能小於最小金額'
}).unknown(false)

/**
 * 收益總結查詢參數驗證
 */
const earningsSummaryQuerySchema = Joi.object({
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '開始日期格式必須為 YYYY-MM-DD',
      'date.invalid': '開始日期格式無效'
    }),
  
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      const date = new Date(value)
      if (isNaN(date.getTime())) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .messages({
      'string.pattern.base': '結束日期格式必須為 YYYY-MM-DD',
      'date.invalid': '結束日期格式無效'
    }),
  
  period: Joi.string()
    .valid('monthly', 'quarterly', 'yearly')
    .default('monthly')
    .messages({
      'any.only': '統計週期必須為 monthly、quarterly 或 yearly 其中之一'
    })
}).custom((value, helpers) => {
  // 檢查結束日期不能早於開始日期
  if (value.startDate && value.endDate) {
    const startDate = new Date(value.startDate)
    const endDate = new Date(value.endDate)
    
    if (endDate < startDate) {
      return helpers.error('dateRange.invalid')
    }
  }
  return value
}).messages({
  'dateRange.invalid': '結束日期不能早於開始日期'
}).unknown(false)

// === 結算管理相關驗證 Schema ===

/**
 * 結算列表查詢參數驗證
 */
const settlementListQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': '頁數必須為數字',
      'number.integer': '頁數必須為整數',
      'number.min': '頁數必須大於 0'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': '每頁數量必須為數字',
      'number.integer': '每頁數量必須為整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    }),
  
  status: Joi.string()
    .valid('pending', 'processing', 'completed', 'paid')
    .optional()
    .messages({
      'any.only': '結算狀態必須為 pending、processing、completed 或 paid 其中之一'
    }),
  
  year: Joi.number()
    .integer()
    .min(2020)
    .max(2030)
    .optional()
    .messages({
      'number.base': '年份必須為數字',
      'number.integer': '年份必須為整數',
      'number.min': '年份不能小於 2020',
      'number.max': '年份不能大於 2030'
    }),
  
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .optional()
    .when('year', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.forbidden()
    })
    .messages({
      'number.base': '月份必須為數字',
      'number.integer': '月份必須為整數',
      'number.min': '月份必須介於 1-12 之間',
      'number.max': '月份必須介於 1-12 之間',
      'any.forbidden': '月份必須搭配年份一起使用'
    })
}).unknown(false)

/**
 * 結算 ID 路徑參數驗證
 * 只進行基本格式驗證，讓業務邏輯處理不存在的結算ID和權限問題
 */
const settlementIdParamsSchema = Joi.object({
  settlementId: Joi.string()
    .pattern(/^\d+$/)
    .custom((value, helpers) => {
      const numValue = parseInt(value, 10)
      if (numValue <= 0 || !Number.isInteger(numValue)) {
        return helpers.error('number.invalid')
      }
      return numValue
    })
    .messages({
      'string.pattern.base': '結算ID必須為數字',
      'number.invalid': '結算ID必須為正整數'
    })
}).unknown(false)

// === 路徑參數驗證中間件 ===

/**
 * 查詢參數驗證中間件工廠函式
 */
function validateQuery(schema: Joi.Schema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      })

      if (error) {
        const formattedErrors: Record<string, string[]> = {}
        error.details.forEach((detail) => {
          const key = detail.path.join('.')
          if (!formattedErrors[key]) {
            formattedErrors[key] = []
          }
          formattedErrors[key].push(detail.message)
        })
        
        res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: '參數驗證失敗',
          errors: formattedErrors
        })
        return
      }

      req.query = value
      next()
    } catch (error) {
      next(error)
    }
  }
}

// === 教師後台驗證中間件匯出 ===

// === 匯出驗證中間件 ===

export const teacherDashboardValidation = {
  // 儀表板相關
  validateDashboardOverviewQuery: validateQuery(
    dashboardOverviewQuerySchema
  ),
  
  validateStatisticsQuery: validateQuery(
    statisticsQuerySchema
  ),

  // 學生管理相關
  validateStudentListQuery: validateQuery(
    studentListQuerySchema
  ),
  
  // 移除學生ID驗證，讓業務邏輯處理
  validateStudentIdParams: (req: Request, res: Response, next: NextFunction) => next(),

  // 預約管理相關
  validateReservationListQuery: validateQuery(
    reservationListQuerySchema
  ),
  
  // 移除預約ID驗證，讓業務邏輯處理
  validateReservationIdParams: (req: Request, res: Response, next: NextFunction) => next(),
  
  validateUpdateReservationStatus: validateRequest(
    updateReservationStatusSchema,
    '預約狀態更新參數驗證失敗'
  ),

  // 收益管理相關
  validateEarningsListQuery: validateQuery(
    earningsListQuerySchema
  ),
  
  validateEarningsSummaryQuery: validateQuery(
    earningsSummaryQuerySchema
  ),

  // 結算管理相關
  validateSettlementListQuery: validateQuery(
    settlementListQuerySchema
  ),
  
  // 移除結算ID驗證，讓業務邏輯處理  
  validateSettlementIdParams: (req: Request, res: Response, next: NextFunction) => next()
}

// 預設匯出
export default teacherDashboardValidation

// === 匯出 Schema 供測試使用 ===
export const teacherDashboardSchemas = {
  dashboardOverviewQuerySchema,
  statisticsQuerySchema,
  studentListQuerySchema,
  studentIdParamsSchema,
  reservationListQuerySchema,
  reservationIdParamsSchema,
  updateReservationStatusSchema,
  earningsListQuerySchema,
  earningsSummaryQuerySchema,
  settlementListQuerySchema,
  settlementIdParamsSchema,
  paginationSchema,
  dateRangeSchema
}