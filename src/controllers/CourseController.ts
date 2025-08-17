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
import { courseService } from '@services/courseService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { ERROR_MESSAGES } from '@constants/Message'

export class CourseController {
  /**
   * 建立新課程
   * POST /api/courses
   */
  createCourse = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 檢查教師角色
    if (req.user?.role !== 'teacher') {
      res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: '需要教師權限才能建立課程'
      })
      return
    }

    const userId = req.user!.userId
    const courseData = req.body

    const course = await courseService.createCourse(userId, courseData)

    res.status(201).json(handleCreated({
      course
    }, ERROR_MESSAGES.SUCCESS.COURSE_CREATED))
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
    }, ERROR_MESSAGES.SUCCESS.COURSE_UPDATED))
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
    const { page, limit } = req.query as any

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

    res.status(200).json(handleSuccess(null, ERROR_MESSAGES.SUCCESS.COURSE_DELETED))
  })
}

// 匯出控制器實例
export const courseController = new CourseController()