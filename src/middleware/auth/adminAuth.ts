import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { dataSource } from '@db/data-source'
import { AdminUser } from '@entities/AdminUser'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { JWT_CONFIG } from '@config/secret'
import { AdminTokenPayload } from '@/types'

/**
 * 管理員認證中介層
 * 
 * 功能：
 * - 驗證管理員 JWT Token 的有效性
 * - 檢查管理員帳號狀態
 * - 將管理員資訊附加到 request 物件
 * 
 * 使用方式：
 * ```typescript
 * router.post('/teachers/:id/approve', authenticateAdmin, controller.approveTeacherApplication)
 * ```
 */

/**
 * 管理員 JWT Token 認證中間件
 * 
 * @param req Express Request 物件
 * @param res Express Response 物件
 * @param next Express NextFunction
 * @returns void
 * 
 * @throws {401} Token 不存在或無效
 * @throws {401} Token 已過期
 * @throws {403} 管理員不存在或帳號被停用
 */
export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. 從 Authorization header 取得 token
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_TOKEN_REQUIRED,
        MESSAGES.AUTH.ADMIN_TOKEN_REQUIRED,
        401
      )
    }

    // 2. 驗證 JWT Token
    let decoded: AdminTokenPayload & jwt.JwtPayload
    try {
      decoded = jwt.verify(token, JWT_CONFIG.SECRET) as AdminTokenPayload & jwt.JwtPayload
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        throw new BusinessError(
          ERROR_CODES.ADMIN_TOKEN_INVALID,
          MESSAGES.AUTH.ADMIN_TOKEN_INVALID,
          401
        )
      }

      throw new BusinessError(
        ERROR_CODES.ADMIN_TOKEN_INVALID,
        MESSAGES.AUTH.ADMIN_TOKEN_INVALID,
        401
      )
    }

    // 3. 檢查是否為管理員 token（是否包含 adminId）
    if (!decoded.adminId) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_PERMISSION_DENIED,
        MESSAGES.AUTH.ADMIN_PERMISSION_DENIED,
        403
      )
    }

    // 4. 檢查 token 型別（必須是 access token）
    if (decoded.type !== 'access') {
      throw new BusinessError(
        ERROR_CODES.ADMIN_TOKEN_INVALID,
        MESSAGES.AUTH.ADMIN_TOKEN_INVALID,
        401
      )
    }

    // 5. 查詢管理員並檢查帳號狀態
    const adminRepository = dataSource.getRepository(AdminUser)
    const admin = await adminRepository.findOne({
      where: { id: decoded.adminId }
    })

    if (!admin) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_USER_NOT_FOUND,
        MESSAGES.BUSINESS.ADMIN_USER_NOT_FOUND,
        404
      )
    }

    // 6. 檢查帳號是否為啟用狀態
    if (!admin.is_active) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_ACCOUNT_INACTIVE,
        MESSAGES.AUTH.ADMIN_ACCOUNT_INACTIVE,
        403
      )
    }

    // 7. 將管理員資訊附加到 request 物件
    req.admin = {
      adminId: decoded.adminId,
      username: decoded.username,
      role: decoded.role,
      type: decoded.type
    } as AdminTokenPayload

    next()
  } catch (error) {
    next(error) // 傳遞給 errorHandler 中間件處理
  }
}

/**
 * 管理員權限檢查中間件
 * 
 * 功能：
 * - 檢查管理員是否有執行管理操作的權限
 * - 必須在 authenticateAdmin 之後使用
 * 
 * 使用方式：
 * ```typescript
 * router.post('/teachers/:id/approve', authenticateAdmin, requireAdminPermission, controller.approveTeacherApplication)
 * ```
 */
export const requireAdminPermission = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 確保已經通過管理員認證
    if (!req.admin) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_TOKEN_REQUIRED,
        MESSAGES.AUTH.ADMIN_TOKEN_REQUIRED,
        401
      )
    }

    // 檢查是否有管理員權限（這裡可以根據角色進行進一步的權限控制）
    if (!req.admin.role) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_PERMISSION_DENIED,
        MESSAGES.AUTH.ADMIN_PERMISSION_DENIED,
        403
      )
    }

    next()
  } catch (error) {
    next(error)
  }
}