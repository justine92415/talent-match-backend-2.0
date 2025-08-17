import request from 'supertest'
import app from '@src/app'
import { initTestDatabase, clearDatabase } from '@tests/helpers/database'
import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { TeacherWorkExperience } from '@entities/TeacherWorkExperience'
import { UserRole, ApplicationStatus } from '@entities/enums'
import { ERROR_MESSAGES } from '@constants/Message'

import { validUserData } from '@tests/fixtures/userFixtures'
import { validTeacherApplicationData } from '@tests/fixtures/teacherFixtures'

import { createTestUser, createTestTeacher, createTestWorkExperience, generateAuthToken } from '@tests/helpers/testHelpers'
import { createUniqueEmail } from '@tests/helpers/testUtils'

describe('工作經驗管理 API', () => {
  let testUser: User
  let testTeacher: Teacher
  let authToken: string

  beforeAll(async () => {
    await initTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()

    // 建立測試使用者和教師
    testUser = await createTestUser({
      ...validUserData,
      email: createUniqueEmail(),
      role: UserRole.TEACHER
    })

    testTeacher = await createTestTeacher(testUser.id, {
      ...validTeacherApplicationData,
      application_status: ApplicationStatus.APPROVED
    })

    authToken = generateAuthToken({
      id: testUser.id,
      role: testUser.role,
      uuid: testUser.uuid
    })
  })

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy()
    }
  })

  describe('GET /api/teachers/work-experiences', () => {
    it('應該成功取得工作經驗列表', async () => {
      // 建立測試工作經驗
      const workExperience = await createTestWorkExperience(testTeacher.id, {
        is_working: true,
        company_name: '科技公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '資深工程師',
        start_year: 2020,
        start_month: 3,
        end_year: null,
        end_month: null
      })

      const response = await request(app).get('/api/teachers/work-experiences').set('Authorization', `Bearer ${authToken}`).expect(200)

      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.WORK_EXPERIENCE_LIST_SUCCESS,
        data: {
          work_experiences: [
            {
              id: workExperience.id,
              teacher_id: testTeacher.id,
              is_working: true,
              company_name: '科技公司',
              workplace: '台北市',
              job_category: '軟體開發',
              job_title: '資深工程師',
              start_year: 2020,
              start_month: 3,
              end_year: null,
              end_month: null
            }
          ]
        }
      })

      expect(response.body.data.work_experiences[0]).toHaveProperty('created_at')
      expect(response.body.data.work_experiences[0]).toHaveProperty('updated_at')
    })

    it('應該回傳空陣列當沒有工作經驗時', async () => {
      const response = await request(app).get('/api/teachers/work-experiences').set('Authorization', `Bearer ${authToken}`).expect(200)

      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.WORK_EXPERIENCE_LIST_SUCCESS,
        data: {
          work_experiences: []
        }
      })
    })

    it('應該拒絕未認證的請求', async () => {
      const response = await request(app).get('/api/teachers/work-experiences').expect(401)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.AUTH.TOKEN_REQUIRED)
      })
    })

    it('應該拒絕非教師的請求', async () => {
      const studentUser = await createTestUser({
        ...validUserData,
        email: createUniqueEmail(),
        role: UserRole.STUDENT
      })

      const studentToken = generateAuthToken({
        id: studentUser.id,
        role: studentUser.role,
        uuid: studentUser.uuid
      })

      const response = await request(app).get('/api/teachers/work-experiences').set('Authorization', `Bearer ${studentToken}`).expect(403)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED)
      })
    })
  })

  describe('POST /api/teachers/work-experiences', () => {
    it('應該成功新增工作經驗（在職）', async () => {
      const workExperienceData = {
        is_working: true,
        company_name: 'ABC公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '資深工程師',
        start_year: 2020,
        start_month: 3
      }

      const response = await request(app)
        .post('/api/teachers/work-experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workExperienceData)
        .expect(201)

      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.WORK_EXPERIENCE_CREATED,
        data: {
          work_experience: {
            id: expect.any(Number),
            teacher_id: testTeacher.id,
            is_working: true,
            company_name: 'ABC公司',
            workplace: '台北市',
            job_category: '軟體開發',
            job_title: '資深工程師',
            start_year: 2020,
            start_month: 3,
            end_year: null,
            end_month: null
          }
        }
      })

      expect(response.body.data.work_experience).toHaveProperty('created_at')
      expect(response.body.data.work_experience).toHaveProperty('updated_at')

      // 驗證資料庫中的記錄
      const workExperience = await dataSource.getRepository(TeacherWorkExperience).findOne({ where: { teacher_id: testTeacher.id } })

      expect(workExperience).toBeTruthy()
      expect(workExperience?.company_name).toBe('ABC公司')
    })

    it('應該成功新增工作經驗（離職）', async () => {
      const workExperienceData = {
        is_working: false,
        company_name: 'XYZ公司',
        workplace: '新竹市',
        job_category: '產品管理',
        job_title: '產品經理',
        start_year: 2018,
        start_month: 6,
        end_year: 2023,
        end_month: 12
      }

      const response = await request(app)
        .post('/api/teachers/work-experiences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(workExperienceData)
        .expect(201)

      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.WORK_EXPERIENCE_CREATED,
        data: {
          work_experience: {
            id: expect.any(Number),
            teacher_id: testTeacher.id,
            is_working: false,
            company_name: 'XYZ公司',
            workplace: '新竹市',
            job_category: '產品管理',
            job_title: '產品經理',
            start_year: 2018,
            start_month: 6,
            end_year: 2023,
            end_month: 12
          }
        }
      })
    })

    it('應該拒絕缺少必填欄位的請求', async () => {
      const invalidData = {
        is_working: true,
        company_name: 'ABC公司'
        // 缺少必填欄位
      }

      const response = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${authToken}`).send(invalidData).expect(400)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining(ERROR_MESSAGES.VALIDATION.WORKPLACE_REQUIRED)
      })
    })

    it('應該拒絕無效的日期資料', async () => {
      const invalidData = {
        is_working: false,
        company_name: 'ABC公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2023,
        start_month: 6,
        end_year: 2020, // 結束年份早於開始年份
        end_month: 3
      }

      const response = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${authToken}`).send(invalidData).expect(400)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining(ERROR_MESSAGES.VALIDATION.END_DATE_BEFORE_START_DATE)
      })
    })

    it('應該拒絕在職但提供結束日期的請求', async () => {
      const invalidData = {
        is_working: true,
        company_name: 'ABC公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 3,
        end_year: 2023, // 在職但提供結束日期
        end_month: 12
      }

      const response = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${authToken}`).send(invalidData).expect(400)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining(ERROR_MESSAGES.VALIDATION.WORKING_END_DATE_NOT_ALLOWED)
      })
    })

    it('應該拒絕離職但沒有結束日期的請求', async () => {
      const invalidData = {
        is_working: false,
        company_name: 'ABC公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 3
        // 離職但沒有提供結束日期
      }

      const response = await request(app).post('/api/teachers/work-experiences').set('Authorization', `Bearer ${authToken}`).send(invalidData).expect(400)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining(ERROR_MESSAGES.VALIDATION.NON_WORKING_END_DATE_REQUIRED)
      })
    })

    it('應該拒絕未認證的請求', async () => {
      const workExperienceData = {
        is_working: true,
        company_name: 'ABC公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 3
      }

      const response = await request(app).post('/api/teachers/work-experiences').send(workExperienceData).expect(401)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.AUTH.TOKEN_REQUIRED)
      })
    })

    it('應該拒絕非教師的請求', async () => {
      // 建立學生使用者
      const studentUser = await createTestUser({
        ...validUserData,
        email: createUniqueEmail(),
        role: UserRole.STUDENT
      })

      const studentToken = generateAuthToken({
        id: studentUser.id,
        role: studentUser.role,
        uuid: studentUser.uuid
      })

      const workExperienceData = {
        is_working: true,
        company_name: 'ABC公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 3
      }

      const response = await request(app)
        .post('/api/teachers/work-experiences')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(workExperienceData)
        .expect(403)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED)
      })
    })
  })

  describe('PUT /api/teachers/work-experiences/:id', () => {
    let testWorkExperience: TeacherWorkExperience

    beforeEach(async () => {
      testWorkExperience = await createTestWorkExperience(testTeacher.id, {
        is_working: false,
        company_name: '原公司名稱',
        workplace: '原工作地點',
        job_category: '原工作類別',
        job_title: '原職位',
        start_year: 2020,
        start_month: 3,
        end_year: 2023,
        end_month: 6
      })
    })

    it('應該成功更新工作經驗', async () => {
      const updateData = {
        company_name: '更新的公司名稱',
        workplace: '更新的工作地點',
        job_title: '更新的職位',
        end_year: 2024,
        end_month: 8
      }

      const response = await request(app)
        .put(`/api/teachers/work-experiences/${testWorkExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.WORK_EXPERIENCE_UPDATED,
        data: {
          work_experience: {
            id: testWorkExperience.id,
            teacher_id: testTeacher.id,
            is_working: false,
            company_name: '更新的公司名稱',
            workplace: '更新的工作地點',
            job_category: '原工作類別', // 未更新的欄位保持原值
            job_title: '更新的職位',
            start_year: 2020,
            start_month: 3,
            end_year: 2024,
            end_month: 8
          }
        }
      })

      expect(response.body.data.work_experience).toHaveProperty('updated_at')
    })

    it('應該成功將離職工作經驗改為在職', async () => {
      const updateData = {
        is_working: true,
        end_year: null,
        end_month: null
      }

      const response = await request(app)
        .put(`/api/teachers/work-experiences/${testWorkExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.data.work_experience).toMatchObject({
        is_working: true,
        end_year: null,
        end_month: null
      })
    })

    it('應該拒絕更新不存在的工作經驗', async () => {
      const updateData = {
        company_name: '新公司名稱'
      }

      const response = await request(app).put('/api/teachers/work-experiences/99999').set('Authorization', `Bearer ${authToken}`).send(updateData).expect(404)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'APPLICATION_NOT_FOUND',
        message: expect.stringContaining(ERROR_MESSAGES.BUSINESS.WORK_EXPERIENCE_RECORD_NOT_FOUND)
      })
    })

    it('應該拒絕更新非自己的工作經驗', async () => {
      // 建立另一個教師使用者
      const otherUser = await createTestUser({
        ...validUserData,
        email: createUniqueEmail(),
        role: UserRole.TEACHER
      })

      const otherTeacher = await createTestTeacher(otherUser.id, {
        ...validTeacherApplicationData,
        application_status: ApplicationStatus.APPROVED
      })

      const otherToken = generateAuthToken({
        id: otherUser.id,
        role: otherUser.role,
        uuid: otherUser.uuid
      })

      const updateData = {
        company_name: '駭客嘗試更新'
      }

      const response = await request(app)
        .put(`/api/teachers/work-experiences/${testWorkExperience.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.BUSINESS.UNAUTHORIZED_WORK_EXPERIENCE_ACCESS)
      })
    })

    it('應該拒絕無效的日期更新', async () => {
      const updateData = {
        start_year: 2023,
        end_year: 2020 // 結束年份早於開始年份
      }

      const response = await request(app)
        .put(`/api/teachers/work-experiences/${testWorkExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: expect.stringContaining(ERROR_MESSAGES.VALIDATION.END_DATE_BEFORE_START_DATE)
      })
    })

    it('應該拒絕未認證的請求', async () => {
      const updateData = {
        company_name: '新公司名稱'
      }

      const response = await request(app).put(`/api/teachers/work-experiences/${testWorkExperience.id}`).send(updateData).expect(401)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.AUTH.TOKEN_REQUIRED)
      })
    })
  })

  describe('DELETE /api/teachers/work-experiences/:id', () => {
    let testWorkExperience: TeacherWorkExperience

    beforeEach(async () => {
      testWorkExperience = await createTestWorkExperience(testTeacher.id, {
        is_working: false,
        company_name: '要刪除的公司',
        workplace: '台北市',
        job_category: '軟體開發',
        job_title: '工程師',
        start_year: 2020,
        start_month: 3,
        end_year: 2023,
        end_month: 6
      })
    })

    it('應該成功刪除工作經驗', async () => {
      const response = await request(app)
        .delete(`/api/teachers/work-experiences/${testWorkExperience.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        status: 'success',
        message: ERROR_MESSAGES.SUCCESS.WORK_EXPERIENCE_DELETED,
        data: null
      })

      // 驗證資料庫中已刪除
      const deletedExperience = await dataSource.getRepository(TeacherWorkExperience).findOne({ where: { id: testWorkExperience.id } })

      expect(deletedExperience).toBeNull()
    })

    it('應該拒絕刪除不存在的工作經驗', async () => {
      const response = await request(app).delete('/api/teachers/work-experiences/99999').set('Authorization', `Bearer ${authToken}`).expect(404)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'APPLICATION_NOT_FOUND',
        message: expect.stringContaining(ERROR_MESSAGES.BUSINESS.WORK_EXPERIENCE_RECORD_NOT_FOUND)
      })
    })

    it('應該拒絕刪除非自己的工作經驗', async () => {
      // 建立另一個教師使用者
      const otherUser = await createTestUser({
        ...validUserData,
        email: createUniqueEmail(),
        role: UserRole.TEACHER
      })

      const otherTeacher = await createTestTeacher(otherUser.id, {
        ...validTeacherApplicationData,
        application_status: ApplicationStatus.APPROVED
      })

      const otherToken = generateAuthToken({
        id: otherUser.id,
        role: otherUser.role,
        uuid: otherUser.uuid
      })

      const response = await request(app)
        .delete(`/api/teachers/work-experiences/${testWorkExperience.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.BUSINESS.UNAUTHORIZED_WORK_EXPERIENCE_DELETE)
      })
    })

    it('應該拒絕未認證的請求', async () => {
      const response = await request(app).delete(`/api/teachers/work-experiences/${testWorkExperience.id}`).expect(401)

      expect(response.body).toMatchObject({
        status: 'error',
        code: 'UNAUTHORIZED_ACCESS',
        message: expect.stringContaining(ERROR_MESSAGES.AUTH.TOKEN_REQUIRED)
      })
    })
  })
})
