/**
 * 測試常數定義
 * 
 * 統一管理測試中使用的魔術數字和硬編碼值
 * 提高測試代碼的可維護性和可讀性
 */

// ==================== HTTP 狀態碼 ====================
export const HTTP_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
} as const

// ==================== 測試用 ID ====================
export const TEST_IDS = {
  // 有效的測試 ID
  VALID_COURSE_ID: 1,
  VALID_TEACHER_ID: 41,
  ANOTHER_TEACHER_ID: 45,
  THIRD_TEACHER_ID: 47,
  FOURTH_TEACHER_ID: 49,
  
  // 分類 ID
  MAIN_CATEGORY_ID: 1,
  SUB_CATEGORY_ID: 2,
  ANOTHER_SUB_CATEGORY_ID: 3,
  CITY_ID: 1,
  ANOTHER_CITY_ID: 2,
  
  // 不存在的 ID (測試錯誤情況)
  NON_EXISTENT_ID: 999999,
  
  // 評分相關
  MIN_RATING: 1,
  MAX_RATING: 5,
  INVALID_RATING: 6,
  VALID_RATING: 5
} as const

// ==================== 分頁常數 ====================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 12,
  SMALL_PER_PAGE: 5,
  MEDIUM_PER_PAGE: 10,
  
  // 分頁邊界值
  MIN_PAGE: 0, // 無效頁數 (用於測試錯誤情況)
  MAX_PER_PAGE: 101, // 超出限制的每頁項目數 (用於測試錯誤情況)
  
  // 測試用分頁
  TEST_PAGE: 2,
  TEST_PER_PAGE: 5
} as const

// ==================== 測試用戶資料常數 ====================
export const TEST_USER_DATA = {
  // UUID 常數
  ACTIVE_TEACHER_UUID: '550e8400-e29b-41d4-a716-446655440001',
  INACTIVE_TEACHER_UUID: '550e8400-e29b-41d4-a716-446655440002',
  
  // 用戶數據
  ACTIVE_TEACHER_EMAIL: 'teacher1@example.com',
  INACTIVE_TEACHER_EMAIL: 'teacher2@example.com',
  ACTIVE_TEACHER_NICK_NAME: 'Python專家',
  INACTIVE_TEACHER_NICK_NAME: '停用教師',
  COMMON_PASSWORD: 'hashedpassword',
  
  // 教師統計數據
  TOTAL_STUDENTS: 100,
  TOTAL_COURSES: 5,
  AVERAGE_RATING: 4.5,
  NATIONALITY: '台灣',
  INTRODUCTION: '我是Python專業教師'
} as const

// ==================== 課程資料常數 ====================
export const TEST_COURSE_DATA = {
  // 課程 UUID
  PUBLISHED_COURSE_1_UUID: '550e8400-e29b-41d4-a716-446655440001',
  PUBLISHED_COURSE_2_UUID: '550e8400-e29b-41d4-a716-446655440002',
  DRAFT_COURSE_UUID: '550e8400-e29b-41d4-a716-446655440003',
  ARCHIVED_COURSE_UUID: '550e8400-e29b-41d4-a716-446655440004',
  
  // 課程統計
  PYTHON_COURSE_RATE: 4.5,
  PYTHON_COURSE_REVIEW_COUNT: 23,
  PYTHON_COURSE_VIEW_COUNT: 156,
  PYTHON_COURSE_PURCHASE_COUNT: 45,
  PYTHON_COURSE_STUDENT_COUNT: 38,
  
  JAVASCRIPT_COURSE_RATE: 4.3,
  JAVASCRIPT_COURSE_REVIEW_COUNT: 18,
  JAVASCRIPT_COURSE_VIEW_COUNT: 89,
  JAVASCRIPT_COURSE_PURCHASE_COUNT: 32,
  JAVASCRIPT_COURSE_STUDENT_COUNT: 28,
  
  // 推薦課程數量限制
  MAX_RECOMMENDED_COURSES: 4,
  
  // 課程隱私相關
  PUBLIC_TOTAL_EARNINGS: 0 // 公開API不顯示實際金額
} as const

// ==================== 搜尋常數 ====================
export const TEST_SEARCH_DATA = {
  // 搜尋關鍵字
  VALID_KEYWORD: 'Python',
  ANOTHER_VALID_KEYWORD: 'JavaScript',
  NON_EXISTENT_KEYWORD: '不存在的課程名稱',
  
  // 排序選項
  SORT_NEWEST: 'newest' as const,
  SORT_POPULAR: 'popular' as const,
  INVALID_SORT: 'invalid_sort'
} as const

// ==================== 驗證常數 ====================
export const VALIDATION_LIMITS = {
  // 分頁限制
  MIN_PAGE_NUMBER: 1,
  MAX_PER_PAGE_LIMIT: 100,
  
  // 評分範圍
  MIN_RATING_VALUE: 1,
  MAX_RATING_VALUE: 5,
  
  // 字串長度 (根據需要擴展)
  MAX_COURSE_NAME_LENGTH: 100,
  MAX_CONTENT_LENGTH: 5000
} as const

// ==================== 測試狀態常數 ====================
export const TEST_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// ==================== 測試期望結構 ====================
export const EXPECTED_PROPERTIES = {
  // 課程屬性
  COURSE_PROPERTIES: ['id', 'name', 'content', 'status'] as const,
  
  // 教師屬性
  TEACHER_PROPERTIES: ['id', 'user', 'nationality', 'introduction'] as const,
  
  // 分頁屬性
  PAGINATION_PROPERTIES: ['current_page', 'per_page', 'total', 'total_pages'] as const,
  
  // 用戶屬性
  USER_PROPERTIES: ['name', 'nick_name'] as const
} as const

// ==================== API 路徑常數 ====================
export const API_PATHS = {
  // === 管理員 APIs ===
  ADMIN_ORDERS: '/api/admin/orders',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_REPORTS: '/api/admin/reports',
  
  // === 認證 APIs ===
  REGISTER: '/api/auth/register',
  LOGIN: '/api/auth/login',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  VERIFY_EMAIL: '/api/auth/verify-email',
  
  // === 使用者管理 APIs ===
  USER_PROFILE: '/api/users/profile',
  TEACHER_PROFILE: '/api/teachers/profile',
  
  // === 課程管理 APIs ===
  COURSES: '/api/courses',
  COURSE_BY_ID: (id: number) => `/api/courses/${id}`,
  COURSE_BY_UUID: (uuid: string) => `/api/courses/${uuid}`,
  PUBLIC_COURSES: '/api/courses/public',
  PUBLIC_COURSE_BY_UUID: (uuid: string) => `/api/courses/public/${uuid}`,
  PUBLIC_COURSE_DETAIL: (id: number) => `/api/courses/public/${id}`,
  TEACHER_MANAGE_COURSES: (id: number) => `/api/teachers/${id}/courses`,
  
  // === 工作經驗 APIs ===
  WORK_EXPERIENCES: '/api/teachers/work-experiences',
  WORK_EXPERIENCE_BY_ID: (id: number) => `/api/teachers/work-experiences/${id}`,
  
  // === 學習經歷 APIs ===
  LEARNING_EXPERIENCES: '/api/teachers/learning-experiences',
  LEARNING_EXPERIENCE_BY_ID: (id: number) => `/api/teachers/learning-experiences/${id}`,
  
  // === 訂單 APIs ===
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id: number) => `/api/orders/${id}`,
  
  // === 購物車 APIs ===
  CART: '/api/cart',
  CART_ITEMS: '/api/cart/items',
  CART_ITEM_BY_ID: (id: number) => `/api/cart/items/${id}`,
  
  // === 預約 APIs ===
  RESERVATIONS: '/api/reservations',
  RESERVATION_BY_ID: (id: number) => `/api/reservations/${id}`,
  
  // === 評價 APIs ===
  REVIEWS: '/api/reviews',
  REVIEW_BY_ID: (id: number) => `/api/reviews/${id}`,
  MY_REVIEWS: '/api/reviews/my',
  RECEIVED_REVIEWS: '/api/reviews/received',
  COURSE_REVIEWS: (uuid: string) => `/api/courses/${uuid}/reviews`,
  
  // === 公開資訊 APIs ===
  PUBLIC_TEACHERS: '/api/teachers/public',
  PUBLIC_TEACHER: (id: number) => `/api/teachers/public/${id}`,
  PUBLIC_TEACHER_BY_UUID: (uuid: string) => `/api/teachers/public/${uuid}`,
  PUBLIC_TEACHER_COURSES: (id: number) => `/api/teachers/public/${id}/courses`,
  
  // === 其他 APIs ===
  PING: '/api/ping',
  UPLOAD: '/api/upload',
} as const