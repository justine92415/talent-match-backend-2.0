/**
 * 教師時間管理驗證中間件
 * 用於驗證時間管理 API 的請求參數
 */

import Joi from 'joi'
import { WEEKDAYS, SLOT_LIMITS, DATE_LIMITS, WEEKLY_WEEKDAYS, STANDARD_SLOTS, SLOT_RULES } from '@constants/schedule'

// 時段資料驗證 Schema
// 衝突檢查查詢參數驗證 Schema
export const conflictsQuerySchema = Joi.object({
  slot_ids: Joi.string()
    .pattern(/^(\d+)(,\d+)*$/)
    .optional()
    .messages({
      'string.pattern.base': 'slot_ids 格式錯誤，應為以逗號分隔的數字，如：1,2,3'
    }),

  from_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      // 檢查日期有效性
      const date = new Date(value + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        return helpers.error('custom.invalidDate');
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'from_date 格式必須為 YYYY-MM-DD',
      'custom.invalidDate': 'from_date 不是有效的日期'
    }),

  to_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .custom((value, helpers) => {
      // 檢查日期有效性
      const date = new Date(value + 'T00:00:00.000Z');
      if (isNaN(date.getTime())) {
        return helpers.error('custom.invalidDate');
      }
      return value;
    })
    .messages({
      'string.pattern.base': 'to_date 格式必須為 YYYY-MM-DD',
      'custom.invalidDate': 'to_date 不是有效的日期'
    })
}).custom((value, helpers) => {
  // 自定義驗證：from_date 必須早於 to_date
  const { from_date, to_date } = value;
  
  if (from_date && to_date) {
    const fromDate = new Date(from_date + 'T00:00:00.000Z');
    const toDate = new Date(to_date + 'T00:00:00.000Z');
    
    if (fromDate >= toDate) {
      return helpers.error('custom.dateRange');
    }
    
    // 檢查日期範圍不超過 1 年
    const daysDiff = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > DATE_LIMITS.MAX_RANGE_DAYS) {
      return helpers.error('custom.dateRangeTooLarge');
    }
  }
  
  return value;
}, '日期範圍驗證').messages({
  'custom.dateRange': '開始日期必須早於結束日期',
  'custom.dateRangeTooLarge': `日期範圍不得超過 ${DATE_LIMITS.MAX_RANGE_DAYS} 天`
});

// ==================== 週次時段驗證 Schema ====================

// 週次時段設定請求驗證 Schema
export const weeklyScheduleSchema = Joi.object({
  weekly_schedule: Joi.object()
    .pattern(
      // 週次 key 驗證 (1-7)
      Joi.string().valid(...SLOT_RULES.VALID_WEEK_DAYS),
      // 時段陣列驗證
      Joi.array()
        .items(
          Joi.string()
            .valid(...STANDARD_SLOTS)
            .messages({
              'any.only': `時段必須為標準時段: ${STANDARD_SLOTS.join(', ')}`
            })
        )
        .max(SLOT_LIMITS.MAX_SLOTS_PER_DAY)
        .unique()
        .messages({
          'array.max': `每天最多只能設定 ${SLOT_LIMITS.MAX_SLOTS_PER_DAY} 個時段`,
          'array.unique': '同一天不能有重複的時段'
        })
    )
    .min(0)
    .max(7)
    .required()
    .messages({
      'object.base': 'weekly_schedule 必須為物件格式',
      'object.max': '最多只能設定7天的時段',
      'any.required': 'weekly_schedule 為必填欄位'
    })
}).custom((value, helpers) => {
  // 自定義驗證：檢查總時段數量
  const weeklySchedule = value.weekly_schedule;
  let totalSlots = 0;
  
  for (const [weekDay, timeSlots] of Object.entries(weeklySchedule)) {
    if (Array.isArray(timeSlots)) {
      totalSlots += timeSlots.length;
    }
  }
  
  if (totalSlots > SLOT_LIMITS.MAX_SLOTS_PER_WEEK) {
    return helpers.error('custom.tooManySlots', { 
      total: totalSlots,
      max: SLOT_LIMITS.MAX_SLOTS_PER_WEEK 
    });
  }
  
  return value;
}, '週次時段總量檢查').messages({
  'custom.tooManySlots': `每週總時段數不得超過 ${SLOT_LIMITS.MAX_SLOTS_PER_WEEK} 個，目前設定了 {{#total}} 個時段`
});