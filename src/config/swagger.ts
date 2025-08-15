import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Talent Match API',
    version: '2.0.0',
    description: '全面重構後的 Talent Match 後端 API 文件',
    contact: {
      name: 'API 支援',
      url: 'https://example.com/support'
    }
  },
  servers: [
    {
      url: 'http://localhost:8080/api',
      description: '開發環境'
    },
    {
      url: 'https://api.talent-match.com/api',
      description: '正式環境'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token 認證'
      }
    },
    schemas: {
      // 標準化回應格式
      ApiResponse: {
        type: 'object',
        required: ['status', 'message'],
        properties: {
          status: {
            type: 'string',
            enum: ['success', 'error'],
            description: '回應狀態'
          },
          message: {
            type: 'string',
            description: '回應訊息'
          },
          data: {
            type: 'object',
            description: '回應資料',
            nullable: true
          },
          errors: {
            type: 'object',
            additionalProperties: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            description: '詳細錯誤資訊',
            nullable: true
          },
          pagination: {
            $ref: '#/components/schemas/Pagination'
          },
          meta: {
            type: 'object',
            description: '額外 metadata',
            nullable: true
          }
        }
      },

      // 分頁資訊
      Pagination: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            description: '當前頁碼'
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            description: '每頁資料筆數'
          },
          total: {
            type: 'integer',
            minimum: 0,
            description: '總資料筆數'
          },
          totalPages: {
            type: 'integer',
            minimum: 0,
            description: '總頁數'
          }
        }
      },

      // 成功回應
      SuccessResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['success']
              }
            }
          }
        ]
      },

      // 建立成功回應 (201)
      CreatedResponse: {
        allOf: [
          { $ref: '#/components/schemas/SuccessResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '建立成功'
              }
            }
          }
        ]
      },

      // 錯誤回應
      ErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiResponse' },
          {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['error']
              }
            }
          }
        ]
      },

      // 驗證錯誤回應 (400)
      ValidationErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '參數驗證失敗'
              },
              errors: {
                type: 'object',
                example: {
                  name: ['課程名稱為必填欄位'],
                  email: ['Email格式不正確']
                }
              }
            }
          }
        ]
      },

      // 未授權錯誤回應 (401)
      UnauthorizedErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '請先登入'
              }
            }
          }
        ]
      },

      // 權限不足錯誤回應 (403)
      ForbiddenErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '權限不足，無法執行此操作'
              }
            }
          }
        ]
      },

      // 資源不存在錯誤回應 (404)
      NotFoundErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '找不到指定的資源'
              }
            }
          }
        ]
      },

      // 資源衝突錯誤回應 (409)
      ConflictErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '資源已存在或發生衝突'
              }
            }
          }
        ]
      },

      // 業務邏輯錯誤回應 (422)
      BusinessErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '業務邏輯錯誤'
              }
            }
          }
        ]
      },

      // 系統錯誤回應 (500)
      ServerErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ErrorResponse' },
          {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: '系統錯誤，請稍後再試'
              }
            }
          }
        ]
      },

      // 實體定義
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '使用者 ID'
          },
          username: {
            type: 'string',
            description: '使用者名稱'
          },
          email: {
            type: 'string',
            format: 'email',
            description: '電子郵件'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '建立時間'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: '更新時間'
          }
        }
      },

      Course: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '課程 ID'
          },
          uuid: {
            type: 'string',
            format: 'uuid',
            description: '課程 UUID'
          },
          name: {
            type: 'string',
            description: '課程名稱'
          },
          content: {
            type: 'string',
            description: '課程內容'
          },
          status: {
            type: 'string',
            enum: ['draft', 'published', 'archived'],
            description: '課程狀態'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: '建立時間'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: '更新時間'
          }
        }
      }
    },

    // 標準化回應範例
    responses: {
      Success: {
        description: '成功回應',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/SuccessResponse'
            }
          }
        }
      },
      Created: {
        description: '建立成功',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreatedResponse'
            }
          }
        }
      },
      ValidationError: {
        description: '參數驗證錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationErrorResponse'
            }
          }
        }
      },
      Unauthorized: {
        description: '未授權',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UnauthorizedErrorResponse'
            }
          }
        }
      },
      Forbidden: {
        description: '權限不足',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ForbiddenErrorResponse'
            }
          }
        }
      },
      NotFound: {
        description: '資源不存在',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/NotFoundErrorResponse'
            }
          }
        }
      },
      Conflict: {
        description: '資源衝突',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ConflictErrorResponse'
            }
          }
        }
      },
      BusinessError: {
        description: '業務邏輯錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/BusinessErrorResponse'
            }
          }
        }
      },
      ServerError: {
        description: '系統錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ServerErrorResponse'
            }
          }
        }
      }
    }
  }
}

// 根據環境決定檔案副檔名
const isDevelopment = process.env.NODE_ENV !== 'production'

const options = {
  definition: swaggerDefinition,
  apis: [
    isDevelopment ? './src/routes/*.ts' : './dist/routes/*.js',
    isDevelopment ? './src/controllers/*.ts' : './dist/controllers/*.js',
    isDevelopment ? './src/app.ts' : './dist/app.js'
  ]
}

export const swaggerSpec = swaggerJSDoc(options)
