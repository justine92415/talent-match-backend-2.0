/**
 * 影片模組 Schema
 * 
 * 包含影片 API 相關的請求和回應 Schema
 */

export const videoSchemas = {
  // ==================== 影片上傳 API Schema ==================== 
  
  // 影片上傳請求 Schema
  VideoUploadRequest: {
    type: 'object',
    required: ['name', 'category', 'intro', 'type'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        description: '影片名稱 (必填，1-255字元)',
        example: 'JavaScript 基礎教學 - 第1講'
      },
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '影片分類 (必填)',
        example: '基礎教學'
      },
      intro: {
        type: 'string',
        minLength: 1,
        maxLength: 1000,
        description: '影片簡介 (必填)',
        example: '本講將介紹JavaScript的基本語法和變數概念'
      },
      type: {
        type: 'string',
        enum: ['local', 'youtube'],
        description: '影片類型 (local: 本地上傳, youtube: YouTube連結)',
        example: 'local'
      },
      youtube_url: {
        type: 'string',
        format: 'uri',
        description: 'YouTube 影片網址 (當 type 為 youtube 時必填)',
        example: 'https://www.youtube.com/watch?v=abc123'
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
        maxLength: 255,
        description: '影片名稱 (選填，1-255字元)',
        example: 'JavaScript 進階教學 - 第1講'
      },
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        description: '影片分類 (選填)',
        example: '進階教學'
      },
      intro: {
        type: 'string',
        minLength: 1,
        maxLength: 1000,
        description: '影片簡介 (選填)',
        example: '本講將介紹JavaScript的進階概念'
      },
      youtube_url: {
        type: 'string',
        format: 'uri',
        nullable: true,
        description: 'YouTube 影片網址 (選填)',
        example: 'https://www.youtube.com/watch?v=xyz789'
      }
    }
  },

  // ==================== 影片資訊 Schema ====================

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
        description: '影片 UUID',
        example: '123e4567-e89b-12d3-a456-426614174000'
      },
      name: {
        type: 'string',
        description: '影片名稱',
        example: 'JavaScript 基礎教學 - 第1講'
      },
      category: {
        type: 'string',
        description: '影片分類',
        example: '基礎教學'
      },
      intro: {
        type: 'string',
        description: '影片簡介',
        example: '本講將介紹JavaScript的基本語法和變數概念'
      },
      type: {
        type: 'string',
        enum: ['local', 'youtube'],
        description: '影片類型',
        example: 'local'
      },
      duration: {
        type: 'integer',
        nullable: true,
        description: '影片長度 (秒)',
        example: 1800
      },
      thumbnail_url: {
        type: 'string',
        nullable: true,
        description: '縮圖 URL',
        example: 'https://example.com/thumbnail.jpg'
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

  // 影片詳細資訊 Schema
  VideoDetailInfo: {
    allOf: [
      { $ref: '#/components/schemas/VideoBasicInfo' },
      {
        type: 'object',
        properties: {
          file_url: {
            type: 'string',
            nullable: true,
            description: '影片檔案 URL (本地上傳)',
            example: 'https://example.com/video.mp4'
          },
          youtube_url: {
            type: 'string',
            nullable: true,
            description: 'YouTube 影片 URL',
            example: 'https://www.youtube.com/watch?v=abc123'
          },
          file_size: {
            type: 'integer',
            nullable: true,
            description: '檔案大小 (bytes)',
            example: 104857600
          }
        }
      }
    ]
  },

  // 影片資訊 Schema (向後相容)
  VideoInfo: {
    $ref: '#/components/schemas/VideoDetailInfo'
  }
}