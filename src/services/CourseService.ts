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
import * as fs from 'fs'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { Teacher } from '@entities/Teacher'
import { BusinessError } from '@utils/errors'
import { MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import type { CreateCourseRequest, UpdateCourseRequest, CourseListQuery, CourseBasicInfo, CourseWithPriceOptions, SubmitCourseRequest, ResubmitCourseRequest, ArchiveCourseRequest } from '@models/index'
import { CourseStatus, ApplicationStatus } from '@entities/enums'
import { FileUploadService } from './fileUploadService'

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
  private coursePriceOptionRepository: Repository<CoursePriceOption>
  private teacherRepository: Repository<Teacher>
  private fileUploadService: FileUploadService

  constructor() {
    this.courseRepository = dataSource.getRepository(Course)
    this.coursePriceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.fileUploadService = new FileUploadService()
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
      where: { id: courseId }
      // 不限制 select，查詢完整的課程記錄以便更新操作使用
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
   * 建立課程（支援圖片上傳和價格方案）
   * 
   * @param userId 使用者 ID
   * @param createData 課程建立資料（包含圖片檔案和價格方案）
   * @returns 建立的課程
   */
  async createCourseWithImageAndPrices(userId: number, createData: any): Promise<CourseBasicInfo> {
    // 驗證教師權限
    const teacher = await this.validateTeacher(userId)

    if (teacher.application_status !== ApplicationStatus.APPROVED) {
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_APPROVED, MESSAGES.BUSINESS.TEACHER_NOT_APPROVED, COURSE_PERMISSIONS.TEACHER_REQUIRED)
    }

    const { courseImageFile, priceOptions, ...courseData } = createData

    // 開始資料庫交易
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    let mainImageUrl: string | null = null // 移到外層作用域

    try {
      // 1. 上傳課程圖片（如果有提供）
      if (courseImageFile) {
        try {
          const uploadedFile = await this.uploadCourseImageToStorage(courseImageFile, userId)
          mainImageUrl = uploadedFile.downloadURL
        } catch (error) {
          console.error('課程圖片上傳失敗:', error)
          throw new BusinessError(
            ERROR_CODES.COURSE_IMAGE_UPLOAD_FAILED,
            '課程圖片上傳失敗',
            500
          )
        }
      }

      // 2. 建立課程
      const course = new Course()
      course.uuid = uuidv4()
      course.teacher_id = teacher.id
      course.name = courseData.name
      course.content = courseData.content
      course.main_image = mainImageUrl as any
      course.main_category_id = courseData.main_category_id
      course.sub_category_id = courseData.sub_category_id
      course.city_id = courseData.city_id
      course.survey_url = courseData.survey_url || DEFAULT_COURSE_VALUES.SURVEY_URL
      course.purchase_message = courseData.purchase_message || DEFAULT_COURSE_VALUES.PURCHASE_MESSAGE
      course.status = CourseStatus.DRAFT
      course.application_status = null

      // 儲存課程
      const savedCourse = await queryRunner.manager.save(Course, course)

      // 3. 建立價格方案
      if (priceOptions && priceOptions.length > 0) {
        const priceOptionEntities = priceOptions.map((option: any) => {
          const priceOption = new CoursePriceOption()
          priceOption.uuid = uuidv4()
          priceOption.course_id = savedCourse.id
          priceOption.price = option.price
          priceOption.quantity = option.quantity
          priceOption.is_active = true
          return priceOption
        })

        await queryRunner.manager.save(CoursePriceOption, priceOptionEntities)
      }

      // 提交交易
      await queryRunner.commitTransaction()

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
    } catch (error) {
      // 回滾交易
      await queryRunner.rollbackTransaction()
      
      // 如果已上傳圖片但交易失敗，清理上傳的圖片
      if (mainImageUrl) {
        try {
          const firebaseUrl = this.extractFirebaseUrlFromDownloadUrl(mainImageUrl)
          await this.fileUploadService.deleteFile(firebaseUrl)
          console.log('✅ 交易失敗，已清理上傳的課程圖片')
        } catch (cleanupError) {
          console.error('⚠️ 清理上傳圖片失敗:', cleanupError)
        }
      }
      
      throw error
    } finally {
      // 釋放查詢執行器
      await queryRunner.release()
    }
  }

  /**
   * 上傳課程圖片到儲存服務
   * 
   * @param file 檔案物件
   * @param userId 使用者 ID
   * @returns 上傳檔案資訊
   */
  private async uploadCourseImageToStorage(file: any, userId: number): Promise<any> {
    try {
      const uploadedFile = await this.fileUploadService.uploadFile(
        file.filepath,
        file.originalFilename || `course_image_${Date.now()}`,
        file.mimetype,
        {
          destination: `course_images/teacher_${userId}`,
          public: true,
          metadata: {
            customMetadata: {
              teacherId: userId.toString(),
              uploadType: 'course_image'
            }
          }
        }
      )

      return {
        originalName: uploadedFile.originalName,
        fileName: uploadedFile.fileName,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
        downloadURL: uploadedFile.downloadURL,
        firebaseUrl: uploadedFile.firebaseUrl,
        uploadedAt: uploadedFile.uploadedAt
      }
    } catch (error) {
      throw new BusinessError(
        ERROR_CODES.COURSE_IMAGE_UPLOAD_FAILED,
        '課程圖片處理失敗',
        500
      )
    }
  }

  /**
   * 從下載 URL 中解析 Firebase 檔案路徑
   * 
   * @param downloadUrl 下載 URL
   * @returns Firebase 檔案路徑
   */
  private extractFirebaseUrlFromDownloadUrl(downloadUrl: string): string {
    // 支援多種 Firebase Storage URL 格式
    
    // 格式 1: https://firebasestorage.googleapis.com/v0/b/bucket-name.firebasestorage.app/o/path?alt=media&token=xxx
    // 格式 1b: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path?alt=media&token=xxx
    let match = downloadUrl.match(/\/b\/([^\/]+)\/o\/([^?]+)/)
    if (match) {
      const [, bucketName, encodedPath] = match
      const filePath = decodeURIComponent(encodedPath)
      
      // 如果 bucketName 包含 .firebasestorage.app，需要保留完整名稱
      const result = `gs://${bucketName}/${filePath}`
      return result
    }

    // 格式 2: https://storage.googleapis.com/bucket/path/file.ext
    match = downloadUrl.match(/https:\/\/storage\.googleapis\.com\/([^\/]+)\/(.+)/)
    if (match) {
      const [, bucketName, filePath] = match
      const result = `gs://${bucketName}/${filePath}`
      return result
    }

    // 格式 3: https://bucket.storage.googleapis.com/path/file.ext
    match = downloadUrl.match(/https:\/\/([^\.]+)\.storage\.googleapis\.com\/(.+)/)
    if (match) {
      const [, bucketName, filePath] = match
      const result = `gs://${bucketName}/${filePath}`
      return result
    }

    console.error(`無法解析的課程圖片 URL 格式: ${downloadUrl}`)
    throw new Error(`無法解析 Firebase URL 格式: ${downloadUrl}`)
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
   * 更新課程（包含圖片上傳和價格方案編輯）
   * @param courseId 課程ID
   * @param userId 使用者ID
   * @param updateData 更新資料
   * @returns 更新後的課程
   */
  async updateCourseWithImageAndPrices(courseId: number, userId: number, updateData: any): Promise<CourseBasicInfo> {
    // 驗證教師權限和課程擁有權
    const teacher = await this.validateTeacher(userId)
    const course = await this.validateCourseOwnership(courseId, teacher.id)

    const { courseImageFile, priceOptions, ...courseData } = updateData

    // 開始資料庫交易
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    let newImageUrl: string | null = course.main_image // 預設使用現有圖片
    let oldImageUrl: string | null = null // 用於後續清理

    try {
      // 1. 處理圖片更新（如果有提供新圖片）
      if (courseImageFile) {
        try {
          // 儲存舊圖片 URL 以便後續清理
          oldImageUrl = course.main_image

          // 上傳新圖片到 Storage
          const uploadedFile = await this.uploadCourseImageToStorage(courseImageFile, userId)
          newImageUrl = uploadedFile.downloadURL
          
        } catch (error) {
          console.error('課程圖片上傳失敗:', error)
          throw new BusinessError(
            ERROR_CODES.COURSE_IMAGE_UPLOAD_FAILED,
            '課程圖片上傳失敗',
            500
          )
        }
      }

      // 2. 更新課程基本資料
      Object.assign(course, {
        name: courseData.name || course.name,
        content: courseData.content || course.content,
        main_image: newImageUrl,
        main_category_id: courseData.main_category_id || course.main_category_id,
        sub_category_id: courseData.sub_category_id || course.sub_category_id,
        city_id: courseData.city_id || course.city_id,
        survey_url: courseData.survey_url !== undefined ? courseData.survey_url : course.survey_url,
        purchase_message: courseData.purchase_message !== undefined ? courseData.purchase_message : course.purchase_message,
        updated_at: new Date()
      })

      // 儲存課程
      const savedCourse = await queryRunner.manager.save(Course, course)

      // 3. 處理價格方案更新（如果有提供）
      if (priceOptions) {
        // 先刪除所有現有的價格方案
        await queryRunner.manager.delete(CoursePriceOption, { course_id: savedCourse.id })

        // 新增新的價格方案
        if (priceOptions.length > 0) {
          const priceOptionEntities = priceOptions.map((option: any) => {
            const priceOption = new CoursePriceOption()
            priceOption.uuid = uuidv4()
            priceOption.course_id = savedCourse.id
            priceOption.price = option.price
            priceOption.quantity = option.quantity
            priceOption.is_active = true
            return priceOption
          })

          await queryRunner.manager.save(CoursePriceOption, priceOptionEntities)
        }
      }

      // 提交交易
      await queryRunner.commitTransaction()
      
      // 4. 交易成功後清理舊圖片（避免資料不一致）
      if (courseImageFile && oldImageUrl && oldImageUrl.trim() !== '') {
        console.log(`準備清理舊課程圖片: ${oldImageUrl}`)
        try {
          const firebaseUrl = this.extractFirebaseUrlFromDownloadUrl(oldImageUrl)
          await this.fileUploadService.deleteFile(firebaseUrl)
          console.log('✅ 舊課程圖片已清理:', oldImageUrl)
        } catch (error) {
          console.error('❌ 清理舊課程圖片失敗:', error)
          // 不拋出錯誤，避免影響主要流程
        }
      }

      return this.mapToBasicInfo(savedCourse)

    } catch (error) {
      // 回滾交易
      await queryRunner.rollbackTransaction()
      
      // 如果新圖片已上傳但交易失敗，清理新上傳的圖片
      if (courseImageFile && newImageUrl && newImageUrl !== course.main_image) {
        console.log(`清理失敗交易的新圖片: ${newImageUrl}`)
        try {
          const firebaseUrl = this.extractFirebaseUrlFromDownloadUrl(newImageUrl)
          await this.fileUploadService.deleteFile(firebaseUrl)
          console.log('已清理失敗交易的新圖片')
        } catch (cleanupError) {
          console.error('清理失敗交易的新圖片失敗:', cleanupError)
        }
      }
      
      // 清理暫存檔案（如果有）
      if (courseImageFile && (courseImageFile as any).filepath) {
        try {
          if (fs.existsSync((courseImageFile as any).filepath)) {
            fs.unlinkSync((courseImageFile as any).filepath)
            console.log('已清理暫存課程圖片檔案:', (courseImageFile as any).filepath)
          }
        } catch (cleanupError) {
          console.error('清理暫存檔案失敗:', cleanupError)
        }
      }
      
      throw error
    } finally {
      await queryRunner.release()
    }
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
   * 取得課程編輯資料（包含價格方案）
   * 專門供編輯頁面使用，只有課程擁有者可以存取
   * @param courseId 課程ID
   * @param userId 使用者ID（來自JWT）
   * @returns 包含價格方案的完整課程資料
   */
  async getCourseForEdit(courseId: number, userId: number): Promise<CourseWithPriceOptions> {
    // 驗證教師權限和課程所有權
    const { course } = await this.validateTeacherAndCourseOwnership(userId, courseId)

    // 查詢完整課程資料
    const fullCourse = await this.courseRepository.findOne({
      where: { id: courseId },
      select: [
        'id', 'uuid', 'name', 'content', 'main_image', 'rate', 'review_count',
        'status', 'teacher_id', 'created_at', 'updated_at', 'view_count', 'purchase_count',
        'student_count', 'main_category_id', 'sub_category_id', 'city_id', 'dist_id',
        'survey_url', 'purchase_message', 'application_status', 'submission_notes', 'archive_reason'
      ]
    })

    if (!fullCourse) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }

    // 查詢價格方案
    const priceOptions = await this.coursePriceOptionRepository.find({
      where: { course_id: courseId },
      order: { price: 'ASC' }
    })

    // 組合完整資料
    const courseWithPriceOptions: CourseWithPriceOptions = {
      ...this.mapToBasicInfo(fullCourse),
      price_options: priceOptions.map(option => ({
        id: option.id,
        uuid: option.uuid,
        course_id: option.course_id,
        price: Number(option.price), // 確保價格以數字格式回傳
        quantity: option.quantity,
        is_active: option.is_active,
        created_at: option.created_at,
        updated_at: option.updated_at
      }))
    }

    return courseWithPriceOptions
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