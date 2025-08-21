/**
 * 公開教師控制器
 * 
 * 處理教師公開資料相關的 HTTP 請求，包括：
 * - GET /api/teachers/public/:id - 教師公開資料
 * - GET /api/teachers/public/:id/courses - 教師課程列表
 */

import { Request, Response, NextFunction } from 'express'
import { handleErrorAsync, handleSuccess } from '@utils/index'
import { SUCCESS } from '@constants/Message'
import { publicTeacherService } from '@services/index'

export class PublicTeacherController {
  /**
   * 取得教師公開資料
   */
  getPublicTeacher = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = parseInt(req.params.id)
    
    // 基本ID格式驗證
    if (isNaN(teacherId) || teacherId <= 0) {
      const { BusinessError } = await import('@utils/errors')
      const { ERROR_CODES } = await import('@constants/ErrorCode')
      const { MESSAGES } = await import('@constants/Message')
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_FOUND, MESSAGES.BUSINESS.TEACHER_NOT_FOUND, 404)
    }
    
    const teacher = await publicTeacherService.getPublicTeacher(teacherId)
    res.json(handleSuccess({ teacher }, SUCCESS.PUBLIC_TEACHER_PROFILE_SUCCESS))
  })

  /**
   * 取得教師課程列表
   */
  getTeacherCourses = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = parseInt(req.params.id)
    const query = req.query as any
    
    // 基本ID格式驗證
    if (isNaN(teacherId) || teacherId <= 0) {
      const { BusinessError } = await import('@utils/errors')
      const { ERROR_CODES } = await import('@constants/ErrorCode')
      const { MESSAGES } = await import('@constants/Message')
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_FOUND, MESSAGES.BUSINESS.TEACHER_NOT_FOUND, 404)
    }
    
    const result = await publicTeacherService.getTeacherCourses(teacherId, query)
    res.json(handleSuccess(result, SUCCESS.PUBLIC_TEACHER_COURSES_SUCCESS))
  })
}

export const publicTeacherController = new PublicTeacherController()