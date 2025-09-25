import Joi from 'joi'
import { TimeUtils } from '@utils/TimeUtils'

export const createReservationSchema = Joi.object({
  course_id: Joi.number().integer().positive().required(),
  teacher_id: Joi.number().integer().positive().required(),
  reserve_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      if (!TimeUtils.isValidDateFormat(value)) {
        return helpers.error('date.invalid')
      }
      return value
    })
    .required()
    .messages({
      'date.invalid': '日期無效，請提供正確的日期 (YYYY-MM-DD)'
    }),
  reserve_time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/)
    .custom((value, helpers) => {
      if (!TimeUtils.isValidTimeFormat(value)) {
        return helpers.error('time.invalid')
      }
      return value
    })
    .required()
    .messages({
      'time.invalid': '時間格式無效，請使用 HH:mm 格式'
    })
})

export const reservationListQuerySchema = Joi.object({
  role: Joi.string().valid('student', 'teacher').default('student'),
  status: Joi.alternatives().try(
    Joi.string().valid('reserved', 'completed', 'cancelled'),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional(),
  course_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須大於 0'
    }),
  date_from: Joi.alternatives().try(
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional()
    .messages({
      'string.pattern.base': '開始日期格式不正確，請使用 YYYY-MM-DD 格式'
    }),
  date_to: Joi.alternatives().try(
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional()
    .messages({
      'string.pattern.base': '結束日期格式不正確，請使用 YYYY-MM-DD 格式'
    }),
  page: Joi.alternatives().try(
    Joi.number().integer().min(1),
    Joi.string().allow(''),
    Joi.allow(null)
  ).default(1).optional()
    .messages({
      'number.base': '頁碼必須是數字',
      'number.integer': '頁碼必須是整數',
      'number.min': '頁碼必須大於 0'
    }),
  per_page: Joi.alternatives().try(
    Joi.number().integer().min(1).max(100),
    Joi.string().allow(''),
    Joi.allow(null)
  ).default(10).optional()
    .messages({
      'number.base': '每頁數量必須是數字',
      'number.integer': '每頁數量必須是整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    })
})

// 學生專用預約查詢參數（不需要 role 參數）
export const studentReservationListQuerySchema = Joi.object({
  status: Joi.alternatives().try(
    Joi.string().valid('reserved', 'completed', 'cancelled'),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional(),
  course_id: Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須大於 0'
    }),
  date_from: Joi.alternatives().try(
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional()
    .messages({
      'string.pattern.base': '開始日期格式不正確，請使用 YYYY-MM-DD 格式'
    }),
  date_to: Joi.alternatives().try(
    Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
    Joi.string().allow(''),
    Joi.allow(null)
  ).optional()
    .messages({
      'string.pattern.base': '結束日期格式不正確，請使用 YYYY-MM-DD 格式'
    }),
  page: Joi.alternatives().try(
    Joi.number().integer().min(1),
    Joi.string().allow(''),
    Joi.allow(null)
  ).default(1).optional()
    .messages({
      'number.base': '頁碼必須是數字',
      'number.integer': '頁碼必須是整數',
      'number.min': '頁碼必須大於 0'
    }),
  per_page: Joi.alternatives().try(
    Joi.number().integer().min(1).max(100),
    Joi.string().allow(''),
    Joi.allow(null)
  ).default(10).optional()
    .messages({
      'number.base': '每頁數量必須是數字',
      'number.integer': '每頁數量必須是整數',
      'number.min': '每頁數量必須大於 0',
      'number.max': '每頁數量不能超過 100'
    })
})

export const updateReservationStatusSchema = Joi.object({
  status_type: Joi.string().valid('teacher-complete', 'student-complete').required(),
  notes: Joi.string().max(500).optional()
})

export const reservationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required()
})

export const calendarViewQuerySchema = Joi.object({
  view: Joi.string().valid('week', 'month').required(),
  date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  role: Joi.string().valid('student', 'teacher').default('student')
})
