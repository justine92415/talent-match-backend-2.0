import { DataSource } from 'typeorm'
import { MainCategorySeed } from './001-main-categories.seed'
import { SubCategorySeed } from './002-sub-categories.seed'
import { CitySeed } from './003-cities.seed'

export class DatabaseSeeder {
  public async run(dataSource: DataSource): Promise<void> {
    console.log('開始執行資料庫種子資料初始化...')
    
    try {
      // 按順序執行種子資料
      await new MainCategorySeed().run(dataSource)
      await new SubCategorySeed().run(dataSource)
      await new CitySeed().run(dataSource)
      
      console.log('✅ 資料庫種子資料初始化完成')
    } catch (error) {
      console.error('❌ 資料庫種子資料初始化失敗:', error)
      throw error
    }
  }
}

// 如果直接執行此檔案，則執行種子資料
if (require.main === module) {
  import('../data-source').then(async ({ dataSource }) => {
    try {
      await dataSource.initialize()
      console.log('資料庫連線成功')
      
      const seeder = new DatabaseSeeder()
      await seeder.run(dataSource)
      
      await dataSource.destroy()
      console.log('資料庫連線已關閉')
      process.exit(0)
    } catch (error) {
      console.error('執行種子資料失敗:', error)
      process.exit(1)
    }
  })
}