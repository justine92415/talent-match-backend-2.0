/**
 * 課程檔案控制器 (CourseFileController)
 * 
 * 負責處理課程檔案管理的 HTTP 請求：
 * - GET /api/courses/:id/files - 取得課程檔案列表
 * - POST /api/courses/:id/files - 上傳課程檔案 (TODO: 實際上傳功能待實作)
 * - DELETE /api/courses/:course_id/files/:file_id - 刪除課程檔案
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
import { courseFileService } from '@services/courseFileService'
import { SUCCESS } from '@constants/Message'
import type {
  CourseFileQueryParams,
  CourseFileUploadRequest
} from '@models/index'

/**
 * 課程檔案控制器類別
 */
export class CourseFileController {

  /**
   * 取得課程檔案列表
   * GET /api/courses/:id/files
   */
  static getCourseFiles = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.id)
    const userId = req.user!.userId  // 由 authenticateToken 中間件提供
    const queryParams = req.query as CourseFileQueryParams  // 由 validateRequest 中間件驗證

    // 呼叫服務層
    const result = await courseFileService.getCourseFiles(userId, courseId, queryParams)

    // 使用統一回應格式
    res.status(200).json(handleSuccess(result, SUCCESS.COURSE_FILE_LIST_SUCCESS))
  })

  /**
   * 上傳課程檔案
   * POST /api/courses/:id/files
   * TODO: 實際檔案上傳功能未實作，目前為 placeholder
   */
  static uploadCourseFiles = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.id)
    const userId = req.user!.userId  // 由 authenticateToken 中間件提供
    
    // TODO: 實際檔案上傳處理
    // 目前建立假的上傳請求用於測試
    const uploadRequest: CourseFileUploadRequest = {
      files: [
        {
          originalname: 'test-file.pdf',
          filename: 'uuid-test-file.pdf',
          mimetype: 'application/pdf',
          size: 1024000,
          path: '/tmp/uuid-test-file.pdf'
        }
      ]
    }

    // 呼叫服務層
    const result = await courseFileService.uploadCourseFiles(userId, courseId, uploadRequest)

    // 使用統一回應格式
    res.status(201).json(handleCreated(result, SUCCESS.COURSE_FILE_UPLOADED))
  })

  /**
   * 刪除課程檔案
   * DELETE /api/courses/:course_id/files/:file_id
   */
  static deleteCourseFile = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.course_id)
    const fileId = parseInt(req.params.file_id)
    const userId = req.user!.userId  // 由 authenticateToken 中間件提供

    // 呼叫服務層
    await courseFileService.deleteCourseFile(userId, courseId, fileId)

    // 使用統一回應格式（無返回資料）
    res.status(200).json(handleSuccess(null, SUCCESS.COURSE_FILE_DELETED))
  })

  /**
   * 檢查課程檔案是否存在（工具方法）
   * 主要用於其他控制器或中間件使用
   */
  static checkFileExists = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const courseId = parseInt(req.params.course_id)
    const fileId = parseInt(req.params.file_id)
    const userId = req.user!.userId  // 由 authenticateToken 中間件提供

    // 呼叫服務層
    const exists = await courseFileService.courseFileExists(userId, courseId, fileId)

    // 使用統一回應格式
    res.status(200).json(handleSuccess({ exists }, '檔案存在性檢查完成'))
  })
}

export default CourseFileController