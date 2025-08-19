/**
 * 課程基本管理 API 整合測試
 * 
 * 測試範圍：
 * - POST /api/courses - 建立課程
 * - PUT /api/courses/:id - 更新課程
 * - GET /api/courses/:id - 取得課程詳情
 * - GET /api/courses - 教師課程列表
 * - DELETE /api/courses/:id - 刪除課程
 */

import request from 'supertest'
import app from '@src/app'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, TeacherTestHelpers } from '@tests/helpers/testHelpers'
import { ERROR_MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import { ApplicationStatus } from '@entities/enums'
import type { CreateCourseRequest } from '@models/index'

// 課程測試資料
const validCourseData: CreateCourseRequest = {
  name: '測試程式設計基礎課程',
  content: '本課程將帶領學生了解程式設計的基本概念，包含變數、函式、迴圈等重要主題。透過實際範例和練習，幫助學生建立扎實的程式設計基礎。',
  main_category_id: 1,
  sub_category_id: 1,
  city_id: 1,
  survey_url: 'https://survey.example.com/course-feedback',
  purchase_message: '感謝購買本課程，請查收課程相關資訊'
}

// 無效課程資料 - 缺少必填欄位
const invalidCourseData = {
  content: '課程內容'
  // 缺少 name, main_category_id, sub_category_id, city_id
}

describe('課程基本管理 API', () => {
  let teacherToken: string
  let teacherId: number
  let anotherTeacherToken: string
  let anotherTeacherId: number
  let courseId: number

  beforeAll(async () => {
    await initTestDatabase()
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
    
    // 建立測試用的教師使用者
    const user = await UserTestHelpers.createTeacherUserEntity({
      email: 'teacher@test.com',
      nick_name: 'TestTeacher'
    })
    const teacher = await TeacherTestHelpers.createTeacherApplication(user.id, {
      application_status: ApplicationStatus.APPROVED
    })
    
    teacherId = teacher.id
    teacherToken = UserTestHelpers.generateAuthToken(user)

    // 建立另一位教師用於權限測試
    const anotherUser = await UserTestHelpers.createTeacherUserEntity({
      email: 'another@test.com',
      nick_name: 'AnotherTeacher'
    })
    const anotherTeacher = await TeacherTestHelpers.createTeacherApplication(anotherUser.id, {
      application_status: ApplicationStatus.APPROVED
    })
    
    anotherTeacherId = anotherTeacher.id
    anotherTeacherToken = UserTestHelpers.generateAuthToken(anotherUser)
  })

  describe('POST /api/courses - 建立課程', () => {
    it('應該成功建立課程當提供有效資料', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validCourseData)
        .expect(201)

      // 驗證回應格式
      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_CREATED,
        data: {
          course: expect.objectContaining({
            id: expect.any(Number),
            uuid: expect.any(String),
            teacher_id: teacherId,
            name: validCourseData.name,
            content: validCourseData.content,
            main_category_id: validCourseData.main_category_id,
            sub_category_id: validCourseData.sub_category_id,
            city_id: validCourseData.city_id,
            survey_url: validCourseData.survey_url,
            purchase_message: validCourseData.purchase_message,
            status: 'draft',
            application_status: null,
            rate: expect.any(String), // 資料庫回傳 "0.00" 字串格式
            review_count: 0,
            view_count: 0,
            purchase_count: 0,
            student_count: 0,
            created_at: expect.any(String),
            updated_at: expect.any(String)
          })
        }
      })

      // 儲存課程 ID 供後續測試使用
      courseId = response.body.data.course.id
    })

    it('應該回傳 400 當缺少必填欄位', async () => {
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(invalidCourseData)
        .expect(400)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.VALIDATION_ERROR,
        message: expect.any(String),
        errors: expect.any(Object)
      })
    })

    it('應該回傳 401 當未提供認證 token', async () => {
      const response = await request(app)
        .post('/api/courses')
        .send(validCourseData)
        .expect(401)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.TOKEN_REQUIRED,
        message: expect.any(String)
      })
    })

    it('應該回傳 403 當非教師角色嘗試建立課程', async () => {
      // 建立學生使用者
      const studentUser = await UserTestHelpers.createUserEntity({
        email: 'student@test.com',
        nick_name: 'TestStudent'
      })
      const studentToken = UserTestHelpers.generateAuthToken(studentUser)

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(validCourseData)
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
        message: expect.any(String)
      })
    })
  })

  describe('PUT /api/courses/:id - 更新課程', () => {
    beforeEach(async () => {
      // 先建立一個課程供更新測試使用
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validCourseData)
        .expect(201)

      courseId = response.body.data.course.id
    })

    it('應該成功更新課程當提供有效資料', async () => {
      const updateData = {
        name: '更新後的課程名稱',
        content: '更新後的課程內容'
      }

      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_UPDATED,
        data: {
          course: expect.objectContaining({
            id: courseId,
            name: updateData.name,
            content: updateData.content,
            updated_at: expect.any(String)
          })
        }
      })
    })

    it('應該回傳 404 當課程不存在', async () => {
      const nonExistentId = 999

      const response = await request(app)
        .put(`/api/courses/${nonExistentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ name: '更新課程' })
        .expect(404)

      expect(response.body).toEqual({
        status: 'error',
        code: 'COURSE_NOT_FOUND',
        message: expect.any(String)
      })
    })

    it('應該回傳 403 當嘗試更新他人課程', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send({ name: '嘗試更新他人課程' })
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.UNAUTHORIZED_ACCESS,
        message: expect.any(String)
      })
    })
  })

  describe('GET /api/courses/:id - 取得課程詳情', () => {
    beforeEach(async () => {
      // 先建立一個課程
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validCourseData)
        .expect(201)

      courseId = response.body.data.course.id
    })

    it('應該成功取得課程詳情當課程存在', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: '操作成功',
        data: {
          course: expect.objectContaining({
            id: courseId,
            name: validCourseData.name,
            content: validCourseData.content,
            status: 'draft',
            teacher_id: teacherId,
            uuid: expect.any(String),
            created_at: expect.any(String),
            updated_at: expect.any(String)
          })
        }
      })
    })

    it('應該回傳 404 當課程不存在', async () => {
      const nonExistentId = 999

      const response = await request(app)
        .get(`/api/courses/${nonExistentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404)

      expect(response.body).toEqual({
        status: 'error',
        code: 'COURSE_NOT_FOUND',
        message: expect.any(String)
      })
    })

    it('應該回傳 403 當嘗試查看他人私有課程', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.UNAUTHORIZED_ACCESS, 
        message: expect.any(String)
      })
    })
  })

  describe('GET /api/courses - 教師課程列表', () => {
    beforeEach(async () => {
      // 建立多個課程用於列表測試
      const courses = [
        { ...validCourseData, name: '課程1' },
        { ...validCourseData, name: '課程2' },
        { ...validCourseData, name: '課程3' }
      ]

      for (const courseData of courses) {
        await request(app)
          .post('/api/courses')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send(courseData)
          .expect(201)
      }
    })

    it('應該回傳教師的課程列表', async () => {
      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: '操作成功',
        data: {
          courses: expect.arrayContaining([
            expect.objectContaining({
              name: '課程1',
              teacher_id: expect.any(Number)
            }),
            expect.objectContaining({
              name: '課程2', 
              teacher_id: expect.any(Number)
            }),
            expect.objectContaining({
              name: '課程3',
              teacher_id: expect.any(Number)
            })
          ]),
          total: 3,
          page: 1,
          limit: 20
        }
      })
    })

    it('應該支援分頁查詢', async () => {
      const response = await request(app)
        .get('/api/courses?page=1&limit=2')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)

      expect(response.body.data.courses).toHaveLength(2)
      expect(response.body.data.page).toBe(1)
      expect(response.body.data.limit).toBe(2)
      expect(response.body.data.total).toBe(3)
    })

    it('應該只回傳當前教師的課程', async () => {
      // 另一位教師建立課程
      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send({ ...validCourseData, name: '他人課程' })
        .expect(201)

      const response = await request(app)
        .get('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)

      // 應該只看到自己的3個課程，不包含他人課程
      expect(response.body.data.courses).toHaveLength(3)
      response.body.data.courses.forEach((course: any) => {
        expect(course.teacher_id).toBe(teacherId)
        expect(course.name).not.toBe('他人課程')
      })
    })
  })

  describe('DELETE /api/courses/:id - 刪除課程', () => {
    beforeEach(async () => {
      // 先建立一個課程供刪除測試使用
      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validCourseData)
        .expect(201)

      courseId = response.body.data.course.id
    })

    it('應該成功刪除課程', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_DELETED,
        data: null
      })

      // 驗證課程已被刪除
      await request(app)
        .get(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404)
    })

    it('應該回傳 404 當課程不存在', async () => {
      const nonExistentId = 999

      const response = await request(app)
        .delete(`/api/courses/${nonExistentId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404)

      expect(response.body).toEqual({
        status: 'error',
        code: 'COURSE_NOT_FOUND',
        message: expect.any(String)
      })
    })

    it('應該回傳 403 當嘗試刪除他人課程', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.UNAUTHORIZED_ACCESS,
        message: expect.any(String)
      })
    })

    it.todo('應該回傳 400 當嘗試刪除已發布的課程 - 需要實作課程狀態管理後再測試')
  })
})