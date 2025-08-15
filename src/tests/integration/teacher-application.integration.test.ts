import request from 'supertest'
import { DataSource } from 'typeorm'
import app from '../../app'
import { initTestDatabase, clearDatabase } from '../helpers/database'
import { dataSource } from '../../db/data-source'
import { User } from '../../entities/User'
import { Teacher } from '../../entities/Teacher'
import { UserRole, AccountStatus, ApplicationStatus } from '../../entities/enums'
import jwt from 'jsonwebtoken'
import ConfigManager from '../../config'

// 使用新的 fixtures 和 helper
import {
  validTeacherApplicationData,
  invalidTeacherApplicationData,
  teacherApplicationTestScenarios,
  expectedResponseStructures,
  validIntroductions,
  jwtTestUsers
} from '../fixtures/teacherFixtures'
import {
  UserTestHelpers,
  TeacherTestHelpers,
  RequestTestHelpers,
  ValidationTestHelpers
} from '../helpers/testHelpers'

describe('教師申請 API 整合測試', () => {
  let connection: DataSource
  let testUser: User
  let authToken: string

  beforeAll(async () => {
    await initTestDatabase()
    connection = dataSource
  })

  afterAll(async () => {
    if (connection.isInitialized) {
      await connection.destroy()
    }
  })

  beforeEach(async () => {
    // 清理測試資料
    await clearDatabase()

    // 使用 UserTestHelpers 建立測試使用者
    testUser = await UserTestHelpers.createUserEntity()
    authToken = UserTestHelpers.generateAuthToken(testUser)
  })

  describe('POST /api/teachers/apply', () => {
    it('應該成功建立教師申請並回傳 201 狀態', async () => {
      // Arrange - 使用 fixtures 中的測試資料
      const applicationData = validTeacherApplicationData.basic

      // Act
      const response = await request(app)
        .post('/api/teachers/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)

      // Debug - 顯示實際回應
      if (response.status !== 201) {
        console.log('實際回應狀態:', response.status)
        console.log('實際回應內容:', JSON.stringify(response.body, null, 2))
      }

      // Assert - 使用 ValidationTestHelpers 驗證回應結構
      expect(response.status).toBe(201)
      ValidationTestHelpers.expectResponseStructure(
        response, 
        expectedResponseStructures.successfulApplicationResponse
      )

      // 驗證資料庫記錄
      await ValidationTestHelpers.expectDatabaseRecord(
        connection.getRepository(Teacher),
        { where: { user_id: testUser.id } }
      )
    })

    it('應該拒絕重複申請並回傳 409 錯誤', async () => {
      // Arrange - 使用 TeacherTestHelpers 先建立一個申請
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.existing,
        application_status: ApplicationStatus.PENDING
      })

      const applicationData = validTeacherApplicationData.japanese

      // Act
      const response = await request(app)
        .post('/api/teachers/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send(applicationData)

      // Debug
      if (response.status !== 409) {
        console.log('重複申請實際回應狀態:', response.status)
        console.log('重複申請實際回應內容:', JSON.stringify(response.body, null, 2))
      }

      // Assert - 使用預期的回應結構
      expect(response.status).toBe(409)
      ValidationTestHelpers.expectResponseStructure(
        response, 
        expectedResponseStructures.duplicateApplicationResponse
      )
    })

    it('應該拒絕無效的國籍並回傳 400 錯誤', async () => {
      // Arrange - 使用 fixtures 中的無效資料
      const invalidData = invalidTeacherApplicationData.emptyNationality

      // Act
      const response = await request(app)
        .post('/api/teachers/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      ValidationTestHelpers.expectResponseStructure(
        response, 
        expectedResponseStructures.validationErrorResponse
      )
    })

    it('應該拒絕過短的自我介紹並回傳 400 錯誤', async () => {
      // Arrange - 使用 fixtures 中的過短介紹
      const invalidData = invalidTeacherApplicationData.shortIntroduction

      // Act
      const response = await request(app)
        .post('/api/teachers/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '參數驗證失敗',
        errors: {
          introduction: expect.arrayContaining([
            "自我介紹至少需要100字元"
          ])
        }
      })
    })

    it('應該拒絕過長的自我介紹並回傳 400 錯誤', async () => {
      // Arrange - 使用 fixtures 中的過長介紹
      const invalidData = invalidTeacherApplicationData.longIntroduction

      // Act
      const response = await request(app)
        .post('/api/teachers/apply')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '參數驗證失敗',
        errors: {
          introduction: expect.arrayContaining([
            expect.stringContaining('最多1000字元')
          ])
        }
      })
    })

    it('應該拒絕未認證的請求並回傳 401 錯誤', async () => {
      // Arrange - 使用有效的申請資料
      const applicationData = validTeacherApplicationData.basic

      // Act - 使用 RequestTestHelpers 測試未認證請求
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'post', 
        '/api/teachers/apply', 
        applicationData
      )

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Access token 為必填欄位'
      })
    })

    it('應該拒絕非學生角色的申請並回傳 403 錯誤', async () => {
      // Arrange - 使用 UserTestHelpers 建立教師角色使用者
      const teacherUser = await UserTestHelpers.createTeacherUserEntity()
      const teacherAuthToken = UserTestHelpers.generateAuthToken(teacherUser)

      const applicationData = validTeacherApplicationData.basic

      // Act
      const response = await request(app)
        .post('/api/teachers/apply')
        .set('Authorization', `Bearer ${teacherAuthToken}`)
        .send(applicationData)

      // Debug
      if (response.status !== 403) {
        console.log('非學生角色實際回應狀態:', response.status)
        console.log('非學生角色實際回應內容:', JSON.stringify(response.body, null, 2))
      }

      // Assert
      expect(response.status).toBe(403)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '只有學生可以申請成為教師'
      })
    })

    it('應該拒絕帳號狀態非活躍的申請並回傳 401 錯誤', async () => {
      // Arrange - 使用 UserTestHelpers 建立停用狀態使用者
      const suspendedUser = await UserTestHelpers.createSuspendedUserEntity()
      const suspendedAuthToken = UserTestHelpers.generateAuthToken(suspendedUser)

      const applicationData = validTeacherApplicationData.basic

      // Act
      const response = await request(app)
        .post('/api/teachers/apply')
        .set('Authorization', `Bearer ${suspendedAuthToken}`)
        .send(applicationData)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '帳號狀態異常'
      })
    })
  })

  describe('GET /api/teachers/application', () => {
    it('應該成功取得申請狀態並回傳 200', async () => {
      // Arrange - 使用 TeacherTestHelpers 建立申請記錄
      const teacher = await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.basic,
        application_status: ApplicationStatus.PENDING
      })

      // Act
      const response = await request(app)
        .get('/api/teachers/application')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(200)
      ValidationTestHelpers.expectResponseStructure(
        response,
        expectedResponseStructures.getApplicationSuccessResponse
      )
      
      // 驗證具體資料
      expect(response.body.data.teacher).toMatchObject({
        id: teacher.id,
        uuid: teacher.uuid,
        nationality: teacher.nationality,
        introduction: teacher.introduction,
        application_status: ApplicationStatus.PENDING
      })
    })

    it('應該在沒有申請記錄時回傳 404 錯誤', async () => {
      // Act
      const response = await request(app)
        .get('/api/teachers/application')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      ValidationTestHelpers.expectResponseStructure(
        response,
        expectedResponseStructures.noApplicationResponse
      )
    })
  })

  describe('PUT /api/teachers/application', () => {
    it('應該成功更新申請資料並回傳 200', async () => {
      // Arrange - 使用 TeacherTestHelpers 建立申請記錄
      const teacher = await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.original,
        application_status: ApplicationStatus.PENDING
      })

      const updateData = validTeacherApplicationData.updated

      // Act
      const response = await request(app)
        .put('/api/teachers/application')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      // Assert
      expect(response.status).toBe(200)
      ValidationTestHelpers.expectResponseStructure(
        response,
        expectedResponseStructures.updateApplicationSuccessResponse
      )

      // 驗證更新後的資料
      expect(response.body.data.teacher).toMatchObject({
        id: teacher.id,
        nationality: updateData.nationality,
        introduction: updateData.introduction
      })
    })

    it('應該拒絕在已通過狀態下的修改並回傳 400 錯誤', async () => {
      // Arrange - 建立已通過的申請記錄
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.APPROVED
      })

      const updateData = {
        nationality: '日本'
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/application')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '只能在待審核或已拒絕狀態下修改申請'
      })
    })
  })
})