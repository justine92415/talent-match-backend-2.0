import request from 'supertest'
import app from '../../../app'
import { clearDatabase } from '../../helpers/database'
import { RegisterRequest } from '../../../types/auth'
import { dataSource } from '../../../db/data-source'

describe('Auth Login API', () => {
  beforeAll(async () => {
    if (!dataSource.isInitialized) {
      await dataSource.initialize()
    }
  })

  afterAll(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy()
    }
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/auth/login', () => {
    it('使用有效 email 和密碼應成功登入', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'login1@example.com',
        password: 'Password123中文'
      }
      await request(app).post('/api/auth/register').send(userData)
      // Act
      const res = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password
      })
      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.data.user.email).toBe(userData.email)
      expect(res.body.data).toHaveProperty('access_token')
      expect(res.body.data).toHaveProperty('refresh_token')
    })

    it('錯誤密碼應回傳 401', async () => {
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'login2@example.com',
        password: 'Password123中文'
      }
      await request(app).post('/api/auth/register').send(userData)
      const res = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: 'WrongPassword123'
      })
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.credentials).toContain('電子郵件或密碼錯誤')
    })

    it('不存在的 email 應回傳 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'notfound@example.com',
        password: 'Password123中文'
      })
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.credentials).toContain('電子郵件或密碼錯誤')
    })

    it('帳號停用應回傳 403', async () => {
      const userData: RegisterRequest = {
        nick_name: '停用用戶',
        email: 'disabled@example.com',
        password: 'Password123中文'
      }
      // 註冊後直接停用
      await request(app).post('/api/auth/register').send(userData)
      const userRepo = dataSource.getRepository('User')
      const user = await userRepo.findOne({ where: { email: userData.email } })
      if (user) {
        user.account_status = 'deactivated'
        await userRepo.save(user)
      }
      const res = await request(app).post('/api/auth/login').send({
        email: userData.email,
        password: userData.password
      })
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.account).toContain('您的帳號已被停用，請聯絡客服')
    })

    it('缺少必填欄位應回傳 400', async () => {
      const res = await request(app).post('/api/auth/login').send({ email: '', password: '' })
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
      expect(res.body.errors.password).toContain('密碼為必填欄位')
    })
  })
})
