import { Request, Response } from 'express'
import { certificateService } from '@services/index'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { SUCCESS } from '@constants/Message'

/**
 * 證書管理控制器
 * 處理教師證書相關的 HTTP 請求
 * 
 * 注意：驗證邏輯已移至 middleware 層級，使用 Joi Schema 進行統一驗證
 */
export class CertificateController {
  private certificateService = certificateService

  /**
   * 取得教師證書列表
   * GET /api/teachers/certificates
   */
  getCertificates = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId

    const certificates = await this.certificateService.getCertificatesByUserId(userId)

    res.status(200).json(handleSuccess({
      certificates
    }, '取得證書列表成功'))
  })

  /**
   * 建立新證書（支援批次）
   * POST /api/teachers/certificates
   * 
   * 請求資料已通過 middleware 使用 certificateCreateBatchSchema 驗證
   */
  createCertificate = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    
    // 從 req.body.certificates 取得陣列資料
    const certificatesData = req.body.certificates

    const newCertificates = await this.certificateService.createCertificatesBatch(userId, certificatesData)

    const message = `成功建立 ${newCertificates.length} 張證照`
    res.status(201).json(handleCreated({
      certificates: newCertificates
    }, message))
  })

  /**
   * 批次新增或更新證照
   * PUT /api/teachers/certificates
   * 
   * 請求資料已通過 middleware 使用 certificateUpsertSchema 驗證
   */
  upsertCertificates = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    
    // 從 req.body.certificates 取得陣列資料
    const certificatesData = req.body.certificates

    const result = await this.certificateService.upsertCertificatesBatch(userId, certificatesData)

    const message = `成功處理證照：新增 ${result.statistics.created_count} 張，更新 ${result.statistics.updated_count} 張`
    res.status(200).json(handleSuccess({
      statistics: result.statistics,
      certificates: result.certificates
    }, message))
  })

  /**
   * 更新證書
   * PUT /api/teachers/certificates/:id
   * 
   * 請求資料已通過 middleware 使用 certificateUpdateSchema 驗證
   */
  updateCertificate = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const certificateId = parseInt(req.params.id)
    
    // 資料已經過 Joi middleware 驗證和清理
    const updateData = req.body

    const updatedCertificate = await this.certificateService.updateCertificate(userId, certificateId, updateData)

    res.status(200).json(handleSuccess({
      certificate: updatedCertificate
    }, '證書已更新'))
  })

  /**
   * 刪除證書
   * DELETE /api/teachers/certificates/:id
   */
  deleteCertificate = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const certificateId = parseInt(req.params.id)

    await this.certificateService.deleteCertificate(userId, certificateId)

    res.status(200).json(handleSuccess(null, SUCCESS.CERTIFICATE_DELETED))
  })
}

export const certificateController = new CertificateController()