/**
 * 購買記錄控制器
 * 處理購買記錄相關的 HTTP 請求與回應
 */

import { Request, Response } from 'express'
import { purchaseService } from '@services/PurchaseService'
import handleErrorAsync from '@/utils/handleErrorAsync'
import { SUCCESS } from '@/constants/Message'
import { handleSuccess } from '@/utils/handleSuccess'

export class PurchaseController {
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
}

// 匯出控制器實例
export const purchaseController = new PurchaseController()