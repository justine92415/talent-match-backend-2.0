import { Request, Response, NextFunction } from 'express'
import { CourseService } from '../services/CourseService'
import { ResponseHelper } from '../utils/responseHelper'
import { CreateCourseRequest, UpdateCourseRequest, CourseListQuery, CourseSubmitRequest, CourseArchiveRequest } from '../types/courses'

export class CourseController {
  /**
   * 建立課程草稿
   */
  static async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      // 2. 呼叫 Service 處理業務邏輯
      const courseData: CreateCourseRequest = req.body
      const course = await CourseService.createCourse(userId, courseData)

      // 3. 統一成功回應
      ResponseHelper.success(res, '建立課程成功', { course }, 201)
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新課程資料
   */
  static async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const courseId = parseInt(req.params.id)
      if (isNaN(courseId)) {
        ResponseHelper.validationError(res, { id: ['課程ID格式不正確'] })
        return
      }

      // 2. 呼叫 Service 處理業務邏輯
      const updateData: UpdateCourseRequest = req.body
      const course = await CourseService.updateCourse(courseId, userId, updateData)

      // 3. 統一成功回應
      ResponseHelper.success(res, '更新課程成功', { course })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 取得課程詳情
   */
  static async getCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const courseId = parseInt(req.params.id)
      if (isNaN(courseId)) {
        ResponseHelper.validationError(res, { id: ['課程ID格式不正確'] })
        return
      }

      // 2. 呼叫 Service 處理業務邏輯
      const course = await CourseService.getCourseById(courseId, userId)

      // 3. 統一成功回應
      ResponseHelper.success(res, '查詢成功', { course })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 取得教師課程列表
   */
  static async getCourseList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      // 2. 解析查詢參數
      const query: CourseListQuery = {
        status: req.query.status as any,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        per_page: req.query.per_page ? parseInt(req.query.per_page as string) : undefined
      }

      // 3. 呼叫 Service 處理業務邏輯
      const result = await CourseService.getCourseList(userId, query)

      // 4. 統一成功回應
      ResponseHelper.success(res, '查詢成功', result)
    } catch (error) {
      next(error)
    }
  }

  /**
   * 刪除課程
   */
  static async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const courseId = parseInt(req.params.id)
      if (isNaN(courseId)) {
        ResponseHelper.validationError(res, { id: ['課程ID格式不正確'] })
        return
      }

      // 2. 呼叫 Service 處理業務邏輯
      await CourseService.deleteCourse(courseId, userId)

      // 3. 統一成功回應
      ResponseHelper.success(res, '刪除課程成功')
    } catch (error) {
      next(error)
    }
  }

  /**
   * 提交課程審核
   */
  static async submitCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const courseId = parseInt(req.params.id)
      if (isNaN(courseId)) {
        ResponseHelper.validationError(res, { id: ['課程ID格式不正確'] })
        return
      }

      // 2. 呼叫 Service 處理業務邏輯
      const submitData: CourseSubmitRequest = req.body
      const course = await CourseService.submitCourse(courseId, userId, submitData)

      // 3. 統一成功回應
      ResponseHelper.success(res, '課程已提交審核', { course })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 發布課程
   */
  static async publishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const courseId = parseInt(req.params.id)
      if (isNaN(courseId)) {
        ResponseHelper.validationError(res, { id: ['課程ID格式不正確'] })
        return
      }

      // 2. 呼叫 Service 處理業務邏輯
      const course = await CourseService.publishCourse(courseId, userId)

      // 3. 統一成功回應
      ResponseHelper.success(res, '發布課程成功', { course })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 封存課程
   */
  static async archiveCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. 基本參數驗證
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const courseId = parseInt(req.params.id)
      if (isNaN(courseId)) {
        ResponseHelper.validationError(res, { id: ['課程ID格式不正確'] })
        return
      }

      // 2. 呼叫 Service 處理業務邏輯
      const archiveData: CourseArchiveRequest = req.body
      const course = await CourseService.archiveCourse(courseId, userId, archiveData)

      // 3. 統一成功回應
      ResponseHelper.success(res, '封存課程成功', { course })
    } catch (error) {
      next(error)
    }
  }
}
