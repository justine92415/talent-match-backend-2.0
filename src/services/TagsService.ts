import { dataSource } from '@db/data-source'
import { MainCategory } from '@entities/MainCategory'
import { SubCategory } from '@entities/SubCategory'

export class TagsService {
  /**
   * 取得所有標籤（主分類和次分類）
   * @returns 包含主分類和次分類的標籤清單
   */
  public async getAllTags() {
    console.log('🏷️ TagsService.getAllTags - 開始查詢標籤')
    
    try {
      const subCategoryRepository = dataSource.getRepository(SubCategory)

      console.log('🏷️ TagsService.getAllTags - 使用單次 JOIN 查詢')
      
      // 使用單次 JOIN 查詢取得所有資料
      const subCategoriesWithMain = await subCategoryRepository
        .createQueryBuilder('sub')
        .innerJoin('main_categories', 'main', 'main.id = sub.main_category_id')
        .where('sub.is_active = :subActive', { subActive: true })
        .andWhere('main.is_active = :mainActive', { mainActive: true })
        .select([
          'main.id as main_id',
          'main.name as main_name', 
          'main.icon_url as main_icon_url',
          'main.display_order as main_display_order',
          'sub.id as sub_id',
          'sub.name as sub_name',
          'sub.display_order as sub_display_order'
        ])
        .orderBy('main.display_order', 'ASC')
        .addOrderBy('main.id', 'ASC')
        .addOrderBy('sub.display_order', 'ASC')
        .addOrderBy('sub.id', 'ASC')
        .getRawMany()

      console.log('🏷️ TagsService.getAllTags - 單次查詢取得資料:', subCategoriesWithMain.length, '筆')

      // 將資料組合成所需格式
      const tagsMap = new Map()
      
      subCategoriesWithMain.forEach(row => {
        const mainId = row.main_id
        
        if (!tagsMap.has(mainId)) {
          tagsMap.set(mainId, {
            id: mainId,
            main_category: row.main_name,
            sub_category: [],
            icon_url: row.main_icon_url || null
          })
        }
        
        tagsMap.get(mainId).sub_category.push({
          id: row.sub_id,
          name: row.sub_name
        })
      })

      const result = Array.from(tagsMap.values())
      console.log('🏷️ TagsService.getAllTags - 完成標籤組合，總共:', result.length, '個主分類')
      return result
    } catch (error) {
      console.error('🏷️ TagsService.getAllTags - 發生錯誤:', error)
      throw error
    }
  }
}