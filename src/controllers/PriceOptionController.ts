/**
 * 價格方案控制器
 * 
 * 處理課程價格方案相關的 HTTP 請求，包括：
 * - GET /api/courses/:courseId/price-options - 查詢價格方案列表
 * - POST /api/courses/:courseId/price-options - 建立價格方案
 * - PUT /api/courses/:courseId/price-options/:id - 更新價格方案
 * - DELETE /api/courses/:courseId/price-options/:id - 刪除價格方案
 */

import { Request, Response, NextFunction } from 'express'
import { priceOptionService } from '@services/index'
import { handleErrorAsync, handleSuccess, handleCreated, handleMessageOnly } from '@utils/index'
import { SUCCESS } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'

export class PriceOptionController {
  private priceOptionService = priceOptionService

  /**
   * 查詢課程價格方案列表
   * GET /api/courses/:courseId/price-options
   */
  getPriceOptions = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 角色檢查由中間件處理
    const teacherId = req.user!.userId
    const courseId = parseInt(req.params.courseId)

    const priceOptions = await this.priceOptionService.findPriceOptionsByCourse(courseId, teacherId)

    res.status(200).json(handleSuccess(priceOptions, SUCCESS.PRICE_OPTION_LIST_SUCCESS))
  })

  /**
   * 建立價格方案
   * POST /api/courses/:courseId/price-options
   */
  createPriceOption = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 角色檢查由中間件處理
    const teacherId = req.user!.userId
    const courseId = parseInt(req.params.courseId)
    const priceOptionData = req.body

    const priceOption = await this.priceOptionService.createPriceOption(
      courseId,
      teacherId,
      priceOptionData
    )

    res.status(201).json(handleCreated(priceOption, SUCCESS.PRICE_OPTION_CREATED))
  })

  /**
   * 更新價格方案
   * PUT /api/courses/:courseId/price-options/:id
   */
  updatePriceOption = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 角色檢查由中間件處理
    const teacherId = req.user!.userId
    const courseId = parseInt(req.params.courseId)
    const priceOptionId = parseInt(req.params.id)
    const updateData = req.body

    const updatedPriceOption = await this.priceOptionService.updatePriceOption(
      courseId,
      priceOptionId,
      teacherId,
      updateData
    )

    res.status(200).json(handleSuccess(updatedPriceOption, SUCCESS.PRICE_OPTION_UPDATED))
  })

  /**
   * 刪除價格方案（軟刪除）
   * DELETE /api/courses/:courseId/price-options/:id
   */
  deletePriceOption = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 角色檢查由中間件處理
    const teacherId = req.user!.userId
    const courseId = parseInt(req.params.courseId)
    const priceOptionId = parseInt(req.params.id)

    await this.priceOptionService.deletePriceOption(courseId, priceOptionId, teacherId)

    res.status(200).json(handleMessageOnly(SUCCESS.PRICE_OPTION_DELETED))
  })
}

// 匯出控制器實例
export const priceOptionController = new PriceOptionController()