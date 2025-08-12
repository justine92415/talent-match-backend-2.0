import request from 'supertest'
import app from '../../../app'
import { clearDatabase } from '../../helpers/database'
import { TeacherApplyRequest } from '../../../types/teachers'
import { RegisterRequest } from '../../../types/auth'
import { dataSource } from '../../../db/data-source'
import { Teacher } from '../../../entities/Teacher'
import { ApplicationStatus } from '../../../entities/enums'

describe('Teachers Profile API', () => {
  beforeAll(async () => {
    // 初始化測試資料庫
  })

  afterAll(async () => {
    // 關閉測試資料庫連線
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/teachers/profile', () => {
    it('應該成功取得教師基本資料', async () => {
      // Arrange - 準備測試資料
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
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

      // Act - 取得教師資料
      const res = await request(app).get('/api/teachers/profile').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('取得教師資料成功')
      expect(res.body.data).toHaveProperty('teacher')
      expect(res.body.data.teacher).toHaveProperty('id')
      expect(res.body.data.teacher).toHaveProperty('user_id')
      expect(res.body.data.teacher.nationality).toBe(teacherData.nationality)
      expect(res.body.data.teacher.introduction).toBe(teacherData.introduction)
      expect(res.body.data.teacher.application_status).toBe('pending')
    })

    it('未登入使用者應回傳 401', async () => {
      const res = await request(app).get('/api/teachers/profile')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('沒有教師申請記錄應回傳 404', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試使用者',
        email: 'user@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      // Act
      const res = await request(app).get('/api/teachers/profile').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到教師資料')
    })
  })

  describe('PUT /api/teachers/profile', () => {
    it('應該成功更新教師基本資料', async () => {
      // Arrange - 準備測試資料
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      const initialData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      // 先建立申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(initialData).expect(201)

      const updateData = {
        nationality: '美國',
        introduction:
          '更新後的自我介紹：我是一位擁有十五年教學經驗的資深講師，專精於全端開發技術，包括前端框架、後端架構設計、資料庫管理等領域。我致力於培養學生的實際開發能力和解決問題的思維。同時我也具備豐富的實務經驗，曾經參與多個大型專案的開發。我相信透過系統化的教學方法和實際案例的分享，能夠有效提升學生的學習成效。'
      }

      // Act - 更新教師資料
      const res = await request(app).put('/api/teachers/profile').set('Authorization', `Bearer ${access_token}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('教師資料更新成功')
      expect(res.body.data.teacher.nationality).toBe(updateData.nationality)
      expect(res.body.data.teacher.introduction).toBe(updateData.introduction)
    })

    it('未登入使用者應回傳 401', async () => {
      const updateData = {
        nationality: '日本',
        introduction:
          '測試用的自我介紹，包含足夠的字數來通過驗證規則。這是一個測試用的更新資料，用來驗證未登入使用者無法更新教師資料的情況。這裡需要足夠多的文字內容來確保超過一百字的最低要求。我會添加更多內容來滿足這個條件，包括我的教學理念、專業背景、教學方法等等詳細資訊。'
      }

      const res = await request(app).put('/api/teachers/profile').send(updateData)

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('沒有教師申請記錄應回傳 404', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試使用者',
        email: 'user@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      const updateData = {
        nationality: '韓國',
        introduction:
          '測試用的自我介紹，包含足夠的字數來通過驗證規則。這是一個測試用的更新資料，用來驗證沒有教師記錄時無法更新的情況。這裡需要足夠多的文字內容來確保超過一百字的最低要求。我會添加更多內容來滿足這個條件，包括我的教學理念、專業背景、教學方法等等詳細資訊。'
      }

      // Act
      const res = await request(app).put('/api/teachers/profile').set('Authorization', `Bearer ${access_token}`).send(updateData)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到教師資料')
    })

    it('參數驗證錯誤應回傳 400', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
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

      const invalidData = {
        nationality: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // 超過50字
        introduction: '太短的介紹' // 少於100字
      }

      // Act
      const res = await request(app).put('/api/teachers/profile').set('Authorization', `Bearer ${access_token}`).send(invalidData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('nationality')
      expect(res.body.errors).toHaveProperty('introduction')
    })

    it('只更新部分欄位應該成功', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      const initialData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      // 先建立申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(initialData).expect(201)

      // 只更新國籍
      const updateData = {
        nationality: '新加坡'
      }

      // Act
      const res = await request(app).put('/api/teachers/profile').set('Authorization', `Bearer ${access_token}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('教師資料更新成功')
      expect(res.body.data.teacher.nationality).toBe(updateData.nationality)
      expect(res.body.data.teacher.introduction).toBe(initialData.introduction) // 介紹應該保持不變
    })
  })
})
