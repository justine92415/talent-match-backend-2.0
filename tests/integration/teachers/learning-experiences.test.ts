import request from 'supertest'
import app from '../../../app'
import { clearDatabase } from '../../helpers/database'
import { TeacherLearningExperienceRequest, TeacherLearningExperienceUpdateRequest } from '../../../types/teachers'
import { TeacherApplyRequest } from '../../../types/teachers'
import { RegisterRequest } from '../../../types/auth'

describe('Teachers Learning Experiences API', () => {
  beforeAll(async () => {
    // 初始化測試資料庫
  })

  afterAll(async () => {
    // 關閉測試資料庫連線
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/teachers/learning-experiences', () => {
    it('應該成功取得學習經歷列表', async () => {
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

      // 建立教師申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 取得學習經歷列表
      const res = await request(app).get('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('取得學習經歷列表成功')
      expect(res.body.data).toHaveProperty('learning_experiences')
      expect(Array.isArray(res.body.data.learning_experiences)).toBe(true)
    })

    it('未登入使用者應回傳 401', async () => {
      const res = await request(app).get('/api/teachers/learning-experiences')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })
  })

  describe('POST /api/teachers/learning-experiences', () => {
    it('應該成功新增學習經歷', async () => {
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      const learningExperienceData: TeacherLearningExperienceRequest = {
        school_name: '國立台灣大學',
        degree: '學士',
        department: '資訊工程學系',
        is_in_school: false,
        region: true,
        start_year: 2015,
        start_month: 9,
        end_year: 2019,
        end_month: 6
      }

      // Act - 新增學習經歷
      const response = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`).send(learningExperienceData)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe('新增學習經歷成功')
      expect(response.body.data).toHaveProperty('learning_experience')
      expect(response.body.data.learning_experience.school_name).toBe(learningExperienceData.school_name)
      expect(response.body.data.learning_experience.degree).toBe(learningExperienceData.degree)
      expect(response.body.data.learning_experience.department).toBe(learningExperienceData.department)
    })

    it('應該成功新增在學中的學習經歷（不需要結束日期）', async () => {
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      const learningExperienceData: TeacherLearningExperienceRequest = {
        school_name: '國立台灣師範大學',
        degree: '碩士',
        department: '教育科技學系',
        is_in_school: true,
        region: true,
        start_year: 2020,
        start_month: 9
      }

      // Act - 新增在學中的學習經歷
      const response = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`).send(learningExperienceData)

      // Assert
      expect(response.status).toBe(201)
      expect(response.body.status).toBe('success')
      expect(response.body.data.learning_experience.is_in_school).toBe(true)
      expect(response.body.data.learning_experience.end_year).toBeNull()
      expect(response.body.data.learning_experience.end_month).toBeNull()
    })

    it('必填欄位缺失應回傳 400', async () => {
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 使用缺少必填欄位的資料
      const response = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`).send({
        // 缺少 school_name, degree 等必填欄位
        department: '資訊工程學系'
      })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('參數驗證失敗')
      expect(response.body.errors).toBeDefined()
    })

    it('非在學但缺少結束時間應回傳 400', async () => {
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 非在學但缺少結束時間
      const response = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`).send({
        school_name: '國立台灣大學',
        degree: '學士',
        department: '資訊工程學系',
        is_in_school: false,
        region: true,
        start_year: 2015,
        start_month: 9
        // 缺少 end_year 和 end_month
      })

      // Assert
      expect(response.status).toBe(400)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('參數驗證失敗')
    })

    it('未登入用戶應回傳 401', async () => {
      const learningExperienceData: TeacherLearningExperienceRequest = {
        school_name: '國立台灣大學',
        degree: '學士',
        department: '資訊工程學系',
        is_in_school: false,
        region: true,
        start_year: 2015,
        start_month: 9,
        end_year: 2019,
        end_month: 6
      }

      const response = await request(app).post('/api/teachers/learning-experiences').send(learningExperienceData)

      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('未授權')
    })
  })

  describe('PUT /api/teachers/learning-experiences/:id', () => {
    it('應該成功更新學習經歷', async () => {
      // Arrange - 先建立學習經歷
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // 先建立學習經歷
      const createResponse = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`).send({
        school_name: '國立台灣大學',
        degree: '學士',
        department: '資訊工程學系',
        is_in_school: false,
        region: true,
        start_year: 2015,
        start_month: 9,
        end_year: 2019,
        end_month: 6
      })

      const learningExperienceId = createResponse.body.data.learning_experience.id

      const updateData: TeacherLearningExperienceUpdateRequest = {
        school_name: '國立台灣大學',
        degree: '碩士',
        department: '資訊工程研究所',
        is_in_school: false,
        region: true,
        start_year: 2019,
        start_month: 9,
        end_year: 2021,
        end_month: 6
      }

      // Act - 更新學習經歷
      const response = await request(app)
        .put(`/api/teachers/learning-experiences/${learningExperienceId}`)
        .set('Authorization', `Bearer ${access_token}`)
        .send(updateData)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe('更新學習經歷成功')
      expect(response.body.data.learning_experience.degree).toBe('碩士')
      expect(response.body.data.learning_experience.department).toBe('資訊工程研究所')
    })

    it('學習經歷不存在應回傳 404', async () => {
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 更新不存在的學習經歷
      const response = await request(app).put('/api/teachers/learning-experiences/99999').set('Authorization', `Bearer ${access_token}`).send({
        school_name: '國立台灣大學',
        degree: '碩士',
        department: '資訊工程研究所'
      })

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('找不到指定的學習經歷')
    })

    it('更新他人的學習經歷應回傳 403', async () => {
      // Arrange - 建立兩個不同的教師帳號
      const teacher1Data: RegisterRequest = {
        nick_name: '教師1',
        email: 'teacher1@example.com',
        password: 'Password123中文'
      }

      const teacher2Data: RegisterRequest = {
        nick_name: '教師2',
        email: 'teacher2@example.com',
        password: 'Password123中文'
      }

      const registerRes1 = await request(app).post('/api/auth/register').send(teacher1Data).expect(201)
      const { access_token: teacher1Token } = registerRes1.body.data

      const registerRes2 = await request(app).post('/api/auth/register').send(teacher2Data).expect(201)
      const { access_token: teacher2Token } = registerRes2.body.data

      const teacherData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      // 兩個教師都申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher1Token}`).send(teacherData).expect(201)
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher2Token}`).send(teacherData).expect(201)

      // 教師1建立學習經歷
      const createResponse = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${teacher1Token}`).send({
        school_name: '國立台灣大學',
        degree: '學士',
        department: '資訊工程學系',
        is_in_school: false,
        region: true,
        start_year: 2015,
        start_month: 9,
        end_year: 2019,
        end_month: 6
      })

      const learningExperienceId = createResponse.body.data.learning_experience.id

      // Act - 教師2嘗試更新教師1的學習經歷
      const response = await request(app)
        .put(`/api/teachers/learning-experiences/${learningExperienceId}`)
        .set('Authorization', `Bearer ${teacher2Token}`)
        .send({
          school_name: '國立清華大學',
          degree: '碩士'
        })

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('權限不足，無法修改此學習經歷')
    })
  })

  describe('DELETE /api/teachers/learning-experiences/:id', () => {
    it('應該成功刪除學習經歷', async () => {
      // Arrange - 先建立學習經歷
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // 建立學習經歷
      const createResponse = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`).send({
        school_name: '國立台灣大學',
        degree: '學士',
        department: '資訊工程學系',
        is_in_school: false,
        region: true,
        start_year: 2015,
        start_month: 9,
        end_year: 2019,
        end_month: 6
      })

      const learningExperienceId = createResponse.body.data.learning_experience.id

      // Act - 刪除學習經歷
      const response = await request(app).delete(`/api/teachers/learning-experiences/${learningExperienceId}`).set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe('刪除學習經歷成功')

      // 驗證學習經歷已被刪除
      const listResponse = await request(app).get('/api/teachers/learning-experiences').set('Authorization', `Bearer ${access_token}`)
      expect(listResponse.body.data.learning_experiences).toHaveLength(0)
    })

    it('刪除不存在的學習經歷應回傳 404', async () => {
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

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 刪除不存在的學習經歷
      const response = await request(app).delete('/api/teachers/learning-experiences/99999').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('找不到指定的學習經歷')
    })

    it('刪除他人的學習經歷應回傳 403', async () => {
      // Arrange - 建立兩個不同的教師帳號
      const teacher1Data: RegisterRequest = {
        nick_name: '教師1',
        email: 'teacher1@example.com',
        password: 'Password123中文'
      }

      const teacher2Data: RegisterRequest = {
        nick_name: '教師2',
        email: 'teacher2@example.com',
        password: 'Password123中文'
      }

      const registerRes1 = await request(app).post('/api/auth/register').send(teacher1Data).expect(201)
      const { access_token: teacher1Token } = registerRes1.body.data

      const registerRes2 = await request(app).post('/api/auth/register').send(teacher2Data).expect(201)
      const { access_token: teacher2Token } = registerRes2.body.data

      const teacherData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      // 兩個教師都申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher1Token}`).send(teacherData).expect(201)
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher2Token}`).send(teacherData).expect(201)

      // 教師1建立學習經歷
      const createResponse = await request(app).post('/api/teachers/learning-experiences').set('Authorization', `Bearer ${teacher1Token}`).send({
        school_name: '國立台灣大學',
        degree: '學士',
        department: '資訊工程學系',
        is_in_school: false,
        region: true,
        start_year: 2015,
        start_month: 9,
        end_year: 2019,
        end_month: 6
      })

      const learningExperienceId = createResponse.body.data.learning_experience.id

      // Act - 教師2嘗試刪除教師1的學習經歷
      const response = await request(app).delete(`/api/teachers/learning-experiences/${learningExperienceId}`).set('Authorization', `Bearer ${teacher2Token}`)

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.status).toBe('error')
      expect(response.body.message).toBe('權限不足，無法刪除此學習經歷')
    })
  })
})
