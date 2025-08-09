import request from 'supertest'
import app from '../../../app'
import { clearDatabase, initTestDatabase, closeTestDatabase } from '../../helpers/database'
import { RegisterRequest } from '../../../types/auth'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

describe('Auth Refresh API', () => {
  beforeAll(async () => {
    // 初始化測試資料庫連線
    await initTestDatabase()
  }, 30000) // 增加超時時間

  afterAll(async () => {
    // 關閉資料庫連線
    await closeTestDatabase()
  }, 30000) // 增加超時時間

  beforeEach(async () => {
    await clearDatabase()
  }, 15000) // 增加超時時間

  describe('POST /api/auth/refresh', () => {
    let validRefreshToken: string
    let userUuid: string
    let userId: number

    beforeEach(async () => {
      // 先註冊一個使用者來取得有效的 refresh token
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'refresh-test@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData)

      expect(registerRes.status).toBe(201)
      validRefreshToken = registerRes.body.data.refresh_token
      userUuid = registerRes.body.data.user.uuid
      userId = registerRes.body.data.user.id
    })

    it('使用有效的 refresh token 應成功更新 token', async () => {
      // Arrange
      const requestData = {
        refresh_token: validRefreshToken
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('Token 更新成功')
      expect(res.body.data).toHaveProperty('access_token')
      expect(res.body.data).toHaveProperty('refresh_token')
      expect(res.body.data.token_type).toBe('Bearer')
      expect(res.body.data.expires_in).toBe(3600)

      // 驗證新的 access token 有效
      expect(res.body.data.access_token).not.toBe('')
      expect(res.body.data.refresh_token).not.toBe('')

      // 新的 token 應該與舊的不同
      expect(res.body.data.refresh_token).not.toBe(validRefreshToken)
    })

    it('refresh token 格式無效應回傳 401', async () => {
      // Arrange
      const requestData = {
        refresh_token: 'invalid-token-format'
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Token 更新失敗')
      expect(res.body.errors.refresh_token).toContain('無效或已過期的 Refresh Token')
    })

    it('過期的 refresh token 應回傳 401', async () => {
      // Arrange - 建立已過期的 refresh token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      const expiredToken = jwt.sign(
        {
          sub: userUuid,
          user_id: userId,
          token_type: 'refresh'
        },
        jwtSecret,
        { expiresIn: '-1h' } // 過期 1 小時
      )

      const requestData = {
        refresh_token: expiredToken
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Token 更新失敗')
      expect(res.body.errors.refresh_token).toContain('無效或已過期的 Refresh Token')
    })

    it('非 refresh 類型的 token 應回傳 401', async () => {
      // Arrange - 使用 access token 而非 refresh token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      const accessToken = jwt.sign(
        {
          sub: userUuid,
          user_id: userId,
          role: 'STUDENT',
          account_status: 'ACTIVE'
        },
        jwtSecret,
        { expiresIn: '1h' }
      )

      const requestData = {
        refresh_token: accessToken
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Token 更新失敗')
      expect(res.body.errors.refresh_token).toContain('無效或已過期的 Refresh Token')
    })

    it('不存在使用者的 refresh token 應回傳 401', async () => {
      // Arrange - 建立不存在使用者的 refresh token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      const nonExistentUserToken = jwt.sign(
        {
          sub: uuidv4(),
          user_id: 99999,
          token_type: 'refresh'
        },
        jwtSecret,
        { expiresIn: '30d' }
      )

      const requestData = {
        refresh_token: nonExistentUserToken
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Token 更新失敗')
      expect(res.body.errors.refresh_token).toContain('無效或已過期的 Refresh Token')
    })

    it('缺少 refresh_token 參數應回傳 400', async () => {
      // Arrange
      const requestData = {}

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Token 更新失敗')
      expect(res.body.errors.refresh_token).toContain('Refresh Token 為必填欄位')
    })

    it('refresh_token 為空字串應回傳 400', async () => {
      // Arrange
      const requestData = {
        refresh_token: ''
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Token 更新失敗')
      expect(res.body.errors.refresh_token).toContain('Refresh Token 為必填欄位')
    })

    it('使用錯誤的 JWT secret 簽章的 token 應回傳 401', async () => {
      // Arrange - 使用錯誤的 secret 建立 token
      const wrongSecret = 'wrong-secret-key'
      const invalidToken = jwt.sign(
        {
          sub: userUuid,
          user_id: userId,
          token_type: 'refresh'
        },
        wrongSecret,
        { expiresIn: '30d' }
      )

      const requestData = {
        refresh_token: invalidToken
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('Token 更新失敗')
      expect(res.body.errors.refresh_token).toContain('無效或已過期的 Refresh Token')
    })

    it('新生成的 access token 應包含正確的使用者資訊', async () => {
      // Arrange
      const requestData = {
        refresh_token: validRefreshToken
      }

      // Act
      const res = await request(app).post('/api/auth/refresh').send(requestData)

      // Assert
      expect(res.status).toBe(200)

      // 解碼新的 access token 並驗證內容
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key'
      const decoded = jwt.verify(res.body.data.access_token, jwtSecret) as any

      expect(decoded.sub).toBe(userUuid)
      expect(decoded.user_id).toBe(userId)
      expect(decoded.role).toBe('student') // 符合 UserRole.STUDENT 的實際值
      expect(decoded.account_status).toBe('active') // 符合 AccountStatus.ACTIVE 的實際值
      expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000)) // 確保未過期
    })
  })
})
