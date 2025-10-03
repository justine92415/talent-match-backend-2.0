/**
 * 評價控制器
 * 
 * 處理評價相關的 HTTP 請求與回應，遵循 TDD 指示文件：
 * - 使用 handleErrorAsync 包裝所有方法
 * - 整合認證與驗證中間件
 * - 回傳統一 API 格式
 * - 委派業務邏輯給服務層處理
 */

import { Request, Response } from 'express'
import { reviewService } from '@services/index'
import { MESSAGES } from '@constants/Message'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'

export class ReviewController {
  private reviewService = reviewService

  /**
   * POST /reviews - 提交評價
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  submitReview = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId  // 已認證的使用者 (由 authenticateToken 中間件提供)
    const validatedData = req.body   // 已驗證的資料 (由 validateRequest 中間件驗證)

    // 呼叫服務層
    const review = await this.reviewService.submitReview(userId, validatedData)

    // 201 Created 狀態回傳成功訊息
    res.status(201).json(handleCreated(review, MESSAGES.REVIEW.SUBMIT_SUCCESS))
  })

  /**
   * GET /reviews/courses/:uuid - 取得課程評價列表
   * @description 已通過 validateRequest 中間件驗證的資料
   */
  getCourseReviews = handleErrorAsync(async (req: Request, res: Response) => {
    const courseUuid = req.params.uuid  // 路由參數，已通過驗證中間件
    const queryParams = req.query       // 查詢參數，已通過驗證中間件

    // 呼叫服務層
    const result = await this.reviewService.getCourseReviews(courseUuid, queryParams)

    // 200 OK 狀態回傳成功訊息
    res.status(200).json(handleSuccess(result, MESSAGES.REVIEW.COURSE_REVIEWS_SUCCESS))
  })
}

// 建立單一實例以供路由使用
export const reviewController = new ReviewController()