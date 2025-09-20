import type { 
  AvailableSlotData, 
  AvailableSlotInfo, 
  UpdateScheduleRequest, 
  CheckConflictsRequest,
  WeeklyScheduleRequest,
  WeeklyScheduleResponse,
  StandardSlot,
  WeekdayString
} from '@models/index'
import { Weekday, WeeklyWeekday } from '@models/index'

/**
 * 教師時間管理測試資料
 */

/** 有效的可預約時段資料 */
export const validSlotData: AvailableSlotData = {
  weekday: Weekday.MONDAY,
  start_time: '09:00',
  end_time: '10:00',
  is_active: true
}

/** 完整的可預約時段資料 */
export const validSlotInfo: AvailableSlotInfo = {
  id: 1,
  teacher_id: 1,
  weekday: Weekday.MONDAY,
  start_time: '09:00',
  end_time: '10:00',
  is_active: true,
  created_at: new Date('2025-08-16T09:00:00Z'),
  updated_at: new Date('2025-08-16T09:00:00Z')
}

/** 多個時段的測試資料 */
export const multipleSlotData: AvailableSlotData[] = [
  {
    weekday: Weekday.MONDAY,
    start_time: '09:00',
    end_time: '10:00',
    is_active: true
  },
  {
    weekday: Weekday.MONDAY,
    start_time: '10:30',
    end_time: '11:30',
    is_active: true
  },
  {
    weekday: Weekday.TUESDAY,
    start_time: '14:00',
    end_time: '15:00',
    is_active: true
  },
  {
    weekday: Weekday.WEDNESDAY,
    start_time: '16:00',
    end_time: '17:00',
    is_active: false
  }
]

/** 完整的更新請求資料 */
export const validUpdateScheduleRequest: UpdateScheduleRequest = {
  available_slots: multipleSlotData
}

/** 無效的時段資料 - 空資料 */
export const invalidSlotData = {
  emptySlot: {},
  
  missingWeekday: {
    start_time: '09:00',
    end_time: '10:00'
  },
  
  missingStartTime: {
    weekday: Weekday.MONDAY,
    end_time: '10:00'
  },
  
  missingEndTime: {
    weekday: Weekday.MONDAY,
    start_time: '09:00'
  }
}

/** 無效的時段資料 - 錯誤格式 */
export const invalidFormatSlotData = {
  invalidWeekday: {
    weekday: 7, // 不存在的星期
    start_time: '09:00',
    end_time: '10:00'
  },
  
  invalidTimeFormat: {
    weekday: Weekday.MONDAY,
    start_time: '25:00', // 無效小時
    end_time: '10:00'
  },
  
  invalidTimeRange: {
    weekday: Weekday.MONDAY,
    start_time: '25:00', // 不存在的時間
    end_time: '10:00'
  },
  
  endTimeBeforeStart: {
    weekday: Weekday.MONDAY,
    start_time: '10:00',
    end_time: '09:00' // 結束時間早於開始時間
  }
}

/** 時間衝突的測試資料 */
export const conflictingSlotData: AvailableSlotData[] = [
  {
    weekday: Weekday.MONDAY,
    start_time: '09:00',
    end_time: '10:30',
    is_active: true
  },
  {
    weekday: Weekday.MONDAY,
    start_time: '10:00', // 與第一個時段重疊
    end_time: '11:00',
    is_active: true
  }
]

/** 檢查衝突的請求資料 */
export const validCheckConflictsRequest: CheckConflictsRequest = {
  slot_ids: [1, 2, 3],
  from_date: '2025-08-20',
  to_date: '2025-09-20'
}

/** 邊界時間測試資料 */
export const boundaryTimeSlotData = {
  earlyMorning: {
    weekday: Weekday.MONDAY,
    start_time: '06:00',
    end_time: '07:00',
    is_active: true
  },
  
  lateNight: {
    weekday: Weekday.FRIDAY,
    start_time: '22:00',
    end_time: '23:00',
    is_active: true
  },
  
  crossMidnight: {
    weekday: Weekday.SATURDAY,
    start_time: '23:30',
    end_time: '00:30', // 跨日的時段（不應該被允許）
    is_active: true
  }
}

/** 大量時段測試資料 */
export const bulkSlotData: AvailableSlotData[] = Array.from({ length: 20 }, (_, index) => ({
  weekday: index % 7,
  start_time: `${8 + Math.floor(index / 7)}:00`,
  end_time: `${9 + Math.floor(index / 7)}:00`,
  is_active: index % 3 !== 0 // 部分停用
}))

/** 時段更新情境測試資料 */
export const scheduleUpdateScenarios = {
  // 情境1：全新建立時段
  createNew: {
    existing: [],
    update: multipleSlotData
  },
  
  // 情境2：完全替換所有時段
  replaceAll: {
    existing: [
      { ...validSlotData, id: 1, teacher_id: 1 },
      { ...validSlotData, id: 2, teacher_id: 1, weekday: Weekday.TUESDAY }
    ],
    update: multipleSlotData
  },
  
  // 情境3：部分更新時段
  partialUpdate: {
    existing: [
      { ...validSlotData, id: 1, teacher_id: 1 },
      { ...validSlotData, id: 2, teacher_id: 1, weekday: Weekday.TUESDAY },
      { ...validSlotData, id: 3, teacher_id: 1, weekday: Weekday.WEDNESDAY }
    ],
    update: [multipleSlotData[0], multipleSlotData[2]] // 保留第1個和第3個，刪除第2個
  },
  
  // 情境4：停用所有時段
  deactivateAll: {
    existing: multipleSlotData.map((slot, index) => ({
      ...slot,
      id: index + 1,
      teacher_id: 1
    })),
    update: []
  }
}

/** API 回應的預期結果 */
export const expectedApiResponses = {
  getScheduleSuccess: {
    status: 'success',
    message: '取得教師時段設定成功',
    data: {
      available_slots: [validSlotInfo],
      total_slots: 1
    }
  },
  
  getScheduleEmpty: {
    status: 'success',
    message: '取得教師時段設定成功',
    data: {
      available_slots: [],
      total_slots: 0
    }
  },
  
  updateScheduleSuccess: {
    status: 'success',
    message: '教師時段設定更新成功',
    data: {
      available_slots: multipleSlotData.map((slot, index) => ({
        ...slot,
        id: index + 1,
        teacher_id: 1,
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      })),
      updated_count: 0,
      created_count: 4,
      deleted_count: 0
    }
  },
  
  checkConflictsNoConflict: {
    status: 'success',
    message: '時段衝突檢查完成',
    data: {
      has_conflicts: false,
      conflicts: [],
      total_conflicts: 0,
      check_period: {
        from_date: '2025-08-20',
        to_date: '2025-09-20'
      }
    }
  }
}

/** 錯誤回應的預期結果 */
export const expectedErrorResponses = {
  unauthorized: {
    status: 'error',
    message: 'Access token 為必填欄位'
  },
  
  invalidToken: {
    status: 'error',
    message: 'Token 無效'
  },
  
  forbidden: {
    status: 'error',
    message: '找不到教師資料'
  },
  
  validationError: {
    status: 'error',
    message: '參數驗證失敗',
    errors: expect.any(Object)
  },
  
  notFound: {
    status: 'error',
    message: '找不到教師資料'
  }
}

export default {
  validSlotData,
  validSlotInfo,
  multipleSlotData,
  validUpdateScheduleRequest,
  invalidSlotData,
  invalidFormatSlotData,
  conflictingSlotData,
  validCheckConflictsRequest,
  boundaryTimeSlotData,
  bulkSlotData,
  scheduleUpdateScenarios,
  expectedApiResponses,
  expectedErrorResponses
}

// ==================== 台灣週次時段測試資料 ====================

/** 台灣標準時段測試資料 */
export const standardSlots: readonly StandardSlot[] = [
  '09:00', '10:00', '11:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '19:00', '20:00'
] as const

/** 有效的台灣週次時段請求資料 */
export const validWeeklyScheduleRequest: WeeklyScheduleRequest = {
  weekly_schedule: {
    '1': ['09:00', '10:00', '13:00', '14:00', '15:00', '16:00', '17:00'], // 週一
    '2': ['09:00', '10:00', '13:00', '14:00'], // 週二
    '4': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00'], // 週四
    '5': ['09:00', '10:00', '11:00', '13:00', '14:00', '17:00', '19:00'], // 週五
    '6': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'] // 週六
  }
}

/** 空的台灣週次時段請求 */
export const emptyWeeklyScheduleRequest: WeeklyScheduleRequest = {
  weekly_schedule: {}
}

/** 單天台灣週次時段請求 */
export const singleDayWeeklyScheduleRequest: WeeklyScheduleRequest = {
  weekly_schedule: {
    '1': ['09:00', '10:00', '13:00'] // 只設定週一
  }
}

/** 無效的台灣週次時段請求 - 錯誤週次 */
export const invalidWeekDayScheduleRequest = {
  weekly_schedule: {
    '8': ['09:00', '10:00'], // 不存在的週次
    '0': ['13:00', '14:00']  // 錯誤的週次格式
  }
}

/** 無效的台灣週次時段請求 - 錯誤時段 */
export const invalidTimeSlotScheduleRequest = {
  weekly_schedule: {
    '1': ['08:00', '12:00', '18:00'], // 非標準時段
    '2': ['09:30', '14:30']          // 非標準時段
  }
}

/** 重複時段的台灣週次時段請求 */
export const duplicateTimeSlotScheduleRequest = {
  weekly_schedule: {
    '1': ['09:00', '10:00', '09:00'], // 重複 09:00
    '2': ['13:00', '13:00', '14:00']  // 重複 13:00
  }
}

/** 預期的台灣週次時段回應 */
export const expectedWeeklyScheduleResponse: WeeklyScheduleResponse = {
  weekly_schedule: {
    '1': ['09:00', '10:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    '2': ['09:00', '10:00', '13:00', '14:00'],
    '4': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00'],
    '5': ['09:00', '10:00', '11:00', '13:00', '14:00', '17:00', '19:00'],
    '6': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00']
  },
  total_slots: 37,
  slots_by_day: {
    '1': 7, '2': 4, '4': 9, '5': 7, '6': 10
  },
  updated_count: 0,
  created_count: 37,
  deleted_count: 0
}

/** 台灣週次時段測試場景 */
export const scheduleTestScenarios = {
  validUpdate: {
    description: '成功更新台灣週次時段設定',
    request: validWeeklyScheduleRequest,
    expectedResponse: expectedWeeklyScheduleResponse
  },
  emptySchedule: {
    description: '清空所有時段設定',
    request: emptyWeeklyScheduleRequest,
    expectedResponse: {
      weekly_schedule: {},
      total_slots: 0,
      slots_by_day: {},
      updated_count: 0,
      created_count: 0,
      deleted_count: 0
    }
  },
  singleDay: {
    description: '只設定單天時段',
    request: singleDayWeeklyScheduleRequest,
    expectedResponse: {
      weekly_schedule: { '1': ['09:00', '10:00', '13:00'] },
      total_slots: 3,
      slots_by_day: { '1': 3 },
      updated_count: 0,
      created_count: 3,
      deleted_count: 0
    }
  }
}

// 匯出台灣週次時段相關測試資料
export const taiwanScheduleFixtures = {
  standardSlots,
  validWeeklyScheduleRequest,
  emptyWeeklyScheduleRequest,
  singleDayWeeklyScheduleRequest,
  invalidWeekDayScheduleRequest,
  invalidTimeSlotScheduleRequest,
  duplicateTimeSlotScheduleRequest,
  expectedWeeklyScheduleResponse,
  scheduleTestScenarios
}