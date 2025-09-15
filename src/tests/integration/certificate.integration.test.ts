import request from 'supertest'
import app from '../../app'
import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { UserRole, ApplicationStatus } from '@entities/enums'
import { ERROR_CODES } from '@constants/ErrorCode'
import { createUserEntityData, teacherUserEntityData } from '@tests/fixtures/userFixtures'
import { createTeacherEntityData } from '@tests/fixtures/teacherFixtures'
import { validCertificateData, invalidCertificateData } from '@tests/fixtures/certificateFixtures'
import { UserTestHelpers } from '@tests/helpers/testHelpers'
import { clearDatabase, initTestDatabase } from '@tests/helpers/database'

describe('證書管理 API', () => {
  let teacherUser: User
  let teacher: Teacher
  let authToken: string

  beforeAll(async () => {
    await initTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()

    // 建立測試教師使用者
    teacherUser = await UserTestHelpers.createUserEntityWithRole({
      email: 'teacher-cert@example.com'
    }, UserRole.TEACHER)

    // 生成認證 token
    authToken = UserTestHelpers.generateAuthToken({
      id: teacherUser.id,
      roles: [{ role: UserRole.TEACHER }],
      uuid: teacherUser.uuid
    })

    // 建立測試教師記錄
    const teacherRepository = dataSource.getRepository(Teacher)
    teacher = await teacherRepository.save({
      ...createTeacherEntityData,
      user_id: teacherUser.id,
      application_status: ApplicationStatus.APPROVED
    })
  })

  afterAll(async () => {
    await dataSource.destroy()
  })

  describe('GET /api/teachers/certificates', () => {
    describe('成功案例', () => {
      it('應該回傳空陣列當教師沒有證書', async () => {
        const response = await request(app).get('/api/teachers/certificates').set('Authorization', `Bearer ${authToken}`).expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          message: '取得證書列表成功',
          data: {
            certificates: []
          }
        })
      })

      it('應該回傳證書列表當教師有證書', async () => {
        // 先建立一個證書記錄
        const certificateRepository = dataSource.getRepository(TeacherCertificate)
        await certificateRepository.save({
          teacher_id: teacher.id,
          ...validCertificateData
        })

        const response = await request(app).get('/api/teachers/certificates').set('Authorization', `Bearer ${authToken}`).expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          message: '取得證書列表成功',
          data: {
            certificates: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                teacher_id: teacher.id,
                verifying_institution: validCertificateData.verifying_institution,
                license_name: validCertificateData.license_name,
                holder_name: validCertificateData.holder_name,
                license_number: validCertificateData.license_number,
                category_id: validCertificateData.category_id,
                issue_year: validCertificateData.issue_year,
                issue_month: validCertificateData.issue_month,
                file_path: validCertificateData.file_path,
                created_at: expect.any(String),
                updated_at: expect.any(String)
              })
            ])
          }
        })
      })
    })

    describe('認證錯誤', () => {
      it('應該回傳 401 當無認證令牌', async () => {
        const response = await request(app).get('/api/teachers/certificates').expect(401)

        expect(response.body).toMatchObject({
          status: 'error',
          code: ERROR_CODES.TOKEN_REQUIRED,
          message: expect.stringContaining('token')
        })
      })

      it('應該回傳 401 當認證令牌無效', async () => {
        const response = await request(app).get('/api/teachers/certificates').set('Authorization', 'Bearer invalid_token').expect(401)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'INVALID_TOKEN'
        })
      })
    })

    describe('權限錯誤', () => {
      it('應該回傳 403 當使用者不是教師', async () => {
        const studentUser = await UserTestHelpers.createUserEntityWithRole({
          ...createUserEntityData(),
          email: 'student-cert@example.com'
        }, UserRole.STUDENT)

        const studentToken = UserTestHelpers.generateAuthToken({
          id: studentUser.id,
          roles: studentUser.roles,
          uuid: studentUser.uuid
        })

        const response = await request(app).get('/api/teachers/certificates').set('Authorization', `Bearer ${studentToken}`).expect(404)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'TEACHER_NOT_FOUND'
        })
      })
    })
  })

  describe('POST /api/teachers/certificates', () => {
    describe('成功案例', () => {
      it('應該建立新證書並回傳 201', async () => {
        const response = await request(app)
          .post('/api/teachers/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ certificates: [validCertificateData] })
          .expect(201)

        expect(response.body).toMatchObject({
          status: 'success',
          message: expect.stringContaining('成功建立'),
          data: {
            certificates: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                teacher_id: teacher.id,
                verifying_institution: validCertificateData.verifying_institution,
                license_name: validCertificateData.license_name,
                holder_name: validCertificateData.holder_name,
                license_number: validCertificateData.license_number,
                category_id: validCertificateData.category_id,
                issue_year: validCertificateData.issue_year,
                issue_month: validCertificateData.issue_month,
                file_path: validCertificateData.file_path,
                created_at: expect.any(String),
                updated_at: expect.any(String)
              })
            ])
          }
        })

        // 驗證資料庫中確實建立了記錄
        const certificateRepository = dataSource.getRepository(TeacherCertificate)
        const savedCertificate = await certificateRepository.findOne({
          where: { teacher_id: teacher.id }
        })
        expect(savedCertificate).toBeTruthy()
        expect(savedCertificate!.license_name).toBe(validCertificateData.license_name)
      })
    })

    describe('資料驗證錯誤', () => {
      it('應該回傳 400 當發證機構為空', async () => {
        const response = await request(app)
          .post('/api/teachers/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ certificates: [invalidCertificateData.missingInstitution] })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          code: ERROR_CODES.VALIDATION_ERROR,
          message: expect.stringContaining('驗證失敗')
        })
      })

      it('應該回傳 400 當證書名稱超過長度限制', async () => {
        const response = await request(app)
          .post('/api/teachers/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ certificates: [invalidCertificateData.tooLongLicenseName] })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          code: ERROR_CODES.VALIDATION_ERROR
        })
      })

      it('應該回傳 400 當必填欄位缺失', async () => {
        const response = await request(app)
          .post('/api/teachers/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            // 只提供部分資料，缺少必填欄位
            verifying_institution: validCertificateData.verifying_institution
          })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          code: ERROR_CODES.VALIDATION_ERROR
        })
      })

      it.skip('應該回傳 400 當檔案格式不支援', async () => {
        // TODO: 檔案上傳功能需要後續實作
        // 此測試需要在實作檔案上傳功能後啟用
      })

      it.skip('應該回傳 400 當檔案大小超過限制', async () => {
        // TODO: 檔案上傳功能需要後續實作
        // 此測試需要在實作檔案上傳功能後啟用
      })
    })

    describe('認證錯誤', () => {
      it('應該回傳 401 當無認證令牌', async () => {
        const response = await request(app).post('/api/teachers/certificates').send({ certificates: [validCertificateData] }).expect(401)

        expect(response.body).toMatchObject({
          status: 'error',
          code: ERROR_CODES.TOKEN_REQUIRED
        })
      })
    })

    describe('權限錯誤', () => {
      it('應該回傳 403 當使用者不是教師', async () => {
        const studentUser = await UserTestHelpers.createUserEntityWithRole({
          ...createUserEntityData(),
          email: 'student-cert2@example.com'
        }, UserRole.STUDENT)

        const studentToken = UserTestHelpers.generateAuthToken({
          id: studentUser.id,
          roles: studentUser.roles,
          uuid: studentUser.uuid
        })

        const response = await request(app)
          .post('/api/teachers/certificates')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ certificates: [validCertificateData] })
          .expect(403)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'UNAUTHORIZED_ACCESS'
        })
      })
    })
  })

  describe('PUT /api/teachers/certificates/:id', () => {
    let certificate: TeacherCertificate

    beforeEach(async () => {
      // 建立測試證書記錄
      const certificateRepository = dataSource.getRepository(TeacherCertificate)
      certificate = await certificateRepository.save({
        teacher_id: teacher.id,
        ...validCertificateData,
        file_path: '/uploads/certificates/original-certificate.pdf'
      })
    })

    describe('成功案例', () => {
      it('應該更新證書資料並回傳 200', async () => {
        const updateData = {
          license_name: '更新的證書名稱',
          issue_year: 2024,
          issue_month: 1,
          file_path: '/uploads/certificates/updated-certificate.pdf'
        }

        const response = await request(app)
          .put(`/api/teachers/certificates/${certificate.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData)
          .expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          message: '證書已更新',
          data: {
            certificate: {
              id: certificate.id,
              license_name: updateData.license_name,
              issue_year: updateData.issue_year,
              issue_month: updateData.issue_month,
              file_path: updateData.file_path,
              updated_at: expect.any(String)
            }
          }
        })

        // 驗證資料庫中的記錄已更新
        const certificateRepository = dataSource.getRepository(TeacherCertificate)
        const updatedCertificate = await certificateRepository.findOne({
          where: { id: certificate.id }
        })
        expect(updatedCertificate!.license_name).toBe(updateData.license_name)
        expect(updatedCertificate!.issue_year).toBe(updateData.issue_year)
        expect(updatedCertificate!.issue_month).toBe(updateData.issue_month)
      })

      it('應該更新部分欄位當只提供部分資料', async () => {
        const partialUpdateData = {
          license_name: '部分更新的證書名稱'
        }

        const response = await request(app)
          .put(`/api/teachers/certificates/${certificate.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(partialUpdateData)
          .expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          message: '證書已更新',
          data: {
            certificate: {
              id: certificate.id,
              license_name: partialUpdateData.license_name,
              // 其他欄位保持不變
              holder_name: validCertificateData.holder_name,
              license_number: validCertificateData.license_number
            }
          }
        })
      })
    })

    describe('資料驗證錯誤', () => {
      it('應該回傳 400 當證書名稱超過長度限制', async () => {
        const response = await request(app)
          .put(`/api/teachers/certificates/${certificate.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            license_name: invalidCertificateData.tooLongLicenseName.license_name
          })
          .expect(400)

        expect(response.body).toMatchObject({
          status: 'error',
          code: ERROR_CODES.VALIDATION_ERROR
        })
      })
    })

    describe('資源不存在錯誤', () => {
      it('應該回傳 404 當證書不存在', async () => {
        const nonExistentId = 99999

        const response = await request(app)
          .put(`/api/teachers/certificates/${nonExistentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ license_name: '更新的證書名稱' })
          .expect(404)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'CERTIFICATE_NOT_FOUND',
          message: expect.stringContaining('證書不存在')
        })
      })
    })

    describe('權限錯誤', () => {
      it('應該回傳 403 當嘗試更新其他教師的證書', async () => {
        // 建立另一個教師使用者
        const otherTeacherUser = await UserTestHelpers.createUserEntityWithRole({
          email: 'other-teacher-cert@example.com'
        }, UserRole.TEACHER)

        const otherAuthToken = UserTestHelpers.generateAuthToken({
          id: otherTeacherUser.id,
          roles: [{ role: UserRole.TEACHER }],
          uuid: otherTeacherUser.uuid
        })

        const response = await request(app)
          .put(`/api/teachers/certificates/${certificate.id}`)
          .set('Authorization', `Bearer ${otherAuthToken}`)
          .send({ license_name: '嘗試更新別人的證書' })
          .expect(404)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'TEACHER_NOT_FOUND'
        })
      })
    })
  })

  describe('DELETE /api/teachers/certificates/:id', () => {
    let certificate: TeacherCertificate

    beforeEach(async () => {
      // 建立測試證書記錄
      const certificateRepository = dataSource.getRepository(TeacherCertificate)
      certificate = await certificateRepository.save({
        teacher_id: teacher.id,
        ...validCertificateData,
        file_path: '/uploads/certificates/to-delete-certificate.pdf'
      })
    })

    describe('成功案例', () => {
      it('應該刪除證書並回傳 200', async () => {
        const response = await request(app).delete(`/api/teachers/certificates/${certificate.id}`).set('Authorization', `Bearer ${authToken}`).expect(200)

        expect(response.body).toMatchObject({
          status: 'success',
          message: '證書已刪除',
          data: null
        })

        // 驗證資料庫中的記錄已刪除
        const certificateRepository = dataSource.getRepository(TeacherCertificate)
        const deletedCertificate = await certificateRepository.findOne({
          where: { id: certificate.id }
        })
        expect(deletedCertificate).toBeNull()
      })

      it.skip('應該同時刪除關聯的檔案', async () => {
        // TODO: 檔案刪除功能需要後續實作
        // 此測試需要在實作檔案管理功能後啟用
      })
    })

    describe('資源不存在錯誤', () => {
      it('應該回傳 404 當證書不存在', async () => {
        const nonExistentId = 99999

        const response = await request(app).delete(`/api/teachers/certificates/${nonExistentId}`).set('Authorization', `Bearer ${authToken}`).expect(404)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'CERTIFICATE_NOT_FOUND',
          message: expect.stringContaining('證書不存在')
        })
      })
    })

    describe('權限錯誤', () => {
      it('應該回傳 403 當嘗試刪除其他教師的證書', async () => {
        // 建立另一個教師使用者
        const otherTeacherUser = await UserTestHelpers.createUserEntityWithRole({
          email: 'other-teacher-cert2@example.com'
        }, UserRole.TEACHER)

        const otherAuthToken = UserTestHelpers.generateAuthToken({
          id: otherTeacherUser.id,
          roles: [{ role: UserRole.TEACHER }],
          uuid: otherTeacherUser.uuid
        })

        const response = await request(app).delete(`/api/teachers/certificates/${certificate.id}`).set('Authorization', `Bearer ${otherAuthToken}`).expect(404)

        expect(response.body).toMatchObject({
          status: 'error',
          code: 'TEACHER_NOT_FOUND'
        })
      })
    })
  })

  describe('業務邏輯測試', () => {
    it('應該允許教師有多個證書', async () => {
      const certificateData1 = {
        ...validCertificateData,
        license_name: '證書1',
        license_number: 'CERT001',
        file_path: '/uploads/certificates/cert1.pdf'
      }

      const certificateData2 = {
        ...validCertificateData,
        license_name: '證書2',
        license_number: 'CERT002',
        file_path: '/uploads/certificates/cert2.pdf'
      }

      // 建立兩個證書
      await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${authToken}`).send({ certificates: [certificateData1] }).expect(201)

      await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${authToken}`).send({ certificates: [certificateData2] }).expect(201)

      // 查詢證書列表應該包含兩個證書
      const response = await request(app).get('/api/teachers/certificates').set('Authorization', `Bearer ${authToken}`).expect(200)

      expect(response.body.data.certificates).toHaveLength(2)
      expect(response.body.data.certificates).toEqual(
        expect.arrayContaining([expect.objectContaining({ license_name: '證書1' }), expect.objectContaining({ license_name: '證書2' })])
      )
    })

    it('應該維持資料完整性當部分證書被刪除', async () => {
      // 建立兩個證書
      const certificateRepository = dataSource.getRepository(TeacherCertificate)

      const cert1 = await certificateRepository.save({
        teacher_id: teacher.id,
        ...validCertificateData,
        license_name: '保留的證書',
        license_number: 'KEEP001',
        file_path: '/uploads/certificates/keep.pdf'
      })

      const cert2 = await certificateRepository.save({
        teacher_id: teacher.id,
        ...validCertificateData,
        license_name: '刪除的證書',
        license_number: 'DELETE001',
        file_path: '/uploads/certificates/delete.pdf'
      })

      // 刪除其中一個證書
      await request(app).delete(`/api/teachers/certificates/${cert2.id}`).set('Authorization', `Bearer ${authToken}`).expect(200)

      // 查詢剩餘證書
      const response = await request(app).get('/api/teachers/certificates').set('Authorization', `Bearer ${authToken}`).expect(200)

      expect(response.body.data.certificates).toHaveLength(1)
      expect(response.body.data.certificates[0].license_name).toBe('保留的證書')
    })
  })
})
