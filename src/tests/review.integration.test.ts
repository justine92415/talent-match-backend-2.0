/**
 * 評價系統 API 整合測試
 * 
 * 測試範圍：
 * - POST /api/reviews - 提交課程評價
 * - GET /api/courses/:uuid/reviews - 取得課程評價列表
 * - GET /api/reviews/my - 取得我的評價
 * - GET /api/reviews/received - 取得收到的評價 (教師)
 */

import request from 'supertest'
import app from '@/app'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, TeacherTestHelpers, CourseTestHelpers } from '@tests/helpers/testHelpers'
import { ERROR_CODES } from '@constants/ErrorCode'
import { ReservationStatus, UserRole, CourseStatus } from '@entities/enums'
import { dataSource } from '@db/data-source'
import { Reservation } from '@entities/Reservation'
import { v4 as uuidv4 } from 'uuid'

// 評價測試資料
const validReviewData = {
  reservation_uuid: '',
  rate: 5,
  comment: '非常棒的課程，老師教學很認真，內容豐富實用！'
}

describe('評價系統 API', () => {
  let studentUser: any
  let teacherData: any
  let studentToken: string
  let teacherToken: string
  let courseData: any
  let reservationUuid: string

  beforeAll(async () => {
    await initTestDatabase()
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
    
    // 建立測試用戶 (學生)
    const studentResult = await UserTestHelpers.createTestUserWithToken({
      role: UserRole.STUDENT,
      email: 'student@test.com',
      nick_name: '測試學生'
    })
    studentUser = studentResult.user
    studentToken = studentResult.authToken

    // 建立測試教師
    const teacherResult = await TeacherTestHelpers.createCompleteTeacherTestEnv({
      email: 'teacher@test.com',
      nick_name: '測試老師'
    })
    teacherData = teacherResult
    teacherToken = teacherResult.authToken

    // 建立測試課程（已發布狀態）
    courseData = await CourseTestHelpers.createTestCourseForTeacher(teacherResult.teacher.id, {
      status: CourseStatus.PUBLISHED
    })

    // 建立已完成的預約
    const reservationRepository = dataSource.getRepository(Reservation)
    const reservation = reservationRepository.create({
      uuid: uuidv4(),
      student_id: studentUser.id,
      teacher_id: teacherResult.teacher.id,
      course_id: courseData.id,
      reserve_time: new Date(),
      teacher_status: ReservationStatus.COMPLETED,
      student_status: ReservationStatus.COMPLETED
    })
    const savedReservation = await reservationRepository.save(reservation)
    reservationUuid = savedReservation.uuid

    // 更新評價測試資料
    validReviewData.reservation_uuid = reservationUuid
  })

  describe('POST /api/reviews', () => {
    it('應該成功提交評價', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validReviewData)

      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBeDefined()
      expect(response.body.data).toMatchObject({
        rate: validReviewData.rate,
        comment: validReviewData.comment
      })
    })

    it('應該拒絕重複評價', async () => {
      // 先提交一次評價
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validReviewData)

      // 嘗試再次提交
      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validReviewData)

      expect(response.status).toBe(409)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.REVIEW_ALREADY_EXISTS)
      expect(response.body.message).toBeDefined()
    })

    it('應該拒絕無效的評分', async () => {
      const invalidData = {
        ...validReviewData,
        rate: 6 // 超出範圍
      }

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(invalidData)

      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBeDefined()
      expect(response.body.message).toBeDefined()
    })

    it('應該拒絕未認證的請求', async () => {
      const response = await request(app)
        .post('/api/reviews')
        .send(validReviewData)

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBeDefined()
      expect(response.body.message).toBeDefined()
    })
  })

  describe('GET /api/courses/:uuid/reviews', () => {
    beforeEach(async () => {
      // 建立測試評價
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validReviewData)
    })

    it('應該成功取得課程評價列表', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseData.uuid}/reviews`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBeDefined()
      expect(response.body.data.reviews).toHaveLength(1)
      expect(response.body.data.reviews[0]).toMatchObject({
        rate: validReviewData.rate,
        comment: validReviewData.comment
      })
    })

    it('應該支援分頁查詢', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseData.uuid}/reviews`)
        .query({
          page: 1,
          limit: 10
        })

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBeDefined()
      expect(response.body.data.pagination).toMatchObject({
        current_page: 1,
        per_page: 10
      })
    })
  })

  describe('GET /api/reviews/my', () => {
    beforeEach(async () => {
      // 建立測試評價
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validReviewData)
    })

    it('應該成功取得我的評價列表', async () => {
      const response = await request(app)
        .get('/api/reviews/my')
        .set('Authorization', `Bearer ${studentToken}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBeDefined()
      expect(response.body.data.reviews).toHaveLength(1)
    })

    it('應該拒絕未認證的請求', async () => {
      const response = await request(app)
        .get('/api/reviews/my')

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBeDefined()
      expect(response.body.message).toBeDefined()
    })
  })

  describe('GET /api/reviews/received', () => {
    beforeEach(async () => {
      // 建立測試評價
      await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validReviewData)
    })

    it('應該成功取得收到的評價列表 (教師)', async () => {
      const response = await request(app)
        .get('/api/reviews/received')
        .set('Authorization', `Bearer ${teacherToken}`)

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBeDefined()
      expect(response.body.data.reviews).toHaveLength(1)
    })

    it('應該拒絕未認證的請求', async () => {
      const response = await request(app)
        .get('/api/reviews/received')

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBeDefined()
      expect(response.body.message).toBeDefined()
    })
  })
})