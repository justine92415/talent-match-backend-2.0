/**
 * 管理員服務層
 * 實作管理員認證、教師審核、課程審核的業務邏輯
 * 遵循 TDD 指示文件：使用 Errors 工廠函式拋出結構化錯誤，錯誤代碼使用 ERROR_CODES 常數
 */

import bcrypt from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { dataSource } from '@db/data-source'
import { AdminUser } from '@entities/AdminUser'
import { Teacher } from '@entities/Teacher'
import { Course } from '@entities/Course'
import { ApplicationStatus, CourseStatus, UserRole } from '@entities/enums'
import { BusinessError, SystemError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { JWT_CONFIG } from '@config/secret'
import { userRoleService } from './UserRoleService'
import {
  AdminLoginRequest,
  AdminLoginResponse,
  TeacherApplicationApprovalResponse,
  TeacherApplicationRejectionResponse,
  CourseApplicationApprovalResponse,
  RejectionRequest
} from '../types'

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
    const token = sign({ 
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'access'
    }, JWT_CONFIG.SECRET, { expiresIn: '1h' })

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

    // 角色升級：TEACHER_PENDING → TEACHER
    // 檢查使用者當前是否有 TEACHER_PENDING 角色，如果沒有則檢查 TEACHER_APPLICANT
    const hasPendingRole = await userRoleService.hasRole(updatedTeacher.user_id, UserRole.TEACHER_PENDING)
    const hasApplicantRole = await userRoleService.hasRole(updatedTeacher.user_id, UserRole.TEACHER_APPLICANT)
    
    if (hasPendingRole) {
      await userRoleService.upgradeRole(
        updatedTeacher.user_id, 
        UserRole.TEACHER_PENDING, 
        UserRole.TEACHER,
        adminId
      )
    } else if (hasApplicantRole) {
      // 向下相容：仍支援從 TEACHER_APPLICANT 直接升級
      await userRoleService.upgradeRole(
        updatedTeacher.user_id, 
        UserRole.TEACHER_APPLICANT, 
        UserRole.TEACHER,
        adminId
      )
    }

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

  /**
   * 獲取教師申請列表
   * @param status 申請狀態篩選
   * @param page 頁碼
   * @param limit 每頁數量
   * @returns 分頁的教師申請列表
   */
  async getTeacherApplications(status?: ApplicationStatus, page = 1, limit = 20) {
    const queryBuilder = this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .orderBy('teacher.application_submitted_at', 'DESC')

    // 狀態篩選
    if (status) {
      queryBuilder.where('teacher.application_status = :status', { status })
    }

    // 分頁
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    const [applications, total] = await queryBuilder.getManyAndCount()

    return {
      applications: applications.map(teacher => ({
        id: teacher.id,
        uuid: teacher.uuid,
        user: {
          id: teacher.user?.id,
          name: teacher.user?.name,
          email: teacher.user?.email,
          contact_phone: teacher.user?.contact_phone
        },
        introduction: teacher.introduction,
        city: teacher.city,
        district: teacher.district,
        main_category_id: teacher.main_category_id,
        sub_category_ids: teacher.sub_category_ids,
        application_status: teacher.application_status,
        application_submitted_at: teacher.application_submitted_at,
        application_reviewed_at: teacher.application_reviewed_at,
        review_notes: teacher.review_notes
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}

// 匯出服務實例
export const adminService = new AdminService()