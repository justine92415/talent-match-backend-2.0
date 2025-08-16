import { Request, Response, NextFunction } from 'express'
import { TeacherService } from '@services/teacherService'
import { ResponseFormatter } from '@utils/response-formatter'
import { handleErrorAsync } from '@utils/index'
import { Teacher } from '@entities/Teacher'

/**
 * 教師相關的控制器類別
 * 負責處理教師申請相關的 HTTP 請求和回應
 */
export class TeacherController {
  private readonly teacherService: TeacherService

  constructor() {
    this.teacherService = new TeacherService()
  }

  /**
   * 申請成為教師
   */
  apply = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，req.user 必定存在
    const { nationality, introduction } = req.body

    const teacher = await this.teacherService.apply(userId, { nationality, introduction })
    
    res.status(201).json(ResponseFormatter.created({
      teacher: {
        id: teacher.id,
        uuid: teacher.uuid,
        user_id: teacher.user_id,
        nationality: teacher.nationality,
        introduction: teacher.introduction,
        application_status: teacher.application_status,
        application_submitted_at: teacher.application_submitted_at,
        application_reviewed_at: teacher.application_reviewed_at,
        reviewer_id: teacher.reviewer_id,
        review_notes: teacher.review_notes,
        created_at: teacher.created_at,
        updated_at: teacher.updated_at
      }
    }, '教師申請已建立'))
  })

  /**
   * 獲取教師申請
   */
  getApplication = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，req.user 必定存在

    const teacher = await this.teacherService.getApplication(userId)

    res.status(200).json(ResponseFormatter.success({
      teacher: {
        id: teacher.id,
        uuid: teacher.uuid,
        user_id: teacher.user_id,
        nationality: teacher.nationality,
        introduction: teacher.introduction,
        application_status: teacher.application_status,
        application_submitted_at: teacher.application_submitted_at,
        application_reviewed_at: teacher.application_reviewed_at,
        reviewer_id: teacher.reviewer_id,
        review_notes: teacher.review_notes,
        created_at: teacher.created_at,
        updated_at: teacher.updated_at
      }
    }, '取得申請狀態成功'))
  })

  /**
   * 更新教師申請
   */
  updateApplication = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，req.user 必定存在
    const { nationality, introduction } = req.body

    const teacher = await this.teacherService.updateApplication(userId, {
      nationality,
      introduction
    })

    res.status(200).json(ResponseFormatter.success({
      teacher: {
        id: teacher.id,
        uuid: teacher.uuid,
        user_id: teacher.user_id,
        nationality: teacher.nationality,
        introduction: teacher.introduction,
        application_status: teacher.application_status,
        application_submitted_at: teacher.application_submitted_at,
        application_reviewed_at: teacher.application_reviewed_at,
        reviewer_id: teacher.reviewer_id,
        review_notes: teacher.review_notes,
        created_at: teacher.created_at,
        updated_at: teacher.updated_at
      }
    }, '申請資料更新成功'))
  })

  /**
   * 重新提交申請
   */
  resubmitApplication = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，req.user 必定存在

    const teacher = await this.teacherService.resubmitApplication(userId)
    
    res.status(200).json(ResponseFormatter.success({
      teacher: {
        id: teacher.id,
        uuid: teacher.uuid,
        application_status: teacher.application_status,
        application_submitted_at: teacher.application_submitted_at,
        application_reviewed_at: teacher.application_reviewed_at,
        reviewer_id: teacher.reviewer_id,
        review_notes: teacher.review_notes,
        updated_at: teacher.updated_at
      }
    }, '申請已重新提交'))
  })

  /**
   * 取得教師基本資料
   */
  getProfile = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，req.user 必定存在

    const teacher = await this.teacherService.getProfile(userId)

    res.status(200).json(ResponseFormatter.success({
      teacher: {
        id: teacher.id,
        uuid: teacher.uuid,
        user_id: teacher.user_id,
        nationality: teacher.nationality,
        introduction: teacher.introduction,
        application_status: teacher.application_status,
        application_submitted_at: teacher.application_submitted_at,
        application_reviewed_at: teacher.application_reviewed_at,
        reviewer_id: teacher.reviewer_id,
        review_notes: teacher.review_notes,
        total_students: teacher.total_students,
        total_courses: teacher.total_courses,
        average_rating: teacher.average_rating,
        total_earnings: teacher.total_earnings,
        created_at: teacher.created_at,
        updated_at: teacher.updated_at
      }
    }, '取得教師資料成功'))
  })

  /**
   * 更新教師基本資料
   */
  updateProfile = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId // 經過 authenticateToken 中間件後，req.user 必定存在
    const { nationality, introduction } = req.body

    const teacher = await this.teacherService.updateProfile(userId, {
      nationality,
      introduction
    })

    res.status(200).json(ResponseFormatter.success({
      teacher: {
        id: teacher.id,
        nationality: teacher.nationality,
        introduction: teacher.introduction,
        application_status: teacher.application_status,
        updated_at: teacher.updated_at
      },
      notice: '由於修改了重要資料，需要重新審核'
    }, '教師資料更新成功'))
  })
}