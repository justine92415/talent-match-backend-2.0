import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { NotFoundError, ValidationError } from '../middleware/errorHandler'
import { TeacherProfileRequest } from '../types/teachers'

export class TeacherProfileService {
  /**
   * 取得教師基本資料
   */
  static async getProfile(userId: number): Promise<Teacher> {
    const teacherRepository = dataSource.getRepository(Teacher)

    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    return teacher
  }

  /**
   * 更新教師基本資料
   */
  static async updateProfile(userId: number, data: TeacherProfileRequest): Promise<Teacher> {
    const teacherRepository = dataSource.getRepository(Teacher)

    // 參數驗證
    const errors: Record<string, string[]> = {}

    if (data.nationality !== undefined) {
      if (!data.nationality || data.nationality.trim() === '') {
        errors.nationality = ['國籍不能為空']
      } else if (data.nationality.length > 50) {
        errors.nationality = ['國籍長度不能超過 50 字']
      }
    }

    if (data.introduction !== undefined) {
      if (!data.introduction || data.introduction.trim() === '') {
        errors.introduction = ['自我介紹不能為空']
      } else if (data.introduction.length < 100) {
        errors.introduction = ['自我介紹至少需要 100 字']
      } else if (data.introduction.length > 1000) {
        errors.introduction = ['自我介紹不能超過 1000 字']
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }

    // 檢查教師記錄是否存在
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 準備更新資料
    const updateData: Partial<Teacher> = {}
    if (data.nationality !== undefined) {
      updateData.nationality = data.nationality.trim()
    }
    if (data.introduction !== undefined) {
      updateData.introduction = data.introduction.trim()
    }

    // 如果有提供更新欄位，執行更新
    if (Object.keys(updateData).length > 0) {
      await teacherRepository.update({ user_id: userId }, updateData)
    }

    // 取得更新後的資料
    const updatedTeacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    return updatedTeacher!
  }
}
