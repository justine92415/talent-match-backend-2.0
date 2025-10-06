/**
 * 首頁控制器
 *
 * 處理首頁相關的 HTTP 請求與回應，遵循 TDD 指示文件：
 * - 使用 handleErrorAsync 包裝所有方法
 * - 回傳統一 API 格式
 * - 委派業務邏輯給服務層處理
 */

import { Request, Response } from 'express'
import { homeService } from '@services/HomeService'
import { MESSAGES } from '@constants/Message'
import { handleErrorAsync, handleSuccess } from '@utils/index'

export class HomeController {
  private homeService = homeService

  /**
   * GET /api/home/reviews-summary - 取得首頁評論摘要
   * @description 公開路由，不需要認證
   */
  getReviewsSummary = handleErrorAsync(async (req: Request, res: Response) => {
    const { limit } = req.query

    // 呼叫服務層
    const result = await this.homeService.getReviewsSummary(limit ? Number(limit) : 6)

    // 200 OK 狀態回傳成功訊息
    res.status(200).json(handleSuccess(result, '成功取得評論摘要'))
  })

  /**
   * GET /api/home/short-videos - 取得首頁短影音列表
   * @description 公開路由，不需要認證
   */
  getShortVideos = handleErrorAsync(async (req: Request, res: Response) => {
    const { mainCategoryId, limit } = req.query

    // 呼叫服務層
    const result = await this.homeService.getShortVideos(mainCategoryId ? Number(mainCategoryId) : undefined, limit ? Number(limit) : 5)

    // 200 OK 狀態回傳成功訊息
    res.status(200).json(handleSuccess(result, MESSAGES.HOME.SHORT_VIDEOS_SUCCESS))
  })

  /**
   * GET /api/home/recommended-courses - 取得首頁推薦課程
   * @description 公開路由，不需要認證
   */
  getRecommendedCourses = handleErrorAsync(async (req: Request, res: Response) => {
    const { cityId, limit } = req.query

    // 呼叫服務層
    const result = await this.homeService.getRecommendedCourses(cityId ? Number(cityId) : undefined, limit ? Number(limit) : 6)

    // 200 OK 狀態回傳成功訊息
    res.status(200).json(handleSuccess(result, '成功取得推薦課程'))
  })
}

// 建立單一實例以供路由使用
export const homeController = new HomeController()
