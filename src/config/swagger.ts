import swaggerJSDoc from 'swagger-jsdoc'
import { allSchemas } from './schemas'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Talent Match API',
    version: '2.1.0',
    description: '全面重構後的 Talent Match 後端 API 文件\n\n🆕 v2.1 新功能：整合式課程建立 API，支援同時上傳圖片和設定價格方案',
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
    schemas: allSchemas,

    responses: {
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
      NotFoundError: {
        description: '資源不存在',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/NotFoundErrorResponse'
            }
          }
        }
      },
      UnauthorizedError: {
        description: '未授權',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UnauthorizedErrorResponse'
            }
          }
        }
      },
      ForbiddenError: {
        description: '禁止存取',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ForbiddenErrorResponse'
            }
          }
        }
      },
      ServerError: {
        description: '伺服器內部錯誤',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ServerErrorResponse'
            }
          }
        }
      },
      InternalServerError: {
        description: '伺服器內部錯誤',
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
    isDevelopment ? './src/routes/*.ts' : './dist/src/routes/*.js',
    isDevelopment ? './src/controllers/*.ts' : './dist/src/controllers/*.js',
    isDevelopment ? './src/app.ts' : './dist/src/app.js'
  ]
}

export const swaggerSpec = swaggerJSDoc(options)
