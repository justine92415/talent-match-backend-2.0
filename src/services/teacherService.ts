import { Repository } from 'typeorm'
import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { User } from '../entities/User'
import { TeacherWorkExperience } from '../entities/TeacherWorkExperience'
import { TeacherLearningExperience } from '../entities/TeacherLearningExperience'
import { TeacherCertificate } from '../entities/TeacherCertificate'
import { UserRole, AccountStatus, ApplicationStatus } from '../entities/enums'
import { BusinessError } from '../core/errors/BusinessError'
import {
  TEACHER_ERROR_CODES,
  TEACHER_ERROR_MESSAGES,
  TEACHER_HTTP_STATUS
} from '../constants/teacher'
import { TeacherApplicationData, TeacherApplicationUpdateData } from '../types'

/**
 * 教師申請和管理相關的業務服務類別
 * 負責處理教師申請、狀態管理、經驗管理等核心業務邏輯
 */
export class TeacherService {
  private readonly teacherRepository: Repository<Teacher>
  private readonly userRepository: Repository<User>
  private readonly workExperienceRepository: Repository<TeacherWorkExperience>
  private readonly learningExperienceRepository: Repository<TeacherLearningExperience>
  private readonly certificateRepository: Repository<TeacherCertificate>

  constructor() {
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
    this.workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
    this.learningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
    this.certificateRepository = dataSource.getRepository(TeacherCertificate)
  }

  /**
   * 驗證使用者申請教師的資格
   * @private
   * @param userId 使用者 ID
   */
  private async validateUserEligibility(userId: number): Promise<User> {
    // 檢查使用者是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.USER_NOT_FOUND,
        TEACHER_ERROR_MESSAGES.USER_NOT_FOUND,
        TEACHER_HTTP_STATUS.USER_NOT_FOUND
      )
    }

    // 檢查使用者角色是否為學生
    if (user.role !== UserRole.STUDENT) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.ROLE_FORBIDDEN,
        TEACHER_ERROR_MESSAGES.ROLE_FORBIDDEN,
        TEACHER_HTTP_STATUS.ROLE_FORBIDDEN
      )
    }

    // 檢查帳號狀態是否為活躍
    if (user.account_status !== AccountStatus.ACTIVE) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.ACCOUNT_INACTIVE,
        TEACHER_ERROR_MESSAGES.ACCOUNT_INACTIVE,
        TEACHER_HTTP_STATUS.ACCOUNT_INACTIVE
      )
    }

    return user
  }

  /**
   * 檢查是否已有教師申請記錄
   * @private
   * @param userId 使用者 ID
   */
  private async checkExistingApplication(userId: number): Promise<void> {
    const existingApplication = await this.teacherRepository.findOne({ 
      where: { user_id: userId } 
    })
    
    if (existingApplication) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.DUPLICATE_APPLICATION,
        TEACHER_ERROR_MESSAGES.DUPLICATE_APPLICATION,
        TEACHER_HTTP_STATUS.DUPLICATE_APPLICATION
      )
    }
  }

  /**
   * 申請成為教師
   * @param userId 使用者 ID
   * @param applicationData 申請資料
   * @returns 建立的教師記錄
   */
  async apply(userId: number, applicationData: TeacherApplicationData): Promise<Teacher> {
    // 驗證使用者資格
    await this.validateUserEligibility(userId)

    // 檢查是否已有教師申請記錄
    await this.checkExistingApplication(userId)

    // 建立教師申請記錄
    const teacher = this.teacherRepository.create({
      user_id: userId,
      nationality: applicationData.nationality,
      introduction: applicationData.introduction,
      application_status: ApplicationStatus.PENDING
    })

    return await this.teacherRepository.save(teacher)
  }

  /**
   * 取得教師申請狀態
   * @param userId 使用者 ID
   * @returns 教師申請記錄
   */
  async getApplication(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId } 
    })
    
    if (!teacher) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.APPLICATION_NOT_FOUND,
        TEACHER_ERROR_MESSAGES.APPLICATION_NOT_FOUND,
        TEACHER_HTTP_STATUS.APPLICATION_NOT_FOUND
      )
    }

    return teacher
  }

  /**
   * 驗證申請是否可以修改
   * @private
   * @param teacher 教師申請記錄
   */
  private validateApplicationEditable(teacher: Teacher): void {
    // 檢查是否可以修改（只能在待審核或已拒絕狀態下修改）
    if (teacher.application_status === ApplicationStatus.APPROVED) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.APPLICATION_APPROVED,
        TEACHER_ERROR_MESSAGES.APPLICATION_APPROVED,
        TEACHER_HTTP_STATUS.APPLICATION_APPROVED
      )
    }
  }

  /**
   * 更新申請資料
   * @param userId 使用者 ID
   * @param updateData 更新資料
   * @returns 更新後的教師記錄
   */
  async updateApplication(userId: number, updateData: TeacherApplicationUpdateData): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId } 
    })
    
    if (!teacher) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.APPLICATION_NOT_FOUND,
        TEACHER_ERROR_MESSAGES.APPLICATION_NOT_FOUND,
        TEACHER_HTTP_STATUS.APPLICATION_NOT_FOUND
      )
    }

    // 驗證是否可以修改
    this.validateApplicationEditable(teacher)

    // 更新欄位
    if (updateData.nationality !== undefined) {
      teacher.nationality = updateData.nationality
    }
    if (updateData.introduction !== undefined) {
      teacher.introduction = updateData.introduction
    }

    // 如果是被拒絕狀態，重新設為待審核
    if (teacher.application_status === ApplicationStatus.REJECTED) {
      teacher.application_status = ApplicationStatus.PENDING
      teacher.application_reviewed_at = undefined
      teacher.reviewer_id = undefined
      teacher.review_notes = undefined
    }

    return await this.teacherRepository.save(teacher)
  }

  /**
   * 重新提交申請（僅限被拒絕的申請）
   * @param userId 使用者 ID
   * @returns 重新提交後的教師記錄
   */
  async resubmitApplication(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId } 
    })
    
    if (!teacher) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.APPLICATION_NOT_FOUND,
        TEACHER_ERROR_MESSAGES.APPLICATION_NOT_FOUND,
        TEACHER_HTTP_STATUS.APPLICATION_NOT_FOUND
      )
    }

    // 檢查申請狀態是否為已拒絕
    if (teacher.application_status !== ApplicationStatus.REJECTED) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.CANNOT_RESUBMIT_APPLICATION,
        TEACHER_ERROR_MESSAGES.CANNOT_RESUBMIT_APPLICATION,
        TEACHER_HTTP_STATUS.CANNOT_RESUBMIT_APPLICATION
      )
    }

    // 重置申請狀態為待審核
    teacher.application_status = ApplicationStatus.PENDING
    teacher.application_submitted_at = new Date()
    teacher.application_reviewed_at = undefined
    teacher.reviewer_id = undefined
    teacher.review_notes = undefined

    return await this.teacherRepository.save(teacher)
  }

  /**
  /**
   * 取得教師基本資料（已審核通過的教師）
   * @param userId 使用者 ID
   * @returns 教師資料
   */
  async getProfile(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId, application_status: ApplicationStatus.APPROVED } 
    })
    
    if (!teacher) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.TEACHER_NOT_FOUND,
        TEACHER_ERROR_MESSAGES.TEACHER_NOT_FOUND,
        TEACHER_HTTP_STATUS.TEACHER_NOT_FOUND
      )
    }

    return teacher
  }

  /**
   * 更新教師基本資料（已審核通過的教師）
   * @param userId 使用者 ID
   * @param updateData 更新資料
   * @returns 更新後的教師記錄
   */
  async updateProfile(userId: number, updateData: { nationality?: string; introduction?: string }): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId, application_status: ApplicationStatus.APPROVED } 
    })
    
    if (!teacher) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.TEACHER_NOT_APPROVED,
        TEACHER_ERROR_MESSAGES.TEACHER_NOT_APPROVED,
        TEACHER_HTTP_STATUS.TEACHER_NOT_APPROVED
      )
    }

    // 更新欄位
    if (updateData.nationality !== undefined) {
      teacher.nationality = updateData.nationality
    }
    if (updateData.introduction !== undefined) {
      teacher.introduction = updateData.introduction
    }

    // 重要資料修改後需要重新審核
    teacher.application_status = ApplicationStatus.PENDING
    teacher.application_reviewed_at = undefined
    teacher.reviewer_id = undefined
    teacher.review_notes = undefined

    return await this.teacherRepository.save(teacher)
  }
}