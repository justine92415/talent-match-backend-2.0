import { DataSource } from 'typeorm'
import { SubCategory } from '@entities/SubCategory'
import { MainCategory } from '@entities/MainCategory'

export class SubCategorySeed {
  public async run(dataSource: DataSource): Promise<void> {
    const subCategoryRepository = dataSource.getRepository(SubCategory)
    const mainCategoryRepository = dataSource.getRepository(MainCategory)
    
    // 檢查是否已有資料
    const existingCount = await subCategoryRepository.count()
    if (existingCount > 0) {
      console.log('次分類資料已存在，跳過初始化')
      return
    }

    // 取得主分類資料
    const mainCategories = await mainCategoryRepository.find()
    if (mainCategories.length === 0) {
      console.log('請先執行主分類種子資料')
      return
    }

    // 建立次分類對應關係
    const subCategoriesData: { [key: string]: string[] } = {
      '程式設計': ['前端開發', '後端開發', 'Mobile App', '資料科學', '人工智慧', 'DevOps'],
      '語言學習': ['英文', '日文', '韓文', '中文', '德文', '法文', '西班牙文'],
      '音樂才藝': ['鋼琴', '吉他', '小提琴', '爵士鼓', '聲樂', '作曲編曲'],
      '運動健身': ['瑜伽', '重訓', '有氧運動', '游泳', '跑步', '格鬥運動'],
      '學術輔導': ['數學', '物理', '化學', '生物', '歷史', '地理', '國文'],
      '藝術設計': ['平面設計', 'UI/UX設計', '插畫', '攝影', '影片剪輯', '3D建模'],
      '生活技能': ['烹飪', '烘焙', '手工藝', '園藝', '整理收納', '寵物照護'],
      '商業技能': ['行銷企劃', '財務管理', '專案管理', '簡報技巧', '銷售技巧', '創業諮詢']
    }

    const subCategories = []
    let displayOrder = 1

    for (const mainCategory of mainCategories) {
      const subCategoryNames = subCategoriesData[mainCategory.name] || []
      
      for (const name of subCategoryNames) {
        subCategories.push({
          main_category_id: mainCategory.id,
          name: name,
          display_order: displayOrder++,
          is_active: true
        })
      }
    }

    const savedSubCategories = await subCategoryRepository.save(subCategories)
    console.log(`成功初始化 ${savedSubCategories.length} 個次分類`)
  }
}