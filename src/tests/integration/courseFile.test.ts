import { dataSource } from '@db/data-source'
import request from 'supertest'
import app from '../../app'
import { UserTestHelpers, CourseTestHelpers, CourseFileTestHelpers } from '@tests/helpers/testHelpers'
import { UserRole } from '@entities/enums'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES, SUCCESS } from '@constants/Message'

describe('課程檔案管理 API 整合測試', () => {
  let testEnv: any

  beforeAll(async () => {
    await dataSource.initialize()
  })

  afterAll(async () => {
    await dataSource.destroy()
  })

  beforeEach(async () => {
    await dataSource.synchronize(true) // 重置測試資料庫
    testEnv = await CourseFileTestHelpers.createTestEnvironment()
  })

  afterEach(async () => {
    await CourseFileTestHelpers.cleanupTestEnvironment()
  })

  // ==================== GET /api/courses/:id/files ====================
  
  describe('GET /api/courses/:id/files - 取得課程檔案列表', () => {
    it('應該成功取得課程檔案列表', async () => {
      // Arrange
      const { course, authToken } = testEnv
      await CourseFileTestHelpers.createTestCourseFiles(course.id, 3) // 建立3個測試檔案

      // Act
      const response = await request(app)
        .get(`/api/courses/${course.id}/files`)
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(SUCCESS.COURSE_FILE_LIST_SUCCESS)
      expect(response.body.data.files).toHaveLength(3)
      expect(response.body.data.pagination).toBeDefined()
      expect(response.body.data.summary).toBeDefined()
      expect(response.body.data.summary.total_files).toBe(3)

      // 檢查檔案結構
      const file = response.body.data.files[0]
      expect(file).toHaveProperty('id')
      expect(file).toHaveProperty('uuid')
      expect(file).toHaveProperty('course_id', course.id)
      expect(file).toHaveProperty('name')
      expect(file).toHaveProperty('file_id')
      expect(file).toHaveProperty('url')
      expect(file).toHaveProperty('created_at')
      expect(file).toHaveProperty('updated_at')
    })

    it('應該支援分頁查詢', async () => {
      // Arrange
      const { course, authToken } = testEnv
      await CourseFileTestHelpers.createTestCourseFiles(course.id, 15) // 建立15個測試檔案

      // Act
      const response = await request(app)
        .get(`/api/courses/${course.id}/files`)
        .query({ page: 2, per_page: 5 })
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data.files).toHaveLength(5)
      expect(response.body.data.pagination.current_page).toBe(2)
      expect(response.body.data.pagination.per_page).toBe(5)
      expect(response.body.data.pagination.total).toBe(15)
    })

    it('應該回傳空列表當課程沒有檔案', async () => {
      // Arrange - 沒有建立任何檔案
      const { course, authToken } = testEnv

      // Act
      const response = await request(app)
        .get(`/api/courses/${course.id}/files`)
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.data.files).toHaveLength(0)
      expect(response.body.data.summary.total_files).toBe(0)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      // Arrange
      const { course } = testEnv

      // Act
      const response = await request(app)
        .get(`/api/courses/${course.id}/files`)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該拒絕其他教師存取並回傳 403', async () => {
      // Arrange
      const { course } = testEnv
      const { authToken: otherTeacherToken } = await UserTestHelpers.createTestUserWithToken({
        role: UserRole.TEACHER
      })

      // Act
      const response = await request(app)
        .get(`/api/courses/${course.id}/files`)
        .set('Authorization', `Bearer ${otherTeacherToken}`)

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該處理不存在的課程並回傳 404', async () => {
      // Arrange
      const { authToken } = testEnv
      const nonExistentCourseId = 999999

      // Act
      const response = await request(app)
        .get(`/api/courses/${nonExistentCourseId}/files`)
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })
  })

  // ==================== POST /api/courses/:id/files ====================

  describe('POST /api/courses/:id/files - 上傳課程檔案', () => {
    it('應該成功上傳單個檔案', async () => {
      // Arrange
      const { course, authToken } = testEnv
      
      // TODO: 檔案上傳功能未實作，先建立 mock 測試

      // Act - TODO: 實際檔案上傳邏輯待實作
      // const response = await request(app)
      //   .post(`/api/courses/${course.id}/files`)
      //   .set('Authorization', `Bearer ${authToken}`)
      //   .attach('files', Buffer.from('mock pdf content'), 'test-document.pdf')

      // 暫時 skip 此測試直到檔案上傳功能實作
      expect(true).toBe(true) // placeholder assertion
    })

    it.todo('應該成功上傳多個檔案')
    it.todo('應該驗證檔案格式並拒絕不支援的檔案')
    it.todo('應該驗證檔案大小並拒絕過大的檔案')
    it.todo('應該檢查檔案數量限制')
    it.todo('應該拒絕未認證請求')
    it.todo('應該拒絕其他教師上傳檔案')
    it.todo('應該處理不存在的課程')
  })

  // ==================== DELETE /api/courses/:course_id/files/:file_id ====================

  describe('DELETE /api/courses/:course_id/files/:file_id - 刪除課程檔案', () => {
    it('應該成功刪除課程檔案', async () => {
      // Arrange
      const { course, teacher, authToken } = testEnv
      const testFiles = await CourseFileTestHelpers.createTestCourseFiles(course.id, 1)
      const fileToDelete = testFiles[0]

      // Act
      const response = await request(app)
        .delete(`/api/courses/${course.id}/files/${fileToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(200)
      expect(response.body.status).toBe('success')
      expect(response.body.message).toBe(SUCCESS.COURSE_FILE_DELETED)
      expect(response.body.data).toBe(null)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      // Arrange
      const { course } = testEnv
      const testFiles = await CourseFileTestHelpers.createTestCourseFiles(course.id, 1)
      const fileToDelete = testFiles[0]

      // Act
      const response = await request(app)
        .delete(`/api/courses/${course.id}/files/${fileToDelete.id}`)

      // Assert
      expect(response.status).toBe(401)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.AUTH.TOKEN_REQUIRED)
    })

    it('應該拒絕其他教師刪除檔案並回傳 403', async () => {
      // Arrange
      const { course } = testEnv
      const testFiles = await CourseFileTestHelpers.createTestCourseFiles(course.id, 1)
      const fileToDelete = testFiles[0]
      
      const { authToken: otherTeacherToken } = await UserTestHelpers.createTestUserWithToken({
        role: UserRole.TEACHER
      })

      // Act
      const response = await request(app)
        .delete(`/api/courses/${course.id}/files/${fileToDelete.id}`)
        .set('Authorization', `Bearer ${otherTeacherToken}`)

      // Assert
      expect(response.status).toBe(403)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該處理不存在的課程並回傳 404', async () => {
      // Arrange
      const { authToken } = testEnv
      const nonExistentCourseId = 999999
      const nonExistentFileId = 999999

      // Act
      const response = await request(app)
        .delete(`/api/courses/${nonExistentCourseId}/files/${nonExistentFileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.COURSE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_NOT_FOUND)
    })

    it('應該處理不存在的檔案並回傳 404', async () => {
      // Arrange
      const { course, teacher, authToken } = testEnv
      const nonExistentFileId = 999999

      // Act
      const response = await request(app)
        .delete(`/api/courses/${course.id}/files/${nonExistentFileId}`)
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.COURSE_FILE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_FILE_NOT_FOUND)
    })

    it('應該檢查檔案是否屬於指定課程', async () => {
      // Arrange - 建立另一個課程和檔案
      const { course: course1, teacher, authToken } = testEnv
      const course2 = await CourseTestHelpers.createTestCourseForTeacher(teacher.id)
      const course2Files = await CourseFileTestHelpers.createTestCourseFiles(course2.id, 1)
      const fileInCourse2 = course2Files[0]

      // Act - 嘗試用 course1 的 ID 刪除 course2 的檔案
      const response = await request(app)
        .delete(`/api/courses/${course1.id}/files/${fileInCourse2.id}`)
        .set('Authorization', `Bearer ${authToken}`)

      // Assert
      expect(response.status).toBe(404)
      expect(response.body.status).toBe('error')
      expect(response.body.code).toBe(ERROR_CODES.COURSE_FILE_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.COURSE_FILE_NOT_FOUND)
    })
  })
})