import swaggerJSDoc from 'swagger-jsdoc'
import { allSchemas } from './schemas'

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
    schemas: allSchemas,

    responses: {}
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
