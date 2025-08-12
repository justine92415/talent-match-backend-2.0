import request from 'supertest'
import app from '../../../app'
import { clearDatabase } from '../../helpers/database'
import { TeacherApplyRequest, TeacherApplicationResponse } from '../../../types/teachers'
import { RegisterRequest } from '../../../types/auth'

describe('Teachers Application API', () => {
  beforeAll(async () => {
    // 初始化測試資料庫
  })

  afterAll(async () => {
    // 關閉測試資料庫連線
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('POST /api/teachers/apply', () => {
    it('使用有效資料應該成功建立教師申請', async () => {
      // Arrange - 準備測試資料
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
        password: 'Password123中文'
      }

      // 先註冊使用者
      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      const teacherData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      // Act - 執行教師申請
      const res = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData)

      // Assert - 驗證結果
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('教師申請提交成功')
      expect(res.body.data).toHaveProperty('application')
      expect(res.body.data.application).toHaveProperty('id')
      expect(res.body.data.application).toHaveProperty('user_id')
      expect(res.body.data.application.nationality).toBe(teacherData.nationality)
      expect(res.body.data.application.introduction).toBe(teacherData.introduction)
      expect(res.body.data.application.application_status).toBe('pending')
      expect(res.body.data.application).toHaveProperty('applied_at')
    })

    it('未登入使用者應回傳 401', async () => {
      const teacherData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction: '測試自我介紹'.repeat(20) // 超過100字
      }

      const res = await request(app).post('/api/teachers/apply').send(teacherData)

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('國籍為空應回傳 400 驗證錯誤', async () => {
      // Arrange
      const userData = {
        nick_name: '測試教師',
        email: 'teacher2@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      const teacherData = {
        nationality: '',
        introduction: '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術。'
      }

      // Act
      const res = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('nationality')
    })

    it('國籍超過50字應回傳 400 驗證錯誤', async () => {
      // Arrange
      const userData = {
        nick_name: '測試教師',
        email: 'teacher3@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      const teacherData = {
        nationality: 'A'.repeat(51), // 超過50字
        introduction: '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術。'
      }

      // Act
      const res = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('nationality')
    })

    it('自我介紹少於100字應回傳 400 驗證錯誤', async () => {
      // Arrange
      const userData = {
        nick_name: '測試教師',
        email: 'teacher4@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      const teacherData = {
        nationality: '台灣',
        introduction: '太短的介紹' // 少於100字
      }

      // Act
      const res = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('introduction')
    })

    it('自我介紹超過1000字應回傳 400 驗證錯誤', async () => {
      // Arrange
      const userData = {
        nick_name: '測試教師',
        email: 'teacher5@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      const teacherData = {
        nationality: '台灣',
        introduction: 'A'.repeat(1001) // 超過1000字
      }

      // Act
      const res = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('introduction')
    })

    it('已有申請記錄應回傳 409 衝突錯誤', async () => {
      // Arrange
      const userData = {
        nick_name: '測試教師',
        email: 'teacher6@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      const teacherData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      // 第一次申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 第二次申請
      const res = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData)

      // Assert
      expect(res.status).toBe(409)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('您已提交過教師申請')
    })
  })

  describe('GET /api/teachers/application', () => {
    it('應該成功取得申請狀態', async () => {
      // Arrange - 準備測試資料
      const userData = {
        nick_name: '測試教師',
        email: 'teacher7@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      const teacherData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      // 先建立申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 查詢申請狀態
      const res = await request(app).get('/api/teachers/application').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('查詢申請狀態成功')
      expect(res.body.data).toHaveProperty('application')
      expect(res.body.data.application.nationality).toBe(teacherData.nationality)
      expect(res.body.data.application.introduction).toBe(teacherData.introduction)
      expect(res.body.data.application.application_status).toBe('pending')
    })

    it('未登入使用者應回傳 401', async () => {
      const res = await request(app).get('/api/teachers/application')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('沒有申請記錄應回傳 404', async () => {
      // Arrange
      const userData = {
        nick_name: '測試教師',
        email: 'teacher8@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)

      const { access_token } = registerRes.body.data

      // Act - 查詢不存在的申請
      const res = await request(app).get('/api/teachers/application').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到申請記錄')
    })
  })
})
