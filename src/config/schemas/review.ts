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
  }
}
