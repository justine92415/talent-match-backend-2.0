import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { BusinessError } from '@utils/errors'
import { BusinessMessages } from '@constants/Message'
import getLogger from '@utils/logger'

const logger = getLogger('CertificateService')

/**
 * 證書管理服務
 * 處理教師證書的 CRUD 操作
 */
export class CertificateService {
  private teacherRepository = dataSource.getRepository(Teacher)
  private certificateRepository = dataSource.getRepository(TeacherCertificate)

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
    const teacher = await this.validateTeacherUser(userId)

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
    const teacher = await this.validateTeacherUser(userId)
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