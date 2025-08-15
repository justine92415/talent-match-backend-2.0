import request from 'supertest'
import app from '../app'
import { clearDatabase, initTestDatabase } from './helpers/database'
import { dataSource } from '../db/data-source'
import { User } from '../entities/User'

describe('POST /api/auth/register', () => {
  beforeAll(async () => {
    await initTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('成功註冊案例', () => {
    it('應該成功註冊新使用者並回傳 201', async () => {
      // Arrange
      const userData = {
        nick_name: '測試使用者',
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(userData).expect(201)

      // Assert
      expect(response.body).toMatchObject({
        status: 'success',
        message: '註冊成功',
        data: {
          user: {
            id: expect.any(Number),
            uuid: expect.any(String),
            nick_name: userData.nick_name,
            email: userData.email,
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
        where: { email: userData.email }
      })
      expect(savedUser).toBeTruthy()
      expect(savedUser?.nick_name).toBe(userData.nick_name)
      expect(savedUser?.password).not.toBe(userData.password) // 應該是加密後的密碼
    })

    it('應該成功註冊並自動生成 UUID', async () => {
      // Arrange
      const userData = {
        nick_name: '測試使用者2',
        email: 'test2@example.com',
        password: 'password123'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(userData).expect(201)

      // Assert
      const uuid = response.body.data.user.uuid
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })
  })

  describe('參數驗證錯誤案例', () => {
    it('應該拒絕重複 email 並回傳 400', async () => {
      // Arrange - 先建立一個使用者
      const existingUserData = {
        nick_name: '既有使用者',
        email: 'existing@example.com',
        password: 'password123'
      }
      await request(app).post('/api/auth/register').send(existingUserData).expect(201)

      const duplicateUserData = {
        nick_name: '新使用者',
        email: 'existing@example.com', // 重複的 email
        password: 'password456'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(duplicateUserData).expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '註冊失敗',
        errors: {
          email: ['此電子郵件已被註冊']
        }
      })
    })

    it('應該拒絕重複暱稱並回傳 400', async () => {
      // Arrange - 先建立一個使用者
      const existingUserData = {
        nick_name: '測試暱稱',
        email: 'test1@example.com',
        password: 'password123'
      }
      await request(app).post('/api/auth/register').send(existingUserData).expect(201)

      const duplicateUserData = {
        nick_name: '測試暱稱', // 重複的暱稱
        email: 'test2@example.com',
        password: 'password456'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(duplicateUserData).expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '註冊失敗',
        errors: {
          nick_name: ['此暱稱已被使用']
        }
      })
    })

    it('應該拒絕無效的 email 格式並回傳 400', async () => {
      // Arrange
      const invalidUserData = {
        nick_name: '測試使用者',
        email: 'invalid-email',
        password: 'password123'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(invalidUserData).expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '註冊失敗',
        errors: {
          email: expect.arrayContaining([expect.stringContaining('格式')])
        }
      })
    })

    it('應該拒絕過短的密碼並回傳 400', async () => {
      // Arrange
      const invalidUserData = {
        nick_name: '測試使用者',
        email: 'test@example.com',
        password: '123' // 過短的密碼
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(invalidUserData).expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '註冊失敗',
        errors: {
          password: ['密碼必須至少8字元且包含中英文']
        }
      })
    })

    it('應該拒絕空白暱稱並回傳 400', async () => {
      // Arrange
      const invalidUserData = {
        nick_name: '', // 空白暱稱
        email: 'test@example.com',
        password: 'password123'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(invalidUserData).expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '註冊失敗',
        errors: {
          nick_name: expect.arrayContaining([expect.stringContaining('必填')])
        }
      })
    })

    it('應該拒絕缺少必填欄位並回傳 400', async () => {
      // Arrange
      const incompleteUserData = {
        nick_name: '測試使用者'
        // 缺少 email 和 password
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(incompleteUserData).expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '註冊失敗',
        errors: {
          email: expect.arrayContaining([expect.stringContaining('必填')]),
          password: expect.arrayContaining([expect.stringContaining('必填')])
        }
      })
    })
  })

  describe('邊界值測試', () => {
    it('應該接受最長的有效暱稱（50字元）', async () => {
      // Arrange
      const longNickname = 'a'.repeat(50) // 50 字元的暱稱
      const userData = {
        nick_name: longNickname,
        email: 'long-nickname@example.com',
        password: 'password123'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(userData).expect(201)

      // Assert
      expect(response.body.data.user.nick_name).toBe(longNickname)
    })

    it('應該拒絕過長的暱稱（51字元）', async () => {
      // Arrange
      const tooLongNickname = 'a'.repeat(51) // 51 字元的暱稱
      const userData = {
        nick_name: tooLongNickname,
        email: 'too-long-nickname@example.com',
        password: 'password123'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(userData).expect(400)

      // Assert
      expect(response.body).toMatchObject({
        status: 'error',
        message: '註冊失敗',
        errors: {
          nick_name: expect.arrayContaining([expect.stringContaining('長度')])
        }
      })
    })

    it('應該接受較長的有效 email', async () => {
      // Arrange
      // 使用符合 RFC 標準的較長 email（本地部分最多 64 字元）
      const longLocalPart = 'very.long.email.address.test.user.with.many.dots.and.chars'
      const longDomain = 'very-long-domain-name-for-testing-purposes.example.com'
      const longEmail = `${longLocalPart}@${longDomain}` // 約 100 字元，符合標準

      const userData = {
        nick_name: '測試長Email',
        email: longEmail,
        password: 'password123'
      }

      // Act
      const response = await request(app).post('/api/auth/register').send(userData).expect(201)

      // Assert
      expect(response.body.data.user.email).toBe(longEmail)
    })
  })
})
