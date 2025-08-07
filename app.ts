import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import pinoHttp from 'pino-http'
import swaggerUi from 'swagger-ui-express'

import getLogger from './utils/logger'
import routes from './routes'
import { swaggerSpec } from './config/swagger'

// 定義錯誤處理介面
interface AppError extends Error {
  status?: number
}

const logger = getLogger('App')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: unknown) {
        // 安全的類型檢查和處理
        if (typeof req === 'object' && req !== null) {
          const rawReq = req as { raw?: { body?: unknown }; body?: unknown }
          if (rawReq.raw && rawReq.raw.body !== undefined) {
            rawReq.body = rawReq.raw.body
          }
        }
        return req
      }
    }
  })
)
app.use(express.static(path.join(__dirname, 'public')))

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     tags:
 *       - Health Check
 *     summary: 健康檢查
 *     description: 檢查 API 服務是否正常運作
 *     responses:
 *       200:
 *         description: 服務正常
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: OK
 */
app.get('/healthcheck', (req: Request, res: Response) => {
  res.status(200)
  res.send('OK')
})

// Swagger UI 設定
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Talent Match API 文件'
  })
)

// API 路由
app.use('/api', routes)

// 錯誤處理中介軟體
app.use((err: AppError, req: Request, res: Response, _next: NextFunction) => {
  // 安全的日誌記錄
  const reqWithLog = req as { log?: { error?: (err: unknown) => void } }
  if (reqWithLog.log && typeof reqWithLog.log.error === 'function') {
    reqWithLog.log.error(err)
  }

  if (err.status) {
    res.status(err.status).json({
      status: 'failed',
      message: err.message
    })
    return
  }
  res.status(500).json({
    status: 'error',
    message: '伺服器錯誤'
  })
})

export default app
// QQ
