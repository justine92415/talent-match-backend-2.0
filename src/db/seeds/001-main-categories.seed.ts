import { DataSource } from 'typeorm'
import { MainCategory } from '@entities/MainCategory'

export class MainCategorySeed {
  public async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(MainCategory)
    
    // 檢查是否已有資料，避免重複插入
    const existingCount = await repository.count()
    if (existingCount > 0) {
      console.log('主分類資料已存在，跳過初始化')
      return
    }

    const mainCategories = [
      {
        name: '程式設計',
        icon_url: 'https://example.com/icons/programming.png',
        display_order: 1,
        is_active: true
      },
      {
        name: '語言學習',
        icon_url: 'https://example.com/icons/language.png',
        display_order: 2,
        is_active: true
      },
      {
        name: '音樂才藝',
        icon_url: 'https://example.com/icons/music.png',
        display_order: 3,
        is_active: true
      },
      {
        name: '運動健身',
        icon_url: 'https://example.com/icons/fitness.png',
        display_order: 4,
        is_active: true
      },
      {
        name: '學術輔導',
        icon_url: 'https://example.com/icons/academic.png',
        display_order: 5,
        is_active: true
      },
      {
        name: '藝術設計',
        icon_url: 'https://example.com/icons/design.png',
        display_order: 6,
        is_active: true
      },
      {
        name: '生活技能',
        icon_url: 'https://example.com/icons/lifestyle.png',
        display_order: 7,
        is_active: true
      },
      {
        name: '商業技能',
        icon_url: 'https://example.com/icons/business.png',
        display_order: 8,
        is_active: true
      }
    ]

    const savedCategories = await repository.save(mainCategories)
    console.log(`成功初始化 ${savedCategories.length} 個主分類`)
  }
}