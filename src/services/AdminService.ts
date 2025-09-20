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
import { ApplicationStatus, CourseStatus, UserRole, AdminRole } from '@entities/enums'
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
  RejectionRequest,
  AdminCreateRequest,
  AdminCreateResponse
} from '../types'

export class AdminService {
  private adminUserRepository = dataSource.getRepository(AdminUser)
  private teacherRepository = dataSource.getRepository(Teacher)
  private courseRepository = dataSource.getRepository(Course)

  constructor() {
    console.log('🏗️  [AdminService] 初始化 AdminService')
    console.log('🔧 [AdminService] 環境資訊:', {
      nodeEnv: process.env.NODE_ENV,
      dbHost: process.env.DB_HOST,
      dbPort: process.env.DB_PORT,
      dbDatabase: process.env.DB_DATABASE,
      dbUsername: process.env.DB_USERNAME,
      hasDbPassword: !!process.env.DB_PASSWORD,
      hasJwtSecret: !!process.env.JWT_SECRET
    })
  }

  /**
   * 管理員登入
   * @param loginData 登入資料
   * @returns 管理員資訊和 JWT Token
   */
  async login(loginData: AdminLoginRequest): Promise<AdminLoginResponse> {
    console.log('🔍 [AdminService.login] 開始管理員登入流程')
    console.log('📝 [AdminService.login] 登入資料:', { 
      username: loginData.username,
      passwordLength: loginData.password?.length || 0,
      environment: process.env.NODE_ENV || 'unknown'
    })
    
    const { username, password } = loginData

    // 查找管理員帳號
    console.log('🔎 [AdminService.login] 查詢管理員帳號:', username)
    console.log('🗄️  [AdminService.login] 資料庫連線狀態:', {
      isInitialized: dataSource.isInitialized,
      databaseType: dataSource.options.type,
      database: dataSource.options.database
    })
    
    const admin = await this.adminUserRepository.findOne({
      where: { username }
    })

    console.log('👤 [AdminService.login] 管理員帳號查詢結果:', {
      found: !!admin,
      adminId: admin?.id,
      isActive: admin?.is_active,
      hasPassword: !!admin?.password,
      passwordLength: admin?.password?.length || 0
    })

    if (!admin) {
      console.log('❌ [AdminService.login] 管理員帳號不存在:', username)
      
      // 在非 production 環境下，列出所有管理員帳號協助除錯
      if (process.env.NODE_ENV !== 'production') {
        try {
          const allAdmins = await this.adminUserRepository.find({
            select: ['id', 'username', 'is_active']
          })
          console.log('📋 [AdminService.login] 所有管理員帳號:', allAdmins)
        } catch (error) {
          console.log('⚠️  [AdminService.login] 無法查詢管理員列表:', error)
        }
      }
      
      throw new BusinessError(
        ERROR_CODES.ADMIN_INVALID_CREDENTIALS,
        MESSAGES.AUTH.ADMIN_INVALID_CREDENTIALS,
        401
      )
    }

    // 驗證密碼
    console.log('🔐 [AdminService.login] 開始驗證密碼')
    console.log('🔐 [AdminService.login] 密碼比較資訊:', {
      inputPasswordLength: password.length,
      storedPasswordLength: admin.password.length,
      inputPasswordStart: password.substring(0, 3) + '***',
      storedPasswordStart: admin.password.substring(0, 10) + '***'
    })
    
    const isPasswordValid = await bcrypt.compare(password, admin.password)
    console.log('✅ [AdminService.login] 密碼驗證結果:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('❌ [AdminService.login] 密碼驗證失敗')
      throw new BusinessError(
        ERROR_CODES.ADMIN_INVALID_CREDENTIALS,
        MESSAGES.AUTH.ADMIN_INVALID_CREDENTIALS,
        401
      )
    }

    // 檢查帳號狀態
    console.log('🔍 [AdminService.login] 檢查帳號狀態:', admin.is_active)
    if (!admin.is_active) {
      console.log('❌ [AdminService.login] 管理員帳號已停用')
      throw new BusinessError(
        ERROR_CODES.ADMIN_ACCOUNT_INACTIVE,
        MESSAGES.AUTH.ADMIN_ACCOUNT_INACTIVE,
        403
      )
    }

    // 更新最後登入時間
    console.log('🕐 [AdminService.login] 更新最後登入時間')
    admin.last_login_at = new Date()
    await this.adminUserRepository.save(admin)

    // 產生 JWT Token
    console.log('🔑 [AdminService.login] 產生 JWT Token')
    console.log('🔑 [AdminService.login] JWT 配置:', {
      hasSecret: !!JWT_CONFIG.SECRET,
      secretLength: JWT_CONFIG.SECRET?.length || 0
    })
    
    const tokenPayload = { 
      adminId: admin.id,
      username: admin.username,
      role: admin.role,
      type: 'access'
    }
    console.log('📋 [AdminService.login] Token payload:', tokenPayload)
    
    const token = sign(tokenPayload, JWT_CONFIG.SECRET, { expiresIn: '1h' })
    console.log('🎫 [AdminService.login] Token 產生成功，長度:', token.length)

    const response = {
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
    
    console.log('🎉 [AdminService.login] 登入成功，回傳資料:', {
      adminId: response.admin.id,
      username: response.admin.username,
      role: response.admin.role,
      hasToken: !!response.access_token
    })

    return response
  }

  /**
   * 建立管理員帳號
   * @param createData 建立管理員資料
   * @returns 建立的管理員資訊
   */
  async createAdmin(createData: AdminCreateRequest): Promise<AdminCreateResponse> {
    console.log('🏗️  [AdminService.createAdmin] 開始建立管理員帳號')
    console.log('📝 [AdminService.createAdmin] 建立資料:', { 
      username: createData.username,
      name: createData.name,
      email: createData.email,
      role: createData.role || AdminRole.ADMIN,
      passwordLength: createData.password?.length || 0
    })

    const { username, password, name, email, role = AdminRole.ADMIN } = createData

    // 檢查帳號是否已存在
    console.log('🔍 [AdminService.createAdmin] 檢查帳號是否已存在:', username)
    const existingAdmin = await this.adminUserRepository.findOne({
      where: { username }
    })

    if (existingAdmin) {
      console.log('❌ [AdminService.createAdmin] 管理員帳號已存在:', username)
      throw new BusinessError(
        ERROR_CODES.ADMIN_USERNAME_EXISTS,
        MESSAGES.VALIDATION.ADMIN_USERNAME_EXISTS,
        409
      )
    }

    // 檢查電子郵件是否已存在
    console.log('📧 [AdminService.createAdmin] 檢查電子郵件是否已存在:', email)
    const existingEmailAdmin = await this.adminUserRepository.findOne({
      where: { email }
    })

    if (existingEmailAdmin) {
      console.log('❌ [AdminService.createAdmin] 管理員電子郵件已存在:', email)
      throw new BusinessError(
        ERROR_CODES.ADMIN_EMAIL_EXISTS,
        MESSAGES.VALIDATION.ADMIN_EMAIL_EXISTS,
        409
      )
    }

    // 加密密碼
    console.log('🔐 [AdminService.createAdmin] 加密密碼')
    const saltRounds = 12 // 使用較高的安全等級
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    console.log('✅ [AdminService.createAdmin] 密碼加密完成，hash長度:', hashedPassword.length)

    // 建立管理員帳號
    console.log('👤 [AdminService.createAdmin] 建立管理員帳號')
    const newAdmin = this.adminUserRepository.create({
      username,
      password: hashedPassword,
      name,
      email,
      role,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    })

    const savedAdmin = await this.adminUserRepository.save(newAdmin)
    console.log('🎉 [AdminService.createAdmin] 管理員帳號建立成功:', {
      id: savedAdmin.id,
      username: savedAdmin.username,
      role: savedAdmin.role
    })

    return {
      admin: {
        id: savedAdmin.id,
        username: savedAdmin.username,
        name: savedAdmin.name,
        email: savedAdmin.email,
        role: savedAdmin.role.toString(),
        last_login_at: null
      }
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

    // 檢查課程狀態
    if (course.status !== CourseStatus.SUBMITTED) {
      if (course.status === CourseStatus.APPROVED) {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_ALREADY_REVIEWED,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
      } else if (course.status === CourseStatus.REJECTED) {
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
    course.updated_at = new Date()

    const updatedCourse = await this.courseRepository.save(course)

    return {
      course: {
        id: updatedCourse.id,
        uuid: updatedCourse.uuid,
        name: updatedCourse.name,
        teacher_id: updatedCourse.teacher_id,
        status: updatedCourse.status,
        application_status: updatedCourse.status, // 使用相同的狀態
        created_at: updatedCourse.created_at.toISOString(),
        updated_at: updatedCourse.updated_at.toISOString()
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

    // 檢查課程狀態
    if (course.status !== CourseStatus.SUBMITTED) {
      if (course.status === CourseStatus.APPROVED) {
        throw new BusinessError(
          ERROR_CODES.APPLICATION_ALREADY_REVIEWED,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
      } else if (course.status === CourseStatus.REJECTED) {
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
    course.updated_at = new Date()
    // 注意：拒絕原因目前無法儲存，因為 Course entity 沒有相關欄位
    // 如果需要儲存拒絕原因，需要在 Course entity 新增欄位

    const updatedCourse = await this.courseRepository.save(course)

    return {
      course: {
        id: updatedCourse.id,
        uuid: updatedCourse.uuid,
        name: updatedCourse.name,
        teacher_id: updatedCourse.teacher_id,
        status: updatedCourse.status,
        application_status: updatedCourse.status, // 使用相同的狀態
        created_at: updatedCourse.created_at.toISOString(),
        updated_at: updatedCourse.updated_at.toISOString()
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

  /**
   * 獲取課程申請列表
   * @param status 課程狀態篩選
   * @param page 頁碼
   * @param limit 每頁數量
   * @returns 分頁的課程申請列表
   */
  async getCourseApplications(status?: CourseStatus, page = 1, limit = 20) {
    // 建立基本查詢
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .orderBy('course.created_at', 'DESC')

    // 狀態篩選
    if (status) {
      queryBuilder.where('course.status = :status', { status })
    } else {
      // 預設只顯示需要審核的課程（已提交審核的課程）
      queryBuilder.where('course.status IN (:...statuses)', { 
        statuses: [CourseStatus.SUBMITTED, CourseStatus.APPROVED, CourseStatus.REJECTED] 
      })
    }

    // 分頁
    const skip = (page - 1) * limit
    queryBuilder.skip(skip).take(limit)

    const [courses, total] = await queryBuilder.getManyAndCount()

    // 獲取教師資訊
    const teacherIds = Array.from(new Set(courses.map(course => course.teacher_id).filter(id => id)))
    let teacherMap = new Map()
    
    if (teacherIds.length > 0) {
      const teachers = await this.teacherRepository
        .createQueryBuilder('teacher')
        .leftJoinAndSelect('teacher.user', 'user')
        .where('teacher.id IN (:...teacherIds)', { teacherIds })
        .getMany()
      
      teacherMap = new Map(teachers.map(teacher => [teacher.id, teacher]))
    }

    return {
      applications: courses.map(course => {
        const teacher = teacherMap.get(course.teacher_id)
        return {
          id: course.id,
          uuid: course.uuid,
          name: course.name,
          teacher_id: course.teacher_id,
          teacher: {
            id: course.teacher_id,
            name: teacher?.user?.name || '未知教師',
            email: teacher?.user?.email || null
          },
          content: course.content,
          main_category_id: course.main_category_id,
          sub_category_id: course.sub_category_id,
          status: course.status,
          submission_notes: course.submission_notes,
          created_at: course.created_at,
          updated_at: course.updated_at
        }
      }),
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