import { Request, Response } from 'express'
import { TagsService } from '@services/TagsService'
import { handleSuccess } from '@utils/handleSuccess'
import handleErrorAsync from '@utils/handleErrorAsync'

export class TagsController {
  private tagsService: TagsService

  constructor() {
    this.tagsService = new TagsService()
  }

  /**
   * 取得所有標籤清單
   * GET /api/tags
   */
  public getAllTags = handleErrorAsync(async (req: Request, res: Response) => {
    console.log('🏷️ TagsController.getAllTags - 開始處理請求')
    
    try {
      const tags = await this.tagsService.getAllTags()
      console.log('🏷️ TagsController.getAllTags - 成功取得標籤:', tags.length, '筆')
      
      console.log('🏷️ TagsController.getAllTags - 準備回應資料')
      res.json(handleSuccess(tags, '取得標籤清單成功'))
      console.log('🏷️ TagsController.getAllTags - 回應已發送')
    } catch (error) {
      console.error('🏷️ TagsController.getAllTags - 發生錯誤:', error)
      throw error
    }
  })
}