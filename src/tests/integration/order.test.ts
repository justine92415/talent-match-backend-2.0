/**
 * 訂單 API 整合測試
 * 測試所有訂單相關的 API endpoints
 */

import request from 'supertest'
import app from '../../app'
import { dataSource } from '@db/data-source'
import { Order } from '@entities/Order'
import { OrderItem } from '@entities/OrderItem'
import { UserCartItem } from '@entities/UserCartItem'
import { OrderStatus, PaymentStatus, PurchaseWay } from '@entities/enums'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import { OrderTestHelpers } from '@tests/helpers/orderHelpers'
import { CartTestHelpers } from '@tests/helpers/cartHelpers'
import { UserTestHelpers } from '@tests/helpers/testHelpers'
import { validOrderData, invalidOrderData } from '@tests/fixtures/orderFixtures'

describe('訂單 API 整合測試', () => {
  let testUser: any
  let authToken: string
  let testCourse: any
  let testPriceOption: any
  let cartItem: any

  beforeAll(async () => {
    await dataSource.initialize()
  })

  afterAll(async () => {
    await dataSource.destroy()
  })

  beforeEach(async () => {
    // 清理測試資料
    await OrderTestHelpers.cleanupOrderTestData()
    await CartTestHelpers.cleanupCartTestData()
    
    // 建立測試環境
    const testEnv = await CartTestHelpers.createCartTestEnvironment({
      cartItemsCount: 1,
      courseCount: 1,
      withValidCourses: true
    })
    
    testUser = testEnv.student
    authToken = testEnv.authToken
    testCourse = testEnv.courses[0]
    testPriceOption = testEnv.priceOptions[0]
    cartItem = testEnv.cartItems[0]
  })

  afterEach(async () => {
    await OrderTestHelpers.cleanupOrderTestData()
    await CartTestHelpers.cleanupCartTestData()
  })

  describe('POST /api/orders - 建立訂單', () => {
    it('成功從購物車建立訂單', async () => {
      const orderRequest = {
        ...validOrderData,
        cart_item_ids: [cartItem.id]
      }
      
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderRequest)
        .expect(201)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.ORDER.CREATED)
      expect(response.body.data.order).toHaveProperty('id')
      expect(response.body.data.order).toHaveProperty('uuid')
      expect(response.body.data.order.status).toBe(OrderStatus.PENDING)
      expect(response.body.data.order.payment_status).toBe(PaymentStatus.PENDING)
      expect(response.body.data.order.buyer_id).toBe(testUser.id)
      
      // 驗證訂單項目
      expect(response.body.data.order_items).toHaveLength(1)
      expect(response.body.data.order_items[0].course_id).toBe(testCourse.id)
      
      // 驗證購物車已清空
      const remainingCartItems = await CartTestHelpers.getUserCartItems(testUser.id)
      expect(remainingCartItems).toHaveLength(0)
    })

    it('空購物車無法建立訂單', async () => {
      // 清空購物車
      await CartTestHelpers.cleanupCartTestData()

      const orderRequest = {
        ...validOrderData,
        cart_item_ids: []
      }

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderRequest)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.CART_ITEMS_REQUIRED)
    })

    it('缺少必填欄位應該返回驗證錯誤', async () => {
      const orderRequest = {
        ...invalidOrderData.missingPurchaseWay,
        cart_item_ids: [cartItem.id]
      }
      
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderRequest)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    })

    it('無效的付款方式應該返回錯誤', async () => {
      const orderRequest = {
        ...invalidOrderData.invalidPurchaseWay,
        cart_item_ids: [cartItem.id]
      }
      
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderRequest)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    })

    it('未登入應該返回認證錯誤', async () => {
      const orderRequest = {
        ...validOrderData,
        cart_item_ids: [cartItem.id]
      }
      
      const response = await request(app)
        .post('/api/orders')
        .send(orderRequest)
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  describe('GET /api/orders - 取得訂單列表', () => {
    beforeEach(async () => {
      // 建立測試訂單
      await OrderTestHelpers.createOrderVariations(testUser.id)
    })

    it('成功取得訂單列表', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.ORDER.LIST_SUCCESS)
      expect(response.body.data.orders).toHaveLength(3)
    })

    it('支援分頁參數', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.data.orders.length).toBeLessThanOrEqual(2)
    })

    it('支援狀態篩選', async () => {
      const response = await request(app)
        .get(`/api/orders?status=${OrderStatus.PAID}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      response.body.data.orders.forEach((order: any) => {
        expect(order.status).toBe(OrderStatus.PAID)
      })
    })

    it('未登入應該返回認證錯誤', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  describe('GET /api/orders/:id - 取得單一訂單詳情', () => {
    let testOrder: any

    beforeEach(async () => {
      const { order } = await OrderTestHelpers.createCompleteOrder(testUser.id, [
        {
          course_id: testCourse.id,
          price_option_id: testPriceOption.id,
          quantity: 2,
          unit_price: 500,
          total_price: 1000
        }
      ])
      testOrder = order
    })

    it('成功取得訂單詳情', async () => {
      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.ORDER.DETAIL_SUCCESS)
      expect(response.body.data.id).toBe(testOrder.id)
      expect(response.body.data.items).toHaveLength(1)
      expect(response.body.data.items[0]).toHaveProperty('course')
      expect(response.body.data.items[0]).toHaveProperty('price_option')
    })

    it('無效的訂單 ID 應該返回錯誤', async () => {
      const response = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.ORDER_NOT_FOUND)
    })

    it('非擁有者無法查看訂單', async () => {
      const { authToken: otherToken } = await UserTestHelpers.createTestUserWithToken()

      const response = await request(app)
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.UNAUTHORIZED_ORDER_ACCESS)
    })
  })

  describe('POST /api/orders/:id/cancel - 取消訂單', () => {
    let pendingOrder: any

    beforeEach(async () => {
      pendingOrder = await OrderTestHelpers.createOrder(testUser.id, {
        status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING
      })
    })

    it('成功取消待付款訂單', async () => {
      const response = await request(app)
        .post(`/api/orders/${pendingOrder.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.ORDER.CANCELLED)
      expect(response.body.data.status).toBe(OrderStatus.CANCELLED)
    })

    it('已付款訂單無法取消', async () => {
      const paidOrder = await OrderTestHelpers.createOrder(testUser.id, {
        status: OrderStatus.PAID,
        payment_status: PaymentStatus.COMPLETED,
        paid_at: new Date()
      })

      const response = await request(app)
        .post(`/api/orders/${(paidOrder as any).id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.ORDER_STATUS_INVALID_FOR_CANCEL)
    })

    it('已取消訂單無法再次取消', async () => {
      const cancelledOrder = await OrderTestHelpers.createOrder(testUser.id, {
        status: OrderStatus.CANCELLED,
        payment_status: PaymentStatus.PENDING
      })

      const response = await request(app)
        .post(`/api/orders/${(cancelledOrder as any).id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.ORDER_ALREADY_CANCELLED)
    })

    it('無效的訂單 ID 應該返回錯誤', async () => {
      const response = await request(app)
        .post('/api/orders/99999/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.ORDER_NOT_FOUND)
    })

    it('非擁有者無法取消訂單', async () => {
      const { authToken: otherToken } = await UserTestHelpers.createTestUserWithToken()

      const response = await request(app)
        .post(`/api/orders/${pendingOrder.id}/cancel`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.UNAUTHORIZED_ORDER_ACCESS)
    })
  })

  describe('POST /api/orders/:id/payment - 處理訂單付款', () => {
    let pendingOrder: any

    beforeEach(async () => {
      pendingOrder = await OrderTestHelpers.createOrder(testUser.id, {
        status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
        total_amount: 1000
      })
    })

    it('成功處理 LINE PAY 付款', async () => {
      const paymentData = {
        purchase_way: PurchaseWay.LINE_PAY,
        amount: 1000
      }

      const response = await request(app)
        .post(`/api/orders/${pendingOrder.id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(200)

      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(MESSAGES.PAYMENT.PROCESSING_SUCCESS)
      expect(response.body.data).toHaveProperty('payment_url')
      expect(response.body.data).toHaveProperty('transaction_id')
    })

    it('金額不符應該返回錯誤', async () => {
      const paymentData = {
        purchase_way: PurchaseWay.LINE_PAY,
        amount: 2000 // 與訂單金額不符
      }

      const response = await request(app)
        .post(`/api/orders/${pendingOrder.id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
    })

    it('已付款訂單無法重複付款', async () => {
      const paidOrder = await OrderTestHelpers.createOrder(testUser.id, {
        status: OrderStatus.PAID,
        payment_status: PaymentStatus.COMPLETED,
        paid_at: new Date()
      })

      const paymentData = {
        purchase_way: PurchaseWay.LINE_PAY,
        amount: 1000
      }

      const response = await request(app)
        .post(`/api/orders/${(paidOrder as any).id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.ORDER_ALREADY_PAID)
    })

    it('已取消訂單無法付款', async () => {
      const cancelledOrder = await OrderTestHelpers.createOrder(testUser.id, {
        status: OrderStatus.CANCELLED,
        payment_status: PaymentStatus.PENDING
      })

      const paymentData = {
        purchase_way: PurchaseWay.LINE_PAY,
        amount: 1000
      }

      const response = await request(app)
        .post(`/api/orders/${(cancelledOrder as any).id}/payment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(400)

      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.ORDER_STATUS_INVALID_FOR_PAYMENT)
    })
  })
})