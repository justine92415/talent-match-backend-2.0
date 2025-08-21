/**
 * 公開課程控制器
 * 
 * 處理公開課程瀏覽相關的 HTTP 請求，包括：
 * - GET /api/courses/public - 公開課程列表（支援搜尋）
 * - GET /api/courses/public/:id - 公開課程詳情
 * - GET /api/reviews/courses/:id - 課程評價列表
 */

import { Request, Response, NextFunction } from 'express'
import { publicCourseService } from '@services/index'
import { handleErrorAsync, handleSuccess } from '@utils/index'
import { SUCCESS } from '@constants/Message'

export class PublicCourseController {
  /**
   * 取得公開課程列表
   */
  getPublicCourses = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query as any
    
    const result = await publicCourseService.getPublicCourses(query)

    // 檢查是否有結果
    const message = result.courses.length === 0 
      ? SUCCESS.PUBLIC_COURSE_NO_COURSES_FOUND 
      : SUCCESS.PUBLIC_COURSE_LIST_SUCCESS

    res.json(handleSuccess(result, message))
  })

  /**
   * 取得公開課程詳情
   */
  getPublicCourseDetail = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.id)
    
    // 基本ID格式驗證
    if (isNaN(courseId) || courseId <= 0) {
      const { BusinessError } = await import('@utils/errors')
      const { ERROR_CODES } = await import('@constants/ErrorCode')
      const { MESSAGES } = await import('@constants/Message')
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }
    
    const course = await publicCourseService.getPublicCourseDetail(courseId)

    res.json(handleSuccess(course, SUCCESS.PUBLIC_COURSE_DETAIL_SUCCESS))
  })

  /**
   * 取得課程評價列表
   */
  getCourseReviews = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.id)
    const query = req.query as any
    
    const result = await publicCourseService.getCourseReviews(courseId, query)

    res.json(handleSuccess(result, SUCCESS.PUBLIC_COURSE_REVIEWS_SUCCESS))
  })
}

export const publicCourseController = new PublicCourseController()