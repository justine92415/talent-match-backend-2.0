/**
 * 購買記錄相關 Schema
 * 基於實際 PurchaseController 和 PurchaseService 實作
 */

export const purchaseSchemas = {
  // === 請求參數 Schema ===
  
  // 查詢參數 Schema
  PurchaseListQueryParams: {
    type: 'object',
    properties: {
      course_id: {
        type: 'integer',
        description: '課程 ID (選填，用於篩選特定課程的購買記錄)',
        example: 123
      }
    }
  },

  // === 回應資料 Schema ===

  // 課程基本資料 Schema (購買記錄中的課程資訊)
  PurchaseCourseInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '課程 ID',
        example: 123
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '課程 UUID',
        example: '550e8400-e29b-41d4-a716-446655440001'
      },
      name: {
        type: 'string',
        description: '課程名稱',
        example: 'JavaScript 基礎教學'
      },
      main_image: {
        type: 'string',
        nullable: true,
        description: '課程主圖 URL',
        example: 'https://example.com/course-image.jpg'
      },
      teacher: {
        type: 'object',
        description: '授課教師資訊',
        properties: {
          id: {
            type: 'integer',
            description: '教師 ID',
            example: 456
          },
          user: {
            type: 'object',
            description: '教師使用者資料',
            properties: {
              name: {
                type: 'string',
                description: '教師真實姓名',
                example: '張老師'
              },
              nick_name: {
                type: 'string',
                description: '教師暱稱',
                example: '張教授'
              }
            }
          }
        }
      }
    }
  },

  // 訂單基本資料 Schema (購買記錄中的訂單資訊)
  PurchaseOrderInfo: {
    type: 'object',
    nullable: true,
    properties: {
      id: {
        type: 'integer',
        description: '訂單 ID',
        example: 789
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '訂單 UUID',
        example: '550e8400-e29b-41d4-a716-446655440002'
      },
      total_amount: {
        type: 'number',
        description: '訂單總金額',
        example: 1500.00
      },
      paid_at: {
        type: 'string',
        format: 'date-time',
        description: '付款完成時間',
        example: '2024-01-15T10:30:00.000Z'
      }
    }
  },

  // 單筆購買記錄詳細資料 Schema
  PurchaseRecordDetail: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '購買記錄 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '購買記錄 UUID',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      user_id: {
        type: 'integer',
        description: '使用者 ID',
        example: 1
      },
      course_id: {
        type: 'integer',
        description: '課程 ID',
        example: 123
      },
      order_id: {
        type: 'integer',
        description: '訂單 ID',
        example: 789
      },
      quantity_total: {
        type: 'integer',
        description: '購買總堂數',
        example: 10
      },
      quantity_used: {
        type: 'integer',
        description: '已使用堂數',
        example: 3
      },
      quantity_remaining: {
        type: 'integer',
        description: '剩餘堂數',
        example: 7
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '購買記錄建立時間',
        example: '2024-01-15T10:30:00.000Z'
      },
      course: {
        $ref: '#/components/schemas/PurchaseCourseInfo'
      },
      order: {
        $ref: '#/components/schemas/PurchaseOrderInfo'
      }
    }
  },

  // === 成功回應 Schema ===
  
  // 購買記錄列表成功回應 Schema
  PurchaseListSuccessResponse: {
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
        example: '取得購買記錄成功'
      },
      data: {
        type: 'object',
        description: '購買記錄資料',
        properties: {
          purchases: {
            type: 'array',
            description: '購買記錄列表',
            items: {
              $ref: '#/components/schemas/PurchaseRecordDetail'
            }
          }
        }
      }
    }
  },

  // === 錯誤回應 Schema (使用共用 Schema 並提供特定範例) ===
  
  // 購買記錄未授權錯誤
  PurchaseUnauthorizedErrorResponse: {
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

  // 購買記錄業務邏輯錯誤
  PurchaseBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '查詢參數錯誤'
          }
        }
      }
    ]
  }
}