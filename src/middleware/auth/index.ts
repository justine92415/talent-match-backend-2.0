import { Request, Response, NextFunction } from 'express'

import { UserRole } from '@entities/enums'

// 使用者認證中間件
export { 
  authenticateToken, 
  requireTeacher, 
  requireRoles, 
  requireRole, 
  requireStudent, 
  requireAdmin,
  requireRoleWithCondition,
  requireAnyRole,
  requireAllRoles,
  requireOwnership
} from './userAuth'

// 管理員認證中間件
export { authenticateAdmin, requireAdminPermission } from './adminAuth'

// 權限檢查相關中間件
import { 
  authenticateToken, 
  requireTeacher, 
  requireRoles, 
  requireRole, 
  requireStudent, 
  requireAdmin,
  requireRoleWithCondition,
  requireAnyRole,
  requireAllRoles,
  requireOwnership
} from './userAuth'
import { authenticateAdmin, requireAdminPermission } from './adminAuth'

/**
 * 常用的認證中間件組合 - 支援多重角色
 */
export const authMiddlewareChains = {
  /** 使用者 + 教師權限檢查 */
  teacherAuth: [authenticateToken, requireTeacher],
  
  /** 管理員認證 + 權限檢查 */
  adminAuth: [authenticateAdmin, requireAdminPermission],
  
  /** 僅使用者認證（不檢查角色） */
  userAuth: [authenticateToken],
  
  /** 僅管理員認證（不檢查權限） */
  adminOnly: [authenticateAdmin],
  
  /** 學生權限檢查 */
  studentAuth: [authenticateToken, requireStudent],
  
  /** 使用者系統管理員權限檢查 */
  userAdminAuth: [authenticateToken, requireAdmin],
  
  /** 教師或管理員任一角色 */
  teacherOrAdminAuth: [authenticateToken, requireAnyRole([UserRole.TEACHER, UserRole.ADMIN])],
  
  /** 學生+教師雙重角色 */
  studentTeacherAuth: [authenticateToken, requireAllRoles([UserRole.STUDENT, UserRole.TEACHER])],
  
  /** 學生或教師任一角色 */
  studentOrTeacherAuth: [authenticateToken, requireAnyRole([UserRole.STUDENT, UserRole.TEACHER])],
  
  /** 任何已認證使用者（學生、教師或管理員） */
  anyUserAuth: [authenticateToken, requireAnyRole([UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN])]
} as const

/**
 * 進階權限組合建構器
 * 
 * 提供靈活的權限組合建構功能
 */
export const createAuthChain = {
  /**
   * 建立基本認證鏈
   */
  basic: (roles: UserRole[], mode: 'any' | 'all' = 'any') => [
    authenticateToken, 
    requireRoles(roles, mode)
  ],
  
  /**
   * 建立條件式認證鏈
   */
  withCondition: (
    roles: UserRole[], 
    condition: (user: any) => boolean, 
    mode: 'any' | 'all' = 'any'
  ) => [
    authenticateToken, 
    requireRoleWithCondition(roles, mode, condition)
  ],
  
  /**
   * 建立擁有者權限認證鏈
   */
  withOwnership: (
    roles: UserRole[],
    resourceIdExtractor: (req: Request) => string | number,
    ownershipChecker: (userId: number, resourceId: string | number) => Promise<boolean>
  ) => [
    authenticateToken,
    requireRoles(roles, 'any'),
    requireOwnership(resourceIdExtractor, ownershipChecker)
  ]
}