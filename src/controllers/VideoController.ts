/**
 * 影片管理控制器
 * 
 * 提供影片相關的 CRUD 操作：
 * - 影片上傳（檔案/YouTube 連結）
 * - 影片列表查詢（支援分頁和篩選）
 * - 影片詳細資訊獲取
 * - 影片資訊更新
 * - 影片刪除（軟刪除）
 * - 影片使用統計
 * - 批次操作
 * 
 * 遵循專案開發準則：
 * - 使用 handleErrorAsync 包裝器統一錯誤處理
 * - 使用 handleSuccess/handleCreated 回應工具
 * - 支援 JWT 認證和教師權限檢查
 * - 使用 SUCCESS 常數管理回應訊息
 */

import { Request, Response, NextFunction } from 'express'
import { videoService } from '@services/VideoService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { SUCCESS } from '@constants/Message'
import type { VideoUploadRequest, VideoUpdateRequest, VideoListRequest } from '../types/video.interface'

export class VideoController {
  /**
   * 影片上傳
   * 
   * 支援檔案上傳（multipart/form-data）
   * 統一採用本地儲存方式，不再支援 YouTube 連結
   * 
   * @route POST /api/videos
   * @access Private (需要教師權限)
   */
  uploadVideo = async (req: Request, res: Response, next: NextFunction) => {
    const videoFile = (req as any).videoFile
    
    try {
      const userId = req.user!.userId
      const videoData: VideoUploadRequest = req.body

      // 準備完整的影片建立資料
      const createVideoData = {
        ...videoData,
        videoFile // 檔案物件，由 Service 層處理上傳
      }

      // 呼叫服務層建立影片（包含檔案上傳）
      const video = await videoService.createVideoWithFile(userId, createVideoData)

      res.status(201).json(handleCreated({ video }, SUCCESS.VIDEO_UPLOADED))

    } catch (error) {
      // 錯誤處理交給中間件處理暫存檔案清理
      next(error)
    }
  }

  /**
   * 取得影片列表
   * 
   * 支援分頁、篩選和排序：
   * - 依影片分類篩選
   * - 依關鍵字搜尋（標題/描述）
   * - 分頁查詢
   * 
   * @route GET /api/videos
   * @access Private (只能查看自己的影片)
   */
  getVideoList = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    
    // 建構查詢參數
    const query: VideoListRequest = {
      category: req.query.category as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      per_page: req.query.per_page ? parseInt(req.query.per_page as string, 10) : 10
    }

    // 移除 undefined 值
    Object.keys(query).forEach(key => {
      if (query[key as keyof VideoListRequest] === undefined) {
        delete query[key as keyof VideoListRequest]
      }
    })

    const result = await videoService.getVideoList(userId, query)

    res.status(200).json(handleSuccess({
      videos: result.items
    }, SUCCESS.VIDEO_LIST_SUCCESS))
  })

  /**
   * 取得影片詳細資訊
   * 
   * @route GET /api/videos/:id
   * @access Private (只能查看自己的影片)
   */
  getVideoDetail = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const videoId = parseInt(req.params.id, 10)

    const result = await videoService.getVideoDetail(videoId, userId)

    res.status(200).json(handleSuccess(result, SUCCESS.VIDEO_DETAIL_SUCCESS))
  })

  /**
   * 更新影片資訊
   * 
   * 支援部分欄位更新：
   * - 標題、描述更新
   * - YouTube 連結更新
   * - 檔案替換（如果提供新檔案）
   * 
   * @route PUT /api/videos/:id
   * @access Private (只能更新自己的影片)
   */
  updateVideo = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const videoId = parseInt(req.params.id, 10)
    const updateData: VideoUpdateRequest = req.body

    // TODO: 檔案更新處理：檢查是否有上傳新檔案
    // const uploadedFile = req.file

    const video = await videoService.updateVideo(videoId, userId, updateData)

    res.status(200).json(handleSuccess({ video }, SUCCESS.VIDEO_UPDATED))
  })

  /**
   * 刪除影片（軟刪除）
   * 
   * @route DELETE /api/videos/:id
   * @access Private (只能刪除自己的影片)
   */
  deleteVideo = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const videoId = parseInt(req.params.id, 10)

    await videoService.deleteVideo(videoId, userId)

    res.status(200).json(handleSuccess(null, SUCCESS.VIDEO_DELETED))
  })
}

export const videoController = new VideoController()