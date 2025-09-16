/**
 * Auth 模組專用 Schema
 * 包含登入、註冊等認證相關 API 的 Schema
 */

export const authSchemas = {
  // === 重設密碼 API Schema ===
  ResetPasswordRequest: {
    type: 'object',
    required: ['token', 'new_password'],
    properties: {
      token: {
        type: 'string',
        description: '重設密碼 Token',
        example: 'abc123def456ghi789'
      },
      new_password: {
        type: 'string',
        minLength: 8,
        description: '新密碼（至少8字元）',
        example: 'newPassword123'
      }
    }
  },

  ResetPasswordSuccessResponse: {
    type: 'object',
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
        example: '密碼重設成功'
      },
      data: {
        nullable: true,
        description: '回應資料（此 API 無回傳資料）',
        example: null
      }
    }
  },

  ResetPasswordValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '參數驗證失敗'
          },
          errors: {
            example: {
              token: ['Token 為必填欄位'],
              new_password: ['密碼必須至少8字元']
            }
          }
        }
      }
    ]
  },

  ResetPasswordBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '重設密碼 Token 無效或已過期'
          }
        }
      }
    ]
  },

  // === 忘記密碼 API Schema ===
  ForgotPasswordRequest: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 255,
        description: '電子郵件地址',
        example: 'user@example.com'
      }
    }
  },

  ForgotPasswordSuccessResponse: {
    type: 'object',
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
        example: '重設密碼郵件已發送'
      },
      data: {
        nullable: true,
        description: '回應資料（此 API 無回傳資料）',
        example: null
      }
    }
  },

  ForgotPasswordValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '參數驗證失敗'
          },
          errors: {
            example: {
              email: ['電子郵件格式不正確']
            }
          }
        }
      }
    ]
  },

  // === Refresh Token API Schema ===
  RefreshTokenRequest: {
    type: 'object',
    required: ['refresh_token'],
    properties: {
      refresh_token: {
        type: 'string',
        description: 'JWT Refresh Token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  },

  RefreshTokenSuccessResponse: {
    type: 'object',
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
        example: 'Token 刷新成功'
      },
      data: {
        $ref: '#/components/schemas/AuthSuccessData'
      }
    }
  },

  RefreshTokenValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '參數驗證失敗'
          },
          errors: {
            example: {
              refresh_token: ['Refresh token 為必填欄位']
            }
          }
        }
      }
    ]
  },

  RefreshTokenBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: 'Token 無效或已過期'
          }
        }
      }
    ]
  },

  // === 登入 API Schema ===
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        maxLength: 255,
        description: '電子郵件地址',
        example: 'user@example.com'
      },
      password: {
        type: 'string',
        description: '密碼',
        example: 'password123'
      }
    }
  },

  LoginSuccessResponse: {
    type: 'object',
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
        example: '登入成功'
      },
      data: {
        $ref: '#/components/schemas/AuthSuccessData'
      }
    }
  },

  LoginValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '登入失敗'
          },
          errors: {
            example: {
              email: ['電子郵件格式不正確'],
              password: ['密碼不能為空']
            }
          }
        }
      }
    ]
  },

  LoginBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '帳號或密碼錯誤'
          }
        }
      }
    ]
  },

  // === 註冊 API Schema ===
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
        example: 'user@example.com'
      },
      password: {
        type: 'string',
        minLength: 8,
        description: '密碼（至少8字元）',
        example: 'password123'
      }
    }
  },

  RegisterSuccessResponse: {
    type: 'object',
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
        example: '註冊成功'
      },
      data: {
        $ref: '#/components/schemas/AuthSuccessData'
      }
    }
  },

  RegisterValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '註冊失敗'
          },
          errors: {
            example: {
              nick_name: ['暱稱為必填欄位'],
              email: ['Email 格式不正確'],
              password: ['密碼必須至少8字元且包含中英文']
            }
          }
        }
      }
    ]
  },

  RegisterBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '註冊失敗'
          },
          errors: {
            example: {
              email: ['此電子郵件已被註冊'],
              nick_name: ['該暱稱已被使用']
            }
          }
        }
      }
    ]
  },

  // === 共用 Auth 回應資料 ===
  AuthSuccessData: {
    type: 'object',
    properties: {
      user: {
        $ref: '#/components/schemas/UserProfile',
        description: '使用者個人資料物件'
      },
      access_token: {
        type: 'string',
        description: 'JWT Access Token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      refresh_token: {
        type: 'string',
        description: 'JWT Refresh Token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      },
      token_type: {
        type: 'string',
        description: 'Token 類型',
        example: 'Bearer'
      },
      expires_in: {
        type: 'integer',
        description: 'Access Token 過期時間 (秒)',
        example: 3600
      }
    }
  },

  // === Profile API Schemas ===
  GetProfileResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '成功取得個人資料'
      },
      data: {
        type: 'object',
        description: '個人資料物件',
        properties: {
          user: {
            $ref: '#/components/schemas/UserProfile'
          }
        }
      }
    }
  },

  UpdateProfileRequest: {
    type: 'object',
    properties: {
      nick_name: {
        type: 'string',
        minLength: 1,
        maxLength: 50,
        description: '暱稱 (1-50字元，需檢查唯一性)',
        example: 'john_doe_2024'
      },
      name: {
        type: 'string',
        maxLength: 100,
        nullable: true,
        description: '真實姓名 (最大100字元)',
        example: '張小明'
      },
      birthday: {
        type: 'string',
        nullable: true,
        oneOf: [
          {
            type: 'string',
            format: 'date',
            description: '有效的日期格式 (YYYY-MM-DD)',
            example: '1990-01-15'
          },
          {
            type: 'string',
            enum: [''],
            description: '空字串表示清空生日',
            example: ''
          }
        ],
        description: '生日 - 可為有效日期、空字串(清空)或 null'
      },
      contact_phone: {
        type: 'string',
        maxLength: 20,
        nullable: true,
        pattern: '^[0-9+\\-\\s()]+$',
        description: '聯絡電話 (最大20字元，支援數字、+、-、空格、括號)',
        example: '+886-912-345-678'
      },
      avatar_image: {
        type: 'string',
        format: 'uri',
        nullable: true,
        description: '大頭貼網址 (需為有效URL)',
        example: 'https://example.com/avatar.jpg'
      }
    },
    description: '所有欄位皆為選填，支援部分更新'
  },

  UpdateProfileResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '個人資料更新成功'
      },
      data: {
        type: 'object',
        description: '更新後的個人資料物件',
        properties: {
          user: {
            $ref: '#/components/schemas/UserProfile'
          }
        }
      }
    }
  },

  UpdateProfileValidationError: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '資料驗證失敗'
          },
          errors: {
            example: {
              nick_name: ['暱稱長度不能超過50個字元'],
              birthday: ['生日必須是有效的日期格式、空字串或 null'],
              contact_phone: ['聯絡電話格式不正確']
            }
          }
        }
      }
    ]
  },

  UpdateProfileBusinessError: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '暱稱已存在'
          }
        }
      }
    ]
  },

  DeleteProfileResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態',
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息',
        example: '帳號已成功刪除'
      },
      data: {
        nullable: true,
        description: '回應資料（此 API 無回傳資料）',
        example: null
      }
    }
  }
}