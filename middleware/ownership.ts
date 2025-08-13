import { Request, Response, NextFunction } from 'express'
import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { TeacherWorkExperience } from '../entities/TeacherWorkExperience'
import { TeacherLearningExperience } from '../entities/TeacherLearningExperience'
import { TeacherCertificate } from '../entities/TeacherCertificate'
import { ResponseHelper } from '../utils/responseHelper'

/**
 * 資源擁有權驗證中間件
 */
export class OwnershipMiddleware {
  /**
   * 驗證教師身份並取得教師記錄
   */
  static async validateTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)
      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        ResponseHelper.notFound(res, '教師資料')
        return
      }

      // 將教師記錄附加到 request
      req.teacher = teacher
      next()
    } catch (error) {
      console.error('Validate teacher error:', error)
      ResponseHelper.serverError(res)
    }
  }

  /**
   * 驗證工作經驗擁有權
   */
  static async validateWorkExperienceOwnership(req: Request, res: Response, next: NextFunction) {
    try {
      const workExperienceId = req.validatedId || parseInt(req.params.id)
      const teacher = req.teacher

      if (!teacher) {
        ResponseHelper.unauthorized(res)
        return
      }

      const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
      const workExperience = await workExperienceRepository.findOne({
        where: { id: workExperienceId }
      })

      if (!workExperience) {
        ResponseHelper.notFound(res, '工作經驗')
        return
      }

      if (workExperience.teacher_id !== teacher.id) {
        ResponseHelper.forbidden(res, '修改', '工作經驗')
        return
      }

      req.workExperience = workExperience
      next()
    } catch (error) {
      console.error('Validate work experience ownership error:', error)
      ResponseHelper.serverError(res)
    }
  }

  /**
   * 驗證學習經歷擁有權
   */
  static async validateLearningExperienceOwnership(req: Request, res: Response, next: NextFunction) {
    try {
      const learningExperienceId = req.validatedId || parseInt(req.params.id)
      const teacher = req.teacher

      if (!teacher) {
        ResponseHelper.unauthorized(res)
        return
      }

      const learningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
      const learningExperience = await learningExperienceRepository.findOne({
        where: { id: learningExperienceId }
      })

      if (!learningExperience) {
        ResponseHelper.notFound(res, '學習經歷')
        return
      }

      if (learningExperience.teacher_id !== teacher.id) {
        ResponseHelper.forbidden(res, '修改', '學習經歷')
        return
      }

      req.learningExperience = learningExperience
      next()
    } catch (error) {
      console.error('Validate learning experience ownership error:', error)
      ResponseHelper.serverError(res)
    }
  }

  /**
   * 驗證證書擁有權
   */
  static async validateCertificateOwnership(req: Request, res: Response, next: NextFunction) {
    try {
      const certificateId = req.validatedId || parseInt(req.params.id)
      const teacher = req.teacher

      if (!teacher) {
        ResponseHelper.unauthorized(res)
        return
      }

      const certificateRepository = dataSource.getRepository(TeacherCertificate)
      const certificate = await certificateRepository.findOne({
        where: { id: certificateId }
      })

      if (!certificate) {
        ResponseHelper.notFound(res, '證書')
        return
      }

      if (certificate.teacher_id !== teacher.id) {
        ResponseHelper.forbidden(res, '修改', '證書')
        return
      }

      req.certificate = certificate
      next()
    } catch (error) {
      console.error('Validate certificate ownership error:', error)
      ResponseHelper.serverError(res)
    }
  }
}

// 擴展 Request 類型
declare global {
  namespace Express {
    interface Request {
      teacher?: Teacher
      workExperience?: TeacherWorkExperience
      learningExperience?: TeacherLearningExperience
      certificate?: TeacherCertificate
    }
  }
}
