/**
 * 教師時段管理 Schema
 * 
 * 包含週次時段系統的所有 Swagger Schema 定義
 */

export const scheduleSchemas = {
  // ==================== 週次時段系統  WeeklyScheduleSuccessResponse: {
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

  // ==================== 時段系統基礎 Schema ====================

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
        description: '更新的時段數量',
        example: 0
      },
      created_count: {
        type: 'integer',
        minimum: 0,
        description: '新建的時段數量',
        example: 37
      },
      deleted_count: {
        type: 'integer',
        minimum: 0,
        description: '刪除的時段數量',
        example: 0
      }
    }
  },

  // 台灣週次時段設定成功回應 Schema
  TaiwanWeeklyScheduleSuccessResponse: {
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
        example: '教師時段設定更新成功'
      },
      data: {
        $ref: '#/components/schemas/TaiwanWeeklyScheduleResponse'
      }
    }
  },

  // ==================== 時段分類資訊 Schema ====================

  // 時段分類統計
  SlotCategoryStats: {
    type: 'object',
    properties: {
      morning: {
        type: 'integer',
        minimum: 0,
        maximum: 21,
        description: '上午時段總數 (3時段 × 7天)',
        example: 15
      },
      afternoon: {
        type: 'integer',
        minimum: 0,
        maximum: 35,
        description: '下午時段總數 (5時段 × 7天)',
        example: 20
      },
      evening: {
        type: 'integer',
        minimum: 0,
        maximum: 14,
        description: '晚上時段總數 (2時段 × 7天)',
        example: 2
      }
    }
  },

  // 進階時段資訊回應 (可選)
  TaiwanWeeklyScheduleDetailedResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/TaiwanWeeklyScheduleResponse'
      },
      {
        type: 'object',
        properties: {
          category_stats: {
            $ref: '#/components/schemas/SlotCategoryStats'
          },
          standard_slots: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/TaiwanStandardTimeSlot'
            },
            description: '所有標準時段列表',
            example: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '19:00', '20:00']
          }
        }
      }
    ]
  },

  // ==================== 錯誤回應 Schema ====================

  // 台灣時段驗證錯誤
  TaiwanScheduleValidationError: {
    type: 'object',
    required: ['status', 'message', 'errors'],
    properties: {
      status: {
        type: 'string',
        enum: ['error'],
        example: 'error'
      },
      message: {
        type: 'string',
        description: '錯誤訊息',
        example: '週次時段設定驗證失敗'
      },
      errors: {
        type: 'object',
        description: '詳細驗證錯誤',
        patternProperties: {
          '^weekly_schedule(\\.\\d+)?$': {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        },
        example: {
          'weekly_schedule.8': ['週次必須為1-7之間的數字 (週一=1, 週日=7)'],
          'weekly_schedule.1': ['同一天不能有重複的時段', '時段必須為標準時段']
        }
      }
    }
  },

  // ==================== 舊版相容性 Schema ====================

  // 舊版時段資料 (Deprecated)
  LegacyAvailableSlot: {
    type: 'object',
    required: ['weekday', 'start_time', 'end_time'],
    properties: {
      weekday: {
        type: 'integer',
        minimum: 0,
        maximum: 6,
        description: '星期 (0=週日, 1=週一, ..., 6=週六) [已棄用]',
        example: 1,
        deprecated: true
      },
      start_time: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: '開始時間 (HH:MM 格式) [已棄用]',
        example: '09:00',
        deprecated: true
      },
      end_time: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
        description: '結束時間 (HH:MM 格式) [已棄用]',
        example: '10:00',
        deprecated: true
      },
      is_active: {
        type: 'boolean',
        description: '是否啟用 [已棄用]',
        example: true,
        deprecated: true
      }
    },
    deprecated: true
  },

  // 舊版時段更新請求 (Deprecated)
  LegacyScheduleUpdateRequest: {
    type: 'object',
    required: ['available_slots'],
    properties: {
      available_slots: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/LegacyAvailableSlot'
        },
        maxItems: 50,
        description: '可預約時段列表 [已棄用，請使用新版週次格式]'
      }
    },
    deprecated: true,
    description: '舊版時段更新請求格式 - 已棄用，請使用 WeeklyScheduleRequest'
  }
}