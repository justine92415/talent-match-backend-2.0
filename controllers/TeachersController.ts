import { Request, Response } from 'express'
import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { ApplicationStatus } from '../entities/enums'
import { TeacherApplyRequest, TeacherApplyResponse, TeacherUpdateRequest, TeacherProfileRequest, TeacherProfileResponse } from '../types/teachers'

export class TeachersController {
  /**
   * 申請成為教師
   */
  static async apply(req: Request, res: Response): Promise<void> {
    try {
      const { nationality, introduction }: TeacherApplyRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      // 參數驗證
      const errors: Record<string, string[]> = {}

      if (!nationality || nationality.trim() === '') {
        errors.nationality = ['國籍為必填欄位']
      } else if (nationality.length > 50) {
        errors.nationality = ['國籍長度不能超過 50 字']
      }

      if (!introduction || introduction.trim() === '') {
        errors.introduction = ['自我介紹為必填欄位']
      } else if (introduction.length < 100) {
        errors.introduction = ['自我介紹至少需要 100 字']
      } else if (introduction.length > 1000) {
        errors.introduction = ['自我介紹不能超過 1000 字']
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({
          status: 'error',
          message: '參數驗證失敗',
          errors
        })
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)

      // 檢查是否已有申請記錄
      const existingApplication = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (existingApplication) {
        res.status(409).json({
          status: 'error',
          message: '您已提交過教師申請'
        })
        return
      }

      // 建立教師申請
      const teacher = teacherRepository.create({
        user_id: userId,
        nationality: nationality.trim(),
        introduction: introduction.trim(),
        application_status: ApplicationStatus.PENDING
      })

      const savedTeacher = await teacherRepository.save(teacher)

      const response: TeacherApplyResponse = {
        status: 'success',
        message: '教師申請提交成功',
        data: {
          application: {
            id: savedTeacher.id,
            user_id: savedTeacher.user_id,
            nationality: savedTeacher.nationality,
            introduction: savedTeacher.introduction,
            application_status: savedTeacher.application_status,
            created_at: savedTeacher.created_at.toISOString(),
            updated_at: savedTeacher.updated_at.toISOString()
          }
        }
      }

      res.status(201).json(response)
    } catch (error) {
      console.error('Teacher apply error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 取得教師申請狀態
   */
  static async getApplication(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)

      const application = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!application) {
        res.status(404).json({
          status: 'error',
          message: '找不到申請記錄'
        })
        return
      }

      const response: TeacherApplyResponse = {
        status: 'success',
        message: '查詢申請狀態成功',
        data: {
          application: {
            id: application.id,
            user_id: application.user_id,
            nationality: application.nationality,
            introduction: application.introduction,
            application_status: application.application_status,
            created_at: application.created_at.toISOString(),
            updated_at: application.updated_at.toISOString()
          }
        }
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Get teacher application error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 更新教師申請資料
   */
  static async updateApplication(req: Request, res: Response): Promise<void> {
    try {
      const { nationality, introduction }: TeacherUpdateRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      // 參數驗證
      const errors: Record<string, string[]> = {}

      if (nationality !== undefined) {
        if (!nationality || nationality.trim() === '') {
          errors.nationality = ['國籍不能為空']
        } else if (nationality.length > 50) {
          errors.nationality = ['國籍長度不能超過 50 字']
        }
      }

      if (introduction !== undefined) {
        if (!introduction || introduction.trim() === '') {
          errors.introduction = ['自我介紹不能為空']
        } else if (introduction.length < 100) {
          errors.introduction = ['自我介紹至少需要 100 字']
        } else if (introduction.length > 1000) {
          errors.introduction = ['自我介紹不能超過 1000 字']
        }
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({
          status: 'error',
          message: '參數驗證失敗',
          errors
        })
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)

      // 檢查申請記錄是否存在
      const application = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!application) {
        res.status(404).json({
          status: 'error',
          message: '找不到申請記錄'
        })
        return
      }

      // 檢查申請狀態是否允許更新
      if (application.application_status !== ApplicationStatus.PENDING && application.application_status !== ApplicationStatus.REJECTED) {
        res.status(422).json({
          status: 'error',
          message: '只有待審核或被拒絕的申請才能更新'
        })
        return
      }

      // 更新資料
      const updateData: Partial<Teacher> = {}
      if (nationality !== undefined) {
        updateData.nationality = nationality.trim()
      }
      if (introduction !== undefined) {
        updateData.introduction = introduction.trim()
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          status: 'error',
          message: '至少需要提供一個欄位進行更新'
        })
        return
      }

      await teacherRepository.update({ user_id: userId }, updateData)

      // 取得更新後的資料
      const updatedApplication = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      const response: TeacherApplyResponse = {
        status: 'success',
        message: '申請資料更新成功',
        data: {
          application: {
            id: updatedApplication!.id,
            user_id: updatedApplication!.user_id,
            nationality: updatedApplication!.nationality,
            introduction: updatedApplication!.introduction,
            application_status: updatedApplication!.application_status,
            created_at: updatedApplication!.created_at.toISOString(),
            updated_at: updatedApplication!.updated_at.toISOString()
          }
        }
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Update teacher application error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 重新提交被拒絕的申請
   */
  static async resubmitApplication(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)

      // 檢查申請記錄是否存在
      const application = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!application) {
        res.status(404).json({
          status: 'error',
          message: '找不到申請記錄'
        })
        return
      }

      // 檢查申請狀態是否為 rejected
      if (application.application_status !== ApplicationStatus.REJECTED) {
        res.status(422).json({
          status: 'error',
          message: '只有被拒絕的申請才能重新提交'
        })
        return
      }

      // 將狀態重設為 pending
      await teacherRepository.update({ user_id: userId }, { application_status: ApplicationStatus.PENDING })

      // 取得更新後的資料
      const updatedApplication = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      const response: TeacherApplyResponse = {
        status: 'success',
        message: '申請已重新提交',
        data: {
          application: {
            id: updatedApplication!.id,
            user_id: updatedApplication!.user_id,
            nationality: updatedApplication!.nationality,
            introduction: updatedApplication!.introduction,
            application_status: updatedApplication!.application_status,
            created_at: updatedApplication!.created_at.toISOString(),
            updated_at: updatedApplication!.updated_at.toISOString()
          }
        }
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Resubmit teacher application error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 取得教師基本資料
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)

      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        res.status(404).json({
          status: 'error',
          message: '找不到教師資料'
        })
        return
      }

      const response: TeacherProfileResponse = {
        status: 'success',
        message: '取得教師資料成功',
        data: {
          teacher: {
            id: teacher.id,
            user_id: teacher.user_id,
            nationality: teacher.nationality,
            introduction: teacher.introduction,
            application_status: teacher.application_status,
            created_at: teacher.created_at.toISOString(),
            updated_at: teacher.updated_at.toISOString()
          }
        }
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Get teacher profile error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 更新教師基本資料
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const { nationality, introduction }: TeacherProfileRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      // 參數驗證
      const errors: Record<string, string[]> = {}

      if (nationality !== undefined) {
        if (!nationality || nationality.trim() === '') {
          errors.nationality = ['國籍不能為空']
        } else if (nationality.length > 50) {
          errors.nationality = ['國籍長度不能超過 50 字']
        }
      }

      if (introduction !== undefined) {
        if (!introduction || introduction.trim() === '') {
          errors.introduction = ['自我介紹不能為空']
        } else if (introduction.length < 100) {
          errors.introduction = ['自我介紹至少需要 100 字']
        } else if (introduction.length > 1000) {
          errors.introduction = ['自我介紹不能超過 1000 字']
        }
      }

      if (Object.keys(errors).length > 0) {
        res.status(400).json({
          status: 'error',
          message: '參數驗證失敗',
          errors
        })
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)

      // 檢查教師記錄是否存在
      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        res.status(404).json({
          status: 'error',
          message: '找不到教師資料'
        })
        return
      }

      // 準備更新資料
      const updateData: Partial<Teacher> = {}
      if (nationality !== undefined) {
        updateData.nationality = nationality.trim()
      }
      if (introduction !== undefined) {
        updateData.introduction = introduction.trim()
      }

      // 如果沒有提供任何更新欄位，仍然允許（部分更新的情況）
      if (Object.keys(updateData).length > 0) {
        await teacherRepository.update({ user_id: userId }, updateData)
      }

      // 取得更新後的資料
      const updatedTeacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      const response: TeacherProfileResponse = {
        status: 'success',
        message: '教師資料更新成功',
        data: {
          teacher: {
            id: updatedTeacher!.id,
            user_id: updatedTeacher!.user_id,
            nationality: updatedTeacher!.nationality,
            introduction: updatedTeacher!.introduction,
            application_status: updatedTeacher!.application_status,
            created_at: updatedTeacher!.created_at.toISOString(),
            updated_at: updatedTeacher!.updated_at.toISOString()
          }
        }
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Update teacher profile error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }
}
