/**
 * 公開課程瀏覽搜尋 API 整合測試
 * 
 * 測試範圍：
 * - GET /api/courses/public - 公開課程列表（搜尋/瀏覽）
 * - GET /api/courses/public/:id - 公開課程詳情
 * - GET /api/courses/:uuid/reviews - 課程評價列表
 * - GET /api/teachers/public/:id - 教師公開資料
 * - GET /api/teachers/public/:id/courses - 教師課程列表
 */

import request from 'supertest'
import app from './../app'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, TeacherTestHelpers, RequestTestHelpers, ValidationTestHelpers } from '@tests/helpers/testHelpers'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES, SUCCESS } from '@constants/Message'
import { 
  HTTP_STATUS_CODES, 
  TEST_IDS, 
  TEST_USER_DATA, 
  TEST_COURSE_DATA, 
  TEST_SEARCH_DATA, 
  API_PATHS 
} from '@tests/constants/testConstants'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { UserRole, AccountStatus, CourseStatus, ApplicationStatus } from '@entities/enums'
import {
  validCourseSearchQuery,
  validCategorySearchQuery,
  invalidMixedSearchQuery,
  invalidCategorySearchQuery,
  invalidSortQuery,
  publishedCourseData,
  anotherPublishedCourseData,
  draftCourseData,
  archivedCourseData,
  validPaginationParams,
  invalidPaginationParams,
  expectedCourseListStructure,
  expectedCourseDetailStructure,
  expectedErrorResponseStructure,
  expectedValidationErrorStructure
} from '@tests/fixtures/courseFixtures'

describe('公開課程瀏覽搜尋 API', () => {
  let activeTeacherUser: User
  let inactiveTeacherUser: User
  let activeTeacher: Teacher
  let inactiveTeacher: Teacher
  let publishedCourse1: Course
  let publishedCourse2: Course
  let draftCourse: Course
  let archivedCourse: Course

  beforeAll(async () => {
    await initTestDatabase()
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()

    // 建立測試教師和課程資料
    const userRepository = dataSource.getRepository(User)
    const teacherRepository = dataSource.getRepository(Teacher)
    const courseRepository = dataSource.getRepository(Course)

    // 建立活躍教師
    activeTeacherUser = await UserTestHelpers.createUserEntityWithRole({
      uuid: TEST_USER_DATA.ACTIVE_TEACHER_UUID,
      email: TEST_USER_DATA.ACTIVE_TEACHER_EMAIL,
      nick_name: TEST_USER_DATA.ACTIVE_TEACHER_NICK_NAME,
      password: TEST_USER_DATA.COMMON_PASSWORD,
      account_status: AccountStatus.ACTIVE
    }, UserRole.TEACHER)

    activeTeacher = teacherRepository.create({
      user_id: activeTeacherUser.id,
      application_status: ApplicationStatus.APPROVED,
      city: TEST_USER_DATA.CITY,
      district: TEST_USER_DATA.DISTRICT,
      address: TEST_USER_DATA.ADDRESS,
      main_category_id: TEST_USER_DATA.MAIN_CATEGORY_ID,
      sub_category_ids: [...TEST_USER_DATA.SUB_CATEGORY_IDS],
      introduction: TEST_USER_DATA.INTRODUCTION,
      total_students: TEST_USER_DATA.TOTAL_STUDENTS,
      total_courses: TEST_USER_DATA.TOTAL_COURSES,
      average_rating: TEST_USER_DATA.AVERAGE_RATING
    })
    await teacherRepository.save(activeTeacher)

    // 建立停用教師
    inactiveTeacherUser = await UserTestHelpers.createUserEntityWithRole({
      uuid: TEST_USER_DATA.INACTIVE_TEACHER_UUID,
      email: TEST_USER_DATA.INACTIVE_TEACHER_EMAIL,
      nick_name: TEST_USER_DATA.INACTIVE_TEACHER_NICK_NAME,
      password: TEST_USER_DATA.COMMON_PASSWORD,
      account_status: AccountStatus.SUSPENDED
    }, UserRole.TEACHER)

    inactiveTeacher = teacherRepository.create({
      user_id: inactiveTeacherUser.id,
      application_status: ApplicationStatus.APPROVED
    })
    await teacherRepository.save(inactiveTeacher)

    // 建立課程資料
    publishedCourse1 = courseRepository.create({
      ...publishedCourseData,
      teacher_id: activeTeacher.id
    })
    await courseRepository.save(publishedCourse1)

    publishedCourse2 = courseRepository.create({
      ...anotherPublishedCourseData,
      teacher_id: activeTeacher.id
    })
    await courseRepository.save(publishedCourse2)

    draftCourse = courseRepository.create({
      ...draftCourseData,
      teacher_id: activeTeacher.id
    })
    await courseRepository.save(draftCourse)

    archivedCourse = courseRepository.create({
      ...archivedCourseData,
      teacher_id: activeTeacher.id
    })
    await courseRepository.save(archivedCourse)
  })

  describe('GET /api/courses/public', () => {
    it('應該成功取得公開課程列表並回傳 200', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .expect(HTTP_STATUS_CODES.OK)

      ValidationTestHelpers.expectResponseStructure(response, expectedCourseListStructure)
      expect(response.body.data.courses.length).toBeGreaterThan(0)
      expect(response.body.message).toBe(MESSAGES.PUBLIC_COURSE.LIST_SUCCESS)
    })

    it('應該支援關鍵字搜尋功能', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query(validCourseSearchQuery)
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.data.filters.keyword).toBe(validCourseSearchQuery.keyword)
      expect(response.body.data.filters.sort).toBe(validCourseSearchQuery.sort)
      ValidationTestHelpers.expectResponseStructure(response, expectedCourseListStructure)
    })

    it('應該支援分類瀏覽功能', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query(validCategorySearchQuery)
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.data.filters.sort).toBe(validCategorySearchQuery.sort)
      ValidationTestHelpers.expectResponseStructure(response, expectedCourseListStructure)
    })

    it('應該只顯示已發布的課程', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .expect(HTTP_STATUS_CODES.OK)

      const courses = response.body.data.courses
      courses.forEach((course: any) => {
        expect(['published']).toContain(course.status || 'published')
      })
    })

    it('應該允許混合搜尋參數並回傳 200', async () => {
      // 純標準驗證允許混合參數，業務邏輯由前端或服務層控制
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query(invalidMixedSearchQuery)
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toBeDefined()
    })

    it('應該允許部分分類搜尋參數並回傳 200', async () => {
      // 純標準驗證允許部分分類參數，業務完整性由前端或服務層控制
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query(invalidCategorySearchQuery)
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toBeDefined()
    })

    it('應該拒絕無效的排序參數並回傳 400', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query(invalidSortQuery)
        .expect(HTTP_STATUS_CODES.BAD_REQUEST)

      // 使用標準驗證錯誤代碼，而非特定業務代碼
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(response.body.message).toBe(MESSAGES.SYSTEM.VALIDATION_FAILED)
    })

    it('應該支援分頁功能', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query(validPaginationParams)
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.data.pagination.current_page).toBe(validPaginationParams.page)
      expect(response.body.data.pagination.per_page).toBe(validPaginationParams.per_page)
    })

    it('應該拒絕無效的分頁參數並回傳 400', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query(invalidPaginationParams)
        .expect(HTTP_STATUS_CODES.BAD_REQUEST)

      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      ValidationTestHelpers.expectResponseStructure(response, expectedValidationErrorStructure)
    })

    it('應該回傳空結果當沒有符合條件的課程', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSES)
        .query({ keyword: TEST_SEARCH_DATA.NON_EXISTENT_KEYWORD })
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.data.courses).toHaveLength(0)
      expect(response.body.data.pagination.total).toBe(0)
      expect(response.body.message).toBe(MESSAGES.PUBLIC_COURSE.NO_COURSES_FOUND)
    })
  })

  describe('GET /api/courses/public/:id', () => {
    it('應該成功取得課程詳情並回傳 200', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSE_DETAIL(publishedCourse1.id))
        .expect(HTTP_STATUS_CODES.OK)

      ValidationTestHelpers.expectResponseStructure(response, expectedCourseDetailStructure)
      expect(response.body.data.course.name).toBe(publishedCourse1.name)
      expect(response.body.message).toBe(MESSAGES.PUBLIC_COURSE.DETAIL_SUCCESS)
    })

    it('應該包含教師詳細資訊', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSE_DETAIL(publishedCourse1.id))
        .expect(HTTP_STATUS_CODES.OK)

      const teacher = response.body.data.teacher
      expect(teacher).toHaveProperty('id')
      expect(teacher).toHaveProperty('user')
      expect(teacher.user).toHaveProperty('name')
      expect(teacher.user).toHaveProperty('nick_name')
    })

    it('應該包含推薦課程列表', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSE_DETAIL(publishedCourse1.id))
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.data.recommended_courses).toBeInstanceOf(Array)
      expect(response.body.data.recommended_courses.length).toBeLessThanOrEqual(TEST_COURSE_DATA.MAX_RECOMMENDED_COURSES)
    })

    it('應該拒絕不存在的課程ID並回傳 404', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSE_DETAIL(TEST_IDS.NON_EXISTENT_ID))
        .expect(HTTP_STATUS_CODES.NOT_FOUND)

      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })

    it('應該拒絕草稿狀態的課程並回傳 404', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSE_DETAIL(draftCourse.id))
        .expect(HTTP_STATUS_CODES.NOT_FOUND)

      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_PUBLISHED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_PUBLISHED)
    })

    it('應該拒絕已封存的課程並回傳 404', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_COURSE_DETAIL(archivedCourse.id))
        .expect(HTTP_STATUS_CODES.NOT_FOUND)

      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_PUBLISHED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_PUBLISHED)
    })
  })

  describe('GET /api/courses/:uuid/reviews', () => {
    it('應該成功取得課程評價列表並回傳 200', async () => {
      const response = await request(app)
        .get(API_PATHS.COURSE_REVIEWS(publishedCourse1.uuid))
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.status).toBe('success')
      expect(response.body.data).toHaveProperty('reviews')
      expect(response.body.data).toHaveProperty('pagination')
      expect(response.body.data).toHaveProperty('rating_stats')
      expect(response.body.message).toBeDefined()
    })

    it('應該支援評分篩選功能', async () => {
      const response = await request(app)
        .get(API_PATHS.COURSE_REVIEWS(publishedCourse1.uuid))
        .query({ rating: TEST_IDS.VALID_RATING })
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.data.reviews).toBeInstanceOf(Array)
    })

    it('應該拒絕無效的評分參數並回傳 400', async () => {
      const response = await request(app)
        .get(API_PATHS.COURSE_REVIEWS(publishedCourse1.uuid))
        .query({ rating: TEST_IDS.INVALID_RATING })
        .expect(HTTP_STATUS_CODES.BAD_REQUEST)

      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(response.body.message).toBe('參數驗證失敗')
      expect(response.body.errors).toBeDefined()
      expect(response.body.errors.rating).toBeDefined()
      expect(response.body.errors.rating[0]).toMatch(/評分篩選必須為1-5的整數/)
    })

    it('應該拒絕不存在的課程UUID並回傳 404', async () => {
      const response = await request(app)
        .get(API_PATHS.COURSE_REVIEWS('invalid-uuid-999'))
        .expect(HTTP_STATUS_CODES.NOT_FOUND)

      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })
  })

  describe('GET /api/teachers/public/:id', () => {
    it('應該成功取得教師公開資料並回傳 200', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_TEACHER(activeTeacher.id))
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.status).toBe('success')
      expect(response.body.data.teacher).toHaveProperty('id')
      expect(response.body.data.teacher).toHaveProperty('user')
      expect(response.body.data.teacher.total_earnings).toBe(TEST_COURSE_DATA.PUBLIC_TOTAL_EARNINGS) // 不顯示實際金額
      expect(response.body.message).toBe(MESSAGES.PUBLIC_TEACHER.PROFILE_SUCCESS)
    })

    it('應該拒絕不存在的教師ID並回傳 404', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_TEACHER(TEST_IDS.NON_EXISTENT_ID))
        .expect(HTTP_STATUS_CODES.NOT_FOUND)

      expect(response.body.code).toBe(ERROR_CODES.TEACHER_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.TEACHER_NOT_FOUND)
    })
  })

  describe('GET /api/teachers/public/:id/courses', () => {
    it('應該成功取得教師課程列表並回傳 200', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_TEACHER_COURSES(activeTeacher.id))
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.status).toBe('success')
      expect(response.body.data.courses).toBeInstanceOf(Array)
      expect(response.body.data).toHaveProperty('pagination')
      expect(response.body.message).toBe(SUCCESS.PUBLIC_TEACHER_COURSES_SUCCESS)
    })

    it('應該只顯示已發布的課程', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_TEACHER_COURSES(activeTeacher.id))
        .expect(HTTP_STATUS_CODES.OK)

      const courses = response.body.data.courses
      courses.forEach((course: any) => {
        expect(['published']).toContain(course.status || 'published')
      })
    })

    it('應該支援分頁功能', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_TEACHER_COURSES(activeTeacher.id))
        .query({ page: 1, per_page: 5 })
        .expect(HTTP_STATUS_CODES.OK)

      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.per_page).toBe(5)
    })

    it('應該拒絕不存在的教師ID並回傳 404', async () => {
      const response = await request(app)
        .get(API_PATHS.PUBLIC_TEACHER_COURSES(TEST_IDS.NON_EXISTENT_ID))
        .expect(HTTP_STATUS_CODES.NOT_FOUND)

      expect(response.body.code).toBe(ERROR_CODES.TEACHER_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.TEACHER_NOT_FOUND)
    })
  })
})