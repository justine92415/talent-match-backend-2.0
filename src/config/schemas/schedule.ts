/**
 * 教師時段管理 Schema
 * 
 * 包含週次時段系統的所有 Swagger Schema 定義
 */

export const scheduleSchemas = {
  // ==================== 週次時段系統 Schema ====================

  // 標準時段枚舉
  StandardTimeSlot: {
    type: 'string',
    enum: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00'],
    description: '標準教學時段',
    example: '09:00'
  },

  // 週次枚舉
  WeekdayString: {
    type: 'string',
    enum: ['1', '2', '3', '4', '5', '6', '7'],
    description: '週次 (1=週一, 2=週二, ..., 7=週日)',
    example: '1'
  },

  // 週次時段設定請求 Schema
  WeeklyScheduleRequest: {
    type: 'object',
    required: ['weekly_schedule'],
    properties: {
      weekly_schedule: {
        type: 'object',
        description: '週次時段設定 (鍵為週次字串，值為時段陣列)',
        patternProperties: {
          '^[1-7]$': {
            type: 'array',
            items: {
              $ref: '#/components/schemas/StandardTimeSlot'
            },
            maxItems: 10,
            uniqueItems: true,
            description: '該天的可用時段列表'
          }
        },
        additionalProperties: false,
        example: {
          '1': ['09:00', '10:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
          '2': ['09:00', '10:00', '13:00', '14:00'],
          '4': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00'],
          '5': ['09:00', '10:00', '11:00', '13:00', '14:00', '17:00', '19:00'],
          '6': ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00']
        }
      }
    }
  },

  // 各天時段統計 Schema
  SlotsByDayStats: {
    type: 'object',
    description: '各天時段數量統計',
    patternProperties: {
      '^[1-7]$': {
        type: 'integer',
        minimum: 0,
        maximum: 10,
        description: '該天的時段數量'
      }
    },
    additionalProperties: false,
    example: {
      '1': 7,
      '2': 4,
      '4': 9,
      '5': 7,
      '6': 10
    }
  },

  // 週次時段設定回應 Schema
  WeeklyScheduleResponse: {
    type: 'object',
    required: ['weekly_schedule', 'total_slots', 'slots_by_day', 'updated_count', 'created_count', 'deleted_count'],
    properties: {
      weekly_schedule: {
        type: 'object',
        description: '更新後的週次時段設定',
        patternProperties: {
          '^[1-7]$': {
            type: 'array',
            items: {
              $ref: '#/components/schemas/StandardTimeSlot'
            }
          }
        },
        additionalProperties: false
      },
      total_slots: {
        type: 'integer',
        minimum: 0,
        maximum: 70,
        description: '總時段數量 (最多 7天 × 10時段)',
        example: 37
      },
      slots_by_day: {
        $ref: '#/components/schemas/SlotsByDayStats'
      },
      updated_count: {
        type: 'integer',
        minimum: 0,
        description: '此次更新的時段數量',
        example: 5
      },
      created_count: {
        type: 'integer',
        minimum: 0,
        description: '此次新建立的時段數量',
        example: 3
      },
      deleted_count: {
        type: 'integer',
        minimum: 0,
        description: '此次刪除的時段數量',
        example: 2
      }
    }
  },

  // API 成功回應包裝 Schema
  WeeklyScheduleSuccessResponse: {
    type: 'object',
    required: ['status', 'message', 'data'],
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '教師週次時段設定更新成功'
      },
      data: {
        $ref: '#/components/schemas/WeeklyScheduleResponse'
      }
    }
  },

  // 時段驗證錯誤 Schema
  WeeklyScheduleValidationError: {
    type: 'object',
    required: ['week_day', 'error_type', 'message'],
    properties: {
      week_day: {
        $ref: '#/components/schemas/WeekdayString'
      },
      time_slot: {
        $ref: '#/components/schemas/StandardTimeSlot'
      },
      error_type: {
        type: 'string',
        enum: ['INVALID_WEEK_DAY', 'INVALID_TIME_SLOT', 'DUPLICATE_TIME_SLOT', 'FORMAT_ERROR'],
        description: '錯誤類型'
      },
      message: {
        type: 'string',
        description: '詳細錯誤訊息',
        example: '週次必須為1-7之間的數字'
      }
    }
  },

  // ==================== 舊版相容性 Schema (已棄用) ====================

  // 舊版時段更新請求 (保留用於向後相容)
  LegacyScheduleUpdateRequest: {
    type: 'object',
    properties: {
      available_slots: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            weekday: { type: 'integer', minimum: 0, maximum: 6 },
            start_time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
            end_time: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
            is_active: { type: 'boolean', default: true }
          },
          required: ['weekday', 'start_time', 'end_time']
        },
        maxItems: 50,
        description: '可預約時段列表 [已棄用，請使用新版週次格式]'
      }
    },
    deprecated: true,
    description: '舊版時段更新請求格式 - 已棄用，請使用 WeeklyScheduleRequest'
  }
}