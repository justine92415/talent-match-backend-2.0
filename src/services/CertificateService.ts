import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { User } from '@entities/User'
import { UserRole, AccountStatus, ApplicationStatus } from '@entities/enums'
import { BusinessError } from '@utils/errors'
import { BusinessMessages } from '@constants/Message'
import { Errors } from '@utils/errors'
import { userRoleService } from './UserRoleService'
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
  async createCertificate(userId: number, certificateData: {
    verifying_institution: string
    license_name: string
    holder_name: string
    license_number: string
    category_id: string
    subject: string
    file_path: string
  }): Promise<TeacherCertificate> {
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
      file_path: certificateData.file_path
    })

    return await this.certificateRepository.save(certificate)
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