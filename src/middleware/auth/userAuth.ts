import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { AccountStatus, UserRole } from '@entities/enums'
import { JwtTokenPayload } from '@models/auth.interface'
import { AuthenticatedUser } from '@/types/middleware'
import { Errors } from '@utils/errors'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'

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
      throw Errors.tokenRequired('Access token 為必填欄位')
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
      where: { id: decoded.userId },
      relations: ['roles']
    })

    if (!user) {
      throw Errors.userNotFound('使用者不存在')
    }

    // 5. 檢查帳號是否為啟用狀態
    if (user.account_status !== AccountStatus.ACTIVE) {
      throw Errors.accountSuspended('帳號狀態異常', 401)
    }

    // 6. 將使用者資訊附加到 request 物件（支援多重角色）
    req.user = {
      userId: decoded.userId,
      role: decoded.role,  // 主要角色，向後相容性
      roles: decoded.roles || [decoded.role],  // 所有角色陣列，向後相容舊 token
      type: decoded.type
    } as AuthenticatedUser

    next()
  } catch (error) {
    next(error) // 傳遞給 errorHandler 中間件處理
  }
}

/**
 * 教師權限檢查中間件（更新支援多重角色）
 * 
 * 功能：
 * - 檢查使用者是否為教師角色
 * - 支援多重角色系統
 * - 必須在 authenticateToken 之後使用
 * 
 * 使用方式：
 * ```typescript
 * router.post('/videos', authenticateToken, requireTeacher, controller.uploadVideo)
 * ```
 */
export const requireTeacher = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // 確保已經通過認證
    if (!req.user) {
      throw Errors.tokenRequired('需要先進行身份認證')
    }

    // 檢查是否為教師角色（支援多重角色）
    const hasTeacherRole = req.user.roles.includes(UserRole.TEACHER)
    
    if (!hasTeacherRole) {
      throw new BusinessError(ERROR_CODES.TEACHER_PERMISSION_REQUIRED, MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, 403)
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * 通用角色檢查中間件 - 支援多重角色和多種檢查模式
 * 
 * @param requiredRoles 必需的角色陣列
 * @param mode 檢查模式：'any' (任一角色) 或 'all' (所有角色)
 * @returns Express 中間件函式
 * 
 * 使用方式：
 * ```typescript
 * // 需要教師或管理員任一角色
 * router.get('/admin-teacher', authenticateToken, requireRoles([UserRole.TEACHER, UserRole.ADMIN], 'any'), controller.method)
 * 
 * // 需要同時具備學生和教師角色
 * router.get('/student-teacher', authenticateToken, requireRoles([UserRole.STUDENT, UserRole.TEACHER], 'all'), controller.method)
 * ```
 */
export const requireRoles = (requiredRoles: UserRole[], mode: 'any' | 'all' = 'any') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 確保已經通過認證
      if (!req.user) {
        throw Errors.tokenRequired('需要先進行身份認證')
      }

      const userRoles = req.user.roles
      let hasPermission = false

      if (mode === 'any') {
        // 檢查是否擁有任一必需角色
        hasPermission = requiredRoles.some(role => userRoles.includes(role))
      } else if (mode === 'all') {
        // 檢查是否擁有所有必需角色
        hasPermission = requiredRoles.every(role => userRoles.includes(role))
      }

      if (!hasPermission) {
        // 根據不同角色需求提供適當的錯誤碼和訊息
        if (requiredRoles.includes(UserRole.TEACHER)) {
          throw new BusinessError(
            ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
            MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED,
            403
          )
        } else if (requiredRoles.includes(UserRole.ADMIN)) {
          throw new BusinessError(
            ERROR_CODES.ADMIN_PERMISSION_DENIED,
            '需要管理員權限才能執行此操作',
            403
          )
        } else {
          throw new BusinessError(
            ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
            `需要以下角色權限: ${requiredRoles.join(', ')} (模式: ${mode})`,
            403
          )
        }
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * 單一角色權限檢查中介軟體（向後相容）
 * 
 * 功能：
 * - 檢查使用者是否擁有指定的單一角色
 * - 提供向後相容性，簡化單一角色檢查的語法
 * - 必須在 authenticateToken 之後使用
 * 
 * 使用方式：
 * ```typescript
 * // 需要教師角色
 * router.get('/teacher-only', authenticateToken, requireRole(UserRole.TEACHER), controller.method)
 * 
 * // 需要學生角色
 * router.get('/student-only', authenticateToken, requireRole(UserRole.STUDENT), controller.method)
 * ```
 */
export const requireRole = (requiredRole: UserRole) => {
  return requireRoles([requiredRole], 'any')
}

/**
 * 學生角色檢查中介軟體
 * 
 * 功能：
 * - 檢查使用者是否為學生角色
 * - 支援多重角色系統
 * - 必須在 authenticateToken 之後使用
 * 
 * 使用方式：
 * ```typescript
 * router.get('/student-content', authenticateToken, requireStudent, controller.getStudentContent)
 * ```
 */
export const requireStudent = requireRole(UserRole.STUDENT)

/**
 * 管理員角色檢查中介軟體（使用者系統）
 * 
 * 功能：
 * - 檢查使用者是否為管理員角色（使用者系統，非 AdminUser）
 * - 支援多重角色系統
 * - 必須在 authenticateToken 之後使用
 * 
 * 使用方式：
 * ```typescript
 * router.get('/admin-content', authenticateToken, requireAdmin, controller.getAdminContent)
 * ```
 */
export const requireAdmin = requireRole(UserRole.ADMIN)

/**
 * 條件式角色權限檢查中介軟體
 * 
 * 功能：
 * - 根據自訂條件檢查使用者角色權限
 * - 支援複雜的業務邏輯權限檢查
 * - 必須在 authenticateToken 之後使用
 * 
 * 使用方式：
 * ```typescript
 * // 教師且具有特定資格
 * const requireQualifiedTeacher = requireRoleWithCondition(
 *   [UserRole.TEACHER], 
 *   'any',
 *   (user) => user.teacher?.isVerified === true
 * )
 * router.put('/courses/:id', authenticateToken, requireQualifiedTeacher, controller.updateCourse)
 * ```
 */
export const requireRoleWithCondition = (
  requiredRoles: UserRole[], 
  mode: 'any' | 'all' = 'any',
  condition: (user: any) => boolean,
  errorMessage?: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // 首先檢查角色權限
      const roleCheck = requireRoles(requiredRoles, mode)
      
      // 執行角色檢查
      roleCheck(req, res, (error?: any) => {
        if (error) {
          return next(error)
        }
        
        // 角色檢查通過後，執行額外條件檢查
        try {
          if (!condition(req.user)) {
            throw new BusinessError(
              ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
              errorMessage || '不符合執行此操作的條件',
              403
            )
          }
          next()
        } catch (conditionError) {
          next(conditionError)
        }
      })
    } catch (error) {
      next(error)
    }
  }
}

/**
 * 任意角色權限檢查中介軟體（別名）
 * 
 * 功能：
 * - requireRoles 的別名，使用 'any' 模式
 * - 提供更直觀的 API
 * 
 * 使用方式：
 * ```typescript
 * router.get('/mixed-content', authenticateToken, requireAnyRole([UserRole.TEACHER, UserRole.ADMIN]), controller.getMixedContent)
 * ```
 */
export const requireAnyRole = (roles: UserRole[]) => requireRoles(roles, 'any')

/**
 * 所有角色權限檢查中介軟體（別名）
 * 
 * 功能：
 * - requireRoles 的別名，使用 'all' 模式
 * - 提供更直觀的 API
 * 
 * 使用方式：
 * ```typescript
 * router.get('/premium-content', authenticateToken, requireAllRoles([UserRole.STUDENT, UserRole.PREMIUM]), controller.getPremiumContent)
 * ```
 */
export const requireAllRoles = (roles: UserRole[]) => requireRoles(roles, 'all')

/**
 * 擁有者權限檢查中介軟體
 * 
 * 功能：
 * - 檢查使用者是否為資源的擁有者
 * - 支援動態資源擁有權檢查
 * - 通常用於確保使用者只能操作自己的資源
 * 
 * 使用方式：
 * ```typescript
 * // 檢查教師是否擁有課程
 * const requireCourseOwner = requireOwnership(
 *   (req) => req.params.courseId,
 *   async (userId, resourceId) => {
 *     const course = await courseService.findByIdAndUserId(resourceId, userId)
 *     return !!course
 *   }
 * )
 * router.delete('/courses/:courseId', authenticateToken, requireTeacher, requireCourseOwner, controller.deleteCourse)
 * ```
 */
export const requireOwnership = (
  resourceIdExtractor: (req: Request) => string | number,
  ownershipChecker: (userId: number, resourceId: string | number) => Promise<boolean>,
  errorMessage?: string
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 確保已經通過認證
      if (!req.user) {
        throw Errors.tokenRequired('需要先進行身份認證')
      }

      const resourceId = resourceIdExtractor(req)
      const userId = req.user.userId
      
      const isOwner = await ownershipChecker(userId, resourceId)
      
      if (!isOwner) {
        throw new BusinessError(
          ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
          errorMessage || '您沒有權限操作此資源',
          403
        )
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}