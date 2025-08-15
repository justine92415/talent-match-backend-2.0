import request from 'supertest'
import { Application } from 'express'
import { dataSource } from '../../db/data-source'
import jwt from 'jsonwebtoken'
import { User } from '../../entities/User'

/**
 * 通用測試輔助函數
 */
export class TestHelper {
  /**
   * 初始化測試資料庫
   */
  static async initializeTestDatabase(): Promise<void> {
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }

    // 清理所有測試資料
    await this.cleanupAllTestData()
  }

  /**
   * 關閉測試資料庫連線
   */
  static async closeTestDatabase(): Promise<void> {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  }

  /**
   * 清理所有測試資料
   */
  static async cleanupAllTestData(): Promise<void> {
    // 清理順序很重要，要先清理有外鍵依賴的表
    const entities = ['courses', 'teacher_certificates', 'teacher_work_experiences', 'teacher_learning_experiences', 'teachers', 'users']

    for (const entityName of entities) {
      await dataSource.query(`DELETE FROM ${entityName} WHERE 1=1`)
    }
  }

  /**
   * 建立 JWT Token
   */
  static createJWTToken(user: User): string {
    const payload = {
      id: user.id,
      nick_name: user.nick_name,
      email: user.email
    }

    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h'
    })
  }

  /**
   * 建立認證請求
   */
  static authenticatedRequest(app: Application, method: 'get' | 'post' | 'put' | 'delete' | 'patch', url: string, user: User) {
    const token = this.createJWTToken(user)
    return request(app)[method](url).set('Authorization', `Bearer ${token}`)
  }

  /**
   * 執行 GET 請求並附帶認證
   */
  static authenticatedGet(app: Application, url: string, user: User) {
    return this.authenticatedRequest(app, 'get', url, user)
  }

  /**
   * 執行 POST 請求並附帶認證
   */
  static authenticatedPost(app: Application, url: string, user: User) {
    return this.authenticatedRequest(app, 'post', url, user)
  }

  /**
   * 執行 PUT 請求並附帶認證
   */
  static authenticatedPut(app: Application, url: string, user: User) {
    return this.authenticatedRequest(app, 'put', url, user)
  }

  /**
   * 執行 DELETE 請求並附帶認證
   */
  static authenticatedDelete(app: Application, url: string, user: User) {
    return this.authenticatedRequest(app, 'delete', url, user)
  }

  /**
   * 驗證API回應格式
   */
  static validateApiResponse(response: any, expectedStatus: 'success' | 'error') {
    expect(response.status).toBe(expectedStatus)
    expect(response.message).toBeDefined()

    if (expectedStatus === 'success') {
      expect(response.data).toBeDefined()
    } else {
      expect(response.errors || response.message).toBeDefined()
    }
  }

  /**
   * 驗證分頁回應格式
   */
  static validatePaginationResponse(response: any) {
    expect(response.pagination).toBeDefined()
    expect(response.pagination.page).toBeGreaterThan(0)
    expect(response.pagination.limit).toBeGreaterThan(0)
    expect(response.pagination.total).toBeGreaterThanOrEqual(0)
    expect(response.pagination.totalPages).toBeGreaterThanOrEqual(0)
  }

  /**
   * 驗證錯誤回應
   */
  static validateErrorResponse(response: request.Response, expectedStatusCode: number, expectedMessage?: string) {
    expect(response.status).toBe(expectedStatusCode)
    expect(response.body.status).toBe('error')
    expect(response.body.message).toBeDefined()

    if (expectedMessage) {
      expect(response.body.message).toBe(expectedMessage)
    }
  }

  /**
   * 驗證成功回應
   */
  static validateSuccessResponse(response: request.Response, expectedStatusCode: number = 200, expectedMessage?: string) {
    expect(response.status).toBe(expectedStatusCode)
    expect(response.body.status).toBe('success')
    expect(response.body.message).toBeDefined()

    if (expectedMessage) {
      expect(response.body.message).toBe(expectedMessage)
    }
  }

  /**
   * 等待特定時間
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 產生隨機字串
   */
  static generateRandomString(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return result
  }

  /**
   * 產生隨機數字
   */
  static generateRandomNumber(min: number = 1, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * 建立模擬請求資料
   */
  static createMockRequestData(overrides: any = {}): any {
    return {
      body: {},
      params: {},
      query: {},
      user: null,
      headers: {},
      ...overrides
    }
  }

  /**
   * 建立模擬回應物件
   */
  static createMockResponse(): any {
    const res: any = {}
    res.status = jest.fn().mockReturnValue(res)
    res.json = jest.fn().mockReturnValue(res)
    res.send = jest.fn().mockReturnValue(res)
    return res
  }

  /**
   * 建立模擬 next 函式
   */
  static createMockNext(): jest.Mock {
    return jest.fn()
  }

  /**
   * 檢查物件是否包含特定屬性
   */
  static expectObjectToHaveProperties(obj: any, properties: string[]): void {
    properties.forEach(prop => {
      expect(obj).toHaveProperty(prop)
    })
  }

  /**
   * 檢查陣列長度
   */
  static expectArrayLength(arr: any[], expectedLength: number): void {
    expect(Array.isArray(arr)).toBe(true)
    expect(arr.length).toBe(expectedLength)
  }
}
