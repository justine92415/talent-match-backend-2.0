import { Request, Response, NextFunction } from 'express'
import { TeacherWorkExperienceService } from '../../services/TeacherWorkExperienceService'
import { ResponseHelper } from '../../utils/responseHelper'
import { TeacherWorkExperienceRequest, TeacherWorkExperienceUpdateRequest } from '../../types/teachers'

export class TeacherWorkExperienceController {
  /**
   * 取得工作經驗列表
   */
  static async getWorkExperiences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const workExperiences = await TeacherWorkExperienceService.getWorkExperiences(userId)

      ResponseHelper.success(res, '取得工作經驗列表成功', {
        work_experiences: workExperiences.map(exp => ({
          id: exp.id,
          teacher_id: exp.teacher_id,
          is_working: exp.is_working,
          company_name: exp.company_name,
          workplace: exp.workplace,
          job_category: exp.job_category,
          job_title: exp.job_title,
          start_year: exp.start_year,
          start_month: exp.start_month,
          end_year: exp.end_year,
          end_month: exp.end_month,
          created_at: exp.created_at.toISOString(),
          updated_at: exp.updated_at.toISOString()
        }))
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 建立工作經驗
   */
  static async createWorkExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: TeacherWorkExperienceRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const workExperience = await TeacherWorkExperienceService.createWorkExperience(userId, data)

      ResponseHelper.success(
        res,
        '建立工作經驗成功',
        {
          work_experience: {
            id: workExperience.id,
            teacher_id: workExperience.teacher_id,
            is_working: workExperience.is_working,
            company_name: workExperience.company_name,
            workplace: workExperience.workplace,
            job_category: workExperience.job_category,
            job_title: workExperience.job_title,
            start_year: workExperience.start_year,
            start_month: workExperience.start_month,
            end_year: workExperience.end_year,
            end_month: workExperience.end_month,
            created_at: workExperience.created_at.toISOString(),
            updated_at: workExperience.updated_at.toISOString()
          }
        },
        201
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新工作經驗
   */
  static async updateWorkExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: TeacherWorkExperienceUpdateRequest = req.body
      const userId = req.user?.id
      const experienceId = parseInt(req.params.id)

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      if (!experienceId || isNaN(experienceId)) {
        ResponseHelper.error(res, '無效的工作經驗ID')
        return
      }

      const workExperience = await TeacherWorkExperienceService.updateWorkExperience(userId, experienceId, data)

      ResponseHelper.success(res, '更新工作經驗成功', {
        work_experience: {
          id: workExperience.id,
          teacher_id: workExperience.teacher_id,
          is_working: workExperience.is_working,
          company_name: workExperience.company_name,
          workplace: workExperience.workplace,
          job_category: workExperience.job_category,
          job_title: workExperience.job_title,
          start_year: workExperience.start_year,
          start_month: workExperience.start_month,
          end_year: workExperience.end_year,
          end_month: workExperience.end_month,
          created_at: workExperience.created_at.toISOString(),
          updated_at: workExperience.updated_at.toISOString()
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 刪除工作經驗
   */
  static async deleteWorkExperience(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id
      const experienceId = parseInt(req.params.id)

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      if (!experienceId || isNaN(experienceId)) {
        ResponseHelper.error(res, '無效的工作經驗ID')
        return
      }

      await TeacherWorkExperienceService.deleteWorkExperience(userId, experienceId)

      ResponseHelper.success(res, '刪除工作經驗成功')
    } catch (error) {
      next(error)
    }
  }
}
