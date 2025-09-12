import { Repository, Not, IsNull, In } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { MainCategory } from '@entities/MainCategory'
import { SubCategory } from '@entities/SubCategory'
import { TeacherWorkExperience } from '@entities/TeacherWorkExperience'
import { TeacherLearningExperience } from '@entities/TeacherLearningExperience'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { UserRole, AccountStatus, ApplicationStatus } from '@entities/enums'
import { Errors, ValidationError } from '@utils/errors'
import { BusinessMessages, ValidationMessages } from '@constants/Message'
import { 
  TeacherApplicationData, 
  TeacherApplicationUpdateData,
  TeacherProfileUpdateRequest,
  CreateWorkExperienceRequest,
  UpdateWorkExperienceRequest
} from '@models/index'
import { userRoleService } from './UserRoleService'

/**
 * 教師申請和管理相關的業務服務類別
 * 負責處理教師申請、狀態管理、經驗管理等核心業務邏輯
 */
export class TeacherService {
  private readonly teacherRepository: Repository<Teacher>
  private readonly userRepository: Repository<User>
  private readonly mainCategoryRepository: Repository<MainCategory>
  private readonly subCategoryRepository: Repository<SubCategory>
  private readonly workExperienceRepository: Repository<TeacherWorkExperience>
  private readonly learningExperienceRepository: Repository<TeacherLearningExperience>
  private readonly certificateRepository: Repository<TeacherCertificate>

  constructor() {
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
    this.mainCategoryRepository = dataSource.getRepository(MainCategory)
    this.subCategoryRepository = dataSource.getRepository(SubCategory)
    this.workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
    this.learningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
    this.certificateRepository = dataSource.getRepository(TeacherCertificate)
  }

  /**
   * 驗證主分類是否存在且啟用
   * @private
   * @param mainCategoryId 主分類 ID
   */
  private async validateMainCategory(mainCategoryId: number): Promise<void> {
    const mainCategory = await this.mainCategoryRepository.findOne({
      where: { 
        id: mainCategoryId,
        is_active: true
      }
    })
    
    if (!mainCategory) {
      throw Errors.validationFailed('所選的教授科目不存在或已停用')
    }
  }

  /**
   * 驗證子分類是否存在、啟用且屬於指定的主分類
   * @private
   * @param mainCategoryId 主分類 ID
   * @param subCategoryIds 子分類 ID 陣列
   */
  private async validateSubCategories(mainCategoryId: number, subCategoryIds: number[]): Promise<void> {
    if (subCategoryIds.length === 0) {
      throw Errors.validationFailed('至少需要選擇1個專長')
    }
    
    if (subCategoryIds.length > 3) {
      throw Errors.validationFailed('最多只能選擇3個專長')
    }

    // 檢查是否有重複的子分類
    const uniqueIds = [...new Set(subCategoryIds)]
    if (uniqueIds.length !== subCategoryIds.length) {
      throw Errors.validationFailed('專長不能重複選擇')
    }

    const subCategories = await this.subCategoryRepository.find({
      where: {
        id: In(subCategoryIds),
        main_category_id: mainCategoryId,
        is_active: true
      }
    })

    if (subCategories.length !== subCategoryIds.length) {
      throw Errors.validationFailed('部分專長不存在、已停用或不屬於所選的教授科目')
    }
  }

  /**
   * 驗證使用者申請教師的資格
   * @private
   * @param userId 使用者 ID
   */
  private async validateUserEligibility(userId: number): Promise<User> {
    // 檢查使用者是否存在
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['roles']
    })
    if (!user) {
      throw Errors.userNotFound()
    }

    // 檢查使用者是否有學生角色
    const userRoles = user.roles?.map(r => r.role) || []
    if (!userRoles.includes(UserRole.STUDENT)) {
      throw Errors.unauthorizedAccess(BusinessMessages.STUDENT_ONLY_APPLY_TEACHER, 403)
    }

    // 檢查帳號狀態是否為活躍
    if (user.account_status !== AccountStatus.ACTIVE) {
      throw Errors.accountSuspended()
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
      throw Errors.applicationExists()
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

    // 驗證主分類
    await this.validateMainCategory(applicationData.main_category_id)

    // 驗證子分類
    await this.validateSubCategories(applicationData.main_category_id, applicationData.sub_category_ids)

    // 建立教師申請記錄
    const teacher = this.teacherRepository.create({
      user_id: userId,
      city: applicationData.city,
      district: applicationData.district,
      address: applicationData.address,
      main_category_id: applicationData.main_category_id,
      sub_category_ids: applicationData.sub_category_ids,
      introduction: applicationData.introduction,
      application_status: ApplicationStatus.PENDING
    })

    const savedTeacher = await this.teacherRepository.save(teacher)

    // 自動賦予 TEACHER_APPLICANT 角色
    await userRoleService.addRole(userId, UserRole.TEACHER_APPLICANT)

    return savedTeacher
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
        'id', 'uuid', 'user_id', 'city', 'district', 'address', 'main_category_id', 'sub_category_ids', 'introduction',
        'application_status', 'application_submitted_at', 'application_reviewed_at',
        'reviewer_id', 'review_notes', 'created_at', 'updated_at'
      ]
    })
    
    if (!teacher) {
      throw Errors.applicationNotFound()
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
      throw Errors.invalidApplicationStatus(BusinessMessages.APPLICATION_STATUS_INVALID)
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
      throw Errors.applicationNotFound()
    }

    // 驗證是否可以修改
    this.validateApplicationEditable(teacher)

    // 如果有更新主分類，進行驗證
    if (updateData.main_category_id !== undefined) {
      await this.validateMainCategory(updateData.main_category_id)
    }

    // 如果有更新子分類，進行驗證
    if (updateData.sub_category_ids !== undefined) {
      const mainCategoryId = updateData.main_category_id ?? teacher.main_category_id
      if (mainCategoryId) {
        await this.validateSubCategories(mainCategoryId, updateData.sub_category_ids)
      }
    }

    // 更新欄位
    if (updateData.city !== undefined) {
      teacher.city = updateData.city
    }
    if (updateData.district !== undefined) {
      teacher.district = updateData.district
    }
    if (updateData.address !== undefined) {
      teacher.address = updateData.address
    }
    if (updateData.main_category_id !== undefined) {
      teacher.main_category_id = updateData.main_category_id
    }
    if (updateData.sub_category_ids !== undefined) {
      teacher.sub_category_ids = updateData.sub_category_ids
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
      throw Errors.applicationNotFound()
    }

    // 檢查申請狀態是否為已拒絕
    if (teacher.application_status !== ApplicationStatus.REJECTED) {
      throw Errors.invalidApplicationStatus('此申請無法重新提交，請檢查申請狀態')
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
      throw Errors.teacherNotFound()
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
        'id', 'uuid', 'user_id', 'city', 'district', 'address', 'main_category_id', 'sub_category_ids', 'introduction',
        'application_status', 'application_reviewed_at', 'reviewer_id', 'review_notes',
        'updated_at'
      ]
    })
    
    if (!teacher) {
      throw Errors.teacherNotFound()
    }

    // 如果有更新主分類，進行驗證
    if (updateData.main_category_id !== undefined) {
      await this.validateMainCategory(updateData.main_category_id)
    }

    // 如果有更新子分類，進行驗證
    if (updateData.sub_category_ids !== undefined) {
      const mainCategoryId = updateData.main_category_id ?? teacher.main_category_id
      if (mainCategoryId) {
        await this.validateSubCategories(mainCategoryId, updateData.sub_category_ids)
      }
    }

    // 更新欄位
    if (updateData.city !== undefined) {
      teacher.city = updateData.city
    }
    if (updateData.district !== undefined) {
      teacher.district = updateData.district
    }
    if (updateData.address !== undefined) {
      teacher.address = updateData.address
    }
    if (updateData.main_category_id !== undefined) {
      teacher.main_category_id = updateData.main_category_id
    }
    if (updateData.sub_category_ids !== undefined) {
      teacher.sub_category_ids = updateData.sub_category_ids
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
    // 檢查使用者是否存在且帳號啟用
    const user = await this.userRepository.findOne({ 
      where: { 
        id: userId, 
        account_status: AccountStatus.ACTIVE
      },
      relations: ['roles']
    })
    
    if (!user) {
      throw Errors.unauthorizedAccess(BusinessMessages.TEACHER_PERMISSION_REQUIRED, 403)
    }

    // 檢查是否有教師角色
    const userRoles = user.roles?.map(r => r.role) || []
    if (!userRoles.includes(UserRole.TEACHER)) {
      throw Errors.unauthorizedAccess(BusinessMessages.TEACHER_PERMISSION_REQUIRED, 403)
    }

    // 取得教師記錄
    const teacher = await this.teacherRepository.findOne({ where: { user_id: userId } })
    if (!teacher) {
      throw Errors.teacherNotFound()
    }

    return teacher
  }

  /**
   * 驗證使用者是否為教師或申請者，並取得相應權限
   * @private
   * @param userId 使用者 ID
   * @returns 教師記錄和權限資訊
   */
  private async validateTeacherUserOrApplicant(userId: number): Promise<{
    teacher: Teacher;
    canModifyApplication: boolean;
    isApprovedTeacher: boolean;
  }> {
    // 檢查使用者是否存在且帳號啟用
    const user = await this.userRepository.findOne({ 
      where: { 
        id: userId, 
        account_status: AccountStatus.ACTIVE
      }
    })
    
    if (!user) {
      throw Errors.unauthorizedAccess('使用者不存在或帳號已停用', 403)
    }

    // 檢查角色
    const hasTeacherRole = await userRoleService.hasRole(userId, UserRole.TEACHER)
    let hasApplicantRole = await userRoleService.hasRole(userId, UserRole.TEACHER_APPLICANT)
    
    // 取得教師記錄
    const teacher = await this.teacherRepository.findOne({ where: { user_id: userId } })
    if (!teacher) {
      throw Errors.teacherNotFound('找不到教師申請記錄')
    }

    // 暫時的向後相容性修復：如果用戶有申請記錄但沒有 TEACHER_APPLICANT 角色，自動補充
    if (!hasTeacherRole && !hasApplicantRole && teacher) {
      console.log(`自動為用戶 ${userId} 補充 TEACHER_APPLICANT 角色（向後相容性修復）`)
      await userRoleService.addRole(userId, UserRole.TEACHER_APPLICANT)
      hasApplicantRole = true
    }
    
    if (!hasTeacherRole && !hasApplicantRole) {
      throw Errors.unauthorizedAccess('需要教師權限才能執行此操作', 403)
    }

    // 確定權限範圍
    const isApprovedTeacher = hasTeacherRole && teacher.application_status === ApplicationStatus.APPROVED
    const canModifyApplication = hasApplicantRole && 
      [ApplicationStatus.PENDING, ApplicationStatus.REJECTED].includes(teacher.application_status)

    return {
      teacher,
      canModifyApplication: canModifyApplication || isApprovedTeacher,
      isApprovedTeacher
    }
  }

  /**
   * 取得申請中或已認證教師的工作經驗列表（用於申請狀態查詢）
   * @param userId 使用者 ID
   * @returns 工作經驗列表
   */
  async getWorkExperiencesForApplication(userId: number): Promise<TeacherWorkExperience[]> {
    // 先嘗試取得教師申請記錄
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId }
    })
    
    if (!teacher) {
      return [] // 如果沒有申請記錄，回傳空陣列
    }
    
    return await this.workExperienceRepository.find({
      where: { teacher_id: teacher.id },
      order: { created_at: 'DESC' }
    })
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
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)
    
    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }
    
    // 基本資料驗證
    this.validateWorkExperienceData(workExperienceData)
    
    const result = await this.workExperienceRepository.insert({
      teacher_id: teacher.id,
      ...workExperienceData
    })
    
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id: result.identifiers[0].id },
      order: { created_at: 'DESC' }
    })
    
    if (!workExperience) {
      throw Errors.internalError('工作經驗建立失敗')
    }
    
    return workExperience
  }

  /**
   * 更新工作經驗記錄
   * @param userId 使用者 ID
   * @param workExperienceId 工作經驗 ID
   * @param updateData 更新資料
   * @returns 更新後的工作經驗記錄
   */
  async updateWorkExperience(userId: number, workExperienceId: number, updateData: UpdateWorkExperienceRequest): Promise<TeacherWorkExperience> {
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)
    
    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }
    
    // 先檢查工作經驗是否存在
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id: workExperienceId }
    })
    
    if (!workExperience) {
      throw Errors.applicationNotFound(BusinessMessages.WORK_EXPERIENCE_RECORD_NOT_FOUND)
    }
    
    // 檢查是否屬於該教師
    if (workExperience.teacher_id !== teacher.id) {
      throw Errors.unauthorizedAccess(BusinessMessages.UNAUTHORIZED_WORK_EXPERIENCE_ACCESS, 403)
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
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)
    
    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }
    
    // 先檢查工作經驗是否存在
    const workExperience = await this.workExperienceRepository.findOne({
      where: { id: workExperienceId }
    })
    
    if (!workExperience) {
      throw Errors.applicationNotFound(BusinessMessages.WORK_EXPERIENCE_RECORD_NOT_FOUND)
    }
    
    // 檢查是否屬於該教師
    if (workExperience.teacher_id !== teacher.id) {
      throw Errors.unauthorizedAccess(BusinessMessages.UNAUTHORIZED_WORK_EXPERIENCE_DELETE, 403)
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
      throw Errors.validationFailed('公司名稱為必填欄位')
    }
    if (!data.workplace?.trim()) {
      throw Errors.validationFailed(ValidationMessages.WORKPLACE_REQUIRED)
    }
    if (!data.job_category?.trim()) {
      throw Errors.validationFailed('工作類別為必填欄位')
    }
    if (!data.job_title?.trim()) {
      throw Errors.validationFailed('職位名稱為必填欄位')
    }

    // 字串長度檢查
    if (data.company_name?.length > 200) {
      throw Errors.validationFailed('公司名稱不得超過200字元')
    }
    if (data.workplace?.length > 200) {
      throw Errors.validationFailed('工作地點不得超過200字元')
    }
    if (data.job_category?.length > 100) {
      throw Errors.validationFailed('工作類別不得超過100字元')
    }
    if (data.job_title?.length > 100) {
      throw Errors.validationFailed('職位名稱不得超過100字元')
    }

    // 日期驗證
    const currentYear = new Date().getFullYear()
    
    if (data.start_year !== undefined && (data.start_year < 1900 || data.start_year > currentYear + 1)) {
      throw Errors.validationFailed('開始年份必須在1900到明年之間')
    }
    if (data.start_month !== undefined && (data.start_month < 1 || data.start_month > 12)) {
      throw Errors.validationFailed('開始月份必須在1到12之間')
    }

    // 業務邏輯驗證
    if (data.is_working !== undefined) {
      if (data.is_working) {
        // 在職工作不能有結束日期
        if (data.end_year || data.end_month) {
          throw Errors.validationFailed('在職工作經驗不可填寫結束日期')
        }
      } else {
        // 離職工作必須有結束日期
        if (!data.end_year || !data.end_month) {
          throw Errors.validationFailed('離職工作經驗必須填寫結束日期')
        }
        
        if (data.end_year && (data.end_year < 1900 || data.end_year > currentYear + 1)) {
          throw Errors.validationFailed('結束年份必須在1900到明年之間')
        }
        if (data.end_month && (data.end_month < 1 || data.end_month > 12)) {
          throw Errors.validationFailed('結束月份必須在1到12之間')
        }
        
        // 結束日期不得早於開始日期
        if (data.start_year && data.start_month && data.end_year && data.end_month) {
          const startDate = new Date(data.start_year, data.start_month - 1)
          const endDate = new Date(data.end_year, data.end_month - 1)
          
          if (endDate < startDate) {
            throw Errors.validationFailed('結束日期不得早於開始日期')
          }
        }
      }
    }
  }

  /**
   * 最終提交教師申請
   * 驗證所有必填資料完整性並更新申請狀態
   * @param userId 使用者 ID
   * @returns 提交後的教師記錄
   */
  async submitApplication(userId: number): Promise<Teacher> {
    // 檢查申請是否存在
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId } 
    })
    
    if (!teacher) {
      throw Errors.applicationNotFound()
    }

    // 檢查是否已經提交過
    if (teacher.application_submitted_at) {
      throw Errors.validationFailed('申請已經提交，無法重複提交')
    }

    // 驗證資料完整性
    await this.validateApplicationCompleteness(teacher.id)

    // 更新申請狀態
    teacher.application_status = ApplicationStatus.PENDING
    teacher.application_submitted_at = new Date()

    return await this.teacherRepository.save(teacher)
  }

  /**
   * 驗證申請資料完整性
   * @private
   * @param teacherId 教師 ID
   */
  private async validateApplicationCompleteness(teacherId: number): Promise<void> {
    // 檢查工作經驗
    const workExperienceCount = await this.workExperienceRepository.count({
      where: { teacher_id: teacherId }
    })
    if (workExperienceCount === 0) {
      throw Errors.validationFailed('申請資料不完整，至少需要一筆工作經驗')
    }

    // 檢查學習經歷（含檔案）
    const learningExperienceCount = await this.learningExperienceRepository.count({
      where: { 
        teacher_id: teacherId,
        file_path: Not(IsNull())
      }
    })
    if (learningExperienceCount === 0) {
      throw Errors.validationFailed('申請資料不完整，至少需要一筆學習經歷（含檔案）')
    }

    // 檢查證書（含檔案）
    const certificateCount = await this.certificateRepository.count({
      where: { 
        teacher_id: teacherId,
        file_path: Not(IsNull())
      }
    })
    if (certificateCount === 0) {
      throw Errors.validationFailed('申請資料不完整，至少需要一張證書（含檔案）')
    }
  }
}

// 匯出服務實例
export const teacherService = new TeacherService()