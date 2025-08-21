/**
 * 課程控制器
 * 
 * 處理課程相關的 HTTP 請求，包括：
 * - POST /api/courses - 建立課程
 * - PUT /api/courses/:id - 更新課程 
 * - GET /api/courses/:id - 取得課程詳情
 * - GET /api/courses - 教師課程列表
 * - DELETE /api/courses/:id - 刪除課程
 */

import { Request, Response, NextFunction } from 'express'
import { courseService } from '@services/CourseService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { MESSAGES, SUCCESS } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'

export class CourseController {
  /**
   * 建立新課程
   * POST /api/courses
   */
  createCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseData = req.body

    // 角色檢查由中間件或服務層處理
    const course = await courseService.createCourse(userId, courseData)

    res.status(201).json(handleCreated({
      course
    }, SUCCESS.COURSE_CREATED))
  })

  /**
   * 更新課程
   * PUT /api/courses/:id
   */
  updateCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.id)
    const updateData = req.body

    const course = await courseService.updateCourse(courseId, userId, updateData)

    res.status(200).json(handleSuccess({
      course
    }, SUCCESS.COURSE_UPDATED))
  })

  /**
   * 取得課程詳情
   * GET /api/courses/:id
   */
  getCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId
    const courseId = parseInt(req.params.id)

    const course = await courseService.getCourseById(courseId, userId)

    res.status(200).json(handleSuccess({
      course
    }))
  })

  /**
   * 取得教師課程列表
   * GET /api/courses
   */
  getCourseList = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const { page, limit } = req.query as { page?: number; limit?: number }

    const result = await courseService.getCoursesByTeacherId(userId, { page, limit })

    res.status(200).json(handleSuccess(result))
  })

  /**
   * 刪除課程
   * DELETE /api/courses/:id
   */
  deleteCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.id)

    await courseService.deleteCourse(courseId, userId)

    res.status(200).json(handleSuccess(null, SUCCESS.COURSE_DELETED))
  })

  // ==================== 課程狀態管理方法 ====================

  /**
   * 提交課程審核
   * POST /api/courses/:id/submit
   */
  submitCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.id)
    const submitData = req.body

    await courseService.submitCourse(courseId, userId, submitData)

    res.status(200).json(handleSuccess(null, SUCCESS.COURSE_SUBMITTED))
  })

  /**
   * 重新提交課程審核
   * POST /api/courses/:id/resubmit
   */
  resubmitCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.id)
    const resubmitData = req.body

    await courseService.resubmitCourse(courseId, userId, resubmitData)

    res.status(200).json(handleSuccess(null, SUCCESS.COURSE_RESUBMITTED))
  })

  /**
   * 發布課程
   * POST /api/courses/:id/publish
   */
  publishCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.id)

    await courseService.publishCourse(courseId, userId)

    res.status(200).json(handleSuccess(null, SUCCESS.COURSE_PUBLISHED))
  })

  /**
   * 封存課程
   * POST /api/courses/:id/archive
   */
  archiveCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.id)
    const archiveData = req.body

    await courseService.archiveCourse(courseId, userId, archiveData)

    res.status(200).json(handleSuccess(null, SUCCESS.COURSE_ARCHIVED))
  })
}

// 匯出控制器實例
export const courseController = new CourseController()