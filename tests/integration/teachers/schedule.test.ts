import request from 'supertest'
import app from '../../../app'
import { clearDatabase, initTestDatabase, closeTestDatabase } from '../../helpers/database'
import { TeacherApplyRequest } from '../../../types/teachers'
import { ApplicationStatus } from '../../../entities/enums'

describe('Teachers Schedule API', () => {
  let teacherToken: string

  beforeAll(async () => {
    // 初始化測試資料庫連線
    await initTestDatabase()

    // 建立測試教師用戶並取得 token
    const teacherRegisterData = {
      nick_name: '時間管理教師',
      email: 'teacher_schedule@test.com',
      password: 'password123中文'
    }

    const registerRes = await request(app).post('/api/auth/register').send(teacherRegisterData)
    expect(registerRes.status).toBe(201)

    const loginRes = await request(app).post('/api/auth/login').send({
      email: teacherRegisterData.email,
      password: teacherRegisterData.password
    })
    expect(loginRes.status).toBe(200)
    teacherToken = loginRes.body.data.access_token

    // 提交教師申請
    const teacherApplyData = {
      nationality: '台灣',
      introduction:
        '專門提供時間管理課程的專業教師，具有豐富的教學經驗和時間規劃專業知識。致力於幫助學生建立良好的時間觀念和管理技巧，透過系統化的教學方法和實用的時間管理工具，協助學生提升學習效率和生活品質。我曾經在多個教育機構任教，累積了豐富的教學經驗，深深了解不同學生的學習需求和困難點。'
    }

    const applyRes = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacherToken}`).send(teacherApplyData)
    expect(applyRes.status).toBe(201)
  }, 30000)

  afterAll(async () => {
    await closeTestDatabase()
  }, 30000)

  beforeEach(async () => {
    // 只清理時間表資料，保留使用者和教師資料
    const { dataSource } = await import('../../../db/data-source')
    const { TeacherAvailableSlot } = await import('../../../entities/TeacherAvailableSlot')
    const slotRepository = dataSource.getRepository(TeacherAvailableSlot)
    await slotRepository.query('DELETE FROM teacher_available_slots')
  }, 15000)

  describe('GET /api/teachers/schedule', () => {
    it('應該成功取得空的時間表設定', async () => {
      const res = await request(app).get('/api/teachers/schedule').set('Authorization', `Bearer ${teacherToken}`)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('查詢成功')
      expect(res.body.data).toHaveProperty('schedule')
      expect(Array.isArray(res.body.data.schedule)).toBe(true)
    })

    it('未登入用戶應回傳 401', async () => {
      const res = await request(app).get('/api/teachers/schedule')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })
  })

  describe('PUT /api/teachers/schedule', () => {
    it('應該成功更新時間表設定', async () => {
      const scheduleData = {
        schedule: [
          {
            weekday: 1, // 週一
            start_time: '09:00',
            end_time: '12:00',
            is_active: true
          },
          {
            weekday: 3, // 週三
            start_time: '14:00',
            end_time: '17:00',
            is_active: true
          }
        ]
      }

      const res = await request(app).put('/api/teachers/schedule').set('Authorization', `Bearer ${teacherToken}`).send(scheduleData)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('更新時間表成功')
      expect(res.body.data).toHaveProperty('schedule')
      expect(res.body.data.schedule).toHaveLength(2)
    })

    it('未登入用戶應回傳 401', async () => {
      const scheduleData = {
        schedule: [
          {
            weekday: 1,
            start_time: '09:00',
            end_time: '12:00',
            is_active: true
          }
        ]
      }

      const res = await request(app).put('/api/teachers/schedule').send(scheduleData)

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('無效的星期數應回傳 400', async () => {
      const scheduleData = {
        schedule: [
          {
            weekday: 7, // 無效值
            start_time: '09:00',
            end_time: '12:00',
            is_active: true
          }
        ]
      }

      const res = await request(app).put('/api/teachers/schedule').set('Authorization', `Bearer ${teacherToken}`).send(scheduleData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
    })

    it('無效的時間格式應回傳 400', async () => {
      const scheduleData = {
        schedule: [
          {
            weekday: 1,
            start_time: '25:00', // 無效時間
            end_time: '12:00',
            is_active: true
          }
        ]
      }

      const res = await request(app).put('/api/teachers/schedule').set('Authorization', `Bearer ${teacherToken}`).send(scheduleData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
    })

    it('結束時間早於開始時間應回傳 400', async () => {
      const scheduleData = {
        schedule: [
          {
            weekday: 1,
            start_time: '15:00',
            end_time: '12:00', // 早於開始時間
            is_active: true
          }
        ]
      }

      const res = await request(app).put('/api/teachers/schedule').set('Authorization', `Bearer ${teacherToken}`).send(scheduleData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
    })

    it('缺少必填欄位應回傳 400', async () => {
      const scheduleData = {
        schedule: [
          {
            weekday: 1,
            start_time: '09:00'
            // 缺少 end_time
          }
        ]
      }

      const res = await request(app).put('/api/teachers/schedule').set('Authorization', `Bearer ${teacherToken}`).send(scheduleData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
    })
  })

  describe('GET /api/teachers/schedule/conflicts', () => {
    it('應該成功檢查時段衝突（無衝突）', async () => {
      const res = await request(app)
        .get('/api/teachers/schedule/conflicts')
        .query({
          weekday: 2, // 週二（無設定）
          start_time: '10:00',
          end_time: '11:00'
        })
        .set('Authorization', `Bearer ${teacherToken}`)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('檢查完成')
      expect(res.body.data).toHaveProperty('has_conflict')
      expect(res.body.data.has_conflict).toBe(false)
    })

    it('應該檢測到時段衝突', async () => {
      // 先取得教師 ID
      const { dataSource } = await import('../../../db/data-source')
      const { Teacher } = await import('../../../entities/Teacher')
      const { TeacherAvailableSlot } = await import('../../../entities/TeacherAvailableSlot')

      const teacherRepository = dataSource.getRepository(Teacher)
      const teacher = await teacherRepository.findOne({ where: { application_status: ApplicationStatus.PENDING } })
      expect(teacher).toBeTruthy()

      const slotRepository = dataSource.getRepository(TeacherAvailableSlot)
      await slotRepository.save([
        {
          teacher_id: teacher!.id,
          weekday: 1,
          start_time: '09:00',
          end_time: '12:00',
          is_active: true
        },
        {
          teacher_id: teacher!.id,
          weekday: 1,
          start_time: '14:00',
          end_time: '17:00',
          is_active: true
        }
      ])

      const res = await request(app)
        .get('/api/teachers/schedule/conflicts')
        .query({
          weekday: 1, // 週一（已設定）
          start_time: '10:00',
          end_time: '11:00'
        })
        .set('Authorization', `Bearer ${teacherToken}`)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('檢查完成')
      expect(res.body.data).toHaveProperty('has_conflict')
      expect(res.body.data.has_conflict).toBe(true)
      expect(res.body.data).toHaveProperty('conflicts')
      expect(Array.isArray(res.body.data.conflicts)).toBe(true)
    })

    it('未登入用戶應回傳 401', async () => {
      const res = await request(app).get('/api/teachers/schedule/conflicts').query({
        weekday: 1,
        start_time: '10:00',
        end_time: '11:00'
      })

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('缺少查詢參數應回傳 400', async () => {
      const res = await request(app).get('/api/teachers/schedule/conflicts').set('Authorization', `Bearer ${teacherToken}`)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
    })
  })
})
