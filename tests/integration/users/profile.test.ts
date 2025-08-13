import request from 'supertest'
import app from '../../../app'
import { clearDatabase, initTestDatabase, closeTestDatabase } from '../../helpers/database'
import { RegisterRequest } from '../../../types/auth'

describe('Users Profile API', () => {
  let accessToken: string
  let userUuid: string
  let userId: number

  beforeAll(async () => {
    // 初始化測試資料庫連線
    await initTestDatabase()
  }, 30000)

  afterAll(async () => {
    // 關閉資料庫連線
    await closeTestDatabase()
  }, 30000)

  beforeEach(async () => {
    await clearDatabase()

    // 註冊並登入一個測試使用者
    const userData: RegisterRequest = {
      nick_name: '測試用戶',
      email: 'profile-test@example.com',
      password: 'Password123中文'
    }

    const registerRes = await request(app).post('/api/auth/register').send(userData)

    expect(registerRes.status).toBe(201)
    accessToken = registerRes.body.data.access_token
    userUuid = registerRes.body.data.user.uuid
    userId = registerRes.body.data.user.id
  }, 15000)

  describe('GET /api/users/profile', () => {
    it('使用有效 token 應成功取得個人資料', async () => {
      // Act
      const res = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${accessToken}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('取得個人資料成功')
      expect(res.body.data.user).toHaveProperty('id', userId)
      expect(res.body.data.user).toHaveProperty('uuid', userUuid)
      expect(res.body.data.user).toHaveProperty('nick_name', '測試用戶')
      expect(res.body.data.user).toHaveProperty('email', 'profile-test@example.com')
      expect(res.body.data.user).toHaveProperty('role', 'student')
      expect(res.body.data.user).toHaveProperty('account_status', 'active')
      expect(res.body.data.user).toHaveProperty('created_at')
      expect(res.body.data.user).toHaveProperty('updated_at')

      // 確保沒有密碼欄位
      expect(res.body.data.user).not.toHaveProperty('password')
    })

    it('未提供 token 應回傳 401', async () => {
      const res = await request(app).get('/api/users/profile')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('無效 token 應回傳 401', async () => {
      const res = await request(app).get('/api/users/profile').set('Authorization', 'Bearer invalid-token')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('過期 token 應回傳 401', async () => {
      // Arrange - 使用過期的 token
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0LXV1aWQiLCJ1c2VyX2lkIjoxLCJyb2xlIjoic3R1ZGVudCIsImFjY291bnRfc3RhdHVzIjoiYWN0aXZlIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTUyMDF9.test-signature'

      // Act
      const res = await request(app).get('/api/users/profile').set('Authorization', `Bearer ${expiredToken}`)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })
  })

  describe('PUT /api/users/profile', () => {
    it('使用有效資料應成功更新個人資料', async () => {
      // Arrange
      const updateData = {
        nick_name: '新的暱稱',
        name: '王小明',
        phone: '0987654321'
      }

      // Act
      const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${accessToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('個人資料更新成功')
      expect(res.body.data.user.nick_name).toBe('新的暱稱')
      expect(res.body.data.user.name).toBe('王小明')
      expect(res.body.data.user.phone).toBe('0987654321')
      expect(res.body.data.user).toHaveProperty('updated_at')
    })

    it('只更新部分欄位應成功', async () => {
      // Arrange
      const updateData = {
        nick_name: '只更新暱稱'
      }

      // Act
      const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${accessToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.user.nick_name).toBe('只更新暱稱')
      expect(res.body.data.user.email).toBe('profile-test@example.com') // 原始值不變
    })

    it('空的請求 body 應成功（不更新任何欄位）', async () => {
      // Arrange
      const updateData = {}

      // Act
      const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${accessToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.user.nick_name).toBe('測試用戶') // 原始值不變
    })

    it('暱稱過長應回傳 400', async () => {
      // Arrange
      const updateData = {
        nick_name: 'a'.repeat(51) // 超過 50 字元
      }

      // Act
      const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${accessToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('個人資料更新失敗')
      expect(res.body.errors.nick_name).toContain('暱稱長度不能超過50字元')
    })

    it('姓名過長應回傳 400', async () => {
      // Arrange
      const updateData = {
        name: 'a'.repeat(101) // 超過 100 字元
      }

      // Act
      const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${accessToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('個人資料更新失敗')
      expect(res.body.errors.name).toContain('真實姓名長度不能超過100字元')
    })

    it('無效的電話號碼格式應回傳 400', async () => {
      // Arrange
      const updateData = {
        phone: '123' // 無效格式
      }

      // Act
      const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${accessToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('個人資料更新失敗')
      expect(res.body.errors.phone).toContain('請輸入有效的台灣手機號碼格式')
    })

    it('各種有效的台灣手機號碼格式都應該接受', async () => {
      const validPhones = ['0987654321', '0912345678', '0976543210']

      for (const phone of validPhones) {
        // 清理資料庫並重新建立使用者
        await clearDatabase()
        const userData: RegisterRequest = {
          nick_name: '測試用戶',
          email: `test-${Date.now()}@example.com`,
          password: 'Password123中文'
        }

        const registerRes = await request(app).post('/api/auth/register').send(userData)

        const token = registerRes.body.data.access_token

        const updateData = { phone }

        const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${token}`).send(updateData)

        expect(res.status).toBe(200)
        expect(res.body.data.user.phone).toBe(phone)
      }
    })

    it('未提供 token 應回傳 401', async () => {
      // Arrange
      const updateData = {
        nick_name: '新暱稱'
      }

      // Act
      const res = await request(app).put('/api/users/profile').send(updateData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('嘗試更新不允許的欄位應被忽略', async () => {
      // Arrange
      const updateData = {
        nick_name: '合法更新',
        email: 'hacker@evil.com', // 不允許更新
        password: 'hacked', // 不允許更新
        role: 'admin', // 不允許更新
        id: 999 // 不允許更新
      }

      // Act
      const res = await request(app).put('/api/users/profile').set('Authorization', `Bearer ${accessToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.data.user.nick_name).toBe('合法更新') // 允許的欄位被更新
      expect(res.body.data.user.email).toBe('profile-test@example.com') // 原始值不變
      expect(res.body.data.user.role).toBe('student') // 原始值不變
      expect(res.body.data.user.id).toBe(userId) // 原始值不變
    })
  })
})
