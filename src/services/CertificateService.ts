import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { User } from '@entities/User'
import { UserRole, AccountStatus, ApplicationStatus } from '@entities/enums'
import { BusinessError } from '@utils/errors'
import { BusinessMessages } from '@constants/Message'
import { Errors } from '@utils/errors'
import { userRoleService } from './UserRoleService'
import type { CreateCertificateRequest, UpdateCertificateRequest } from '../types/teacher.interface'
import getLogger from '@utils/logger'

const logger = getLogger('CertificateService')

/**
 * 證書管理服務
 * 處理教師證書的 CRUD 操作
 */
export class CertificateService {
  private teacherRepository = dataSource.getRepository(Teacher)
  private certificateRepository = dataSource.getRepository(TeacherCertificate)
  private userRepository = dataSource.getRepository(User)

  /**
   * 根據 ID 和教師 ID 查找證書
   * @param certificateId - 證書 ID
   * @param teacherId - 教師 ID
   * @returns 證書記錄或 null
   */
  private async findCertificateByIdAndTeacher(certificateId: number, teacherId: number): Promise<TeacherCertificate | null> {
    return await this.certificateRepository
      .createQueryBuilder('certificate')
      .where('certificate.id = :certificateId', { certificateId })
      .andWhere('certificate.teacher_id = :teacherId', { teacherId: teacherId })
      .getOne()
  }

  /**
   * 驗證證書存在且屬於該教師
   * @param certificateId - 證書 ID  
   * @param teacherId - 教師 ID
   * @returns 證書記錄
   */
  private async validateCertificateOwnership(certificateId: number, teacherId: number): Promise<TeacherCertificate> {
    const certificate = await this.findCertificateByIdAndTeacher(certificateId, teacherId)
    
    if (!certificate) {
      throw new BusinessError('CERTIFICATE_NOT_FOUND', '證書不存在或無權限存取', 404)
    }

    return certificate
  }
  /**
   * 驗證教師是否存在且通過審核
   * @param userId - 使用者 ID
   * @returns 教師記錄
   */
  private async validateTeacherUser(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository
      .createQueryBuilder('teacher')
      .where('teacher.user_id = :userId', { userId })
      .getOne()

    if (!teacher) {
      throw new BusinessError('TEACHER_NOT_FOUND', BusinessMessages.TEACHER_NOT_FOUND, 404)
    }

    return teacher
  }

  /**
   * 驗證使用者是否為教師或申請者，並取得相應權限
   * @param userId - 使用者 ID
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
   * 取得申請中或已認證教師的證書列表（用於申請狀態查詢）
   * @param userId - 使用者 ID
   * @returns 證書列表
   */
  async getCertificatesByUserIdForApplication(userId: number): Promise<TeacherCertificate[]> {
    // 先嘗試取得教師申請記錄
    const teacher = await this.teacherRepository.findOne({ 
      where: { user_id: userId }
    })
    
    if (!teacher) {
      return [] // 如果沒有申請記錄，回傳空陣列
    }
    
    const certificates = await this.certificateRepository
      .createQueryBuilder('certificate')
      .where('certificate.teacher_id = :teacherId', { teacherId: teacher.id })
      .orderBy('certificate.created_at', 'DESC')
      .getMany()

    return certificates
  }

  /**
   * 取得教師的證書列表
   * @param userId - 使用者 ID
   * @returns 證書列表
   */
  async getCertificatesByUserId(userId: number): Promise<TeacherCertificate[]> {
    const startTime = Date.now()
    
    const teacher = await this.validateTeacherUser(userId)
    
    const certificates = await this.certificateRepository
      .createQueryBuilder('certificate')
      .where('certificate.teacher_id = :teacherId', { teacherId: teacher.id })
      .orderBy('certificate.created_at', 'DESC')
      .getMany()

    const duration = Date.now() - startTime
    logger.info(`獲取證書列表耗時: ${duration}ms, 教師ID: ${teacher.id}, 證書數量: ${certificates.length}`)

    return certificates
  }

  /**
   * 新增教師證書
   * @param userId - 使用者 ID
   * @param certificateData - 證書資料
   * @returns 新建立的證書記錄
   */
  async createCertificate(userId: number, certificateData: CreateCertificateRequest): Promise<TeacherCertificate> {
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }

    const certificate = this.certificateRepository.create({
      teacher_id: teacher.id,
      verifying_institution: certificateData.verifying_institution,
      license_name: certificateData.license_name,
      holder_name: certificateData.holder_name,
      license_number: certificateData.license_number,
      category_id: certificateData.category_id,
      subject: certificateData.subject,
      file_path: '' // TODO: 檔案上傳系統完成後處理
    })

    return await this.certificateRepository.save(certificate)
  }

  /**
   * 批次新增教師證書
   * @param userId - 使用者 ID
   * @param certificatesData - 證書資料陣列
   * @returns 新建立的證書記錄陣列
   */
  async createCertificatesBatch(userId: number, certificatesData: CreateCertificateRequest[]): Promise<TeacherCertificate[]> {
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }

    // 驗證批次數量限制
    if (certificatesData.length > 20) {
      throw Errors.validation(
        { certificates: ['一次最多只能建立 20 張證照'] },
        '批次數量超過限制'
      )
    }

    // 使用資料庫交易確保資料一致性
    return await dataSource.transaction(async manager => {
      const certificates = certificatesData.map(data => 
        manager.create(TeacherCertificate, {
          teacher_id: teacher.id,
          verifying_institution: data.verifying_institution,
          license_name: data.license_name,
          holder_name: data.holder_name,
          license_number: data.license_number,
          category_id: data.category_id,
          subject: data.subject,
          file_path: '' // TODO: 檔案上傳系統完成後處理
        })
      )

      return await manager.save(TeacherCertificate, certificates)
    })
  }

  /**
   * 批次 UPSERT 教師證書（新增或更新）
   * @param userId - 使用者 ID
   * @param certificatesData - 證書資料陣列
   * @returns 處理結果統計和證書記錄陣列
   */
  async upsertCertificatesBatch(userId: number, certificatesData: Array<CreateCertificateRequest & { id?: number }>): Promise<{
    statistics: {
      total_processed: number;
      created_count: number;
      updated_count: number;
    };
    certificates: TeacherCertificate[];
  }> {
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }

    // 驗證批次數量限制
    if (certificatesData.length > 20) {
      throw Errors.validation(
        { certificates: ['一次最多只能處理 20 張證照'] },
        '批次數量超過限制'
      )
    }

    // 分離新增和更新的資料
    const toCreate: CreateCertificateRequest[] = []
    const toUpdate: Array<{ id: number; data: UpdateCertificateRequest }> = []

    // 驗證每筆資料並分類
    for (let index = 0; index < certificatesData.length; index++) {
      const item = certificatesData[index]

      try {
        // 分類處理
        if (item.id) {
          // 有 ID，驗證擁有權
          const existingCertificate = await this.certificateRepository.findOne({
            where: { id: item.id, teacher_id: teacher.id }
          })
          
          if (!existingCertificate) {
            throw new BusinessError(
              'OWNERSHIP_ERROR',
              `ID為 ${item.id} 的證照記錄不屬於此使用者`,
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
          `第 ${index + 1} 張證照：${errorMessage}`,
          400
        )
      }
    }

    // 使用資料庫交易執行批次操作
    return await dataSource.transaction(async manager => {
      const results: TeacherCertificate[] = []

      // 執行新增操作
      if (toCreate.length > 0) {
        const newCertificates = toCreate.map(data => 
          manager.create(TeacherCertificate, {
            teacher_id: teacher.id,
            verifying_institution: data.verifying_institution,
            license_name: data.license_name,
            holder_name: data.holder_name,
            license_number: data.license_number,
            category_id: data.category_id,
            subject: data.subject,
            file_path: '' // TODO: 檔案上傳系統完成後處理
          })
        )

        const savedNew = await manager.save(TeacherCertificate, newCertificates)
        results.push(...savedNew)
      }

      // 執行更新操作
      if (toUpdate.length > 0) {
        for (const { id, data } of toUpdate) {
          const certificate = await manager.findOne(TeacherCertificate, {
            where: { id, teacher_id: teacher.id }
          })

          if (certificate) {
            Object.assign(certificate, {
              verifying_institution: data.verifying_institution,
              license_name: data.license_name,
              holder_name: data.holder_name,
              license_number: data.license_number,
              category_id: data.category_id,
              subject: data.subject
            })

            const savedUpdated = await manager.save(TeacherCertificate, certificate)
            results.push(savedUpdated)
          }
        }
      }

      // 按照原始順序排序結果
      const sortedResults = results.sort((a, b) => {
        const aIndex = certificatesData.findIndex(item => 
          (item.id && item.id === a.id) || 
          (!item.id && item.license_number === a.license_number && item.license_name === a.license_name)
        )
        const bIndex = certificatesData.findIndex(item => 
          (item.id && item.id === b.id) || 
          (!item.id && item.license_number === b.license_number && item.license_name === b.license_name)
        )
        return aIndex - bIndex
      })

      return {
        statistics: {
          total_processed: certificatesData.length,
          created_count: toCreate.length,
          updated_count: toUpdate.length
        },
        certificates: sortedResults
      }
    })
  }

  /**
   * 更新教師證書
   * @param userId - 使用者 ID
   * @param certificateId - 證書 ID
   * @param updateData - 更新資料
   * @returns 更新後的證書記錄
   */
  async updateCertificate(userId: number, certificateId: number, updateData: {
    verifying_institution?: string
    license_name?: string
    holder_name?: string
    license_number?: string
    category_id?: string
    subject?: string
    file_path?: string
  }): Promise<TeacherCertificate> {
    const { teacher, canModifyApplication } = await this.validateTeacherUserOrApplicant(userId)

    // 檢查是否可以修改申請資料
    if (!canModifyApplication) {
      throw Errors.unauthorizedAccess('目前申請狀態不允許修改資料')
    }

    const certificate = await this.validateCertificateOwnership(certificateId, teacher.id)

    // 更新證書資料
    Object.assign(certificate, updateData)
    
    return await this.certificateRepository.save(certificate)
  }

  /**
   * 刪除教師證書
   * @param userId - 使用者 ID
   * @param certificateId - 證書 ID
   */
  async deleteCertificate(userId: number, certificateId: number): Promise<void> {
    const teacher = await this.validateTeacherUser(userId)
    const certificate = await this.validateCertificateOwnership(certificateId, teacher.id)

    // TODO: 刪除關聯的檔案
    // 在未來實作檔案管理功能時，需要在此處加入檔案刪除邏輯
    
    await this.certificateRepository.remove(certificate)
  }
}

// 匯出服務實例
export const certificateService = new CertificateService()