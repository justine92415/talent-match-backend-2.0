#!/usr/bin/env node

/**
 * Module dependencies.
 */
import * as http from 'http'
import config from '@config/index'
import app from '../app'
import getLogger from '@utils/logger'
import { dataSource } from '@db/data-source'
import * as cron from 'node-cron'
import { reservationExpirationService } from '@services/ReservationExpirationService'

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
    
    // 啟動預約過期檢查排程任務（每10分鐘執行一次）
    cron.schedule('*/10 * * * *', async () => {
      const taskStartTime = Date.now()
      const taskName = '教師回應過期檢查'
      
      try {
        logger.info(`🚀 [定時任務] ${taskName} - 開始執行`)
        const result = await reservationExpirationService.handleExpiredReservations()
        
        const executionTime = Date.now() - taskStartTime
        
        if (result.count > 0) {
          logger.info(`✅ [定時任務] ${taskName} - 執行成功`)
          logger.info(`   ├─ 處理數量: ${result.count} 筆`)
          logger.info(`   ├─ 預約 ID: [${result.expiredReservations.join(', ')}]`)
          logger.info(`   └─ 執行時間: ${executionTime}ms`)
        } else {
          logger.info(`✅ [定時任務] ${taskName} - 執行成功 (無需處理的預約)`)
          logger.info(`   └─ 執行時間: ${executionTime}ms`)
        }
      } catch (error) {
        const executionTime = Date.now() - taskStartTime
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        const errorStack = error instanceof Error ? error.stack : ''
        
        logger.error(`❌ [定時任務] ${taskName} - 執行失敗`)
        logger.error(`   ├─ 錯誤訊息: ${errorMessage}`)
        if (errorStack) {
          logger.error(`   ├─ 堆疊追蹤: ${errorStack}`)
        }
        logger.error(`   └─ 執行時間: ${executionTime}ms`)
      }
    }, {
      timezone: 'Asia/Taipei'
    })

    // 啟動課程結束檢查排程任務（每1小時執行一次）
    cron.schedule('0 * * * *', async () => {
      const taskStartTime = Date.now()
      const taskName = '課程結束檢查'
      
      try {
        logger.info(`🚀 [定時任務] ${taskName} - 開始執行`)
        const result = await reservationExpirationService.markReservationsOverdue()
        
        const executionTime = Date.now() - taskStartTime
        
        if (result.count > 0) {
          logger.info(`✅ [定時任務] ${taskName} - 執行成功`)
          logger.info(`   ├─ 標記數量: ${result.count} 筆`)
          logger.info(`   ├─ 預約 ID: [${result.overdueReservations.join(', ')}]`)
          logger.info(`   └─ 執行時間: ${executionTime}ms`)
        } else {
          logger.info(`✅ [定時任務] ${taskName} - 執行成功 (無需標記的預約)`)
          logger.info(`   └─ 執行時間: ${executionTime}ms`)
        }
      } catch (error) {
        const executionTime = Date.now() - taskStartTime
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        const errorStack = error instanceof Error ? error.stack : ''
        
        logger.error(`❌ [定時任務] ${taskName} - 執行失敗`)
        logger.error(`   ├─ 錯誤訊息: ${errorMessage}`)
        if (errorStack) {
          logger.error(`   ├─ 堆疊追蹤: ${errorStack}`)
        }
        logger.error(`   └─ 執行時間: ${executionTime}ms`)
      }
    }, {
      timezone: 'Asia/Taipei'
    })

    // 啟動自動完成排程任務（每24小時執行一次）
    cron.schedule('0 0 * * *', async () => {
      const taskStartTime = Date.now()
      const taskName = '自動完成過期預約'
      
      try {
        logger.info(`🚀 [定時任務] ${taskName} - 開始執行`)
        const result = await reservationExpirationService.autoCompleteOverdueReservations()
        
        const executionTime = Date.now() - taskStartTime
        
        if (result.count > 0) {
          logger.info(`✅ [定時任務] ${taskName} - 執行成功`)
          logger.info(`   ├─ 完成數量: ${result.count} 筆`)
          logger.info(`   ├─ 預約 ID: [${result.completedReservations.join(', ')}]`)
          logger.info(`   └─ 執行時間: ${executionTime}ms`)
        } else {
          logger.info(`✅ [定時任務] ${taskName} - 執行成功 (無需完成的預約)`)
          logger.info(`   └─ 執行時間: ${executionTime}ms`)
        }
      } catch (error) {
        const executionTime = Date.now() - taskStartTime
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        const errorStack = error instanceof Error ? error.stack : ''
        
        logger.error(`❌ [定時任務] ${taskName} - 執行失敗`)
        logger.error(`   ├─ 錯誤訊息: ${errorMessage}`)
        if (errorStack) {
          logger.error(`   ├─ 堆疊追蹤: ${errorStack}`)
        }
        logger.error(`   └─ 執行時間: ${executionTime}ms`)
      }
    }, {
      timezone: 'Asia/Taipei'
    })
    
    logger.info('預約管理排程已啟動：')
    logger.info('- 教師回應過期檢查：每10分鐘')
    logger.info('- 課程結束檢查：每1小時')
    logger.info('- 自動完成：每24小時（凌晨00:00）')
    logger.info(`伺服器運作中. port: ${port}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知錯誤'
    const errorStack = error instanceof Error ? error.stack : ''
    logger.error(`資料庫連線失敗: ${errorMessage}`)
    if (errorStack) {
      logger.error(`錯誤堆疊: ${errorStack}`)
    }
    process.exit(1)
  }
})
