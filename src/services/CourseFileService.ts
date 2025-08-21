/**
 * 課程檔案服務層
 * 
 * 處理課程檔案相關的業務邏輯，包括：
 * - CRUD 操作（列表查詢、檔案上傳、檔案刪除）
 * - 權限檢查（教師權限、課程所有權）
 * - 業務規則驗證（檔案數量限制、格式驗證等）
 * - TODO: 實際檔案上傳功能待實作
 */

import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { CourseFile } from '@entities/CourseFile'
import { Teacher } from '@entities/Teacher'
import { BusinessError } from '@utils/errors'
import { MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import type { 
  CourseFileQueryParams, 
  CourseFileListResponse, 
  CourseFileUploadRequest, 
  FileUploadResult,
  CourseFileInfo
} from '@models/index'

// 抽取常數以提高程式碼可維護性
const FILE_PERMISSIONS = {
  TEACHER_REQUIRED: 403,
  UNAUTHORIZED_ACCESS: 403,
  COURSE_NOT_FOUND: 404,
  FILE_NOT_FOUND: 404
} as const

const FILE_LIMITS = {
  MAX_FILES_PER_COURSE: 50,
  MAX_SINGLE_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_UPLOAD_COUNT: 10
} as const

const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20
} as const

export class CourseFileService {
  private courseRepository: Repository<Course>
  private courseFileRepository: Repository<CourseFile>
  private teacherRepository: Repository<Teacher>

  constructor() {
    this.courseRepository = dataSource.getRepository(Course)
    this.courseFileRepository = dataSource.getRepository(CourseFile)
    this.teacherRepository = dataSource.getRepository(Teacher)
  }

  // ========================================
  // 私有工具方法
  // ========================================

  /**
   * 驗證教師權限的私有方法
   * @param userId 使用者ID
   * @returns Teacher entity
   */
  private async validateTeacher(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId },
      select: ['id', 'user_id', 'application_status']
    })

    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.TEACHER_PERMISSION_REQUIRED, 
        MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, 
        FILE_PERMISSIONS.TEACHER_REQUIRED
      )
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
      select: ['id', 'teacher_id', 'name']
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND, 
        MESSAGES.BUSINESS.COURSE_NOT_FOUND, 
        FILE_PERMISSIONS.COURSE_NOT_FOUND
      )
    }

    if (course.teacher_id !== teacherId) {
      throw new BusinessError(
        ERROR_CODES.TEACHER_PERMISSION_REQUIRED, 
        MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, 
        FILE_PERMISSIONS.UNAUTHORIZED_ACCESS
      )
    }

    return course
  }

  /**
   * 驗證課程檔案所有權的私有方法
   * @param fileId 檔案ID
   * @param courseId 課程ID
   * @param teacherId 教師ID
   * @returns CourseFile entity
   */
  private async validateFileOwnership(fileId: number, courseId: number, teacherId: number): Promise<CourseFile> {
    // 先驗證課程所有權
    await this.validateCourseOwnership(courseId, teacherId)

    // 再驗證檔案存在且屬於該課程
    const courseFile = await this.courseFileRepository.findOne({
      where: { id: fileId, course_id: courseId },
      select: ['id', 'uuid', 'course_id', 'name', 'file_id', 'url']
    })

    if (!courseFile) {
      throw new BusinessError(
        ERROR_CODES.COURSE_FILE_NOT_FOUND, 
        MESSAGES.BUSINESS.COURSE_FILE_NOT_FOUND, 
        FILE_PERMISSIONS.FILE_NOT_FOUND
      )
    }

    return courseFile
  }

  /**
   * 建立分頁結果的私有方法
   */
  private createPaginationInfo(page: number, per_page: number, total: number) {
    const totalPages = Math.ceil(total / per_page)
    return {
      current_page: page,
      per_page,
      total,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_prev_page: page > 1
    }
  }

  // ========================================
  // 公開 API 方法
  // ========================================

  /**
   * 取得課程檔案列表
   * @param userId 使用者ID
   * @param courseId 課程ID
   * @param queryParams 查詢參數（分頁）
   * @returns 課程檔案列表和分頁資訊
   */
  async getCourseFiles(
    userId: number, 
    courseId: number, 
    queryParams: CourseFileQueryParams
  ): Promise<CourseFileListResponse> {
    // 驗證教師權限
    const teacher = await this.validateTeacher(userId)
    
    // 驗證課程所有權
    await this.validateCourseOwnership(courseId, teacher.id)

    // 設定分頁參數
    const page = queryParams.page || PAGINATION_DEFAULTS.PAGE
    const per_page = queryParams.per_page || PAGINATION_DEFAULTS.LIMIT
    const offset = (page - 1) * per_page

    // 查詢檔案總數和檔案列表
    const [files, total] = await this.courseFileRepository.findAndCount({
      where: { course_id: courseId },
      select: ['id', 'uuid', 'course_id', 'name', 'file_id', 'url', 'created_at', 'updated_at'],
      order: { created_at: 'DESC' },
      skip: offset,
      take: per_page
    })

    // 轉換為回應格式
    const courseFiles: CourseFileInfo[] = files.map(file => ({
      id: file.id,
      uuid: file.uuid,
      course_id: file.course_id,
      name: file.name,
      file_id: file.file_id,
      url: file.url,
      created_at: file.created_at,
      updated_at: file.updated_at
    }))

    // 建立回應物件
    return {
      files: courseFiles,
      pagination: this.createPaginationInfo(page, per_page, total),
      summary: {
        total_files: total
      }
    }
  }

  /**
   * 上傳課程檔案
   * TODO: 實際檔案上傳功能未實作，目前為 placeholder
   * @param userId 使用者ID
   * @param courseId 課程ID
   * @param uploadRequest 上傳請求資料
   * @returns 上傳結果
   */
  async uploadCourseFiles(
    userId: number, 
    courseId: number, 
    uploadRequest: CourseFileUploadRequest
  ): Promise<FileUploadResult[]> {
    // 驗證教師權限
    const teacher = await this.validateTeacher(userId)
    
    // 驗證課程所有權
    await this.validateCourseOwnership(courseId, teacher.id)

    // 檢查課程檔案數量限制
    const currentFileCount = await this.courseFileRepository.count({
      where: { course_id: courseId }
    })

    if (currentFileCount + uploadRequest.files.length > FILE_LIMITS.MAX_FILES_PER_COURSE) {
      throw new BusinessError(
        ERROR_CODES.COURSE_FILE_UPLOAD_FAILED,
        MESSAGES.BUSINESS.COURSE_FILE_LIMIT_REACHED,
        400
      )
    }

    // TODO: 實際檔案上傳邏輯
    // 1. 驗證檔案格式和大小
    // 2. 上傳檔案到檔案系統/雲端存儲
    // 3. 儲存檔案記錄到資料庫
    
    const uploadResults: FileUploadResult[] = []
    
    // Placeholder: 暫時建立假的上傳結果
    for (let i = 0; i < uploadRequest.files.length; i++) {
      const file = uploadRequest.files[i]
      
      // TODO: 替換為實際的檔案處理邏輯
      const fileUuid = uuidv4()
      const fileId = uuidv4()
      
      const courseFile = this.courseFileRepository.create({
        uuid: fileUuid,
        course_id: courseId,
        name: file.originalname,
        file_id: fileId,
        url: `/uploads/courses/${fileId}`
      })

      const savedFile = await this.courseFileRepository.save(courseFile)
      // 處理 save 可能回傳陣列的情況
      const fileResult = Array.isArray(savedFile) ? savedFile[0] : savedFile

      uploadResults.push({
        success: true,
        file: {
          id: fileResult.id,
          uuid: fileResult.uuid,
          course_id: fileResult.course_id,
          name: fileResult.name,
          file_id: fileResult.file_id,
          url: fileResult.url,
          created_at: fileResult.created_at,
          updated_at: fileResult.updated_at
        },
        originalName: file.originalname
      })
    }

    return uploadResults
  }

  /**
   * 刪除課程檔案
   * @param userId 使用者ID
   * @param courseId 課程ID
   * @param fileId 檔案ID
   */
  async deleteCourseFile(
    userId: number, 
    courseId: number, 
    fileId: number
  ): Promise<void> {
    // 驗證教師權限
    const teacher = await this.validateTeacher(userId)
    
    // 驗證檔案所有權（包含課程所有權驗證）
    const courseFile = await this.validateFileOwnership(fileId, courseId, teacher.id)

    // TODO: 實際檔案刪除邏輯
    // 1. 從檔案系統/雲端存儲中刪除實際檔案
    // 2. 從資料庫中刪除檔案記錄

    // 刪除資料庫記錄
    await this.courseFileRepository.remove(courseFile)

    // TODO: 實際檔案系統清理
    // await this.deletePhysicalFile(courseFile.file_id)
  }

  /**
   * 檢查課程檔案是否存在
   * @param userId 使用者ID
   * @param courseId 課程ID
   * @param fileId 檔案ID
   * @returns 是否存在
   */
  async courseFileExists(
    userId: number, 
    courseId: number, 
    fileId: number
  ): Promise<boolean> {
    try {
      const teacher = await this.validateTeacher(userId)
      await this.validateFileOwnership(fileId, courseId, teacher.id)
      return true
    } catch (error) {
      return false
    }
  }

  // TODO: 實際檔案系統操作方法（待實作）
  /*
  private async uploadPhysicalFile(file: Express.Multer.File): Promise<string> {
    // 實作檔案上傳到檔案系統或雲端存儲
    // 回傳檔案存取 URL
  }

  private async deletePhysicalFile(fileId: string): Promise<void> {
    // 實作從檔案系統或雲端存儲中刪除檔案
  }
  */
}

// 建立服務單例
export const courseFileService = new CourseFileService()