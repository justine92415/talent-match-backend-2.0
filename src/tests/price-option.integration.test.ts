/**
 * 課程價格方案管理 API 整合測試
 * 
 * 測試範圍（專注核心業務邏輯）：
 * - GET /api/courses/:courseId/price-options - 查詢價格方案列表
 * - POST /api/courses/:courseId/price-options - 建立價格方案
 * - PUT /api/courses/:courseId/price-options/:id - 更新價格方案
 * - DELETE /api/courses/:courseId/price-options/:id - 刪除價格方案
 * 
 * 核心業務場景：
 * - 基本 CRUD 操作測試
 * - 認證與授權檢查
 * - 資料驗證測試
 * - 業務規則檢查（重複方案、數量限制）
 */

import request from 'supertest'
import app from '@src/app'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, TeacherTestHelpers } from '@tests/helpers/testHelpers'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES, SUCCESS } from '@constants/Message'
import { CourseStatus, ApplicationStatus } from '@entities/enums'
import { v4 as uuidv4 } from 'uuid'
import type { PriceOptionCreateRequest, PriceOptionUpdateRequest } from '@models/index'

// 價格方案測試資料
const validPriceOptionData: PriceOptionCreateRequest = {
  price: 1500,
  quantity: 10
}

const anotherValidPriceOptionData: PriceOptionCreateRequest = {
  price: 2800,
  quantity: 20
}

const updatedPriceOptionData: PriceOptionUpdateRequest = {
  price: 1800,
  quantity: 12
}

// 無效測試資料
const invalidPriceOptionData = {
  price: -100, // 負數價格
  quantity: 0   // 0 堂數
}

const missingFieldsData = {
  // 缺少 price 和 quantity 必填欄位
}

describe('課程價格方案管理 API', () => {
  let courseId: number
  let anotherCourseId: number
  let teacherId: number
  let teacherToken: string
  let anotherTeacherToken: string
  let priceOptionId: number

  beforeAll(async () => {
    await initTestDatabase()
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()

    // 建立測試用的教師用戶和課程
    const teacherUser = await UserTestHelpers.createTeacherUserEntity()
    teacherId = teacherUser.id
    teacherToken = UserTestHelpers.generateAuthToken(teacherUser)

    const teacher = await TeacherTestHelpers.createTeacherApplication(teacherId, {
      application_status: ApplicationStatus.APPROVED
    })

    // 建立另一個教師（用於權限測試）
    const anotherTeacherUser = await UserTestHelpers.createTeacherUserEntity({
      email: 'another@teacher.com'
    })
    anotherTeacherToken = UserTestHelpers.generateAuthToken(anotherTeacherUser)

    // 建立測試課程
    const courseRepository = dataSource.getRepository(Course)
    const course = await courseRepository.save({
      uuid: uuidv4(),
      teacher_id: teacherId,
      name: '測試程式設計課程',
      content: '課程內容描述',
      status: CourseStatus.PUBLISHED,
      main_category_id: 1,
      sub_category_id: 1,
      city_id: 1
    })
    courseId = course.id

    // 建立另一個課程
    const anotherCourse = await courseRepository.save({
      uuid: uuidv4(),
      teacher_id: teacherId,
      name: '另一個測試課程',
      content: '另一個課程內容',
      status: CourseStatus.PUBLISHED,
      main_category_id: 1,
      sub_category_id: 1,
      city_id: 1
    })
    anotherCourseId = anotherCourse.id

    // 為測試準備一些價格方案
    const priceOptionRepository = dataSource.getRepository(CoursePriceOption)

    // 為第一個課程建立初始價格方案
    const existingPriceOption1 = await priceOptionRepository.save({
      uuid: uuidv4(),
      course_id: courseId,
      price: 1500,
      quantity: 10,
      is_active: true
    })

    const existingPriceOption2 = await priceOptionRepository.save({
      uuid: uuidv4(),
      course_id: courseId,
      price: 2500,
      quantity: 20,
      is_active: true
    })

    priceOptionId = existingPriceOption1.id

    // 為第二個課程建立3個價格方案（達到上限）
    await priceOptionRepository.save([
      {
        uuid: uuidv4(),
        course_id: anotherCourseId,
        price: 1000,
        quantity: 5,
        is_active: true
      },
      {
        uuid: uuidv4(),
        course_id: anotherCourseId,
        price: 1800,
        quantity: 12,
        is_active: true
      },
      {
        uuid: uuidv4(),
        course_id: anotherCourseId,
        price: 3000,
        quantity: 25,
        is_active: true
      }
    ])
  })

  afterEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/courses/:courseId/price-options', () => {
    it('應該成功查詢課程價格方案列表並回傳 200', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}/price-options`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        data: expect.any(Array),
        message: SUCCESS.PRICE_OPTION_LIST_SUCCESS
      })

      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0]).toHaveProperty('price')
      expect(response.body.data[0]).toHaveProperty('quantity')
      expect(response.body.data[0]).toHaveProperty('uuid')
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await request(app)
        .get(`/api/courses/${courseId}/price-options`)
        .expect(401)

      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該處理不存在的課程並回傳 404', async () => {
      const nonExistentCourseId = 9999

      const response = await request(app)
        .get(`/api/courses/${nonExistentCourseId}/price-options`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404)

      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })
  })

  describe('POST /api/courses/:courseId/price-options', () => {
    it('應該成功建立價格方案並回傳 201', async () => {
      // 使用新課程以避免重複
      const courseRepository = dataSource.getRepository(Course)
      const newCourse = await courseRepository.save({
        uuid: uuidv4(),
        teacher_id: teacherId,
        name: '新測試課程',
        content: '新課程內容',
        status: CourseStatus.PUBLISHED,
        main_category_id: 1,
        sub_category_id: 1,
        city_id: 1
      })

      const response = await request(app)
        .post(`/api/courses/${newCourse.id}/price-options`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validPriceOptionData)
        .expect(201)

      expect(response.body).toEqual({
        status: 'success',
        data: expect.objectContaining({
          price: validPriceOptionData.price,
          quantity: validPriceOptionData.quantity,
          course_id: newCourse.id,
          is_active: true
        }),
        message: SUCCESS.PRICE_OPTION_CREATED
      })

      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data).toHaveProperty('uuid')
    })

    it('應該拒絕重複的價格方案組合並回傳 409', async () => {
      // 嘗試建立與現有相同價格和數量的方案
      const existingPriceOptionData = {
        price: 1500, // 與 beforeEach 中的第一個方案相同
        quantity: 10
      }

      const response = await request(app)
        .post(`/api/courses/${courseId}/price-options`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(existingPriceOptionData)
        .expect(409)

      expect(response.body.code).toBe(ERROR_CODES.PRICE_OPTION_DUPLICATE)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.PRICE_OPTION_DUPLICATE)
    })

    it('應該拒絕超過方案數量限制並回傳 400', async () => {
      const response = await request(app)
        .post(`/api/courses/${anotherCourseId}/price-options`) // 此課程已有3個方案
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validPriceOptionData)
        .expect(400)

      expect(response.body.code).toBe(ERROR_CODES.PRICE_OPTION_LIMIT_EXCEEDED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.PRICE_OPTION_LIMIT_EXCEEDED)
    })

    it('應該拒絕其他教師操作並回傳 403', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/price-options`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send(validPriceOptionData)
        .expect(403)

      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該驗證必填欄位並回傳 400', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/price-options`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(missingFieldsData)
        .expect(400)

      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(response.body).toHaveProperty('errors')
    })

    it('應該驗證資料格式並回傳 400', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/price-options`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(invalidPriceOptionData)
        .expect(400)

      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(response.body).toHaveProperty('errors')
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/price-options`)
        .send(validPriceOptionData)
        .expect(401)

      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該處理不存在的課程並回傳 404', async () => {
      const nonExistentCourseId = 9999

      const response = await request(app)
        .post(`/api/courses/${nonExistentCourseId}/price-options`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(validPriceOptionData)
        .expect(404)

      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })
  })

  describe('PUT /api/courses/:courseId/price-options/:id', () => {
    it('應該成功更新價格方案並回傳 200', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}/price-options/${priceOptionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updatedPriceOptionData)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        data: expect.objectContaining({
          id: priceOptionId,
          price: updatedPriceOptionData.price,
          quantity: updatedPriceOptionData.quantity
        }),
        message: SUCCESS.PRICE_OPTION_UPDATED
      })
    })

    it('應該拒絕其他教師操作並回傳 403', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}/price-options/${priceOptionId}`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send(updatedPriceOptionData)
        .expect(403)

      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該處理不存在的價格方案並回傳 404', async () => {
      const nonExistentPriceOptionId = 9999

      const response = await request(app)
        .put(`/api/courses/${courseId}/price-options/${nonExistentPriceOptionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(updatedPriceOptionData)
        .expect(404)

      expect(response.body.code).toBe(ERROR_CODES.PRICE_OPTION_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.PRICE_OPTION_NOT_FOUND)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}/price-options/${priceOptionId}`)
        .send(updatedPriceOptionData)
        .expect(401)

      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該驗證資料格式並回傳 400', async () => {
      const response = await request(app)
        .put(`/api/courses/${courseId}/price-options/${priceOptionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send(invalidPriceOptionData)
        .expect(400)

      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      expect(response.body).toHaveProperty('errors')
    })
  })

  describe('DELETE /api/courses/:courseId/price-options/:id', () => {
    it('應該成功刪除價格方案並回傳 200', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}/price-options/${priceOptionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(200)

      expect(response.body).toEqual({
        status: 'success',
        message: SUCCESS.PRICE_OPTION_DELETED
      })

      // 驗證方案確實被軟刪除
      const priceOptionRepository = dataSource.getRepository(CoursePriceOption)
      const deletedPriceOption = await priceOptionRepository.findOne({
        where: { id: priceOptionId }
      })

      expect(deletedPriceOption?.is_active).toBe(false)
    })

    it('應該拒絕其他教師操作並回傳 403', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}/price-options/${priceOptionId}`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .expect(403)

      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該處理不存在的價格方案並回傳 404', async () => {
      const nonExistentPriceOptionId = 9999

      const response = await request(app)
        .delete(`/api/courses/${courseId}/price-options/${nonExistentPriceOptionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404)

      expect(response.body.code).toBe(ERROR_CODES.PRICE_OPTION_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.PRICE_OPTION_NOT_FOUND)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await request(app)
        .delete(`/api/courses/${courseId}/price-options/${priceOptionId}`)
        .expect(401)

      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該處理不存在的課程並回傳 404', async () => {
      const nonExistentCourseId = 9999

      const response = await request(app)
        .delete(`/api/courses/${nonExistentCourseId}/price-options/${priceOptionId}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .expect(404)

      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })
  })
})