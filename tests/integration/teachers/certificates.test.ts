import request from 'supertest'
import app from '../../../app'
import { clearDatabase, initTestDatabase, closeTestDatabase } from '../../helpers/database'
import { TeacherCertificateRequest, TeacherApplyRequest } from '../../../types/teachers'

describe('Teachers Certificates API', () => {
  let teacherToken: string
  let anotherTeacherToken: string

  beforeAll(async () => {
    // 初始化測試資料庫連線
    await initTestDatabase()

    // 建立測試教師用戶並取得 token
    const teacherRegisterData = {
      nick_name: '測試教師_證書',
      email: 'teacher_cert@test.com',
      password: 'password123中文'
    }

    const registerRes = await request(app).post('/api/auth/register').send(teacherRegisterData)
    teacherToken = registerRes.body.data.access_token

    // 申請成為教師
    const teacherApplyData: TeacherApplyRequest = {
      nationality: '台灣',
      introduction:
        '我是一位資深的程式設計教師，具有十年以上的教學經驗。我專精於 JavaScript、TypeScript、Node.js 等前後端技術，曾在多家知名科技公司任職資深工程師。我熱愛教學，能夠將複雜的概念以淺顯易懂的方式傳達給學生。'
    }
    await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${teacherToken}`).send(teacherApplyData)

    // 建立另一個教師用戶
    const anotherTeacherData = {
      nick_name: '另一個教師_證書',
      email: 'another_teacher_cert@test.com',
      password: 'password123中文'
    }

    const anotherRegisterRes = await request(app).post('/api/auth/register').send(anotherTeacherData)
    anotherTeacherToken = anotherRegisterRes.body.data.access_token

    // 另一個教師也申請成為教師
    await request(app).post('/api/teachers/apply').set('Authorization', `Bearer ${anotherTeacherToken}`).send(teacherApplyData)
  }, 30000) // 增加超時時間

  afterAll(async () => {
    // 關閉資料庫連線
    await closeTestDatabase()
  }, 30000) // 增加超時時間

  beforeEach(async () => {
    // 只清理證書資料，保留使用者和教師資料
    const { dataSource } = await import('../../../db/data-source')
    const { TeacherCertificate } = await import('../../../entities/TeacherCertificate')
    const certificateRepository = dataSource.getRepository(TeacherCertificate)
    await certificateRepository.query('DELETE FROM teacher_certificates')
  }, 15000) // 增加超時時間

  describe('GET /api/teachers/certificates', () => {
    it('應該成功取得證書列表', async () => {
      const res = await request(app).get('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('查詢成功')
      expect(res.body.data).toHaveProperty('certificates')
      expect(Array.isArray(res.body.data.certificates)).toBe(true)
    })

    it('未登入用戶應回傳 401', async () => {
      const res = await request(app).get('/api/teachers/certificates')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })
  })

  describe('POST /api/teachers/certificates', () => {
    it('應該成功建立證書', async () => {
      const validCertificateData: TeacherCertificateRequest = {
        verifying_institution: '測試認證機構',
        license_name: '測試證書',
        holder_name: '測試持有人',
        license_number: 'TEST123456',
        file_path: 'uploads/certificates/test_cert.pdf',
        category_id: 'tech',
        subject: '程式設計'
      }

      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(validCertificateData)

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('建立證書成功')
      expect(res.body.data).toHaveProperty('certificate')
      expect(res.body.data.certificate).toHaveProperty('id')
      expect(res.body.data.certificate.verifying_institution).toBe(validCertificateData.verifying_institution)
    })

    it('未登入用戶應回傳 401', async () => {
      const validCertificateData: TeacherCertificateRequest = {
        verifying_institution: '測試認證機構',
        license_name: '測試證書',
        holder_name: '測試持有人',
        license_number: 'TEST123456',
        file_path: 'uploads/certificates/test_cert.pdf',
        category_id: 'tech',
        subject: '程式設計'
      }

      const res = await request(app).post('/api/teachers/certificates').send(validCertificateData)

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('缺少發證機構應回傳 400', async () => {
      const invalidData = {
        license_name: '測試證書',
        holder_name: '測試持有人',
        license_number: 'TEST123456',
        file_path: 'uploads/certificates/test_cert.pdf',
        category_id: 'tech',
        subject: '程式設計'
      }
      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(invalidData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('verifying_institution')
    })

    it('缺少證書名稱應回傳 400', async () => {
      const invalidData = {
        verifying_institution: '測試認證機構',
        holder_name: '測試持有人',
        license_number: 'TEST123456',
        file_path: 'uploads/certificates/test_cert.pdf',
        category_id: 'tech',
        subject: '程式設計'
      }
      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(invalidData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('license_name')
    })

    it('缺少持有人姓名應回傳 400', async () => {
      const invalidData = {
        verifying_institution: '測試認證機構',
        license_name: '測試證書',
        license_number: 'TEST123456',
        file_path: 'uploads/certificates/test_cert.pdf',
        category_id: 'tech',
        subject: '程式設計'
      }
      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(invalidData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('holder_name')
    })

    it('缺少證書編號應回傳 400', async () => {
      const invalidData = {
        verifying_institution: '測試認證機構',
        license_name: '測試證書',
        holder_name: '測試持有人',
        file_path: 'uploads/certificates/test_cert.pdf',
        category_id: 'tech',
        subject: '程式設計'
      }
      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(invalidData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('license_number')
    })

    it('缺少檔案路徑應回傳 400', async () => {
      const invalidData = {
        verifying_institution: '測試認證機構',
        license_name: '測試證書',
        holder_name: '測試持有人',
        license_number: 'TEST123456',
        category_id: 'tech',
        subject: '程式設計'
      }
      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(invalidData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('file_path')
    })

    it('缺少證書類別應回傳 400', async () => {
      const invalidData = {
        verifying_institution: '測試認證機構',
        license_name: '測試證書',
        holder_name: '測試持有人',
        license_number: 'TEST123456',
        file_path: 'uploads/certificates/test_cert.pdf',
        subject: '程式設計'
      }
      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(invalidData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('category_id')
    })

    it('缺少證書主題應回傳 400', async () => {
      const invalidData = {
        verifying_institution: '測試認證機構',
        license_name: '測試證書',
        holder_name: '測試持有人',
        license_number: 'TEST123456',
        file_path: 'uploads/certificates/test_cert.pdf',
        category_id: 'tech'
      }
      const res = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(invalidData)

      expect(res.status).toBe(400)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('參數驗證失敗')
      expect(res.body.errors).toHaveProperty('subject')
    })
  })

  describe('PUT /api/teachers/certificates/:id', () => {
    let certificateId: number

    beforeEach(async () => {
      // 先建立一個證書供測試使用
      const certificateData: TeacherCertificateRequest = {
        verifying_institution: '原認證機構',
        license_name: '原證書名稱',
        holder_name: '原持有人',
        license_number: 'ORIG123',
        file_path: 'uploads/certificates/orig.pdf',
        category_id: 'orig_cat',
        subject: '原主題'
      }

      const createRes = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(certificateData)

      certificateId = createRes.body.data.certificate.id
    })

    it('應該成功更新證書', async () => {
      const updateData = {
        verifying_institution: '更新認證機構',
        license_name: '更新證書名稱'
      }

      const res = await request(app).put(`/api/teachers/certificates/${certificateId}`).set('Authorization', `Bearer ${teacherToken}`).send(updateData)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('更新證書成功')
      expect(res.body.data.certificate.verifying_institution).toBe(updateData.verifying_institution)
      expect(res.body.data.certificate.license_name).toBe(updateData.license_name)
      expect(res.body.data.certificate.holder_name).toBe('原持有人') // 未更新的欄位應保持原值
    })

    it('未登入用戶應回傳 401', async () => {
      const res = await request(app).put('/api/teachers/certificates/999').send({ verifying_institution: '更新機構' })

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('證書不存在應回傳 404', async () => {
      const res = await request(app)
        .put('/api/teachers/certificates/99999')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ verifying_institution: '更新機構' })

      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的證書')
    })

    it('非擁有者無法更新他人證書應回傳 403', async () => {
      const res = await request(app)
        .put(`/api/teachers/certificates/${certificateId}`)
        .set('Authorization', `Bearer ${anotherTeacherToken}`)
        .send({ verifying_institution: '惡意更新' })

      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法修改此證書')
    })
  })

  describe('DELETE /api/teachers/certificates/:id', () => {
    let certificateId: number

    beforeEach(async () => {
      // 先建立一個證書供測試使用
      const certificateData: TeacherCertificateRequest = {
        verifying_institution: '待刪除認證機構',
        license_name: '待刪除證書',
        holder_name: '待刪除持有人',
        license_number: 'DEL123',
        file_path: 'uploads/certificates/delete.pdf',
        category_id: 'del_cat',
        subject: '待刪除主題'
      }

      const createRes = await request(app).post('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`).send(certificateData)

      certificateId = createRes.body.data.certificate.id
    })

    it('應該成功刪除證書', async () => {
      const res = await request(app).delete(`/api/teachers/certificates/${certificateId}`).set('Authorization', `Bearer ${teacherToken}`)

      expect(res.status).toBe(200)
      expect(res.body.status).toBe('success')
      expect(res.body.message).toBe('刪除證書成功')

      // 驗證證書已被刪除
      const getRes = await request(app).get('/api/teachers/certificates').set('Authorization', `Bearer ${teacherToken}`)
      expect(getRes.body.data.certificates).toHaveLength(0)
    })

    it('未登入用戶應回傳 401', async () => {
      const res = await request(app).delete('/api/teachers/certificates/999')

      expect(res.status).toBe(401)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('未授權')
    })

    it('證書不存在應回傳 404', async () => {
      const res = await request(app).delete('/api/teachers/certificates/99999').set('Authorization', `Bearer ${teacherToken}`)

      expect(res.status).toBe(404)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('找不到指定的證書')
    })

    it('非擁有者無法刪除他人證書應回傳 403', async () => {
      const res = await request(app).delete(`/api/teachers/certificates/${certificateId}`).set('Authorization', `Bearer ${anotherTeacherToken}`)

      expect(res.status).toBe(403)
      expect(res.body.status).toBe('error')
      expect(res.body.message).toBe('權限不足，無法刪除此證書')
    })
  })
})
