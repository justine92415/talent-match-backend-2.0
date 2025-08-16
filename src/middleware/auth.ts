import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { AccountStatus } from '@entities/enums'
import { JwtTokenPayload } from '@models/auth.interface'
import { Errors } from '@utils/errors'

/**
 * JWT Token 認證中間件
 * 
 * 功能：
 * - 驗證 JWT Token 的有效性
 * - 檢查使用者帳號狀態
 * - 將使用者資訊附加到 request 物件
 * 
 * 使用方式：
 * ```typescript
 * router.get('/profile', authenticateToken, controller.getProfile)
 * ```
 */

/**
 * 擴展 Request 介面以包含使用者資訊
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number
        role: string
        type: string
      }
    }
  }
}

/**
 * JWT Token 認證中間件
 * 
 * @param req Express Request 物件
 * @param res Express Response 物件
 * @param next Express NextFunction
 * @returns void
 * 
 * @throws {401} Token 不存在或無效
 * @throws {401} Token 已過期
 * @throws {401} 使用者不存在或帳號狀態異常
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. 從 Authorization header 取得 token
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      throw Errors.unauthorizedAccess('Access token 為必填欄位')
    }

    // 2. 驗證 JWT Token
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      throw new Error('系統配置錯誤')
    }

    let decoded: JwtTokenPayload
    try {
      decoded = jwt.verify(token, jwtSecret) as JwtTokenPayload
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw Errors.tokenExpired('Token 已過期')
      }

      throw Errors.invalidToken('Token 無效')
    }

    // 3. 檢查 token 型別（必須是 access token）
    if (decoded.type !== 'access') {
      throw Errors.invalidToken('Token 型別錯誤')
    }

    // 4. 查詢使用者並檢查帳號狀態
    const userRepository = dataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw Errors.userNotFound('使用者不存在')
    }

    // 5. 檢查帳號是否為啟用狀態
    if (user.account_status !== AccountStatus.ACTIVE) {
      throw Errors.accountSuspended('帳號狀態異常', 401)
    }

    // 6. 將使用者資訊附加到 request 物件
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      type: decoded.type
    }

    next()
  } catch (error) {
    next(error) // 傳遞給 errorHandler 中間件處理
  }
}