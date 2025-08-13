import request from 'supertest'
import app from '../../../app'
import { clearDatabase } from '../../helpers/database'
import { TeacherApplyRequest, TeacherApplicationResponse } from '../../../types/teachers'
import { RegisterRequest } from '../../../types/auth'
import { dataSource } from '../../../db/data-source'
import { Teacher } from '../../../entities/Teacher'
import { ApplicationStatus } from '../../../entities/enums'

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
      expect(res.body.message).toBe('建立教師申請成功')
      expect(res.body.data).toHaveProperty('application')
      expect(res.body.data.application).toHaveProperty('id')
      expect(res.body.data.application).toHaveProperty('user_id')
      expect(res.body.data.application).toHaveProperty('nationality')
      expect(res.body.data.application).toHaveProperty('introduction')
      expect(res.body.data.application).toHaveProperty('application_status')
      expect(res.body.data.application).toHaveProperty('created_at')
      expect(res.body.data.application).toHaveProperty('updated_at')
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
      // Arrange - 準備測試資料
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
        password: 'Password123中文'
      }

      // 建立使用者並取得 token
      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      // Act - 在沒有申請記錄的情況下查詢申請狀態
      const res = await request(app).get('/api/teachers/application').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的申請記錄')
    })
  })

  describe('PUT /api/teachers/application', () => {
    it('應該成功更新申請資料', async () => {
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
        nationality: '中國',
        introduction:
          '更新後的自我介紹：我是一位擁有十五年教學經驗的資深講師，專精於全端開發技術，包括前端框架、後端架構設計、資料庫管理等領域。我致力於培養學生的實際開發能力和解決問題的思維。同時我也具備豐富的實務經驗，曾經參與多個大型專案的開發。我相信透過系統化的教學方法和實際案例的分享，能夠有效提升學生的學習成效。'
      }

      // Act - 更新申請資料
      const res = await request(app).put('/api/teachers/application').set('Authorization', `Bearer ${access_token}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('更新申請資料成功')
      expect(res.body.data.application.nationality).toBe(updateData.nationality)
      expect(res.body.data.application.introduction).toBe(updateData.introduction)
    })

    it('未登入使用者應回傳 401', async () => {
      const updateData = {
        nationality: '美國',
        introduction: '測試用的自我介紹，包含足夠的字數來通過驗證規則。這是一個測試用的更新資料，用來驗證未登入使用者無法更新申請資料的情況。'
      }

      const res = await request(app).put('/api/teachers/application').send(updateData)

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('沒有申請記錄應回傳 404', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      const updateData = {
        nationality: '日本',
        introduction:
          '測試用的自我介紹，包含足夠的字數來通過驗證規則。這是一個測試用的更新資料，用來驗證沒有申請記錄時無法更新的情況。這裡需要足夠多的文字內容來確保超過一百字的最低要求。我會添加更多內容來滿足這個條件，包括我的教學理念、專業背景、教學方法等等詳細資訊。'
      }

      // Act - 沒有先建立申請就直接更新
      const res = await request(app).put('/api/teachers/application').set('Authorization', `Bearer ${access_token}`).send(updateData)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的申請記錄')
    })

    it('參數驗證錯誤應回傳 400', async () => {
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

      const invalidData = {
        nationality: 'A'.repeat(51), // 超過50字
        introduction: '太短' // 少於100字
      }

      // Act
      const res = await request(app).put('/api/teachers/application').set('Authorization', `Bearer ${access_token}`).send(invalidData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('nationality')
      expect(res.body.errors).toHaveProperty('introduction')
    })
  })

  describe('POST /api/teachers/resubmit', () => {
    it('應該成功重新提交被拒絕的申請', async () => {
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

      // 直接修改資料庫狀態為 rejected
      await dataSource.getRepository(Teacher).update({ user_id: registerRes.body.data.user.id }, { application_status: ApplicationStatus.REJECTED })

      // Act - 重新提交申請
      const res = await request(app).post('/api/teachers/resubmit').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('申請已重新提交')
      expect(res.body.data.application.application_status).toBe('pending')
    })

    it('未登入使用者應回傳 401', async () => {
      const res = await request(app).post('/api/teachers/resubmit')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('沒有申請記錄應回傳 404', async () => {
      // Arrange
      const userData: RegisterRequest = {
        nick_name: '測試教師',
        email: 'teacher@example.com',
        password: 'Password123中文'
      }

      const registerRes = await request(app).post('/api/auth/register').send(userData).expect(201)
      const { access_token } = registerRes.body.data

      // Act - 沒有先建立申請就直接重新提交
      const res = await request(app).post('/api/teachers/resubmit').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的申請記錄')
    })

    it('申請狀態不是 rejected 應回傳 422', async () => {
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

      // 先建立申請 (狀態為 pending)
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${access_token}`).send(teacherData).expect(201)

      // Act - 嘗試重新提交狀態為 pending 的申請
      const res = await request(app).post('/api/teachers/resubmit').set('Authorization', `Bearer ${access_token}`)

      // Assert
      expect(res.status).toBe(422)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('只有被拒絕的申請才能重新提交')
    })
  })
})
