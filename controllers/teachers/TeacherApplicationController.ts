import { Request, Response, NextFunction } from 'express'
import { TeacherApplicationService } from '../../services/TeacherApplicationService'
import { ResponseHelper } from '../../utils/responseHelper'
import { TeacherApplyRequest, TeacherUpdateRequest } from '../../types/teachers'

export class TeacherApplicationController {
  /**
   * 提交教師申請
   */
  static async apply(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: TeacherApplyRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const teacher = await TeacherApplicationService.apply(userId, data)

      ResponseHelper.success(
        res,
        ResponseHelper.createSuccessMessage('建立', '教師申請'),
        {
          application: {
            id: teacher.id,
            user_id: teacher.user_id,
            nationality: teacher.nationality,
            introduction: teacher.introduction,
            application_status: teacher.application_status,
            created_at: teacher.created_at.toISOString(),
            updated_at: teacher.updated_at.toISOString()
          }
        },
        201
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * 取得申請狀態
   */
  static async getApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const application = await TeacherApplicationService.getApplication(userId)

      ResponseHelper.success(res, '查詢申請狀態成功', {
        application: {
          id: application.id,
          user_id: application.user_id,
          nationality: application.nationality,
          introduction: application.introduction,
          application_status: application.application_status,
          created_at: application.created_at.toISOString(),
          updated_at: application.updated_at.toISOString()
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 更新申請資料
   */
  static async updateApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: TeacherUpdateRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const application = await TeacherApplicationService.updateApplication(userId, data)

      ResponseHelper.success(res, ResponseHelper.createSuccessMessage('更新', '申請資料'), {
        application: {
          id: application.id,
          user_id: application.user_id,
          nationality: application.nationality,
          introduction: application.introduction,
          application_status: application.application_status,
          created_at: application.created_at.toISOString(),
          updated_at: application.updated_at.toISOString()
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * 重新提交申請
   */
  static async resubmitApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const application = await TeacherApplicationService.resubmitApplication(userId)

      ResponseHelper.success(res, '申請已重新提交', {
        application: {
          id: application.id,
          user_id: application.user_id,
          nationality: application.nationality,
          introduction: application.introduction,
          application_status: application.application_status,
          created_at: application.created_at.toISOString(),
          updated_at: application.updated_at.toISOString()
        }
      })
    } catch (error) {
      next(error)
    }
  }
}
