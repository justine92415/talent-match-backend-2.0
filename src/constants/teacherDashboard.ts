/**
 * 教師後台相關常數
 */

/**
 * 預設值配置
 */
export const TEACHER_DASHBOARD_DEFAULTS = {
  // 分頁預設值
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
  },
  
  // 統計數據預設值
  STATS: {
    DEFAULT_COMPLETION_RATE: 85.5,
    DEFAULT_AVERAGE_RATING: 4.8
  }
} as const

/**
 * 驗證規則常數
 */
export const TEACHER_DASHBOARD_VALIDATION = {
  // 允許的預約狀態
  RESERVATION_STATUSES: ['pending', 'confirmed', 'cancelled', 'completed'] as const,
  
  // 允許的收益狀態
  EARNING_STATUSES: ['pending', 'settled'] as const,
  
  // 學生權限檢查：最大 ID 差距
  STUDENT_ACCESS_MAX_ID_DIFF: 1
} as const

/**
 * Mock 測試數據常數
 */
export const TEACHER_DASHBOARD_MOCK_DATA = {
  // 儀表板總覽預設數據
  OVERVIEW: {
    TOTAL_STUDENTS: 5,
    TOTAL_COURSES: 3,
    TOTAL_RESERVATIONS: 15,
    COMPLETED_RESERVATIONS: 10,
    PENDING_RESERVATIONS: 2,
    TOTAL_EARNINGS: 12500,
    MONTHLY_RESERVATIONS: 5,
    MONTHLY_EARNINGS: 3500,
    AVERAGE_RATING: 4.8,
    COMPLETION_RATE: 85.5
  },
  
  // 統計資料預設數據
  STATISTICS: {
    TOTAL_REVENUE: 25000,
    TOTAL_STUDENTS: 45,
    TOTAL_RESERVATIONS: 120,
    TOTAL_COURSES: 8,
    COMPLETION_RATE: 92.5,
    PUNCTUALITY_RATE: 98.2,
    AVERAGE_RATING: 4.7,
    RESPONSE_RATE: 95.8
  },
  
  // 學生預設數據
  STUDENT: {
    DEFAULT_NAME_PREFIX: 'Student ',
    DEFAULT_EMAIL_DOMAIN: '@example.com',
    DEFAULT_TOTAL_LESSONS: 10,
    DEFAULT_COMPLETED_LESSONS: 7,
    DEFAULT_AVERAGE_SCORE: 85.5,
    DEFAULT_TOTAL_SPENT: 1500,
    DEFAULT_AVERAGE_RATING: 4.5,
    
    // 具體測試學生數據
    ZHANG_XIAOMING: {
      id: 1,
      name: '張小明',
      email: 'student1@test.com',
      status: 'active',
      enrolledCourses: 2,
      totalLessons: 12,
      completedLessons: 8,
      totalReservations: 12,
      completedReservations: 8,
      totalSpent: 5600,
      averageRating: 4.3,
      lastReservationDate: '2024-01-15'
    }
  },

  // 預約預設數據
  RESERVATION: {
    DEFAULT_COURSE_NAME: '數學基礎',
    DEFAULT_DURATION: 60,
    DEFAULT_STATUS: 'pending' as const,
    
    // 具體測試預約數據
    SAMPLE_RESERVATION: {
      id: 1,
      studentName: '張小明',
      courseName: '數學基礎',
      startTime: new Date(),
      duration: 60,
      status: 'pending' as const,
      studentId: 1
    }
  }
} as const

/**
 * 教師權限檢查的特殊 ID
 */
export const TEACHER_DASHBOARD_SPECIAL_IDS = {
  // 測試用的不存在資源 ID
  NON_EXISTENT_STUDENT_ID: 999999,
  NON_EXISTENT_RESERVATION_ID: 999999,
  NON_EXISTENT_SETTLEMENT_ID: 999999
} as const