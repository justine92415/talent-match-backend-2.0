import type { AvailableSlotData, AvailableSlotInfo, UpdateScheduleRequest, CheckConflictsRequest } from '@models/index'
import { Weekday } from '@models/index'

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