import { Request, Response, NextFunction } from 'express'
import { userAvatarService } from '@services/UserAvatarService'
import { UserAvatarUploadRequest, UserAvatarDeleteRequest } from '../types/userAvatar.interface'
import { MESSAGES } from '@constants/Message'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'

/**
 * 使用者頭像控制器
 * 
 * 處理使用者頭像相關的 HTTP 請求：
 * - 頭像上傳
 * - 頭像刪除
 * 
 * 所有方法都使用 handleErrorAsync 包裝以統一錯誤處理
 */
export class UserAvatarController {
  /**
   * 上傳使用者頭像
   * 
   * POST /upload/avatar
   * 
   * @param req 包含檔案資料的請求物件
   * @param res 回應物件
   * @param next 下一個中間件函式
   */
  uploadAvatar = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 從認證中間件取得使用者 ID
    const userId = req.user!.userId
    
    // 從 formidable 中間件取得解析的檔案
    const file = (req as any).file

    if (!file) {
      res.status(400).json({
        success: false,
        message: MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
      })
      return
    }

    // 建立上傳請求
    const uploadRequest: UserAvatarUploadRequest = {
      userId,
      file
    }

    // 呼叫服務層處理頭像上傳邏輯
    const result = await userAvatarService.uploadAvatar(uploadRequest)

    res.status(201).json(handleCreated(result.data, result.message))
  })

  /**
   * 刪除使用者頭像
   * 
   * DELETE /upload/avatar
   * 
   * @param req 請求物件
   * @param res 回應物件
   * @param next 下一個中間件函式
   */
  deleteAvatar = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 從認證中間件取得使用者 ID
    const userId = req.user!.userId

    // 建立刪除請求
    const deleteRequest: UserAvatarDeleteRequest = {
      userId
    }

    // 呼叫服務層處理頭像刪除邏輯
    const result = await userAvatarService.deleteAvatar(deleteRequest)

    res.status(200).json(handleSuccess(null, result.message))
  })

  /**
   * 取得使用者頭像資訊
   * 
   * GET /upload/avatar/info
   * 
   * @param req 請求物件
   * @param res 回應物件
   * @param next 下一個中間件函式
   */
  getAvatarInfo = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 從認證中間件取得使用者 ID
    const userId = req.user!.userId

    // 可以擴展為從服務層取得頭像詳細資訊
    // 目前暫時返回基本資訊
    res.status(200).json(handleSuccess({
      userId,
      message: '取得頭像資訊成功'
    }, '取得頭像資訊成功'))
  })
}