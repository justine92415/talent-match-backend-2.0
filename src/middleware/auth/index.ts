/**
 * 認證中間件統一匯出
 * 
 * 提供所有認證相關的中間件函式
 */

// 使用者認證中間件
export { authenticateToken, requireTeacher } from './userAuth'

// 管理員認證中間件
export { authenticateAdmin, requireAdminPermission } from './adminAuth'

// 權限檢查相關中間件
import { authenticateToken, requireTeacher } from './userAuth'
import { authenticateAdmin, requireAdminPermission } from './adminAuth'

/**
 * 常用的認證中間件組合
 */
export const authMiddlewareChains = {
  /** 使用者 + 教師權限檢查 */
  teacherAuth: [authenticateToken, requireTeacher],
  
  /** 管理員認證 + 權限檢查 */
  adminAuth: [authenticateAdmin, requireAdminPermission],
  
  /** 僅使用者認證（不檢查角色） */
  userAuth: [authenticateToken],
  
  /** 僅管理員認證（不檢查權限） */
  adminOnly: [authenticateAdmin]
} as const