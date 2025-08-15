import { Request, Response, NextFunction } from 'express'
import { TeacherService } from '../services/teacherService'
import { handleErrorAsync } from '../utils'
import { 
  validateTeacherApplication, 
  validateTeacherApplicationUpdate 
} from '../utils/teacherValidation'

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
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: '未提供認證令牌',
        errors: {}
      })
      return
    }

    const { nationality, introduction } = req.body

    // 參數驗證
    const validationErrors = validateTeacherApplication(nationality, introduction)
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        status: 'error',
        message: '參數驗證失敗',
        errors: validationErrors
      })
      return
    }

    try {
      const teacher = await this.teacherService.apply(userId, { nationality, introduction })
      
      res.status(201).json({
        status: 'success',
        message: '教師申請已建立',
        data: {
          teacher: {
            id: teacher.id,
            uuid: teacher.uuid,
            user_id: teacher.user_id,
            nationality: teacher.nationality,
            introduction: teacher.introduction,
            application_status: teacher.application_status,
            application_submitted_at: teacher.application_submitted_at,
            created_at: teacher.created_at
          }
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === '只有學生可以申請成為教師') {
          res.status(403).json({
            status: 'error',
            message: error.message,
            errors: {}
          })
          return
        }
        if (error.message === '帳號狀態異常，無法申請') {
          res.status(403).json({
            status: 'error',
            message: error.message,
            errors: {}
          })
          return
        }
        if (error.message === '您已經有教師申請記錄') {
          res.status(409).json({
            status: 'error',
            message: error.message,
            errors: {}
          })
          return
        }
      }
      throw error
    }
  })

  /**
   * 取得申請狀態
   */
  getApplication = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: '未提供認證令牌',
        errors: {}
      })
      return
    }

    try {
      const teacher = await this.teacherService.getApplication(userId)
      
      res.status(200).json({
        status: 'success',
        message: '取得申請狀態成功',
        data: {
          teacher: {
            id: teacher.id,
            uuid: teacher.uuid,
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
        }
      })
    } catch (error) {
      if (error instanceof Error && error.message === '找不到教師申請記錄') {
        res.status(404).json({
          status: 'error',
          message: error.message
        })
        return
      }
      throw error
    }
  })

  /**
   * 更新申請資料
   */
  updateApplication = handleErrorAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: '未提供認證令牌',
        errors: {}
      })
      return
    }

    const { nationality, introduction } = req.body

    // 參數驗證
    const validationErrors = validateTeacherApplicationUpdate(nationality, introduction)
    if (Object.keys(validationErrors).length > 0) {
      res.status(400).json({
        status: 'error',
        message: '參數驗證失敗',
        errors: validationErrors
      })
      return
    }

    try {
      const teacher = await this.teacherService.updateApplication(userId, { nationality, introduction })
      
      res.status(200).json({
        status: 'success',
        message: '申請資料更新成功',
        data: {
          teacher: {
            id: teacher.id,
            nationality: teacher.nationality,
            introduction: teacher.introduction,
            updated_at: teacher.updated_at
          }
        }
      })
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === '找不到教師申請記錄') {
          res.status(404).json({
            status: 'error',
            message: error.message
          })
          return
        }
        if (error.message === '只能在待審核或已拒絕狀態下修改申請') {
          res.status(400).json({
            status: 'error',
            message: error.message
          })
          return
        }
      }
      throw error
    }
  })
}