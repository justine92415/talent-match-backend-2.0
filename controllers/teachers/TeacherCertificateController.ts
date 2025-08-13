import { Request, Response } from 'express'
import { TeacherCertificateService } from '../../services/TeacherCertificateService'
import { ResponseHelper } from '../../utils/responseHelper'
import { ValidationError, NotFoundError } from '../../middleware/errorHandler'
import { TeacherCertificateRequest, TeacherCertificateUpdateRequest, TeacherCertificateListResponse, TeacherCertificateResponse } from '../../types/teachers'

export class TeacherCertificateController {
  /**
   * 取得教師證書列表
   */
  static async getCertificates(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const certificates = await TeacherCertificateService.getCertificates(userId)

      const formattedCertificates = certificates.map(cert => ({
        id: cert.id,
        teacher_id: cert.teacher_id,
        verifying_institution: cert.verifying_institution,
        license_name: cert.license_name,
        holder_name: cert.holder_name,
        license_number: cert.license_number,
        file_path: cert.file_path,
        category_id: cert.category_id,
        subject: cert.subject,
        created_at: cert.created_at.toISOString(),
        updated_at: cert.updated_at.toISOString()
      }))

      res.status(200).json({
        status: 'success',
        message: '查詢成功',
        data: {
          certificates: formattedCertificates
        }
      })
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '證書')
      } else {
        console.error('Get certificates error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 建立新證書
   */
  static async createCertificate(req: Request, res: Response): Promise<void> {
    try {
      const certificateData: TeacherCertificateRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      const savedCertificate = await TeacherCertificateService.createCertificate(userId, certificateData)

      res.status(201).json({
        status: 'success',
        message: '建立證書成功',
        data: {
          certificate: {
            id: savedCertificate.id,
            teacher_id: savedCertificate.teacher_id,
            verifying_institution: savedCertificate.verifying_institution,
            license_name: savedCertificate.license_name,
            holder_name: savedCertificate.holder_name,
            license_number: savedCertificate.license_number,
            file_path: savedCertificate.file_path,
            category_id: savedCertificate.category_id,
            subject: savedCertificate.subject,
            created_at: savedCertificate.created_at.toISOString(),
            updated_at: savedCertificate.updated_at.toISOString()
          }
        }
      })
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '證書')
      } else if (error instanceof ValidationError) {
        ResponseHelper.validationError(res, error.errors)
      } else {
        console.error('Create certificate error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 更新證書
   */
  static async updateCertificate(req: Request, res: Response): Promise<void> {
    try {
      const certificateId = parseInt(req.params.id, 10)
      const updateData: TeacherCertificateUpdateRequest = req.body
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      if (!certificateId || isNaN(certificateId)) {
        ResponseHelper.error(res, '無效的證書ID')
        return
      }

      const updatedCertificate = await TeacherCertificateService.updateCertificate(userId, certificateId, updateData)

      res.status(200).json({
        status: 'success',
        message: '更新證書成功',
        data: {
          certificate: {
            id: updatedCertificate.id,
            teacher_id: updatedCertificate.teacher_id,
            verifying_institution: updatedCertificate.verifying_institution,
            license_name: updatedCertificate.license_name,
            holder_name: updatedCertificate.holder_name,
            license_number: updatedCertificate.license_number,
            file_path: updatedCertificate.file_path,
            category_id: updatedCertificate.category_id,
            subject: updatedCertificate.subject,
            created_at: updatedCertificate.created_at.toISOString(),
            updated_at: updatedCertificate.updated_at.toISOString()
          }
        }
      })
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '證書')
      } else if (error instanceof ValidationError) {
        if (error.errors.permission) {
          ResponseHelper.forbidden(res, '修改', '證書')
        } else {
          ResponseHelper.validationError(res, error.errors)
        }
      } else {
        console.error('Update certificate error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 刪除證書
   */
  static async deleteCertificate(req: Request, res: Response): Promise<void> {
    try {
      const certificateId = parseInt(req.params.id, 10)
      const userId = req.user?.id

      if (!userId) {
        ResponseHelper.unauthorized(res)
        return
      }

      if (!certificateId || isNaN(certificateId)) {
        ResponseHelper.error(res, '無效的證書ID')
        return
      }

      await TeacherCertificateService.deleteCertificate(userId, certificateId)

      res.status(200).json({
        status: 'success',
        message: '刪除證書成功'
      })
    } catch (error) {
      if (error instanceof NotFoundError) {
        ResponseHelper.notFound(res, '證書')
      } else if (error instanceof ValidationError) {
        if (error.errors.permission) {
          ResponseHelper.forbidden(res, '刪除', '證書')
        } else {
          ResponseHelper.validationError(res, error.errors)
        }
      } else {
        console.error('Delete certificate error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }
}
