#!/usr/bin/env node

/**
 * Module dependencies.
 */
import * as http from 'http'
import config from '../config'
import app from '../app'
import getLogger from '../utils/logger'
import { dataSource } from '../db/data-source'

const logger = getLogger('www')
const port = config.get<number>('web.port')

app.set('port', port)

const server = http.createServer(app)

function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`
  // handle specific listen errors
  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      logger.error(`exception on ${bind}: ${error.code}`)
      process.exit(1)
  }
}

server.on('error', onError)
server.listen(port, async () => {
  try {
    await dataSource.initialize()
    logger.info('資料庫連線成功')
    logger.info(`伺服器運作中. port: ${port}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知錯誤'
    logger.error(`資料庫連線失敗: ${errorMessage}`)
    process.exit(1)
  }
})
