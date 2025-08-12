import request from 'supertest'
import app from '../../../app'
import { clearDatabase, initTestDatabase, closeTestDatabase } from '../../helpers/database'

describe('Auth Forgot/Reset Password API', () => {
  beforeAll(async () => {
    await initTestDatabase()
  }, 30000)

  afterAll(async () => {
    await closeTestDatabase()
  }, 30000)

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/auth/forgot-password', () => {
    it('email 格式錯誤應回傳 400', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'bad' })
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
    })

    it('有效 email 應回傳 200（不透露是否存在）', async () => {
      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'user@example.com' })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toContain('如果該電子郵件已註冊')
    })
  })

  describe('POST /api/auth/reset-password', () => {
    it('缺少必填欄位應回傳 400', async () => {
      const res = await request(app).post('/api/auth/reset-password').send({})
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('密碼重設失敗')
      expect(res.body.errors).toHaveProperty('token')
    })

    it('令牌無效應回傳 400', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({ token: 'invalid', password: 'Password123中文', password_confirmation: 'Password123中文' })
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.token).toContain('無效或已過期的重設令牌')
    })
  })
})
