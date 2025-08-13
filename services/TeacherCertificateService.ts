import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { TeacherCertificate } from '../entities/TeacherCertificate'
import { BaseService } from './BaseService'
import { ValidationError, NotFoundError } from '../middleware/errorHandler'
import { TeacherCertificateRequest, TeacherCertificateUpdateRequest } from '../types/teachers'

export class TeacherCertificateService extends BaseService {
  private static certificateRepository = dataSource.getRepository(TeacherCertificate)
  private static teacherRepository = dataSource.getRepository(Teacher)

  /**
   * 驗證證書參數
   */
  private static validateCertificateData(data: TeacherCertificateRequest | TeacherCertificateUpdateRequest, isUpdate = false): void {
    const errors: Record<string, string[]> = {}

    if (!isUpdate || data.verifying_institution !== undefined) {
      if (!data.verifying_institution?.trim()) {
        errors.verifying_institution = ['發證機構為必填欄位']
      } else if (data.verifying_institution.length > 200) {
        errors.verifying_institution = ['發證機構長度不得超過200字']
      }
    }

    if (!isUpdate || data.license_name !== undefined) {
      if (!data.license_name?.trim()) {
        errors.license_name = ['證書名稱為必填欄位']
      } else if (data.license_name.length > 200) {
        errors.license_name = ['證書名稱長度不得超過200字']
      }
    }

    if (!isUpdate || data.holder_name !== undefined) {
      if (!data.holder_name?.trim()) {
        errors.holder_name = ['持有人姓名為必填欄位']
      } else if (data.holder_name.length > 100) {
        errors.holder_name = ['持有人姓名長度不得超過100字']
      }
    }

    if (!isUpdate || data.license_number !== undefined) {
      if (!data.license_number?.trim()) {
        errors.license_number = ['證書編號為必填欄位']
      } else if (data.license_number.length > 100) {
        errors.license_number = ['證書編號長度不得超過100字']
      }
    }

    if (!isUpdate || data.file_path !== undefined) {
      if (!data.file_path?.trim()) {
        errors.file_path = ['檔案路徑為必填欄位']
      }
    }

    if (!isUpdate || data.category_id !== undefined) {
      if (!data.category_id?.trim()) {
        errors.category_id = ['證書類別為必填欄位']
      } else if (data.category_id.length > 50) {
        errors.category_id = ['證書類別長度不得超過50字']
      }
    }

    if (!isUpdate || data.subject !== undefined) {
      if (!data.subject?.trim()) {
        errors.subject = ['證書主題為必填欄位']
      } else if (data.subject.length > 100) {
        errors.subject = ['證書主題長度不得超過100字']
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }
  }

  /**
   * 取得教師的證書列表
   */
  static async getCertificates(userId: number): Promise<TeacherCertificate[]> {
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    return await this.certificateRepository.find({
      where: { teacher_id: teacher.id },
      order: { created_at: 'DESC' }
    })
  }

  /**
   * 建立證書
   */
  static async createCertificate(userId: number, data: TeacherCertificateRequest): Promise<TeacherCertificate> {
    // 驗證參數
    this.validateCertificateData(data, false)

    // 取得教師資料
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    const newCertificate = this.certificateRepository.create({
      teacher_id: teacher.id,
      verifying_institution: data.verifying_institution.trim(),
      license_name: data.license_name.trim(),
      holder_name: data.holder_name.trim(),
      license_number: data.license_number.trim(),
      file_path: data.file_path.trim(),
      category_id: data.category_id.trim(),
      subject: data.subject.trim()
    })

    return await this.certificateRepository.save(newCertificate)
  }

  /**
   * 更新證書
   */
  static async updateCertificate(userId: number, certificateId: number, updateData: TeacherCertificateUpdateRequest): Promise<TeacherCertificate> {
    // 驗證參數
    this.validateCertificateData(updateData, true)

    // 取得教師資料
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 檢查證書是否存在且屬於該用戶
    const existingCertificate = await this.certificateRepository.findOne({
      where: { id: certificateId }
    })

    if (!existingCertificate) {
      throw new NotFoundError('證書')
    }

    if (existingCertificate.teacher_id !== teacher.id) {
      throw new ValidationError({
        permission: ['權限不足，無法修改此證書']
      })
    }

    // 構建更新欄位
    const fieldsToUpdate: Partial<TeacherCertificate> = {}

    if (updateData.verifying_institution !== undefined) {
      fieldsToUpdate.verifying_institution = updateData.verifying_institution.trim()
    }
    if (updateData.license_name !== undefined) {
      fieldsToUpdate.license_name = updateData.license_name.trim()
    }
    if (updateData.holder_name !== undefined) {
      fieldsToUpdate.holder_name = updateData.holder_name.trim()
    }
    if (updateData.license_number !== undefined) {
      fieldsToUpdate.license_number = updateData.license_number.trim()
    }
    if (updateData.file_path !== undefined) {
      fieldsToUpdate.file_path = updateData.file_path.trim()
    }
    if (updateData.category_id !== undefined) {
      fieldsToUpdate.category_id = updateData.category_id.trim()
    }
    if (updateData.subject !== undefined) {
      fieldsToUpdate.subject = updateData.subject.trim()
    }

    // 如果沒有需要更新的欄位
    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new ValidationError({
        update_fields: ['至少需要提供一個要更新的欄位']
      })
    }

    // 更新證書
    await this.certificateRepository.update({ id: certificateId }, fieldsToUpdate)

    // 取得更新後的證書
    const updatedCertificate = await this.certificateRepository.findOne({
      where: { id: certificateId }
    })

    return updatedCertificate!
  }

  /**
   * 刪除證書
   */
  static async deleteCertificate(userId: number, certificateId: number): Promise<void> {
    // 取得教師資料
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 檢查證書是否存在
    const existingCertificate = await this.certificateRepository.findOne({
      where: { id: certificateId }
    })

    if (!existingCertificate) {
      throw new NotFoundError('證書')
    }

    // 檢查擁有權
    if (existingCertificate.teacher_id !== teacher.id) {
      throw new ValidationError({
        permission: ['權限不足，無法刪除此證書']
      })
    }

    // 刪除記錄
    await this.certificateRepository.delete({ id: certificateId })
  }
}
