import { Request, Response, NextFunction } from 'express'
import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { TeacherWorkExperience } from '../entities/TeacherWorkExperience'
import { TeacherLearningExperience } from '../entities/TeacherLearningExperience'
import { TeacherCertificate } from '../entities/TeacherCertificate'
import { ResponseHelper } from '../utils/responseHelper'

/**
 * 驗證教師身份的中間件
 */
export const validateTeacherAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      // 根據請求類型返回相應的錯誤訊息
      const method = req.method
      const path = req.path

      if (method === 'POST' && path === '/') {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法建立課程'
        })
      } else if (method === 'GET' && path.match(/^\/\d+$/)) {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法查看此課程'
        })
      } else if (method === 'GET' && path === '/') {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法查看課程列表'
        })
      } else if (method === 'PUT' && path.match(/^\/\d+$/)) {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法修改此課程'
        })
      } else if (method === 'DELETE' && path.match(/^\/\d+$/)) {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法刪除此課程'
        })
      } else if (method === 'POST' && path.match(/^\/\d+\/submit$/)) {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法提交此課程'
        })
      } else if (method === 'POST' && path.match(/^\/\d+\/publish$/)) {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法發布此課程'
        })
      } else if (method === 'POST' && path.match(/^\/\d+\/archive$/)) {
        res.status(403).json({
          status: 'error',
          message: '權限不足，無法封存此課程'
        })
      } else {
        ResponseHelper.forbidden(res, '執行', '操作')
      }
      return
    }

    // 將教師資料附加到請求物件
    req.teacher = teacher
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 驗證工作經驗擁有權的中間件
 */
export const validateWorkExperienceOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const workExperienceId = parseInt(req.params.id)
    const teacher = req.teacher

    if (!teacher) {
      ResponseHelper.unauthorized(res)
      return
    }

    if (isNaN(workExperienceId)) {
      ResponseHelper.error(res, '無效的工作經驗ID')
      return
    }

    const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
    const workExperience = await workExperienceRepository.findOne({
      where: { id: workExperienceId, teacher_id: teacher.id }
    })

    if (!workExperience) {
      // 檢查是否存在但不屬於該教師
      const existsButNotOwned = await workExperienceRepository.findOne({
        where: { id: workExperienceId }
      })

      if (existsButNotOwned) {
        ResponseHelper.forbidden(res, '修改', '工作經驗記錄')
        return
      }

      ResponseHelper.notFound(res, '工作經驗記錄')
      return
    }

    // 將工作經驗資料附加到請求物件
    req.workExperience = workExperience
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 驗證學習經歷擁有權的中間件
 */
export const validateLearningExperienceOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const learningExperienceId = parseInt(req.params.id)
    const teacher = req.teacher

    if (!teacher) {
      ResponseHelper.unauthorized(res)
      return
    }

    if (isNaN(learningExperienceId)) {
      ResponseHelper.error(res, '無效的學習經歷ID')
      return
    }

    const learningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
    const learningExperience = await learningExperienceRepository.findOne({
      where: { id: learningExperienceId, teacher_id: teacher.id }
    })

    if (!learningExperience) {
      // 檢查是否存在但不屬於該教師
      const existsButNotOwned = await learningExperienceRepository.findOne({
        where: { id: learningExperienceId }
      })

      if (existsButNotOwned) {
        ResponseHelper.forbidden(res, '修改', '學習經歷')
        return
      }

      ResponseHelper.notFound(res, '學習經歷')
      return
    }

    // 將學習經歷資料附加到請求物件
    req.learningExperience = learningExperience
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 驗證證書擁有權的中間件
 */
export const validateCertificateOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const certificateId = parseInt(req.params.id)
    const teacher = req.teacher

    if (!teacher) {
      ResponseHelper.unauthorized(res)
      return
    }

    if (isNaN(certificateId)) {
      ResponseHelper.error(res, '無效的證書ID')
      return
    }

    const certificateRepository = dataSource.getRepository(TeacherCertificate)
    const certificate = await certificateRepository.findOne({
      where: { id: certificateId, teacher_id: teacher.id }
    })

    if (!certificate) {
      // 檢查是否存在但不屬於該教師
      const existsButNotOwned = await certificateRepository.findOne({
        where: { id: certificateId }
      })

      if (existsButNotOwned) {
        ResponseHelper.forbidden(res, '修改', '證書')
        return
      }

      ResponseHelper.notFound(res, '證書')
      return
    }

    // 將證書資料附加到請求物件
    req.certificate = certificate
    next()
  } catch (error) {
    next(error)
  }
}

// 擴充 Request 介面以包含額外的屬性
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
