/**
 * 課程服務層
 * 
 * 處理課程相關的業務邏輯，包括：
 * - CRUD 操作
 * - 權限檢查 
 * - 業務規則驗證
 */

import { Repository, In, IsNull } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import * as fs from 'fs'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { CourseVideo } from '@entities/CourseVideo'
import { Video } from '@entities/Video'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { Reservation } from '@entities/Reservation'
import { Teacher } from '@entities/Teacher'
import { BusinessError } from '@utils/errors'
import { TimeUtils } from '@utils/TimeUtils'
import { MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import type { CreateCourseRequest, UpdateCourseRequest, CourseListQuery, CourseBasicInfo, CourseWithPriceOptions, SubmitCourseRequest, ResubmitCourseRequest, ArchiveCourseRequest, AvailableSlotsResponse } from '@models/index'
import { CourseStatus, ApplicationStatus, ReservationStatus } from '@entities/enums'
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
  private courseVideoRepository: Repository<CourseVideo>
  private videoRepository: Repository<Video>
  private teacherAvailableSlotRepository: Repository<TeacherAvailableSlot>
  private reservationRepository: Repository<Reservation>
  private teacherRepository: Repository<Teacher>
  private fileUploadService: FileUploadService

  constructor() {
    this.courseRepository = dataSource.getRepository(Course)
    this.coursePriceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.courseVideoRepository = dataSource.getRepository(CourseVideo)
    this.videoRepository = dataSource.getRepository(Video)
    this.teacherAvailableSlotRepository = dataSource.getRepository(TeacherAvailableSlot)
    this.reservationRepository = dataSource.getRepository(Reservation)
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
        select: ['id', 'teacher_id', 'status', 'submission_notes', 'archive_reason', 'updated_at']
        // TODO: Phase 2 - 移除 application_status 相關邏輯
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
    course.content = courseData.content || null
    course.main_category_id = courseData.main_category_id || null
    course.sub_category_id = courseData.sub_category_id || null
    course.city = courseData.city || null
    course.district = courseData.district || null
    course.address = courseData.address || null
    course.survey_url = courseData.survey_url || null
    course.purchase_message = courseData.purchase_message || null
    course.status = CourseStatus.DRAFT

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
      student_count: savedCourse.student_count || DEFAULT_COURSE_VALUES.STUDENT_COUNT,
      main_category_id: savedCourse.main_category_id,
      sub_category_id: savedCourse.sub_category_id,
      city: savedCourse.city,
      district: savedCourse.district,
      address: savedCourse.address,
      survey_url: savedCourse.survey_url,
      purchase_message: savedCourse.purchase_message,
      status: savedCourse.status,
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
      course.content = courseData.content || null
      course.main_image = mainImageUrl as any
      course.main_category_id = courseData.main_category_id || null
      course.sub_category_id = courseData.sub_category_id || null
      course.city = courseData.city || null
      course.district = courseData.district || null
      course.address = courseData.address || null
      course.survey_url = courseData.survey_url || null
      course.purchase_message = courseData.purchase_message || null
      course.status = CourseStatus.DRAFT

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

      // 4. 處理短影音關聯
      if (courseData.selectedVideos && courseData.selectedVideos.length > 0) {
        await this.handleCourseVideoAssociation(
          queryRunner, 
          savedCourse.id, 
          teacher.id, 
          courseData.selectedVideos
        )
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
        student_count: savedCourse.student_count || DEFAULT_COURSE_VALUES.STUDENT_COUNT,
        main_category_id: savedCourse.main_category_id,
        sub_category_id: savedCourse.sub_category_id,
        city: savedCourse.city,
        district: savedCourse.district,
        address: savedCourse.address,
        survey_url: savedCourse.survey_url,
        purchase_message: savedCourse.purchase_message,
        status: savedCourse.status,
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
        city: courseData.city !== undefined ? (courseData.city || null) : course.city,
        district: courseData.district !== undefined ? (courseData.district || null) : course.district,
        address: courseData.address !== undefined ? (courseData.address || null) : course.address,
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

      // 4. 處理短影音關聯更新（如果有提供，可選）
      if (courseData.selectedVideos !== undefined) {
        await this.handleCourseVideoAssociation(
          queryRunner, 
          savedCourse.id, 
          teacher.id, 
          courseData.selectedVideos
        )
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
      
      // 暫存檔案清理由中間件統一處理
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 取得課程詳情（包含價格方案和短影音）
   * @param courseId 課程ID
   * @param userId 使用者ID（來自JWT，用於權限檢查）
   * @returns 完整課程詳情，包含價格方案和短影音
   */
  async getCourseById(courseId: number, userId?: number): Promise<CourseWithPriceOptions> {
    // 查詢完整課程資料
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      select: [
        'id', 'uuid', 'name', 'content', 'main_image', 'rate', 'review_count',
  'status', 'teacher_id', 'created_at', 'updated_at', 'view_count',
        'student_count', 'main_category_id', 'sub_category_id', 'city', 'district', 'address',
        'survey_url', 'purchase_message', 'submission_notes', 'archive_reason'
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

    // 查詢價格方案
    const priceOptions = await this.coursePriceOptionRepository.find({
      where: { course_id: courseId },
      order: { price: 'ASC' }
    })

    // 查詢關聯的短影音
    const courseVideos = await this.courseVideoRepository.find({
      where: { course_id: courseId },
      order: { display_order: 'ASC' }
    })

    // 查詢短影音詳細資訊
    const selectedVideos = []
    if (courseVideos.length > 0) {
      const videoIds = courseVideos.map(cv => cv.video_id)
      const videos = await this.videoRepository.find({
        where: { 
          id: In(videoIds),
          deleted_at: IsNull() 
        },
        select: ['id', 'uuid', 'name', 'category', 'intro', 'url', 'created_at']
      })

      // 組合短影音資訊（保持排序）
      for (const courseVideo of courseVideos) {
        const video = videos.find(v => v.id === courseVideo.video_id)
        if (video) {
          selectedVideos.push({
            video_id: video.id,
            display_order: courseVideo.display_order,
            video_info: {
              id: video.id,
              uuid: video.uuid,
              name: video.name,
              category: video.category,
              intro: video.intro,
              url: video.url,
              created_at: video.created_at
            }
          })
        }
      }
    }

    // 組合完整資料
    const courseWithPriceOptions: CourseWithPriceOptions = {
      ...this.mapToBasicInfo(course),
      price_options: priceOptions.map(option => ({
        id: option.id,
        uuid: option.uuid,
        course_id: option.course_id,
        price: Number(option.price), // 確保價格以數字格式回傳
        quantity: option.quantity,
        is_active: option.is_active,
        created_at: option.created_at,
        updated_at: option.updated_at
      })),
      selected_videos: selectedVideos
    }

    return courseWithPriceOptions
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
  'status', 'teacher_id', 'created_at', 'updated_at', 'view_count',
        'student_count', 'main_category_id', 'sub_category_id', 'city', 'district', 'address',
        'survey_url', 'purchase_message', 'submission_notes', 'archive_reason'
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

    // 查詢關聯的短影音
    const courseVideos = await this.courseVideoRepository.find({
      where: { course_id: courseId },
      order: { display_order: 'ASC' }
    })

    // 查詢短影音詳細資訊
    const selectedVideos = []
    if (courseVideos.length > 0) {
      const videoIds = courseVideos.map(cv => cv.video_id)
      const videos = await this.videoRepository.find({
        where: { 
          id: In(videoIds),
          deleted_at: IsNull() 
        },
        select: ['id', 'uuid', 'name', 'category', 'intro', 'url', 'created_at']
      })

      // 組合短影音資訊（保持排序）
      for (const courseVideo of courseVideos) {
        const video = videos.find(v => v.id === courseVideo.video_id)
        if (video) {
          selectedVideos.push({
            video_id: video.id,
            display_order: courseVideo.display_order,
            video_info: {
              id: video.id,
              uuid: video.uuid,
              name: video.name,
              category: video.category,
              intro: video.intro,
              url: video.url,
              created_at: video.created_at
            }
          })
        }
      }
    }

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
      })),
      selected_videos: selectedVideos // 新增短影音資訊
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
      student_count: course.student_count,
      main_category_id: course.main_category_id,
      sub_category_id: course.sub_category_id,
      city: course.city,
      district: course.district,
      address: course.address,
      survey_url: course.survey_url,
      purchase_message: course.purchase_message,
      status: course.status,
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

    // 檢查課程狀態 - 只有草稿狀態的課程可以提交
    if (course.status !== CourseStatus.DRAFT) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_SUBMIT, '只有草稿狀態的課程可以提交審核', COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
    }

    // 更新課程狀態為已提交審核
    course.status = CourseStatus.SUBMITTED
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
    if (course.status !== CourseStatus.REJECTED) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_RESUBMIT, '只有審核被拒絕的課程可以重新提交', COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
    }

    // 更新課程狀態為已提交審核
    course.status = CourseStatus.SUBMITTED
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

    // 檢查課程狀態 - 只有審核通過的課程可以發布
    if (course.status !== CourseStatus.APPROVED) {
      throw new BusinessError(ERROR_CODES.COURSE_CANNOT_PUBLISH, '只有審核通過的課程可以發布', COURSE_VALIDATION_ERRORS.UNPROCESSABLE_ENTITY)
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

  /**
   * 查詢課程在特定日期的可預約時段
   * @param courseId 課程ID
   * @param date 查詢日期 (YYYY-MM-DD)
   */
  async getAvailableSlots(courseId: number, date: string): Promise<AvailableSlotsResponse> {
    // 1. 驗證課程是否存在
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      select: ['id', 'teacher_id', 'status']
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_NOT_FOUND,
        404
      )
    }

    // 2. 檢查課程狀態 - 只有已發布的課程可以預約
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ACCESS,
        '課程尚未發布，無法預約',
        400
      )
    }

    // 3. 計算查詢日期對應的星期幾 (使用 UTC 避免時區問題)
    const weekday = TimeUtils.getUTCWeekday(date)

    // 4. 查詢教師在該星期的可預約時段
    const availableSlots = await this.teacherAvailableSlotRepository.find({
      where: {
        teacher_id: course.teacher_id,
        weekday: weekday,
        is_active: true
      },
      select: ['id', 'start_time', 'end_time'],
      order: { start_time: 'ASC' }
    })

    if (availableSlots.length === 0) {
      return {
        date,
        available_slots: []
      }
    }

    // 5. 查詢該日期已有的預約記錄（包含所有狀態，除了 cancelled）
    const startOfDay = new Date(date + 'T00:00:00.000Z')
    const endOfDay = new Date(date + 'T23:59:59.999Z')

    const existingReservations = await this.reservationRepository
      .createQueryBuilder('reservation')
      .where('reservation.course_id = :courseId', { courseId })
      .andWhere('reservation.reserve_time >= :startOfDay', { startOfDay })
      .andWhere('reservation.reserve_time <= :endOfDay', { endOfDay })
      .andWhere(
        '(reservation.teacher_status IN (:...statuses) OR reservation.student_status IN (:...statuses))', 
        { statuses: [ReservationStatus.PENDING, ReservationStatus.RESERVED, ReservationStatus.COMPLETED] }
      )
      .select(['reservation.reserve_time'])
      .getMany()

    // 6. 建立已預約時段的 Set 以快速查詢
    const reservedTimeSlots = new Set(
      existingReservations.map(reservation => {
        // 使用統一的時間工具提取時間字串
        return TimeUtils.extractUTCTimeString(reservation.reserve_time)
      })
    )

    // 7. 回傳所有時段並標記狀態
    const allSlots = availableSlots.map(slot => {
      // 正規化時間格式進行比較
      const normalizedSlotTime = TimeUtils.normalizeTimeFormat(slot.start_time)
      const isUnavailable = reservedTimeSlots.has(normalizedSlotTime)

      return {
        slot_id: slot.id,
        start_time: slot.start_time.substring(0, 5), // HH:mm 格式
        end_time: slot.end_time.substring(0, 5),       // HH:mm 格式
        status: isUnavailable ? 'unavailable' as const : 'available' as const
      }
    })

    // 8. 格式化回應資料
    return {
      date,
      available_slots: allSlots
    }
  }

  // ==================== 私有輔助方法 ====================

  /**
   * 處理課程與短影音的關聯
   * @param queryRunner 資料庫交易查詢器
   * @param courseId 課程ID
   * @param teacherId 教師ID  
   * @param selectedVideos 選擇的短影音（可選）
   */
  private async handleCourseVideoAssociation(
    queryRunner: any, 
    courseId: number, 
    teacherId: number, 
    selectedVideos: Array<{ video_id: number; display_order: number }> | null
  ): Promise<void> {
    // 1. 清除現有的課程短影音關聯
    await queryRunner.manager.delete(CourseVideo, { course_id: courseId })

    // 2. 如果沒有選擇短影音，直接返回（完全可選）
    if (!selectedVideos || selectedVideos.length === 0) {
      return
    }

    // 3. 驗證最多 3 個短影音限制
    if (selectedVideos.length > 3) {
      throw new BusinessError(
        ERROR_CODES.VALIDATION_ERROR,
        '課程最多只能連結 3 個短影音',
        400
      )
    }

    // 4. 根據教師 ID 取得對應的 user_id（videos 表的 teacher_id 實際存儲的是 user_id）
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      select: ['user_id']
    })

    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.TEACHER_NOT_FOUND,
        '教師不存在',
        404
      )
    }

    // 5. 驗證所選影片是否屬於該教師且未被刪除（使用 user_id）
    const videoIds = selectedVideos.map(v => v.video_id)
    const videos = await this.videoRepository.find({
      where: { 
        id: In(videoIds), 
        teacher_id: teacher.user_id,  // 使用 user_id 而不是 teacher.id
        deleted_at: IsNull() 
      }
    })

    if (videos.length !== videoIds.length) {
      throw new BusinessError(
        ERROR_CODES.VALIDATION_ERROR, 
        '包含無效的影片選擇，請確認所選影片存在且屬於您', 
        400
      )
    }

    // 6. 建立新的課程短影音關聯
    const courseVideoEntities = selectedVideos.map(selectedVideo => {
      const courseVideo = new CourseVideo()
      courseVideo.course_id = courseId
      courseVideo.video_id = selectedVideo.video_id
      courseVideo.display_order = selectedVideo.display_order
      return courseVideo
    })

    await queryRunner.manager.save(CourseVideo, courseVideoEntities)
  }
}

// 匯出服務實例
export const courseService = new CourseService()