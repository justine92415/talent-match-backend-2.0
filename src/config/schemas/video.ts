/**
 * 影片模組 Schema
 * 
 * 包含影片 API 相關的請求和回應 Schema
 * 完全基於 VideoController 和 VideoService 的實際實作
 */

export const videoSchemas = {
  // ==================== 影片上傳 API Schema ==================== 
  
  // 影片上傳請求 Schema（統一為檔案上傳，不再支援 YouTube）
  VideoUploadRequest: {
    type: 'object',
    required: ['name', 'category', 'intro'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '影片名稱 (必填，1-200字元)',
        example: 'JavaScript 基礎教學'
      },
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '影片分類 (必填，1-100字元)',
        example: '程式設計'
      },
      intro: {
        type: 'string',
        minLength: 1,
        maxLength: 2000,
        description: '影片介紹 (必填，1-2000字元)',
        example: '這是一堂深入淺出的 JavaScript 基礎教學課程，適合初學者學習'
      },
      videoFile: {
        type: 'string',
        format: 'binary',
        description: '影片檔案 (必填，支援 MP4, AVI, MOV, WMV 格式，最大 500MB)'
      }
    }
  },

  // 影片上傳成功回應 Schema
  VideoUploadSuccessResponse: {
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
        example: '影片上傳成功'
      },
      data: {
        type: 'object',
        properties: {
          video: {
            $ref: '#/components/schemas/VideoBasicInfo'
          }
        },
        description: '上傳成功的影片資料'
      }
    }
  },

  // ==================== 影片列表查詢 API Schema ====================
  
  // 影片列表查詢參數 Schema
  VideoListQueryParams: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        description: '頁碼 (選填，預設為 1)',
        example: 1
      },
      per_page: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        description: '每頁數量 (選填，預設為 20，最大 100)',
        example: 20
      },
      category: {
        type: 'string',
        maxLength: 100,
        description: '影片分類篩選 (選填，模糊搜尋)',
        example: '程式設計'
      },
      search: {
        type: 'string',
        maxLength: 200,
        description: '搜尋關鍵字 (選填，搜尋影片標題和介紹)',
        example: 'JavaScript'
      }
    }
  },

  // 影片列表成功回應 Schema
  VideoListSuccessResponse: {
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
        example: '取得影片列表成功'
      },
      data: {
        type: 'object',
        properties: {
          videos: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/VideoBasicInfo'
            },
            description: '影片列表'
          }
        },
        description: '影片列表資料'
      }
    }
  },

  // ==================== 影片更新 API Schema ====================
  
  // 影片更新請求 Schema
  VideoUpdateRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 200,
        description: '影片名稱 (選填，1-200字元)',
        example: 'JavaScript 進階教學'
      },
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '影片分類 (選填，1-100字元)',
        example: '進階程式設計'
      },
      intro: {
        type: 'string',
        minLength: 1,
        maxLength: 2000,
        description: '影片介紹 (選填，1-2000字元)',
        example: '深入學習 JavaScript 進階概念，包含異步編程、模組化等'
      }
    }
  },

  // ==================== 共用影片資訊 Schema ====================

  // 影片基本資訊 Schema
  VideoBasicInfo: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        description: '影片 ID',
        example: 1
      },
      uuid: {
        type: 'string',
        format: 'uuid',
        description: '影片 UUID (系統生成的唯一識別碼)',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      teacher_id: {
        type: 'integer',
        description: '教師 ID',
        example: 5
      },
      name: {
        type: 'string',
        description: '影片名稱',
        example: 'JavaScript 基礎教學'
      },
      category: {
        type: 'string',
        nullable: true,
        description: '影片分類',
        example: '程式設計'
      },
      intro: {
        type: 'string',
        nullable: true,
        description: '影片介紹',
        example: '這是一堂深入淺出的 JavaScript 基礎教學課程'
      },
      url: {
        type: 'string',
        nullable: true,
        description: '影片檔案 URL',
        example: 'https://storage.googleapis.com/talent-match/videos/...'
      },
      video_type: {
        type: 'string',
        enum: ['storage'],
        description: '影片類型 (統一為 storage 本地儲存)',
        example: 'storage'
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
      }
    }
  },

  // ==================== 錯誤回應 Schema ====================

  // 影片上傳驗證錯誤回應 Schema
  VideoUploadValidationErrorResponse: {
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
              name: ['影片名稱為必填欄位'],
              category: ['影片分類為必填欄位'],
              intro: ['影片介紹為必填欄位'],
              videoFile: ['影片檔案為必填欄位']
            }
          }
        }
      }
    ]
  },

  // 影片檔案格式錯誤回應 Schema
  VideoFileFormatErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '檔案格式錯誤'
          },
          errors: {
            example: {
              videoFile: ['不支援的檔案格式 "video/mpeg"。僅支援: MP4, AVI, MOV, WMV, QuickTime']
            }
          }
        }
      }
    ]
  },

  // 影片檔案大小錯誤回應 Schema
  VideoFileSizeErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ValidationErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '檔案大小超過限制'
          },
          errors: {
            example: {
              videoFile: ['檔案大小超過限制。當前大小: 600.0MB，最大允許: 500.0MB']
            }
          }
        }
      }
    ]
  },

  // 影片權限錯誤回應 Schema
  VideoPermissionErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ForbiddenErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '需要教師權限才能管理影片'
          }
        }
      }
    ]
  },

  // 影片上傳失敗錯誤回應 Schema
  VideoUploadFailedErrorResponse: {
    allOf: [
      { $ref: '#/components/schemas/ServerErrorResponse' },
      {
        type: 'object',
        properties: {
          message: {
            example: '影片檔案處理失敗'
          }
        }
      }
    ]
  }
}