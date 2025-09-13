import { Repository } from 'typeorm'
import { dataSource } from '@db/data-source'
import { TeacherLearningExperience } from '@entities/TeacherLearningExperience'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { UserRole, AccountStatus, ApplicationStatus } from '@entities/enums'
import { BusinessError, Errors } from '@utils/errors'
import { BusinessMessages, ValidationMessages } from '@constants/Message'
import { LEARNING_EXPERIENCE_BUSINESS } from '@constants/learningExperience'
import { UserRoleService, userRoleService } from '@services/UserRoleService'
import type { 
  CreateLearningExperienceRequest,
  UpdateLearningExperienceRequest,
  LearningExperienceData
} from '@models/teacher.interface'

/**
 * 學習經歷服務類別
 * 負責處理教師學習經歷的 CRUD 操作
 */
export class LearningExperienceService {
  private learningExperienceRepository: Repository<TeacherLearningExperience>
  private teacherRepository: Repository<Teacher>
  private userRepository: Repository<User>
  private userRoleService: UserRoleService

  constructor() {
    this.learningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
    this.userRoleService = new UserRoleService()
  }

  /**
   * 取得申請中或已認證教師的學習經歷清單（用於申請狀態查詢）
   * @param userId 使用者 ID
   * @returns 學習經歷清單
   */
  async getLearningExperiencesForApplication(userId: number): Promise<LearningExperienceData[]> {
    // 先嘗試取得教師申請記錄
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId }
    })
    
    if (!teacher) {
      return [] // 如果沒有申請記錄，回傳空陣列
    }

    // 使用 QueryBuilder 優化查詢，只選擇需要的欄位
    const experiences = await this.learningExperienceRepository
      .createQueryBuilder('experience')
      .where('experience.teacher_id = :teacherId', { teacherId: teacher.id })
      .orderBy('experience.start_year', LEARNING_EXPERIENCE_BUSINESS.DEFAULT_ORDER_DIRECTION)
      .select([
        'experience.id',
        'experience.teacher_id',
        'experience.is_in_school',
        'experience.degree',
        'experience.school_name',
        'experience.department',
        'experience.region',
        'experience.start_year',
        'experience.start_month',
        'experience.end_year',
        'experience.end_month',
        'experience.file_path',
        'experience.created_at',
        'experience.updated_at'
      ])
      .getMany()

    // 使用現有的轉換方法
    return experiences.map(experience => this.transformToLearningExperienceData(experience))
  }

  /**
   * 取得教師的學習經歷清單
   * 優化查詢效能：只選擇必要欄位
   */
  async getLearningExperiences(userId: number): Promise<LearningExperienceData[]> {
    // 驗證使用者是否為教師
    const teacher = await this.validateTeacherUser(userId)

    // 使用 QueryBuilder 優化查詢，只選擇需要的欄位
    const experiences = await this.learningExperienceRepository
      .createQueryBuilder('experience')
      .where('experience.teacher_id = :teacherId', { teacherId: teacher.id })
      .orderBy('experience.start_year', LEARNING_EXPERIENCE_BUSINESS.DEFAULT_ORDER_DIRECTION)
      .select([
        'experience.id',
        'experience.teacher_id',
        'experience.is_in_school',
        'experience.degree',
        'experience.school_name',
        'experience.department',
        'experience.region',
        'experience.start_year',
        'experience.start_month',
        'experience.end_year',
        'experience.end_month',
        'experience.file_path',
        'experience.created_at',
        'experience.updated_at'
      ])
      .getMany()

    return experiences.map(experience => this.transformToLearningExperienceData(experience))
  }

  /**
   * 建立新的學習經歷
   */
  async createLearningExperience(
    userId: number,
    data: CreateLearningExperienceRequest
  ): Promise<LearningExperienceData> {
    // 驗證使用者是否為教師或申請者
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }

    // 驗證學習年份邏輯
    if (data.end_year !== undefined && data.end_year !== null) {
      this.validateLearningYears(data.start_year, data.end_year)
    }

    // 驗證已畢業但沒有結束日期的情況
    if (!data.is_in_school && (data.end_year === undefined || data.end_year === null)) {
      throw Errors.validation(
        { end_year: [ValidationMessages.LEARNING_GRADUATED_NO_END_DATE] },
        ValidationMessages.LEARNING_GRADUATED_NO_END_DATE
      )
    }

    // TODO: 實作檔案上傳邏輯
    // 當檔案上傳系統完成後，在此處理 certificate_file 檔案
    // const certificateFile = await this.uploadCertificate(data.certificate_file)

    const learningExperience = this.learningExperienceRepository.create({
      teacher_id: teacher.id,
      is_in_school: data.is_in_school,
      degree: data.degree,
      school_name: data.school_name,
      department: data.department,
      region: data.region,
      start_year: data.start_year,
      start_month: data.start_month,
      end_year: data.end_year,
      end_month: data.end_month,
      // TODO: 設定 file_path 檔案路徑
      // file_path: certificateFile ? certificateFile.path : null
      file_path: null // 暫時設為 null，等檔案上傳系統完成後再處理
    })

    const saved = await this.learningExperienceRepository.save(learningExperience)
    return this.transformToLearningExperienceData(saved)
  }

  /**
   * 更新學習經歷
   */
  async updateLearningExperience(
    userId: number,
    experienceId: number,
    data: UpdateLearningExperienceRequest
  ): Promise<LearningExperienceData> {
    // 驗證使用者是否為教師或申請者
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }
    
    // 檢查學習經歷是否存在並屬於該教師
    const experience = await this.findLearningExperienceByTeacher(teacher.id, experienceId)

    // 如果有更新年份，驗證學習年份邏輯
    if (data.start_year !== undefined || data.end_year !== undefined) {
      const startYear = data.start_year ?? experience.start_year
      const endYear = data.end_year ?? experience.end_year
      if (endYear !== null) {
        this.validateLearningYears(startYear, endYear)
      }
    }

    // TODO: 實作檔案更新邏輯
    // 當檔案上傳系統完成後，在此處理 certificate_file 檔案更新
    // if (data.certificate_file) {
    //   const certificateFile = await this.uploadCertificate(data.certificate_file)
    //   updatedData.file_path = certificateFile.path
    // }

    // 更新學習經歷
    Object.assign(experience, {
      is_in_school: data.is_in_school ?? experience.is_in_school,
      degree: data.degree ?? experience.degree,
      school_name: data.school_name ?? experience.school_name,
      department: data.department ?? experience.department,
      region: data.region ?? experience.region,
      start_year: data.start_year ?? experience.start_year,
      start_month: data.start_month ?? experience.start_month,
      end_year: data.end_year ?? experience.end_year,
      end_month: data.end_month ?? experience.end_month,
      // TODO: 更新 file_path 檔案
      // file_path: data.file_path ?? experience.file_path
    })

    const updated = await this.learningExperienceRepository.save(experience)
    return this.transformToLearningExperienceData(updated)
  }

  /**
   * 批次建立學習經歷
   */
  async createLearningExperiencesBatch(
    userId: number,
    dataArray: CreateLearningExperienceRequest[]
  ): Promise<LearningExperienceData[]> {
    // 驗證使用者是否為教師或申請者
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }

    // 驗證批次數量限制
    if (dataArray.length > 20) {
      throw Errors.validation(
        { learning_experiences: ['一次最多只能建立 20 筆學習經歷'] },
        '批次數量超過限制'
      )
    }

    // 驗證每筆資料的業務邏輯
    dataArray.forEach((data, index) => {
      try {
        if (data.end_year !== undefined && data.end_year !== null) {
          this.validateLearningYears(data.start_year, data.end_year)
        }
        
        if (!data.is_in_school && (data.end_year === undefined || data.end_year === null)) {
          throw Errors.validation(
            { end_year: [ValidationMessages.LEARNING_GRADUATED_NO_END_DATE] },
            ValidationMessages.LEARNING_GRADUATED_NO_END_DATE
          )
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '資料驗證失敗'
        throw new BusinessError(
          'BATCH_VALIDATION_ERROR',
          `第 ${index + 1} 筆學習經歷：${errorMessage}`,
          400
        )
      }
    })

    // 使用資料庫交易確保資料一致性
    return await dataSource.transaction(async manager => {
      const learningExperiences = dataArray.map(data => 
        manager.create(TeacherLearningExperience, {
          teacher_id: teacher.id,
          is_in_school: data.is_in_school,
          degree: data.degree,
          school_name: data.school_name,
          department: data.department,
          region: data.region,
          start_year: data.start_year,
          start_month: data.start_month,
          end_year: data.end_year,
          end_month: data.end_month,
          file_path: null // TODO: 檔案上傳系統完成後處理
        })
      )

      const savedExperiences = await manager.save(TeacherLearningExperience, learningExperiences)
      return savedExperiences.map(experience => this.transformToLearningExperienceData(experience))
    })
  }

  /**
   * 批次 UPSERT 學習經歷（新增或更新）
   */
  async upsertLearningExperiencesBatch(
    userId: number,
    dataArray: Array<CreateLearningExperienceRequest & { id?: number }>
  ): Promise<{
    statistics: {
      total_processed: number;
      created_count: number;
      updated_count: number;
    };
    learning_experiences: LearningExperienceData[];
  }> {
    // 驗證使用者是否為教師或申請者
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }

    // 驗證批次數量限制
    if (dataArray.length > 20) {
      throw Errors.validation(
        { learning_experiences: ['一次最多只能處理 20 筆學習經歷'] },
        '批次數量超過限制'
      )
    }

    // 分離新增和更新的資料
    const toCreate: CreateLearningExperienceRequest[] = []
    const toUpdate: Array<{ id: number; data: UpdateLearningExperienceRequest }> = []

    // 驗證每筆資料並分類
    for (let index = 0; index < dataArray.length; index++) {
      const item = dataArray[index]
      
      try {
        // 業務邏輯驗證
        if (item.end_year !== undefined && item.end_year !== null) {
          this.validateLearningYears(item.start_year, item.end_year)
        }
        
        if (!item.is_in_school && (item.end_year === undefined || item.end_year === null)) {
          throw Errors.validation(
            { end_year: [ValidationMessages.LEARNING_GRADUATED_NO_END_DATE] },
            ValidationMessages.LEARNING_GRADUATED_NO_END_DATE
          )
        }

        // 分類處理
        if (item.id) {
          // 有 ID，驗證擁有權
          const existingExperience = await this.learningExperienceRepository.findOne({
            where: { id: item.id, teacher_id: teacher.id }
          })
          
          if (!existingExperience) {
            throw new BusinessError(
              'OWNERSHIP_ERROR',
              `ID為 ${item.id} 的學習經歷記錄不屬於此使用者`,
              403
            )
          }
          
          toUpdate.push({ id: item.id, data: item })
        } else {
          // 沒有 ID，準備新增
          toCreate.push(item)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '資料驗證失敗'
        throw new BusinessError(
          'BATCH_VALIDATION_ERROR',
          `第 ${index + 1} 筆學習經歷：${errorMessage}`,
          400
        )
      }
    }

    // 使用資料庫交易執行批次操作
    return await dataSource.transaction(async manager => {
      const results: LearningExperienceData[] = []

      // 執行新增操作
      if (toCreate.length > 0) {
        const newExperiences = toCreate.map(data => 
          manager.create(TeacherLearningExperience, {
            teacher_id: teacher.id,
            is_in_school: data.is_in_school,
            degree: data.degree,
            school_name: data.school_name,
            department: data.department,
            region: data.region,
            start_year: data.start_year,
            start_month: data.start_month,
            end_year: data.end_year,
            end_month: data.end_month,
            file_path: null // TODO: 檔案上傳系統完成後處理
          })
        )

        const savedNew = await manager.save(TeacherLearningExperience, newExperiences)
        results.push(...savedNew.map(exp => this.transformToLearningExperienceData(exp)))
      }

      // 執行更新操作
      if (toUpdate.length > 0) {
        for (const { id, data } of toUpdate) {
          const experience = await manager.findOne(TeacherLearningExperience, {
            where: { id, teacher_id: teacher.id }
          })

          if (experience) {
            Object.assign(experience, {
              is_in_school: data.is_in_school,
              degree: data.degree,
              school_name: data.school_name,
              department: data.department,
              region: data.region,
              start_year: data.start_year,
              start_month: data.start_month,
              end_year: data.end_year,
              end_month: data.end_month
            })

            const savedUpdated = await manager.save(TeacherLearningExperience, experience)
            results.push(this.transformToLearningExperienceData(savedUpdated))
          }
        }
      }

      // 按照原始順序排序結果
      const sortedResults = results.sort((a, b) => {
        const aIndex = dataArray.findIndex(item => 
          (item.id && item.id === a.id) || 
          (!item.id && item.degree === a.degree && item.school_name === a.school_name)
        )
        const bIndex = dataArray.findIndex(item => 
          (item.id && item.id === b.id) || 
          (!item.id && item.degree === b.degree && item.school_name === b.school_name)
        )
        return aIndex - bIndex
      })

      return {
        statistics: {
          total_processed: dataArray.length,
          created_count: toCreate.length,
          updated_count: toUpdate.length
        },
        learning_experiences: sortedResults
      }
    })
  }
  async deleteLearningExperience(userId: number, experienceId: number): Promise<void> {
    // 驗證使用者是否為教師或申請者
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }
    
    // 檢查學習經歷是否存在並屬於該教師
    const experience = await this.findLearningExperienceByTeacher(teacher.id, experienceId)

    // TODO: 實作檔案刪除邏輯
    // 當檔案上傳系統完成後，在此處理相關檔案刪除
    // if (experience.file_path) {
    //   await this.deleteCertificateFile(experience.file_path)
    // }

    await this.learningExperienceRepository.remove(experience)
  }

  /**
   * 私有方法：驗證使用者是否為教師並取得教師記錄
   * 使用 JOIN 查詢優化效能
   */
  private async validateTeacherUser(userId: number): Promise<Teacher> {
    // 首先檢查使用者是否有教師角色
    const userRoles = await this.userRoleService.getUserRoles(userId)
    if (!userRoles.includes(UserRole.TEACHER)) {
      throw Errors.unauthorizedAccess(BusinessMessages.TEACHER_PERMISSION_REQUIRED, 403)
    }

    // 使用 JOIN 查詢，一次取得使用者和教師資訊
    const teacher = await this.teacherRepository
      .createQueryBuilder('teacher')
      .innerJoin('teacher.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('user.account_status = :status', { status: AccountStatus.ACTIVE })
      .select(['teacher.id', 'teacher.user_id'])
      .getOne()
    
    if (!teacher) {
      // 進一步檢查是使用者狀態問題還是教師記錄不存在
      const user = await this.userRepository.findOne({ where: { id: userId } })
      
      if (!user || user.account_status !== AccountStatus.ACTIVE) {
        throw Errors.unauthorizedAccess(BusinessMessages.TEACHER_PERMISSION_REQUIRED, 403)
      } else {
        throw new BusinessError('TEACHER_NOT_FOUND', BusinessMessages.TEACHER_NOT_FOUND, 404)
      }
    }

    return teacher
  }

  /**
   * 私有方法：驗證使用者是否為教師或申請者，並取得相應權限
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
    const hasApplicantRole = await userRoleService.hasRole(userId, UserRole.TEACHER_APPLICANT)
    
    if (!hasTeacherRole && !hasApplicantRole) {
      throw Errors.unauthorizedAccess('需要教師權限才能執行此操作', 403)
    }

    // 取得教師記錄
    const teacher = await this.teacherRepository.findOne({ where: { user_id: userId } })
    if (!teacher) {
      throw new BusinessError('TEACHER_NOT_FOUND', '找不到教師申請記錄', 404)
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
   * 私有方法：驗證學習年份邏輯
   */
  private validateLearningYears(startYear: number, endYear: number): void {
    if (endYear < startYear) {
      throw Errors.validation(
        { end_year: [ValidationMessages.LEARNING_END_YEAR_BEFORE_START_YEAR] },
        ValidationMessages.LEARNING_END_YEAR_BEFORE_START_YEAR
      )
    }

    // 驗證年份範圍合理性（使用常數設定）
    if (endYear - startYear > LEARNING_EXPERIENCE_BUSINESS.MAX_LEARNING_YEARS) {
      throw Errors.validation(
        { end_year: [ValidationMessages.LEARNING_YEAR_RANGE_INVALID] },
        ValidationMessages.LEARNING_YEAR_RANGE_INVALID
      )
    }

    // 驗證年份不能是未來年份
    const currentYear = new Date().getFullYear()
    if (startYear > currentYear || endYear > currentYear) {
      throw Errors.validation(
        { start_year: [ValidationMessages.LEARNING_YEAR_RANGE_INVALID], end_year: [ValidationMessages.LEARNING_YEAR_RANGE_INVALID] },
        ValidationMessages.LEARNING_YEAR_RANGE_INVALID
      )
    }
  }

  /**
   * 私有方法：查找教師的學習經歷並驗證權限
   * 優化查詢效能：合併存在性和權限檢查
   */
  private async findLearningExperienceByTeacher(
    teacherId: number,
    experienceId: number
  ): Promise<TeacherLearningExperience> {
    // 直接查詢屬於該教師的學習經歷記錄
    const experience = await this.learningExperienceRepository.findOne({
      where: { 
        id: experienceId,
        teacher_id: teacherId 
      }
    })

    if (!experience) {
      // 需要進一步判斷是記錄不存在還是權限不足
      const existingExperience = await this.learningExperienceRepository.findOne({
        where: { id: experienceId },
        select: ['id', 'teacher_id'] // 只選擇必要欄位
      })

      if (!existingExperience) {
        throw new BusinessError('LEARNING_EXPERIENCE_NOT_FOUND', BusinessMessages.LEARNING_EXPERIENCE_NOT_FOUND, 404)
      } else {
        // 記錄存在但不屬於該教師
        throw Errors.unauthorizedAccess(BusinessMessages.UNAUTHORIZED_LEARNING_EXPERIENCE_ACCESS, 403)
      }
    }

    return experience
  }

  /**
   * 私有方法：轉換實體為回應資料格式
   */
  private transformToLearningExperienceData(
    experience: TeacherLearningExperience
  ): LearningExperienceData {
    return {
      id: experience.id,
      teacher_id: experience.teacher_id,
      is_in_school: experience.is_in_school,
      degree: experience.degree,
      school_name: experience.school_name,
      department: experience.department,
      region: experience.region,
      start_year: experience.start_year,
      start_month: experience.start_month,
      end_year: experience.end_year,
      end_month: experience.end_month,
      file_path: experience.file_path,
      created_at: experience.created_at,
      updated_at: experience.updated_at
    }
  }

  // TODO: 檔案上傳相關私有方法
  // private async uploadCertificate(certificate: Express.Multer.File): Promise<UploadedFile>
  // private async deleteCertificateFile(filePath: string): Promise<void>
  // private getFileUrl(filePath: string): string
}

// 建立單例實例並匯出
export const learningExperienceService = new LearningExperienceService()