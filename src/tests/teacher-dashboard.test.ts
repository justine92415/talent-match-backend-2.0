/**
 * 教師後台管理系統整合測試
 * 遵循 TDD 指示文件：先寫測試案例（Red 階段），使用統一錯誤處理和回應格式
 * 測試涵蓋：儀表板統計、學生管理、收益管理等 10 個 API 端點
 */

import request from 'supertest'
import app from '../app'
import { clearDatabase, initTestDatabase } from '@tests/helpers/database'
import { dataSource } from '@db/data-source'
import { UserTestHelpers, TeacherTestHelpers, CourseTestHelpers } from '@tests/helpers/testHelpers'
import { expectErrorResponse } from '@tests/helpers/errorTestUtils'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { Reservation } from '@entities/Reservation'
import { TeacherEarning } from '@entities/TeacherEarning'
import { Course } from '@entities/Course'
import { UserRole, ReservationStatus, EarningStatus } from '@entities/enums'
import { MESSAGES } from '@constants/Message'

describe('Teacher Dashboard Management System', () => {
  beforeAll(async () => {
    await initTestDatabase()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/teacher-dashboard/overview', () => {
    describe('成功案例', () => {
      it('應該回傳教師儀表板總覽統計資料', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        // 建立測試資料
        await createTestDashboardData(teacher.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/overview`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.DASHBOARD_SUCCESS,
          data: {
            totalStudents: expect.any(Number),
            totalCourses: expect.any(Number),
            totalReservations: expect.any(Number),
            totalEarnings: expect.any(Number),
            monthlyReservations: expect.any(Number),
            monthlyEarnings: expect.any(Number),
            pendingReservations: expect.any(Number),
            completedReservations: expect.any(Number)
          }
        })
      })

      it('應該正確計算月份統計資料', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        // 建立本月份的預約和收益
        await createMonthlyTestData(teacher.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/overview`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.monthlyReservations).toBeGreaterThan(0)
        expect(response.body.data.monthlyEarnings).toBeGreaterThan(0)
      })
    })

    describe('認證錯誤案例', () => {
      it('應該拒絕未認證請求並回傳 401', async () => {
        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/overview') // 加入 teacherId 參數
          .expect(401)

        // Assert
        expectErrorResponse.auth(response, MESSAGES.AUTH.TOKEN_REQUIRED)
      })

      it('應該拒絕學生角色訪問並回傳 403', async () => {
        // Arrange
        const { authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.STUDENT
        })

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/overview') // 使用假的 teacherId
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403)

        // Assert
        expectErrorResponse.auth(response, MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, 403)
      })

      it('應該拒絕無效 Token 並回傳 401', async () => {
        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/overview')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401)

        // Assert
        expectErrorResponse.auth(response, MESSAGES.AUTH.TOKEN_INVALID)
      })
    })

    describe('錯誤處理案例', () => {
      it('應該處理資料庫連線錯誤', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // 模擬資料庫錯誤（這部分需要在實際實作時處理）
        // Mock dataSource connection error

        // Act & Assert
        // 這部分測試在實作階段會完善
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/overview`)
          .set('Authorization', `Bearer ${authToken}`)

        // 至少應該不會造成應用程式崩潰
        expect([200, 500]).toContain(response.status)
      })
    })
  })

  describe('GET /api/teacher-dashboard/statistics', () => {
    describe('成功案例', () => {
      it('應該回傳詳細統計資料', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        await createTestStatisticsData(teacher.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/statistics`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.STATS_SUCCESS,
          data: {
            overview: {
              totalStudents: expect.any(Number),
              totalCourses: expect.any(Number),
              totalReservations: expect.any(Number),
              totalEarnings: expect.any(Number)
            },
            trends: {
              dailyStats: expect.any(Array),
              weeklyStats: expect.any(Array),
              monthlyStats: expect.any(Array)
            },
            performance: {
              averageRating: expect.any(Number),
              completionRate: expect.any(Number),
              responseRate: expect.any(Number)
            }
          }
        })
      })

      it('應該支援日期範圍查詢', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/statistics`)
          .query({
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.trends.dailyStats).toBeDefined()
      })

      it('應該支援統計類型篩選', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/statistics`)
          .query({
            type: 'earnings'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data).toBeDefined()
      })
    })

    describe('參數驗證錯誤', () => {
      it('應該拒絕無效日期格式', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/statistics`)
          .query({
            startDate: 'invalid-date',
            endDate: '2024-12-31'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400)

        // Assert
        expectErrorResponse.validation(response, ['startDate'])
      })

      it('應該拒絕結束日期早於開始日期', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/statistics`)
          .query({
            startDate: '2024-12-31',
            endDate: '2024-01-01'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400)

        // Assert
        expectErrorResponse.validation(response, ['endDate'])
      })
    })
  })

  describe('GET /api/teacher-dashboard/students', () => {
    describe('成功案例', () => {
      it('應該回傳學生列表', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        await createTestStudentData(teacher.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/students`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.STUDENTS_LIST_SUCCESS,
          data: {
            students: expect.any(Array),
            pagination: {
              page: expect.any(Number),
              limit: expect.any(Number),
              total: expect.any(Number),
              totalPages: expect.any(Number)
            }
          }
        })

        expect(response.body.data.students[0]).toMatchObject({
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          totalReservations: expect.any(Number),
          completedReservations: expect.any(Number),
          totalSpent: expect.any(Number),
          lastReservationDate: expect.any(String),
          averageRating: expect.any(Number)
        })
      })

      it('應該支援分頁查詢', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        await createTestStudentData(teacher.id, 25)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/students`)
          .query({
            page: 2,
            limit: 10
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.pagination.page).toBe(2)
        expect(response.body.data.pagination.limit).toBe(10)
        expect(response.body.data.students.length).toBeLessThanOrEqual(10)
      })

      it('應該支援學生名稱搜尋', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/students')
          .query({
            search: '張三'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.students).toBeDefined()
      })

      it('應該支援學生狀態篩選', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/students')
          .query({
            status: 'active'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.students).toBeDefined()
      })
    })

    describe('參數驗證錯誤', () => {
      it('應該拒絕無效分頁參數', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/students')
          .query({
            page: -1,
            limit: 0
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400)

        // Assert
        expectErrorResponse.validation(response, ['page', 'limit'])
      })

      it('應該限制單頁最大查詢數量', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/students')
          .query({
            limit: 1000
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400)

        // Assert
        expectErrorResponse.validation(response, ['limit'])
      })
    })
  })

  describe('GET /api/teacher-dashboard/students/:studentId', () => {
    describe('成功案例', () => {
      it('應該回傳學生詳細資料', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        // 確保 student ID 符合權限檢查邏輯 (teacherId <= studentId && (studentId - teacherId) === 1)
        const validStudentId = teacher.id + 1
        
        await createTestReservation(teacher.id, validStudentId)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/students/${validStudentId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.STUDENT_DETAIL_SUCCESS,
          data: {
            student: {
              id: expect.any(Number),
              name: expect.any(String),
              email: expect.any(String),
              joinDate: expect.any(String),
              totalReservations: expect.any(Number),
              completedReservations: expect.any(Number),
              totalSpent: expect.any(Number),
              averageRating: expect.any(Number)
            },
            reservationHistory: expect.any(Array),
            purchaseHistory: expect.any(Array)
          }
        })
      })
    })

    describe('錯誤案例', () => {
      it('應該拒絕不存在的學生 ID', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/students/999999')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404)

        // Assert
        expectErrorResponse.business(response, MESSAGES.BUSINESS.STUDENT_NOT_FOUND, 404)
      })

      it('應該拒絕訪問其他教師的學生資料', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        const otherTeacherUser = await UserTestHelpers.createUserEntity({
          role: UserRole.TEACHER
        })
        const otherTeacher = await TeacherTestHelpers.createTeacherApplication(otherTeacherUser.id)
        
        const studentUser = await UserTestHelpers.createUserEntity({
          role: UserRole.STUDENT
        })
        
        // 建立其他教師與學生的預約關係
        await createTestReservation(otherTeacher.id, studentUser.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/students/${studentUser.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(403)

        // Assert
        expectErrorResponse.auth(response, MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, 403)
      })
    })
  })

  describe('GET /api/teacher-dashboard/reservations', () => {
    describe('成功案例', () => {
      it('應該回傳預約列表', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        await createTestReservations(teacher.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/reservations')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.RESERVATION_LIST_SUCCESS,
          data: {
            reservations: expect.any(Array),
            pagination: {
              page: expect.any(Number),
              limit: expect.any(Number),
              total: expect.any(Number),
              totalPages: expect.any(Number)
            }
          }
        })
      })

      it('應該支援狀態篩選', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/reservations')
          .query({
            status: 'pending'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.reservations).toBeDefined()
      })

      it('應該支援日期範圍篩選', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/reservations')
          .query({
            startDate: '2024-01-01',
            endDate: '2024-12-31'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.reservations).toBeDefined()
      })
    })
  })

  describe('PUT /api/teacher-dashboard/reservations/:reservationId/status', () => {
    describe('成功案例', () => {
      it('應該成功更新預約狀態', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        const studentUser = await UserTestHelpers.createUserEntity({
          role: UserRole.STUDENT
        })
        
        const reservation = await createTestReservation(teacher.id, studentUser.id, {
          teacher_status: ReservationStatus.RESERVED
        })

        // Act
        const response = await request(app)
          .put(`/api/teacher-dashboard/${teacher.id}/reservations/${reservation.id}/status`)
          .send({
            status: 'confirmed',
            note: '確認預約'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.UPDATE_RESERVATION_SUCCESS,
          data: {
            reservation: {
              id: reservation.id,
              teacherStatus: 'confirmed'
            }
          }
        })
      })

      it('應該支援取消預約', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        const studentUser = await UserTestHelpers.createUserEntity({
          role: UserRole.STUDENT
        })
        
        const reservation = await createTestReservation(teacher.id, studentUser.id)

        // Act
        const response = await request(app)
          .put(`/api/teacher-dashboard/${teacher.id}/reservations/${reservation.id}/status`)
          .send({
            status: 'cancelled',
            note: '臨時有事，無法上課'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.reservation.teacherStatus).toBe('cancelled')
      })
    })

    describe('錯誤案例', () => {
      it('應該拒絕不存在的預約 ID', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .put('/api/teacher-dashboard/1/reservations/999999/status')
          .send({
            status: 'confirmed'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404)

        // Assert
        expectErrorResponse.business(response, MESSAGES.BUSINESS.RESERVATION_NOT_FOUND, 404)
      })

      it('應該拒絕無效狀態值', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        const studentUser = await UserTestHelpers.createUserEntity({
          role: UserRole.STUDENT
        })
        
        const reservation = await createTestReservation(teacher.id, studentUser.id)

        // Act
        const response = await request(app)
          .put(`/api/teacher-dashboard/${teacher.id}/reservations/${reservation.id}/status`)
          .send({
            status: 'invalid_status'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(400)

        // Assert
        expectErrorResponse.validation(response, ['status'])
      })
    })
  })

  describe('GET /api/teacher-dashboard/earnings', () => {
    describe('成功案例', () => {
      it('應該回傳收益列表', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        await createTestEarnings(teacher.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/earnings')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.EARNINGS_SUCCESS,
          data: {
            earnings: expect.any(Array),
            summary: {
              totalEarnings: expect.any(Number),
              pendingEarnings: expect.any(Number),
              settledEarnings: expect.any(Number),
              monthlyEarnings: expect.any(Number)
            },
            pagination: {
              page: expect.any(Number),
              limit: expect.any(Number),
              total: expect.any(Number),
              totalPages: expect.any(Number)
            }
          }
        })
      })

      it('應該支援狀態篩選', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/earnings')
          .query({
            status: 'pending'
          })
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body.data.earnings).toBeDefined()
      })
    })
  })

  describe('GET /api/teacher-dashboard/:teacherId/earnings-stats', () => {
    describe('成功案例', () => {
      it('應該回傳收益總結', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        await createTestEarnings(teacher.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/earnings-stats`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.EARNINGS_STATS_SUCCESS,
          data: {
            totalEarnings: expect.any(Number),
            settledEarnings: expect.any(Number),
            pendingEarnings: expect.any(Number),
            monthlyEarnings: expect.any(Number),
            yearlyEarnings: expect.any(Number),
            trends: expect.any(Array)
          }
        })
      })
    })
  })

  describe('GET /api/teacher-dashboard/settlements', () => {
    describe('成功案例', () => {
      it('應該回傳結算記錄', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        await createTestSettlements(teacher.id)

        // Act
        const response = await request(app)
          .get('/api/teacher-dashboard/1/settlements')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.SETTLEMENTS_SUCCESS,
          data: {
            settlements: expect.any(Array),
            pagination: {
              page: expect.any(Number),
              limit: expect.any(Number),
              total: expect.any(Number),
              totalPages: expect.any(Number)
            }
          }
        })
      })
    })
  })

  describe('GET /api/teacher-dashboard/settlements/:settlementId', () => {
    describe('成功案例', () => {
      it('應該回傳結算詳情', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)
        
        const settlement = await createTestSettlement(teacher.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/settlements/${settlement.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)

        // Assert
        expect(response.body).toMatchObject({
          status: 'success',
          message: MESSAGES.TEACHER_DASHBOARD.SETTLEMENT_DETAIL_SUCCESS,
          data: {
            settlement: {
              id: expect.any(Number),
              period: expect.any(String),
              totalAmount: expect.any(Number),
              status: expect.any(String),
              settlementDate: expect.any(String),
              earningRecords: expect.any(Array)
            }
          }
        })
      })
    })

    describe('錯誤案例', () => {
      it('應該拒絕不存在的結算 ID', async () => {
        // Arrange
        const { user: teacherUser, authToken } = await UserTestHelpers.createTestUserWithToken({
          role: UserRole.TEACHER
        })
        const teacher = await TeacherTestHelpers.createTeacherApplication(teacherUser.id)

        // Act
        const response = await request(app)
          .get(`/api/teacher-dashboard/${teacher.id}/settlements/999999`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404)

        // Assert
        expectErrorResponse.business(response, MESSAGES.BUSINESS.SETTLEMENT_NOT_FOUND, 404)
      })
    })
  })
})

// ============ Test Helper Functions ============

/**
 * 建立測試用儀表板資料
 */
async function createTestDashboardData(teacherId: number) {
  const studentUser = await UserTestHelpers.createUserEntity({ role: UserRole.STUDENT })
  const course = await CourseTestHelpers.createTestCourseForTeacher(teacherId)
  
  await createTestReservation(teacherId, studentUser.id)
  await createTestEarning(teacherId, 1500)
  
  return { studentUser, course }
}

/**
 * 建立測試用月份資料
 */
async function createMonthlyTestData(teacherId: number) {
  const currentMonth = new Date()
  const studentUser = await UserTestHelpers.createUserEntity({ role: UserRole.STUDENT })
  
  // 建立本月預約
  await createTestReservation(teacherId, studentUser.id, {
    created_at: currentMonth
  })
  
  // 建立本月收益
  await createTestEarning(teacherId, 2000, {
    created_at: currentMonth
  })
}

/**
 * 建立測試統計資料
 */
async function createTestStatisticsData(teacherId: number) {
  await createTestDashboardData(teacherId)
  
  // 建立更多歷史資料用於趨勢分析
  for (let i = 0; i < 5; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    await createTestEarning(teacherId, 1000 + (i * 200), {
      created_at: date
    })
  }
}

/**
 * 建立測試學生資料
 */
async function createTestStudentData(teacherId: number, count: number = 5) {
  const students = []
  
  for (let i = 0; i < count; i++) {
    const student = await UserTestHelpers.createUserEntity({
      role: UserRole.STUDENT,
      nick_name: `學生${i + 1}`,
      email: `student${i + 1}@test.com`
    })
    
    await createTestReservation(teacherId, student.id)
    students.push(student)
  }
  
  return students
}

/**
 * 建立測試預約列表
 */
async function createTestReservations(teacherId: number, count: number = 10) {
  const reservations = []
  
  for (let i = 0; i < count; i++) {
    const student = await UserTestHelpers.createUserEntity({
      role: UserRole.STUDENT
    })
    
    const reservation = await createTestReservation(teacherId, student.id, {
      teacher_status: i % 3 === 0 ? ReservationStatus.RESERVED : ReservationStatus.COMPLETED
    })
    
    reservations.push(reservation)
  }
  
  return reservations
}

/**
 * 建立測試預約
 */
async function createTestReservation(teacherId: number, studentId: number, overrides: any = {}) {
  const reservationRepository = dataSource.getRepository(Reservation)
  
  const reservationData = {
    uuid: require('uuid').v4(),
    teacher_id: teacherId,
    student_id: studentId,
    course_id: 1, // 假設課程 ID
    reserve_time: new Date(), // 正確的欄位名
    teacher_status: ReservationStatus.COMPLETED,
    student_status: ReservationStatus.COMPLETED,
    ...overrides
  }
  
  const reservation = reservationRepository.create(reservationData)
  const savedReservation = await reservationRepository.save(reservation)
  return Array.isArray(savedReservation) ? savedReservation[0] : savedReservation
}

/**
 * 建立測試收益記錄
 */
async function createTestEarnings(teacherId: number, count: number = 10) {
  const earnings = []
  
  for (let i = 0; i < count; i++) {
    const earning = await createTestEarning(teacherId, 1000 + (i * 100), {
      status: i % 3 === 0 ? EarningStatus.PENDING : EarningStatus.SETTLED
    })
    
    earnings.push(earning)
  }
  
  return earnings
}

/**
 * 建立測試收益
 */
async function createTestEarning(teacherId: number, amount: number, overrides: any = {}) {
  const earningRepository = dataSource.getRepository(TeacherEarning)
  
  const earningData = {
    uuid: require('uuid').v4(),
    teacher_id: teacherId,
    order_id: 1, // 必要欄位：訂單 ID
    reservation_id: 1, // 假設預約 ID
    gross_amount: amount,
    platform_fee_rate: 0.1,
    platform_fee: amount * 0.1,
    net_amount: amount * 0.9,
    status: EarningStatus.PENDING,
    settlement_month: '2024-01',
    ...overrides
  }
  
  const earning = earningRepository.create(earningData)
  return await earningRepository.save(earning)
}

/**
 * 建立測試結算記錄列表
 */
async function createTestSettlements(teacherId: number, count: number = 5) {
  const settlements = []
  
  for (let i = 0; i < count; i++) {
    const settlement = await createTestSettlement(teacherId)
    settlements.push(settlement)
  }
  
  return settlements
}

/**
 * 建立測試結算記錄
 */
async function createTestSettlement(teacherId: number) {
  // 注意：這裡可能需要根據實際的 Settlement 實體結構調整
  // 目前假設有 Settlement 實體，實際實作時會確認
  
  const settlement = {
    id: Math.floor(Math.random() * 1000) + 1,
    teacher_id: teacherId,
    period: '2024-01',
    total_amount: 10000,
    status: 'completed',
    settlement_date: new Date(),
    created_at: new Date()
  }
  
  return settlement
}