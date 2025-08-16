import { Repository } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { TeacherWorkExperience } from '@entities/TeacherWorkExperience'
import { TeacherLearningExperience } from '@entities/TeacherLearningExperience'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { UserRole, AccountStatus, ApplicationStatus } from '@entities/enums'
import { BusinessError } from '@core/errors/BusinessError'
import {
  TEACHER_ERROR_CODES,
  TEACHER_ERROR_MESSAGES,
  TEACHER_HTTP_STATUS
} from '@constants/teacher'
import { 
  TeacherApplicationData, 
  TeacherApplicationUpdateData,
  TeacherProfileUpdateRequest,
  CreateWorkExperienceRequest,
  UpdateWorkExperienceRequest
} from '@models/index'

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
   * 取得教師申請狀態（使用索引最佳化）
   * @param userId 使用者 ID
   * @returns 教師申請記錄
   */
  async getApplication(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId },
      select: [
        'id', 'uuid', 'user_id', 'nationality', 'introduction',
        'application_status', 'application_submitted_at', 'application_reviewed_at',
        'reviewer_id', 'review_notes', 'created_at', 'updated_at'
      ]
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
   * 取得教師基本資料（已審核通過的教師，包含統計資料）
   * @param userId 使用者 ID
   * @returns 教師資料
   */
  async getProfile(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { 
        user_id: userId, 
        application_status: ApplicationStatus.APPROVED 
      }
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
   * 更新教師基本資料（已審核通過的教師，最佳化查詢）
   * @param userId 使用者 ID
   * @param updateData 更新資料
   * @returns 更新後的教師記錄
   */
  async updateProfile(userId: number, updateData: TeacherProfileUpdateRequest): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { 
        user_id: userId, 
        application_status: ApplicationStatus.APPROVED 
      },
      select: [
        'id', 'uuid', 'user_id', 'nationality', 'introduction',
        'application_status', 'application_reviewed_at', 'reviewer_id', 'review_notes',
        'updated_at'
      ]
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

  /**
   * 驗證使用者是否為教師並取得教師記錄
   * @private
   * @param userId 使用者 ID
   * @returns 教師記錄
   */
  private async validateTeacherUser(userId: number): Promise<Teacher> {
    // 檢查使用者是否存在且為教師角色
    const user = await this.userRepository.findOne({ 
      where: { 
        id: userId, 
        role: UserRole.TEACHER,
        account_status: AccountStatus.ACTIVE
      } 
    })
    
    if (!user) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.ROLE_FORBIDDEN,
        TEACHER_ERROR_MESSAGES.ROLE_FORBIDDEN,
        TEACHER_HTTP_STATUS.ROLE_FORBIDDEN
      )
    }

    // 取得教師記錄
    const teacher = await this.teacherRepository.findOne({ where: { user_id: userId } })
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
   * 取得教師的工作經驗列表
   * @param userId 使用者 ID
   * @returns 工作經驗列表
   */
  async getWorkExperiences(userId: number): Promise<TeacherWorkExperience[]> {
    const teacher = await this.validateTeacherUser(userId)
    
    return await this.workExperienceRepository.find({
      where: { teacher_id: teacher.id },
      order: { created_at: 'DESC' }
    })
  }

  /**
   * 建立工作經驗記錄
   * @param userId 使用者 ID
   * @param workExperienceData 工作經驗資料
   * @returns 建立的工作經驗記錄
   */
  async createWorkExperience(userId: number, workExperienceData: CreateWorkExperienceRequest): Promise<TeacherWorkExperience> {
    const teacher = await this.validateTeacherUser(userId)
    
    // 基本資料驗證
    this.validateWorkExperienceData(workExperienceData)
    
    const result = await this.workExperienceRepository.insert({
      teacher_id: teacher.id,
      ...workExperienceData
    })
    
    const workExperienceId = result.identifiers[0].id
    const savedWorkExperience = await this.workExperienceRepository.findOne({
      where: { id: workExperienceId }
    })
    
    if (!savedWorkExperience) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.WORK_EXPERIENCE_NOT_FOUND,
        '建立工作經驗失敗',
        500
      )
    }
    
    return savedWorkExperience
  }

  /**
   * 更新工作經驗記錄
   * @param userId 使用者 ID
   * @param workExperienceId 工作經驗 ID
   * @param updateData 更新資料
   * @returns 更新後的工作經驗記錄
   */
  async updateWorkExperience(userId: number, workExperienceId: number, updateData: UpdateWorkExperienceRequest): Promise<TeacherWorkExperience> {
    const teacher = await this.validateTeacherUser(userId)
    
    // 先檢查工作經驗是否存在
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id: workExperienceId }
    })
    
    if (!workExperience) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.WORK_EXPERIENCE_NOT_FOUND,
        TEACHER_ERROR_MESSAGES.WORK_EXPERIENCE_NOT_FOUND,
        TEACHER_HTTP_STATUS.WORK_EXPERIENCE_NOT_FOUND
      )
    }
    
    // 檢查是否屬於該教師
    if (workExperience.teacher_id !== teacher.id) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.ROLE_FORBIDDEN,
        TEACHER_ERROR_MESSAGES.ROLE_FORBIDDEN,
        TEACHER_HTTP_STATUS.ROLE_FORBIDDEN
      )
    }

    // 合併資料並驗證
    const mergedData = { ...workExperience, ...updateData }
    this.validateWorkExperienceData(mergedData)
    
    // 更新欄位
    Object.assign(workExperience, updateData)
    
    return await this.workExperienceRepository.save(workExperience)
  }

  /**
   * 刪除工作經驗記錄
   * @param userId 使用者 ID
   * @param workExperienceId 工作經驗 ID
   */
  async deleteWorkExperience(userId: number, workExperienceId: number): Promise<void> {
    const teacher = await this.validateTeacherUser(userId)
    
    // 先檢查工作經驗是否存在
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id: workExperienceId }
    })
    
    if (!workExperience) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.WORK_EXPERIENCE_NOT_FOUND,
        TEACHER_ERROR_MESSAGES.WORK_EXPERIENCE_NOT_FOUND,
        TEACHER_HTTP_STATUS.WORK_EXPERIENCE_NOT_FOUND
      )
    }
    
    // 檢查是否屬於該教師
    if (workExperience.teacher_id !== teacher.id) {
      throw new BusinessError(
        TEACHER_ERROR_CODES.ROLE_FORBIDDEN,
        TEACHER_ERROR_MESSAGES.ROLE_FORBIDDEN,
        TEACHER_HTTP_STATUS.ROLE_FORBIDDEN
      )
    }
    
    await this.workExperienceRepository.remove(workExperience)
  }

  /**
   * 驗證工作經驗資料
   * @private
   * @param data 工作經驗資料
   */
  private validateWorkExperienceData(data: CreateWorkExperienceRequest | UpdateWorkExperienceRequest): void {
    // 基本必填欄位檢查
    if (!data.company_name?.trim()) {
      throw new BusinessError('VALIDATION_ERROR', '公司名稱為必填欄位', 400)
    }
    if (!data.workplace?.trim()) {
      throw new BusinessError('VALIDATION_ERROR', '工作地點為必填欄位', 400)
    }
    if (!data.job_category?.trim()) {
      throw new BusinessError('VALIDATION_ERROR', '工作類別為必填欄位', 400)
    }
    if (!data.job_title?.trim()) {
      throw new BusinessError('VALIDATION_ERROR', '職位名稱為必填欄位', 400)
    }

    // 字串長度檢查
    if (data.company_name?.length > 200) {
      throw new BusinessError('VALIDATION_ERROR', '公司名稱不得超過200字元', 400)
    }
    if (data.workplace?.length > 200) {
      throw new BusinessError('VALIDATION_ERROR', '工作地點不得超過200字元', 400)
    }
    if (data.job_category?.length > 100) {
      throw new BusinessError('VALIDATION_ERROR', '工作類別不得超過100字元', 400)
    }
    if (data.job_title?.length > 100) {
      throw new BusinessError('VALIDATION_ERROR', '職位名稱不得超過100字元', 400)
    }

    // 日期驗證
    const currentYear = new Date().getFullYear()
    
    if (data.start_year !== undefined && (data.start_year < 1900 || data.start_year > currentYear + 1)) {
      throw new BusinessError('VALIDATION_ERROR', '開始年份必須在1900到明年之間', 400)
    }
    if (data.start_month !== undefined && (data.start_month < 1 || data.start_month > 12)) {
      throw new BusinessError('VALIDATION_ERROR', '開始月份必須在1到12之間', 400)
    }

    // 業務邏輯驗證
    if (data.is_working !== undefined) {
      if (data.is_working) {
        // 在職工作不能有結束日期
        if (data.end_year || data.end_month) {
          throw new BusinessError('VALIDATION_ERROR', '在職工作經驗不可填寫結束日期', 400)
        }
      } else {
        // 離職工作必須有結束日期
        if (!data.end_year || !data.end_month) {
          throw new BusinessError('VALIDATION_ERROR', '離職工作經驗必須填寫結束日期', 400)
        }
        
        if (data.end_year && (data.end_year < 1900 || data.end_year > currentYear + 1)) {
          throw new BusinessError('VALIDATION_ERROR', '結束年份必須在1900到明年之間', 400)
        }
        if (data.end_month && (data.end_month < 1 || data.end_month > 12)) {
          throw new BusinessError('VALIDATION_ERROR', '結束月份必須在1到12之間', 400)
        }
        
        // 結束日期不得早於開始日期
        if (data.start_year && data.start_month && data.end_year && data.end_month) {
          const startDate = new Date(data.start_year, data.start_month - 1)
          const endDate = new Date(data.end_year, data.end_month - 1)
          
          if (endDate < startDate) {
            throw new BusinessError('VALIDATION_ERROR', '結束日期不得早於開始日期', 400)
          }
        }
      }
    }
  }
}