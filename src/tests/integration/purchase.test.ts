/**
 * 購買記錄 API 整合測試
 * 測試所有購買記錄相關的 API endpoints
 */

import request from 'supertest'
import app from '../../app'
import { dataSource } from '@db/data-source'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import { PurchaseTestHelpers } from '@tests/helpers/purchaseHelpers'
import { CartTestHelpers } from '@tests/helpers/cartHelpers'
import { UserTestHelpers } from '@tests/helpers/testHelpers'

describe('購買記錄 API 整合測試', () => {
  let testUser: any
  let authToken: string
  let testCourse: any
  let testPurchase: any

  beforeAll(async () => {
    await dataSource.initialize()
  })

  afterAll(async () => {
    await dataSource.destroy()
  })

  beforeEach(async () => {
    // 清理測試資料
    await PurchaseTestHelpers.cleanupPurchaseTestData()
    
    // 建立測試環境
    const testEnv = await CartTestHelpers.createCartTestEnvironment({
      cartItemsCount: 0,
      courseCount: 1,
      withValidCourses: true
    })
    
    testUser = testEnv.student
    authToken = testEnv.authToken
    testCourse = testEnv.courses[0]
    
    // 建立測試購買記錄
    testPurchase = await PurchaseTestHelpers.createPurchase(testUser.id, {
      course_id: testCourse.id,
      quantity_total: 10,
      quantity_used: 2
    })
  })

  afterEach(async () => {
    await PurchaseTestHelpers.cleanupPurchaseTestData()
  })

  describe('GET /api/purchases - 取得購買記錄列表', () => {
    beforeEach(async () => {
      // 建立多個購買記錄
      await PurchaseTestHelpers.createMultiplePurchases(testUser.id, 2, {
        course_id: testCourse.id
      })
    })

    it('成功取得購買記錄列表', async () => {
      const response = await request(app)
        .get('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.PURCHASE.LIST_SUCCESS)
      expect(response.body.data.purchases).toHaveLength(3) // 原本1個 + 新增2個
    })

    it('即使有分頁參數也會返回所有記錄', async () => {
      const response = await request(app)
        .get('/api/purchases?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      // 由於我們移除了分頁功能，應該返回所有3個記錄，不受limit參數影響
      expect(response.body.data.purchases.length).toBe(3)
    })

    it('支援課程篩選', async () => {
      const response = await request(app)
        .get(`/api/purchases?course_id=${testCourse.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      response.body.data.purchases.forEach((purchase: any) => {
        expect(purchase.course_id).toBe(testCourse.id)
      })
    })

    it('空結果應該返回空陣列', async () => {
      // 清理所有購買記錄
      await PurchaseTestHelpers.cleanupPurchaseTestData()

      const response = await request(app)
        .get('/api/purchases')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.purchases).toHaveLength(0)
    })

    it('未登入應該返回認證錯誤', async () => {
      const response = await request(app)
        .get('/api/purchases')
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  describe('GET /api/purchases/:id - 取得單一購買記錄詳情', () => {
    it('成功取得購買記錄詳情', async () => {
      const response = await request(app)
        .get(`/api/purchases/${(testPurchase as any).id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.PURCHASE.DETAIL_SUCCESS)
      expect(response.body.data.purchase.course_id).toBe(testCourse.id)
      expect(response.body.data.purchase).toHaveProperty('course')
      expect(response.body.data.purchase.quantity_total).toBe(10)
      expect(response.body.data.purchase.quantity_used).toBe(2)
      expect(response.body.data.purchase.quantity_remaining).toBe(8)
    })

    it('無效的購買記錄 ID 應該返回錯誤', async () => {
      const response = await request(app)
        .get('/api/purchases/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.PURCHASE_NOT_FOUND)
    })

    it('非擁有者無法查看購買記錄', async () => {
      const { authToken: otherToken } = await UserTestHelpers.createTestUserWithToken()

      const response = await request(app)
        .get(`/api/purchases/${(testPurchase as any).id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.UNAUTHORIZED_ACCESS)
    })
  })

  describe('POST /api/purchases/:id/use - 使用購買堂數', () => {
    it('成功使用購買堂數', async () => {
      const useData = {
        quantity: 3
      }

      const response = await request(app)
        .post(`/api/purchases/${(testPurchase as any).id}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(useData)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.PURCHASE.DETAIL_SUCCESS)
      expect(response.body.data.purchase.quantity_used).toBe(5) // 原本2 + 新使用3 = 5
      expect(response.body.data.purchase.quantity_remaining).toBe(5) // 10 - 5 = 5
    })

    it('使用數量超過剩餘數量應該返回錯誤', async () => {
      const useData = {
        quantity: 10 // 剩餘8堂，使用10堂應該失敗
      }

      const response = await request(app)
        .post(`/api/purchases/${(testPurchase as any).id}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(useData)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.INSUFFICIENT_PURCHASE_QUANTITY)
    })

    it('無效的使用數量應該返回驗證錯誤', async () => {
      const response = await request(app)
        .post(`/api/purchases/${(testPurchase as any).id}/use`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 0 })
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    })

    it('無效的購買記錄 ID 應該返回錯誤', async () => {
      const response = await request(app)
        .post('/api/purchases/99999/use')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 1 })
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.PURCHASE_NOT_FOUND)
    })

    it('非擁有者無法使用購買堂數', async () => {
      const { authToken: otherToken } = await UserTestHelpers.createTestUserWithToken()

      const response = await request(app)
        .post(`/api/purchases/${(testPurchase as any).id}/use`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ quantity: 1 })
        .expect(403)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.UNAUTHORIZED_ACCESS)
    })
  })

  describe('GET /api/purchases/courses/:courseId - 取得特定課程的購買記錄', () => {
    it('成功取得課程購買記錄', async () => {
      const response = await request(app)
        .get(`/api/purchases/courses/${testCourse.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.PURCHASE.DETAIL_SUCCESS)
      expect(response.body.data.purchase.course_id).toBe(testCourse.id)
      expect(response.body.data.purchase).toHaveProperty('course')
      expect(response.body.data.purchase.quantity_total).toBe(10)
      expect(response.body.data.purchase.quantity_used).toBe(2)
    })

    it('未購買的課程應該返回404', async () => {
      const response = await request(app)
        .get('/api/purchases/courses/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.PURCHASE_NOT_FOUND)
    })

    it('未登入應該返回認證錯誤', async () => {
      const response = await request(app)
        .get(`/api/purchases/courses/${testCourse.id}`)
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  describe('GET /api/purchases/summary - 取得購買統計資料', () => {
    beforeEach(async () => {
      // 建立多個購買記錄用於統計
      await PurchaseTestHelpers.createMultiplePurchases(testUser.id, 3, {
        course_id: testCourse.id,
        quantity_total: 5,
        quantity_used: 2
      })
    })

    it('成功取得購買統計', async () => {
      const response = await request(app)
        .get('/api/purchases/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.PURCHASE.LIST_SUCCESS)
      expect(response.body.data.summary).toHaveProperty('total_courses')
      expect(response.body.data.summary).toHaveProperty('total_quantity_purchased')
      expect(response.body.data.summary).toHaveProperty('total_quantity_used')
      expect(response.body.data.summary).toHaveProperty('total_quantity_remaining')
      expect(response.body.data.summary.total_courses).toBeGreaterThan(0)
    })

    it('空購買記錄應該返回零統計', async () => {
      // 清理所有購買記錄
      await PurchaseTestHelpers.cleanupPurchaseTestData()

      const response = await request(app)
        .get('/api/purchases/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.summary.total_courses).toBe(0)
      expect(response.body.data.summary.total_quantity_purchased).toBe(0)
      expect(response.body.data.summary.total_quantity_used).toBe(0)
      expect(response.body.data.summary.total_quantity_remaining).toBe(0)
    })

    it('未登入應該返回認證錯誤', async () => {
      const response = await request(app)
        .get('/api/purchases/summary')
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })
})