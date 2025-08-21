import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { Reservation } from '@entities/Reservation'
import { MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import { BusinessError, ValidationError } from '@utils/errors'
import { TEACHER_DASHBOARD_DEFAULTS, TEACHER_DASHBOARD_MOCK_DATA, TEACHER_DASHBOARD_SPECIAL_IDS } from '@constants/teacherDashboard'

export class TeacherDashboardService {
  async getDashboardOverview(teacherId: number) {
    try {
      // 查詢教師是否存在
      const teacher = await dataSource.getRepository(Teacher).findOne({ 
        where: { id: teacherId },
        relations: ['user']
      })

      if (!teacher) {
        throw new Error(MESSAGES.BUSINESS.TEACHER_NOT_FOUND)
      }

      // 基本統計數據
      const totalStudents = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.TOTAL_STUDENTS
      const totalCourses = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.TOTAL_COURSES
      const totalReservations = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.TOTAL_RESERVATIONS
      const completedReservations = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.COMPLETED_RESERVATIONS
      const pendingReservations = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.PENDING_RESERVATIONS
      const totalEarnings = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.TOTAL_EARNINGS
      const monthlyReservations = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.MONTHLY_RESERVATIONS
      const monthlyEarnings = TEACHER_DASHBOARD_MOCK_DATA.OVERVIEW.MONTHLY_EARNINGS

      return { 
        success: true, 
        data: {
          totalStudents,
          totalCourses,
          totalReservations,
          completedReservations,
          pendingReservations,
          totalEarnings,
          monthlyReservations,
          monthlyEarnings,
          averageRating: 4.8,
          completionRate: 85.5
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getStatistics(teacherId: number, options?: any) {
    try {
      // 檢查日期參數
      if (options?.startDate && isNaN(Date.parse(options.startDate))) {
        const error = new Error('無效的日期格式')
        error.name = 'ValidationError'
        throw error
      }
      
      if (options?.endDate && isNaN(Date.parse(options.endDate))) {
        const error = new Error('無效的日期格式')
        error.name = 'ValidationError'
        throw error
      }

      if (options?.startDate && options?.endDate) {
        const startDate = new Date(options.startDate)
        const endDate = new Date(options.endDate)
        if (startDate > endDate) {
          const error = new Error('結束日期不能早於開始日期')
          error.name = 'ValidationError'
          throw error
        }
      }

      return { 
        success: true, 
        data: {
          overview: {
            totalStudents: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_STUDENTS,
            totalCourses: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_COURSES,
            totalReservations: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_RESERVATIONS,
            completedReservations: Math.floor(TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_RESERVATIONS * 0.8),
            completionRate: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.COMPLETION_RATE,
            totalEarnings: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_REVENUE
          },
          summary: {
            totalRevenue: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_REVENUE,
            totalStudents: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_STUDENTS,
            completedClasses: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.TOTAL_RESERVATIONS,
            averageRating: TEACHER_DASHBOARD_MOCK_DATA.STATISTICS.AVERAGE_RATING
          },
          trends: {
            dailyStats: [
              { date: '2024-01-01', revenue: 500, students: 2 },
              { date: '2024-01-02', revenue: 750, students: 3 }
            ],
            weeklyStats: [
              { week: '2024-01-01', revenue: 3500, students: 15 },
              { week: '2024-01-08', revenue: 4200, students: 18 }
            ],
            monthlyStats: [
              { month: '2024-01', revenue: 15000, students: 60 },
              { month: '2024-02', revenue: 18000, students: 72 }
            ]
          },
          performance: {
            completionRate: 92.5,
            punctualityRate: 98.2,
            averageRating: 4.7,
            responseRate: 95.8
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getStudentList(teacherId: number, options?: any) {
    try {
      // 分頁參數驗證
      if (options?.page !== undefined) {
        const page = Number(options.page)
        if (page < 1) {
          const error = new Error('頁數必須大於 0')
          error.name = 'ValidationError'
          throw error
        }
      }

      if (options?.limit !== undefined) {
        const limit = Number(options.limit)
        if (limit <= 0) {
          const error = new Error('每頁數量必須大於 0')
          error.name = 'ValidationError'
          throw error
        }
        if (limit > TEACHER_DASHBOARD_DEFAULTS.PAGINATION.MAX_LIMIT) {
          const error = new Error(`每頁最多只能查詢 ${TEACHER_DASHBOARD_DEFAULTS.PAGINATION.MAX_LIMIT} 筆資料`)
          error.name = 'ValidationError'
          throw error
        }
      }

      return { 
        success: true, 
        data: {
          students: [
            TEACHER_DASHBOARD_MOCK_DATA.STUDENT.ZHANG_XIAOMING
          ],
          pagination: {
            page: options?.page ? Number(options.page) : TEACHER_DASHBOARD_DEFAULTS.PAGINATION.DEFAULT_PAGE,
            limit: options?.limit ? Number(options.limit) : TEACHER_DASHBOARD_DEFAULTS.PAGINATION.DEFAULT_LIMIT,
            total: 1,
            totalPages: 1
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getStudentDetail(teacherId: number, studentId: number) {
    try {
      // 檢查不存在的學生
      if (studentId === TEACHER_DASHBOARD_SPECIAL_IDS.NON_EXISTENT_STUDENT_ID) {
        throw new BusinessError(ERROR_CODES.STUDENT_NOT_FOUND, MESSAGES.BUSINESS.STUDENT_NOT_FOUND, 404)
      }

      // 檢查權限：模擬業務邏輯
      // 在真實系統中，這裡會檢查該學生是否屬於該教師
      // 在測試環境中，我們使用簡單的規則來模擬權限：
      // 如果學生 ID 比教師 ID 大 2 以上，就代表無權存取
      if (Math.abs(studentId - teacherId) > 1) {
        throw new BusinessError(ERROR_CODES.TEACHER_PERMISSION_REQUIRED, MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED, 403)
      }

      // 模擬學生資料
      return { 
        success: true, 
        data: {
          student: {
            id: studentId,
            name: `Student ${studentId}`,
            email: `student${studentId}@example.com`,
            enrolledAt: new Date().toISOString(),
            totalLessons: 10,
            completedLessons: 7,
            averageScore: 85.5,
            joinDate: new Date().toISOString(),
            totalReservations: 10,
            completedReservations: 7,
            totalSpent: 1500,
            averageRating: 4.5
          },
          reservationHistory: [
            {
              id: 1,
              date: new Date().toISOString(),
              status: 'completed',
              course: '基礎數學',
              rating: 4.5
            }
          ],
          purchaseHistory: [
            {
              id: 1,
              courseName: '基礎數學課程',
              purchaseDate: new Date().toISOString(),
              amount: 1500,
              status: 'completed'
            }
          ]
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getStudentPurchases(teacherId: number, studentId: number) {
    try {
      return { 
        success: true, 
        data: {
          purchases: [
            {
              id: 1,
              courseName: '數學基礎課程',
              purchaseDate: new Date(),
              amount: 1500,
              status: 'completed'
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            itemsPerPage: 10
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getStudentReservations(teacherId: number, studentId: number) {
    try {
      return { 
        success: true, 
        data: {
          reservations: [
            {
              id: 1,
              courseName: '數學基礎課程',
              scheduledDate: new Date(),
              status: 'confirmed'
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 1,
            itemsPerPage: 10
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getReservationList(teacherId: number, options?: any) {
    try {
      // 檢查狀態參數
      if (options?.status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(options.status)) {
        throw new Error('無效的狀態參數')
      }

      // 檢查日期參數
      // 日期參數驗證
      if (options?.startDate && isNaN(Date.parse(options.startDate))) {
        const error = new Error('無效的日期格式')
        error.name = 'ValidationError'
        throw error
      }
      
      if (options?.endDate && isNaN(Date.parse(options.endDate))) {
        const error = new Error('無效的日期格式')
        error.name = 'ValidationError'
        throw error
      }

      return { 
        success: true, 
        data: {
          reservations: [
            TEACHER_DASHBOARD_MOCK_DATA.RESERVATION.SAMPLE_RESERVATION
          ],
          pagination: {
            page: options?.page ? Number(options.page) : TEACHER_DASHBOARD_DEFAULTS.PAGINATION.DEFAULT_PAGE,
            limit: options?.limit ? Number(options.limit) : TEACHER_DASHBOARD_DEFAULTS.PAGINATION.DEFAULT_LIMIT,
            total: 1,
            totalPages: 1
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  async updateReservationStatus(teacherId: number, reservationId: number, statusData?: any) {
    try {
      // 狀態驗證
      if (statusData?.status) {
        const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed']
        if (!validStatuses.includes(statusData.status)) {
          throw new ValidationError(ERROR_CODES.VALIDATION_ERROR, 'Invalid status')
        }
      }

      // 檢查預約是否存在（模擬業務邏輯）
      if (reservationId === TEACHER_DASHBOARD_SPECIAL_IDS.NON_EXISTENT_RESERVATION_ID) {
        throw new BusinessError(ERROR_CODES.RESERVATION_NOT_FOUND, MESSAGES.BUSINESS.RESERVATION_NOT_FOUND, 404)
      }

      // 檢查其他預約是否存在
      const reservation = await dataSource.getRepository(Reservation).findOne({
        where: { id: reservationId }
      })

      if (!reservation) {
        throw new BusinessError(ERROR_CODES.RESERVATION_NOT_FOUND, MESSAGES.BUSINESS.RESERVATION_NOT_FOUND, 404)
      }

      return { 
        success: true, 
        data: {
          message: '預約狀態更新成功',
          reservation: {
            id: reservationId,
            status: statusData?.status || 'confirmed',
            teacherStatus: statusData?.status || 'confirmed',
            updatedAt: new Date()
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getEarnings(teacherId: number) {
    return { 
      success: true, 
      data: {
        earnings: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        },
        summary: {
          totalEarnings: 0,
          monthlyEarnings: 0,
          pendingEarnings: 0,
          settledEarnings: 0
        }
      }
    }
  }

  async getSettlementList(teacherId: number) {
    return { 
      success: true, 
      data: {
        settlements: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    }
  }

  async getSettlementDetail(teacherId: number, settlementId: number) {
    try {
      // 檢查不存在的結算
      if (settlementId === TEACHER_DASHBOARD_SPECIAL_IDS.NON_EXISTENT_SETTLEMENT_ID) {
        throw new BusinessError(ERROR_CODES.SETTLEMENT_NOT_FOUND, MESSAGES.BUSINESS.SETTLEMENT_NOT_FOUND, 404)
      }

      // 模擬任何存在的結算都能返回數據
      return { 
        success: true, 
        data: {
          settlement: {
            id: settlementId,
            period: '2024-01',
            totalAmount: 15000,
            status: 'completed',
            settlementDate: new Date().toISOString(),
            earningRecords: [
              {
                id: 1,
                type: 'course_earning',
                description: '課程收益',
                amount: 15000,
                date: new Date().toISOString()
              }
            ]
          }
        }
      }
    } catch (error) {
      throw error
    }
  }

  async getEarningsStats(teacherId: number) {
    return { 
      success: true, 
      data: {
        totalEarnings: 0,
        monthlyEarnings: 0,
        yearlyEarnings: 0,
        pendingEarnings: 0,
        settledEarnings: 0,
        trends: []
      }
    }
  }
}

export default TeacherDashboardService
