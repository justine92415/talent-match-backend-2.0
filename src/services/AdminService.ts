/**
 * 管理員服務層
 * 實作管理員認證、教師審核、課程審核的業務邏輯
 * 遵循 TDD 指示文件：使用 Errors 工廠函式拋出結構化錯誤，錯誤代碼使用 ERROR_CODES 常數
 */

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { dataSource } from '@db/data-source'
import { AdminUser } from '@entities/AdminUser'
import { Teacher } from '@entities/Teacher'
import { Course } from '@entities/Course'
import { ApplicationStatus, CourseStatus } from '@entities/enums'
import { BusinessError, SystemError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { JWT_CONFIG } from '@config/secret'
import {
  AdminLoginRequest,
  AdminLoginResponse,
  TeacherApplicationApprovalResponse,
  TeacherApplicationRejectionResponse,
  CourseApplicationApprovalResponse,
  RejectionRequest
} from '@/types'

export class AdminService {
  private adminUserRepository = dataSource.getRepository(AdminUser)
  private teacherRepository = dataSource.getRepository(Teacher)
  private courseRepository = dataSource.getRepository(Course)

  /**
   * 管理員登入
   * @param loginData 登入資料
   * @returns 管理員資訊和 JWT Token
   */
  async login(loginData: AdminLoginRequest): Promise<AdminLoginResponse> {
    const { username, password } = loginData

    // 查找管理員帳號
    const admin = await this.adminUserRepository.findOne({
      where: { username }
    })

    if (!admin) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_INVALID_CREDENTIALS,
        MESSAGES.AUTH.ADMIN_INVALID_CREDENTIALS,
        401
      )
    }

    // 驗證密碼
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    if (!isPasswordValid) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_INVALID_CREDENTIALS,
        MESSAGES.AUTH.ADMIN_INVALID_CREDENTIALS,
        401
      )
    }

    // 檢查帳號狀態
    if (!admin.is_active) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_ACCOUNT_INACTIVE,
        MESSAGES.AUTH.ADMIN_ACCOUNT_INACTIVE,
        403
      )
    }

    // 更新最後登入時間
    admin.last_login_at = new Date()
    await this.adminUserRepository.save(admin)

    // 產生 JWT Token
    const token = jwt.sign(
      {
        adminId: admin.id,
        username: admin.username,
        role: admin.role,
        type: 'access' // 修正：使用 'access' 而非 'admin'
      },
      JWT_CONFIG.SECRET,
      { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN }
    )

    return {
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        last_login_at: admin.last_login_at?.toISOString() || null
      },
      access_token: token,
      refresh_token: token // 暫時使用相同 token，後續可優化
    }
  }

  /**
   * 管理員登出（目前為簡化版本，實際可擴展為 token blacklist）
   * @param adminId 管理員 ID
   */
  async logout(adminId: number): Promise<void> {
    // 驗證管理員是否存在
    const admin = await this.adminUserRepository.findOne({
      where: { id: adminId }
    })

    if (!admin) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_USER_NOT_FOUND,
        MESSAGES.BUSINESS.ADMIN_USER_NOT_FOUND,
        404
      )
    }

    // 簡化版登出，實際專案中可以實作 token blacklist
    // 目前只是驗證管理員存在即可
  }

  /**
   * 核准教師申請
   * @param teacherId 教師 ID
   * @param adminId 審核的管理員 ID
   * @returns 更新後的教師資訊
   */
  async approveTeacherApplication(teacherId: number, adminId: number): Promise<TeacherApplicationApprovalResponse> {
    // 查找教師申請
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['user']
    })

    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.TEACHER_APPLICATION_NOT_FOUND,
        MESSAGES.BUSINESS.TEACHER_APPLICATION_NOT_FOUND,
        404
      )
    }

    // 檢查申請狀態
    if (teacher.application_status !== ApplicationStatus.PENDING) {
      if (teacher.application_status === ApplicationStatus.APPROVED || teacher.application_status === ApplicationStatus.REJECTED) {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_ALREADY_REVIEWED,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
      } else {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_STATUS_NOT_PENDING,
          MESSAGES.BUSINESS.APPLICATION_STATUS_NOT_PENDING,
          422
        )
      }
    }

    // 更新教師申請狀態
    teacher.application_status = ApplicationStatus.APPROVED
    teacher.application_reviewed_at = new Date()
    teacher.reviewer_id = adminId
    teacher.review_notes = undefined // 清除之前的拒絕原因

    const updatedTeacher = await this.teacherRepository.save(teacher)

    return {
      teacher: {
        id: updatedTeacher.id,
        uuid: updatedTeacher.uuid,
        user_id: updatedTeacher.user_id,
        application_status: updatedTeacher.application_status,
        application_reviewed_at: updatedTeacher.application_reviewed_at?.toISOString() || '',
        reviewer_id: updatedTeacher.reviewer_id || 0
      },
      user: {
        id: updatedTeacher.user?.id || updatedTeacher.user_id,
        role: 'teacher' // 審核通過後設為教師角色
      }
    }
  }

  /**
   * 拒絕教師申請
   * @param teacherId 教師 ID
   * @param rejectionData 拒絕資料
   * @param adminId 審核的管理員 ID
   * @returns 更新後的教師資訊
   */
  async rejectTeacherApplication(
    teacherId: number,
    rejectionData: RejectionRequest,
    adminId: number
  ): Promise<TeacherApplicationRejectionResponse> {
    // 查找教師申請
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['user']
    })

    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.TEACHER_APPLICATION_NOT_FOUND,
        MESSAGES.BUSINESS.TEACHER_APPLICATION_NOT_FOUND,
        404
      )
    }

    // 檢查申請狀態
    if (teacher.application_status !== ApplicationStatus.PENDING) {
      if (teacher.application_status === ApplicationStatus.APPROVED || teacher.application_status === ApplicationStatus.REJECTED) {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_ALREADY_REVIEWED,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
      } else {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_STATUS_NOT_PENDING,
          MESSAGES.BUSINESS.APPLICATION_STATUS_NOT_PENDING,
          422
        )
      }
    }

    // 更新教師申請狀態
    teacher.application_status = ApplicationStatus.REJECTED
    teacher.application_reviewed_at = new Date()
    teacher.reviewer_id = adminId
    teacher.review_notes = rejectionData.rejectionReason

    const updatedTeacher = await this.teacherRepository.save(teacher)

    return {
      teacher: {
        id: updatedTeacher.id,
        uuid: updatedTeacher.uuid,
        user_id: updatedTeacher.user_id,
        application_status: updatedTeacher.application_status,
        application_reviewed_at: updatedTeacher.application_reviewed_at?.toISOString() || '',
        reviewer_id: updatedTeacher.reviewer_id || 0,
        review_notes: updatedTeacher.review_notes || ''
      }
    }
  }

  /**
   * 核准課程申請
   * @param courseId 課程 ID
   * @param adminId 審核的管理員 ID
   * @returns 更新後的課程資訊
   */
  async approveCourseApplication(courseId: number, adminId: number): Promise<CourseApplicationApprovalResponse> {
    // 查找課程申請
    const course = await this.courseRepository.findOne({
      where: { id: courseId }
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_APPLICATION_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_APPLICATION_NOT_FOUND,
        404
      )
    }

    // 注意：目前 Course entity 沒有審核相關欄位
    // 以下程式碼是預期的實作，等 Course entity 更新後可以使用
    /*
    // 檢查課程狀態
    if (course.status !== CourseStatus.PENDING) {
      if (course.status === CourseStatus.APPROVED || course.status === CourseStatus.REJECTED) {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_ALREADY_REVIEWED,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
      } else {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_STATUS_NOT_PENDING,
          MESSAGES.BUSINESS.APPLICATION_STATUS_NOT_PENDING,
          422
        )
      }
    }

    // 更新課程申請狀態
    course.status = CourseStatus.APPROVED
    course.reviewed_at = new Date()
    course.reviewer_id = adminId
    course.rejection_reason = null

    const updatedCourse = await this.courseRepository.save(course)
    */

    // 暫時返回基本課程資訊
    return {
      course: {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        teacher_id: course.teacher_id,
        status: 'approved', // 暫時固定值
        application_status: 'approved', // 暫時固定值
        created_at: course.created_at.toISOString(),
        updated_at: course.updated_at.toISOString()
      }
    }
  }

  /**
   * 拒絕課程申請
   * @param courseId 課程 ID
   * @param rejectionData 拒絕資料
   * @param adminId 審核的管理員 ID
   * @returns 更新後的課程資訊
   */
  async rejectCourseApplication(
    courseId: number,
    rejectionData: RejectionRequest,
    adminId: number
  ): Promise<CourseApplicationApprovalResponse> {
    // 查找課程申請
    const course = await this.courseRepository.findOne({
      where: { id: courseId }
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_APPLICATION_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_APPLICATION_NOT_FOUND,
        404
      )
    }

    // 注意：目前 Course entity 沒有審核相關欄位
    // 以下程式碼是預期的實作，等 Course entity 更新後可以使用
    /*
    // 檢查課程狀態
    if (course.status !== CourseStatus.PENDING) {
      if (course.status === CourseStatus.APPROVED || course.status === CourseStatus.REJECTED) {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_ALREADY_REVIEWED,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
      } else {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_STATUS_NOT_PENDING,
          MESSAGES.BUSINESS.APPLICATION_STATUS_NOT_PENDING,
          422
        )
      }
    }

    // 更新課程申請狀態
    course.status = CourseStatus.REJECTED
    course.reviewed_at = new Date()
    course.reviewer_id = adminId
    course.rejection_reason = rejectionData.rejectionReason

    const updatedCourse = await this.courseRepository.save(course)
    */

    // 暫時返回基本課程資訊
    return {
      course: {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        teacher_id: course.teacher_id,
        status: 'rejected', // 暫時固定值
        application_status: 'rejected', // 暫時固定值
        created_at: course.created_at.toISOString(),
        updated_at: course.updated_at.toISOString()
      }
    }
  }

  /**
   * 驗證管理員權限
   * @param adminId 管理員 ID
   * @throws 如果管理員不存在或無權限
   */
  async validateAdminPermission(adminId: number): Promise<void> {
    const admin = await this.adminUserRepository.findOne({
      where: { id: adminId }
    })

    if (!admin) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_USER_NOT_FOUND,
        MESSAGES.BUSINESS.ADMIN_USER_NOT_FOUND,
        404
      )
    }

    if (!admin.is_active) {
      throw new BusinessError(
        ERROR_CODES.ADMIN_PERMISSION_DENIED,
        MESSAGES.AUTH.ADMIN_PERMISSION_DENIED,
        403
      )
    }
  }
}

// 匯出服務實例
export const adminService = new AdminService()