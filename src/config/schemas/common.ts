/**
 * 共用基礎 Schema
 * 僅包含目前 Auth API 實際需要的共用 Schema
 */

export const commonSchemas = {
  // === 標準化成功回應 Schema ===
  
  // 基本成功回應 Schema
  SuccessResponse: {
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
        example: '操作成功'
      },
      data: {
        description: '回傳資料',
        example: null
      }
    }
  },

  // 使用者基本資料 Schema（Auth API 實際使用）
  UserProfile: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '使用者 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '使用者 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      google_id: {
        type: 'string',
        nullable: true,
        description: 'Google ID (第三方登入)',
        example: null
      },
      name: {
        type: 'string',
        nullable: true,
        description: '真實姓名',
        example: null
      },
      nick_name: {
        type: 'string',
        description: '暱稱',
        example: '王小明'
      },
      email: {
        type: 'string',
        format: 'email',
        description: '電子郵件',
        example: 'user@example.com'
      },
      birthday: {
        type: 'string',
        format: 'date',
        nullable: true,
        description: '生日',
        example: null
      },
      contact_phone: {
        type: 'string',
        nullable: true,
        description: '聯絡電話',
        example: null
      },
      avatar_image: {
        type: 'string',
        nullable: true,
        description: '頭像圖片 URL',
        example: null
      },
      avatar_google_url: {
        type: 'string',
        nullable: true,
        description: 'Google 頭像 URL',
        example: null
      },
      account_status: {
        type: 'string',
        description: '帳號狀態',
        example: 'active'
      },
      last_login_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '最後登入時間',
        example: null
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '建立時間',
        example: '2024-01-15T10:30:00.000Z'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: '更新時間',
        example: '2024-01-15T10:30:00.000Z'
      },
      deleted_at: {
        type: 'string',
        format: 'date-time',
        nullable: true,
        description: '刪除時間 (軟刪除)',
        example: null
      }
    }
  },

  // === 標準化錯誤回應 Schema ===
  
  // 400 驗證錯誤回應 (包含詳細錯誤欄位)
  ValidationErrorResponse: {
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
        example: '參數驗證失敗'
      },
      errors: {
        type: 'object',
        description: '詳細驗證錯誤資訊',
        additionalProperties: {
          type: 'array',
          items: {
            type: 'string'
          }
        },
        example: {
          email: ['電子郵件格式不正確'],
          password: ['密碼必須至少8字元']
        }
      }
    }
  },

  // 401 未授權錯誤
  UnauthorizedErrorResponse: {
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
        example: 'Token 無效'
      }
    }
  },

  // 403 禁止存取錯誤
  ForbiddenErrorResponse: {
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
        example: '權限不足'
      }
    }
  },

  // 404 資源不存在錯誤
  NotFoundErrorResponse: {
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
        example: '使用者不存在'
      }
    }
  },

  // 409 業務邏輯錯誤
  BusinessErrorResponse: {
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
        example: '電子郵件已被使用'
      }
    }
  },

  // 系統錯誤回應 Schema（Auth API 實際使用）
  ServerErrorResponse: {
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
        example: '系統錯誤，請稍後再試'
      }
    }
  },

  // 通用錯誤回應 Schema (向後相容)
  ErrorResponse: {
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
        example: '操作失敗'
      }
    }
  }
}