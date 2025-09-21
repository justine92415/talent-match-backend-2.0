/**
 * 訂單模組 Swagger Schema
 * 基於實際 OrderController 實作定義
 */

export const orderSchemas = {
  // 建立訂單請求 Schema
  CreateOrderRequest: {
    type: 'object',
    required: ['cart_item_ids', 'purchase_way', 'buyer_name', 'buyer_phone', 'buyer_email'],
    properties: {
      cart_item_ids: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 1
        },
        minItems: 1,
        description: '要結帳的購物車項目 ID 陣列（必填，至少包含一項）',
        example: [1, 2, 3]
      },
      purchase_way: {
        type: 'string',
        enum: ['line_pay', 'credit_card', 'bank_transfer'],
        description: '付款方式（必填）- line_pay: LINE Pay, credit_card: 信用卡, bank_transfer: 銀行轉帳',
        example: 'credit_card'
      },
      buyer_name: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '購買者姓名（必填，最多50字元）',
        example: '王小明'
      },
      buyer_phone: {
        type: 'string',
        pattern: '^09\\d{8}$',
        description: '購買者手機號碼（必填，格式：09開頭的10位數字）',
        example: '0912345678'
      },
      buyer_email: {
        type: 'string',
        format: 'email',
        maxLength: 255,
        description: '購買者電子信箱（必填，用於接收訂單通知）',
        example: 'buyer@example.com'
      }
    }
  },

  // 建立訂單成功回應
  CreateOrderSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態（固定為 success）',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '訂單建立成功'
      },
      data: {
        type: 'object',
        description: '建立的訂單完整資料（包含訂單基本資料和訂單項目清單）',
        properties: {
          order: {
            type: 'object',
            description: '訂單基本資料',
            properties: {
              id: { type: 'integer', description: '訂單ID', example: 123 },
              uuid: { type: 'string', description: '訂單UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              buyer_id: { type: 'integer', description: '購買者用戶ID', example: 456 },
              status: { 
                type: 'string', 
                enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
                description: '訂單狀態',
                example: 'pending'
              },
              purchase_way: { 
                type: 'string', 
                enum: ['line_pay', 'credit_card', 'bank_transfer'],
                description: '付款方式',
                example: 'credit_card'
              },
              buyer_name: { type: 'string', description: '購買者姓名', example: '王小明' },
              buyer_phone: { type: 'string', description: '購買者手機', example: '0912345678' },
              buyer_email: { type: 'string', description: '購買者信箱', example: 'buyer@example.com' },
              total_amount: { type: 'number', description: '訂單總金額', example: 2500 },
              payment_status: { 
                type: 'string', 
                enum: ['pending', 'paid', 'failed', 'refunded'], 
                description: '付款狀態',
                example: 'pending'
              },
              paid_at: { 
                type: 'string', 
                format: 'date-time', 
                nullable: true, 
                description: '付款時間',
                example: null
              },
              created_at: { 
                type: 'string', 
                format: 'date-time', 
                description: '建立時間',
                example: '2025-09-21T10:30:00.000Z'
              },
              updated_at: { 
                type: 'string', 
                format: 'date-time', 
                description: '更新時間',
                example: '2025-09-21T10:30:00.000Z'
              }
            }
          },
          order_items: {
            type: 'array',
            description: '訂單項目清單',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', description: '訂單項目ID', example: 789 },
                uuid: { type: 'string', description: '訂單項目UUID', example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012' },
                order_id: { type: 'integer', description: '所屬訂單ID', example: 123 },
                course_id: { type: 'integer', description: '課程ID', example: 10 },
                price_option_id: { type: 'integer', description: '價格選項ID', example: 25 },
                quantity: { type: 'integer', description: '購買數量', example: 1 },
                unit_price: { type: 'number', description: '單價', example: 1500 },
                total_price: { type: 'number', description: '小計', example: 1500 },
                created_at: { 
                  type: 'string', 
                  format: 'date-time', 
                  description: '建立時間',
                  example: '2025-09-21T10:30:00.000Z'
                },
                updated_at: { 
                  type: 'string', 
                  format: 'date-time', 
                  description: '更新時間',
                  example: '2025-09-21T10:30:00.000Z'
                },
                course: {
                  type: 'object',
                  description: '課程資料',
                  properties: {
                    id: { type: 'integer', description: '課程ID', example: 10 },
                    uuid: { type: 'string', description: '課程UUID', example: 'c3d4e5f6-g7h8-9012-cdef-345678901234' },
                    name: { type: 'string', description: '課程名稱', example: 'Python 程式設計入門' },
                    main_image: { 
                      type: 'string', 
                      nullable: true,
                      description: '課程主圖片URL',
                      example: 'https://example.com/course-image.jpg'
                    },
                    teacher: {
                      type: 'object',
                      description: '授課老師資訊',
                      properties: {
                        user: {
                          type: 'object',
                          properties: {
                            nick_name: { 
                              type: 'string', 
                              description: '老師暱稱',
                              example: '李老師'
                            }
                          }
                        }
                      }
                    }
                  }
                },
                price_option: {
                  type: 'object',
                  description: '價格選項資料',
                  properties: {
                    id: { type: 'integer', description: '價格選項ID', example: 25 },
                    uuid: { type: 'string', description: '價格選項UUID', example: 'd4e5f6g7-h8i9-0123-defg-456789012345' },
                    price: { type: 'number', description: '價格', example: 1500 },
                    quantity: { type: 'integer', description: '可購買數量', example: 50 }
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  // 訂單詳情成功回應
  OrderDetailSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態（固定為 success）',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '取得訂單詳情成功'
      },
      data: {
        type: 'object',
        description: '訂單詳情資料（包含訂單基本資料和訂單項目清單）',
        allOf: [
          {
            type: 'object',
            description: '訂單基本資料',
            properties: {
              id: { type: 'integer', description: '訂單ID', example: 123 },
              uuid: { type: 'string', description: '訂單UUID', example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' },
              buyer_id: { type: 'integer', description: '購買者用戶ID', example: 456 },
              status: { 
                type: 'string', 
                enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
                description: '訂單狀態',
                example: 'pending'
              },
              purchase_way: { 
                type: 'string', 
                enum: ['line_pay', 'credit_card', 'bank_transfer'],
                description: '付款方式',
                example: 'credit_card'
              },
              buyer_name: { type: 'string', description: '購買者姓名', example: '王小明' },
              buyer_phone: { type: 'string', description: '購買者手機', example: '0912345678' },
              buyer_email: { type: 'string', description: '購買者信箱', example: 'buyer@example.com' },
              total_amount: { type: 'number', description: '訂單總金額', example: 2500 },
              payment_status: { 
                type: 'string', 
                enum: ['pending', 'paid', 'failed', 'refunded'], 
                description: '付款狀態',
                example: 'pending'
              },
              paid_at: { 
                type: 'string', 
                format: 'date-time', 
                nullable: true, 
                description: '付款時間',
                example: null
              },
              created_at: { 
                type: 'string', 
                format: 'date-time', 
                description: '建立時間',
                example: '2025-09-21T10:30:00.000Z'
              },
              updated_at: { 
                type: 'string', 
                format: 'date-time', 
                description: '更新時間',
                example: '2025-09-21T10:30:00.000Z'
              }
            }
          },
          {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                description: '訂單項目清單',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', description: '訂單項目ID', example: 789 },
                    uuid: { type: 'string', description: '訂單項目UUID', example: 'b2c3d4e5-f6g7-8901-bcde-f23456789012' },
                    order_id: { type: 'integer', description: '所屬訂單ID', example: 123 },
                    course_id: { type: 'integer', description: '課程ID', example: 10 },
                    price_option_id: { type: 'integer', description: '價格選項ID', example: 25 },
                    quantity: { type: 'integer', description: '購買數量', example: 1 },
                    unit_price: { type: 'number', description: '單價', example: 1500 },
                    total_price: { type: 'number', description: '小計', example: 1500 },
                    created_at: { 
                      type: 'string', 
                      format: 'date-time', 
                      description: '建立時間',
                      example: '2025-09-21T10:30:00.000Z'
                    },
                    updated_at: { 
                      type: 'string', 
                      format: 'date-time', 
                      description: '更新時間',
                      example: '2025-09-21T10:30:00.000Z'
                    },
                    course: {
                      type: 'object',
                      description: '課程資料',
                      properties: {
                        id: { type: 'integer', description: '課程ID', example: 10 },
                        uuid: { type: 'string', description: '課程UUID', example: 'c3d4e5f6-g7h8-9012-cdef-345678901234' },
                        name: { type: 'string', description: '課程名稱', example: 'Python 程式設計入門' },
                        main_image: { 
                          type: 'string', 
                          nullable: true,
                          description: '課程主圖片URL',
                          example: 'https://example.com/course-image.jpg'
                        },
                        teacher: {
                          type: 'object',
                          description: '授課老師資訊',
                          properties: {
                            user: {
                              type: 'object',
                              properties: {
                                nick_name: { 
                                  type: 'string', 
                                  description: '老師暱稱',
                                  example: '李老師'
                                }
                              }
                            }
                          }
                        }
                      }
                    },
                    price_option: {
                      type: 'object',
                      description: '價格選項資料',
                      properties: {
                        id: { type: 'integer', description: '價格選項ID', example: 25 },
                        uuid: { type: 'string', description: '價格選項UUID', example: 'd4e5f6g7-h8i9-0123-defg-456789012345' },
                        price: { type: 'number', description: '價格', example: 1500 },
                        quantity: { type: 'integer', description: '可購買數量', example: 50 }
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  },

  // 訂單驗證錯誤回應
  OrderValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '訂單參數驗證失敗'
          },
          errors: {
            example: {
              cart_item_ids: ['請選擇要結帳的購物車項目'],
              buyer_name: ['購買者姓名不可為空'],
              buyer_phone: ['手機號碼格式不正確'],
              buyer_email: ['電子信箱格式不正確']
            }
          }
        }
      }
    ]
  },

  // 訂單業務邏輯錯誤回應
  OrderBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '購物車項目不存在或已被移除'
          }
        }
      }
    ]
  }
}