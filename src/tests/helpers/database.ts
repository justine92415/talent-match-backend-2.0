import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { DatabaseSeeder } from '@db/seeds/index'

// 全域測試資料庫管理器
class TestDatabaseManager {
  private static instance: TestDatabaseManager
  private isInitialized = false

  private constructor() {}

  static getInstance(): TestDatabaseManager {
    if (!TestDatabaseManager.instance) {
      TestDatabaseManager.instance = new TestDatabaseManager()
    }
    return TestDatabaseManager.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return
    }

    try {
      // 如果資料來源已經初始化，先銷毀它
      if (dataSource.isInitialized) {
        await dataSource.destroy()
      }

      await dataSource.initialize()
      this.isInitialized = true
      console.log('✅ 測試資料庫連線已建立')
    } catch (error) {
      console.error('❌ 測試資料庫連線失敗:', error)
      throw error
    }
  }

  async destroy(): Promise<void> {
    if (!this.isInitialized) {
      return
    }

    try {
      if (dataSource.isInitialized) {
        await dataSource.destroy()
      }
      this.isInitialized = false
      console.log('✅ 測試資料庫連線已關閉')
    } catch (error) {
      console.error('❌ 關閉測試資料庫連線時發生錯誤:', error)
    }
  }
}

// 測試用資料庫清理工具
export const clearDatabase = async (): Promise<void> => {
  try {
    const dbManager = TestDatabaseManager.getInstance()
    await dbManager.initialize()

    // 使用交易來確保資料一致性
    await dataSource.transaction(async manager => {
      // 關閉外鍵約束檢查
      await manager.query('SET session_replication_role = replica;')

      // 清理所有使用者資料（測試用）
      await manager.getRepository(User).delete({})

      // 重新啟用外鍵約束檢查
      await manager.query('SET session_replication_role = DEFAULT;')
    })

    // 確保基礎種子資料存在
    const seeder = new DatabaseSeeder()
    await seeder.run(dataSource)

    console.log('✅ 測試資料庫已清理')
  } catch (error) {
    console.error('❌ 清理測試資料庫時發生錯誤:', error)
    // 不拋出錯誤，避免影響測試執行
  }
}

// 初始化測試資料庫連線
export const initTestDatabase = async (): Promise<void> => {
  const dbManager = TestDatabaseManager.getInstance()
  await dbManager.initialize()
}

// 關閉測試資料庫連線
export const closeTestDatabase = async (): Promise<void> => {
  const dbManager = TestDatabaseManager.getInstance()
  await dbManager.destroy()
}
