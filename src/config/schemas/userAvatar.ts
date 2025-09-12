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
          userId: {
            type: 'string',
            description: '使用者 ID',
            example: '12345'
          },
          originalName: {
            type: 'string',
            description: '原始檔案名稱',
            example: 'my-avatar.jpg'
          },
          fileName: {
            type: 'string',
            description: '儲存的檔案名稱',
            example: 'user-12345-avatar-1695123456789.jpg'
          },
          mimeType: {
            type: 'string',
            description: '檔案類型',
            example: 'image/jpeg'
          },
          size: {
            type: 'integer',
            description: '檔案大小（位元組）',
            example: 1024000
          },
          downloadURL: {
            type: 'string',
            description: 'Firebase Storage 下載連結',
            example: 'https://storage.googleapis.com/bucket/avatars/user-12345-avatar.jpg'
          },
          firebaseUrl: {
            type: 'string',
            description: 'Firebase Storage 內部路徑',
            example: 'gs://bucket/avatars/user-12345-avatar.jpg'
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time',
            description: '上傳時間',
            example: '2024-09-12T10:30:00.000Z'
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

  // 頭像資訊查詢成功回應 Schema
  AvatarInfoSuccessResponse: {
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
        example: '取得頭像資訊成功'
      },
      data: {
        type: 'object',
        description: '頭像資訊',
        properties: {
          userId: {
            type: 'string',
            description: '使用者 ID',
            example: '12345'
          },
          message: {
            type: 'string',
            description: '資訊訊息',
            example: '取得頭像資訊成功'
          }
        }
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