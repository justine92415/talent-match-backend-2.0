import { Request, Response } from 'express'
import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { TeacherWorkExperience } from '../entities/TeacherWorkExperience'
import { ApplicationStatus } from '../entities/enums'
import {
  TeacherApplyRequest,
  TeacherApplyResponse,
  TeacherUpdateRequest,
  TeacherProfileRequest,
  TeacherProfileResponse,
  TeacherWorkExperienceRequest,
  TeacherWorkExperienceUpdateRequest,
  TeacherWorkExperienceListResponse,
  TeacherWorkExperienceResponse
} from '../types/teachers'

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

  /**
   * 取得教師工作經驗列表
   */
  static async getWorkExperiences(req: Request, res: Response): Promise<void> {
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
      const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)

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

      // 取得工作經驗列表
      const workExperiences = await workExperienceRepository.find({
        where: { teacher_id: teacher.id },
        order: { start_year: 'DESC', start_month: 'DESC' }
      })

      const response: TeacherWorkExperienceListResponse = {
        status: 'success',
        message: '取得工作經驗列表成功',
        data: {
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
        }
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Get work experiences error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 新增工作經驗
   */
  static async createWorkExperience(req: Request, res: Response): Promise<void> {
    try {
      const { is_working, company_name, workplace, job_category, job_title, start_year, start_month, end_year, end_month }: TeacherWorkExperienceRequest =
        req.body
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

      if (is_working === undefined || is_working === null) {
        errors.is_working = ['在職狀態為必填欄位']
      }

      if (!company_name || company_name.trim() === '') {
        errors.company_name = ['公司名稱為必填欄位']
      } else if (company_name.length > 200) {
        errors.company_name = ['公司名稱長度不能超過 200 字']
      }

      if (!workplace || workplace.trim() === '') {
        errors.workplace = ['工作地點為必填欄位']
      } else if (workplace.length > 200) {
        errors.workplace = ['工作地點長度不能超過 200 字']
      }

      if (!job_category || job_category.trim() === '') {
        errors.job_category = ['工作類別為必填欄位']
      } else if (job_category.length > 100) {
        errors.job_category = ['工作類別長度不能超過 100 字']
      }

      if (!job_title || job_title.trim() === '') {
        errors.job_title = ['職位名稱為必填欄位']
      } else if (job_title.length > 100) {
        errors.job_title = ['職位名稱長度不能超過 100 字']
      }

      if (!start_year || start_year < 1970 || start_year > new Date().getFullYear()) {
        errors.start_year = ['開始年份格式錯誤或超出合理範圍']
      }

      if (!start_month || start_month < 1 || start_month > 12) {
        errors.start_month = ['開始月份必須在 1-12 之間']
      }

      // 如果不是目前在職，需要結束時間
      if (!is_working) {
        if (!end_year || end_year < 1970 || end_year > new Date().getFullYear()) {
          errors.end_year = ['結束年份格式錯誤或超出合理範圍']
        }

        if (!end_month || end_month < 1 || end_month > 12) {
          errors.end_month = ['結束月份必須在 1-12 之間']
        }

        // 檢查結束時間是否晚於開始時間
        if (end_year && end_month && start_year && start_month) {
          const startDate = new Date(start_year, start_month - 1)
          const endDate = new Date(end_year, end_month - 1)

          if (endDate <= startDate) {
            errors.end_date = ['結束時間必須晚於開始時間']
          }
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
      const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)

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

      // 建立工作經驗記錄
      const workExperience = new TeacherWorkExperience()
      workExperience.teacher_id = teacher.id
      workExperience.is_working = is_working
      workExperience.company_name = company_name.trim()
      workExperience.workplace = workplace.trim()
      workExperience.job_category = job_category.trim()
      workExperience.job_title = job_title.trim()
      workExperience.start_year = start_year
      workExperience.start_month = start_month
      workExperience.end_year = is_working ? null : end_year!
      workExperience.end_month = is_working ? null : end_month!

      const savedWorkExperience = await workExperienceRepository.save(workExperience)

      const response: TeacherWorkExperienceResponse = {
        status: 'success',
        message: '工作經驗新增成功',
        data: {
          work_experience: {
            id: savedWorkExperience.id,
            teacher_id: savedWorkExperience.teacher_id,
            is_working: savedWorkExperience.is_working,
            company_name: savedWorkExperience.company_name,
            workplace: savedWorkExperience.workplace,
            job_category: savedWorkExperience.job_category,
            job_title: savedWorkExperience.job_title,
            start_year: savedWorkExperience.start_year,
            start_month: savedWorkExperience.start_month,
            end_year: savedWorkExperience.end_year,
            end_month: savedWorkExperience.end_month,
            created_at: savedWorkExperience.created_at.toISOString(),
            updated_at: savedWorkExperience.updated_at.toISOString()
          }
        }
      }

      res.status(201).json(response)
    } catch (error) {
      console.error('Create work experience error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 更新工作經驗
   */
  static async updateWorkExperience(req: Request, res: Response): Promise<void> {
    try {
      const workExperienceId = parseInt(req.params.id)
      const updateData: TeacherWorkExperienceUpdateRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      if (isNaN(workExperienceId)) {
        res.status(400).json({
          status: 'error',
          message: '無效的工作經驗ID'
        })
        return
      }

      // 參數驗證
      const errors: Record<string, string[]> = {}

      if (updateData.company_name !== undefined) {
        if (!updateData.company_name || updateData.company_name.trim() === '') {
          errors.company_name = ['公司名稱不能為空']
        } else if (updateData.company_name.length > 200) {
          errors.company_name = ['公司名稱長度不能超過 200 字']
        }
      }

      if (updateData.workplace !== undefined) {
        if (!updateData.workplace || updateData.workplace.trim() === '') {
          errors.workplace = ['工作地點不能為空']
        } else if (updateData.workplace.length > 200) {
          errors.workplace = ['工作地點長度不能超過 200 字']
        }
      }

      if (updateData.job_category !== undefined) {
        if (!updateData.job_category || updateData.job_category.trim() === '') {
          errors.job_category = ['工作類別不能為空']
        } else if (updateData.job_category.length > 100) {
          errors.job_category = ['工作類別長度不能超過 100 字']
        }
      }

      if (updateData.job_title !== undefined) {
        if (!updateData.job_title || updateData.job_title.trim() === '') {
          errors.job_title = ['職位名稱不能為空']
        } else if (updateData.job_title.length > 100) {
          errors.job_title = ['職位名稱長度不能超過 100 字']
        }
      }

      if (updateData.start_year !== undefined) {
        if (updateData.start_year < 1970 || updateData.start_year > new Date().getFullYear()) {
          errors.start_year = ['開始年份格式錯誤或超出合理範圍']
        }
      }

      if (updateData.start_month !== undefined) {
        if (updateData.start_month < 1 || updateData.start_month > 12) {
          errors.start_month = ['開始月份必須在 1-12 之間']
        }
      }

      if (updateData.end_year !== undefined) {
        if (updateData.end_year !== null && (updateData.end_year < 1970 || updateData.end_year > new Date().getFullYear())) {
          errors.end_year = ['結束年份格式錯誤或超出合理範圍']
        }
      }

      if (updateData.end_month !== undefined) {
        if (updateData.end_month !== null && (updateData.end_month < 1 || updateData.end_month > 12)) {
          errors.end_month = ['結束月份必須在 1-12 之間']
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
      const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)

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

      // 檢查工作經驗記錄是否存在且屬於該教師
      const workExperience = await workExperienceRepository.findOne({
        where: { id: workExperienceId, teacher_id: teacher.id }
      })

      if (!workExperience) {
        // 檢查是否存在但不屬於該教師
        const existsButNotOwned = await workExperienceRepository.findOne({
          where: { id: workExperienceId }
        })

        if (existsButNotOwned) {
          res.status(403).json({
            status: 'error',
            message: '無權限修改此工作經驗記錄'
          })
          return
        }

        res.status(404).json({
          status: 'error',
          message: '找不到工作經驗記錄'
        })
        return
      }

      // 準備更新資料
      const fieldsToUpdate: Partial<TeacherWorkExperience> = {}

      if (updateData.is_working !== undefined) {
        fieldsToUpdate.is_working = updateData.is_working
        // 如果改為在職狀態，清空結束時間
        if (updateData.is_working) {
          fieldsToUpdate.end_year = null
          fieldsToUpdate.end_month = null
        }
      }

      if (updateData.company_name !== undefined) {
        fieldsToUpdate.company_name = updateData.company_name.trim()
      }

      if (updateData.workplace !== undefined) {
        fieldsToUpdate.workplace = updateData.workplace.trim()
      }

      if (updateData.job_category !== undefined) {
        fieldsToUpdate.job_category = updateData.job_category.trim()
      }

      if (updateData.job_title !== undefined) {
        fieldsToUpdate.job_title = updateData.job_title.trim()
      }

      if (updateData.start_year !== undefined) {
        fieldsToUpdate.start_year = updateData.start_year
      }

      if (updateData.start_month !== undefined) {
        fieldsToUpdate.start_month = updateData.start_month
      }

      if (updateData.end_year !== undefined && !fieldsToUpdate.is_working) {
        fieldsToUpdate.end_year = updateData.end_year
      }

      if (updateData.end_month !== undefined && !fieldsToUpdate.is_working) {
        fieldsToUpdate.end_month = updateData.end_month
      }

      // 更新記錄
      if (Object.keys(fieldsToUpdate).length > 0) {
        await workExperienceRepository.update({ id: workExperienceId }, fieldsToUpdate)
      }

      // 取得更新後的記錄
      const updatedWorkExperience = await workExperienceRepository.findOne({
        where: { id: workExperienceId }
      })

      const response: TeacherWorkExperienceResponse = {
        status: 'success',
        message: '工作經驗更新成功',
        data: {
          work_experience: {
            id: updatedWorkExperience!.id,
            teacher_id: updatedWorkExperience!.teacher_id,
            is_working: updatedWorkExperience!.is_working,
            company_name: updatedWorkExperience!.company_name,
            workplace: updatedWorkExperience!.workplace,
            job_category: updatedWorkExperience!.job_category,
            job_title: updatedWorkExperience!.job_title,
            start_year: updatedWorkExperience!.start_year,
            start_month: updatedWorkExperience!.start_month,
            end_year: updatedWorkExperience!.end_year,
            end_month: updatedWorkExperience!.end_month,
            created_at: updatedWorkExperience!.created_at.toISOString(),
            updated_at: updatedWorkExperience!.updated_at.toISOString()
          }
        }
      }

      res.status(200).json(response)
    } catch (error) {
      console.error('Update work experience error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 刪除工作經驗
   */
  static async deleteWorkExperience(req: Request, res: Response): Promise<void> {
    try {
      const workExperienceId = parseInt(req.params.id)
      const userId = req.user?.id

      if (!userId) {
        res.status(401).json({
          status: 'error',
          message: '未授權'
        })
        return
      }

      if (isNaN(workExperienceId)) {
        res.status(400).json({
          status: 'error',
          message: '無效的工作經驗ID'
        })
        return
      }

      const teacherRepository = dataSource.getRepository(Teacher)
      const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)

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

      // 檢查工作經驗記錄是否存在且屬於該教師
      const workExperience = await workExperienceRepository.findOne({
        where: { id: workExperienceId, teacher_id: teacher.id }
      })

      if (!workExperience) {
        // 檢查是否存在但不屬於該教師
        const existsButNotOwned = await workExperienceRepository.findOne({
          where: { id: workExperienceId }
        })

        if (existsButNotOwned) {
          res.status(403).json({
            status: 'error',
            message: '無權限刪除此工作經驗記錄'
          })
          return
        }

        res.status(404).json({
          status: 'error',
          message: '找不到工作經驗記錄'
        })
        return
      }

      // 刪除記錄
      await workExperienceRepository.delete({ id: workExperienceId })

      res.status(200).json({
        status: 'success',
        message: '工作經驗刪除成功'
      })
    } catch (error) {
      console.error('Delete work experience error:', error)
      res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }
}
