import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { TeacherWorkExperience } from '../entities/TeacherWorkExperience'
import { BaseService } from './BaseService'
import { ValidationError, NotFoundError } from '../middleware/errorHandler'
import { TeacherWorkExperienceRequest, TeacherWorkExperienceUpdateRequest } from '../types/teachers'

export class TeacherWorkExperienceService extends BaseService {
  private static workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)

  /**
   * 驗證工作經驗參數
   */
  private static validateWorkExperienceData(data: TeacherWorkExperienceRequest | TeacherWorkExperienceUpdateRequest, isUpdate = false): void {
    const errors: Record<string, string[]> = {}

    // 建立時必填，更新時可選
    if (!isUpdate || data.is_working !== undefined) {
      if (data.is_working === undefined || data.is_working === null) {
        errors.is_working = ['在職狀態為必填欄位']
      }
    }

    if (!isUpdate || data.company_name !== undefined) {
      if (!data.company_name || data.company_name.trim() === '') {
        errors.company_name = ['公司名稱為必填欄位']
      } else if (data.company_name.length > 200) {
        errors.company_name = ['公司名稱長度不能超過 200 字']
      }
    }

    if (!isUpdate || data.workplace !== undefined) {
      if (!data.workplace || data.workplace.trim() === '') {
        errors.workplace = ['工作地點為必填欄位']
      } else if (data.workplace.length > 200) {
        errors.workplace = ['工作地點長度不能超過 200 字']
      }
    }

    if (!isUpdate || data.job_category !== undefined) {
      if (!data.job_category || data.job_category.trim() === '') {
        errors.job_category = ['工作類別為必填欄位']
      } else if (data.job_category.length > 100) {
        errors.job_category = ['工作類別長度不能超過 100 字']
      }
    }

    if (!isUpdate || data.job_title !== undefined) {
      if (!data.job_title || data.job_title.trim() === '') {
        errors.job_title = ['職位名稱為必填欄位']
      } else if (data.job_title.length > 100) {
        errors.job_title = ['職位名稱長度不能超過 100 字']
      }
    }

    if (!isUpdate || data.start_year !== undefined) {
      if (!data.start_year || data.start_year < 1970 || data.start_year > new Date().getFullYear()) {
        errors.start_year = ['開始年份格式錯誤或超出合理範圍']
      }
    }

    if (!isUpdate || data.start_month !== undefined) {
      if (!data.start_month || data.start_month < 1 || data.start_month > 12) {
        errors.start_month = ['開始月份必須在 1-12 之間']
      }
    }

    // 檢查結束時間邏輯
    const isWorking = data.is_working
    if (!isUpdate || data.end_year !== undefined || data.end_month !== undefined || isWorking !== undefined) {
      // 如果不是目前在職，需要結束時間
      if (isWorking === false) {
        if (!data.end_year || data.end_year < 1970 || data.end_year > new Date().getFullYear()) {
          errors.end_year = ['結束年份格式錯誤或超出合理範圍']
        }

        if (!data.end_month || data.end_month < 1 || data.end_month > 12) {
          errors.end_month = ['結束月份必須在 1-12 之間']
        }

        // 檢查結束時間是否晚於開始時間
        if (data.end_year && data.end_month && data.start_year && data.start_month) {
          const startDate = new Date(data.start_year, data.start_month - 1)
          const endDate = new Date(data.end_year, data.end_month - 1)

          if (endDate <= startDate) {
            errors.end_date = ['結束時間必須晚於開始時間']
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }
  }

  /**
   * 取得工作經驗列表
   */
  static async getWorkExperiences(userId: number): Promise<TeacherWorkExperience[]> {
    const teacher = await this.getTeacherByUserId(userId)

    const workExperiences = await this.workExperienceRepository.find({
      where: { teacher_id: teacher.id },
      order: { start_year: 'DESC', start_month: 'DESC' }
    })

    return workExperiences
  }

  /**
   * 建立工作經驗
   */
  static async createWorkExperience(userId: number, data: TeacherWorkExperienceRequest): Promise<TeacherWorkExperience> {
    // 驗證參數
    this.validateWorkExperienceData(data)

    // 取得教師記錄
    const teacher = await this.getTeacherByUserId(userId)

    // 建立工作經驗記錄
    const workExperience = new TeacherWorkExperience()
    workExperience.teacher_id = teacher.id
    workExperience.is_working = data.is_working
    workExperience.company_name = data.company_name.trim()
    workExperience.workplace = data.workplace.trim()
    workExperience.job_category = data.job_category.trim()
    workExperience.job_title = data.job_title.trim()
    workExperience.start_year = data.start_year
    workExperience.start_month = data.start_month

    // 設定結束時間（如果不是目前在職）
    if (!data.is_working) {
      workExperience.end_year = data.end_year || null
      workExperience.end_month = data.end_month || null
    } else {
      workExperience.end_year = null
      workExperience.end_month = null
    }

    return await this.workExperienceRepository.save(workExperience)
  }

  /**
   * 更新工作經驗
   */
  static async updateWorkExperience(userId: number, experienceId: number, data: TeacherWorkExperienceUpdateRequest): Promise<TeacherWorkExperience> {
    // 驗證參數
    this.validateWorkExperienceData(data, true)

    // 先檢查工作經驗是否存在
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id: experienceId }
    })

    if (!workExperience) {
      throw new NotFoundError('工作經驗')
    }

    // 再檢查權限：是否屬於該教師
    const teacher = await this.getTeacherByUserId(userId)
    if (workExperience.teacher_id !== teacher.id) {
      throw new ValidationError({ permission: ['無權限修改此工作經驗記錄'] })
    }

    // 更新欄位
    if (data.is_working !== undefined) {
      workExperience.is_working = data.is_working
    }
    if (data.company_name !== undefined) {
      workExperience.company_name = data.company_name.trim()
    }
    if (data.workplace !== undefined) {
      workExperience.workplace = data.workplace.trim()
    }
    if (data.job_category !== undefined) {
      workExperience.job_category = data.job_category.trim()
    }
    if (data.job_title !== undefined) {
      workExperience.job_title = data.job_title.trim()
    }
    if (data.start_year !== undefined) {
      workExperience.start_year = data.start_year
    }
    if (data.start_month !== undefined) {
      workExperience.start_month = data.start_month
    }

    // 處理結束時間邏輯
    if (data.is_working === true) {
      // 如果設為目前在職，清除結束時間
      workExperience.end_year = null
      workExperience.end_month = null
    } else if (data.is_working === false || data.end_year !== undefined || data.end_month !== undefined) {
      // 如果設為非在職或有提供結束時間，更新結束時間
      if (data.end_year !== undefined) {
        workExperience.end_year = data.end_year
      }
      if (data.end_month !== undefined) {
        workExperience.end_month = data.end_month
      }
    }

    return await this.workExperienceRepository.save(workExperience)
  }

  /**
   * 刪除工作經驗
   */
  static async deleteWorkExperience(userId: number, experienceId: number): Promise<void> {
    // 先檢查工作經驗是否存在
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id: experienceId }
    })

    if (!workExperience) {
      throw new NotFoundError('工作經驗')
    }

    // 再檢查權限：是否屬於該教師
    const teacher = await this.getTeacherByUserId(userId)
    if (workExperience.teacher_id !== teacher.id) {
      throw new ValidationError({ permission: ['無權限刪除此工作經驗記錄'] })
    }

    // 刪除工作經驗記錄
    await this.workExperienceRepository.remove(workExperience)
  }
}
