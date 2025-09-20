/**
 * 管理員控制器
 * 處理管理員相關的 HTTP 請求，包括登入認證、教師審核、課程審核等功能
 * 
 * 功能特點：
 * - 使用 handleErrorAsync 包裝所有方法
 * - 統一錯誤處理和成功回應格式
 * - 從 JWT token 中提取管理員 ID
 * - 整合 AdminService 業務邏輯
 * 
 * 遵循 TDD 開發指示：
 * - 所有方法都對應測試案例中的預期行為
 * - 使用統一的錯誤代碼和訊息
 * - 實作完整的審核工作流程
 */

import { Request, Response } from 'express'
import { adminService } from '@services/index'
import { handleErrorAsync, handleSuccess } from '@utils/index'
import { MESSAGES } from '@constants/Message'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import {
  AdminLoginRequest,
  AdminTokenPayload,
  RejectionRequest,
  AdminCreateRequest
} from '@/types'

// 擴展 Request 介面以包含管理員資訊
interface AuthenticatedRequest extends Request {
  admin?: AdminTokenPayload
}

export class AdminController {
  private adminService = adminService

  /**
   * 從認證的請求中獲取管理員 ID
   * 由於使用了 authenticateAdmin 和 requireAdminPermission 中間件，
   * req.admin 已經被驗證且保證存在
   */
  private getAdminId(req: AuthenticatedRequest): number {
    const adminId = req.admin?.adminId
    if (!adminId) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_TOKEN_INVALID,
        MESSAGES.AUTH.ADMIN_TOKEN_INVALID,
        401
      )
    }
    return adminId
  }

  /**
   * 驗證並解析路徑參數中的數字 ID
   */
  private parseEntityId(id: string, entityName: string): number {
    const numericId = parseInt(id)
    if (isNaN(numericId)) {
      const errorKey = entityName === 'teacher' ? 
        ERROR_CODES.TEACHER_APPLICATION_NOT_FOUND : 
        ERROR_CODES.COURSE_APPLICATION_NOT_FOUND
      const messageKey = entityName === 'teacher' ? 
        MESSAGES.BUSINESS.TEACHER_APPLICATION_NOT_FOUND : 
        MESSAGES.BUSINESS.COURSE_APPLICATION_NOT_FOUND
        
      throw new BusinessError(errorKey, messageKey, 400)
    }
    return numericId
  }

  /**
   * 管理員登入
   * POST /api/admin/login
   */
  login = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    console.log('🚀 [AdminController.login] 收到管理員登入請求')
    console.log('📨 [AdminController.login] 請求資料:', {
      hasBody: !!req.body,
      username: req.body?.username,
      hasPassword: !!req.body?.password,
      passwordLength: req.body?.password?.length || 0,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    })
    
    try {
      const loginData: AdminLoginRequest = req.body

      console.log('⚡ [AdminController.login] 呼叫 AdminService.login')
      const result = await this.adminService.login(loginData)
      console.log('✅ [AdminController.login] AdminService.login 執行成功')

      res.status(200).json(handleSuccess(result, MESSAGES.AUTH.ADMIN_LOGIN_SUCCESS))
      console.log('🎯 [AdminController.login] 回應已發送')
    } catch (error: any) {
      console.log('💥 [AdminController.login] 登入過程發生錯誤:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        status: error?.status
      })
      throw error // 重新拋出錯誤，讓 handleErrorAsync 處理
    }
  })

  /**
   * 建立管理員帳號
   * POST /api/admin/create
   */
  createAdmin = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    console.log('🏗️  [AdminController.createAdmin] 收到建立管理員請求')
    console.log('📨 [AdminController.createAdmin] 請求資料:', {
      hasBody: !!req.body,
      username: req.body?.username,
      name: req.body?.name,
      email: req.body?.email,
      role: req.body?.role,
      hasPassword: !!req.body?.password,
      passwordLength: req.body?.password?.length || 0,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    })
    
    try {
      const createData: AdminCreateRequest = req.body

      console.log('⚡ [AdminController.createAdmin] 呼叫 AdminService.createAdmin')
      const result = await this.adminService.createAdmin(createData)
      console.log('✅ [AdminController.createAdmin] AdminService.createAdmin 執行成功')

      res.status(201).json(handleSuccess(result, MESSAGES.AUTH.ADMIN_CREATED_SUCCESS))
      console.log('🎯 [AdminController.createAdmin] 回應已發送')
    } catch (error: any) {
      console.log('💥 [AdminController.createAdmin] 建立過程發生錯誤:', {
        name: error?.name,
        message: error?.message,
        code: error?.code,
        status: error?.status
      })
      throw error // 重新拋出錯誤，讓 handleErrorAsync 處理
    }
  })

  /**
   * 管理員登出
   * POST /api/admin/logout
   * 需要管理員認證
   */
  logout = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = this.getAdminId(req)
    await this.adminService.logout(adminId)
    res.status(200).json(handleSuccess({}, MESSAGES.AUTH.ADMIN_LOGOUT_SUCCESS))
  })

  /**
   * 核准教師申請
   * POST /api/admin/teachers/:teacherId/approve
   * 需要管理員認證
   */
  approveTeacherApplication = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId = this.parseEntityId(req.params.teacherId, 'teacher')
    const adminId = this.getAdminId(req)

    const result = await this.adminService.approveTeacherApplication(teacherId, adminId)
    res.status(200).json(handleSuccess(result, MESSAGES.ADMIN.TEACHER_APPLICATION_APPROVED))
  })

  /**
   * 拒絕教師申請
   * POST /api/admin/teachers/:teacherId/reject
   * 需要管理員認證
   */
  rejectTeacherApplication = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const teacherId = this.parseEntityId(req.params.teacherId, 'teacher')
    const adminId = this.getAdminId(req)
    const rejectionData: RejectionRequest = req.body

    const result = await this.adminService.rejectTeacherApplication(teacherId, rejectionData, adminId)
    res.status(200).json(handleSuccess(result, MESSAGES.ADMIN.TEACHER_APPLICATION_REJECTED))
  })

  /**
   * 核准課程申請
   * POST /api/admin/courses/:courseId/approve
   * 需要管理員認證
   */
  approveCourseApplication = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const courseId = this.parseEntityId(req.params.courseId, 'course')
    const adminId = this.getAdminId(req)

    const result = await this.adminService.approveCourseApplication(courseId, adminId)
    res.status(200).json(handleSuccess(result, MESSAGES.ADMIN.COURSE_APPLICATION_APPROVED))
  })

  /**
   * 拒絕課程申請
   * POST /api/admin/courses/:courseId/reject
   * 需要管理員認證
   */
  rejectCourseApplication = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const courseId = this.parseEntityId(req.params.courseId, 'course')
    const adminId = this.getAdminId(req)
    const rejectionData: RejectionRequest = req.body

    const result = await this.adminService.rejectCourseApplication(courseId, rejectionData, adminId)
    res.status(200).json(handleSuccess(result, MESSAGES.ADMIN.COURSE_APPLICATION_REJECTED))
  })

  /**
   * 獲取管理員資訊（可選功能，用於檢查登入狀態）
   * GET /api/admin/profile
   * 需要管理員認證
   */
  getProfile = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = this.getAdminId(req)

    // 驗證管理員權限（同時獲取基本資訊）
    await this.adminService.validateAdminPermission(adminId)

    // 返回 token 中的基本資訊
    const profileData = {
      adminId: req.admin?.adminId,
      username: req.admin?.username,
      role: req.admin?.role,
      type: req.admin?.type
    }

    res.status(200).json(handleSuccess(profileData, MESSAGES.AUTH.PROFILE_RETRIEVED))
  })

  /**
   * 獲取教師申請列表
   * GET /api/admin/teacher-applications
   * 需要管理員認證
   */
  getTeacherApplications = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = this.getAdminId(req)
    
    // 驗證管理員權限
    await this.adminService.validateAdminPermission(adminId)

    // 獲取查詢參數
    const status = req.query.status as string
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100) // 限制最大100

    const result = await this.adminService.getTeacherApplications(
      status as any, // 類型轉換，AdminService 會驗證
      page,
      limit
    )

    res.status(200).json(handleSuccess(result, MESSAGES.ADMIN.TEACHER_APPLICATIONS_RETRIEVED))
  })

  /**
   * 獲取課程申請列表
   * GET /api/admin/course-applications
   * 需要管理員認證
   */
  getCourseApplications = handleErrorAsync(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const adminId = this.getAdminId(req)
    
    // 驗證管理員權限
    await this.adminService.validateAdminPermission(adminId)

    // 獲取查詢參數
    const status = req.query.status as string
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100) // 限制最大100

    const result = await this.adminService.getCourseApplications(
      status as any, // 類型轉換，AdminService 會驗證
      page,
      limit
    )

    res.status(200).json(handleSuccess(result, MESSAGES.ADMIN.COURSE_APPLICATIONS_RETRIEVED))
  })
}

// 創建並匯出控制器實例
export const adminController = new AdminController()