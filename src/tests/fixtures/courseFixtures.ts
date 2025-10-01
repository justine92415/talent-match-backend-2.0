/**
 * 課程測試資料 Fixtures
 * 
 * 包含公開課程瀏覽搜尋測試所需的測試資料
 */

import { CourseStatus, ApplicationStatus } from '@entities/enums'
import { 
  TEST_IDS, 
  PAGINATION, 
  TEST_SEARCH_DATA, 
  TEST_COURSE_DATA 
} from '@tests/constants/testConstants'

// ==================== 公開課程查詢測試資料 ====================

/** 有效的課程搜尋查詢參數 */
export const validCourseSearchQuery = {
  keyword: TEST_SEARCH_DATA.VALID_KEYWORD,
  sort: TEST_SEARCH_DATA.SORT_NEWEST,
  page: PAGINATION.DEFAULT_PAGE,
  per_page: PAGINATION.DEFAULT_PER_PAGE
}

/** 有效的分類搜尋查詢參數 */
export const validCategorySearchQuery = {
  main_category_id: TEST_IDS.MAIN_CATEGORY_ID,
  sub_category_id: TEST_IDS.SUB_CATEGORY_ID,
  city_id: TEST_IDS.CITY_ID,
  sort: TEST_SEARCH_DATA.SORT_POPULAR,
  page: PAGINATION.DEFAULT_PAGE,
  per_page: PAGINATION.MEDIUM_PER_PAGE
}

/** 無效的搜尋查詢參數 - 混合搜尋方式 */
export const invalidMixedSearchQuery = {
  keyword: TEST_SEARCH_DATA.VALID_KEYWORD,
  main_category_id: TEST_IDS.MAIN_CATEGORY_ID,
  sub_category_id: TEST_IDS.SUB_CATEGORY_ID
}

/** 無效的分類搜尋 - 缺少次分類 */
export const invalidCategorySearchQuery = {
  main_category_id: TEST_IDS.MAIN_CATEGORY_ID
  // 缺少 sub_category_id
}

/** 無效的排序參數 */
export const invalidSortQuery = {
  keyword: TEST_SEARCH_DATA.ANOTHER_VALID_KEYWORD,
  sort: TEST_SEARCH_DATA.INVALID_SORT
}

// ==================== 課程實體測試資料 ====================

/** 公開的課程資料 */
export const publishedCourseData = {
  uuid: TEST_COURSE_DATA.PUBLISHED_COURSE_1_UUID,
  teacher_id: TEST_IDS.VALID_COURSE_ID,
  name: 'Python 程式設計入門',
  content: '完整的 Python 學習課程，從基礎語法到實作專案，適合初學者和有經驗的開發者。',
  main_image: '/uploads/courses/python-course.jpg',
  rate: TEST_COURSE_DATA.PYTHON_COURSE_RATE,
  review_count: TEST_COURSE_DATA.PYTHON_COURSE_REVIEW_COUNT,
  view_count: TEST_COURSE_DATA.PYTHON_COURSE_VIEW_COUNT,
  student_count: TEST_COURSE_DATA.PYTHON_COURSE_STUDENT_COUNT,
  main_category_id: TEST_IDS.MAIN_CATEGORY_ID,
  sub_category_id: TEST_IDS.SUB_CATEGORY_ID,
  city_id: TEST_IDS.CITY_ID,
  survey_url: 'https://forms.gle/python-survey',
  purchase_message: '感謝購買課程，請聯絡我安排上課時間',
  status: CourseStatus.PUBLISHED,
  application_status: ApplicationStatus.APPROVED
}

/** 另一個公開課程資料 */
export const anotherPublishedCourseData = {
  uuid: TEST_COURSE_DATA.PUBLISHED_COURSE_2_UUID,
  teacher_id: 2,
  name: 'JavaScript 網頁開發',
  content: '學習現代 JavaScript 和前端框架，建立動態網站。',
  main_image: '/uploads/courses/javascript-course.jpg',
  rate: TEST_COURSE_DATA.JAVASCRIPT_COURSE_RATE,
  review_count: TEST_COURSE_DATA.JAVASCRIPT_COURSE_REVIEW_COUNT,
  view_count: TEST_COURSE_DATA.JAVASCRIPT_COURSE_VIEW_COUNT,
  student_count: TEST_COURSE_DATA.JAVASCRIPT_COURSE_STUDENT_COUNT,
  main_category_id: TEST_IDS.MAIN_CATEGORY_ID,
  sub_category_id: TEST_IDS.ANOTHER_SUB_CATEGORY_ID,
  city_id: TEST_IDS.ANOTHER_CITY_ID,
  status: CourseStatus.PUBLISHED,
  application_status: ApplicationStatus.APPROVED
}

/** 草稿狀態課程（不應該出現在公開列表） */
export const draftCourseData = {
  uuid: TEST_COURSE_DATA.DRAFT_COURSE_UUID,
  teacher_id: TEST_IDS.VALID_COURSE_ID,
  name: '待發布課程',
  content: '這是尚未發布的課程內容',
  status: CourseStatus.DRAFT,
  main_category_id: TEST_IDS.MAIN_CATEGORY_ID,
  sub_category_id: TEST_IDS.SUB_CATEGORY_ID,
  city_id: TEST_IDS.CITY_ID
}

/** 封存狀態課程（不應該出現在公開列表） */
export const archivedCourseData = {
  uuid: TEST_COURSE_DATA.ARCHIVED_COURSE_UUID,
  teacher_id: 2,
  name: '已封存課程',
  content: '這是已封存的課程內容',
  status: CourseStatus.ARCHIVED,
  main_category_id: TEST_IDS.MAIN_CATEGORY_ID,
  sub_category_id: TEST_IDS.SUB_CATEGORY_ID,
  city_id: TEST_IDS.CITY_ID
}

// ==================== 收藏功能測試資料 ====================

/** 新增收藏請求資料 */
export const validAddFavoriteData = {
  course_id: TEST_IDS.VALID_COURSE_ID
}

/** 無效的收藏請求資料 */
export const invalidAddFavoriteData = {
  course_id: 'invalid_id'
}

/** 不存在的課程收藏請求 */
export const nonExistentCourseAddFavoriteData = {
  course_id: TEST_IDS.NON_EXISTENT_ID
}

// ==================== 課程評價測試資料 ====================

/** 課程評價查詢參數 */
export const validReviewQuery = {
  page: PAGINATION.DEFAULT_PAGE,
  per_page: PAGINATION.MEDIUM_PER_PAGE,
  rating: TEST_IDS.VALID_RATING,
  sort: TEST_SEARCH_DATA.SORT_NEWEST
}

/** 無效的評價查詢參數 */
export const invalidReviewQuery = {
  rating: TEST_IDS.INVALID_RATING, // 超出 1-5 範圍
  sort: TEST_SEARCH_DATA.INVALID_SORT
}

// ==================== 分頁測試資料 ====================

/** 有效的分頁參數 */
export const validPaginationParams = {
  page: PAGINATION.TEST_PAGE,
  per_page: PAGINATION.TEST_PER_PAGE
}

/** 無效的分頁參數 */
export const invalidPaginationParams = {
  page: PAGINATION.MIN_PAGE, // 0 - 無效頁數
  per_page: PAGINATION.MAX_PER_PAGE // 101 - 超出限制
}

// ==================== 預期回應格式 ====================

/** 課程列表回應結構 */
export const expectedCourseListStructure = {
  status: 'success',
  message: expect.any(String),
  data: {
    courses: expect.any(Array),
    pagination: {
      current_page: expect.any(Number),
      per_page: expect.any(Number),
      total: expect.any(Number),
      total_pages: expect.any(Number)
    },
    filters: expect.any(Object)
  }
}

/** 課程詳情回應結構 */
export const expectedCourseDetailStructure = {
  status: 'success',
  message: expect.any(String),
  data: {
    course: expect.any(Object),
    price_options: expect.any(Array),
    videos: expect.any(Array),
    files: expect.any(Array),
    teacher: expect.any(Object),
    teacher_work_experiences: expect.any(Array),
    teacher_learning_experiences: expect.any(Array),
    teacher_certificates: expect.any(Array),
    available_slots: expect.any(Array),
    recent_reviews: expect.any(Array),
    recommended_courses: expect.any(Array)
  }
}

/** 收藏回應結構 */
export const expectedFavoriteResponseStructure = {
  status: 'success',
  message: expect.any(String),
  data: {
    favorite: {
      id: expect.any(Number),
      uuid: expect.any(String),
      user_id: expect.any(Number),
      course_id: expect.any(Number),
      created_at: expect.any(String)
    }
  }
}

/** 收藏列表回應結構 */
export const expectedFavoriteListStructure = {
  status: 'success',
  message: expect.any(String),
  data: {
    favorites: expect.any(Array),
    pagination: expect.any(Object)
  }
}

/** 錯誤回應結構 */
export const expectedErrorResponseStructure = {
  status: 'error',
  code: expect.any(String),
  message: expect.any(String)
}

/** 驗證錯誤回應結構 */
export const expectedValidationErrorStructure = {
  status: 'error',
  code: expect.any(String),
  message: expect.any(String),
  errors: expect.any(Object)
}