import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { ApplicationStatus } from '../entities/enums'
import { BaseService, ValidationHelper } from './BaseService'
import { ValidationError, ConflictError, NotFoundError, BusinessError } from '../middleware/errorHandler'
import { TeacherApplyRequest, TeacherUpdateRequest } from '../types/teachers'

export class TeacherApplicationService extends BaseService {
  /**
   * 提交教師申請
   */
  static async apply(userId: number, data: TeacherApplyRequest): Promise<Teacher> {
    // 參數驗證
    const errors: Record<string, string[]> = {}

    // 國籍驗證
    const nationalityErrors = [
      ...ValidationHelper.validateRequired(data.nationality, '國籍'),
      ...ValidationHelper.validateStringLength(data.nationality?.trim(), '國籍', 1, 50)
    ]
    if (nationalityErrors.length > 0) {
      errors.nationality = nationalityErrors
    }

    // 自我介紹驗證
    const introductionErrors = [
      ...ValidationHelper.validateRequired(data.introduction, '自我介紹'),
      ...ValidationHelper.validateStringLength(data.introduction?.trim(), '自我介紹', 100, 1000)
    ]
    if (introductionErrors.length > 0) {
      errors.introduction = introductionErrors
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }

    const teacherRepository = dataSource.getRepository(Teacher)

    // 檢查是否已有申請記錄
    const existingApplication = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (existingApplication) {
      throw new ConflictError('您已提交過教師申請')
    }

    // 建立申請記錄
    const teacher = teacherRepository.create({
      user_id: userId,
      nationality: data.nationality.trim(),
      introduction: data.introduction.trim(),
      application_status: ApplicationStatus.PENDING
    })

    return await teacherRepository.save(teacher)
  }

  /**
   * 取得申請狀態
   */
  static async getApplication(userId: number): Promise<Teacher> {
    const teacherRepository = dataSource.getRepository(Teacher)
    const application = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!application) {
      throw new NotFoundError('申請記錄')
    }

    return application
  }

  /**
   * 更新申請資料
   */
  static async updateApplication(userId: number, data: TeacherUpdateRequest): Promise<Teacher> {
    // 參數驗證
    const errors: Record<string, string[]> = {}

    if (data.nationality !== undefined) {
      const nationalityErrors = [
        ...ValidationHelper.validateRequired(data.nationality, '國籍'),
        ...ValidationHelper.validateStringLength(data.nationality?.trim(), '國籍', 1, 50)
      ]
      if (nationalityErrors.length > 0) {
        errors.nationality = nationalityErrors
      }
    }

    if (data.introduction !== undefined) {
      const introductionErrors = [
        ...ValidationHelper.validateRequired(data.introduction, '自我介紹'),
        ...ValidationHelper.validateStringLength(data.introduction?.trim(), '自我介紹', 100, 1000)
      ]
      if (introductionErrors.length > 0) {
        errors.introduction = introductionErrors
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }

    const teacherRepository = dataSource.getRepository(Teacher)

    // 檢查申請記錄是否存在
    const application = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!application) {
      throw new NotFoundError('申請記錄')
    }

    // 檢查申請狀態是否允許更新
    if (application.application_status !== ApplicationStatus.PENDING && application.application_status !== ApplicationStatus.REJECTED) {
      throw new BusinessError('只有待審核或被拒絕的申請才能更新')
    }

    // 準備更新資料
    const updateData: Partial<Teacher> = {}
    if (data.nationality !== undefined) {
      updateData.nationality = data.nationality.trim()
    }
    if (data.introduction !== undefined) {
      updateData.introduction = data.introduction.trim()
    }

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError({ general: ['至少需要提供一個欄位進行更新'] })
    }

    // 更新記錄
    await teacherRepository.update({ user_id: userId }, updateData)

    // 回傳更新後的記錄
    const updatedApplication = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    return updatedApplication!
  }

  /**
   * 重新提交申請
   */
  static async resubmitApplication(userId: number): Promise<Teacher> {
    const teacherRepository = dataSource.getRepository(Teacher)

    // 檢查申請記錄是否存在
    const application = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!application) {
      throw new NotFoundError('申請記錄')
    }

    // 檢查申請狀態是否為 rejected
    if (application.application_status !== ApplicationStatus.REJECTED) {
      throw new BusinessError('只有被拒絕的申請才能重新提交')
    }

    // 更新狀態為 pending
    await teacherRepository.update({ user_id: userId }, { application_status: ApplicationStatus.PENDING })

    // 回傳更新後的記錄
    const updatedApplication = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    return updatedApplication!
  }
}
