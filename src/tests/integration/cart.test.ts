/**
 * 購物車 API 整合測試
 * 測試所有購物車相關的 API endpoints
 */

import request from 'supertest'
import app from '../../app'
import { dataSource } from '@db/data-source'
import { UserCartItem } from '@entities/UserCartItem'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import { CartTestHelpers } from '@tests/helpers/cartHelpers'
import { UserTestHelpers } from '@tests/helpers/testHelpers'
import { validCartItemData, invalidCartItemData } from '@tests/fixtures/cartItemFixtures'

describe('購物車 API 整合測試', () => {
  let testUser: any
  let authToken: string
  let testCourse: any
  let testPriceOption: any
  let testTeacher: any

  beforeAll(async () => {
    await dataSource.initialize()
  })

  afterAll(async () => {
    await dataSource.destroy()
  })

  beforeEach(async () => {
    // 清理測試資料
    await CartTestHelpers.cleanupCartTestData()
    
    // 建立測試環境
    const testEnv = await CartTestHelpers.createCartTestEnvironment({
      cartItemsCount: 0, // 先不建立購物車項目
      courseCount: 1,
      withValidCourses: true
    })
    
    testUser = testEnv.student
    authToken = testEnv.authToken
    testTeacher = testEnv.teachers[0]
    testCourse = testEnv.courses[0]
    testPriceOption = testEnv.priceOptions[0]
  })

  afterEach(async () => {
    await CartTestHelpers.cleanupCartTestData()
  })

  describe('POST /api/cart/items - 加入購物車', () => {
    it('成功加入購物車項目', async () => {
      const cartData = {
        ...validCartItemData,
        course_id: testCourse.id,
        price_option_id: testPriceOption.id
      }

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartData)
        .expect(201)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.CART.ITEM_ADDED)
      expect(response.body.data).toHaveProperty('id')
      expect(response.body.data.course_id).toBe(testCourse.id)
      expect(response.body.data.price_option_id).toBe(testPriceOption.id)
      expect(response.body.data.quantity).toBe(1)

      // 驗證資料庫中的資料
      const cartItem = await CartTestHelpers.getUserCartItems(testUser.id)
      expect(cartItem).toHaveLength(1)
      expect(cartItem[0].course_id).toBe(testCourse.id)
    })

    it('重複加入相同課程應該更新數量', async () => {
      // 先加入一個項目
      await CartTestHelpers.createCartItem(testUser.id, {
        course_id: testCourse.id,
        price_option_id: testPriceOption.id,
        quantity: 2
      })

      const cartData = {
        course_id: testCourse.id,
        price_option_id: testPriceOption.id,
        quantity: 3
      }

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartData)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.CART.ITEM_UPDATED)
      expect(response.body.data.quantity).toBe(5) // 2 + 3 = 5

      // 驗證只有一個項目，但數量是累加的
      const cartItems = await CartTestHelpers.getUserCartItems(testUser.id)
      expect(cartItems).toHaveLength(1)
      expect(cartItems[0].quantity).toBe(5)
    })

    it('缺少必填欄位應該返回驗證錯誤', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCartItemData.missingCourseId)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    })

    it('無效的課程 ID 應該返回錯誤', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCartItemData.invalidCourseId)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    })

    it('無效的價格方案 ID 應該返回錯誤', async () => {
      const cartData = {
        course_id: testCourse.id,
        price_option_id: 99999,
        quantity: 1
      }

      const response = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cartData)
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.PRICE_OPTION_NOT_FOUND)
    })

    it('未登入應該返回認證錯誤', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .send(validCartItemData)
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  describe('GET /api/cart - 取得購物車列表', () => {
    beforeEach(async () => {
      // 建立測試用的購物車項目
      await CartTestHelpers.createMultipleCartItems(testUser.id, 2, {
        course_id: testCourse.id,
        price_option_id: testPriceOption.id
      })
    })

    it('成功取得購物車列表', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.CART.LIST_SUCCESS)
      expect(response.body.data.items).toHaveLength(2)
      expect(response.body.data).toHaveProperty('summary')
      expect(response.body.data.summary).toHaveProperty('total_items')
      expect(response.body.data.summary).toHaveProperty('total_amount')
    })

    it('空購物車應該返回空列表', async () => {
      // 清空購物車
      await CartTestHelpers.cleanupCartTestData()

      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.items).toHaveLength(0)
      expect(response.body.data.summary.total_items).toBe(0)
      expect(response.body.data.summary.total_amount).toBe(0)
    })

    it('未登入應該返回認證錯誤', async () => {
      const response = await request(app)
        .get('/api/cart')
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  describe('PUT /api/cart/items/:id - 更新購物車項目', () => {
    let cartItem: any

    beforeEach(async () => {
      cartItem = await CartTestHelpers.createCartItem(testUser.id, {
        course_id: testCourse.id,
        price_option_id: testPriceOption.id,
        quantity: 2
      })
    })

    it('成功更新購物車項目數量', async () => {
      const updateData = { quantity: 5 }

      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.CART.ITEM_UPDATED)
      expect(response.body.data.quantity).toBe(5)

      // 驗證資料庫中的資料
      const updatedItems = await CartTestHelpers.getUserCartItems(testUser.id)
      expect(updatedItems[0].quantity).toBe(5)
    })

    it('無效的項目 ID 應該返回錯誤', async () => {
      const response = await request(app)
        .put('/api/cart/items/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 3 })
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.CART_ITEM_NOT_FOUND)
    })

    it('無效的數量應該返回驗證錯誤', async () => {
      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quantity: 0 })
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    })

    it('非擁有者不能更新項目', async () => {
      // 建立另一個使用者
      const { user: otherUser, authToken: otherToken } = await UserTestHelpers.createTestUserWithToken()

      const response = await request(app)
        .put(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ quantity: 3 })
        .expect(403)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.UNAUTHORIZED_CART_ACCESS)
    })
  })

  describe('DELETE /api/cart/items/:id - 刪除購物車項目', () => {
    let cartItem: any

    beforeEach(async () => {
      cartItem = await CartTestHelpers.createCartItem(testUser.id, {
        course_id: testCourse.id,
        price_option_id: testPriceOption.id
      })
    })

    it('成功刪除購物車項目', async () => {
      const response = await request(app)
        .delete(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.CART.ITEM_REMOVED)

      // 驗證項目已被刪除
      const remainingItems = await CartTestHelpers.getUserCartItems(testUser.id)
      expect(remainingItems).toHaveLength(0)
    })

    it('無效的項目 ID 應該返回錯誤', async () => {
      const response = await request(app)
        .delete('/api/cart/items/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.CART_ITEM_NOT_FOUND)
    })

    it('非擁有者不能刪除項目', async () => {
      const { authToken: otherToken } = await UserTestHelpers.createTestUserWithToken()

      const response = await request(app)
        .delete(`/api/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.UNAUTHORIZED_CART_ACCESS)
    })
  })

  describe('DELETE /api/cart - 清空購物車', () => {
    beforeEach(async () => {
      // 建立多個購物車項目
      await CartTestHelpers.createMultipleCartItems(testUser.id, 3, {
        course_id: testCourse.id,
        price_option_id: testPriceOption.id
      })
    })

    it('成功清空購物車', async () => {
      const response = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.CART.CLEARED)

      // 驗證購物車已清空
      const remainingItems = await CartTestHelpers.getUserCartItems(testUser.id)
      expect(remainingItems).toHaveLength(0)
    })

    it('空購物車清空操作應該成功', async () => {
      // 先清空購物車
      await CartTestHelpers.cleanupCartTestData()

      const response = await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.CART.CLEARED)
    })

    it('未登入應該返回認證錯誤', async () => {
      const response = await request(app)
        .delete('/api/cart')
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })
})