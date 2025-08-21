import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import path from 'path'
import pinoHttp from 'pino-http'
import swaggerUi from 'swagger-ui-express'

import getLogger from '@utils/logger'
import { swaggerSpec } from '@config/swagger'

const logger = getLogger('App')

const app = express()

// 基本中間件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// HTTP 日誌中間件
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

// 靜態檔案服務
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

/**
 * @swagger
 * /api/ping:
 *   get:
 *     tags:
 *       - Health Check
 *     summary: Ping 測試
 *     description: 測試 API 連接是否正常
 *     responses:
 *       200:
 *         description: Pong 回應
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
app.get('/api/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'pong' })
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
import routes from '@routes/index'
app.use('/api', routes)

// 全域錯誤處理中間件 (必須放在最後)
import { errorHandler } from '@middleware/error'
app.use(errorHandler)

export default app
