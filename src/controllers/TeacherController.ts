import { Request, Response, NextFunction } from 'express'
import { TeacherService } from '@services/teacherService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
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
    
    res.status(201).json(handleCreated({
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

    res.status(200).json(handleSuccess({
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

    res.status(200).json(handleSuccess({
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
    
    res.status(200).json(handleSuccess({
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

    res.status(200).json(handleSuccess({
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

    res.status(200).json(handleSuccess({
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

  /**
   * 取得工作經驗列表
   */
  getWorkExperiences = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId
    
    const workExperiences = await this.teacherService.getWorkExperiences(userId)
    
    res.status(200).json(handleSuccess({
      work_experiences: workExperiences,
      total: workExperiences.length
    }, '取得工作經驗列表成功'))
  })

  /**
   * 建立工作經驗
   */
  createWorkExperience = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId
    const workExperienceData = req.body
    
    const workExperience = await this.teacherService.createWorkExperience(userId, workExperienceData)
    
    res.status(201).json(handleCreated({
      work_experience: workExperience
    }, '工作經驗已新增'))
  })

  /**
   * 更新工作經驗
   */
  updateWorkExperience = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId
    const workExperienceId = parseInt(req.params.id)
    const updateData = req.body
    
    const workExperience = await this.teacherService.updateWorkExperience(userId, workExperienceId, updateData)
    
    res.status(200).json(handleSuccess({
      work_experience: workExperience
    }, '工作經驗已更新'))
  })

  /**
   * 刪除工作經驗
   */
  deleteWorkExperience = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId
    const workExperienceId = parseInt(req.params.id)
    
    await this.teacherService.deleteWorkExperience(userId, workExperienceId)
    
    res.status(200).json(handleSuccess(null, '工作經驗已刪除'))
  })

  /**
   * 最終提交教師申請
   */
  submit = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId
    
    const teacher = await this.teacherService.submitApplication(userId)
    
    res.status(200).json(handleSuccess({
      teacher: {
        id: teacher.id,
        uuid: teacher.uuid,
        application_status: teacher.application_status,
        application_submitted_at: teacher.application_submitted_at,
        created_at: teacher.created_at,
        updated_at: teacher.updated_at
      }
    }, '教師申請已提交，等待審核'))
  })
}