import request from 'supertest'
import app from '../../../app'
import { initTestDatabase, closeTestDatabase } from '../../helpers/database'
import { CreateCourseRequest, UpdateCourseRequest } from '../../../types/courses'
import { CourseStatus, ApplicationStatus } from '../../../entities/enums'

describe('Courses API - Phase 1: Draft Create & Query', () => {
  let teacherToken: string
  let teacherId: number
  let courseId: number

  beforeAll(async () => {
    // 初始化測試資料庫連線
    await initTestDatabase()

    // 建立測試教師用戶並取得 token
    const teacherRegisterData = {
      nick_name: '課程建立教師',
      email: 'teacher_course@test.com',
      password: 'password123中文'
    }

    const registerRes = await request(app).post('/api/auth/register').send(teacherRegisterData)
    expect(registerRes.status).toBe(201)
    teacherId = registerRes.body.data.user.id

    const loginRes = await request(app).post('/api/auth/login').send({
      email: teacherRegisterData.email,
      password: teacherRegisterData.password
    })
    expect(loginRes.status).toBe(200)
    teacherToken = loginRes.body.data.access_token

    // 提交教師申請並批准
    const teacherApplyData = {
      nationality: '台灣',
      introduction:
        '專業課程建立教師，具有豐富的教學經驗和課程設計能力。致力於提供高品質的教學內容，幫助學生達成學習目標。擁有多年的教育背景和實務經驗，能夠設計出符合學生需求的課程內容和教學方法，補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數。'
    }

    const applyRes = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacherToken}`).send(teacherApplyData)
    expect(applyRes.status).toBe(201)

    // 模擬管理員批准教師申請
    const { dataSource } = await import('../../../db/data-source')
    const { Teacher } = await import('../../../entities/Teacher')
    const teacherRepository = dataSource.getRepository(Teacher)
    await teacherRepository.update({ user_id: teacherId }, { application_status: ApplicationStatus.APPROVED })
  }, 30000)

  afterAll(async () => {
    await closeTestDatabase()
  }, 30000)

  beforeEach(async () => {
    // 只清理課程相關資料，保留使用者和教師資料
    const { dataSource } = await import('../../../db/data-source')
    const { Course } = await import('../../../entities/Course')
    const { CoursePriceOption } = await import('../../../entities/CoursePriceOption')

    const courseRepository = dataSource.getRepository(Course)
    const priceOptionRepository = dataSource.getRepository(CoursePriceOption)

    await priceOptionRepository.query('DELETE FROM course_price_options')
    await courseRepository.query('DELETE FROM courses')
  })

  describe('POST /api/courses', () => {
    it('使用有效資料應該成功建立課程草稿', async () => {
      // Arrange
      const courseData: CreateCourseRequest = {
        name: '測試課程：JavaScript 基礎入門',
        content: '這是一門專為初學者設計的 JavaScript 基礎課程',
        main_category_id: 1,
        sub_category_id: 1,
        city_id: 1,
        survey_url: 'https://forms.google.com/test',
        purchase_message: '感謝您購買本課程，請加入 LINE 群組'
      }

      // Act
      const res = await request(app).post('/api/courses').set('Authorization', `Bearer ${teacherToken}`).send(courseData)

      // Assert
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('建立課程成功')
      expect(res.body.data).toHaveProperty('course')
      expect(res.body.data.course).toHaveProperty('id')
      expect(res.body.data.course).toHaveProperty('uuid')
      expect(res.body.data.course.teacher_id).toBe(teacherId)
      expect(res.body.data.course.name).toBe(courseData.name)
      expect(res.body.data.course.content).toBe(courseData.content)
      expect(res.body.data.course.status).toBe(CourseStatus.DRAFT)
      expect(res.body.data.course.application_status).toBe(ApplicationStatus.PENDING)

      // 保存課程ID供後續測試使用
      courseId = res.body.data.course.id
    })

    it('僅填寫課程名稱應該成功建立最小草稿', async () => {
      // Arrange
      const courseData: CreateCourseRequest = {
        name: '最小草稿課程'
      }

      // Act
      const res = await request(app).post('/api/courses').set('Authorization', `Bearer ${teacherToken}`).send(courseData)

      // Assert
      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('建立課程成功')
      expect(res.body.data.course.name).toBe(courseData.name)
      expect(res.body.data.course.status).toBe(CourseStatus.DRAFT)
      expect(res.body.data.course.content).toBeUndefined()
    })

    it('課程名稱為空應該回傳參數驗證錯誤', async () => {
      // Arrange
      const courseData: CreateCourseRequest = {
        name: ''
      }

      // Act
      const res = await request(app).post('/api/courses').set('Authorization', `Bearer ${teacherToken}`).send(courseData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('name')
      expect(res.body.errors.name).toContain('課程名稱為必填欄位')
    })

    it('課程名稱超過長度限制應該回傳參數驗證錯誤', async () => {
      // Arrange
      const courseData: CreateCourseRequest = {
        name: 'a'.repeat(201) // 超過200字元限制
      }

      // Act
      const res = await request(app).post('/api/courses').set('Authorization', `Bearer ${teacherToken}`).send(courseData)

      // Assert
      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('name')
      expect(res.body.errors.name).toContain('課程名稱長度不得超過200字')
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Arrange
      const courseData: CreateCourseRequest = {
        name: '未授權課程'
      }

      // Act
      const res = await request(app).post('/api/courses').send(courseData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('非教師用戶應該回傳403錯誤', async () => {
      // 建立一般用戶
      const studentData = {
        nick_name: '一般學生',
        email: 'student@test.com',
        password: 'password123中文'
      }

      const studentRegisterRes = await request(app).post('/api/auth/register').send(studentData)
      expect(studentRegisterRes.status).toBe(201)

      const studentLoginRes = await request(app).post('/api/auth/login').send({
        email: studentData.email,
        password: studentData.password
      })
      expect(studentLoginRes.status).toBe(200)
      const studentToken = studentLoginRes.body.data.access_token

      // Arrange
      const courseData: CreateCourseRequest = {
        name: '學生建立的課程'
      }

      // Act
      const res = await request(app).post('/api/courses').set('Authorization', `Bearer ${studentToken}`).send(courseData)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法建立課程')
    })
  })

  describe('GET /api/courses/{id}', () => {
    beforeEach(async () => {
      // 建立測試課程
      const courseData: CreateCourseRequest = {
        name: '查詢測試課程',
        content: '這是用於測試查詢功能的課程'
      }

      const createRes = await request(app).post('/api/courses').set('Authorization', `Bearer ${teacherToken}`).send(courseData)

      courseId = createRes.body.data.course.id
    })

    it('使用有效課程ID應該成功取得課程詳情', async () => {
      // Act
      const res = await request(app).get(`/api/courses/${courseId}`).set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('查詢成功')
      expect(res.body.data).toHaveProperty('course')
      expect(res.body.data.course.id).toBe(courseId)
      expect(res.body.data.course.teacher_id).toBe(teacherId)
      expect(res.body.data.course.name).toBe('查詢測試課程')
      expect(res.body.data.course.status).toBe(CourseStatus.DRAFT)
    })

    it('查詢不存在的課程ID應該回傳404錯誤', async () => {
      // Act
      const res = await request(app).get('/api/courses/99999').set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的課程')
    })

    it('查詢他人的課程應該回傳403錯誤', async () => {
      // 建立另一個教師
      const otherTeacherData = {
        nick_name: '其他教師',
        email: 'other_teacher@test.com',
        password: 'password123中文'
      }

      const otherRegisterRes = await request(app).post('/api/auth/register').send(otherTeacherData)
      const otherTeacherId = otherRegisterRes.body.data.user.id

      const otherLoginRes = await request(app).post('/api/auth/login').send({
        email: otherTeacherData.email,
        password: otherTeacherData.password
      })
      const otherTeacherToken = otherLoginRes.body.data.access_token

      // 讓另一個教師也變成已批准狀態
      const { dataSource } = await import('../../../db/data-source')
      const { Teacher } = await import('../../../entities/Teacher')
      const teacherRepository = dataSource.getRepository(Teacher)

      // 建立教師申請
      const teacherApplyData = {
        nationality: '台灣',
        introduction: '其他教師的介紹內容'
      }
      await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${otherTeacherToken}`).send(teacherApplyData)

      // 批准申請
      await teacherRepository.update({ user_id: otherTeacherId }, { application_status: ApplicationStatus.APPROVED })

      // Act - 其他教師嘗試查詢原教師的課程
      const res = await request(app).get(`/api/courses/${courseId}`).set('Authorization', `Bearer ${otherTeacherToken}`)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法查看此課程')
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Act
      const res = await request(app).get(`/api/courses/${courseId}`)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })
  })

  describe('GET /api/courses', () => {
    beforeEach(async () => {
      // 建立多個測試課程
      const courses = [
        { name: '課程1', content: '課程1內容' },
        { name: '課程2', content: '課程2內容' },
        { name: '課程3', content: '課程3內容' }
      ]

      for (const courseData of courses) {
        await request(app).post('/api/courses').set('Authorization', `Bearer ${teacherToken}`).send(courseData)
      }
    })

    it('應該成功取得教師課程列表', async () => {
      // Act
      const res = await request(app).get('/api/courses').set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('查詢成功')
      expect(res.body.data).toHaveProperty('courses')
      expect(res.body.data).toHaveProperty('total')
      expect(res.body.data).toHaveProperty('page')
      expect(res.body.data).toHaveProperty('per_page')
      expect(res.body.data).toHaveProperty('total_pages')
      expect(res.body.data.courses).toHaveLength(3)
      expect(res.body.data.total).toBe(3)
      expect(res.body.data.page).toBe(1)
      expect(res.body.data.per_page).toBe(10)

      // 驗證課程資料
      res.body.data.courses.forEach((course: any) => {
        expect(course.teacher_id).toBe(teacherId)
        expect(course.status).toBe(CourseStatus.DRAFT)
      })
    })

    it('使用分頁參數應該正確回傳分頁資料', async () => {
      // Act
      const res = await request(app).get('/api/courses?page=1&per_page=2').set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.data.courses).toHaveLength(2)
      expect(res.body.data.total).toBe(3)
      expect(res.body.data.page).toBe(1)
      expect(res.body.data.per_page).toBe(2)
      expect(res.body.data.total_pages).toBe(2)
    })

    it('使用狀態篩選應該正確回傳符合條件的課程', async () => {
      // Act
      const res = await request(app).get('/api/courses?status=draft').set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.data.courses).toHaveLength(3)
      res.body.data.courses.forEach((course: any) => {
        expect(course.status).toBe(CourseStatus.DRAFT)
      })
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Act
      const res = await request(app).get('/api/courses')

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('非教師用戶應該回傳403錯誤', async () => {
      // 建立一般用戶
      const studentData = {
        nick_name: '一般學生',
        email: 'student_list@test.com',
        password: 'password123中文'
      }

      const studentRegisterRes = await request(app).post('/api/auth/register').send(studentData)
      const studentLoginRes = await request(app).post('/api/auth/login').send({
        email: studentData.email,
        password: studentData.password
      })
      const studentToken = studentLoginRes.body.data.access_token

      // Act
      const res = await request(app).get('/api/courses').set('Authorization', `Bearer ${studentToken}`)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法查看課程列表')
    })
  })
})
