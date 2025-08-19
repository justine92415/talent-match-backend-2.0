/**
 * 課程影片關聯控制器 (CourseVideoController)
 * 
 * 負責處理課程與影片關聯管理的 HTTP 請求：
 * - POST /courses/:id/videos - 連結影片到課程
 * - PUT /courses/:course_id/videos/order - 更新影片順序
 * - DELETE /courses/:course_id/videos/:video_id - 移除課程影片關聯
 * - GET /courses/:id/videos - 取得課程影片列表
 * 
 * 遵循專案開發準則：
 * - 使用 handleErrorAsync 包裝所有方法
 * - 使用統一回應格式工具函式
 * - 使用 SUCCESS 和 MESSAGES 常數
 * - 不撰寫 try...catch 邏輯
 * - 委派業務邏輯到服務層
 */

import { Request, Response } from 'express'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { courseVideoService } from '@services/CourseVideoService'
import { SUCCESS } from '@constants/Message'
import type {
  LinkVideosRequest,
  UpdateVideoOrderRequest
} from '@models/courseVideo.interface'

/**
 * 課程影片關聯控制器類別
 */
export class CourseVideoController {

  /**
   * 連結影片到課程
   * POST /courses/:id/videos
   */
  static linkVideos = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.id)
    const teacherId = req.user!.userId  // 由 authenticateToken 中間件提供
    const requestData = req.body as LinkVideosRequest  // 由 validateRequest 中間件驗證

    // 呼叫服務層
    const result = await courseVideoService.linkVideos(courseId, teacherId, requestData)

    // 使用統一回應格式
    res.status(201).json(handleCreated(result, SUCCESS.COURSE_VIDEO_LINKED))
  })

  /**
   * 更新課程影片順序
   * PUT /courses/:course_id/videos/order
   */
  static updateVideoOrder = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.course_id)
    const teacherId = req.user!.userId  // 由 authenticateToken 中間件提供
    const requestData = req.body as UpdateVideoOrderRequest  // 由 validateRequest 中間件驗證

    // 呼叫服務層
    const result = await courseVideoService.updateVideoOrder(courseId, teacherId, requestData)

    // 使用統一回應格式
    res.status(200).json(handleSuccess(result, SUCCESS.COURSE_VIDEO_ORDER_UPDATED))
  })

  /**
   * 移除課程影片關聯
   * DELETE /courses/:course_id/videos/:video_id
   */
  static removeCourseVideo = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.course_id)
    const videoId = parseInt(req.params.video_id)
    const teacherId = req.user!.userId  // 由 authenticateToken 中間件提供

    // 呼叫服務層
    const result = await courseVideoService.removeCourseVideo(courseId, videoId, teacherId)

    // 使用統一回應格式
    res.status(200).json(handleSuccess(result, SUCCESS.COURSE_VIDEO_REMOVED))
  })

  /**
   * 取得課程影片列表
   * GET /courses/:id/videos
   */
  static getCourseVideos = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.id)
    const teacherId = req.user?.userId  // 可選的教師ID用於權限檢查

    // 呼叫服務層
    const result = await courseVideoService.getCourseVideoList(courseId, teacherId)

    // 使用統一回應格式
    res.status(200).json(handleSuccess(result, SUCCESS.COURSE_VIDEO_LIST_SUCCESS))
  })
}

export default CourseVideoController