import swaggerJSDoc from 'swagger-jsdoc'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Talent Match API',
    version: '1.0.0',
    description: 'Talent Match 後端 API 文件',
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
        bearerFormat: 'JWT'
      }
    },
    schemas: {
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
          password: {
            type: 'string',
            description: '密碼'
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
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['error', 'failed']
          },
          message: {
            type: 'string',
            description: '錯誤訊息'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success']
          },
          message: {
            type: 'string',
            description: '成功訊息'
          },
          data: {
            type: 'object',
            description: '返回資料'
          }
        }
      }
    }
  }
}

const options = {
  definition: swaggerDefinition,
  apis: ['./routes/*.ts', './controllers/*.ts', './app.ts']
}

export const swaggerSpec = swaggerJSDoc(options)
