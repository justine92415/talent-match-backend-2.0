import { dataSource } from '../../db/data-source'
import { User } from '../../entities/User'

// 測試用資料庫清理工具
export const clearDatabase = async (): Promise<void> => {
  try {
    // 確保資料庫連線已建立
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }

    // 清理所有使用者資料（測試用）
    const userRepository = dataSource.getRepository(User)
    await userRepository.delete({})

    console.log('測試資料庫已清理')
  } catch (error) {
    console.error('清理測試資料庫時發生錯誤:', error)
    // 不拋出錯誤，避免影響測試執行
  }
}
