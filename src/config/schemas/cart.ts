/**
 * 購物車相關 Swagger Schema
 * 基於實際 CartController 和 CartService 實作
 */

export const cartSchemas = {
  // === 請求 Schema ===
  
  // 加入購物車請求
  AddCartItemRequest: {
    type: 'object',
    required: ['course_id', 'price_option_id'],
    properties: {
      course_id: {
        type: 'integer',
        minimum: 1,
        description: '課程 ID (必填，必須是已發布的課程)',
        example: 1
      },
      price_option_id: {
        type: 'integer',
        minimum: 1,
        description: '價格方案 ID (必填，必須屬於指定課程)',
        example: 1
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 999,
        description: '購買數量 (選填，預設為 1，範圍 1-999)',
        example: 1
      }
    }
  },

  // 更新購物車項目請求
  UpdateCartItemRequest: {
    type: 'object',
    required: ['quantity'],
    properties: {
      quantity: {
        type: 'integer',
        minimum: 1,
        maximum: 999,
        description: '更新後的購買數量 (必填，範圍 1-999)',
        example: 2
      }
    }
  },

  // === 回應資料 Schema ===
  
  // 課程基本資料 (購物車項目中使用)
  CartCourseInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '課程 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '課程 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      name: {
        type: 'string',
        description: '課程名稱',
        example: 'JavaScript 基礎程式設計'
      },
      main_image: {
        type: 'string',
        nullable: true,
        description: '課程主圖 URL',
        example: 'https://example.com/image.jpg'
      },
      status: {
        type: 'string',
        description: '課程狀態',
        example: 'published'
      },
      teacher: {
        type: 'object',
        description: '授課教師資料',
        properties: {
          id: {
            type: 'integer',
            description: '教師 ID',
            example: 1
          },
          user: {
            type: 'object',
            description: '教師使用者資料',
            properties: {
              name: {
                type: 'string',
                description: '教師真實姓名',
                example: '王老師'
              },
              nick_name: {
                type: 'string',
                description: '教師暱稱',
                example: '程式設計王老師'
              }
            }
          }
        }
      }
    }
  },

  // 價格方案基本資料 (購物車項目中使用)
  CartPriceOptionInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '價格方案 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '價格方案 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      price: {
        type: 'number',
        multipleOf: 0.01,
        description: '方案價格 (單位：新台幣)',
        example: 1200.00
      },
      quantity: {
        type: 'integer',
        description: '方案包含的課程數量或時數',
        example: 10
      }
    }
  },

  // 購物車項目完整資料
  CartItemWithDetails: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '購物車項目 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '購物車項目 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      user_id: {
        type: 'integer',
        description: '使用者 ID',
        example: 1
      },
      course_id: {
        type: 'integer',
        description: '課程 ID',
        example: 1
      },
      price_option_id: {
        type: 'integer',
        description: '價格方案 ID',
        example: 1
      },
      quantity: {
        type: 'integer',
        description: '購買數量',
        example: 1
      },
      is_valid: {
        type: 'boolean',
        description: '項目是否有效 (課程和價格方案是否存在且可購買)',
        example: true
      },
      invalid_reason: {
        type: 'string',
        nullable: true,
        description: '項目無效的原因 (當 is_valid 為 false 時)',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '加入購物車時間',
        example: '2024-01-15T10:30:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: '最後更新時間',
        example: '2024-01-15T10:35:00.000Z'
      },
      course: {
        $ref: '#/components/schemas/CartCourseInfo',
        nullable: true,
        description: '關聯課程資料 (若課程不存在則為 null)'
      },
      price_option: {
        $ref: '#/components/schemas/CartPriceOptionInfo',
        nullable: true,
        description: '關聯價格方案資料 (若方案不存在則為 null)'
      }
    }
  },

  // 購物車摘要資料
  CartSummary: {
    type: 'object',
    properties: {
      total_items: {
        type: 'integer',
        description: '購物車總商品數量 (所有項目的 quantity 總和)',
        example: 3
      },
      total_amount: {
        type: 'number',
        multipleOf: 0.01,
        description: '購物車總金額 (僅計算有效項目，單位：新台幣)',
        example: 2400.00
      },
      valid_items: {
        type: 'integer',
        description: '有效項目數量 (可正常購買的項目)',
        example: 2
      },
      invalid_items: {
        type: 'integer',
        description: '無效項目數量 (課程下架或價格方案不存在等)',
        example: 0
      }
    }
  },

  // 購物車完整回應資料
  CartData: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/CartItemWithDetails'
        },
        description: '購物車項目列表'
      },
      summary: {
        $ref: '#/components/schemas/CartSummary',
        description: '購物車摘要統計'
      }
    }
  },

  // === 成功回應 Schema ===

  // 加入購物車成功回應
  AddCartItemSuccessResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/SuccessResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            description: '成功訊息',
            example: '課程已加入購物車'
          },
          data: {
            $ref: '#/components/schemas/CartItemWithDetails',
            description: '加入的購物車項目資料'
          }
        }
      }
    ]
  },

  // 更新購物車成功回應 (更新現有項目)
  UpdateCartItemSuccessResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/SuccessResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            description: '成功訊息',
            example: '購物車項目已更新'
          },
          data: {
            $ref: '#/components/schemas/CartItemWithDetails',
            description: '更新後的購物車項目資料'
          }
        }
      }
    ]
  },

  // 取得購物車成功回應
  GetCartSuccessResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/SuccessResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            description: '成功訊息',
            example: '取得購物車內容成功'
          },
          data: {
            $ref: '#/components/schemas/CartData',
            description: '購物車完整資料'
          }
        }
      }
    ]
  },

  // 刪除購物車項目成功回應
  RemoveCartItemSuccessResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/SuccessResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            description: '成功訊息',
            example: '商品已從購物車移除'
          },
          data: {
            nullable: true,
            description: '此 API 無回傳資料',
            example: null
          }
        }
      }
    ]
  },

  // 清空購物車成功回應
  ClearCartSuccessResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/SuccessResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            description: '成功訊息',
            example: '購物車已清空'
          },
          data: {
            nullable: true,
            description: '此 API 無回傳資料',
            example: null
          }
        }
      }
    ]
  },

  // === 錯誤回應 Schema ===

  // 購物車驗證錯誤回應
  CartValidationErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/ValidationErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            example: '購物車請求參數驗證失敗'
          },
          errors: {
            example: {
              course_id: ['課程 ID 必須是正整數'],
              quantity: ['數量必須大於 0 且不超過 999']
            }
          }
        }
      }
    ]
  },

  // 購物車業務邏輯錯誤回應
  CartBusinessErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/BusinessErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            example: '課程不存在或未發布'
          }
        }
      }
    ]
  },

  // 購物車項目不存在錯誤回應
  CartItemNotFoundErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/NotFoundErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            example: '購物車項目不存在'
          }
        }
      }
    ]
  },

  // 購物車存取權限錯誤回應
  CartAccessForbiddenErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/ForbiddenErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            example: '無權存取此購物車項目'
          }
        }
      }
    ]
  }
}