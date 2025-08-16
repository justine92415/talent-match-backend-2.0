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
import { ERROR_MESSAGES } from '@constants/errorMessages'

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
      expect(response.body).toEqual({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: ERROR_MESSAGES.SYSTEM.TEACHER_APPLICATION_VALIDATION_FAILED,
        errors: expect.any(Object)
      })
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
        message: '教師申請參數驗證失敗',
        errors: {
          introduction: expect.arrayContaining([
            "自我介紹至少需要100個字元"
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
        message: '教師申請參數驗證失敗',
        errors: {
          introduction: expect.arrayContaining([
            "自我介紹長度不能超過1000個字元"
          ])
        }
      })
    })

    it('應該回傳 401 當未提供 token', async () => {
      const response = await request(app)
        .post('/api/teachers/apply')
        .send(validTeacherApplicationData.basic)
        .expect(401)

      expect(response.body.message).toEqual(
        expect.stringContaining(ERROR_MESSAGES.AUTH.TOKEN_REQUIRED)
      )
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
        message: ERROR_MESSAGES.BUSINESS.STUDENT_ONLY_APPLY_TEACHER
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
        code: 'ACCOUNT_SUSPENDED',
        message: ERROR_MESSAGES.BUSINESS.ACCOUNT_STATUS_INVALID
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
        message: ERROR_MESSAGES.BUSINESS.APPLICATION_STATUS_INVALID
      })
    })
  })

  describe('POST /api/teachers/resubmit', () => {
    it('應該成功重新提交被拒絕的申請並回傳 200 狀態', async () => {
      // Arrange - 建立被拒絕的申請記錄
      const rejectedApplication = await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.REJECTED,
        review_notes: '申請資料不完整',
        reviewer_id: 1,
        application_reviewed_at: new Date()
      })

      // Act
      const response = await request(app)
        .post('/api/teachers/resubmit')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        status: 'success',
        message: '申請已重新提交',
        data: {
          teacher: {
            id: rejectedApplication.id,
            uuid: expect.any(String),
            application_status: ApplicationStatus.PENDING,
            application_submitted_at: expect.any(String),
            application_reviewed_at: null,
            reviewer_id: null,
            review_notes: null,
            updated_at: expect.any(String)
          }
        }
      })

      // 驗證回應中的資料已重置
      expect(response.body.data.teacher.application_reviewed_at).toBeNull()
      expect(response.body.data.teacher.reviewer_id).toBeNull()
      expect(response.body.data.teacher.review_notes).toBeNull()

      // 驗證資料庫狀態已重置（檢查申請狀態）
      const updatedTeacher = await connection.getRepository(Teacher).findOne({
        where: { id: rejectedApplication.id }
      })
      expect(updatedTeacher).toBeTruthy()
      expect(updatedTeacher!.application_status).toBe(ApplicationStatus.PENDING)
    })

    it('應該拒絕重新提交非拒絕狀態的申請並回傳 400 錯誤', async () => {
      // Arrange - 建立待審核的申請記錄
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.PENDING
      })

      // Act
      const response = await request(app)
        .post('/api/teachers/resubmit')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '此申請無法重新提交，請檢查申請狀態'
      })
    })

    it('應該拒絕重新提交已通過的申請並回傳 400 錯誤', async () => {
      // Arrange - 建立已通過的申請記錄
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.APPROVED
      })

      // Act
      const response = await request(app)
        .post('/api/teachers/resubmit')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '此申請無法重新提交，請檢查申請狀態'
      })
    })

    it('應該在沒有申請記錄時回傳 404 錯誤', async () => {
      // Act - 未建立任何申請記錄就嘗試重新提交
      const response = await request(app)
        .post('/api/teachers/resubmit')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '找不到教師申請記錄'
      })
    })

    it('應該拒絕未認證的重新提交請求並回傳 401 錯誤', async () => {
      // Act - 未提供認證令牌
      const response = await request(app)
        .post('/api/teachers/resubmit')

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Access token 為必填欄位'
      })
    })
  })

  describe('GET /api/teachers/profile', () => {
    it('應該成功取得教師基本資料並回傳 200', async () => {
      // Arrange - 建立已通過審核的教師
      const approvedTeacher = await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.APPROVED,
        application_reviewed_at: new Date(),
        reviewer_id: 1
      })

      // Act
      const response = await request(app)
        .get('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        status: 'success',
        message: '取得教師資料成功',
        data: {
          teacher: {
            id: approvedTeacher.id,
            uuid: expect.any(String),
            user_id: testUser.id,
            nationality: '台灣',
            introduction: validIntroductions.detailed,
            application_status: ApplicationStatus.APPROVED,
            application_submitted_at: null,
            application_reviewed_at: expect.any(String),
            reviewer_id: 1,
            review_notes: null,
            total_students: expect.any(Number),
            total_courses: expect.any(Number),
            average_rating: expect.any(String), // Decimal 會序列化為字串
            total_earnings: expect.any(String), // Decimal 會序列化為字串
            created_at: expect.any(String),
            updated_at: expect.any(String)
          }
        }
      })
    })

    it('應該拒絕未通過審核的教師取得資料並回傳 404', async () => {
      // Arrange - 建立待審核的教師申請
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.PENDING
      })

      // Act
      const response = await request(app)
        .get('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '找不到教師記錄'
      })
    })

    it('應該在沒有教師記錄時回傳 404 錯誤', async () => {
      // Act - 未建立任何教師記錄
      const response = await request(app)
        .get('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '找不到教師記錄'
      })
    })

    it('應該拒絕未認證的請求並回傳 401 錯誤', async () => {
      // Act
      const response = await request(app)
        .get('/api/teachers/profile')

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Access token 為必填欄位'
      })
    })
  })

  describe('PUT /api/teachers/profile', () => {
    it('應該成功更新教師資料並觸發重新審核', async () => {
      // Arrange - 建立已通過審核的教師
      const approvedTeacher = await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.original,
        application_status: ApplicationStatus.APPROVED,
        application_reviewed_at: new Date(),
        reviewer_id: 1
      })

      const updateData = {
        nationality: '日本',
        introduction: validIntroductions.profileUpdate
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        status: 'success',
        message: '教師資料更新成功',
        data: {
          teacher: {
            id: approvedTeacher.id,
            nationality: '日本',
            introduction: validIntroductions.profileUpdate,
            application_status: ApplicationStatus.PENDING,
            updated_at: expect.any(String)
          },
          notice: '由於修改了重要資料，需要重新審核'
        }
      })
    })

    it('應該支援部分更新教師資料', async () => {
      // Arrange - 建立已通過審核的教師
      const approvedTeacher = await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.APPROVED,
        application_reviewed_at: new Date(),
        reviewer_id: 1
      })

      const updateData = {
        nationality: '美國'
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject({
        status: 'success',
        message: '教師資料更新成功',
        data: {
          teacher: {
            id: approvedTeacher.id,
            nationality: '美國',
            introduction: validIntroductions.detailed, // 保持原有介紹
            application_status: ApplicationStatus.PENDING,
            updated_at: expect.any(String)
          }
        }
      })
    })

    it('應該拒絕未通過審核的教師更新資料並回傳 404', async () => {
      // Arrange - 建立待審核的教師申請
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.PENDING
      })

      const updateData = {
        nationality: '日本'
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '找不到教師記錄'
      })
    })

    it('應該在沒有教師記錄時回傳 404 錯誤', async () => {
      // Arrange
      const updateData = {
        nationality: '日本'
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '找不到教師記錄'
      })
    })

    it('應該拒絕無效的國籍資料並回傳 400 錯誤', async () => {
      // Arrange - 建立已通過審核的教師
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.APPROVED
      })

      const invalidData = {
        nationality: '' // 空白國籍
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '教師資料更新參數驗證失敗',
        errors: expect.any(Object)
      })
    })

    it('應該拒絕過短的自我介紹並回傳 400 錯誤', async () => {
      // Arrange - 建立已通過審核的教師
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.APPROVED
      })

      const invalidData = {
        introduction: '太短了' // 少於100字
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '教師資料更新參數驗證失敗',
        errors: {
          introduction: expect.arrayContaining([
            "自我介紹至少需要100個字元"
          ])
        }
      })
    })

    it('應該拒絕過長的自我介紹並回傳 400 錯誤', async () => {
      // Arrange - 建立已通過審核的教師
      await TeacherTestHelpers.createTeacherApplication(testUser.id, {
        nationality: '台灣',
        introduction: validIntroductions.detailed,
        application_status: ApplicationStatus.APPROVED
      })

      const invalidData = {
        introduction: 'A'.repeat(1001) // 超過1000字
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)

      // Assert
      expect(response.status).toBe(400)
      expect(response.body).toMatchObject({
        status: 'error',
        message: '教師資料更新參數驗證失敗',
        errors: {
          introduction: expect.arrayContaining([
            "自我介紹長度不能超過1000個字元"
          ])
        }
      })
    })

    it('應該拒絕未認證的請求並回傳 401 錯誤', async () => {
      // Arrange
      const updateData = {
        nationality: '日本'
      }

      // Act
      const response = await request(app)
        .put('/api/teachers/profile')
        .send(updateData)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body).toMatchObject({
        status: 'error',
        message: 'Access token 為必填欄位'
      })
    })
  })
})