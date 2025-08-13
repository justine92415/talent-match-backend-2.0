import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { dataSource } from '../db/data-source'
import { User } from '../entities/User'
import { AccountStatus } from '../entities/enums'

// 擴展 Request 型別以包含使用者資訊
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        uuid: string
        role: string
        account_status: string
      }
    }
  }
}

/**
 * JWT 認證中介軟體
 * 驗證 Bearer Token 並將使用者資訊加入 request 物件
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: '請先登入'
      })
    }

    // 驗證 JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
    let decoded: any

    try {
      decoded = jwt.verify(token, jwtSecret)
    } catch (jwtError) {
      return res.status(401).json({
        status: 'error',
        message: '請先登入'
      })
    }

    // 檢查 token 類型（確保不是 refresh token）
    if (decoded.token_type === 'refresh') {
      return res.status(401).json({
        status: 'error',
        message: '請先登入'
      })
    }

    // 查詢使用者
    const userRepository = dataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: {
        id: decoded.user_id,
        uuid: decoded.sub
      }
    })

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: '請先登入'
      })
    }

    // 檢查帳號狀態
    if (user.account_status === AccountStatus.DEACTIVATED) {
      return res.status(401).json({
        status: 'error',
        message: '請先登入'
      })
    }

    // 將使用者資訊加入 request 物件
    req.user = {
      id: user.id,
      uuid: user.uuid,
      role: user.role,
      account_status: user.account_status
    }

    next()
  } catch (error) {
    console.error('認證中介軟體錯誤:', error)
    return res.status(500).json({
      status: 'error',
      message: '系統錯誤，請稍後再試'
    })
  }
}
