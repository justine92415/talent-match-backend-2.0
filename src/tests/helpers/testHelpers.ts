/**
 * 測試 Helper 函式
 * 遵循 TDD 指示文件：建立測試輔助工具，簡化資料庫設定和清理操作
 * 避免重複的使用者建立、認證、登入等操作
 */

import request from 'supertest'
import jwt from 'jsonwebtoken'
import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { TeacherWorkExperience } from '@entities/TeacherWorkExperience'
import { Course } from '@entities/Course'
import { Video } from '@entities/Video'
import { CourseVideo } from '@entities/CourseVideo'
import { CourseFile } from '@entities/CourseFile'
import { UserRole, AccountStatus, ApplicationStatus, CourseStatus, VideoType } from '@entities/enums'
import { validUserData, createUserEntityData, teacherUserEntityData, suspendedUserEntityData } from '@tests/fixtures/userFixtures'
import { createTeacherEntityData } from '@tests/fixtures/teacherFixtures'
import { validWorkExperienceData, createWorkExperienceEntityData } from '@tests/fixtures/workExperienceFixtures'
import ConfigManager from '@config/index'
import app from '../../app'
import { TestUserCreateData, TestTeacherCreateData, TestRequestData, TestValidationStructure, DatabaseQueryCondition, TestFunction } from '../../types'

/**
 * 使用者相關測試 Helper 函式
 */
class UserTestHelpers {
  /**
   * 註冊新使用者
   * @param userData 使用者資料，預設使用 validUserData
   * @returns 註冊回應
   */
  static async registerUser(userData = validUserData) {
    return await request(app).post('/api/auth/register').send(userData)
  }

  /**
   * 使用者登入
   * @param loginData 登入資料
   * @returns 登入回應（包含 access_token）
   */
  static async loginUser(loginData: { email: string; password: string }) {
    return await request(app).post('/api/auth/login').send(loginData)
  }

  /**
   * 註冊並登入使用者（常用組合操作）
   * @param userData 註冊用使用者資料
   * @returns 登入回應（包含 access_token）
   */
  static async registerAndLogin(userData = validUserData) {
    // 先註冊
    await this.registerUser(userData)

    // 再登入
    return await this.loginUser({
      email: userData.email,
      password: userData.password
    })
  }

  /**
   * 直接在資料庫中建立使用者實體（跳過註冊流程）
   * @param userData 使用者實體資料
   * @returns 建立的使用者實體
   */
  static async createUserEntity(userData: Partial<TestUserCreateData> = {}) {
    const userRepository = dataSource.getRepository(User)
    const defaultData = createUserEntityData(userData)
    const user = userRepository.create(defaultData)
    return await userRepository.save(user)
  }

  /**
   * 建立教師角色使用者實體
   * @param userData 使用者實體資料覆寫
   * @returns 建立的教師使用者實體
   */
  static async createTeacherUserEntity(userData: Partial<TestUserCreateData> = {}) {
    const userRepository = dataSource.getRepository(User)
    const defaultData = teacherUserEntityData(userData)
    const user = userRepository.create(defaultData)
    return await userRepository.save(user)
  }

  /**
   * 建立停用狀態使用者實體
   * @param userData 使用者實體資料覆寫
   * @returns 建立的停用使用者實體
   */
  static async createSuspendedUserEntity(userData: Partial<TestUserCreateData> = {}) {
    const userRepository = dataSource.getRepository(User)
    const defaultData = suspendedUserEntityData(userData)
    const user = userRepository.create(defaultData)
    return await userRepository.save(user)
  }

  /**
   * 產生 JWT 認證 Token
   * @param user 使用者物件
   * @param tokenType Token 類型（'access' | 'refresh'）
   * @param expiresIn 過期時間
   * @returns JWT Token
   */
  static generateAuthToken(user: { id: number; role: UserRole; uuid: string }, tokenType: 'access' | 'refresh' = 'access', expiresIn: string = '1h'): string {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        uuid: user.uuid,
        type: tokenType
      },
      ConfigManager.get<string>('secret.jwtSecret'),
      { expiresIn }
    )
  }

  /**
   * 產生過期的 JWT Token（用於測試）
   * @param user 使用者物件
   * @returns 過期的 JWT Token
   */
  static generateExpiredToken(user: { id: number; role: UserRole; uuid: string }): string {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        uuid: user.uuid,
        type: 'access'
      },
      ConfigManager.get<string>('secret.jwtSecret'),
      { expiresIn: '-1h' }
    )
  }

  /**
   * 建立完整的測試使用者（實體 + Token）
   * @param userData 使用者資料覆寫
   * @returns 使用者實體和認證 Token
   */
  static async createTestUserWithToken(userData: Partial<TestUserCreateData> = {}) {
    const user = await this.createUserEntity(userData)
    const authToken = this.generateAuthToken(user)

    return {
      user,
      authToken
    }
  }

  /**
   * 建立測試用的使用者變體集合
   * @returns 不同角色和狀態的使用者及其 Token
   */
  static async createUserVariations() {
    const student = await this.createUserEntity()
    const teacher = await this.createTeacherUserEntity()
    const suspended = await this.createSuspendedUserEntity()

    return {
      student: {
        user: student,
        authToken: this.generateAuthToken(student)
      },
      teacher: {
        user: teacher,
        authToken: this.generateAuthToken(teacher)
      },
      suspended: {
        user: suspended,
        authToken: this.generateAuthToken(suspended)
      }
    }
  }

  /**
   * 更新使用者帳號狀態
   * @param userId 使用者 ID
   * @param status 新狀態
   */
  static async updateUserStatus(userId: number, status: AccountStatus) {
    const userRepository = dataSource.getRepository(User)
    await userRepository.update(userId, { account_status: status })
  }

  /**
   * 設定使用者密碼重設令牌
   * @param userId 使用者 ID
   * @param resetToken 重設令牌
   * @param expiresAt 過期時間
   */
  static async setPasswordResetToken(
    userId: number,
    resetToken: string,
    expiresAt: Date = new Date(Date.now() + 60 * 60 * 1000) // 1小時後過期
  ) {
    const userRepository = dataSource.getRepository(User)
    await userRepository.update(userId, {
      password_reset_token: resetToken,
      password_reset_expires_at: expiresAt
    })
  }
}

/**
 * 教師申請相關測試 Helper 函式
 */
class TeacherTestHelpers {
  /**
   * 建立教師申請記錄
   * @param userId 使用者 ID
   * @param teacherData 教師資料覆寫
   * @returns 建立的教師申請記錄
   */
  static async createTeacherApplication(userId: number, teacherData: Partial<TestTeacherCreateData> = {}) {
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacherEntityData = createTeacherEntityData({
      user_id: userId,
      ...teacherData
    })

    return await teacherRepository.save(teacherEntityData)
  }

  /**
   * 建立不同狀態的教師申請記錄
   * @param userId 使用者 ID
   * @returns 不同狀態的教師申請記錄
   */
  static async createTeacherApplicationVariations(userId: number) {
    const pending = await this.createTeacherApplication(userId, {
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      application_status: ApplicationStatus.PENDING
    })

    const approved = await this.createTeacherApplication(userId + 100, {
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      user_id: userId + 100,
      application_status: ApplicationStatus.APPROVED,
      application_reviewed_at: new Date(),
      reviewer_id: 1,
      review_notes: '申請審核通過'
    })

    const rejected = await this.createTeacherApplication(userId + 200, {
      uuid: '550e8400-e29b-41d4-a716-446655440003',
      user_id: userId + 200,
      application_status: ApplicationStatus.REJECTED,
      application_reviewed_at: new Date(),
      reviewer_id: 1,
      review_notes: '申請資料不符合要求'
    })

    return { pending, approved, rejected }
  }

  /**
   * 更新教師申請狀態
   * @param teacherId 教師 ID
   * @param status 新狀態
   * @param reviewNotes 審核備註
   * @param reviewerId 審核者 ID
   */
  static async updateApplicationStatus(teacherId: number, status: ApplicationStatus, reviewNotes?: string, reviewerId?: number) {
    const teacherRepository = dataSource.getRepository(Teacher)
    await teacherRepository.update(teacherId, {
      application_status: status,
      application_reviewed_at: new Date(),
      review_notes: reviewNotes,
      reviewer_id: reviewerId
    })
  }

  /**
   * 取得使用者的教師申請記錄
   * @param userId 使用者 ID
   * @returns 教師申請記錄
   */
  static async getTeacherApplicationByUserId(userId: number) {
    const teacherRepository = dataSource.getRepository(Teacher)
    return await teacherRepository.findOne({
      where: { user_id: userId }
    })
  }

  /**
   * 建立完整的教師申請測試環境
   * @param userData 使用者資料覆寫
   * @param teacherData 教師申請資料覆寫
   * @returns 使用者、教師申請記錄和認證 Token
   */
  static async createCompleteTeacherTestEnv(userData: Partial<TestUserCreateData> = {}, teacherData: Partial<TestTeacherCreateData> = {}) {
    const user = await UserTestHelpers.createUserEntity(userData)
    const teacher = await this.createTeacherApplication(user.id, teacherData)
    const authToken = UserTestHelpers.generateAuthToken(user)

    return {
      user,
      teacher,
      authToken
    }
  }
}

/**
 * 工作經驗相關測試 Helper 函式
 */
class WorkExperienceTestHelpers {
  /**
   * 建立工作經驗記錄
   * @param teacherId 教師 ID
   * @param workExperienceData 工作經驗資料覆寫
   * @returns 建立的工作經驗記錄
   */
  static async createTestWorkExperience(teacherId: number, workExperienceData: Partial<TeacherWorkExperience> = {}) {
    const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
    const workExperienceEntityData = createWorkExperienceEntityData(teacherId, workExperienceData)

    return await workExperienceRepository.save(workExperienceEntityData)
  }

  /**
   * 建立多個工作經驗記錄（用於列表測試）
   * @param teacherId 教師 ID
   * @param count 建立數量
   * @returns 建立的工作經驗記錄陣列
   */
  static async createMultipleWorkExperiences(teacherId: number, count: number = 3) {
    const experiences = []

    for (let i = 0; i < count; i++) {
      const experience = await this.createTestWorkExperience(teacherId, {
        company_name: `測試公司${i + 1}`,
        job_title: `測試職位${i + 1}`,
        is_working: i === 0 // 第一個設為在職
      })
      experiences.push(experience)
    }

    return experiences
  }

  /**
   * 建立不同類型的工作經驗記錄（用於複雜查詢測試）
   * @param teacherId 教師 ID
   * @returns 不同類型的工作經驗記錄
   */
  static async createWorkExperienceVariations(teacherId: number) {
    const current = await this.createTestWorkExperience(teacherId, validWorkExperienceData.currentJob)
    const past = await this.createTestWorkExperience(teacherId, validWorkExperienceData.pastJob)
    const education = await this.createTestWorkExperience(teacherId, validWorkExperienceData.educationJob)

    return { current, past, education }
  }

  /**
   * 建立完整的教師工作經驗測試環境
   * @param userData 使用者資料覆寫
   * @param teacherData 教師申請資料覆寫
   * @param workExperienceData 工作經驗資料覆寫
   * @returns 使用者、教師、工作經驗記錄和認證 Token
   */
  static async createCompleteWorkExperienceTestEnv(
    userData: Partial<TestUserCreateData> = {},
    teacherData: Partial<TestTeacherCreateData> = {},
    workExperienceData: Partial<TeacherWorkExperience> = {}
  ) {
    const user = await UserTestHelpers.createUserEntity(userData)
    const teacher = await TeacherTestHelpers.createTeacherApplication(user.id, teacherData)
    const workExperience = await this.createTestWorkExperience(teacher.id, workExperienceData)
    const authToken = UserTestHelpers.generateAuthToken(user)

    return {
      user,
      teacher,
      workExperience,
      authToken
    }
  }

  /**
   * 清理指定教師的所有工作經驗記錄
   * @param teacherId 教師 ID
   */
  static async cleanupWorkExperiences(teacherId: number) {
    const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
    await workExperienceRepository.delete({ teacher_id: teacherId })
  }

  /**
   * 取得教師的工作經驗記錄
   * @param teacherId 教師 ID
   * @returns 工作經驗記錄陣列
   */
  static async getWorkExperiencesByTeacherId(teacherId: number) {
    const workExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
    return await workExperienceRepository.find({
      where: { teacher_id: teacherId },
      order: { created_at: 'DESC' }
    })
  }
}

/**
 * HTTP 請求測試 Helper 函式
 */
class RequestTestHelpers {
  /**
   * 發送認證請求
   * @param method HTTP 方法
   * @param url 請求 URL
   * @param authToken 認證 Token
   * @param data 請求資料
   * @returns 請求回應
   */
  static async sendAuthenticatedRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, authToken: string, data?: TestRequestData) {
    const req = request(app)[method](url).set('Authorization', `Bearer ${authToken}`)

    if (data && (method === 'post' || method === 'put')) {
      req.send(data)
    }

    return req
  }

  /**
   * 測試認證失敗情境
   * @param method HTTP 方法
   * @param url 請求 URL
   * @param data 請求資料
   * @returns 401 錯誤回應
   */
  static async testUnauthenticatedRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: TestRequestData) {
    const req = request(app)[method](url)

    if (data && (method === 'post' || method === 'put')) {
      req.send(data)
    }

    return req.expect(401)
  }

  /**
   * 測試無效 Token 情境
   * @param method HTTP 方法
   * @param url 請求 URL
   * @param data 請求資料
   * @returns 401 錯誤回應
   */
  static async testInvalidTokenRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, data?: TestRequestData) {
    const req = request(app)[method](url).set('Authorization', 'Bearer invalid-token')

    if (data && (method === 'post' || method === 'put')) {
      req.send(data)
    }

    return req.expect(401)
  }
}

/**
 * 測試資料驗證 Helper 函式
 */
class ValidationTestHelpers {
  /**
   * 驗證 API 回應格式
   * @param response HTTP 回應
   * @param expectedStructure 預期結構
   */
  static expectResponseStructure(response: request.Response, expectedStructure: TestValidationStructure) {
    expect(response.body).toMatchObject(expectedStructure)
  }

  /**
   * 驗證資料庫記錄存在
   * @param repository TypeORM Repository
   * @param condition 查詢條件
   * @returns 查詢結果
   */
  static async expectDatabaseRecord<T>(
    repository: { findOne: (condition: DatabaseQueryCondition) => Promise<T | null> },
    condition: DatabaseQueryCondition
  ): Promise<T> {
    const record = await repository.findOne(condition)
    expect(record).toBeTruthy()
    return record as T
  }

  /**
   * 驗證資料庫記錄不存在
   * @param repository TypeORM Repository
   * @param condition 查詢條件
   */
  static async expectNoDatabaseRecord(
    repository: { findOne: (condition: DatabaseQueryCondition) => Promise<unknown | null> },
    condition: DatabaseQueryCondition
  ) {
    const record = await repository.findOne(condition)
    expect(record).toBeNull()
  }

  /**
   * 驗證陣列包含特定錯誤訊息
   * @param errorArray 錯誤訊息陣列
   * @param expectedMessage 預期錯誤訊息（部分匹配）
   */
  static expectErrorMessage(errorArray: string[], expectedMessage: string) {
    expect(errorArray).toEqual(expect.arrayContaining([expect.stringContaining(expectedMessage)]))
  }
}

/**
 * 效能測試 Helper 函式
 */
class PerformanceTestHelpers {
  /**
   * 測量 API 回應時間
   * @param apiCall API 呼叫函式
   * @param maxResponseTime 最大允許回應時間（毫秒）
   */
  static async measureResponseTime(apiCall: () => Promise<request.Response>, maxResponseTime: number = 1000) {
    const startTime = Date.now()
    const response = await apiCall()
    const responseTime = Date.now() - startTime

    expect(responseTime).toBeLessThan(maxResponseTime)
    return { response, responseTime }
  }

  /**
   * 批次執行測試（平行處理測試）
   * @param testFunctions 測試函式陣列
   * @param maxConcurrent 最大平行執行數
   */
  static async runConcurrentTests(testFunctions: TestFunction[], maxConcurrent: number = 5) {
    const results = []

    for (let i = 0; i < testFunctions.length; i += maxConcurrent) {
      const batch = testFunctions.slice(i, i + maxConcurrent)
      const batchResults = await Promise.all(batch.map(fn => fn()))
      results.push(...batchResults)
    }

    return results
  }
}

/**
 * 課程測試 Helper 函式
 */
class CourseTestHelpers {
  /**
   * 建立測試用的課程實體
   * @param overrides 覆寫資料
   * @returns 建立的課程實體
   */
  static async createTestCourse(overrides: any = {}) {
    const courseRepository = dataSource.getRepository(Course)
    
    const courseData = {
      uuid: require('uuid').v4(),
      teacher_id: 1,
      name: '測試課程',
      content: '測試課程描述',
      main_image: '/uploads/test-course.jpg',
      main_category_id: 1,
      sub_category_id: 1,
      city_id: 1,
      status: CourseStatus.DRAFT,
      application_status: null,
      ...overrides
    }

    const course = courseRepository.create(courseData)
    const savedCourse = await courseRepository.save(course)
    return Array.isArray(savedCourse) ? savedCourse[0] : savedCourse
  }

  /**
   * 建立指定教師的測試課程
   * @param teacherId 教師ID
   * @param overrides 覆寫資料
   * @returns 建立的課程實體
   */
  static async createTestCourseForTeacher(teacherId: number, overrides: any = {}) {
    return await this.createTestCourse({
      teacher_id: teacherId,
      ...overrides
    })
  }

  /**
   * 建立多個測試課程
   * @param count 建立數量
   * @param teacherId 教師ID
   * @param overrides 覆寫資料
   * @returns 建立的課程陣列
   */
  static async createMultipleTestCourses(count: number, teacherId: number = 1, overrides: any = {}) {
    const courses = []
    for (let i = 0; i < count; i++) {
      const course = await this.createTestCourse({
        teacher_id: teacherId,
        name: `測試課程 ${i + 1}`,
        ...overrides
      })
      courses.push(course)
    }
    return courses
  }

  /**
   * 清理測試課程資料
   */
  static async cleanupTestCourses() {
    const courseRepository = dataSource.getRepository(Course)
    await courseRepository.delete({})
  }
}

/**
 * 影片測試 Helper 函式  
 */
class VideoTestHelpers {
  /**
   * 建立測試用的影片實體
   * @param overrides 覆寫資料
   * @returns 建立的影片實體
   */
  static async createTestVideo(overrides: any = {}) {
    const videoRepository = dataSource.getRepository(Video)
    
    const videoData = {
      uuid: require('uuid').v4(),
      teacher_id: 1,
      name: '測試影片',
      category: '測試分類',
      intro: '測試影片介紹',
      url: 'https://www.youtube.com/watch?v=test',
      video_type: VideoType.YOUTUBE,
      deleted_at: null,
      ...overrides
    }

    const video = videoRepository.create(videoData)
    return await videoRepository.save(video)
  }

  /**
   * 建立指定教師的測試影片
   * @param teacherId 教師ID
   * @param overrides 覆寫資料
   * @returns 建立的影片實體
   */
  static async createTestVideoForTeacher(teacherId: number, overrides: any = {}) {
    return await this.createTestVideo({
      teacher_id: teacherId,
      ...overrides
    })
  }

  /**
   * 建立多個測試影片
   * @param count 建立數量
   * @param teacherId 教師ID
   * @param overrides 覆寫資料
   * @returns 建立的影片陣列
   */
  static async createMultipleTestVideos(count: number, teacherId: number = 1, overrides: any = {}) {
    const videos = []
    for (let i = 0; i < count; i++) {
      const video = await this.createTestVideo({
        teacher_id: teacherId,
        name: `測試影片 ${i + 1}`,
        ...overrides
      })
      videos.push(video)
    }
    return videos
  }

  /**
   * 清理測試影片資料
   */
  static async cleanupTestVideos() {
    const videoRepository = dataSource.getRepository(Video)
    await videoRepository.delete({})
  }
}

/**
 * 課程影片關聯測試 Helper 函式
 */
class CourseVideoTestHelpers {
  /**
   * 建立測試用的課程影片關聯
   * @param courseId 課程ID
   * @param videoId 影片ID
   * @param overrides 覆寫資料
   * @returns 建立的課程影片關聯實體
   */
  static async createTestCourseVideo(courseId: number, videoId: number, overrides: any = {}) {
    const courseVideoRepository = dataSource.getRepository(CourseVideo)
    
    const courseVideoData = {
      course_id: courseId,
      video_id: videoId,
      display_order: 1,
      is_preview: false,
      ...overrides
    }

    const courseVideo = courseVideoRepository.create(courseVideoData)
    return await courseVideoRepository.save(courseVideo)
  }

  /**
   * 批次建立課程影片關聯
   * @param courseId 課程ID
   * @param videoIds 影片ID陣列
   * @param options 額外選項
   * @returns 建立的課程影片關聯陣列
   */
  static async createTestCourseVideos(
    courseId: number, 
    videoIds: number[], 
    options: { is_preview?: boolean[], start_order?: number } = {}
  ) {
    const { is_preview = [], start_order = 1 } = options
    const courseVideos = []

    for (let i = 0; i < videoIds.length; i++) {
      const courseVideo = await this.createTestCourseVideo(courseId, videoIds[i], {
        display_order: start_order + i,
        is_preview: is_preview[i] || false
      })
      courseVideos.push(courseVideo)
    }

    return courseVideos
  }

  /**
   * 建立完整的測試環境（教師、課程、影片、關聯）
   * @param videoCount 影片數量
   * @returns 完整的測試環境資料
   */
  static async createTestEnvironment(videoCount: number = 3) {
    // 建立教師用戶
    const { user: teacher, authToken } = await UserTestHelpers.createTestUserWithToken({
      role: UserRole.TEACHER
    })

    // 建立教師記錄
    const teacherRecord = await TeacherTestHelpers.createTeacherApplication(teacher.id, {})

    // 建立課程
    const course = await CourseTestHelpers.createTestCourseForTeacher(teacher.id)

    // 建立影片
    const videos = await VideoTestHelpers.createMultipleTestVideos(videoCount, teacher.id)

    // 建立課程影片關聯
    const videoIds = videos.map((v: any) => v.id)
    const courseVideos = await CourseVideoTestHelpers.createTestCourseVideos(course.id, videoIds, {
      is_preview: [true, false, false] // 第一個影片設為預覽
    })

    return {
      teacher,
      teacherRecord,
      authToken,
      course,
      videos,
      courseVideos
    }
  }

  /**
   * 檢查課程影片關聯是否存在
   * @param courseId 課程ID
   * @param videoId 影片ID
   * @returns 是否存在關聯
   */
  static async courseVideoExists(courseId: number, videoId: number): Promise<boolean> {
    const courseVideoRepository = dataSource.getRepository(CourseVideo)
    const count = await courseVideoRepository.count({
      where: { course_id: courseId, video_id: videoId }
    })
    return count > 0
  }

  /**
   * 取得課程的影片關聯列表
   * @param courseId 課程ID
   * @returns 課程影片關聯陣列（按順序排列）
   */
  static async getCourseVideoList(courseId: number) {
    const courseVideoRepository = dataSource.getRepository(CourseVideo)
    return await courseVideoRepository.find({
      where: { course_id: courseId },
      order: { display_order: 'ASC' }
    })
  }

  /**
   * 清理測試課程影片關聯資料
   */
  static async cleanupTestCourseVideos() {
    const courseVideoRepository = dataSource.getRepository(CourseVideo)
    await courseVideoRepository.delete({})
  }

  /**
   * 清理完整測試環境
   */
  static async cleanupTestEnvironment() {
    await this.cleanupTestCourseVideos()
    await VideoTestHelpers.cleanupTestVideos()
    await CourseTestHelpers.cleanupTestCourses()
  }
}

/**
 * 課程檔案測試 Helper 函式
 */
class CourseFileTestHelpers {
  /**
   * 建立測試用的課程檔案實體
   * @param courseId 課程ID
   * @param overrides 覆寫資料
   * @returns 建立的課程檔案實體
   */
  static async createTestCourseFile(courseId: number, overrides: any = {}) {
    const courseFileRepository = dataSource.getRepository(CourseFile)
    const { v4: uuidv4 } = require('uuid')
    
    const courseFileData = {
      uuid: uuidv4(),
      course_id: courseId,
      name: '測試檔案',
      file_id: uuidv4(),
      url: '/uploads/test-file.pdf',
      size: 512000,
      mime_type: 'application/pdf',
      original_filename: 'test-file.pdf',
      ...overrides
    }

    const courseFile = courseFileRepository.create(courseFileData)
    const savedCourseFile = await courseFileRepository.save(courseFile)
    return Array.isArray(savedCourseFile) ? savedCourseFile[0] : savedCourseFile
  }

  /**
   * 批次建立測試用的課程檔案
   * @param courseId 課程ID
   * @param count 檔案數量
   * @returns 建立的課程檔案陣列
   */
  static async createTestCourseFiles(courseId: number, count: number = 3): Promise<CourseFile[]> {
    const courseFiles: CourseFile[] = []
    const { v4: uuidv4 } = require('uuid')
    
    for (let i = 0; i < count; i++) {
      const courseFile = await this.createTestCourseFile(courseId, {
        name: `測試檔案 ${i + 1}`,
        file_id: uuidv4(),
        url: `/uploads/test-file-${i}.pdf`,
        original_filename: `test-file-${i}.pdf`
      })
      courseFiles.push(courseFile)
    }
    return courseFiles
  }

  /**
   * 建立完整的測試環境（教師、課程、檔案）
   * @param fileCount 檔案數量
   * @returns 完整的測試環境資料
   */
  static async createTestEnvironment(fileCount: number = 0) {
    // 建立教師用戶
    const { user: teacher, authToken } = await UserTestHelpers.createTestUserWithToken({
      role: UserRole.TEACHER
    })

    // 建立教師記錄
    const teacherRecord = await TeacherTestHelpers.createTeacherApplication(teacher.id, {})

    // 建立課程
    const course = await CourseTestHelpers.createTestCourseForTeacher(teacher.id)

    // 建立課程檔案（如果需要）
    let courseFiles: CourseFile[] = []
    if (fileCount > 0) {
      courseFiles = await this.createTestCourseFiles(course.id, fileCount)
    }

    return {
      teacher,
      teacherRecord,
      authToken,
      course,
      courseFiles
    }
  }

  /**
   * 檢查課程檔案是否存在
   * @param courseId 課程ID
   * @param fileId 檔案ID
   * @returns 是否存在檔案
   */
  static async courseFileExists(courseId: number, fileId: number): Promise<boolean> {
    const courseFileRepository = dataSource.getRepository(CourseFile)
    const count = await courseFileRepository.count({
      where: { course_id: courseId, id: fileId }
    })
    return count > 0
  }

  /**
   * 取得課程的檔案列表
   * @param courseId 課程ID
   * @returns 課程檔案陣列
   */
  static async getCourseFileList(courseId: number) {
    const courseFileRepository = dataSource.getRepository(CourseFile)
    return await courseFileRepository.find({
      where: { course_id: courseId },
      order: { created_at: 'DESC' }
    })
  }

  /**
   * 清理測試課程檔案資料
   */
  static async cleanupTestCourseFiles() {
    const courseFileRepository = dataSource.getRepository(CourseFile)
    await courseFileRepository.delete({})
  }

  /**
   * 清理完整測試環境
   */
  static async cleanupTestEnvironment() {
    await this.cleanupTestCourseFiles()
    await CourseTestHelpers.cleanupTestCourses()
  }
}

// 匯出所有 Helper 類別
export { 
  UserTestHelpers, 
  TeacherTestHelpers, 
  WorkExperienceTestHelpers, 
  RequestTestHelpers, 
  ValidationTestHelpers, 
  PerformanceTestHelpers,
  CourseTestHelpers,
  VideoTestHelpers,
  CourseVideoTestHelpers,
  CourseFileTestHelpers
}

// 預設匯出常用 Helper 函式
export default {
  UserTestHelpers,
  TeacherTestHelpers,
  WorkExperienceTestHelpers,
  RequestTestHelpers,
  ValidationTestHelpers,
  PerformanceTestHelpers
}

// 匯出常用函式別名（向下相容）
export const createTestUser = UserTestHelpers.createUserEntity
export const createTestTeacher = TeacherTestHelpers.createTeacherApplication
export const createTestWorkExperience = WorkExperienceTestHelpers.createTestWorkExperience
export const generateAuthToken = UserTestHelpers.generateAuthToken
