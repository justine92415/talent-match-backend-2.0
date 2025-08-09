import request from 'supertest'
import app from '../../../app'
import { 
  initTestDatabase, 
  closeTestDatabase, 
  startTestTransaction, 
  rollbackTestTransaction 
} from '../../helpers/database'
import { RegisterRequest } from '../../../types/auth'

describe('Auth Register API', () => {
  beforeAll(async () => {
    // 初始化測試資料庫連線
    await initTestDatabase()
  })

  afterAll(async () => {
    // 關閉資料庫連線
    await closeTestDatabase()
  })

  beforeEach(async () => {
    // 使用事務隔離，更高效
    await startTestTransaction()
  })

  afterEach(async () => {
    // 回滾事務，快速清理測試數據
    await rollbackTestTransaction()
  })

  describe('POST /api/auth/register', () => {
    it('使用有效資料應成功註冊新使用者', async () => {
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'test1@example.com',
        password: 'Password123中文'
      }
      const res = await request(app).post('/api/auth/register').send(userData)
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.user).toHaveProperty('id')
      expect(res.body.data.user.email).toBe(userData.email)
      expect(res.body.data).toHaveProperty('access_token')
      expect(res.body.data).toHaveProperty('refresh_token')
    })

    it('email 重複註冊應回傳 409 錯誤', async () => {
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'test2@example.com',
        password: 'Password123中文'
      }
      await request(app).post('/api/auth/register').send(userData)
      const res = await request(app).post('/api/auth/register').send(userData)
      expect(res.status).toBe(409)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.email).toContain('此電子郵件已被註冊')
    })

    it('缺少必填欄位應回傳 400', async () => {
      const res = await request(app).post('/api/auth/register').send({ email: '', password: '' })
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.nick_name).toContain('暱稱為必填欄位')
      expect(res.body.errors.password).toContain('密碼必須至少8字元且包含中英文')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
    })

    it('密碼格式錯誤應回傳 400', async () => {
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'test3@example.com',
        password: '12345678'
      }
      const res = await request(app).post('/api/auth/register').send(userData)
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.password).toContain('密碼必須至少8字元且包含中英文')
    })

    it('email 格式錯誤應回傳 400', async () => {
      const userData: RegisterRequest = {
        nick_name: '測試用戶',
        email: 'not-an-email',
        password: 'Password123中文'
      }
      const res = await request(app).post('/api/auth/register').send(userData)
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.errors.email).toContain('請輸入有效的電子郵件格式')
    })
  })
})
