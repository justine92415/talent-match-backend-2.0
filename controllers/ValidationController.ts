import { Request, Response } from 'express'
import { dataSource } from '../db/data-source'
import { User } from '../entities/User'

export class ValidationController {
  /**
   * Email 可用性驗證
   */
  static async email(req: Request, res: Response) {
    try {
      const { email } = req.body
      const errors: Record<string, string[]> = {}

      // 檢查必填欄位
      if (!email || email.trim() === '') {
        errors.email = ['請輸入有效的電子郵件格式']
      } else {
        const trimmedEmail = email.trim()
        
        // Email 格式驗證
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          errors.email = ['請輸入有效的電子郵件格式']
        } else if (trimmedEmail.length > 255) {
          errors.email = ['電子郵件長度不能超過255字元']
        }
      }

      // 如果有驗證錯誤，直接回傳
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          status: 'error',
          message: '驗證失敗',
          errors
        })
      }

      // 檢查 email 是否已被註冊
      const userRepository = dataSource.getRepository(User)
      const existingUser = await userRepository.findOne({ 
        where: { email: email.trim().toLowerCase() } 
      })

      const available = !existingUser

      return res.status(200).json({
        status: 'success',
        message: available ? 'Email 可以使用' : 'Email 已被註冊',
        data: {
          available
        }
      })
    } catch (error) {
      console.error('Email 驗證錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }
}
