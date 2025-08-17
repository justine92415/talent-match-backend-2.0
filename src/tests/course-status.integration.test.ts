/**
 * 課程狀態管理 API 整合測試
 * 
 * 測試範圍：
 * - POST /api/courses/:id/submit - 提交課程審核
 * - POST /api/courses/:id/resubmit - 重新提交課程審核
 * - POST /api/courses/:id/publish - 發布課程
 * - POST /api/courses/:id/archive - 封存課程
 * 
 * 測試課程狀態流程：
 * draft + null → submit → draft + pending
 * draft + rejected → resubmit → draft + pending
 * draft + approved → publish → published + approved
 * published → archive → archived
 */

import request from 'supertest'
import { Repository } from 'typeorm'
import app from '@src/app'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, TeacherTestHelpers } from '@tests/helpers/testHelpers'
import { ERROR_MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import { ApplicationStatus, CourseStatus } from '@entities/enums'
import { Course } from '@entities/Course'
import { dataSource } from '@db/data-source'
import type { CreateCourseRequest, SubmitCourseRequest, ResubmitCourseRequest, ArchiveCourseRequest } from '@models/index'

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

describe('課程狀態管理 API', () => {
  let teacherToken: string
  let teacherId: number
  let anotherTeacherToken: string
  let courseId: number
  let courseRepository: Repository<Course>

  beforeAll(async () => {
    await initTestDatabase()
    courseRepository = dataSource.getRepository(Course)
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
    anotherTeacherToken = UserTestHelpers.generateAuthToken(anotherUser)

    // 建立測試課程
    const courseResponse = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(validCourseData)

    courseId = courseResponse.body.data.course.id
  })

  describe('POST /api/courses/:id/submit - 提交課程審核', () => {
    it('應該成功提交草稿課程審核', async () => {
      const submitData: SubmitCourseRequest = {
        submission_notes: '課程資料已完善，請審核'
      }

      const response = await request(app)
        .post(`/api/courses/${courseId}/submit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(submitData)
        .expect(200)

      // 驗證回應格式
      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_SUBMITTED,
        data: null
      })

      // 驗證資料庫狀態
      const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
      expect(updatedCourse).toBeTruthy()
      expect(updatedCourse!.status).toBe(CourseStatus.DRAFT)
      expect(updatedCourse!.application_status).toBe(ApplicationStatus.PENDING)
      expect(updatedCourse!.submission_notes).toBe(submitData.submission_notes)
    })

    it('應該成功提交草稿課程審核（無備註）', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/submit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_SUBMITTED,
        data: null
      })

      const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
      expect(updatedCourse).toBeTruthy()
      expect(updatedCourse!.application_status).toBe(ApplicationStatus.PENDING)
      expect(updatedCourse!.submission_notes).toBeNull()
    })

    it('應該拒絕提交已審核中的課程', async () => {
      // 先提交一次
      await request(app)
        .post(`/api/courses/${courseId}/submit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})

      // 再次提交應該失敗
      const response = await request(app)
        .post(`/api/courses/${courseId}/submit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(422)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_CANNOT_SUBMIT,
        message: ERROR_MESSAGES.BUSINESS.COURSE_CANNOT_SUBMIT
      })
    })

    it('應該拒絕提交已發布的課程', async () => {
      // 先將課程設為已發布
      await courseRepository.update(courseId, {
        status: CourseStatus.PUBLISHED,
        application_status: ApplicationStatus.APPROVED
      })

      const response = await request(app)
        .post(`/api/courses/${courseId}/submit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(422)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_CANNOT_SUBMIT,
        message: ERROR_MESSAGES.BUSINESS.COURSE_CANNOT_SUBMIT
      })
    })

    it('應該拒絕非課程擁有者的提交請求', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/submit`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send({})
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: 'TEACHER_PERMISSION_REQUIRED',
        message: '需要教師權限才能執行此操作'
      })
    })

    it('應該拒絕不存在課程的提交請求', async () => {
      const response = await request(app)
        .post('/api/courses/99999/submit')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(404)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_NOT_FOUND,
        message: ERROR_MESSAGES.BUSINESS.COURSE_NOT_FOUND
      })
    })

    it('應該拒絕未認證使用者的請求', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/submit`)
        .send({})
        .expect(401)

      expect(response.body).toEqual({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: 'Access token 為必填欄位'
      })
    })
  })

  describe('POST /api/courses/:id/resubmit - 重新提交課程審核', () => {
    beforeEach(async () => {
      // 將課程設為被拒絕狀態
      await courseRepository.update(courseId, {
        status: CourseStatus.DRAFT,
        application_status: ApplicationStatus.REJECTED
      })
    })

    it('應該成功重新提交被拒絕的課程', async () => {
      const resubmitData: ResubmitCourseRequest = {
        submission_notes: '已根據建議修正課程內容，請重新審核'
      }

      const response = await request(app)
        .post(`/api/courses/${courseId}/resubmit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(resubmitData)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_RESUBMITTED,
        data: null
      })

      // 驗證資料庫狀態
      const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
      expect(updatedCourse).toBeTruthy()
      expect(updatedCourse!.status).toBe(CourseStatus.DRAFT)
      expect(updatedCourse!.application_status).toBe(ApplicationStatus.PENDING)
      expect(updatedCourse!.submission_notes).toBe(resubmitData.submission_notes)
    })

    it('應該拒絕重新提交非拒絕狀態的課程', async () => {
      // 將課程改為其他狀態
      await courseRepository.update(courseId, {
        application_status: ApplicationStatus.PENDING
      })

      const response = await request(app)
        .post(`/api/courses/${courseId}/resubmit`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(422)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_CANNOT_RESUBMIT,
        message: ERROR_MESSAGES.BUSINESS.COURSE_CANNOT_RESUBMIT
      })
    })

    it('應該拒絕非課程擁有者的重新提交請求', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/resubmit`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send({})
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: 'TEACHER_PERMISSION_REQUIRED',
        message: '需要教師權限才能執行此操作'
      })
    })
  })

  describe('POST /api/courses/:id/publish - 發布課程', () => {
    beforeEach(async () => {
      // 將課程設為審核通過狀態
      await courseRepository.update(courseId, {
        status: CourseStatus.DRAFT,
        application_status: ApplicationStatus.APPROVED
      })
    })

    it('應該成功發布已審核通過的課程', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_PUBLISHED,
        data: null
      })

      // 驗證資料庫狀態
      const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
      expect(updatedCourse).toBeTruthy()
      expect(updatedCourse!.status).toBe(CourseStatus.PUBLISHED)
      expect(updatedCourse!.application_status).toBe(ApplicationStatus.APPROVED)
    })

    it('應該拒絕發布未審核通過的課程', async () => {
      await courseRepository.update(courseId, {
        application_status: ApplicationStatus.PENDING
      })

      const response = await request(app)
        .post(`/api/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(422)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_CANNOT_PUBLISH,
        message: ERROR_MESSAGES.BUSINESS.COURSE_CANNOT_PUBLISH
      })
    })

    it('應該拒絕發布已發布的課程', async () => {
      // 先將課程設為已發布
      await courseRepository.update(courseId, {
        status: CourseStatus.PUBLISHED
      })

      const response = await request(app)
        .post(`/api/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(422)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_CANNOT_PUBLISH,
        message: ERROR_MESSAGES.BUSINESS.COURSE_CANNOT_PUBLISH
      })
    })

    it('應該拒絕非課程擁有者的發布請求', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send({})
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: 'TEACHER_PERMISSION_REQUIRED',
        message: '需要教師權限才能執行此操作'
      })
    })
  })

  describe('POST /api/courses/:id/archive - 封存課程', () => {
    beforeEach(async () => {
      // 將課程設為已發布狀態
      await courseRepository.update(courseId, {
        status: CourseStatus.PUBLISHED,
        application_status: ApplicationStatus.APPROVED
      })
    })

    it('應該成功封存已發布的課程', async () => {
      const archiveData: ArchiveCourseRequest = {
        archive_reason: '課程內容已過時，決定封存'
      }

      const response = await request(app)
        .post(`/api/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(archiveData)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_ARCHIVED,
        data: null
      })

      // 驗證資料庫狀態
      const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
      expect(updatedCourse).toBeTruthy()
      expect(updatedCourse!.status).toBe(CourseStatus.ARCHIVED)
      expect(updatedCourse!.archive_reason).toBe(archiveData.archive_reason)
    })

    it('應該成功封存已發布的課程（無原因）', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.COURSE_ARCHIVED,
        data: null
      })

      const updatedCourse = await courseRepository.findOne({ where: { id: courseId } })
      expect(updatedCourse).toBeTruthy()
      expect(updatedCourse!.status).toBe(CourseStatus.ARCHIVED)
      expect(updatedCourse!.archive_reason).toBeNull()
    })

    it('應該拒絕封存未發布的課程', async () => {
      await courseRepository.update(courseId, {
        status: CourseStatus.DRAFT
      })

      const response = await request(app)
        .post(`/api/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(422)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_CANNOT_ARCHIVE,
        message: ERROR_MESSAGES.BUSINESS.COURSE_CANNOT_ARCHIVE
      })
    })

    it('應該拒絕封存已封存的課程', async () => {
      await courseRepository.update(courseId, {
        status: CourseStatus.ARCHIVED
      })

      const response = await request(app)
        .post(`/api/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({})
        .expect(422)

      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.COURSE_CANNOT_ARCHIVE,
        message: ERROR_MESSAGES.BUSINESS.COURSE_CANNOT_ARCHIVE
      })
    })

    it('應該拒絕非課程擁有者的封存請求', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/archive`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send({})
        .expect(403)

      expect(response.body).toEqual({
        status: 'error',
        code: 'TEACHER_PERMISSION_REQUIRED',
        message: '需要教師權限才能執行此操作'
      })
    })
  })
})