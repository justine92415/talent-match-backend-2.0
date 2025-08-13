import { Request, Response } from 'express'
import { TeacherLearningExperienceService } from '../../services/TeacherLearningExperienceService'
import { ResponseHelper } from '../../utils/responseHelper'
import { ValidationError, NotFoundError } from '../../middleware/errorHandler'
import {
  TeacherLearningExperienceRequest,
  TeacherLearningExperienceUpdateRequest,
  TeacherLearningExperienceListResponse,
  TeacherLearningExperienceResponse
} from '../../types/teachers'

export class TeacherLearningExperienceController {
  /**
   * 取得學習經歷列表
   */
  static async getLearningExperiences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const learningExperiences = await TeacherLearningExperienceService.getLearningExperiences(userId)

      const response: TeacherLearningExperienceListResponse = {
        status: 'success',
        message: '取得學習經歷列表成功',
        data: {
          learning_experiences: learningExperiences.map(exp => ({
            id: exp.id,
            teacher_id: exp.teacher_id,
            is_in_school: exp.is_in_school,
            degree: exp.degree,
            school_name: exp.school_name,
            department: exp.department,
            region: exp.region,
            start_year: exp.start_year,
            start_month: exp.start_month,
            end_year: exp.end_year,
            end_month: exp.end_month,
            file_path: exp.file_path,
            created_at: exp.created_at.toISOString(),
            updated_at: exp.updated_at.toISOString()
          }))
        }
      }

      res.status(200).json(response)
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '學習經歷')
      } else {
        console.error('Get learning experiences error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 新增學習經歷
   */
  static async createLearningExperience(req: Request, res: Response): Promise<void> {
    try {
      const data: TeacherLearningExperienceRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const savedLearningExperience = await TeacherLearningExperienceService.createLearningExperience(userId, data)

      const response: TeacherLearningExperienceResponse = {
        status: 'success',
        message: '新增學習經歷成功',
        data: {
          learning_experience: {
            id: savedLearningExperience.id,
            teacher_id: savedLearningExperience.teacher_id,
            is_in_school: savedLearningExperience.is_in_school,
            degree: savedLearningExperience.degree,
            school_name: savedLearningExperience.school_name,
            department: savedLearningExperience.department,
            region: savedLearningExperience.region,
            start_year: savedLearningExperience.start_year,
            start_month: savedLearningExperience.start_month,
            end_year: savedLearningExperience.end_year,
            end_month: savedLearningExperience.end_month,
            file_path: savedLearningExperience.file_path,
            created_at: savedLearningExperience.created_at.toISOString(),
            updated_at: savedLearningExperience.updated_at.toISOString()
          }
        }
      }

      res.status(201).json(response)
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '學習經歷')
      } else if (error instanceof ValidationError) {
        // 檢查是否是權限錯誤
        if (error.errors.permission) {
          ResponseHelper.forbidden(res, '建立', '學習經歷')
        } else {
          ResponseHelper.validationError(res, error.errors)
        }
      } else {
        console.error('Create learning experience error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 更新學習經歷
   */
  static async updateLearningExperience(req: Request, res: Response): Promise<void> {
    try {
      const learningExperienceId = parseInt(req.params.id)
      const updateData: TeacherLearningExperienceUpdateRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      if (isNaN(learningExperienceId)) {
        ResponseHelper.error(res, '無效的學習經歷ID')
        return
      }

      const updatedLearningExperience = await TeacherLearningExperienceService.updateLearningExperience(userId, learningExperienceId, updateData)

      const response: TeacherLearningExperienceResponse = {
        status: 'success',
        message: '更新學習經歷成功',
        data: {
          learning_experience: {
            id: updatedLearningExperience.id,
            teacher_id: updatedLearningExperience.teacher_id,
            is_in_school: updatedLearningExperience.is_in_school,
            degree: updatedLearningExperience.degree,
            school_name: updatedLearningExperience.school_name,
            department: updatedLearningExperience.department,
            region: updatedLearningExperience.region,
            start_year: updatedLearningExperience.start_year,
            start_month: updatedLearningExperience.start_month,
            end_year: updatedLearningExperience.end_year,
            end_month: updatedLearningExperience.end_month,
            file_path: updatedLearningExperience.file_path,
            created_at: updatedLearningExperience.created_at.toISOString(),
            updated_at: updatedLearningExperience.updated_at.toISOString()
          }
        }
      }

      res.status(200).json(response)
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '學習經歷')
      } else if (error instanceof ValidationError) {
        // 檢查是否是權限錯誤
        if (error.errors.permission) {
          ResponseHelper.forbidden(res, '修改', '學習經歷')
        } else {
          ResponseHelper.validationError(res, error.errors)
        }
      } else {
        console.error('Update learning experience error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 刪除學習經歷
   */
  static async deleteLearningExperience(req: Request, res: Response): Promise<void> {
    try {
      const learningExperienceId = parseInt(req.params.id)
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      if (isNaN(learningExperienceId)) {
        ResponseHelper.error(res, '無效的學習經歷ID')
        return
      }

      await TeacherLearningExperienceService.deleteLearningExperience(userId, learningExperienceId)

      res.status(200).json({
        status: 'success',
        message: '刪除學習經歷成功'
      })
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '學習經歷')
      } else if (error instanceof ValidationError) {
        if (error.errors.permission) {
          ResponseHelper.forbidden(res, '刪除', '學習經歷')
        } else {
          ResponseHelper.validationError(res, error.errors)
        }
      } else {
        console.error('Delete learning experience error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }
}
