/**
 * 認證相關 Swagger Schema 定義
 */

export const AuthSchema = {
  // 請求模型
  RegisterRequest: {
    type: 'object',
    required: ['nick_name', 'email', 'password'],
    properties: {
      nick_name: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '使用者暱稱',
        example: '王小明'
      },
      email: {
        type: 'string',
        format: 'email',
        maxLength: 255,
        description: '電子郵件地址',
        example: 'student@example.com'
      },
      password: {
        type: 'string',
        minLength: 8,
        description: '密碼（至少8字元，需包含中英文）',
        example: 'password123'
      }
    },
    example: {
      nick_name: '王小明',
      email: 'student@example.com',
      password: 'password123'
    }
  },

  // 回應模型
  RegisterResponse: {
    type: 'object',
    required: ['status', 'message', 'data'],
    properties: {
      status: {
        type: 'string',
        enum: ['success'],
        description: '回應狀態'
      },
      message: {
        type: 'string',
        description: '回應訊息',
        example: '註冊成功'
      },
      data: {
        type: 'object',
        required: ['user', 'access_token', 'refresh_token', 'token_type', 'expires_in'],
        properties: {
          user: { $ref: '#/components/schemas/UserProfile' },
          access_token: {
            type: 'string',
            description: '存取權杖',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refresh_token: {
            type: 'string',
            description: '刷新權杖',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          token_type: {
            type: 'string',
            enum: ['Bearer'],
            description: '權杖類型'
          },
          expires_in: {
            type: 'integer',
            description: '權杖過期時間（秒）',
            example: 3600
          }
        }
      }
    },
    example: {
      status: 'success',
      message: '註冊成功',
      data: {
        user: {
          id: 1,
          uuid: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          nick_name: '王小明',
          email: 'student@example.com',
          role: 'student',
          account_status: 'active',
          created_at: '2024-01-15T10:30:00Z'
        },
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        expires_in: 3600
      }
    }
  },

  // 使用者資料模型
  UserProfile: {
    type: 'object',
    required: ['id', 'uuid', 'nick_name', 'email', 'role', 'account_status'],
    properties: {
      id: {
        type: 'integer',
        description: '使用者 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '使用者唯一識別碼',
        example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      },
      nick_name: {
        type: 'string',
        description: '使用者暱稱',
        example: '王小明'
      },
      email: {
        type: 'string',
        format: 'email',
        description: '電子郵件地址',
        example: 'student@example.com'
      },
      role: {
        type: 'string',
        enum: ['student', 'teacher', 'admin'],
        description: '使用者角色',
        example: 'student'
      },
      account_status: {
        type: 'string',
        enum: ['active', 'inactive', 'suspended'],
        description: '帳戶狀態',
        example: 'active'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: '建立時間',
        example: '2024-01-15T10:30:00Z'
      }
    }
  },

  // 錯誤回應模型
  ValidationErrorResponse: {
    type: 'object',
    required: ['status', 'message', 'errors'],
    properties: {
      status: {
        type: 'string',
        enum: ['error'],
        description: '回應狀態'
      },
      message: {
        type: 'string',
        description: '錯誤訊息',
        example: '註冊失敗'
      },
      errors: {
        type: 'object',
        additionalProperties: {
          type: 'array',
          items: { type: 'string' }
        },
        description: '詳細錯誤資訊',
        example: {
          email: ['此電子郵件已被註冊'],
          nick_name: ['此暱稱已被使用']
        }
      }
    }
  }
}
