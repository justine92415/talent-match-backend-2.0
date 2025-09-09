/**
 * 購買記錄控制器
 * 處理購買記錄相關的 HTTP 請求與回應
 */

import { Request, Response } from 'express'
import { purchaseService } from '@services/PurchaseService'
import handleErrorAsync from '@/utils/handleErrorAsync'
import { SUCCESS } from '@/constants/Message'
import { handleSuccess, handleCreated } from '@/utils/handleSuccess'

export class PurchaseController {
  /**
   * POST /purchases/from-order - 從訂單建立購買記錄（付款完成後呼叫）
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  createPurchaseFromOrder = handleErrorAsync(async (req: Request, res: Response) => {
    const { order_id } = req.body // 已由中間件驗證

    // 呼叫服務層建立購買記錄
    const purchases = await purchaseService.createPurchaseFromOrder(order_id)

    res.status(201).json(handleCreated({
      purchases
    }, '購買記錄建立成功'))
  })

  /**
   * GET /purchases - 取得用戶購買記錄列表
   * @description 已通過 validateRequest 中間件驗證的查詢參數
   */
  getUserPurchases = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const { course_id } = req.query // 只保留課程篩選參數

    // 呼叫服務層
    const purchases = await purchaseService.getUserPurchases(
      userId, 
      course_id ? Number(course_id) : undefined
    )

    res.status(200).json(handleSuccess({
      purchases
    }, SUCCESS.PURCHASE_LIST_SUCCESS))
  })

  /**
   * GET /purchases/:id - 取得單一購買記錄詳情
   */
  getPurchaseById = handleErrorAsync(async (req: Request, res: Response) => {
    const purchaseId = parseInt(req.params.id)
    const userId = req.user!.userId

    // 呼叫服務層（服務層會處理 ID 驗證和存在性檢查）
    const purchase = await purchaseService.getPurchaseById(purchaseId, userId)

    res.status(200).json(handleSuccess({
      purchase
    }, SUCCESS.PURCHASE_DETAIL_SUCCESS))
  })

  /**
   * GET /purchases/courses/:courseId - 取得特定課程的購買記錄
   */
  getCoursePurchase = handleErrorAsync(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId)
    const userId = req.user!.userId

    // 呼叫服務層（服務層會處理 ID 驗證和存在性檢查）
    const purchase = await purchaseService.getCoursePurchase(userId, courseId)

    res.status(200).json(handleSuccess({
      purchase
    }, SUCCESS.PURCHASE_DETAIL_SUCCESS))
  })

  /**
   * POST /purchases/courses/:courseId/consume - 消耗課程購買堂數
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  consumePurchase = handleErrorAsync(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId)
    const userId = req.user!.userId
    const { quantity = 1 } = req.body // 已由中間件驗證

    // 呼叫服務層（服務層會處理 ID 驗證和業務邏輯）
    const purchase = await purchaseService.consumePurchase(userId, courseId, quantity)

    res.status(200).json(handleSuccess({
      purchase
    }, '課程堂數使用成功'))
  })

  /**
   * GET /purchases/courses/:courseId/check - 檢查是否已購買課程
   */
  checkCoursePurchase = handleErrorAsync(async (req: Request, res: Response) => {
    const courseId = parseInt(req.params.courseId)
    const userId = req.user!.userId

    // 呼叫服務層（服務層會處理 ID 驗證和業務邏輯）
    const hasPurchased = await purchaseService.hasPurchasedCourse(userId, courseId)
    const remainingQuantity = await purchaseService.getRemainingQuantity(userId, courseId)

    res.status(200).json(handleSuccess({
      has_purchased: hasPurchased,
      remaining_quantity: remainingQuantity
    }, '檢查購買狀態成功'))
  })

  /**
   * POST /purchases/:id/use - 使用購買堂數
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  usePurchase = handleErrorAsync(async (req: Request, res: Response) => {
    const purchaseId = parseInt(req.params.id)
    const userId = req.user!.userId
    const { quantity } = req.body // 已由中間件驗證

    // 呼叫服務層（服務層會處理 ID 驗證和業務邏輯）
    const updatedPurchase = await purchaseService.usePurchase(purchaseId, userId, quantity)

    res.status(200).json(handleSuccess({
      purchase: updatedPurchase
    }, SUCCESS.PURCHASE_DETAIL_SUCCESS))
  })

  /**
   * GET /purchases/summary - 獲取使用者購買摘要
   */
  getPurchaseSummary = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId

    // 呼叫服務層（服務層會處理業務邏輯）
    const summary = await purchaseService.getPurchaseSummary(userId)

    res.status(200).json(handleSuccess({
      summary
    }, SUCCESS.PURCHASE_LIST_SUCCESS))
  })
}

// 匯出控制器實例
export const purchaseController = new PurchaseController()