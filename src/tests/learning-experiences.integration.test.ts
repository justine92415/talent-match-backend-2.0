/**
 * 學習經歷管理整合測試
 * 測試學習經歷相關的 4 個 API 端點
 */

import request from 'supertest'
import app from './../app'
import { clearDatabase, initTestDatabase } from '@tests/helpers/database'
import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { TeacherLearningExperience } from '@entities/TeacherLearningExperience'
import { ApplicationStatus } from '@entities/enums'
import {
  validLearningExperiences,
  invalidLearningExperiences,
  createLearningExperienceEntityData,
  learningExperienceEntityVariations,
  expectedLearningExperienceResponses
} from '@tests/fixtures/learningExperienceFixtures'
import { teacherEntityVariations, jwtTestUsers } from '@tests/fixtures/teacherFixtures'
import { UserTestHelpers, TeacherTestHelpers } from '@tests/helpers/testHelpers'
import { ERROR_MESSAGES } from '@constants/Message'

describe('Learning Experience Management Integration Tests', () => {
  let teacherRepository: ReturnType<typeof dataSource.getRepository<Teacher>>
  let learningExperienceRepository: ReturnType<typeof dataSource.getRepository<TeacherLearningExperience>>
  let accessToken: string
  let teacherId: number

  beforeAll(async () => {
    await initTestDatabase()
    teacherRepository = dataSource.getRepository(Teacher)
    learningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
  })

  beforeEach(async () => {
    await clearDatabase()
    
    // 建立測試用教師使用者和教師記錄
    const user = await UserTestHelpers.createTeacherUserEntity()
    const teacher = await TeacherTestHelpers.createTeacherApplication(user.id, {
      application_status: ApplicationStatus.APPROVED
    })
    teacherId = teacher.id

    // 建立認證 token
    accessToken = UserTestHelpers.generateAuthToken({
      id: user.id,
      role: user.role,
      uuid: user.uuid
    })
  })

  describe('GET /api/teachers/learning-experiences', () => {
    describe('成功取得學習經歷列表', () => {
      it('應該回傳空陣列當教師沒有學習經歷時', async () => {
        const response = await request(app)
          .get('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          // message: ERROR_MESSAGES.SUCCESS.LEARNING_EXPERIENCE_LIST_SUCCESS, // TODO: 等 constants 建立
          data: {
            learning_experiences: []
          }
        })
      })

      it('應該回傳教師的所有學習經歷', async () => {
        // Arrange - 建立測試學習經歷
        const learningExp1 = learningExperienceRepository.create(
          learningExperienceEntityVariations.bachelor(teacherId)
        )
        const learningExp2 = learningExperienceRepository.create(
          learningExperienceEntityVariations.master(teacherId)
        )
        await learningExperienceRepository.save([learningExp1, learningExp2])

        // Act
        const response = await request(app)
          .get('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject(expectedLearningExperienceResponses.listSuccess)
        expect(response.body.data.learning_experiences).toHaveLength(2)
        expect(response.body.data.learning_experiences[0]).toHaveProperty('degree', '碩士') // 按 start_year 降序，碩士(2020)排在前面
        expect(response.body.data.learning_experiences[1]).toHaveProperty('degree', '學士') // 學士(2016)排在後面
      })

      it('應該只回傳當前教師的學習經歷', async () => {
        // Arrange - 建立另一個教師和其學習經歷
        const otherUser = await UserTestHelpers.createTeacherUserEntity({
          email: 'other@teacher.com'
        })
        const otherTeacher = await TeacherTestHelpers.createTeacherApplication(otherUser.id, {
          application_status: ApplicationStatus.APPROVED
        })

        const currentTeacherExp = learningExperienceRepository.create(
          learningExperienceEntityVariations.bachelor(teacherId)
        )
        const otherTeacherExp = learningExperienceRepository.create(
          learningExperienceEntityVariations.master(otherTeacher.id)
        )
        await learningExperienceRepository.save([currentTeacherExp, otherTeacherExp])

        // Act
        const response = await request(app)
          .get('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.learning_experiences).toHaveLength(1)
        expect(response.body.data.learning_experiences[0]).toHaveProperty('teacher_id', teacherId)
      })
    })

    describe('權限驗證', () => {
      it('應該拒絕未認證的請求', async () => {
        await request(app)
          .get('/api/teachers/learning-experiences')
          .expect(401)
      })

      it('應該拒絕無效 token 的請求', async () => {
        await request(app)
          .get('/api/teachers/learning-experiences')
          .set('Authorization', 'Bearer invalid_token')
          .expect(401)
      })
    })
  })

  describe('POST /api/teachers/learning-experiences', () => {
    describe('成功建立學習經歷', () => {
      it('應該成功建立學士學歷記錄', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(validLearningExperiences.bachelor)
          .expect(201)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.createSuccess)
        expect(response.body.data.learning_experience).toHaveProperty('degree', '學士')
        expect(response.body.data.learning_experience).toHaveProperty('school_name', '台灣大學')
        expect(response.body.data.learning_experience).toHaveProperty('is_in_school', false)
      })

      it('應該成功建立在學中的博士學歷', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(validLearningExperiences.doctorate)
          .expect(201)

        expect(response.body.data.learning_experience).toHaveProperty('degree', '博士')
        expect(response.body.data.learning_experience).toHaveProperty('is_in_school', true)
        expect(response.body.data.learning_experience).toHaveProperty('end_year', null)
        expect(response.body.data.learning_experience).toHaveProperty('end_month', null)
      })

      it('應該成功建立海外學歷記錄', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(validLearningExperiences.overseas)
          .expect(201)

        expect(response.body.data.learning_experience).toHaveProperty('region', false)
        expect(response.body.data.learning_experience).toHaveProperty('school_name', 'Stanford University')
      })

      // TODO: 檔案上傳系統完成後新增檔案上傳測試
      it.skip('應該成功建立帶有證書檔案的學習經歷', async () => {
        // 檔案上傳測試待 multer 中間件完成後實作
      })
    })

    describe('參數驗證', () => {
      it('應該拒絕在學中但提供結束日期的資料', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidLearningExperiences.inSchoolWithEndDate)
          .expect(400)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.validationError)
      })

      it('應該拒絕結束日期早於開始日期的資料', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidLearningExperiences.endBeforeStart)
          .expect(400)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.validationError)
      })

      it('應該拒絕空白學校名稱', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidLearningExperiences.emptySchoolName)
          .expect(400)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.validationError)
      })

      it('應該拒絕無效的月份', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidLearningExperiences.invalidMonth)
          .expect(400)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.validationError)
      })

      it('應該拒絕已畢業但沒有結束日期的資料', async () => {
        const response = await request(app)
          .post('/api/teachers/learning-experiences')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidLearningExperiences.graduatedNoEndDate)
          .expect(400)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.validationError)
      })
    })

    describe('權限驗證', () => {
      it('應該拒絕未認證的請求', async () => {
        await request(app)
          .post('/api/teachers/learning-experiences')
          .send(validLearningExperiences.bachelor)
          .expect(401)
      })

      it('應該拒絕非教師的請求', async () => {
        // TODO: 實作非教師使用者的測試
        // 需要先建立非教師使用者和對應的 token
      })
    })
  })

  describe('PUT /api/teachers/learning-experiences/:id', () => {
    let learningExperienceId: number

    beforeEach(async () => {
      // 建立測試用的學習經歷記錄
      const learningExp = learningExperienceRepository.create(
        learningExperienceEntityVariations.bachelor(teacherId)
      )
      const saved = await learningExperienceRepository.save(learningExp)
      learningExperienceId = saved.id!
    })

    describe('成功更新學習經歷', () => {
      it('應該成功更新學習經歷基本資料', async () => {
        const updateData = {
          degree: '碩士',
          school_name: '清華大學',
          department: '電機工程學系'
        }

        const response = await request(app)
          .put(`/api/teachers/learning-experiences/${learningExperienceId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData)
          .expect(200)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.updateSuccess)
        expect(response.body.data.learning_experience).toHaveProperty('degree', '碩士')
        expect(response.body.data.learning_experience).toHaveProperty('school_name', '清華大學')
      })

      it('應該成功更新畢業狀態和結束時間', async () => {
        // 先建立在學中的記錄
        const inSchoolExp = learningExperienceRepository.create(
          learningExperienceEntityVariations.doctorateInProgress(teacherId)
        )
        const saved = await learningExperienceRepository.save(inSchoolExp)

        const updateData = {
          is_in_school: false,
          end_year: 2024,
          end_month: 6
        }

        const response = await request(app)
          .put(`/api/teachers/learning-experiences/${saved.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData)
          .expect(200)

        expect(response.body.data.learning_experience).toHaveProperty('is_in_school', false)
        expect(response.body.data.learning_experience).toHaveProperty('end_year', 2024)
        expect(response.body.data.learning_experience).toHaveProperty('end_month', 6)
      })

      // TODO: 檔案上傳系統完成後新增檔案更新測試
      it.skip('應該成功更新證書檔案', async () => {
        // 檔案更新測試待 multer 中間件完成後實作
      })
    })

    describe('參數驗證', () => {
      it('應該拒絕無效的更新資料', async () => {
        const invalidUpdateData = {
          start_month: 13 // 無效月份
        }

        const response = await request(app)
          .put(`/api/teachers/learning-experiences/${learningExperienceId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(invalidUpdateData)
          .expect(400)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.validationError)
      })
    })

    describe('錯誤處理', () => {
      it('應該回傳 404 當學習經歷不存在', async () => {
        const nonExistentId = 99999

        const response = await request(app)
          .put(`/api/teachers/learning-experiences/${nonExistentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ degree: '碩士' })
          .expect(404)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.notFound)
      })

      it('應該回傳 403 當嘗試更新其他教師的學習經歷', async () => {
        // Arrange - 建立其他教師的學習經歷
        const otherUser = await UserTestHelpers.createTeacherUserEntity({
          email: 'other@teacher.com'
        })
        const otherTeacher = await TeacherTestHelpers.createTeacherApplication(otherUser.id, {
          application_status: ApplicationStatus.APPROVED
        })
        
        const otherExp = learningExperienceRepository.create(
          learningExperienceEntityVariations.master(otherTeacher.id)
        )
        const savedOtherExp = await learningExperienceRepository.save(otherExp)

        // Act & Assert
        const response = await request(app)
          .put(`/api/teachers/learning-experiences/${savedOtherExp.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ degree: '博士' })
          .expect(403)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.unauthorized)
      })
    })
  })

  describe('DELETE /api/teachers/learning-experiences/:id', () => {
    let learningExperienceId: number

    beforeEach(async () => {
      // 建立測試用的學習經歷記錄
      const learningExp = learningExperienceRepository.create(
        learningExperienceEntityVariations.bachelor(teacherId)
      )
      const saved = await learningExperienceRepository.save(learningExp)
      learningExperienceId = saved.id!
    })

    describe('成功刪除學習經歷', () => {
      it('應該成功刪除學習經歷記錄', async () => {
        const response = await request(app)
          .delete(`/api/teachers/learning-experiences/${learningExperienceId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.deleteSuccess)

        // 驗證記錄已被刪除
        const deletedRecord = await learningExperienceRepository.findOne({
          where: { id: learningExperienceId }
        })
        expect(deletedRecord).toBeNull()
      })

      // TODO: 檔案上傳系統完成後新增檔案刪除測試
      it.skip('應該同時刪除關聯的證書檔案', async () => {
        // 檔案刪除測試待檔案系統完成後實作
      })
    })

    describe('錯誤處理', () => {
      it('應該回傳 404 當學習經歷不存在', async () => {
        const nonExistentId = 99999

        const response = await request(app)
          .delete(`/api/teachers/learning-experiences/${nonExistentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(404)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.notFound)
      })

      it('應該回傳 403 當嘗試刪除其他教師的學習經歷', async () => {
        // Arrange - 建立其他教師的學習經歷
        const otherUser = await UserTestHelpers.createTeacherUserEntity({
          email: 'other-delete@teacher.com'
        })
        const otherTeacher = await TeacherTestHelpers.createTeacherApplication(otherUser.id, {
          application_status: ApplicationStatus.APPROVED
        })
        
        const otherExp = learningExperienceRepository.create(
          learningExperienceEntityVariations.master(otherTeacher.id)
        )
        const savedOtherExp = await learningExperienceRepository.save(otherExp)

        // Act & Assert
        const response = await request(app)
          .delete(`/api/teachers/learning-experiences/${savedOtherExp.id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(403)

        expect(response.body).toMatchObject(expectedLearningExperienceResponses.unauthorized)
      })
    })

    describe('權限驗證', () => {
      it('應該拒絕未認證的請求', async () => {
        await request(app)
          .delete(`/api/teachers/learning-experiences/${learningExperienceId}`)
          .expect(401)
      })
    })
  })

  // TODO: 檔案上傳系統完成後新增完整的檔案處理測試
  describe.skip('File Upload Tests (TODO)', () => {
    it('應該支援 PDF 格式的證書上傳', async () => {
      // 待檔案上傳中間件完成後實作
    })

    it('應該支援 JPG/PNG 格式的證書上傳', async () => {
      // 待檔案上傳中間件完成後實作
    })

    it('應該拒絕超過 5MB 的檔案', async () => {
      // 待檔案上傳中間件完成後實作
    })

    it('應該拒絕不支援的檔案格式', async () => {
      // 待檔案上傳中間件完成後實作
    })
  })
})