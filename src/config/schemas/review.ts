/**
 * 評價相關 Swagger Schema 定義
 */

export const reviewSchemas = {
  ReviewSubmitRequest: {
    type: 'object',
    required: ['reservation_uuid', 'rate', 'comment'],
    properties: {
      reservation_uuid: {
        type: 'string',
        format: 'uuid',
        description: '預約紀錄的 UUID (必填，用於確認學生所預約的課程記錄，需為 v4 UUID 格式)',
        example: '550e8400-e29b-41d4-a716-446655440000'
      },
      rate: {
        type: 'integer',
        minimum: 1,
        maximum: 5,
        description: '學生對課程的評分 (必填，範圍 1-5，僅允許整數)',
        example: 5
      },
      comment: {
        type: 'string',
        minLength: 1,
        maxLength: 1000,
        description: '學生的文字評語 (必填，至少 1 個字元，最多 1000 個字元)',
        example: '老師講解非常清楚，課程內容實用！'
      }
    }
  },

  ReviewSubmitSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態指示 (固定為 success 表示操作成功)',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息內容 (使用專案既有的成功訊息常數)',
        example: '評價提交成功'
      },
      data: {
        type: 'object',
        description: '評價建立後回傳的資料內容',
        properties: {
          id: {
            type: 'integer',
            description: '新建立評價的資料庫 ID',
            example: 123
          },
          rate: {
            type: 'integer',
            description: '評價的星等分數 (1-5)',
            example: 5
          },
          comment: {
            type: 'string',
            description: '學生撰寫的評語內容',
            example: '老師講解非常清楚，課程內容實用！'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: '評價建立時間 (ISO 8601 時間戳)',
            example: '2025-09-23T10:30:00.000Z'
          }
        }
      }
    }
  },

  ReviewSubmitValidationErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/ValidationErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '驗證失敗的錯誤訊息',
            example: '評價參數驗證失敗'
          },
          errors: {
            type: 'object',
            description: '各欄位的錯誤訊息清單',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' }
            },
            example: {
              reservation_uuid: ['預約 UUID 格式不正確']
            }
          }
        }
      }
    ]
  },

  ReviewSubmitBusinessErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/BusinessErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '業務邏輯錯誤訊息 (例如重複評論、預約尚未完成等)',
            example: '學生尚未完成該預約，無法留下評價'
          }
        }
      }
    ]
  },

  CourseReviewsSuccessResponse: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: '回應狀態指示 (固定為 success 表示操作成功)',
        enum: ['success'],
        example: 'success'
      },
      message: {
        type: 'string',
        description: '成功訊息內容',
        example: '取得課程評價成功'
      },
      data: {
        type: 'object',
        description: '課程評價列表與統計資料',
        properties: {
          reviews: {
            type: 'array',
            description: '評價記錄陣列',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  description: '評價資料庫 ID',
                  example: 1
                },
                uuid: {
                  type: 'string',
                  format: 'uuid',
                  description: '評價唯一識別碼 (v4 UUID)',
                  example: '550e8400-e29b-41d4-a716-446655440000'
                },
                rate: {
                  type: 'integer',
                  description: '評分星等 (1-5)',
                  example: 5
                },
                comment: {
                  type: 'string',
                  description: '評語內容',
                  example: '老師講解非常清楚，課程內容實用！'
                },
                created_at: {
                  type: 'string',
                  format: 'date-time',
                  description: '評價建立時間 (ISO 8601 時間戳)',
                  example: '2025-09-23T10:30:00.000Z'
                },
                student: {
                  type: 'object',
                  description: '評價學生資訊',
                  properties: {
                    name: {
                      type: 'string',
                      description: '學生暱稱',
                      example: '王小明'
                    },
                    avatar_image: {
                      type: 'string',
                      nullable: true,
                      description: '學生頭貼圖片 URL (可為 null)',
                      example: 'https://example.com/avatars/student-123.jpg'
                    }
                  }
                }
              }
            }
          },
          pagination: {
            type: 'object',
            description: '分頁資訊',
            properties: {
              current_page: {
                type: 'integer',
                description: '當前頁碼',
                example: 1
              },
              per_page: {
                type: 'integer',
                description: '每頁筆數',
                example: 10
              },
              total: {
                type: 'integer',
                description: '總筆數',
                example: 25
              },
              total_pages: {
                type: 'integer',
                description: '總頁數',
                example: 3
              }
            }
          },
          course: {
            type: 'object',
            description: '課程基本資訊',
            properties: {
              id: {
                type: 'integer',
                description: '課程資料庫 ID',
                example: 2
              },
              uuid: {
                type: 'string',
                format: 'uuid',
                description: '課程唯一識別碼 (v4 UUID)',
                example: '2728eb42-48d8-4356-9091-39e971ebce0c'
              },
              name: {
                type: 'string',
                description: '課程名稱',
                example: '測試課程2'
              }
            }
          },
          rating_stats: {
            type: 'object',
            description: '課程評分統計資訊',
            properties: {
              average_rating: {
                type: 'string',
                description: '平均評分 (小數點後一位)',
                example: '4.5'
              },
              total_reviews: {
                type: 'integer',
                description: '總評價數量',
                example: 25
              },
              rating_distribution: {
                type: 'object',
                description: '各星等的評價數量分佈',
                properties: {
                  '5': {
                    type: 'integer',
                    description: '5 星評價數量',
                    example: 15
                  },
                  '4': {
                    type: 'integer',
                    description: '4 星評價數量',
                    example: 7
                  },
                  '3': {
                    type: 'integer',
                    description: '3 星評價數量',
                    example: 2
                  },
                  '2': {
                    type: 'integer',
                    description: '2 星評價數量',
                    example: 1
                  },
                  '1': {
                    type: 'integer',
                    description: '1 星評價數量',
                    example: 0
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  CourseReviewsNotFoundErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/NotFoundErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '課程不存在或 UUID 格式錯誤的錯誤訊息',
            example: '課程不存在或未發佈'
          }
        }
      }
    ]
  },

  CourseReviewsValidationErrorResponse: {
    allOf: [
      {
        $ref: '#/components/schemas/ValidationErrorResponse'
      },
      {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: '參數驗證失敗的錯誤訊息',
            example: '參數驗證失敗'
          },
          errors: {
            type: 'object',
            description: '各欄位的錯誤訊息清單',
            additionalProperties: {
              type: 'array',
              items: { type: 'string' }
            },
            example: {
              uuid: ['課程 UUID 格式不正確'],
              rating: ['評分必須介於 1-5 之間']
            }
          }
        }
      }
    ]
  }
}
