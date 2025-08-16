import { Request, Response } from 'express'
import { CertificateService } from '@services/certificateService'
import { handleErrorAsync } from '@utils/index'

/**
 * 證書管理控制器
 * 處理教師證書相關的 HTTP 請求
 * 
 * 注意：驗證邏輯已移至 middleware 層級，使用 Joi Schema 進行統一驗證
 */
export class CertificateController {
  private certificateService = new CertificateService()

  /**
   * 取得教師證書列表
   * GET /api/teachers/certificates
   */
  getCertificates = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId

    const certificates = await this.certificateService.getCertificatesByUserId(userId)

    res.status(200).json({
      status: 'success',
      message: '取得證書列表成功',
      data: {
        certificates
      }
    })
  })

  /**
   * 建立新證書
   * POST /api/teachers/certificates
   * 
   * 請求資料已通過 middleware 使用 certificateCreateSchema 驗證
   */
  createCertificate = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    
    // 資料已經過 Joi middleware 驗證和清理
    const certificateData = req.body

    const newCertificate = await this.certificateService.createCertificate(userId, certificateData)

    res.status(201).json({
      status: 'success',
      message: '證書已新增',
      data: {
        certificate: newCertificate
      }
    })
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

    res.status(200).json({
      status: 'success',
      message: '證書已更新',
      data: {
        certificate: updatedCertificate
      }
    })
  })

  /**
   * 刪除證書
   * DELETE /api/teachers/certificates/:id
   */
  deleteCertificate = handleErrorAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId
    const certificateId = parseInt(req.params.id)

    await this.certificateService.deleteCertificate(userId, certificateId)

    res.status(200).json({
      status: 'success',
      message: '證書已刪除',
      data: null
    })
  })
}

export const certificateController = new CertificateController()