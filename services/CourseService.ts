import { dataSource } from '../db/data-source'
import { Course } from '../entities/Course'
import { Teacher } from '../entities/Teacher'
import {
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseListQuery,
  CourseResponse,
  CourseListResponse,
  CourseSubmitRequest,
  CourseArchiveRequest
} from '../types/courses'
import { CourseStatus, ApplicationStatus } from '../entities/enums'
import { ValidationError, NotFoundError, ForbiddenError, BusinessError } from '../middleware/errorHandler'
import { v4 as uuidv4 } from 'uuid'
import { IsNull } from 'typeorm'

export class CourseService {
  /**
   * 建立課程草稿
   */
  static async createCourse(teacherId: number, data: CreateCourseRequest): Promise<CourseResponse> {
    // 1. 驗證教師狀態
    await this.validateTeacherStatus(teacherId)

    // 2. 業務規則驗證
    this.validateCourseData(data)

    // 3. 建立課程記錄
    const courseRepository = dataSource.getRepository(Course)
    const course = new Course()
    course.uuid = uuidv4()
    course.teacher_id = teacherId
    course.name = data.name
    if (data.content) course.content = data.content
    if (data.main_category_id) course.main_category_id = data.main_category_id
    if (data.sub_category_id) course.sub_category_id = data.sub_category_id
    if (data.city_id) course.city_id = data.city_id
    if (data.survey_url) course.survey_url = data.survey_url
    if (data.purchase_message) course.purchase_message = data.purchase_message
    course.status = CourseStatus.DRAFT
    course.application_status = null // 課程初始狀態，尚未提交審核
    course.rate = 0
    course.review_count = 0
    course.view_count = 0
    course.purchase_count = 0
    course.student_count = 0

    const savedCourse = await courseRepository.save(course)
    return this.formatCourseResponse(savedCourse)
  }

  /**
   * 更新課程資料
   */
  static async updateCourse(courseId: number, teacherId: number, data: UpdateCourseRequest): Promise<CourseResponse> {
    // 1. 查找並驗證課程擁有權
    const course = await this.findCourseByIdAndTeacherForUpdate(courseId, teacherId)

    // 2. 驗證課程狀態（只有草稿狀態且非審核中可修改）
    if (course.status !== CourseStatus.DRAFT || course.application_status === ApplicationStatus.PENDING) {
      throw new BusinessError('課程已提交審核，無法修改')
    }

    // 3. 業務規則驗證
    if (data.name !== undefined) {
      this.validateCourseData({ name: data.name })
    }

    // 4. 更新課程資料
    const courseRepository = dataSource.getRepository(Course)
    await courseRepository.update(courseId, {
      name: data.name ?? course.name,
      content: data.content ?? course.content,
      main_category_id: data.main_category_id ?? course.main_category_id,
      sub_category_id: data.sub_category_id ?? course.sub_category_id,
      city_id: data.city_id ?? course.city_id,
      survey_url: data.survey_url ?? course.survey_url,
      purchase_message: data.purchase_message ?? course.purchase_message
    })

    const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
    return this.formatCourseResponse(updatedCourse!)
  }

  /**
   * 取得課程詳情
   */
  static async getCourseById(courseId: number, teacherId: number): Promise<CourseResponse> {
    const course = await this.findCourseByIdAndTeacherForUpdate(courseId, teacherId)
    return this.formatCourseResponse(course)
  }

  /**
   * 取得教師課程列表
   */
  static async getCourseList(teacherId: number, query: CourseListQuery): Promise<CourseListResponse> {
    // 1. 驗證教師狀態
    await this.validateTeacherStatus(teacherId)

    // 2. 設定查詢參數
    const page = Math.max(1, query.page || 1)
    const perPage = Math.min(50, Math.max(1, query.per_page || 10))
    const skip = (page - 1) * perPage

    // 3. 建立查詢條件
    const whereConditions: any = {
      teacher_id: teacherId,
      deleted_at: IsNull()
    }

    if (query.status) {
      whereConditions.status = query.status
    }

    // 4. 執行查詢
    const courseRepository = dataSource.getRepository(Course)
    const [courses, total] = await courseRepository.findAndCount({
      where: whereConditions,
      order: { created_at: 'DESC' },
      skip,
      take: perPage
    })

    // 5. 格式化回應
    const formattedCourses = courses.map(course => this.formatCourseResponse(course))
    const totalPages = Math.ceil(total / perPage)

    return {
      courses: formattedCourses,
      total,
      page,
      per_page: perPage,
      total_pages: totalPages
    }
  }

  /**
   * 驗證教師狀態
   */
  private static async validateTeacherStatus(teacherId: number): Promise<void> {
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacher = await teacherRepository.findOne({
      where: { user_id: teacherId }
    })

    if (!teacher) {
      throw new BusinessError('您尚未申請成為教師')
    }

    if (teacher.application_status !== ApplicationStatus.APPROVED) {
      throw new BusinessError('教師申請尚未通過審核')
    }
  }

  /**
   * 查找課程並驗證擁有權 - 用於修改操作
   */
  private static async findCourseByIdAndTeacherForUpdate(courseId: number, teacherId: number): Promise<Course> {
    const courseRepository = dataSource.getRepository(Course)
    const course = await courseRepository.findOne({
      where: {
        id: courseId,
        deleted_at: IsNull()
      }
    })

    if (!course) {
      throw new NotFoundError('課程')
    }

    if (course.teacher_id !== teacherId) {
      throw new ForbiddenError('修改', '課程')
    }

    return course
  }

  /**
   * 查找課程並驗證擁有權 - 用於刪除操作
   */
  private static async findCourseByIdAndTeacherForDelete(courseId: number, teacherId: number): Promise<Course> {
    const courseRepository = dataSource.getRepository(Course)
    const course = await courseRepository.findOne({
      where: {
        id: courseId,
        deleted_at: IsNull()
      }
    })

    if (!course) {
      throw new NotFoundError('課程')
    }

    if (course.teacher_id !== teacherId) {
      throw new ForbiddenError('刪除', '課程')
    }

    return course
  }

  /**
   * 查找課程並驗證擁有權 - 用於提交操作
   */
  private static async findCourseByIdAndTeacherForSubmit(courseId: number, teacherId: number): Promise<Course> {
    const courseRepository = dataSource.getRepository(Course)
    const course = await courseRepository.findOne({
      where: {
        id: courseId,
        deleted_at: IsNull()
      }
    })

    if (!course) {
      throw new NotFoundError('課程')
    }

    if (course.teacher_id !== teacherId) {
      throw new ForbiddenError('提交', '課程')
    }

    return course
  }

  /**
   * 查找課程並驗證擁有權 - 用於發布操作
   */
  private static async findCourseByIdAndTeacherForPublish(courseId: number, teacherId: number): Promise<Course> {
    const courseRepository = dataSource.getRepository(Course)
    const course = await courseRepository.findOne({
      where: {
        id: courseId,
        deleted_at: IsNull()
      }
    })

    if (!course) {
      throw new NotFoundError('課程')
    }

    if (course.teacher_id !== teacherId) {
      throw new ForbiddenError('發布', '課程')
    }

    return course
  }

  /**
   * 查找課程並驗證擁有權 - 用於封存操作
   */
  private static async findCourseByIdAndTeacherForArchive(courseId: number, teacherId: number): Promise<Course> {
    const courseRepository = dataSource.getRepository(Course)
    const course = await courseRepository.findOne({
      where: {
        id: courseId,
        deleted_at: IsNull()
      }
    })

    if (!course) {
      throw new NotFoundError('課程')
    }

    if (course.teacher_id !== teacherId) {
      throw new ForbiddenError('封存', '課程')
    }

    return course
  }

  /**
   * 驗證課程資料
   */
  private static validateCourseData(data: { name: string }): void {
    const errors: Record<string, string[]> = {}

    // 課程名稱驗證
    if (!data.name || data.name.trim() === '') {
      errors.name = ['課程名稱為必填欄位']
    } else if (data.name.length > 200) {
      errors.name = ['課程名稱長度不得超過200字']
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }
  }

  /**
   * 格式化課程回應
   */
  private static formatCourseResponse(course: Course): CourseResponse {
    return {
      id: course.id,
      uuid: course.uuid,
      teacher_id: course.teacher_id,
      name: course.name,
      main_image: course.main_image || undefined,
      content: course.content || undefined,
      rate: Number(course.rate),
      review_count: course.review_count,
      view_count: course.view_count,
      purchase_count: course.purchase_count,
      student_count: course.student_count,
      main_category_id: course.main_category_id || undefined,
      sub_category_id: course.sub_category_id || undefined,
      city_id: course.city_id || undefined,
      survey_url: course.survey_url || undefined,
      purchase_message: course.purchase_message || undefined,
      status: course.status,
      application_status: course.application_status,
      submission_notes: course.submission_notes || undefined,
      archive_reason: course.archive_reason || undefined,
      created_at: course.created_at.toISOString(),
      updated_at: course.updated_at.toISOString()
    }
  }

  /**
   * 刪除課程
   */
  static async deleteCourse(courseId: number, teacherId: number): Promise<void> {
    // 1. 查找並驗證課程擁有權
    const course = await this.findCourseByIdAndTeacherForDelete(courseId, teacherId)

    // 2. 驗證課程狀態（只有草稿狀態可刪除）
    if (course.status !== CourseStatus.DRAFT || course.application_status === ApplicationStatus.PENDING) {
      throw new BusinessError('課程已提交審核，無法刪除')
    }

    // 3. 軟刪除課程
    const courseRepository = dataSource.getRepository(Course)
    await courseRepository.update(courseId, {
      deleted_at: new Date()
    })
  }

  /**
   * 提交課程審核
   */
  static async submitCourse(courseId: number, teacherId: number, data: CourseSubmitRequest): Promise<CourseResponse> {
    // 1. 查找並驗證課程擁有權
    const course = await this.findCourseByIdAndTeacherForSubmit(courseId, teacherId)

    // 2. 驗證課程狀態（只有草稿狀態且非審核中可提交）
    if (course.status !== CourseStatus.DRAFT) {
      throw new BusinessError('課程狀態不正確，無法提交審核')
    }

    if (course.application_status === ApplicationStatus.PENDING) {
      throw new BusinessError('課程已在審核中，無法重複提交')
    }

    // 3. 更新審核狀態和提交備註
    const courseRepository = dataSource.getRepository(Course)
    await courseRepository.update(courseId, {
      application_status: ApplicationStatus.PENDING,
      submission_notes: data.submission_notes
    })

    const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
    return this.formatCourseResponse(updatedCourse!)
  }

  /**
   * 發布課程
   */
  static async publishCourse(courseId: number, teacherId: number): Promise<CourseResponse> {
    // 1. 查找並驗證課程擁有權
    const course = await this.findCourseByIdAndTeacherForPublish(courseId, teacherId)

    // 2. 驗證課程狀態（只有審核通過的課程可發布）
    if (course.application_status !== ApplicationStatus.APPROVED) {
      throw new BusinessError('只能發布已批准的課程')
    }

    // 3. 更新課程狀態為已發布
    const courseRepository = dataSource.getRepository(Course)
    await courseRepository.update(courseId, {
      status: CourseStatus.PUBLISHED
    })

    const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
    return this.formatCourseResponse(updatedCourse!)
  }

  /**
   * 封存課程
   */
  static async archiveCourse(courseId: number, teacherId: number, data: CourseArchiveRequest): Promise<CourseResponse> {
    // 1. 查找並驗證課程擁有權
    const course = await this.findCourseByIdAndTeacherForArchive(courseId, teacherId)

    // 2. 只能封存已發布的課程
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BusinessError('只能封存已發布的課程')
    }

    // 3. 更新課程狀態為封存
    const courseRepository = dataSource.getRepository(Course)
    await courseRepository.update(courseId, {
      status: CourseStatus.ARCHIVED,
      archive_reason: data.archive_reason
    })

    const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
    return this.formatCourseResponse(updatedCourse!)
  }
}
