import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { TeacherLearningExperience } from '../entities/TeacherLearningExperience'
import { BaseService } from './BaseService'
import { ValidationError, NotFoundError } from '../middleware/errorHandler'
import { TeacherLearningExperienceRequest, TeacherLearningExperienceUpdateRequest } from '../types/teachers'

export class TeacherLearningExperienceService extends BaseService {
  private static learningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
  private static teacherRepository = dataSource.getRepository(Teacher)

  /**
   * 驗證學習經歷參數
   */
  private static validateLearningExperienceData(data: TeacherLearningExperienceRequest | TeacherLearningExperienceUpdateRequest, isUpdate = false): void {
    const errors: Record<string, string[]> = {}

    // 建立時必填，更新時可選
    if (!isUpdate || data.is_in_school !== undefined) {
      if (typeof data.is_in_school !== 'boolean') {
        errors.is_in_school = ['是否在學為必填欄位']
      }
    }

    if (!isUpdate || data.degree !== undefined) {
      if (!data.degree || data.degree.trim() === '') {
        errors.degree = ['學位為必填欄位']
      } else if (data.degree.length > 50) {
        errors.degree = ['學位長度不能超過 50 字']
      }
    }

    if (!isUpdate || data.school_name !== undefined) {
      if (!data.school_name || data.school_name.trim() === '') {
        errors.school_name = ['學校名稱為必填欄位']
      } else if (data.school_name.length > 200) {
        errors.school_name = ['學校名稱長度不能超過 200 字']
      }
    }

    if (!isUpdate || data.department !== undefined) {
      if (!data.department || data.department.trim() === '') {
        errors.department = ['科系為必填欄位']
      } else if (data.department.length > 200) {
        errors.department = ['科系長度不能超過 200 字']
      }
    }

    if (!isUpdate || data.region !== undefined) {
      if (typeof data.region !== 'boolean') {
        errors.region = ['地區為必填欄位']
      }
    }

    // 年份月份驗證
    if (!isUpdate || data.start_year !== undefined) {
      if (!data.start_year || !Number.isInteger(data.start_year) || data.start_year < 1900 || data.start_year > new Date().getFullYear()) {
        errors.start_year = ['開始年份必須為有效的年份']
      }
    }

    if (!isUpdate || data.start_month !== undefined) {
      if (!data.start_month || !Number.isInteger(data.start_month) || data.start_month < 1 || data.start_month > 12) {
        errors.start_month = ['開始月份必須為 1-12 之間的數字']
      }
    }

    // 非在學狀態必須提供結束時間
    if (!isUpdate && data.is_in_school === false) {
      if (!data.end_year || !Number.isInteger(data.end_year) || data.end_year < 1900 || data.end_year > new Date().getFullYear()) {
        errors.end_year = ['非在學狀態必須提供有效的結束年份']
      }

      if (!data.end_month || !Number.isInteger(data.end_month) || data.end_month < 1 || data.end_month > 12) {
        errors.end_month = ['非在學狀態必須提供有效的結束月份']
      }

      // 檢查結束時間不能早於開始時間
      if (data.end_year && data.end_month && data.start_year && data.start_month) {
        const startDate = new Date(data.start_year, data.start_month - 1)
        const endDate = new Date(data.end_year, data.end_month - 1)

        if (endDate <= startDate) {
          errors.end_year = ['結束時間不能早於或等於開始時間']
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }
  }

  /**
   * 取得教師的學習經歷列表
   */
  static async getLearningExperiences(userId: number): Promise<TeacherLearningExperience[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    return await this.learningExperienceRepository.find({
      where: { teacher_id: teacher.id },
      order: { start_year: 'DESC', start_month: 'DESC' }
    })
  }

  /**
   * 建立學習經歷
   */
  static async createLearningExperience(userId: number, data: TeacherLearningExperienceRequest): Promise<TeacherLearningExperience> {
    // 驗證參數
    this.validateLearningExperienceData(data, false)

    // 檢查特殊業務邏輯
    if (!data.is_in_school && (!data.end_year || !data.end_month)) {
      throw new ValidationError({
        business_rule: ['非在學狀態必須提供結束時間']
      })
    }

    // 取得教師資料
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 建立學習經歷記錄
    const learningExperience = new TeacherLearningExperience()
    learningExperience.teacher_id = teacher.id
    learningExperience.is_in_school = data.is_in_school
    learningExperience.degree = data.degree.trim()
    learningExperience.school_name = data.school_name.trim()
    learningExperience.department = data.department.trim()
    learningExperience.region = data.region
    learningExperience.start_year = data.start_year
    learningExperience.start_month = data.start_month
    learningExperience.end_year = data.is_in_school ? null : data.end_year || null
    learningExperience.end_month = data.is_in_school ? null : data.end_month || null
    learningExperience.file_path = data.file_path || null

    return await this.learningExperienceRepository.save(learningExperience)
  }

  /**
   * 更新學習經歷
   */
  static async updateLearningExperience(
    userId: number,
    learningExperienceId: number,
    updateData: TeacherLearningExperienceUpdateRequest
  ): Promise<TeacherLearningExperience> {
    // 驗證參數
    this.validateLearningExperienceData(updateData, true)

    // 取得教師資料
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 檢查學習經歷記錄是否存在且屬於該教師
    const learningExperience = await this.learningExperienceRepository.findOne({
      where: { id: learningExperienceId, teacher_id: teacher.id }
    })

    if (!learningExperience) {
      // 檢查是否存在但不屬於該教師
      const existsButNotOwned = await this.learningExperienceRepository.findOne({
        where: { id: learningExperienceId }
      })

      if (existsButNotOwned) {
        throw new ValidationError({
          permission: ['權限不足，無法修改此學習經歷']
        })
      }

      throw new NotFoundError('學習經歷')
    }

    // 更新資料
    if (updateData.is_in_school !== undefined) {
      learningExperience.is_in_school = updateData.is_in_school
    }
    if (updateData.degree !== undefined) {
      learningExperience.degree = updateData.degree.trim()
    }
    if (updateData.school_name !== undefined) {
      learningExperience.school_name = updateData.school_name.trim()
    }
    if (updateData.department !== undefined) {
      learningExperience.department = updateData.department.trim()
    }
    if (updateData.region !== undefined) {
      learningExperience.region = updateData.region
    }
    if (updateData.start_year !== undefined) {
      learningExperience.start_year = updateData.start_year
    }
    if (updateData.start_month !== undefined) {
      learningExperience.start_month = updateData.start_month
    }
    if (updateData.end_year !== undefined) {
      learningExperience.end_year = updateData.end_year
    }
    if (updateData.end_month !== undefined) {
      learningExperience.end_month = updateData.end_month
    }
    if (updateData.file_path !== undefined) {
      learningExperience.file_path = updateData.file_path
    }

    return await this.learningExperienceRepository.save(learningExperience)
  }

  /**
   * 刪除學習經歷
   */
  static async deleteLearningExperience(userId: number, learningExperienceId: number): Promise<void> {
    // 取得教師資料
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 檢查學習經歷記錄是否存在且屬於該教師
    const learningExperience = await this.learningExperienceRepository.findOne({
      where: { id: learningExperienceId, teacher_id: teacher.id }
    })

    if (!learningExperience) {
      // 檢查是否存在但不屬於該教師
      const existsButNotOwned = await this.learningExperienceRepository.findOne({
        where: { id: learningExperienceId }
      })

      if (existsButNotOwned) {
        throw new ValidationError({
          permission: ['權限不足，無法刪除此學習經歷']
        })
      }

      throw new NotFoundError('學習經歷')
    }

    // 刪除記錄
    await this.learningExperienceRepository.delete({ id: learningExperienceId })
  }
}
