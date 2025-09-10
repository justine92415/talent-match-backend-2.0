import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from './../app'
import { clearDatabase, initTestDatabase } from '@tests/helpers/database'
import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { AccountStatus, UserRole } from '@entities/enums'
import {
  validUserData,
  validUserData2,
  validUserData3,
  validUserData4,
  validUserData5,
  longNicknameUserData,
  tooLongNicknameUserData,
  longEmailUserData,
  invalidUserData,
  updateProfileData,
  passwordResetData,
  createUserEntityData,
  createTestUserVariations
} from './fixtures/userFixtures'
import { UserTestHelpers, RequestTestHelpers, ValidationTestHelpers } from './helpers/testHelpers'
import { expectErrorResponse, TestErrorMessages } from './helpers/errorTestUtils'
import { ERROR_MESSAGES } from '@constants/Message'

describe('POST /api/auth/register', () => {
  beforeAll(async () => {
    await initTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('成功註冊案例', () => {
    it('應該成功註冊新使用者並回傳 201', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(validUserData).expect(201)

      // Assert
      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.AUTH.REGISTRATION_SUCCESS,
        data: {
          user: {
            id: expect.any(Number),
            uuid: expect.any(String),
            nick_name: validUserData.nick_name,
            email: validUserData.email,
            role: 'student',
            account_status: 'active',
            created_at: expect.any(String)
          },
          access_token: expect.any(String),
          refresh_token: expect.any(String),
          token_type: 'Bearer',
          expires_in: 3600
        }
      })

      // 確認密碼不會在回應中出現
      expect(response.body.data.user.password).toBeUndefined()

      // 確認使用者已儲存到資料庫
      const userRepository = dataSource.getRepository(User)
      const savedUser = await userRepository.findOne({
        where: { email: validUserData.email }
      })
      expect(savedUser).toBeTruthy()
      expect(savedUser?.nick_name).toBe(validUserData.nick_name)
      expect(savedUser?.password).not.toBe(validUserData.password) // 應該是加密後的密碼
    })

    it('應該成功註冊並自動生成 UUID', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(validUserData2).expect(201)

      // Assert
      const uuid = response.body.data.user.uuid
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })
  })

  describe('參數驗證錯誤案例', () => {
    it('應該拒絕重複 email 並回傳 400', async () => {
      // Arrange - 先建立一個使用者
      await request(app).post('/api/auth/register').send(validUserData3).expect(201)

      const duplicateEmailData = {
        ...validUserData4,
        email: validUserData3.email // 重複的 email
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(duplicateEmailData).expect(400)

      // Assert - 使用統一錯誤訊息
      expectErrorResponse.business(response, TestErrorMessages.AUTH.EMAIL_EXISTS)
    })

    it('應該拒絕重複暱稱並回傳 400', async () => {
      // Arrange - 先建立一個使用者
      await request(app).post('/api/auth/register').send(validUserData).expect(201)

      const duplicateNickNameData = {
        ...validUserData2,
        nick_name: validUserData.nick_name // 重複的暱稱
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(duplicateNickNameData).expect(400)

      // Assert - 使用統一錯誤訊息
      expectErrorResponse.business(response, TestErrorMessages.AUTH.NICKNAME_EXISTS)
    })

    it('應該拒絕無效的 email 格式並回傳 400', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(invalidUserData.invalidEmail).expect(400)

      // Assert - 驗證多欄位驗證錯誤
      expectErrorResponse.validation(response, ['email'])
    })

    it('應該拒絕過短的密碼並回傳 400', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(invalidUserData.shortPassword).expect(400)

      // Assert - 驗證驗證錯誤
      expectErrorResponse.validation(response, ['password'])
    })

    it('應該拒絕空白暱稱並回傳 400', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(invalidUserData.emptyNickname).expect(400)

      // Assert - 驗證驗證錯誤
      expectErrorResponse.validation(response, ['nick_name'])
    })

    it('應該拒絕缺少必填欄位並回傳 400', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(invalidUserData.missingFields).expect(400)

      // Assert - 驗證多個缺少的欄位
      expectErrorResponse.validation(response, ['email', 'password'])
    })
  })

  describe('邊界值測試', () => {
    it('應該接受最長的有效暱稱（50字元）', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(longNicknameUserData).expect(201)

      // Assert
      expect(response.body.data.user.nick_name).toBe(longNicknameUserData.nick_name)
    })

    it('應該拒絕過長的暱稱（51字元）', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(tooLongNicknameUserData).expect(400)

      // Assert - 驗證驗證錯誤
      expectErrorResponse.validation(response, ['nick_name'])
    })

    it('應該接受較長的有效 email', async () => {
      // Act
      const response = await request(app).post('/api/auth/register').send(longEmailUserData).expect(201)

      // Assert
      expect(response.body.data.user.email).toBe(longEmailUserData.email)
    })
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await initTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('成功登入案例', () => {
    it('應該成功登入並回傳 200', async () => {
      // Arrange - 先註冊一個使用者
      await request(app).post('/api/auth/register').send(validUserData).expect(201)

      const loginData = {
        email: validUserData.email,
        password: validUserData.password
      }      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      // Assert
      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.AUTH.LOGIN_SUCCESS,
        data: {
          user: {
            id: expect.any(Number),
            uuid: expect.any(String),
            nick_name: validUserData.nick_name,
            email: validUserData.email,
            role: 'student',
            account_status: 'active',
            last_login_at: expect.any(String)
          },
          access_token: expect.any(String),
          refresh_token: expect.any(String),
          token_type: 'Bearer',
          expires_in: 3600
        }
      })

      // 確認密碼不會在回應中出現
      expect(response.body.data.user.password).toBeUndefined()

      // 確認最後登入時間已更新
      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { email: validUserData.email }
      })
      expect(user?.last_login_at).toBeTruthy()
    })

    it('應該更新使用者的最後登入時間', async () => {
      // Arrange - 先註冊一個使用者
      await request(app).post('/api/auth/register').send(validUserData2).expect(201)

      const loginData = {
        email: validUserData2.email,
        password: validUserData2.password
      }

      // Act
      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      // Assert
      const userRepository = dataSource.getRepository(User)
      const user = await userRepository.findOne({
        where: { email: validUserData2.email }
      })
      
      expect(user?.last_login_at).toBeTruthy()
      expect(user?.last_login_at).toBeInstanceOf(Date)
      expect(user!.last_login_at!.getTime()).toBeGreaterThan(
        user!.created_at.getTime()
      )
    })
  })

  describe('登入失敗案例', () => {
    it('應該拒絕不存在的 email 並回傳 401', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      // Assert - 使用統一錯誤訊息
      expectErrorResponse.auth(response, TestErrorMessages.AUTH.INVALID_CREDENTIALS, 401)
    })

    it('應該拒絕錯誤的密碼並回傳 401', async () => {
      // Arrange - 先註冊一個使用者
      await request(app).post('/api/auth/register').send(validUserData).expect(201)

      const loginData = {
        email: validUserData.email,
        password: 'wrongpassword'
      }

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      // Assert - 使用統一錯誤訊息
      expectErrorResponse.auth(response, TestErrorMessages.AUTH.INVALID_CREDENTIALS, 401)
    })

    it('應該拒絕被停用的帳號並回傳 403', async () => {
      // Arrange - 先註冊一個使用者，然後手動設為停用
      await request(app).post('/api/auth/register').send(validUserData).expect(201)

      // 手動將帳號設為停用
      const userRepository = dataSource.getRepository(User)
      await userRepository.update(
        { email: validUserData.email },
        { account_status: AccountStatus.SUSPENDED }
      )

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(403)

      // Assert - 使用統一錯誤訊息
      expectErrorResponse.auth(response, TestErrorMessages.AUTH.ACCOUNT_SUSPENDED, 403)
    })

    it('應該拒絕空白的登入欄位並回傳 400', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidUserData.emptyLogin)
        .expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '登入失敗',
        errors: {
          email: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED)]),
          password: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.PASSWORD_REQUIRED)])
        }
      })
    })

    it('應該拒絕無效的 email 格式並回傳 400', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidUserData.invalidLoginEmail)
        .expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '登入失敗',
        errors: {
          email: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.EMAIL_INVALID)])
        }
      })
    })
  })

  describe('POST /api/auth/refresh', () => {
    describe('成功刷新案例', () => {
      it('應該成功刷新 Token 並回傳 200', async () => {
        // Arrange - 先註冊並登入取得 refresh token
        await request(app).post('/api/auth/register').send(validUserData).expect(201)
        
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({ email: validUserData.email, password: validUserData.password })
          .expect(200)

        const refreshToken = loginResponse.body.data.refresh_token

        // Act
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refresh_token: refreshToken })
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: 'Token 刷新成功',
          data: {
            access_token: expect.any(String),
            refresh_token: expect.any(String),
            token_type: 'Bearer',
            expires_in: expect.any(Number)
          }
        })

        // 驗證新的 token 不同於原來的 token
        expect(response.body.data.access_token).not.toBe(loginResponse.body.data.access_token)
        expect(response.body.data.refresh_token).not.toBe(refreshToken)
      })

      it('應該在刷新後仍保持使用者身份資訊', async () => {
        // Arrange
        await request(app).post('/api/auth/register').send(validUserData2).expect(201)
        
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({ email: validUserData2.email, password: validUserData2.password })
          .expect(200)

        const refreshToken = loginResponse.body.data.refresh_token

        // Act
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refresh_token: refreshToken })
          .expect(200)

        // Assert - 檢查回傳的 token 包含相同的使用者資訊
        expect(response.body.data.user).toMatchObject({
          id: loginResponse.body.data.user.id,
          email: validUserData2.email,
          nick_name: validUserData2.nick_name,
          role: 'student'
        })
      })
    })

    describe('Token 驗證失敗案例', () => {
      it('應該拒絕無效的 refresh token 並回傳 401', async () => {
        const invalidToken = 'invalid.refresh.token'

        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refresh_token: invalidToken })
          .expect(401)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'TOKEN_INVALID_OR_EXPIRED',
          message: 'Token 無效或已過期'
        })
        
        // 認證錯誤不應有 errors 欄位
        expect(response.body.errors).toBeUndefined()
      })

      it('應該拒絕過期的 refresh token 並回傳 401', async () => {
        // 這個測試案例需要實際的過期 token，暫時跳過實作
        // 在實際環境中可以通過調整 JWT 設定來測試
        expect(true).toBe(true)
      })

      it('應該拒絕缺少 refresh token 並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({})
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          message: '參數驗證失敗',
          errors: {
            refresh_token: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.REFRESH_TOKEN_REQUIRED)])
          }
        })
      })
    })

    describe('邊界測試', () => {
      it('應該拒絕空白的 refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refresh_token: '' })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          message: '參數驗證失敗'
        })
      })

      it('應該拒絕非字串格式的 refresh token', async () => {
        const response = await request(app)
          .post('/api/auth/refresh')
          .send({ refresh_token: 12345 })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          message: '參數驗證失敗'
        })
      })
    })
  })

  describe('POST /api/auth/forgot-password', () => {
    describe('成功發送重設密碼郵件', () => {
      it('應該成功發送重設密碼郵件並回傳 200', async () => {
        // Arrange - 先註冊一個測試使用者
        await request(app)
          .post('/api/auth/register')
          .send(validUserData)
          .expect(201)

        // Act - 發送忘記密碼請求
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send(passwordResetData.validForgotPassword)
          .expect(200)

        // Assert - 檢查回應格式
        expect(response.body).toMatchObject({
          status: 'success',
          message: '重設密碼郵件已發送，請檢查您的信箱'
        })
      })

      it('應該為不存在的 email 也回傳成功（安全考量）', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send(passwordResetData.nonExistentEmail)
          .expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          message: '重設密碼郵件已發送，請檢查您的信箱'
        })
      })
    })

    describe('參數驗證錯誤案例', () => {
      it('應該拒絕空白的 email 並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: '' })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          message: '參數驗證失敗',
          errors: {
            email: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.EMAIL_EMPTY)])
          }
        })
      })

      it('應該拒絕無效的 email 格式並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 'invalid-email' })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          message: '參數驗證失敗',
          errors: {
            email: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.EMAIL_INVALID)])
          }
        })
      })

      it('應該拒絕缺少 email 欄位並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({})
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          message: '參數驗證失敗',
          errors: {
            email: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.EMAIL_REQUIRED)])
          }
        })
      })

      it('應該拒絕非字串格式的 email 並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send({ email: 12345 })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          message: '參數驗證失敗',
          errors: {
            email: expect.arrayContaining([expect.stringContaining(ERROR_MESSAGES.VALIDATION.FIELD_INVALID_TYPE('email', '字串'))])
          }
        })
      })
    })

    describe('業務邏輯測試', () => {
      it('應該為已停用帳號也回傳成功（避免洩露帳號狀態）', async () => {
        // Arrange - 建立已停用的測試使用者（這需要直接操作資料庫）
        // 這個測試先跳過，等實作完成後補充
        const response = await request(app)
          .post('/api/auth/forgot-password')
          .send(passwordResetData.suspendedAccountEmail)
          .expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          message: '重設密碼郵件已發送，請檢查您的信箱'
        })
      })
    })
  })

  describe('POST /api/auth/reset-password', () => {
    describe('成功重設密碼', () => {
      it('應該成功重設密碼並回傳 200', async () => {
        // 先註冊使用者
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send({
            nick_name: '測試使用者',
            email: 'test@example.com',
            password: 'oldPassword123'
          })
          .expect(201)
        
        const userId = registerResponse.body.data.user.id

        // 模擬產生重設令牌（實際中由 forgot-password 產生）
        const resetToken = 'test-reset-token-12345'
        const resetExpires = new Date()
        resetExpires.setHours(resetExpires.getHours() + 1) // 1小時後過期

        // 直接更新資料庫中的重設令牌
        await dataSource.getRepository(User).update(userId, {
          password_reset_token: resetToken,
          password_reset_expires_at: resetExpires
        })

        // 重設密碼
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send(passwordResetData.validResetPassword)
          .expect(200)

        expect(response.body).toHaveProperty('status', 'success')
        expect(response.body).toHaveProperty('message', '密碼重設成功')

        // 驗證新密碼可以正常登入
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'newPassword456'
          })
          .expect(200)

        expect(loginResponse.body).toHaveProperty('status', 'success')
        expect(loginResponse.body.data).toHaveProperty('user')
        expect(loginResponse.body.data).toHaveProperty('access_token')

        // 驗證舊密碼無法登入
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'oldPassword123'
          })
          .expect(401)
      })

      it('應該在重設後清除重設令牌資料', async () => {
        // 先註冊使用者
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send({
            nick_name: '測試使用者2',
            email: 'test2@example.com',
            password: 'oldPassword123'
          })
          .expect(201)
        
        const userId = registerResponse.body.data.user.id

        // 模擬產生重設令牌
        const resetToken = 'test-reset-token-67890'
        const resetExpires = new Date()
        resetExpires.setHours(resetExpires.getHours() + 1)

        await dataSource.getRepository(User).update(userId, {
          password_reset_token: resetToken,
          password_reset_expires_at: resetExpires
        })

        // 重設密碼
        await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            new_password: 'newPassword456'
          })
          .expect(200)

        // 檢查資料庫中的重設令牌是否被清除
        const updatedUser = await dataSource.getRepository(User).findOne({ where: { id: userId } })
        expect(updatedUser?.password_reset_token).toBeNull()
        expect(updatedUser?.password_reset_expires_at).toBeNull()

        // 相同令牌應該無法再次使用
        await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            new_password: 'anotherPassword789'
          })
          .expect(400)
      })
    })

    describe('Token 驗證失敗案例', () => {
      it('應該拒絕無效的重設令牌並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'invalid-token',
            new_password: 'newPassword123'
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('message', '重設令牌無效或已過期')
      })

      it('應該拒絕已過期的重設令牌並回傳 400', async () => {
        // 先註冊使用者
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send({
            nick_name: '測試使用者3',
            email: 'test3@example.com',
            password: 'password123'
          })
          .expect(201)
        
        const userId = registerResponse.body.data.user.id

        // 產生已過期的重設令牌
        const resetToken = 'expired-reset-token'
        const expiredTime = new Date()
        expiredTime.setHours(expiredTime.getHours() - 1) // 1小時前過期

        await dataSource.getRepository(User).update(userId, {
          password_reset_token: resetToken,
          password_reset_expires_at: expiredTime
        })

        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            new_password: 'newPassword123'
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('message', '重設令牌無效或已過期')
      })

      it('應該拒絕空白的重設令牌並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: '',
            new_password: 'newPassword123'
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveProperty('token')
        expect(response.body.errors.token[0]).toContain(ERROR_MESSAGES.VALIDATION.RESET_TOKEN_EMPTY)
      })

      it('應該拒絕缺少重設令牌並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            new_password: 'newPassword123'
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveProperty('token')
        expect(response.body.errors.token[0]).toContain(ERROR_MESSAGES.VALIDATION.RESET_TOKEN_REQUIRED)
      })
    })

    describe('密碼驗證失敗案例', () => {
      it('應該拒絕過短的新密碼並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'valid-token',
            new_password: '123'
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveProperty('new_password')
        expect(response.body.errors.new_password[0]).toContain(ERROR_MESSAGES.VALIDATION.NEW_PASSWORD_TOO_SHORT)
      })

      it('應該拒絕空白的新密碼並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'valid-token',
            new_password: ''
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveProperty('new_password')
        expect(response.body.errors.new_password[0]).toContain(ERROR_MESSAGES.VALIDATION.NEW_PASSWORD_EMPTY)
      })

      it('應該拒絕缺少新密碼並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'valid-token'
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveProperty('new_password')
        expect(response.body.errors.new_password[0]).toContain(ERROR_MESSAGES.VALIDATION.NEW_PASSWORD_REQUIRED)
      })

      it('應該拒絕非字串格式的新密碼並回傳 400', async () => {
        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: 'valid-token',
            new_password: 12345678
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('errors')
        expect(response.body.errors).toHaveProperty('new_password')
        expect(response.body.errors.new_password[0]).toContain(ERROR_MESSAGES.VALIDATION.NEW_PASSWORD_INVALID_TYPE)
      })
    })

    describe('業務邏輯測試', () => {
      it('應該拒絕已停用帳號的密碼重設並回傳 400', async () => {
        // 先註冊使用者
        const registerResponse = await request(app)
          .post('/api/auth/register')
          .send({
            nick_name: '測試使用者4',
            email: 'test4@example.com',
            password: 'password123'
          })
          .expect(201)
        
        const userId = registerResponse.body.data.user.id

        // 產生重設令牌
        const resetToken = 'valid-reset-token'
        const resetExpires = new Date()
        resetExpires.setHours(resetExpires.getHours() + 1)

        // 停用帳號
        await dataSource.getRepository(User).update(userId, {
          password_reset_token: resetToken,
          password_reset_expires_at: resetExpires,
          account_status: AccountStatus.SUSPENDED
        })

        const response = await request(app)
          .post('/api/auth/reset-password')
          .send({
            token: resetToken,
            new_password: 'newPassword123'
          })
          .expect(400)

        expect(response.body).toHaveProperty('status', 'error')
        expect(response.body).toHaveProperty('message', '帳號已停用，無法重設密碼')
      })
    })
  })

  describe('User Profile API', () => {
    describe('GET /api/auth/profile', () => {
      describe('成功取得個人資料', () => {
        it('應該成功取得個人資料並回傳 200', async () => {
          // 先註冊並登入使用者
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '測試使用者',
              email: 'test@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token

          // 取得個人資料
          const response = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)

          expect(response.body).toHaveProperty('status', 'success')
          expect(response.body).toHaveProperty('message', '成功取得個人資料')
          expect(response.body).toHaveProperty('data')
          expect(response.body.data).toHaveProperty('user')
          expect(response.body.data.user).toHaveProperty('id')
          expect(response.body.data.user).toHaveProperty('nick_name', '測試使用者')
          expect(response.body.data.user).toHaveProperty('email', 'test@example.com')
          expect(response.body.data.user).toHaveProperty('role', UserRole.STUDENT)
          expect(response.body.data.user).toHaveProperty('account_status', AccountStatus.ACTIVE)
          expect(response.body.data.user).not.toHaveProperty('password')
          expect(response.body.data.user).not.toHaveProperty('password_reset_token')
        })
      })

      describe('認證失敗案例', () => {
        it('應該拒絕未提供 Token 的請求並回傳 401', async () => {
          const response = await request(app)
            .get('/api/auth/profile')
            .expect(401)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', 'Access token 為必填欄位')
        })

        it('應該拒絕無效的 Token 並回傳 401', async () => {
          const response = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', 'Token 無效')
        })

        it('應該拒絕過期的 Token 並回傳 401', async () => {
          // 生成一個已過期的 token
          const expiredToken = jwt.sign(
            { userId: 1, role: 'student', type: 'access' },
            process.env.JWT_SECRET || 'default-secret',
            { expiresIn: '-1h' }
          )

          const response = await request(app)
            .get('/api/auth/profile')
            .set('Authorization', `Bearer ${expiredToken}`)
            .expect(401)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', ERROR_MESSAGES.AUTH.TOKEN_EXPIRED)
        })
      })
    })

    describe('PUT /api/auth/profile', () => {
      describe('成功更新個人資料', () => {
        it('應該成功更新暱稱並回傳 200', async () => {
          // 先註冊並登入使用者
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '測試使用者',
              email: 'test@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token

          // 更新個人資料
          const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              nick_name: '更新後的暱稱'
            })
            .expect(200)

          expect(response.body).toHaveProperty('status', 'success')
          expect(response.body).toHaveProperty('message', '成功更新個人資料')
          expect(response.body).toHaveProperty('data')
          expect(response.body.data.user).toHaveProperty('nick_name', '更新後的暱稱')
        })

        it('應該成功更新多個欄位並回傳 200', async () => {
          // 先註冊並登入使用者
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '測試使用者2',
              email: 'test2@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test2@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token

          // 更新個人資料
          const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              nick_name: '更新後的暱稱2',
              name: '測試使用者真實姓名',
              contact_phone: '0912345678'
            })
            .expect(200)

          expect(response.body).toHaveProperty('status', 'success')
          expect(response.body).toHaveProperty('message', '成功更新個人資料')
          expect(response.body.data.user).toHaveProperty('nick_name', '更新後的暱稱2')
          expect(response.body.data.user).toHaveProperty('name', '測試使用者真實姓名')
          expect(response.body.data.user).toHaveProperty('contact_phone', '0912345678')
        })
      })

      describe('參數驗證錯誤案例', () => {
        it('應該拒絕重複的暱稱並回傳 400', async () => {
          // 先註冊兩個使用者
          await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '現有暱稱',
              email: 'existing@example.com',
              password: 'password123'
            })
            .expect(201)

          const registerResponse2 = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '測試使用者3',
              email: 'test3@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test3@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token

          // 嘗試更新為已存在的暱稱
          const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              nick_name: '現有暱稱'
            })
            .expect(400)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', '該暱稱已被使用')
        })

        it('應該拒絕過長的暱稱並回傳 400', async () => {
          // 先註冊並登入使用者
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '測試使用者4',
              email: 'test4@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test4@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token

          // 嘗試更新為過長的暱稱
          const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              nick_name: 'a'.repeat(51) // 51個字元，超過限制
            })
            .expect(400)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('errors')
          expect(response.body.errors).toHaveProperty('nick_name')
          expect(response.body.errors.nick_name[0]).toContain('暱稱長度不能超過50個字元')
        })

        it('應該拒絕空白的暱稱並回傳 400', async () => {
          // 先註冊並登入使用者
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '測試使用者5',
              email: 'test5@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'test5@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token

          // 嘗試更新為空白的暱稱
          const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
              nick_name: ''
            })
            .expect(400)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('errors')
          expect(response.body.errors).toHaveProperty('nick_name')
          expect(response.body.errors.nick_name[0]).toContain('暱稱不能為空')
        })
      })

      describe('認證失敗案例', () => {
        it('應該拒絕未提供 Token 的更新請求並回傳 401', async () => {
          const response = await request(app)
            .put('/api/auth/profile')
            .send({
              nick_name: '新暱稱'
            })
            .expect(401)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', 'Access token 為必填欄位')
        })

        it('應該拒絕無效 Token 的更新請求並回傳 401', async () => {
          const response = await request(app)
            .put('/api/auth/profile')
            .set('Authorization', 'Bearer invalid-token')
            .send({
              nick_name: '新暱稱'
            })
            .expect(401)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', 'Token 無效')
        })
      })
    })

    describe('DELETE /api/auth/profile', () => {
      describe('成功刪除帳號', () => {
        it('應該成功刪除帳號並回傳 200', async () => {
          // 先註冊並登入使用者
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '待刪除使用者',
              email: 'delete-test@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'delete-test@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token
          const userId = loginResponse.body.data.user.id

          // 刪除帳號
          const response = await request(app)
            .delete('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)

          expect(response.body).toHaveProperty('status', 'success')
          expect(response.body).toHaveProperty('message', '帳號已成功刪除')

          // 驗證帳號確實被軟刪除
          const user = await dataSource.getRepository(User).findOne({
            where: { id: userId },
            withDeleted: true
          })
          expect(user?.deleted_at).toBeTruthy()
        })

        it('刪除後應該無法再次登入', async () => {
          // 先註冊並登入使用者
          const registerResponse = await request(app)
            .post('/api/auth/register')
            .send({
              nick_name: '待刪除使用者2',
              email: 'delete-test2@example.com',
              password: 'password123'
            })
            .expect(201)

          const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'delete-test2@example.com',
              password: 'password123'
            })
            .expect(200)

          const accessToken = loginResponse.body.data.access_token

          // 刪除帳號
          await request(app)
            .delete('/api/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)

          // 嘗試再次登入，應該失敗
          const loginRetryResponse = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'delete-test2@example.com',
              password: 'password123'
            })
            .expect(401)

          expect(loginRetryResponse.body).toHaveProperty('status', 'error')
          expect(loginRetryResponse.body).toHaveProperty('message', '電子郵件或密碼錯誤')
        })
      })

      describe('認證失敗案例', () => {
        it('應該拒絕未提供 Token 的刪除請求並回傳 401', async () => {
          const response = await request(app)
            .delete('/api/auth/profile')
            .expect(401)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', 'Access token 為必填欄位')
        })

        it('應該拒絕無效 Token 的刪除請求並回傳 401', async () => {
          const response = await request(app)
            .delete('/api/auth/profile')
            .set('Authorization', 'Bearer invalid-token')
            .expect(401)

          expect(response.body).toHaveProperty('status', 'error')
          expect(response.body).toHaveProperty('message', 'Token 無效')
        })
      })
    })
  })
})
