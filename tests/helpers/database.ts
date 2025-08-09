import { dataSource } from '../../db/data-source'
import { User } from '../../entities/User'
import { QueryRunner } from 'typeorm'

// 測試用資料庫清理工具
export const clearDatabase = async (): Promise<void> => {
  try {
    // 確保資料庫連線已建立
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }

    // 使用 TRUNCATE 快速清理數據，比 DELETE 更高效
    await dataSource.query(`
      TRUNCATE TABLE "user" RESTART IDENTITY CASCADE;
    `)

    console.log('✅ 測試資料庫已清理')
  } catch (error) {
    console.error('❌ 清理測試資料庫時發生錯誤:', error)
    // 不拋出錯誤，避免影響測試執行
  }
}

// 初始化測試資料庫連線
export const initTestDatabase = async (): Promise<void> => {
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
      console.log('✅ 測試資料庫連線已建立')
    }
  } catch (error) {
    console.error('❌ 測試資料庫連線失敗:', error)
    throw error
  }
}

// 關閉測試資料庫連線
export const closeTestDatabase = async (): Promise<void> => {
  try {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
      console.log('✅ 測試資料庫連線已關閉')
    }
  } catch (error) {
    console.error('❌ 關閉測試資料庫連線時發生錯誤:', error)
  }
}

// 事務回滾測試隔離 - 更高效的測試隔離策略
let testQueryRunner: QueryRunner | null = null

export const startTestTransaction = async (): Promise<void> => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize()
  }
  
  testQueryRunner = dataSource.createQueryRunner()
  await testQueryRunner.connect()
  await testQueryRunner.startTransaction()
}

export const rollbackTestTransaction = async (): Promise<void> => {
  if (testQueryRunner) {
    await testQueryRunner.rollbackTransaction()
    await testQueryRunner.release()
    testQueryRunner = null
  }
}

export const getTestQueryRunner = (): QueryRunner | null => {
  return testQueryRunner
}
