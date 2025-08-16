/**
 * 測試 Helper 函式
 * 遵循 TDD 指示文件：建立測試輔助工具，簡化資料庫設定和清理操作
 * 避免重複的使用者建立、認證、登入等操作
 */

import request from 'supertest'
import jwt from 'jsonwebtoken'
import { dataSource } from '../../db/data-source'
import { User } from '../../entities/User'
import { Teacher } from '../../entities/Teacher'
import { UserRole, AccountStatus, ApplicationStatus } from '../../entities/enums'
import { 
  validUserData, 
  createUserEntityData, 
  teacherUserEntityData, 
  suspendedUserEntityData 
} from '../fixtures/userFixtures'
import {
  createTeacherEntityData,
  jwtTestUsers
} from '../fixtures/teacherFixtures'
import ConfigManager from '../../config'
import app from '../../app'
import { 
  TestUserCreateData, 
  TestTeacherCreateData,
  TestUserWithToken,
  TestUserVariations,
  TestTeacherApplicationVariations,
  TestTeacherEnvironment,
  HttpMethod,
  TestRequestData,
  TestValidationStructure,
  DatabaseQueryCondition,
  TestFunction
} from '../../types'

/**
 * 使用者相關測試 Helper 函式
 */
class UserTestHelpers {
  /**
   * 註冊新使用者
   * @param userData 使用者資料，預設使用 validUserData
   * @returns 註冊回應
   */
  static async registerUser(userData = validUserData) {
    return await request(app)
      .post('/api/auth/register')
      .send(userData)
  }

  /**
   * 使用者登入
   * @param loginData 登入資料
   * @returns 登入回應（包含 access_token）
   */
  static async loginUser(loginData: { email: string; password: string }) {
    return await request(app)
      .post('/api/auth/login')
      .send(loginData)
  }

  /**
   * 註冊並登入使用者（常用組合操作）
   * @param userData 註冊用使用者資料
   * @returns 登入回應（包含 access_token）
   */
  static async registerAndLogin(userData = validUserData) {
    // 先註冊
    await this.registerUser(userData)
    
    // 再登入
    return await this.loginUser({
      email: userData.email,
      password: userData.password
    })
  }

  /**
   * 直接在資料庫中建立使用者實體（跳過註冊流程）
   * @param userData 使用者實體資料
   * @returns 建立的使用者實體
   */
  static async createUserEntity(userData: Partial<TestUserCreateData> = {}) {
    const userRepository = dataSource.getRepository(User)
    const defaultData = createUserEntityData(userData)
    const user = userRepository.create(defaultData)
    return await userRepository.save(user)
  }

  /**
   * 建立教師角色使用者實體
   * @param userData 使用者實體資料覆寫
   * @returns 建立的教師使用者實體
   */
  static async createTeacherUserEntity(userData: Partial<TestUserCreateData> = {}) {
    const userRepository = dataSource.getRepository(User)
    const defaultData = teacherUserEntityData(userData)
    const user = userRepository.create(defaultData)
    return await userRepository.save(user)
  }

  /**
   * 建立停用狀態使用者實體
   * @param userData 使用者實體資料覆寫
   * @returns 建立的停用使用者實體
   */
  static async createSuspendedUserEntity(userData: Partial<TestUserCreateData> = {}) {
    const userRepository = dataSource.getRepository(User)
    const defaultData = suspendedUserEntityData(userData)
    const user = userRepository.create(defaultData)
    return await userRepository.save(user)
  }

  /**
   * 產生 JWT 認證 Token
   * @param user 使用者物件
   * @param tokenType Token 類型（'access' | 'refresh'）
   * @param expiresIn 過期時間
   * @returns JWT Token
   */
  static generateAuthToken(
    user: { id: number; role: UserRole; uuid: string },
    tokenType: 'access' | 'refresh' = 'access',
    expiresIn: string = '1h'
  ): string {
    return jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        uuid: user.uuid,
        type: tokenType
      },
      ConfigManager.get<string>('secret.jwtSecret'),
      { expiresIn }
    )
  }

  /**
   * 產生過期的 JWT Token（用於測試）
   * @param user 使用者物件
   * @returns 過期的 JWT Token
   */
  static generateExpiredToken(user: { id: number; role: UserRole; uuid: string }): string {
    return jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        uuid: user.uuid,
        type: 'access'
      },
      ConfigManager.get<string>('secret.jwtSecret'),
      { expiresIn: '-1h' }
    )
  }

  /**
   * 建立完整的測試使用者（實體 + Token）
   * @param userData 使用者資料覆寫
   * @returns 使用者實體和認證 Token
   */
  static async createTestUserWithToken(userData: Partial<TestUserCreateData> = {}) {
    const user = await this.createUserEntity(userData)
    const authToken = this.generateAuthToken(user)
    
    return {
      user,
      authToken
    }
  }

  /**
   * 建立測試用的使用者變體集合
   * @returns 不同角色和狀態的使用者及其 Token
   */
  static async createUserVariations() {
    const student = await this.createUserEntity()
    const teacher = await this.createTeacherUserEntity()
    const suspended = await this.createSuspendedUserEntity()

    return {
      student: {
        user: student,
        authToken: this.generateAuthToken(student)
      },
      teacher: {
        user: teacher,
        authToken: this.generateAuthToken(teacher)
      },
      suspended: {
        user: suspended,
        authToken: this.generateAuthToken(suspended)
      }
    }
  }

  /**
   * 更新使用者帳號狀態
   * @param userId 使用者 ID
   * @param status 新狀態
   */
  static async updateUserStatus(userId: number, status: AccountStatus) {
    const userRepository = dataSource.getRepository(User)
    await userRepository.update(userId, { account_status: status })
  }

  /**
   * 設定使用者密碼重設令牌
   * @param userId 使用者 ID
   * @param resetToken 重設令牌
   * @param expiresAt 過期時間
   */
  static async setPasswordResetToken(
    userId: number, 
    resetToken: string, 
    expiresAt: Date = new Date(Date.now() + 60 * 60 * 1000) // 1小時後過期
  ) {
    const userRepository = dataSource.getRepository(User)
    await userRepository.update(userId, {
      password_reset_token: resetToken,
      password_reset_expires_at: expiresAt
    })
  }
}

/**
 * 教師申請相關測試 Helper 函式
 */
class TeacherTestHelpers {
  /**
   * 建立教師申請記錄
   * @param userId 使用者 ID
   * @param teacherData 教師資料覆寫
   * @returns 建立的教師申請記錄
   */
  static async createTeacherApplication(userId: number, teacherData: Partial<TestTeacherCreateData> = {}) {
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacherEntityData = createTeacherEntityData({
      user_id: userId,
      ...teacherData
    })
    
    return await teacherRepository.save(teacherEntityData)
  }

  /**
   * 建立不同狀態的教師申請記錄
   * @param userId 使用者 ID
   * @returns 不同狀態的教師申請記錄
   */
  static async createTeacherApplicationVariations(userId: number) {
    const pending = await this.createTeacherApplication(userId, {
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      application_status: ApplicationStatus.PENDING
    })

    const approved = await this.createTeacherApplication(userId + 100, {
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      user_id: userId + 100,
      application_status: ApplicationStatus.APPROVED,
      application_reviewed_at: new Date(),
      reviewer_id: 1,
      review_notes: '申請審核通過'
    })

    const rejected = await this.createTeacherApplication(userId + 200, {
      uuid: '550e8400-e29b-41d4-a716-446655440003',
      user_id: userId + 200,
      application_status: ApplicationStatus.REJECTED,
      application_reviewed_at: new Date(),
      reviewer_id: 1,
      review_notes: '申請資料不符合要求'
    })

    return { pending, approved, rejected }
  }

  /**
   * 更新教師申請狀態
   * @param teacherId 教師 ID
   * @param status 新狀態
   * @param reviewNotes 審核備註
   * @param reviewerId 審核者 ID
   */
  static async updateApplicationStatus(
    teacherId: number,
    status: ApplicationStatus,
    reviewNotes?: string,
    reviewerId?: number
  ) {
    const teacherRepository = dataSource.getRepository(Teacher)
    await teacherRepository.update(teacherId, {
      application_status: status,
      application_reviewed_at: new Date(),
      review_notes: reviewNotes,
      reviewer_id: reviewerId
    })
  }

  /**
   * 取得使用者的教師申請記錄
   * @param userId 使用者 ID
   * @returns 教師申請記錄
   */
  static async getTeacherApplicationByUserId(userId: number) {
    const teacherRepository = dataSource.getRepository(Teacher)
    return await teacherRepository.findOne({
      where: { user_id: userId }
    })
  }

  /**
   * 建立完整的教師申請測試環境
   * @param userData 使用者資料覆寫
   * @param teacherData 教師申請資料覆寫
   * @returns 使用者、教師申請記錄和認證 Token
   */
  static async createCompleteTeacherTestEnv(
    userData: Partial<TestUserCreateData> = {},
    teacherData: Partial<TestTeacherCreateData> = {}
  ) {
    const user = await UserTestHelpers.createUserEntity(userData)
    const teacher = await this.createTeacherApplication(user.id, teacherData)
    const authToken = UserTestHelpers.generateAuthToken(user)

    return {
      user,
      teacher,
      authToken
    }
  }
}

/**
 * HTTP 請求測試 Helper 函式
 */
class RequestTestHelpers {
  /**
   * 發送認證請求
   * @param method HTTP 方法
   * @param url 請求 URL
   * @param authToken 認證 Token
   * @param data 請求資料
   * @returns 請求回應
   */
  static async sendAuthenticatedRequest(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    authToken: string,
    data?: TestRequestData
  ) {
    const req = request(app)[method](url).set('Authorization', `Bearer ${authToken}`)
    
    if (data && (method === 'post' || method === 'put')) {
      req.send(data)
    }
    
    return req
  }

  /**
   * 測試認證失敗情境
   * @param method HTTP 方法
   * @param url 請求 URL
   * @param data 請求資料
   * @returns 401 錯誤回應
   */
  static async testUnauthenticatedRequest(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: TestRequestData
  ) {
    const req = request(app)[method](url)
    
    if (data && (method === 'post' || method === 'put')) {
      req.send(data)
    }
    
    return req.expect(401)
  }

  /**
   * 測試無效 Token 情境
   * @param method HTTP 方法
   * @param url 請求 URL
   * @param data 請求資料
   * @returns 401 錯誤回應
   */
  static async testInvalidTokenRequest(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: TestRequestData
  ) {
    const req = request(app)[method](url).set('Authorization', 'Bearer invalid-token')
    
    if (data && (method === 'post' || method === 'put')) {
      req.send(data)
    }
    
    return req.expect(401)
  }
}

/**
 * 測試資料驗證 Helper 函式
 */
class ValidationTestHelpers {
  /**
   * 驗證 API 回應格式
   * @param response HTTP 回應
   * @param expectedStructure 預期結構
   */
  static expectResponseStructure(response: request.Response, expectedStructure: TestValidationStructure) {
    expect(response.body).toMatchObject(expectedStructure)
  }

  /**
   * 驗證資料庫記錄存在
   * @param repository TypeORM Repository
   * @param condition 查詢條件
   * @returns 查詢結果
   */
  static async expectDatabaseRecord<T>(
    repository: { findOne: (condition: DatabaseQueryCondition) => Promise<T | null> },
    condition: DatabaseQueryCondition
  ): Promise<T> {
    const record = await repository.findOne(condition)
    expect(record).toBeTruthy()
    return record as T
  }

  /**
   * 驗證資料庫記錄不存在
   * @param repository TypeORM Repository
   * @param condition 查詢條件
   */
  static async expectNoDatabaseRecord(
    repository: { findOne: (condition: DatabaseQueryCondition) => Promise<unknown | null> }, 
    condition: DatabaseQueryCondition
  ) {
    const record = await repository.findOne(condition)
    expect(record).toBeNull()
  }

  /**
   * 驗證陣列包含特定錯誤訊息
   * @param errorArray 錯誤訊息陣列
   * @param expectedMessage 預期錯誤訊息（部分匹配）
   */
  static expectErrorMessage(errorArray: string[], expectedMessage: string) {
    expect(errorArray).toEqual(
      expect.arrayContaining([
        expect.stringContaining(expectedMessage)
      ])
    )
  }
}

/**
 * 效能測試 Helper 函式
 */
class PerformanceTestHelpers {
  /**
   * 測量 API 回應時間
   * @param apiCall API 呼叫函式
   * @param maxResponseTime 最大允許回應時間（毫秒）
   */
  static async measureResponseTime(
    apiCall: () => Promise<request.Response>,
    maxResponseTime: number = 1000
  ) {
    const startTime = Date.now()
    const response = await apiCall()
    const responseTime = Date.now() - startTime

    expect(responseTime).toBeLessThan(maxResponseTime)
    return { response, responseTime }
  }

  /**
   * 批次執行測試（平行處理測試）
   * @param testFunctions 測試函式陣列
   * @param maxConcurrent 最大平行執行數
   */
  static async runConcurrentTests(
    testFunctions: TestFunction[],
    maxConcurrent: number = 5
  ) {
    const results = []
    
    for (let i = 0; i < testFunctions.length; i += maxConcurrent) {
      const batch = testFunctions.slice(i, i + maxConcurrent)
      const batchResults = await Promise.all(batch.map(fn => fn()))
      results.push(...batchResults)
    }
    
    return results
  }
}

// 匯出所有 Helper 類別
export {
  UserTestHelpers,
  TeacherTestHelpers,
  RequestTestHelpers,
  ValidationTestHelpers,
  PerformanceTestHelpers
}

// 預設匯出常用 Helper 函式
export default {
  UserTestHelpers,
  TeacherTestHelpers,
  RequestTestHelpers,
  ValidationTestHelpers,
  PerformanceTestHelpers
}