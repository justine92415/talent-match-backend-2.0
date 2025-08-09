import { Request, Response } from 'express'
import { dataSource } from '../db/data-source'
import { User } from '../entities/User'

export class UsersController {
  /**
   * 取得個人資料
   */
  static async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: '未授權'
        })
      }

      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { id: req.user.id }
      })

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: '使用者不存在'
        })
      }

      // 回傳使用者資料（排除密碼）
      const userProfile = {
        id: user.id,
        uuid: user.uuid,
        nick_name: user.nick_name,
        name: user.name,
        email: user.email,
        phone: user.contact_phone,
        avatar_image: user.avatar_image,
        avatar_google_url: user.avatar_google_url,
        google_id: user.google_id,
        role: user.role,
        account_status: user.account_status,
        created_at: user.created_at?.toISOString(),
        updated_at: user.updated_at?.toISOString(),
        last_login_at: user.last_login_at?.toISOString()
      }

      return res.status(200).json({
        status: 'success',
        message: '取得個人資料成功',
        data: {
          user: userProfile
        }
      })
    } catch (error) {
      console.error('取得個人資料錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }

  /**
   * 更新個人資料
   */
  static async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: '未授權'
        })
      }

      const { nick_name, name, phone } = req.body
      const errors: Record<string, string[]> = {}

      // 驗證暱稱
      if (nick_name !== undefined) {
        if (typeof nick_name !== 'string') {
          errors.nick_name = ['暱稱必須是字串格式']
        } else if (nick_name.trim() === '') {
          errors.nick_name = ['暱稱不能為空']
        } else if (nick_name.length > 50) {
          errors.nick_name = ['暱稱長度不能超過50字元']
        }
      }

      // 驗證真實姓名
      if (name !== undefined) {
        if (typeof name !== 'string') {
          errors.name = ['真實姓名必須是字串格式']
        } else if (name.trim() === '') {
          errors.name = ['真實姓名不能為空']
        } else if (name.length > 100) {
          errors.name = ['真實姓名長度不能超過100字元']
        }
      }

      // 驗證電話號碼
      if (phone !== undefined) {
        if (typeof phone !== 'string') {
          errors.phone = ['電話號碼必須是字串格式']
        } else if (phone.trim() !== '' && !/^09\d{8}$/.test(phone.trim())) {
          errors.phone = ['請輸入有效的台灣手機號碼格式']
        }
      }

      // 如果有驗證錯誤，直接回傳
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          status: 'error',
          message: '個人資料更新失敗',
          errors
        })
      }

      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { id: req.user.id }
      })

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: '使用者不存在'
        })
      }

      // 更新允許的欄位
      if (nick_name !== undefined && nick_name.trim() !== '') {
        user.nick_name = nick_name.trim()
      }
      if (name !== undefined) {
        user.name = name.trim() || null
      }
      if (phone !== undefined) {
        user.contact_phone = phone.trim() || null
      }

      user.updated_at = new Date()
      await userRepository.save(user)

      // 回傳更新後的使用者資料（排除密碼）
      const updatedProfile = {
        id: user.id,
        uuid: user.uuid,
        nick_name: user.nick_name,
        name: user.name,
        email: user.email,
        phone: user.contact_phone,
        avatar_image: user.avatar_image,
        avatar_google_url: user.avatar_google_url,
        google_id: user.google_id,
        role: user.role,
        account_status: user.account_status,
        created_at: user.created_at?.toISOString(),
        updated_at: user.updated_at?.toISOString(),
        last_login_at: user.last_login_at?.toISOString()
      }

      return res.status(200).json({
        status: 'success',
        message: '個人資料更新成功',
        data: {
          user: updatedProfile
        }
      })
    } catch (error) {
      console.error('更新個人資料錯誤:', error)
      return res.status(500).json({
        status: 'error',
        message: '系統錯誤，請稍後再試'
      })
    }
  }
}
