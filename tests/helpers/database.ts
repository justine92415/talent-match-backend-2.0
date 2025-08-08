import { dataSource } from '../../db/data-source'
import { User } from '../../entities/User'

// 測試用資料庫清理工具
export const clearDatabase = async (): Promise<void> => {
  try {
    // 確保資料庫連線已建立
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }

    // 使用交易來確保資料一致性
    await dataSource.transaction(async manager => {
      // 關閉外鍵約束檢查
      await manager.query('SET session_replication_role = replica;')

      // 清理所有使用者資料（測試用）
      await manager.getRepository(User).delete({})

      // 重新啟用外鍵約束檢查
      await manager.query('SET session_replication_role = DEFAULT;')
    })

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
