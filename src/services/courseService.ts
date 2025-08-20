/**
 * 課程服務層
 * 
 * 處理課程相關的業務邏輯，包括：
 * - CRUD 操作
 * - 權限檢查 
 * - 業務規則驗證
 */

import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { Teacher } from '@entities/Teacher'
import { BusinessError } from '@utils/errors'
import { MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import type { CreateCourseRequest, UpdateCourseRequest, CourseListQuery, CourseBasicInfo, SubmitCourseRequest, ResubmitCourseRequest, ArchiveCourseRequest } from '@models/index'
import { CourseStatus, ApplicationStatus } from '@entities/enums'

// 抽取常數以提高程式碼可維護性
const COURSE_PERMISSIONS = {
  TEACHER_REQUIRED: 403,
  UNAUTHORIZED_ACCESS: 403,
  COURSE_NOT_FOUND: 404
} as const

const COURSE_VALIDATION_ERRORS = {
  UNPROCESSABLE_ENTITY: 422,
  BAD_REQUEST: 400
} as const

const DEFAULT_COURSE_VALUES = {
  RATE: 0,
  REVIEW_COUNT: 0,
  VIEW_COUNT: 0,
  PURCHASE_COUNT: 0,
  STUDENT_COUNT: 0,
  SURVEY_URL: '',
  PURCHASE_MESSAGE: ''
} as const

const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20
} as const

export class CourseService {
  private courseRepository: Repository<Course>
  private teacherRepository: Repository<Teacher>

  constructor() {
    this.courseRepository = dataSource.getRepository(Course)
    this.teacherRepository = dataSource.getRepository(Teacher)
  }

  /**
   * 驗證教師權限的私有方法
   * @param userId 使用者ID
   * @returns Teacher entity
   */
  private async validateTeacher(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId },
      select: ['id', 'user_id', 'application_status'] // 只選擇需要的欄位以提高效能
    })

    if (!teacher) {
      throw new BusinessError(ERROR_CODES.TEACHER_PERMISSION_REQUIRED, MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, COURSE_PERMISSIONS.TEACHER_REQUIRED)
    }

    return teacher
  }

  /**
   * 驗證課程所有權的私有方法
   * @param courseId 課程ID
   * @param teacherId 教師ID
   * @returns Course entity
   */
  private async validateCourseOwnership(courseId: number, teacherId: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      select: ['id', 'teacher_id', 'status', 'application_status', 'submission_notes', 'archive_reason', 'updated_at'] // 只選擇必要欄位
    })

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, COURSE_PERMISSIONS.COURSE_NOT_FOUND)
    }

    if (course.teacher_id !== teacherId) {
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED_ACCESS, MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS, COURSE_PERMISSIONS.UNAUTHORIZED_ACCESS)
    }

    return course
  }  /**
  /**
   * 驗證教師權限並檢查課程所有權的組合方法
   * @param userId 使用者ID
   * @param courseId 課程ID
   * @returns 包含 teacher 和 course 的物件
   */
  private async validateTeacherAndCourseOwnership(userId: number, courseId: number): Promise<{ teacher: Teacher; course: Course }> {
    // 使用 Promise.all 並行執行查詢，提高效能
    const [teacher, course] = await Promise.all([
      this.teacherRepository.findOne({
        where: { user_id: userId },
        select: ['id', 'user_id', 'application_status']
      }),
      this.courseRepository.findOne({
        where: { id: courseId },
        select: ['id', 'teacher_id', 'status', 'application_status', 'submission_notes', 'archive_reason', 'updated_at']
      })
    ])

    if (!teacher) {
      throw new BusinessError(ERROR_CODES.TEACHER_PERMISSION_REQUIRED, MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, COURSE_PERMISSIONS.TEACHER_REQUIRED)
    }

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, COURSE_PERMISSIONS.COURSE_NOT_FOUND)
    }

    if (course.teacher_id !== teacher.id) {
      throw new BusinessError(ERROR_CODES.UNAUTHORIZED_ACCESS, MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS, COURSE_PERMISSIONS.UNAUTHORIZED_ACCESS)
    }

    return { teacher, course }
  }

  /**
   * 建立課程
   * @param userId 使用者ID（來自JWT token）
   * @param courseData 課程資料
   * @returns 建立的課程
   */
  async createCourse(userId: number, courseData: CreateCourseRequest): Promise<CourseBasicInfo> {
    // 驗證教師權限（使用統一的私有方法）
    const teacher = await this.validateTeacher(userId)

    if (teacher.application_status !== ApplicationStatus.APPROVED) {
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_APPROVED, MESSAGES.BUSINESS.TEACHER_NOT_APPROVED, COURSE_PERMISSIONS.TEACHER_REQUIRED)
    }

    // 建立課程
    const course = new Course()
    course.uuid = uuidv4()
    course.teacher_id = teacher.id  // 使用 Teacher 表的 ID
    course.name = courseData.name
    course.content = courseData.content
    course.main_category_id = courseData.main_category_id
    course.sub_category_id = courseData.sub_category_id
    course.city_id = courseData.city_id
    course.survey_url = courseData.survey_url || DEFAULT_COURSE_VALUES.SURVEY_URL
    course.purchase_message = courseData.purchase_message || DEFAULT_COURSE_VALUES.PURCHASE_MESSAGE
    course.status = CourseStatus.DRAFT
    course.application_status = null

    // 儲存課程
    const savedCourse = await this.courseRepository.save(course)

    return {
      id: savedCourse.id,
      uuid: savedCourse.uuid,
      teacher_id: savedCourse.teacher_id,
      name: savedCourse.name,
      content: savedCourse.content,
      main_image: savedCourse.main_image,
      rate: savedCourse.rate || DEFAULT_COURSE_VALUES.RATE,
      review_count: savedCourse.review_count || DEFAULT_COURSE_VALUES.REVIEW_COUNT,
      view_count: savedCourse.view_count || DEFAULT_COURSE_VALUES.VIEW_COUNT,
      purchase_count: savedCourse.purchase_count || DEFAULT_COURSE_VALUES.PURCHASE_COUNT,
      student_count: savedCourse.student_count || DEFAULT_COURSE_VALUES.STUDENT_COUNT,
      main_category_id: savedCourse.main_category_id,
      sub_category_id: savedCourse.sub_category_id,
      city_id: savedCourse.city_id,
      dist_id: savedCourse.dist_id,
      survey_url: savedCourse.survey_url,
      purchase_message: savedCourse.purchase_message,
      status: savedCourse.status,
      application_status: savedCourse.application_status,
      submission_notes: savedCourse.submission_notes,
      archive_reason: savedCourse.archive_reason,
      created_at: savedCourse.created_at,
      updated_at: savedCourse.updated_at
    }
  }

  /**
   * 更新課程
   * @param courseId 課程ID
   * @param userId 使用者ID (來自JWT)
   * @param updateData 更新資料
   * @returns 更新後的課程
   */
  async updateCourse(courseId: number, userId: number, updateData: UpdateCourseRequest): Promise<CourseBasicInfo> {
    const teacher = await this.validateTeacher(userId)
    const course = await this.validateCourseOwnership(courseId, teacher.id)

    // 更新課程資料
    Object.assign(course, {
      ...updateData,
      updated_at: new Date()
    })

    const savedCourse = await this.courseRepository.save(course)
    return this.mapToBasicInfo(savedCourse)
  }

  /**
   * 取得課程詳情
   * @param courseId 課程ID
   * @param userId 使用者ID（來自JWT，用於權限檢查）
   * @returns 課程詳情
   */
  async getCourseById(courseId: number, userId?: number): Promise<CourseBasicInfo> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      select: [
        'id', 'uuid', 'name', 'content', 'main_image', 'rate', 'review_count',
        'status', 'teacher_id', 'created_at', 'updated_at'
      ]
    })

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }

    // 如果提供使用者ID，檢查是否為課程擁有者
    if (userId) {
      // 查詢教師資訊 - 只選擇必要欄位
      const teacher = await this.teacherRepository.findOne({
        where: { user_id: userId },
        select: ['id', 'user_id']
      })

      if (!teacher) {
        // 如果不是教師，只能查看公開課程
        if (course.status !== CourseStatus.PUBLISHED) {
          throw new BusinessError(ERROR_CODES.UNAUTHORIZED_ACCESS, MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS, 403)
        }
      } else if (course.teacher_id !== teacher.id) {
        // 如果是教師但不是課程擁有者，只能查看公開課程
        if (course.status !== CourseStatus.PUBLISHED) {
          throw new BusinessError(ERROR_CODES.UNAUTHORIZED_ACCESS, MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS, 403)
        }
      }
    }

    return this.mapToBasicInfo(course)
  }

  /**
   * 取得教師課程列表
   * @param userId 使用者ID (來自JWT)
   * @param query 查詢參數
   * @returns 課程列表及分頁資訊
   */
  async getCoursesByTeacherId(
    userId: number, 
    query: CourseListQuery = {}
  ): Promise<{ courses: CourseBasicInfo[], total: number, page: number, limit: number }> {
    const teacher = await this.validateTeacher(userId)

    const { 
      page = PAGINATION_DEFAULTS.PAGE, 
      limit = PAGINATION_DEFAULTS.LIMIT 
    } = query
    const skip = (page - 1) * limit

    const [courses, total] = await this.courseRepository.findAndCount({
      where: { teacher_id: teacher.id }, // 使用 Teacher ID 查詢
      select: [
        'id', 'uuid', 'name', 'content', 'main_image', 'rate', 'review_count',
        'status', 'teacher_id', 'created_at', 'updated_at'
      ],
      order: { created_at: 'DESC' },
      skip,
      take: limit
    })

    return {
      courses: courses.map(course => this.mapToBasicInfo(course)),
      total,
      page,
      limit
    }
  }

  /**
   * 刪除課程
   * @param courseId 課程ID
   * @param userId 使用者ID (來自JWT)
   */
  async deleteCourse(courseId: number, userId: number): Promise<void> {
    const teacher = await this.validateTeacher(userId)
    const course = await this.validateCourseOwnership(courseId, teacher.id)

    // 檢查課程狀態（已發布的課程不能直接刪除）
    if (course.status === CourseStatus.PUBLISHED) {
      throw new BusinessError(ERROR_CODES.COURSE_PUBLISHED_CANNOT_DELETE, MESSAGES.BUSINESS.COURSE_PUBLISHED_CANNOT_DELETE, 400)
    }

    await this.courseRepository.remove(course)
  }

  /**
   * 將 Course 實體轉換為基本資訊介面
   * @param course 課程實體
   * @returns 課程基本資訊
   */
  private mapToBasicInfo(course: Course): CourseBasicInfo {
    return {
      id: course.id,
      uuid: course.uuid,
      teacher_id: course.teacher_id,
      name: course.name,
      content: course.content,
      main_image: course.main_image,
      rate: course.rate,
      review_count: course.review_count,
      view_count: course.view_count,
      purchase_count: course.purchase_count,
      student_count: course.student_count,
      main_category_id: course.main_category_id,
      sub_category_id: course.sub_category_id,
      city_id: course.city_id,
      dist_id: course.dist_id,
      survey_url: course.survey_url,
      purchase_message: course.purchase_message,
      status: course.status,
      application_status: course.application_status,
      submission_notes: course.submission_notes,
      archive_reason: course.archive_reason,
      created_at: course.created_at,
      updated_at: course.updated_at
    }
  }

  // ==================== 課程狀態管理方法 ====================

  /**
   * 提交課程審核
   * @param courseId 課程ID
   * @param userId 使用者ID (來自JWT)
   * @param submitData 提交資料
   */
  async submitCourse(courseId: number, userId: number, submitData: SubmitCourseRequest = {}): Promise<void> {
    const { course } = await this.validateTeacherAndCourseOwnership(userId, courseId)

    // 檢查課程狀態 - 只有草稿且未在審核中的課程可以提交
    if (course.status !== CourseStatus.DRAFT) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_SUBMIT, MESSAGES.BUSINESS.COURSE_CANNOT_SUBMIT, COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
    }

    if (course.application_status === ApplicationStatus.PENDING) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_SUBMIT, MESSAGES.BUSINESS.COURSE_CANNOT_SUBMIT, COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
    }

    // 更新課程狀態為待審核
    course.application_status = ApplicationStatus.PENDING
    course.submission_notes = submitData.submission_notes || null
    course.updated_at = new Date()

    await this.courseRepository.save(course)
  }

  /**
   * 重新提交課程審核
   * @param courseId 課程ID
   * @param userId 使用者ID (來自JWT)
   * @param resubmitData 重新提交資料
   */
  async resubmitCourse(courseId: number, userId: number, resubmitData: ResubmitCourseRequest = {}): Promise<void> {
    const { course } = await this.validateTeacherAndCourseOwnership(userId, courseId)

    // 檢查課程狀態 - 只有被拒絕的課程可以重新提交
    if (course.application_status !== ApplicationStatus.REJECTED) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_RESUBMIT, MESSAGES.BUSINESS.COURSE_CANNOT_RESUBMIT, COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
    }

    // 更新課程狀態為待審核
    course.application_status = ApplicationStatus.PENDING
    course.submission_notes = resubmitData.submission_notes || null
    course.updated_at = new Date()

    await this.courseRepository.save(course)
  }

  /**
   * 發布課程
   * @param courseId 課程ID
   * @param userId 使用者ID (來自JWT)
   */
  async publishCourse(courseId: number, userId: number): Promise<void> {
    const { course } = await this.validateTeacherAndCourseOwnership(userId, courseId)

    // 檢查課程狀態 - 只有草稿且審核通過的課程可以發布
    if (course.status !== CourseStatus.DRAFT || course.application_status !== ApplicationStatus.APPROVED) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_PUBLISH, MESSAGES.BUSINESS.COURSE_CANNOT_PUBLISH, COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
    }

    // 更新課程狀態為已發布
    course.status = CourseStatus.PUBLISHED
    course.updated_at = new Date()

    await this.courseRepository.save(course)
  }

  /**
   * 封存課程
   * @param courseId 課程ID
   * @param userId 使用者ID (來自JWT)
   * @param archiveData 封存資料
   */
  async archiveCourse(courseId: number, userId: number, archiveData: ArchiveCourseRequest = {}): Promise<void> {
    const { course } = await this.validateTeacherAndCourseOwnership(userId, courseId)

    // 檢查課程狀態 - 只有已發布的課程可以封存
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_ARCHIVE, MESSAGES.BUSINESS.COURSE_CANNOT_ARCHIVE, COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
    }

    // 更新課程狀態為已封存
    course.status = CourseStatus.ARCHIVED
    course.archive_reason = archiveData.archive_reason || null
    course.updated_at = new Date()

    await this.courseRepository.save(course)
  }
}

// 匯出服務實例
export const courseService = new CourseService()