import request from 'supertest'
import app from '../../../app'
import { clearDatabase } from '../../helpers/database'
import { TeacherApplyRequest } from '../../../types/teachers'
import { RegisterRequest } from '../../../types/auth'

describe('Teachers Work Experiences API', () => {
  beforeAll(async () => {
    // 初始化測試資料庫
  })

  afterAll(async () => {
    // 關閉測試資料庫連線
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/teachers/work-experiences', () => {
    it('應該成功取得工作經驗列表', async () => {
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

      // Act - 取得工作經驗列表
      const res = await request(app).get('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('取得工作經驗列表成功')
      expect(res.body.data).toHaveProperty('work_experiences')
      expect(Array.isArray(res.body.data.work_experiences)).toBe(true)
    })

    it('未登入使用者應回傳 401', async () => {
      const res = await request(app).get('/api/teachers/work-experiences')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('沒有教師記錄應回傳 404', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試使用者',
        email: 'user@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      // Act
      const res = await request(app).get('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的教師資料')
    })
  })

  describe('POST /api/teachers/work-experiences', () => {
    it('應該成功新增工作經驗', async () => {
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

      const workExperienceData = {
        is_working: false,
        company_name: 'ABC科技股份有限公司',
        workplace: '台北市信義區',
        job_category: '軟體開發',
        job_title: '資深軟體工程師',
        start_year: 2020,
        start_month: 3,
        end_year: 2023,
        end_month: 8
      }

      // Act - 新增工作經驗
      const res = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`).send(workExperienceData)

      // Assert
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('建立工作經驗成功')
      expect(res.body.data).toHaveProperty('work_experience')
      expect(res.body.data.work_experience).toHaveProperty('id')
      expect(res.body.data.work_experience.company_name).toBe(workExperienceData.company_name)
      expect(res.body.data.work_experience.job_title).toBe(workExperienceData.job_title)
      expect(res.body.data.work_experience.is_working).toBe(workExperienceData.is_working)
    })

    it('目前在職的工作經驗不應有結束時間', async () => {
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

      const currentJobData = {
        is_working: true,
        company_name: 'XYZ教育科技',
        workplace: '台北市中山區',
        job_category: '教育培訓',
        job_title: '資深講師',
        start_year: 2023,
        start_month: 9
        // 不提供 end_year 和 end_month
      }

      // Act - 新增目前工作
      const res = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`).send(currentJobData)

      // Assert
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.work_experience.is_working).toBe(true)
      expect(res.body.data.work_experience.end_year).toBeNull()
      expect(res.body.data.work_experience.end_month).toBeNull()
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

      // 建立教師申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      const invalidData = {
        // 缺少必填欄位
        company_name: '', // 空字串
        start_year: 2025, // 未來年份
        start_month: 13 // 無效月份
      }

      // Act
      const res = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`).send(invalidData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toBeDefined()
    })

    it('未登入使用者應回傳 401', async () => {
      const workExperienceData = {
        is_working: false,
        company_name: 'Test Company',
        workplace: '台北',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 1,
        end_year: 2021,
        end_month: 12
      }

      const res = await request(app).post('/api/teachers/work-experiences').send(workExperienceData)

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('沒有教師記錄應回傳 404', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試使用者',
        email: 'user@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      const workExperienceData = {
        is_working: false,
        company_name: 'Test Company',
        workplace: '台北',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 1,
        end_year: 2021,
        end_month: 12
      }

      // Act
      const res = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`).send(workExperienceData)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的教師資料')
    })
  })

  describe('PUT /api/teachers/work-experiences/:id', () => {
    it('應該成功更新工作經驗', async () => {
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

      // 先新增一個工作經驗
      const initialData = {
        is_working: false,
        company_name: '原公司名稱',
        workplace: '原工作地點',
        job_category: '原類別',
        job_title: '原職位',
        start_year: 2020,
        start_month: 1,
        end_year: 2021,
        end_month: 12
      }

      const createRes = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`).send(initialData).expect(201)

      const workExperienceId = createRes.body.data.work_experience.id

      const updateData = {
        company_name: '更新後的公司名稱',
        job_title: '更新後的職位',
        workplace: '更新後的工作地點'
      }

      // Act - 更新工作經驗
      const res = await request(app).put(`/api/teachers/work-experiences/${workExperienceId}`).set('Authorization', `Bearer ${access_token}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('更新工作經驗成功')
      expect(res.body.data.work_experience.company_name).toBe(updateData.company_name)
      expect(res.body.data.work_experience.job_title).toBe(updateData.job_title)
      expect(res.body.data.work_experience.workplace).toBe(updateData.workplace)
    })

    it('更新不存在的工作經驗應回傳 404', async () => {
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

      // 建立教師申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      const updateData = {
        company_name: '更新的公司名稱'
      }

      // Act
      const res = await request(app).put('/api/teachers/work-experiences/999').set('Authorization', `Bearer ${access_token}`).send(updateData)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的工作經驗')
    })

    it('更新其他教師的工作經驗應回傳 403', async () => {
      // Arrange - 建立第一個教師並新增工作經驗
      const teacher1Data: RegisterRequest = {
        nick_name: '教師一',
        email: 'teacher1@example.com',
        password: 'Password123中文'
      }

      const teacher1Res = await request(app).post('/api/auth/register').send(teacher1Data).expect(201)
      const teacher1Token = teacher1Res.body.data.access_token

      const teacherApplyData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher1Token}`).send(teacherApplyData).expect(201)

      const workData = {
        is_working: false,
        company_name: '測試公司',
        workplace: '台北',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 1,
        end_year: 2021,
        end_month: 12
      }

      const createRes = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${teacher1Token}`).send(workData).expect(201)

      const workExperienceId = createRes.body.data.work_experience.id

      // 建立第二個教師
      const teacher2Data: RegisterRequest = {
        nick_name: '教師二',
        email: 'teacher2@example.com',
        password: 'Password123中文'
      }

      const teacher2Res = await request(app).post('/api/auth/register').send(teacher2Data).expect(201)
      const teacher2Token = teacher2Res.body.data.access_token

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher2Token}`).send(teacherApplyData).expect(201)

      const updateData = {
        company_name: '試圖更新的公司名稱'
      }

      // Act - 教師二試圖更新教師一的工作經驗
      const res = await request(app).put(`/api/teachers/work-experiences/${workExperienceId}`).set('Authorization', `Bearer ${teacher2Token}`).send(updateData)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('無權限修改此工作經驗記錄')
    })
  })

  describe('DELETE /api/teachers/work-experiences/:id', () => {
    it('應該成功刪除工作經驗', async () => {
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

      // 先新增一個工作經驗
      const workData = {
        is_working: false,
        company_name: '測試公司',
        workplace: '台北',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 1,
        end_year: 2021,
        end_month: 12
      }

      const createRes = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${access_token}`).send(workData).expect(201)

      const workExperienceId = createRes.body.data.work_experience.id

      // Act - 刪除工作經驗
      const res = await request(app).delete(`/api/teachers/work-experiences/${workExperienceId}`).set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('刪除工作經驗成功')
    })

    it('刪除不存在的工作經驗應回傳 404', async () => {
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

      // 建立教師申請
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act
      const res = await request(app).delete('/api/teachers/work-experiences/999').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的工作經驗')
    })

    it('刪除其他教師的工作經驗應回傳 403', async () => {
      // Arrange - 建立第一個教師並新增工作經驗
      const teacher1Data: RegisterRequest = {
        nick_name: '教師一',
        email: 'teacher1@example.com',
        password: 'Password123中文'
      }

      const teacher1Res = await request(app).post('/api/auth/register').send(teacher1Data).expect(201)
      const teacher1Token = teacher1Res.body.data.access_token

      const teacherApplyData: TeacherApplyRequest = {
        nationality: '台灣',
        introduction:
          '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
      }

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher1Token}`).send(teacherApplyData).expect(201)

      const workData = {
        is_working: false,
        company_name: '測試公司',
        workplace: '台北',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 1,
        end_year: 2021,
        end_month: 12
      }

      const createRes = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${teacher1Token}`).send(workData).expect(201)

      const workExperienceId = createRes.body.data.work_experience.id

      // 建立第二個教師
      const teacher2Data: RegisterRequest = {
        nick_name: '教師二',
        email: 'teacher2@example.com',
        password: 'Password123中文'
      }

      const teacher2Res = await request(app).post('/api/auth/register').send(teacher2Data).expect(201)
      const teacher2Token = teacher2Res.body.data.access_token

      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacher2Token}`).send(teacherApplyData).expect(201)

      // Act - 教師二試圖刪除教師一的工作經驗
      const res = await request(app).delete(`/api/teachers/work-experiences/${workExperienceId}`).set('Authorization', `Bearer ${teacher2Token}`)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('無權限刪除此工作經驗記錄')
    })
  })
})
