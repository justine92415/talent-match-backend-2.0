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
import * as fs from 'fs'
import { courseService } from '@services/CourseService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { MESSAGES, SUCCESS } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'

export class CourseController {
  /**
   * 建立新課程（支援圖片上傳和價格方案）
   * POST /api/courses
   */
  createCourse = async (req: Request, res: Response, next: NextFunction) => {
    const courseImageFile = (req as any).courseImage
    
    try {
      const userId = req.user!.userId
      const courseData = req.body

      // 準備完整的課程建立資料
      const createCourseData = {
        ...courseData,
        courseImageFile // 檔案物件，由 Service 層處理上傳
      }

      // 呼叫服務層建立課程（包含圖片上傳和價格方案建立）
      const course = await courseService.createCourseWithImageAndPrices(userId, createCourseData)

      res.status(201).json(handleCreated({
        course
      }, SUCCESS.COURSE_CREATED))

    } catch (error) {
      // 錯誤處理交給中間件處理暫存檔案清理
      next(error)
    }
  }

  /**
   * 更新課程（支援圖片上傳和價格方案編輯）
   * PUT /api/courses/:id
   */
  updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    const courseImageFile = (req as any).courseImage
    
    try {
      const userId = req.user!.userId
      const courseId = parseInt(req.params.id)
      const courseData = req.body

      // 準備完整的課程更新資料
      const updateCourseData = {
        ...courseData,
        courseImageFile // 檔案物件，由 Service 層處理上傳
      }

      // 呼叫服務層更新課程（包含圖片上傳和價格方案更新）
      const course = await courseService.updateCourseWithImageAndPrices(courseId, userId, updateCourseData)

      res.status(200).json(handleSuccess({
        course
      }, SUCCESS.COURSE_UPDATED))

    } catch (error) {
      // 錯誤處理交給中間件處理暫存檔案清理
      next(error)
    }
  }

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

  /**
   * 取得課程編輯資料
   * GET /api/courses/:id/edit
   */
  getCourseForEdit = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const courseId = parseInt(req.params.id)

    const courseWithPriceOptions = await courseService.getCourseForEdit(courseId, userId)

    res.status(200).json(handleSuccess({
      course: courseWithPriceOptions
    }))
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

  /**
   * 查詢課程在特定日期的可預約時段
   * GET /api/courses/:id/available-slots?date=YYYY-MM-DD
   */
  getAvailableSlots = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const courseId = parseInt(req.params.id)
    const date = req.query.date as string

    const result = await courseService.getAvailableSlots(courseId, date)

    res.status(200).json(handleSuccess(result, '查詢可預約時段成功'))
  })
}

// 匯出控制器實例
export const courseController = new CourseController()