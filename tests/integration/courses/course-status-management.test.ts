import request from 'supertest'
import app from '../../../app'
import { initTestDatabase, closeTestDatabase } from '../../helpers/database'
import { CourseSubmitRequest, CourseArchiveRequest, UpdateCourseRequest } from '../../../types/courses'
import { CourseStatus, ApplicationStatus } from '../../../entities/enums'

describe('Courses API - Phase 2: Status Management', () => {
  let teacherToken: string
  let teacherId: number
  let otherTeacherToken: string
  let otherTeacherId: number
  let studentToken: string
  let courseId: number

  beforeAll(async () => {
    // 初始化測試資料庫連線
    await initTestDatabase()

    // 建立主要測試教師用戶並取得 token
    const teacherRegisterData = {
      nick_name: '狀態管理教師',
      email: 'status_teacher@test.com',
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
        '專業狀態管理教師，具有豐富的教學經驗和課程設計能力。致力於提供高品質的教學內容，幫助學生達成學習目標。擁有多年的教育背景和實務經驗，能夠設計出符合學生需求的課程內容和教學方法，補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數補充字數。'
    }

    const applyRes = await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacherToken}`).send(teacherApplyData)
    expect(applyRes.status).toBe(201)

    // 模擬管理員批准教師申請
    const { dataSource } = await import('../../../db/data-source')
    const { Teacher } = await import('../../../entities/Teacher')
    const teacherRepository = dataSource.getRepository(Teacher)
    await teacherRepository.update({ user_id: teacherId }, { application_status: ApplicationStatus.APPROVED })

    // 建立其他教師用戶
    const otherTeacherRegisterData = {
      nick_name: '其他教師',
      email: 'other_status_teacher@test.com',
      password: 'password123中文'
    }

    const otherRegisterRes = await request(app).post('/api/auth/register').send(otherTeacherRegisterData)
    expect(otherRegisterRes.status).toBe(201)
    otherTeacherId = otherRegisterRes.body.data.user.id

    const otherLoginRes = await request(app).post('/api/auth/login').send({
      email: otherTeacherRegisterData.email,
      password: otherTeacherRegisterData.password
    })
    expect(otherLoginRes.status).toBe(200)
    otherTeacherToken = otherLoginRes.body.data.access_token

    // 提交並批准其他教師申請
    await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${otherTeacherToken}`).send(teacherApplyData)
    await teacherRepository.update({ user_id: otherTeacherId }, { application_status: ApplicationStatus.APPROVED })

    // 建立學生用戶
    const studentRegisterData = {
      nick_name: '測試學生',
      email: 'status_student@test.com',
      password: 'password123中文'
    }

    const studentRegisterRes = await request(app).post('/api/auth/register').send(studentRegisterData)
    expect(studentRegisterRes.status).toBe(201)

    const studentLoginRes = await request(app).post('/api/auth/login').send({
      email: studentRegisterData.email,
      password: studentRegisterData.password
    })
    expect(studentLoginRes.status).toBe(200)
    studentToken = studentLoginRes.body.data.access_token
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

    // 重新建立測試課程（草稿狀態）
    const courseData = {
      name: '狀態管理測試課程',
      content: '這是一個用於測試狀態管理的課程內容'
    }

    const courseResponse = await request(app).post('/api/courses').set('Authorization', `Bearer ${teacherToken}`).send(courseData)
    expect(courseResponse.status).toBe(201)
    courseId = courseResponse.body.data.course.id
  })

  describe('PUT /api/courses/:id', () => {
    it('應該成功更新草稿狀態的課程', async () => {
      // Arrange
      const updateData: UpdateCourseRequest = {
        name: '更新的課程名稱',
        content: '更新的課程內容',
        main_category_id: 2,
        sub_category_id: 3
      }

      // Act
      const res = await request(app).put(`/api/courses/${courseId}`).set('Authorization', `Bearer ${teacherToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('更新課程成功')
      expect(res.body.data.course.id).toBe(courseId)
      expect(res.body.data.course.name).toBe(updateData.name)
      expect(res.body.data.course.content).toBe(updateData.content)
      expect(res.body.data.course.main_category_id).toBe(updateData.main_category_id)
    })

    it('嘗試更新不存在的課程應該回傳404錯誤', async () => {
      // Arrange
      const updateData: UpdateCourseRequest = {
        name: '不存在的課程'
      }

      // Act
      const res = await request(app).put('/api/courses/99999').set('Authorization', `Bearer ${teacherToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的課程')
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Arrange
      const updateData: UpdateCourseRequest = {
        name: '未授權更新'
      }

      // Act
      const res = await request(app).put(`/api/courses/${courseId}`).send(updateData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('非課程擁有者應該回傳403錯誤', async () => {
      // Arrange
      const updateData: UpdateCourseRequest = {
        name: '非擁有者更新'
      }

      // Act
      const res = await request(app).put(`/api/courses/${courseId}`).set('Authorization', `Bearer ${otherTeacherToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法修改此課程')
    })

    it('非教師用戶應該回傳403錯誤', async () => {
      // Arrange
      const updateData: UpdateCourseRequest = {
        name: '學生更新課程'
      }

      // Act
      const res = await request(app).put(`/api/courses/${courseId}`).set('Authorization', `Bearer ${studentToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法修改此課程')
    })

    it('嘗試更新已提交審核的課程應該回傳422錯誤', async () => {
      // Arrange - 提交課程審核
      await request(app).post(`/api/courses/${courseId}/submit`).set('Authorization', `Bearer ${teacherToken}`).send({ submission_notes: '提交審核' })

      const updateData: UpdateCourseRequest = {
        name: '嘗試更新審核中的課程'
      }

      // Act
      const res = await request(app).put(`/api/courses/${courseId}`).set('Authorization', `Bearer ${teacherToken}`).send(updateData)

      // Assert
      expect(res.status).toBe(422)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('課程已提交審核，無法修改')
    })
  })

  describe('DELETE /api/courses/:id', () => {
    it('應該成功刪除草稿狀態的課程', async () => {
      // Act
      const res = await request(app).delete(`/api/courses/${courseId}`).set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('刪除課程成功')

      // 驗證課程已被軟刪除
      const verifyRes = await request(app).get(`/api/courses/${courseId}`).set('Authorization', `Bearer ${teacherToken}`)
      expect(verifyRes.status).toBe(404)
    })

    it('嘗試刪除不存在的課程應該回傳404錯誤', async () => {
      // Act
      const res = await request(app).delete('/api/courses/99999').set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的課程')
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Act
      const res = await request(app).delete(`/api/courses/${courseId}`)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('非課程擁有者應該回傳403錯誤', async () => {
      // Act
      const res = await request(app).delete(`/api/courses/${courseId}`).set('Authorization', `Bearer ${otherTeacherToken}`)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法刪除此課程')
    })

    it('非教師用戶應該回傳403錯誤', async () => {
      // Act
      const res = await request(app).delete(`/api/courses/${courseId}`).set('Authorization', `Bearer ${studentToken}`)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法刪除此課程')
    })

    it('嘗試刪除已提交審核的課程應該回傳422錯誤', async () => {
      // Arrange - 提交課程審核
      await request(app).post(`/api/courses/${courseId}/submit`).set('Authorization', `Bearer ${teacherToken}`).send({ submission_notes: '提交審核' })

      // Act
      const res = await request(app).delete(`/api/courses/${courseId}`).set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(422)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('課程已提交審核，無法刪除')
    })
  })

  describe('POST /api/courses/:id/submit', () => {
    it('應該成功提交草稿狀態的課程進行審核', async () => {
      // Arrange
      const submitData: CourseSubmitRequest = {
        submission_notes: '課程已完成，請審核'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/submit`).set('Authorization', `Bearer ${teacherToken}`).send(submitData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('課程已提交審核')
      expect(res.body.data.course.id).toBe(courseId)
      expect(res.body.data.course.application_status).toBe(ApplicationStatus.PENDING)
      expect(res.body.data.course.submission_notes).toBe(submitData.submission_notes)
    })

    it('嘗試提交非草稿狀態的課程應該回傳422錯誤', async () => {
      // Arrange - 先提交課程使其變為 PENDING 狀態
      await request(app).post(`/api/courses/${courseId}/submit`).set('Authorization', `Bearer ${teacherToken}`).send({ submission_notes: '第一次提交' })

      const submitData: CourseSubmitRequest = {
        submission_notes: '重複提交'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/submit`).set('Authorization', `Bearer ${teacherToken}`).send(submitData)

      // Assert
      expect(res.status).toBe(422)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('課程已在審核中，無法重複提交')
    })

    it('嘗試提交不存在的課程應該回傳404錯誤', async () => {
      // Arrange
      const submitData: CourseSubmitRequest = {
        submission_notes: '不存在的課程'
      }

      // Act
      const res = await request(app).post('/api/courses/99999/submit').set('Authorization', `Bearer ${teacherToken}`).send(submitData)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的課程')
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Arrange
      const submitData: CourseSubmitRequest = {
        submission_notes: '未授權提交'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/submit`).send(submitData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('非課程擁有者應該回傳403錯誤', async () => {
      // Arrange
      const submitData: CourseSubmitRequest = {
        submission_notes: '非擁有者提交'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/submit`).set('Authorization', `Bearer ${otherTeacherToken}`).send(submitData)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法提交此課程')
    })
  })

  describe('POST /api/courses/:id/publish', () => {
    beforeEach(async () => {
      // 將課程狀態設為已提交審核狀態以便測試發布功能
      const { dataSource } = await import('../../../db/data-source')
      const { Course } = await import('../../../entities/Course')
      const courseRepository = dataSource.getRepository(Course)
      await courseRepository.update(courseId, {
        application_status: ApplicationStatus.APPROVED
      })
    })

    it('應該成功發布已批准的課程', async () => {
      // Act
      const res = await request(app).post(`/api/courses/${courseId}/publish`).set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('發布課程成功')
      expect(res.body.data.course.id).toBe(courseId)
      expect(res.body.data.course.status).toBe(CourseStatus.PUBLISHED)
    })

    it('嘗試發布非已批准狀態的課程應該回傳422錯誤', async () => {
      // Arrange - 將課程設為 DRAFT 狀態
      const { dataSource } = await import('../../../db/data-source')
      const { Course } = await import('../../../entities/Course')
      const courseRepository = dataSource.getRepository(Course)
      await courseRepository.update(courseId, {
        status: CourseStatus.DRAFT,
        application_status: ApplicationStatus.PENDING
      })

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/publish`).set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(422)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('只能發布已批准的課程')
    })

    it('嘗試發布不存在的課程應該回傳404錯誤', async () => {
      // Act
      const res = await request(app).post('/api/courses/99999/publish').set('Authorization', `Bearer ${teacherToken}`)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的課程')
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Act
      const res = await request(app).post(`/api/courses/${courseId}/publish`)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('非課程擁有者應該回傳403錯誤', async () => {
      // Act
      const res = await request(app).post(`/api/courses/${courseId}/publish`).set('Authorization', `Bearer ${otherTeacherToken}`)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法發布此課程')
    })
  })

  describe('POST /api/courses/:id/archive', () => {
    beforeEach(async () => {
      // 將課程狀態設為 PUBLISHED 以便測試封存功能
      const { dataSource } = await import('../../../db/data-source')
      const { Course } = await import('../../../entities/Course')
      const courseRepository = dataSource.getRepository(Course)
      await courseRepository.update(courseId, {
        status: CourseStatus.PUBLISHED,
        application_status: ApplicationStatus.APPROVED
      })
    })

    it('應該成功封存已發布的課程', async () => {
      // Arrange
      const archiveData: CourseArchiveRequest = {
        archive_reason: '課程已過時，需要更新'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/archive`).set('Authorization', `Bearer ${teacherToken}`).send(archiveData)

      // Assert
      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('封存課程成功')
      expect(res.body.data.course.id).toBe(courseId)
      expect(res.body.data.course.status).toBe(CourseStatus.ARCHIVED)
      expect(res.body.data.course.archive_reason).toBe(archiveData.archive_reason)
    })

    it('嘗試封存非已發布狀態的課程應該回傳422錯誤', async () => {
      // Arrange - 將課程設為 DRAFT 狀態
      const { dataSource } = await import('../../../db/data-source')
      const { Course } = await import('../../../entities/Course')
      const courseRepository = dataSource.getRepository(Course)
      await courseRepository.update(courseId, {
        status: CourseStatus.DRAFT,
        application_status: ApplicationStatus.PENDING
      })

      const archiveData: CourseArchiveRequest = {
        archive_reason: '封存草稿課程'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/archive`).set('Authorization', `Bearer ${teacherToken}`).send(archiveData)

      // Assert
      expect(res.status).toBe(422)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('只能封存已發布的課程')
    })

    it('嘗試封存不存在的課程應該回傳404錯誤', async () => {
      // Arrange
      const archiveData: CourseArchiveRequest = {
        archive_reason: '不存在的課程'
      }

      // Act
      const res = await request(app).post('/api/courses/99999/archive').set('Authorization', `Bearer ${teacherToken}`).send(archiveData)

      // Assert
      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的課程')
    })

    it('未登入用戶應該回傳401錯誤', async () => {
      // Arrange
      const archiveData: CourseArchiveRequest = {
        archive_reason: '未授權封存'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/archive`).send(archiveData)

      // Assert
      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('請先登入')
    })

    it('非課程擁有者應該回傳403錯誤', async () => {
      // Arrange
      const archiveData: CourseArchiveRequest = {
        archive_reason: '非擁有者封存'
      }

      // Act
      const res = await request(app).post(`/api/courses/${courseId}/archive`).set('Authorization', `Bearer ${otherTeacherToken}`).send(archiveData)

      // Assert
      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法封存此課程')
    })
  })
})
