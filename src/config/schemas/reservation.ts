/**
 * 預約管理相關 Schema
 * 基於實際 ReservationController 和 ReservationService 實作
 */

export const reservationSchemas = {
  // === 請求 Schema ===
  
  // 建立預約請求 Schema
  CreateReservationRequest: {
    type: 'object',
    required: ['course_id', 'teacher_id', 'reserve_date', 'reserve_time'],
    properties: {
      course_id: {
        type: 'integer',
        description: '課程 ID (必填，學生必須已購買此課程)',
        example: 123
      },
      teacher_id: {
        type: 'integer',
        description: '教師 ID (必填，必須與課程教師一致)',
        example: 456
      },
      reserve_date: {
        type: 'string',
        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
        description: '預約日期 (必填，格式：YYYY-MM-DD，不能是過去日期)',
        example: '2025-09-25'
      },
      reserve_time: {
        type: 'string',
        pattern: '^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$',
        description: '預約時間 (必填，格式：HH:mm，必須是教師可預約時段)',
        example: '14:00'
      }
    }
  },

  // === 回應資料 Schema ===

  // 課程基本資訊 Schema (預約中的課程資料)
  ReservationCourseInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '課程 ID',
        example: 123
      },
      name: {
        type: 'string',
        description: '課程名稱',
        example: 'JavaScript 基礎教學'
      },
      teacher: {
        type: 'object',
        description: '授課教師資訊',
        properties: {
          user: {
            type: 'object',
            description: '教師使用者資料',
            properties: {
              nick_name: {
                type: 'string',
                description: '教師暱稱',
                example: '張教授'
              },
              avatar_image: {
                type: 'string',
                nullable: true,
                description: '教師頭像 URL',
                example: 'https://example.com/avatar.jpg'
              }
            }
          }
        }
      }
    }
  },

  // 參與者資訊 Schema
  ReservationParticipantInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '參與者 ID',
        example: 789
      },
      nick_name: {
        type: 'string',
        description: '參與者暱稱',
        example: '學生小明'
      },
      role: {
        type: 'string',
        enum: ['student', 'teacher'],
        description: '參與者角色',
        example: 'student'
      },
      avatar_image: {
        type: 'string',
        nullable: true,
        description: '參與者頭像 URL',
        example: 'https://example.com/student-avatar.jpg'
      }
    }
  },

  // 預約詳細資訊 Schema
  ReservationDetail: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '預約 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '預約 UUID',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      course_id: {
        type: 'integer',
        description: '課程 ID',
        example: 123
      },
      teacher_id: {
        type: 'integer',
        description: '教師 ID',
        example: 456
      },
      student_id: {
        type: 'integer',
        description: '學生 ID',
        example: 789
      },
      reserve_time: {
        type: 'string',
        format: 'date-time',
        description: '預約上課時間',
        example: '2025-09-25T14:00:00.000Z'
      },
      teacher_status: {
        type: 'string',
        enum: ['pending', 'reserved', 'completed', 'cancelled'],
        description: '教師端預約狀態',
        example: 'reserved'
      },
      student_status: {
        type: 'string',
        enum: ['pending', 'reserved', 'completed', 'cancelled'],
        description: '學生端預約狀態',
        example: 'reserved'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '預約建立時間',
        example: '2025-09-23T10:30:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: '預約更新時間',
        example: '2025-09-23T10:30:00.000Z'
      },
      response_deadline: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '教師回應期限（僅限 pending 狀態）',
        example: '2025-09-24T02:00:00.000Z'
      },
      course: {
        $ref: '#/components/schemas/ReservationCourseInfo',
        description: '課程詳細資訊 (選擇性提供)'
      },
      participant: {
        $ref: '#/components/schemas/ReservationParticipantInfo',
        description: '參與者資訊 (根據角色顯示對方資料)'
      }
    }
  },

  // 剩餘堂數資訊 Schema
  RemainingLessonsInfo: {
    type: 'object',
    properties: {
      total: {
        type: 'integer',
        description: '總堂數',
        example: 10
      },
      used: {
        type: 'integer',
        description: '已使用堂數',
        example: 3
      },
      remaining: {
        type: 'integer',
        description: '剩餘堂數',
        example: 7
      }
    }
  },

  // === 成功回應 Schema ===
  
  // 建立預約回應介面 Schema (對應 CreateReservationResponse interface)
  CreateReservationResponse: {
    type: 'object',
    properties: {
      reservation: {
        $ref: '#/components/schemas/ReservationDetail'
      },
      remaining_lessons: {
        $ref: '#/components/schemas/RemainingLessonsInfo'
      }
    }
  },

  // 更新預約狀態回應介面 Schema (對應 UpdateReservationStatusResponse interface)
  UpdateReservationStatusResponse: {
    type: 'object',
    properties: {
      reservation: {
        $ref: '#/components/schemas/ReservationDetail'
      },
      is_fully_completed: {
        type: 'boolean',
        description: '是否完全完成 (雙方都確認完成)',
        example: false
      }
    }
  },

  // 取消預約回應介面 Schema (對應 CancelReservationResponse interface)
  CancelReservationResponse: {
    type: 'object',
    properties: {
      reservation: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '預約 ID',
            example: 1
          },
          uuid: {
            type: 'string',
            format: 'uuid',
            description: '預約 UUID',
            example: '550e8400-e29b-41d4-a716-446655440000'
          },
          teacher_status: {
            type: 'string',
            enum: ['pending', 'reserved', 'completed', 'cancelled'],
            description: '教師端預約狀態',
            example: 'cancelled'
          },
          student_status: {
            type: 'string',
            enum: ['pending', 'reserved', 'completed', 'cancelled'],
            description: '學生端預約狀態',
            example: 'cancelled'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: '預約更新時間',
            example: '2025-09-23T15:30:00.000Z'
          }
        }
      },
      refunded_lessons: {
        type: 'integer',
        description: '退還的課程堂數',
        example: 1
      }
    }
  },

  // 建立預約成功回應 Schema
  CreateReservationSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '預約建立成功'
      },
      data: {
        $ref: '#/components/schemas/CreateReservationResponse'
      }
    }
  },

  // === 錯誤回應 Schema (使用共用 Schema 並提供特定範例) ===
  
  // 預約驗證錯誤回應
  ReservationValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '預約參數驗證失敗'
          },
          errors: {
            example: {
              course_id: ['課程 ID 為必填欄位'],
              reserve_date: ['預約日期格式不正確'],
              reserve_time: ['預約時間格式不正確']
            }
          }
        }
      }
    ]
  },

  // 預約未授權錯誤
  ReservationUnauthorizedErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/UnauthorizedErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: 'Access token 為必填欄位'
          }
        }
      }
    ]
  },

  // 預約業務邏輯錯誤
  ReservationBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程已售完或剩餘堂數不足'
          }
        }
      }
    ]
  },

  // 預約資源不存在錯誤
  ReservationNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程不存在或已下架'
          }
        }
      }
    ]
  },

  // === 預約列表相關 Schema ===

  // 分頁資訊 Schema
  PaginationInfo: {
    type: 'object',
    properties: {
      current_page: {
        type: 'integer',
        description: '當前頁數',
        example: 1
      },
      per_page: {
        type: 'integer',
        description: '每頁筆數',
        example: 10
      },
      total: {
        type: 'integer',
        description: '總記錄數',
        example: 50
      },
      total_pages: {
        type: 'integer',
        description: '總頁數',
        example: 5
      }
    }
  },

  // 預約列表成功回應 Schema
  ReservationListSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '預約列表查詢成功'
      },
      data: {
        type: 'object',
        description: '預約列表資料',
        properties: {
          reservations: {
            type: 'array',
            description: '預約記錄列表',
            items: {
              $ref: '#/components/schemas/ReservationDetail'
            }
          },
          pagination: {
            $ref: '#/components/schemas/PaginationInfo',
            description: '分頁資訊'
          }
        }
      }
    }
  },

  // === 取消預約相關 Schema ===

  // 取消後預約資訊 Schema
  CancelledReservationInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '預約 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '預約 UUID',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      teacher_status: {
        type: 'string',
        enum: ['cancelled'],
        description: '教師端預約狀態（已取消）',
        example: 'cancelled'
      },
      student_status: {
        type: 'string',
        enum: ['cancelled'],
        description: '學生端預約狀態（已取消）',
        example: 'cancelled'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: '預約更新時間',
        example: '2025-09-23T15:30:00.000Z'
      }
    }
  },

  // 取消預約成功回應 Schema
  CancelReservationSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '預約已取消'
      },
      data: {
        type: 'object',
        description: '取消預約結果資料',
        properties: {
          reservation: {
            $ref: '#/components/schemas/CancelledReservationInfo',
            description: '已取消的預約資訊'
          },
          refunded_lessons: {
            type: 'integer',
            description: '退還的課程堂數',
            example: 1
          }
        }
      }
    }
  },

  // === 教師預約確認/拒絕相關 Schema ===

  // 教師拒絕預約請求 Schema
  RejectReservationRequest: {
    type: 'object',
    properties: {
      reason: {
        type: 'string',
        maxLength: 500,
        description: '拒絕預約的原因 (可選，最多500字元)',
        example: '該時段已有其他安排，無法進行課程'
      }
    }
  },

    // 教師確認預約成功回應 Schema
  ConfirmReservationSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '預約確認成功'
      },
      data: {
        $ref: '#/components/schemas/ReservationDetail'
      }
    }
  },

  // 教師拒絕預約成功回應 Schema
  RejectReservationSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '預約已拒絕'
      },
      data: {
        $ref: '#/components/schemas/ReservationDetail',
        description: '拒絕後的預約詳細資訊'
      }
    }
  },

  // 預約狀態無效錯誤回應 Schema
  ReservationStatusInvalidErrorResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['error'],
        example: 'error'
      },
      message: {
        type: 'string',
        description: '錯誤訊息',
        example: '預約狀態無效，只有待確認的預約可以被確認'
      }
    }
  },

  // 預約過期錯誤回應 Schema
  ReservationExpiredErrorResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        enum: ['error'],
        example: 'error'
      },
      message: {
        type: 'string',
        description: '錯誤訊息',
        example: '預約已過期，無法確認'
      }
    }
  }
}