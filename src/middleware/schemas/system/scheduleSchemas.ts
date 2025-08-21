/**
 * 教師時間管理驗證中間件
 * 用於驗證時間管理 API 的請求參數
 */

import Joi from 'joi'
import { WEEKDAYS, SLOT_LIMITS, DATE_LIMITS } from '@constants/schedule'

// 時段資料驗證 Schema
const availableSlotSchema = Joi.object({
  weekday: Joi.number()
    .integer()
    .min(WEEKDAYS.MIN)  // 週日 = 0
    .max(WEEKDAYS.MAX)  // 週六 = 6
    .required()
    .messages({
      'number.base': 'weekday 必須為數字',
      'number.integer': 'weekday 必須為整數',
      'number.min': `weekday 最小值為 ${WEEKDAYS.MIN} (週日)`,
      'number.max': `weekday 最大值為 ${WEEKDAYS.MAX} (週六)`,
      'any.required': 'weekday 為必填欄位'
    }),

  start_time: Joi.string()
    .pattern(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/)
    .required()
    .messages({
      'string.pattern.base': 'start_time 格式必須為 H:MM 或 HH:MM (如: 9:00 或 09:00)',
      'any.required': 'start_time 為必填欄位'
    }),

  end_time: Joi.string()
    .pattern(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/)
    .required()
    .messages({
      'string.pattern.base': 'end_time 格式必須為 H:MM 或 HH:MM (如: 10:00 或 10:00)',
      'any.required': 'end_time 為必填欄位'
    }),

  is_active: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'is_active 必須為布林值 (true/false)'
    })
}).custom((value, helpers) => {
  // 自定義驗證：結束時間必須晚於開始時間
  const startTime = value.start_time;
  const endTime = value.end_time;
  
  if (startTime && endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return helpers.error('custom.timeRange');
    }
  }
  
  return value;
}, '時間範圍驗證').messages({
  'custom.timeRange': '結束時間必須晚於開始時間'
});

// 更新時段請求驗證 Schema
export const scheduleUpdateSchema = Joi.object({
  available_slots: Joi.array()
    .items(availableSlotSchema)
    .min(0)
    .max(SLOT_LIMITS.MAX_SLOTS_PER_TEACHER)  // 限制最多時段數，避免資源濫用
    .required()
    .messages({
      'array.base': 'available_slots 必須為陣列',
      'array.max': `時段數量不得超過 ${SLOT_LIMITS.MAX_SLOTS_PER_TEACHER} 個`,
      'any.required': 'available_slots 為必填欄位'
    })
}).custom((value, helpers) => {
  // 自定義驗證：檢查時段重複
  const slots = value.available_slots;
  const slotMap = new Map();
  
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const key = `${slot.weekday}-${slot.start_time}-${slot.end_time}`;
    
    if (slotMap.has(key)) {
      return helpers.error('custom.duplicateSlot', { 
        index: i,
        weekday: slot.weekday,
        start_time: slot.start_time,
        end_time: slot.end_time
      });
    }
    
    slotMap.set(key, true);
  }
  
  return value;
}, '重複時段檢查').messages({
  'custom.duplicateSlot': '發現重複的時段設定：星期{{#weekday}} {{#start_time}}-{{#end_time}}'
});

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