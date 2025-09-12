/**
 * 使用者頭像上傳相關 Schema
 * 基於實際 UserAvatarController 和 UserAvatarService 的實作
 */

export const userAvatarSchemas = {
  // 頭像上傳成功回應 Schema
  AvatarUploadSuccessResponse: {
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
        example: '頭像上傳成功'
      },
      data: {
        type: 'object',
        description: '上傳結果資訊',
        properties: {
          avatarUrl: {
            type: 'string',
            description: 'Firebase Storage 下載連結',
            example: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/avatars%2Fuser_123%2Favatar_123.jpg?alt=media'
          },
          user: {
            type: 'object',
            description: '更新後的使用者資訊',
            properties: {
              id: {
                type: 'integer',
                description: '使用者 ID',
                example: 123
              },
              nick_name: {
                type: 'string',
                description: '使用者暱稱',
                example: 'John Doe'
              },
              avatar_image: {
                type: 'string',
                description: '使用者頭像 URL',
                example: 'https://firebasestorage.googleapis.com/v0/b/bucket/o/avatars%2Fuser_123%2Favatar_123.jpg?alt=media'
              }
            }
          }
        }
      }
    }
  },

  // 頭像刪除成功回應 Schema
  AvatarDeleteSuccessResponse: {
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
        example: '頭像刪除成功'
      },
      data: {
        nullable: true,
        description: '回應資料（此 API 無回傳資料）',
        example: null
      }
    }
  },

  // 頭像上傳驗證錯誤回應
  AvatarValidationErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '頭像檔案驗證失敗'
          },
          errors: {
            example: {
              avatar: ['頭像檔案為必填項目'],
              fileFormat: ['不支援的檔案格式，僅支援 JPEG, JPG, PNG, WebP'],
              fileSize: ['檔案大小超過限制（最大 5MB）']
            }
          }
        }
      }
    ]
  },

  // 頭像業務邏輯錯誤回應
  AvatarBusinessErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/BusinessErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '頭像上傳失敗，請重試'
          }
        }
      }
    ]
  },

  // 頭像不存在錯誤回應
  AvatarNotFoundErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/NotFoundErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '使用者頭像不存在'
          }
        }
      }
    ]
  }
}