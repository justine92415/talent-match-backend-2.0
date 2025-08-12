import { Request, Response } from 'express'
import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { ApplicationStatus } from '../entities/enums'
import { TeacherApplyRequest } from '../types/teachers'

export class TeachersController {
  /**
   * 提交教師申請
   */
  static async apply(req: Request<{}, {}, TeacherApplyRequest>, res: Response) {
    try {
      const { nationality, introduction } = req.body
      const userId = req.user?.id
      const errors: Record<string, string[]> = {}

      // 參數驗證
      if (!nationality || nationality.trim() === '') {
        errors.nationality = ['國籍為必填欄位']
      } else if (nationality.length > 50) {
        errors.nationality = ['國籍長度不能超過50字元']
      }

      if (!introduction || introduction.trim() === '') {
        errors.introduction = ['自我介紹為必填欄位']
      } else if (introduction.length < 100) {
        errors.introduction = ['自我介紹至少需要100字元']
      } else if (introduction.length > 1000) {
        errors.introduction = ['自我介紹不能超過1000字元']
      }

      // 如果有驗證錯誤，直接回傳
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          status: 'error',
          message: '參數驗證失敗',
          errors
        })
      }

      const teacherRepository = dataSource.getRepository(Teacher)

      // 檢查是否已有申請記錄
      const existingApplication = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (existingApplication) {
        return res.status(409).json({
          status: 'error',
          message: '您已提交過教師申請'
        })
      }

      // 建立教師申請記錄
      const teacher = teacherRepository.create({
        user_id: userId,
        nationality: nationality.trim(),
        introduction: introduction.trim(),
        application_status: ApplicationStatus.PENDING
      })

      const savedTeacher = await teacherRepository.save(teacher)

      return res.status(201).json({
        status: 'success',
        message: '教師申請提交成功',
        data: {
          application: {
            id: savedTeacher.id,
            user_id: savedTeacher.user_id,
            nationality: savedTeacher.nationality,
            introduction: savedTeacher.introduction,
            application_status: savedTeacher.application_status,
            applied_at: savedTeacher.created_at
          }
        }
      })
    } catch (error) {
      console.error('教師申請錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 查看教師申請狀態
   */
  static async getApplication(req: Request, res: Response) {
    try {
      const userId = req.user?.id
      const teacherRepository = dataSource.getRepository(Teacher)

      const application = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!application) {
        return res.status(404).json({
          status: 'error',
          message: '找不到申請記錄'
        })
      }

      return res.status(200).json({
        status: 'success',
        message: '查詢申請狀態成功',
        data: {
          application: {
            id: application.id,
            user_id: application.user_id,
            nationality: application.nationality,
            introduction: application.introduction,
            application_status: application.application_status,
            applied_at: application.created_at,
            reviewed_at: application.updated_at !== application.created_at ? application.updated_at : null
          }
        }
      })
    } catch (error) {
      console.error('查詢申請狀態錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }
}
