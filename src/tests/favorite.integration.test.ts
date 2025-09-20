/**
 * 收藏功能 API 整合測試
 * 
 * 測試範圍：
 * - POST /api/favori    // 建立學生使用者
    studentUser = userRepository.create({
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      email: 'student@example.com',
      nick_name: '學生使用者',
      password: 'hashedpassword',
      role: UserRole.STUDENT,
      account_status: AccountStatus.ACTIVE
    })收藏
 * - DELETE /api/favorites/:course_id - 移除收藏
 * - GET /api/favorites - 收藏列表
 */

import request from 'supertest'
import app from './../app'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, TeacherTestHelpers, RequestTestHelpers, ValidationTestHelpers } from '@tests/helpers/testHelpers'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { UserFavorite } from '@entities/UserFavorite'
import { UserRole, AccountStatus, CourseStatus, ApplicationStatus } from '@entities/enums'
import {
  validAddFavoriteData,
  invalidAddFavoriteData,
  nonExistentCourseAddFavoriteData,
  publishedCourseData,
  expectedFavoriteResponseStructure,
  expectedFavoriteListStructure,
  expectedErrorResponseStructure
} from '@tests/fixtures/courseFixtures'

describe('收藏功能 API', () => {
  let studentUser: User
  let teacherUser: User
  let teacher: Teacher
  let studentToken: string
  let teacherToken: string
  let course1: Course
  let course2: Course

  beforeAll(async () => {
    await initTestDatabase()
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()

    const userRepository = dataSource.getRepository(User)
    const teacherRepository = dataSource.getRepository(Teacher)
    const courseRepository = dataSource.getRepository(Course)

    // 建立學生使用者
    studentUser = await UserTestHelpers.createUserEntityWithRole({
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      email: 'student@example.com',
      nick_name: '學生A',
      password: 'hashedpassword',
      account_status: AccountStatus.ACTIVE
    }, UserRole.STUDENT)
    studentToken = UserTestHelpers.generateAuthToken(studentUser)

    // 建立教師使用者
    teacherUser = await UserTestHelpers.createUserEntityWithRole({
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      email: 'teacher@example.com',
      nick_name: 'Python老師',
      password: 'hashedpassword',
      account_status: AccountStatus.ACTIVE
    }, UserRole.TEACHER)
    teacherToken = UserTestHelpers.generateAuthToken(teacherUser)

    // 建立教師記錄
    teacher = teacherRepository.create({
      user_id: teacherUser.id,
      application_status: ApplicationStatus.APPROVED
    })
    await teacherRepository.save(teacher)

    // 建立課程
    course1 = courseRepository.create({
      ...publishedCourseData,
      teacher_id: teacher.id
    })
    await courseRepository.save(course1)

    course2 = courseRepository.create({
      uuid: '550e8400-e29b-41d4-a716-446655440005',
      teacher_id: teacher.id,
      name: '另一門課程',
      content: '另一門課程的內容',
      status: CourseStatus.PUBLISHED
    })
    await courseRepository.save(course2)
  })

  describe('POST /api/favorites', () => {
    it('應該成功新增收藏並回傳 201', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/favorites',
        studentToken,
        { course_id: course1.id }
      )

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.FAVORITE.ADDED)
      ValidationTestHelpers.expectResponseStructure(response, expectedFavoriteResponseStructure)

      // 驗證資料庫記錄
      const favoriteRepository = dataSource.getRepository(UserFavorite)
      const favorite = await favoriteRepository.findOne({
        where: { user_id: studentUser.id, course_id: course1.id }
      })
      expect(favorite).toBeTruthy()
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'post',
        '/api/favorites',
        { course_id: course1.id }
      )

      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該拒絕無效的課程ID格式並回傳 400', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/favorites',
        studentToken,
        invalidAddFavoriteData
      )

      expect(response.status).toBe(400)
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(response.body.message).toBe(MESSAGES.SYSTEM.VALIDATION_ERROR)
    })

    it('應該拒絕不存在的課程ID並回傳 404', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/favorites',
        studentToken,
        nonExistentCourseAddFavoriteData
      )

      expect(response.status).toBe(404)
      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })

    it('應該拒絕重複收藏並回傳 409', async () => {
      // 先收藏一次
      await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/favorites',
        studentToken,
        { course_id: course1.id }
      )

      // 再次收藏同一課程
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/favorites',
        studentToken,
        { course_id: course1.id }
      )

      expect(response.status).toBe(409)
      expect(response.body.code).toBe(ERROR_CODES.FAVORITE_ALREADY_EXISTS)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.FAVORITE_ALREADY_EXISTS)
    })

    it('應該拒絕教師收藏自己的課程並回傳 403', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/favorites',
        teacherToken,
        { course_id: course1.id }
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.CANNOT_FAVORITE_OWN_COURSE)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.CANNOT_FAVORITE_OWN_COURSE)
    })
  })

  describe('DELETE /api/favorites/:course_id', () => {
    beforeEach(async () => {
      // 預先建立收藏記錄
      const favoriteRepository = dataSource.getRepository(UserFavorite)
      const favorite = favoriteRepository.create({
        uuid: '550e8400-e29b-41d4-a716-446655440010',
        user_id: studentUser.id,
        course_id: course1.id
      })
      await favoriteRepository.save(favorite)
    })

    it('應該成功移除收藏並回傳 200', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'delete',
        `/api/favorites/${course1.id}`,
        studentToken
      )

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.FAVORITE.REMOVED)
      expect(response.body.data).toBeNull()

      // 驗證資料庫記錄已刪除
      const favoriteRepository = dataSource.getRepository(UserFavorite)
      const favorite = await favoriteRepository.findOne({
        where: { user_id: studentUser.id, course_id: course1.id }
      })
      expect(favorite).toBeNull()
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'delete',
        `/api/favorites/${course1.id}`
      )

      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該拒絕移除不存在的收藏並回傳 404', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'delete',
        `/api/favorites/${course2.id}`,
        studentToken
      )

      expect(response.status).toBe(404)
      expect(response.body.code).toBe(ERROR_CODES.FAVORITE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.FAVORITE_NOT_FOUND)
    })
  })

  describe('GET /api/favorites', () => {
    beforeEach(async () => {
      // 預先建立收藏記錄
      const favoriteRepository = dataSource.getRepository(UserFavorite)
      
      const favorite1 = favoriteRepository.create({
        uuid: '550e8400-e29b-41d4-a716-446655440011',
        user_id: studentUser.id,
        course_id: course1.id
      })
      await favoriteRepository.save(favorite1)

      const favorite2 = favoriteRepository.create({
        uuid: '550e8400-e29b-41d4-a716-446655440012',
        user_id: studentUser.id,
        course_id: course2.id
      })
      await favoriteRepository.save(favorite2)
    })

    it('應該成功取得收藏列表並回傳 200', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        '/api/favorites',
        studentToken
      )

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.FAVORITE.LIST_SUCCESS)
      ValidationTestHelpers.expectResponseStructure(response, expectedFavoriteListStructure)
      expect(response.body.data.favorites.length).toBeGreaterThan(0)
    })

    it('應該支援分頁功能', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        '/api/favorites?page=1&per_page=1',
        studentToken
      )

      expect(response.status).toBe(200)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.per_page).toBe(1)
      expect(response.body.data.favorites.length).toBeLessThanOrEqual(1)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'get',
        '/api/favorites'
      )

      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該回傳空列表當使用者沒有收藏', async () => {
      // 建立新的使用者（沒有收藏）
      const newUser = await UserTestHelpers.createUserEntityWithRole({
        uuid: '550e8400-e29b-41d4-a716-446655440099', // 新增必需的 UUID
        email: 'newuser@example.com',
        nick_name: '新使用者',
        password: 'password',
        account_status: AccountStatus.ACTIVE
      }, UserRole.STUDENT)
      const newUserToken = UserTestHelpers.generateAuthToken(newUser)

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        '/api/favorites',
        newUserToken
      )

      expect(response.status).toBe(200)
      expect(response.body.data.favorites).toHaveLength(0)
      expect(response.body.data.pagination.total).toBe(0)
    })
  })
})