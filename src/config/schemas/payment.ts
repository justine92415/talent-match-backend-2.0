/**
 * 付款相關 Swagger Schema
 * 基於實際 PaymentController 和 PaymentService 實作
 */

export const paymentSchemas = {
  // === 回應資料 Schema ===

  // 綠界付款表單資料
  EcpayFormData: {
    type: 'object',
    properties: {
      MerchantID: {
        type: 'string',
        description: '綠界商店代號',
        example: '2000132'
      },
      MerchantTradeNo: {
        type: 'string',
        description: '商店訂單編號',
        example: 'ORDER1642681234001'
      },
      MerchantTradeDate: {
        type: 'string',
        description: '商店交易時間',
        example: '2024/01/20 15:30:20'
      },
      PaymentType: {
        type: 'string',
        description: '交易類型',
        example: 'aio'
      },
      TotalAmount: {
        type: 'string',
        description: '交易金額',
        example: '2400'
      },
      TradeDesc: {
        type: 'string',
        description: '交易描述',
        example: '線上課程購買'
      },
      ItemName: {
        type: 'string',
        description: '商品名稱',
        example: '線上課程'
      },
      ReturnURL: {
        type: 'string',
        description: '付款完成返回商店網址',
        example: 'https://yourdomain.com/api/payments/ecpay/callback'
      },
      ChoosePayment: {
        type: 'string',
        description: '付款方式',
        example: 'ALL'
      },
      EncryptType: {
        type: 'string',
        description: '加密類型',
        example: '1'
      },
      CheckMacValue: {
        type: 'string',
        description: '檢查碼',
        example: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6'
      }
    }
  },

  // 付款資訊
  PaymentInfo: {
    type: 'object',
    properties: {
      trade_no: {
        type: 'string',
        nullable: true,
        description: '綠界交易編號',
        example: '202401201530001234'
      },
      payment_date: {
        type: 'string',
        nullable: true,
        description: '付款時間',
        example: '2024/01/20 15:35:20'
      },
      payment_type: {
        type: 'string',
        nullable: true,
        description: '付款方式',
        example: 'Credit_CreditCard'
      },
      bank_code: {
        type: 'string',
        nullable: true,
        description: 'ATM 銀行代碼',
        example: '808'
      },
      v_account: {
        type: 'string',
        nullable: true,
        description: 'ATM 虛擬帳號',
        example: '31310912345678'
      },
      expire_date: {
        type: 'string',
        nullable: true,
        description: '繳費期限',
        example: '2024/01/23'
      }
    }
  },

  // === 成功回應 Schema ===

  // 建立付款連結成功回應
  CreatePaymentSuccessResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/SuccessResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            description: '成功訊息',
            example: '付款連結建立成功'
          },
          data: {
            type: 'object',
            properties: {
              payment_url: {
                type: 'string',
                description: '綠界付款頁面網址',
                example: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
              },
              form_data: {
                $ref: '#/components/schemas/EcpayFormData',
                description: '需要自動提交到綠界的表單資料'
              },
              merchant_trade_no: {
                type: 'string',
                description: '商店訂單編號',
                example: 'ORDER1642681234001'
              },
              total_amount: {
                type: 'number',
                multipleOf: 0.01,
                description: '訂單總金額',
                example: 2400
              },
              html_form: {
                type: 'string',
                description: '綠界官方 SDK 生成的 HTML 表單 (可直接在前端使用)',
                example: '<form id="ecpayForm" method="post" target="_self" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5">...</form>'
              }
            }
          }
        }
      }
    ]
  },

  // 付款狀態查詢成功回應
  PaymentStatusSuccessResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/SuccessResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            description: '成功訊息',
            example: '付款狀態查詢成功'
          },
          data: {
            type: 'object',
            properties: {
              payment_status: {
                type: 'string',
                enum: ['pending', 'processing', 'completed', 'failed', 'expired'],
                description: '付款狀態',
                example: 'completed'
              },
              merchant_trade_no: {
                type: 'string',
                nullable: true,
                description: '商店訂單編號',
                example: 'ORDER1642681234001'
              },
              actual_payment_method: {
                type: 'string',
                nullable: true,
                description: '實際使用的付款方式',
                example: '信用卡'
              },
              paid_at: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                description: '付款完成時間',
                example: '2024-01-20T15:35:20.000Z'
              },
              payment_info: {
                $ref: '#/components/schemas/PaymentInfo',
                nullable: true,
                description: '付款相關資訊 (如 ATM 虛擬帳號等)'
              }
            }
          }
        }
      }
    ]
  },

  // === 錯誤回應 Schema ===

  // 付款驗證錯誤回應
  PaymentValidationErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/ValidationErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            example: '付款請求參數驗證失敗'
          },
          errors: {
            example: {
              orderId: ['訂單 ID 必須是正整數']
            }
          }
        }
      }
    ]
  },

  // 付款業務邏輯錯誤回應
  PaymentBusinessErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/BusinessErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            example: '訂單已付款或無效'
          }
        }
      }
    ]
  }
}