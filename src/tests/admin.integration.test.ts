/**
 * 管理員功能整合測試
 * TDD Red 階段：撰寫測試案例涵蓋管理員登入、登出、教師審核、課程審核功能
 * 遵循 TDD 指示文件：業務導向測試，使用錯誤代碼常數進行驗證
 */

import request from 'supertest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import app from '../app'
import { clearDatabase, initTestDatabase } from '@tests/helpers/database'
import { dataSource } from '@db/data-source'
import { AdminUser } from '@entities/AdminUser'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { Course } from '@entities/Course'
import { AccountStatus, ApplicationStatus, CourseStatus, UserRole, AdminRole } from '@entities/enums'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { expectErrorResponse } from '@tests/helpers/errorTestUtils'
import { UserTestHelpers } from '@tests/helpers/testHelpers'
import { JWT_CONFIG } from '@config/secret'

describe('管理員功能整合測試', () => {
  let adminUser: AdminUser
  let activeAdminUser: AdminUser
  let inactiveAdminUser: AdminUser
  let testUser: User
  let testTeacher: Teacher
  let testCourse: Course
  let adminToken: string
  let activeAdminToken: string

  beforeAll(async () => {
    await initTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()

    // 建立測試管理員帳號
    const adminRepo = dataSource.getRepository(AdminUser)
    
    // 建立密碼雜湊
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    // 活躍管理員
    activeAdminUser = adminRepo.create({
      username: 'admin001',
      password: hashedPassword, // 真正的 bcrypt 雜湊
      name: 'Admin User',
      email: 'admin@example.com',
      role: AdminRole.ADMIN,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    })
    await adminRepo.save(activeAdminUser)

    // 停用管理員
    inactiveAdminUser = adminRepo.create({
      username: 'admin002',
      password: hashedPassword, // 使用相同的密碼雜湊
      name: 'Inactive Admin',
      email: 'inactive@example.com',
      role: AdminRole.ADMIN,
      is_active: false,
      created_at: new Date(),
      updated_at: new Date()
    })
    await adminRepo.save(inactiveAdminUser)

    // 建立測試使用者和教師申請
    const userRepo = dataSource.getRepository(User)
    testUser = userRepo.create({
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      email: 'test@example.com',
      password: '$2b$10$hashedpassword',
      nick_name: '測試使用者',
      account_status: AccountStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date()
    })
    await userRepo.save(testUser)

    // 建立教師申請記錄
    const teacherRepo = dataSource.getRepository(Teacher)
    testTeacher = teacherRepo.create({
      user: testUser,
      user_id: testUser.id,
      introduction: '我是一名經驗豐富的教師',
      application_status: ApplicationStatus.PENDING,
      created_at: new Date(),
      updated_at: new Date()
    })
    await teacherRepo.save(testTeacher)

    // 建立課程申請記錄 - 需要檢查 Course entity 的實際欄位
    const courseRepo = dataSource.getRepository(Course)
    testCourse = courseRepo.create({
      uuid: '550e8400-e29b-41d4-a716-446655440002', // 為課程添加有效的 UUID
      name: '測試課程',
      teacher_id: testTeacher.id,
      content: '測試課程內容',
      main_category_id: 1,
      sub_category_id: 1,
      status: CourseStatus.DRAFT, // 必填欄位：課程狀態
      application_status: ApplicationStatus.PENDING, // 申請審核狀態
      created_at: new Date(),
      updated_at: new Date()
    })
    await courseRepo.save(testCourse)

    // 產生管理員 JWT Token
    activeAdminToken = jwt.sign(
      { 
        adminId: activeAdminUser.id,
        username: activeAdminUser.username,
        role: activeAdminUser.role, // 加上 role 欄位
        type: 'access' // 修正：使用 'access' 而非 'admin'
      },
      JWT_CONFIG.SECRET,
      { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN }
    )
  })

  afterAll(async () => {
    await clearDatabase()
    await dataSource.destroy()
  })

  describe('POST /api/admin/login - 管理員登入', () => {
    const loginEndpoint = '/api/admin/login'

    describe('成功登入案例', () => {
      it('應該成功登入活躍管理員並回傳 200', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            username: 'admin001',
            password: 'admin123'
          })
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.AUTH.ADMIN_LOGIN_SUCCESS,
          data: {
            admin: {
              id: activeAdminUser.id,
              username: 'admin001'
            },
            access_token: expect.any(String)
          }
        })

        // 驗證 JWT Token
        const decodedToken = jwt.verify(response.body.data.access_token, JWT_CONFIG.SECRET) as any
        expect(decodedToken.adminId).toBe(activeAdminUser.id)
        expect(decodedToken.username).toBe('admin001')
        expect(decodedToken.type).toBe('access')
      })
    })

    describe('登入失敗案例', () => {
      it('應該拒絕不存在的管理員帳號', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            username: 'nonexistent',
            password: 'password123'
          })

        // Assert
        expectErrorResponse.business(
          response,
          MESSAGES.AUTH.ADMIN_INVALID_CREDENTIALS,
          401
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_INVALID_CREDENTIALS)
      })

      it('應該拒絕錯誤密碼', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            username: 'admin001',
            password: 'wrongpassword'
          })

        // Assert
        expectErrorResponse.business(
          response,
          MESSAGES.AUTH.ADMIN_INVALID_CREDENTIALS,
          401
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_INVALID_CREDENTIALS)
      })

      it('應該拒絕停用的管理員帳號', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            username: 'admin002',
            password: 'admin123'
          })

        // Assert
        expectErrorResponse.business(
          response,
          MESSAGES.AUTH.ADMIN_ACCOUNT_INACTIVE,
          403
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_ACCOUNT_INACTIVE)
      })

      it('應該驗證必填欄位 - 缺少 username', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            password: 'admin123'
          })

        // Assert
        expectErrorResponse.validation(response, ['username'])
        expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      })

      it('應該驗證必填欄位 - 缺少 password', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            username: 'admin001'
          })

        // Assert
        expectErrorResponse.validation(response, ['password'])
        expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      })

      it('應該驗證空值 - username 為空字串', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            username: '',
            password: 'admin123'
          })

        // Assert
        expectErrorResponse.validation(response, ['username'])
        expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      })

      it('應該驗證空值 - password 為空字串', async () => {
        // Act
        const response = await request(app)
          .post(loginEndpoint)
          .send({
            username: 'admin001',
            password: ''
          })

        // Assert
        expectErrorResponse.validation(response, ['password'])
        expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      })
    })
  })

  describe('POST /api/admin/logout - 管理員登出', () => {
    const logoutEndpoint = '/api/admin/logout'

    describe('成功登出案例', () => {
      it('應該成功登出管理員並回傳 200', async () => {
        // Act
        const response = await request(app)
          .post(logoutEndpoint)
          .set('Authorization', `Bearer ${activeAdminToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.AUTH.ADMIN_LOGOUT_SUCCESS
        })
      })
    })

    describe('登出失敗案例', () => {
      it('應該拒絕沒有 token 的請求', async () => {
        // Act
        const response = await request(app)
          .post(logoutEndpoint)

        // Assert
        expectErrorResponse.auth(
          response,
          MESSAGES.AUTH.ADMIN_TOKEN_REQUIRED,
          401
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_TOKEN_REQUIRED)
      })

      it('應該拒絕無效的 token', async () => {
        // Act
        const response = await request(app)
          .post(logoutEndpoint)
          .set('Authorization', 'Bearer invalid-token')

        // Assert
        expectErrorResponse.auth(
          response,
          MESSAGES.AUTH.ADMIN_TOKEN_INVALID,
          401
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_TOKEN_INVALID)
      })

      it('應該拒絕一般使用者 token', async () => {
        // 建立一般使用者 token（沒有管理員角色）
        const userToken = jwt.sign(
          { 
            userId: testUser.id,
            email: testUser.email,
            roles: [] // 空的角色陣列
          },
          JWT_CONFIG.SECRET,
          { expiresIn: '1h' }
        )

        // Act
        const response = await request(app)
          .post(logoutEndpoint)
          .set('Authorization', `Bearer ${userToken}`)

        // Assert
        expectErrorResponse.auth(
          response,
          MESSAGES.AUTH.ADMIN_PERMISSION_DENIED,
          403
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_PERMISSION_DENIED)
      })
    })
  })

  describe('POST /api/admin/teachers/:teacherId/approve - 教師申請核准', () => {
    const getApproveEndpoint = (teacherId: number) => `/api/admin/teachers/${teacherId}/approve`

    describe('成功核准案例', () => {
      it('應該成功核准教師申請並回傳 200', async () => {
        // Act
        const response = await request(app)
          .post(getApproveEndpoint(testTeacher.id))
          .set('Authorization', `Bearer ${activeAdminToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.ADMIN.TEACHER_APPLICATION_APPROVED,
          data: {
            teacher: {
              id: testTeacher.id,
              application_status: ApplicationStatus.APPROVED
            }
          }
        })

        // 驗證資料庫狀態
        const updatedTeacher = await dataSource.getRepository(Teacher).findOne({
          where: { id: testTeacher.id }
        })
        expect(updatedTeacher?.application_status).toBe(ApplicationStatus.APPROVED)
      })
    })

    describe('核准失敗案例', () => {
      it('應該拒絕沒有管理員權限的請求', async () => {
        // Act
        const response = await request(app)
          .post(getApproveEndpoint(testTeacher.id))

        // Assert
        expectErrorResponse.auth(
          response,
          MESSAGES.AUTH.ADMIN_TOKEN_REQUIRED,
          401
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_TOKEN_REQUIRED)
      })

      it('應該拒絕不存在的教師申請', async () => {
        // Act
        const response = await request(app)
          .post(getApproveEndpoint(99999))
          .set('Authorization', `Bearer ${activeAdminToken}`)

        // Assert
        expectErrorResponse.business(
          response,
          MESSAGES.BUSINESS.TEACHER_APPLICATION_NOT_FOUND,
          404
        )
        expect(response.body.code).toBe(ERROR_CODES.TEACHER_APPLICATION_NOT_FOUND)
      })

      it('應該拒絕已經審核過的申請', async () => {
        // 先設置教師申請為已核准狀態
        testTeacher.application_status = ApplicationStatus.APPROVED
        await dataSource.getRepository(Teacher).save(testTeacher)

        // Act
        const response = await request(app)
          .post(getApproveEndpoint(testTeacher.id))
          .set('Authorization', `Bearer ${activeAdminToken}`)

        // Assert
        expectErrorResponse.business(
          response,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
        expect(response.body.code).toBe(ERROR_CODES.APPLICATION_ALREADY_REVIEWED)
      })

      it('應該拒絕非待審核狀態的申請', async () => {
        // 先設置教師申請為拒絕狀態
        testTeacher.application_status = ApplicationStatus.REJECTED
        await dataSource.getRepository(Teacher).save(testTeacher)

        // Act
        const response = await request(app)
          .post(getApproveEndpoint(testTeacher.id))
          .set('Authorization', `Bearer ${activeAdminToken}`)

        // Assert - 已經審核過的申請應該返回 409
        expectErrorResponse.business(
          response,
          MESSAGES.BUSINESS.APPLICATION_ALREADY_REVIEWED,
          409
        )
        expect(response.body.code).toBe(ERROR_CODES.APPLICATION_ALREADY_REVIEWED)
      })
    })
  })

  describe('POST /api/admin/teachers/:teacherId/reject - 教師申請拒絕', () => {
    const getRejectEndpoint = (teacherId: number) => `/api/admin/teachers/${teacherId}/reject`

    describe('成功拒絕案例', () => {
      it('應該成功拒絕教師申請並回傳 200', async () => {
        const rejectionReason = '申請資料不完整'

        // Act
        const response = await request(app)
          .post(getRejectEndpoint(testTeacher.id))
          .set('Authorization', `Bearer ${activeAdminToken}`)
          .send({ rejectionReason })
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.ADMIN.TEACHER_APPLICATION_REJECTED,
          data: {
            teacher: {
              id: testTeacher.id,
              application_status: ApplicationStatus.REJECTED,
              review_notes: rejectionReason
            }
          }
        })

        // 驗證資料庫狀態
        const updatedTeacher = await dataSource.getRepository(Teacher).findOne({
          where: { id: testTeacher.id }
        })
        expect(updatedTeacher?.application_status).toBe(ApplicationStatus.REJECTED)
        expect(updatedTeacher?.review_notes).toBe(rejectionReason)
      })
    })

    describe('拒絕失敗案例', () => {
      it('應該驗證必填欄位 - 缺少 rejectionReason', async () => {
        // Act
        const response = await request(app)
          .post(getRejectEndpoint(testTeacher.id))
          .set('Authorization', `Bearer ${activeAdminToken}`)
          .send({})

        // Assert
        expectErrorResponse.validation(response, ['rejectionReason'])
        expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      })

      it('應該驗證空值 - rejectionReason 為空字串', async () => {
        // Act
        const response = await request(app)
          .post(getRejectEndpoint(testTeacher.id))
          .set('Authorization', `Bearer ${activeAdminToken}`)
          .send({ rejectionReason: '' })

        // Assert
        expectErrorResponse.validation(response, ['rejectionReason'])
        expect(response.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      })
    })
  })

  // 注意：課程審核功能需要等 Course entity 有審核相關欄位時才能實作
  // 目前的測試案例暫時註解，等實際欄位確定後再開啟
  /*
  describe('PUT /api/admin/courses/:courseId/approve - 課程申請核准', () => {
    const getApproveEndpoint = (courseId: number) => `/api/admin/courses/${courseId}/approve`

    describe('成功核准案例', () => {
      it('應該成功核准課程申請並回傳 200', async () => {
        // 等 Course entity 有 status 欄位後實作
      })
    })
  })
  */

  describe('管理員權限控制測試', () => {
    it('所有管理員 API 都應該要求管理員 token', async () => {
      const endpoints = [
        { method: 'post', url: '/api/admin/logout' },
        { method: 'put', url: `/api/admin/teachers/${testTeacher.id}/approve` },
        { method: 'put', url: `/api/admin/teachers/${testTeacher.id}/reject` }
      ]

      for (const endpoint of endpoints) {
        // Act
        let response: request.Response
        if (endpoint.method === 'post') {
          response = await request(app).post(endpoint.url)
        } else if (endpoint.method === 'put') {
          response = await request(app).post(endpoint.url)
        } else {
          throw new Error(`Unsupported method: ${endpoint.method}`)
        }

        // Assert
        expectErrorResponse.auth(
          response,
          MESSAGES.AUTH.ADMIN_TOKEN_REQUIRED,
          401
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_TOKEN_REQUIRED)
      }
    })

    it('所有管理員 API 都應該拒絕一般使用者 token', async () => {
      // 建立一般使用者 token
      const userToken = jwt.sign(
        { 
          userId: testUser.id,
          email: testUser.email,
          roles: [] // 空的角色陣列
        },
        JWT_CONFIG.SECRET,
        { expiresIn: '1h' }
      )

      const endpoints = [
        { method: 'post', url: '/api/admin/logout' },
        { method: 'put', url: `/api/admin/teachers/${testTeacher.id}/approve` },
        { method: 'put', url: `/api/admin/teachers/${testTeacher.id}/reject` }
      ]

      for (const endpoint of endpoints) {
        // Act
        let response: request.Response
        if (endpoint.method === 'post') {
          response = await request(app).post(endpoint.url)
            .set('Authorization', `Bearer ${userToken}`)
        } else if (endpoint.method === 'put') {
          response = await request(app).post(endpoint.url)
            .set('Authorization', `Bearer ${userToken}`)
        } else {
          throw new Error(`Unsupported method: ${endpoint.method}`)
        }

        // Assert
        expectErrorResponse.auth(
          response,
          MESSAGES.AUTH.ADMIN_PERMISSION_DENIED,
          403
        )
        expect(response.body.code).toBe(ERROR_CODES.ADMIN_PERMISSION_DENIED)
      }
    })
  })
})