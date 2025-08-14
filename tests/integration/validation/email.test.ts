import request from 'supertest'
import app from '../../../app'
import { clearDatabase, initTestDatabase, closeTestDatabase } from '../../helpers/database'
import { RegisterRequest } from '../../../types/auth'

describe('Validation Email API', () => {
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
  }, 15000)

  describe('POST /api/validation/email', () => {
    it('未被使用的 email 應回傳可用狀態', async () => {
      // Arrange
      const requestData = {
        email: 'available@example.com'
      }

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('Email 可以使用')
      expect(res.body.data.available).toBe(true)
    })

    it('已被註冊的 email 應回傳不可用狀態', async () => {
      // Arrange - 先註冊一個使用者
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'taken@example.com',
        password: 'Password123中文'
      }

      await request(app).post('/api/auth/register').send(userData)

      const requestData = {
        email: 'taken@example.com'
      }

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('Email 已被註冊')
      expect(res.body.data.available).toBe(false)
    })

    it('Email 大小寫不敏感檢查', async () => {
      // Arrange - 先註冊一個使用者
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'Test@Example.Com',
        password: 'Password123中文'
      }

      await request(app).post('/api/auth/register').send(userData)

      const requestData = {
        email: 'test@example.com' // 小寫版本
      }

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('Email 已被註冊')
      expect(res.body.data.available).toBe(false)
    })

    it('無效的 email 格式應回傳 400 錯誤', async () => {
      // Arrange
      const requestData = {
        email: 'invalid-email-format'
      }

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('驗證失敗')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
    })

    it('缺少 email 參數應回傳 400 錯誤', async () => {
      // Arrange
      const requestData = {}

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('驗證失敗')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
    })

    it('空字串 email 應回傳 400 錯誤', async () => {
      // Arrange
      const requestData = {
        email: ''
      }

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('驗證失敗')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
    })

    it('只有空格的 email 應回傳 400 錯誤', async () => {
      // Arrange
      const requestData = {
        email: '   '
      }

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('驗證失敗')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
    })

    it('超長 email 應回傳 400 錯誤', async () => {
      // Arrange - 建立超過 255 字元的 email
      const longEmail = 'a'.repeat(250) + '@example.com' // 總長度超過 255
      const requestData = {
        email: longEmail
      }

      // Act
      const res = await request(app).post('/api/validation/email').send(requestData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('驗證失敗')
      expect(res.body.errors.email).toContain('電子郵件長度不能超過255字元')
    })

    it('各種有效的 email 格式都應該正常處理', async () => {
      const validEmails = ['user@example.com', 'user.name@example.com', 'user+tag@example.com', 'user123@example-domain.co.uk', 'test@subdomain.example.org']

      for (const email of validEmails) {
        const requestData = { email }

        const res = await request(app).post('/api/validation/email').send(requestData)

        expect(res.status).toBe(200)
        expect(res.body.status).toBe('success')
        expect(res.body.data).toHaveProperty('available')
        expect(typeof res.body.data.available).toBe('boolean')
      }
    })
  })
})
