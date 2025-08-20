/**
 * 影片管理 API 整合測試
 * 
 * 測試範圍：
 * - POST /api/videos - 上傳影片
 * - PUT /api/videos/{id} - 更新影片資訊  
 * - DELETE /api/videos/{id} - 刪除影片
 * - GET /api/videos - 取得影片列表
 * - GET /api/videos/{id} - 取得影片詳情
 * 
 * 遵循 TDD 指示文件：
 * - 業務邏輯核心測試案例導向
 * - 使用 ERROR_CODES 和 MESSAGES 常數
 * - 使用測試 Helpers 避免重複程式碼
 * - 涵蓋成功案例、權限控制、資料驗證、業務規則
 */

import request from 'supertest'
import { dataSource } from '@db/data-source'
import { Video } from '@entities/Video'
import { VideoType, UserRole } from '@entities/enums'
import { initTestDatabase, closeTestDatabase, clearDatabase } from '@tests/helpers/database'
import { UserTestHelpers, RequestTestHelpers, ValidationTestHelpers } from '@tests/helpers/testHelpers'
import { 
  validYouTubeVideoData, 
  validStorageVideoData,
  validVideoUpdateData,
  validVideoListQuery,
  missingNameVideoData,
  missingCategoryVideoData,
  missingIntroVideoData,
  missingVideoTypeData,
  missingYouTubeUrlData,
  invalidYouTubeUrlData,
  tooLongNameVideoData,
  tooLongCategoryVideoData,
  tooLongIntroVideoData,
  invalidVideoTypeData,
  createVideoEntityData,
  mockVideoFile,
  mockLargeVideoFile,
  mockInvalidVideoFile
} from '@tests/fixtures/videoFixtures'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import app from './../app'

describe('影片管理 API 整合測試', () => {
  let teacherUser: any
  let teacherAuthToken: string
  let studentUser: any
  let studentAuthToken: string
  let testVideo: Video

  beforeAll(async () => {
    await initTestDatabase()
  })

  afterAll(async () => {
    await closeTestDatabase()
  })

  beforeEach(async () => {
    // 清理測試資料
    await dataSource.getRepository(Video).clear()

    // 建立測試教師用戶
    const teacherTestEnv = await UserTestHelpers.createTestUserWithToken({
      role: UserRole.TEACHER
    })
    teacherUser = teacherTestEnv.user
    teacherAuthToken = teacherTestEnv.authToken

    // 建立測試學生用戶
    const studentTestEnv = await UserTestHelpers.createTestUserWithToken({
      role: UserRole.STUDENT
    })
    studentUser = studentTestEnv.user
    studentAuthToken = studentTestEnv.authToken

    // 建立測試影片
    const videoRepository = dataSource.getRepository(Video)
    const videoData = createVideoEntityData({ teacher_id: teacherUser.id })
    testVideo = await videoRepository.save(videoData)
  })

  afterEach(async () => {
    // 清理測試資料
    await dataSource.getRepository(Video).clear()
  })

  // ========================================
  // POST /api/videos - 上傳影片
  // ========================================
  
  describe('POST /api/videos', () => {
    it('應該成功上傳 YouTube 影片並回傳 201', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        validYouTubeVideoData
      )

      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        status: 'success',
        message: expect.any(String),
        data: expect.objectContaining({
          video: expect.objectContaining({
            id: expect.any(Number),
            uuid: expect.any(String),
            teacher_id: teacherUser.id,
            name: validYouTubeVideoData.name,
            category: validYouTubeVideoData.category,
            intro: validYouTubeVideoData.intro,
            video_type: VideoType.YOUTUBE,
            url: validYouTubeVideoData.youtube_url,
            created_at: expect.any(String)
          })
        })
      })

      // 驗證資料庫記錄
      const videoRepository = dataSource.getRepository(Video)
      await ValidationTestHelpers.expectDatabaseRecord(videoRepository, {
        where: { 
          teacher_id: teacherUser.id,
          name: validYouTubeVideoData.name
        }
      })
    })

    it.todo('應該成功上傳本地儲存影片檔案並回傳 201')

    it('應該拒絕學生用戶上傳影片並回傳 403', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        studentAuthToken,
        validYouTubeVideoData
      )

      expect(response.status).toBe(403)
      expect(response.body).toEqual({
        status: 'error',
        code: ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
        message: MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED
      })
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'post',
        '/api/videos',
        validYouTubeVideoData
      )

      expect(response.status).toBe(401)
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })

    it('應該驗證必填欄位並回傳 400', async () => {
      // 測試缺少影片名稱
      const response1 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        missingNameVideoData
      )

      expect(response1.status).toBe(400)
      expect(response1.body.code).toBe(ERROR_CODES.VALIDATION_ERROR)
      ValidationTestHelpers.expectErrorMessage(
        response1.body.errors.name,
        MESSAGES.VALIDATION.VIDEO_NAME_REQUIRED
      )

      // 測試缺少影片分類
      const response2 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        missingCategoryVideoData
      )

      expect(response2.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response2.body.errors.category,
        MESSAGES.VALIDATION.VIDEO_CATEGORY_REQUIRED
      )

      // 測試缺少影片介紹
      const response3 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        missingIntroVideoData
      )

      expect(response3.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response3.body.errors.intro,
        MESSAGES.VALIDATION.VIDEO_INTRO_REQUIRED
      )
    })

    it('應該驗證影片類型相關欄位並回傳 400', async () => {
      // 測試缺少影片類型
      const response1 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        missingVideoTypeData
      )

      expect(response1.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response1.body.errors.video_type,
        MESSAGES.VALIDATION.VIDEO_TYPE_REQUIRED
      )

      // 測試 YouTube 類型但缺少網址
      const response2 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        missingYouTubeUrlData
      )

      expect(response2.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response2.body.errors.youtube_url,
        MESSAGES.VALIDATION.YOUTUBE_URL_REQUIRED
      )

      // 測試無效的 YouTube 網址
      const response3 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        invalidYouTubeUrlData
      )

      expect(response3.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response3.body.errors.youtube_url,
        MESSAGES.VALIDATION.YOUTUBE_URL_INVALID
      )
    })

    it('應該驗證欄位長度限制並回傳 400', async () => {
      // 測試影片名稱過長
      const response1 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        tooLongNameVideoData
      )

      expect(response1.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response1.body.errors.name,
        MESSAGES.VALIDATION.VIDEO_NAME_TOO_LONG
      )

      // 測試影片分類過長
      const response2 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        tooLongCategoryVideoData
      )

      expect(response2.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response2.body.errors.category,
        MESSAGES.VALIDATION.VIDEO_CATEGORY_TOO_LONG
      )

      // 測試影片介紹過長
      const response3 = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        tooLongIntroVideoData
      )

      expect(response3.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response3.body.errors.intro,
        MESSAGES.VALIDATION.VIDEO_INTRO_TOO_LONG
      )
    })

    it('應該驗證無效的影片類型並回傳 400', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'post',
        '/api/videos',
        teacherAuthToken,
        invalidVideoTypeData
      )

      expect(response.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response.body.errors.video_type,
        MESSAGES.VALIDATION.VIDEO_TYPE_INVALID
      )
    })

    it.todo('應該拒絕過大的影片檔案並回傳 400')

    it.todo('應該拒絕無效格式的影片檔案並回傳 400')
  })

  // ========================================
  // GET /api/videos - 取得影片列表
  // ========================================

  describe('GET /api/videos', () => {
    beforeEach(async () => {
      // 建立多個測試影片
      const videoRepository = dataSource.getRepository(Video)
      
      const video1 = videoRepository.create(createVideoEntityData({ 
        teacher_id: teacherUser.id,
        name: '程式設計基礎',
        category: '程式設計'
      }))
      const video2 = videoRepository.create(createVideoEntityData({ 
        teacher_id: teacherUser.id,
        name: '前端開發入門',
        category: '前端開發'
      }))
      const video3 = videoRepository.create(createVideoEntityData({ 
        teacher_id: teacherUser.id,
        name: '資料庫設計',
        category: '後端開發'
      }))
      
      await videoRepository.save(video1)
      await videoRepository.save(video2)
      await videoRepository.save(video3)
    })

    it('應該成功取得教師的影片列表並回傳 200', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        '/api/videos',
        teacherAuthToken
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: 'success',
        message: expect.any(String),
        data: expect.objectContaining({
          videos: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              teacher_id: teacherUser.id,
              name: expect.any(String),
              category: expect.any(String),
              intro: expect.any(String),
              video_type: expect.any(String),
              created_at: expect.any(String)
            })
          ]),
          pagination: expect.objectContaining({
            current_page: expect.any(Number),
            per_page: expect.any(Number),
            total: expect.any(Number),
            total_pages: expect.any(Number)
          })
        })
      })

      // 確認只能看到自己的影片
      response.body.data.videos.forEach((video: any) => {
        expect(video.teacher_id).toBe(teacherUser.id)
      })
    })

    it('應該支援分類篩選查詢', async () => {
      const response = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${teacherAuthToken}`)
        .query({ category: '程式設計' })

      expect(response.status).toBe(200)
      
      // 確認篩選結果正確
      response.body.data.videos.forEach((video: any) => {
        expect(video.category).toBe('程式設計')
      })
    })

    it('應該支援分頁查詢', async () => {
      const response = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${teacherAuthToken}`)
        .query({ page: 1, per_page: 2 })

      expect(response.status).toBe(200)
      expect(response.body.data.pagination.current_page).toBe(1)
      expect(response.body.data.pagination.per_page).toBe(2)
      expect(response.body.data.videos.length).toBeLessThanOrEqual(2)
    })

    it('應該拒絕學生用戶存取並回傳 403', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        '/api/videos',
        studentAuthToken
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'get',
        '/api/videos'
      )

      expect(response.status).toBe(401)
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  // ========================================
  // GET /api/videos/{id} - 取得影片詳情
  // ========================================

  describe('GET /api/videos/:id', () => {
    it('應該成功取得影片詳情並回傳 200', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        `/api/videos/${testVideo.id}`,
        teacherAuthToken
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: 'success',
        message: expect.any(String),
        data: expect.objectContaining({
          video: expect.objectContaining({
            id: testVideo.id,
            uuid: testVideo.uuid,
            teacher_id: teacherUser.id,
            name: testVideo.name,
            category: testVideo.category,
            intro: testVideo.intro,
            video_type: testVideo.video_type,
            url: testVideo.url,
            created_at: expect.any(String),
            updated_at: expect.any(String)
          }),
          usage_stats: expect.objectContaining({
            used_in_courses: expect.any(Number),
            total_views: expect.any(Number)
          })
        })
      })
    })

    it('應該拒絕存取其他教師的影片並回傳 403', async () => {
      // 建立另一個教師的影片
      const otherTeacherEnv = await UserTestHelpers.createTestUserWithToken({
        role: UserRole.TEACHER,
        email: 'other@teacher.com'
      })
      
      const videoRepository = dataSource.getRepository(Video)
      const otherVideoData = createVideoEntityData({ teacher_id: otherTeacherEnv.user.id })
      const otherVideo = await videoRepository.save(otherVideoData)

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        `/api/videos/${otherVideo.id}`,
        teacherAuthToken
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.VIDEO_PERMISSION_REQUIRED)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.VIDEO_PERMISSION_REQUIRED)
    })

    it('應該處理不存在的影片並回傳 404', async () => {
      const nonExistentId = 999999

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        `/api/videos/${nonExistentId}`,
        teacherAuthToken
      )

      expect(response.status).toBe(404)
      expect(response.body.code).toBe(ERROR_CODES.VIDEO_NOT_FOUND)
      expect(response.body.message).toBe(MESSAGES.BUSINESS.VIDEO_NOT_FOUND)
    })

    it('應該拒絕學生用戶存取並回傳 403', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'get',
        `/api/videos/${testVideo.id}`,
        studentAuthToken
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'get',
        `/api/videos/${testVideo.id}`
      )

      expect(response.status).toBe(401)
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  // ========================================
  // PUT /api/videos/{id} - 更新影片資訊
  // ========================================

  describe('PUT /api/videos/:id', () => {
    it('應該成功更新影片資訊並回傳 200', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'put',
        `/api/videos/${testVideo.id}`,
        teacherAuthToken,
        validVideoUpdateData
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: 'success',
        message: expect.any(String),
        data: expect.objectContaining({
          video: expect.objectContaining({
            id: testVideo.id,
            name: validVideoUpdateData.name,
            category: validVideoUpdateData.category,
            intro: validVideoUpdateData.intro,
            updated_at: expect.any(String)
          })
        })
      })

      // 驗證資料庫更新
      const videoRepository = dataSource.getRepository(Video)
      const updatedVideo = await videoRepository.findOne({ where: { id: testVideo.id } })
      expect(updatedVideo?.name).toBe(validVideoUpdateData.name)
      expect(updatedVideo?.category).toBe(validVideoUpdateData.category)
      expect(updatedVideo?.intro).toBe(validVideoUpdateData.intro)
    })

    it('應該支援部分欄位更新', async () => {
      const partialUpdateData = {
        intro: '僅更新介紹內容'
      }

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'put',
        `/api/videos/${testVideo.id}`,
        teacherAuthToken,
        partialUpdateData
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: 'success',
        message: expect.any(String),
        data: expect.objectContaining({
          video: expect.objectContaining({
            intro: partialUpdateData.intro,
            name: testVideo.name,
            category: testVideo.category
          })
        })
      })
    })

    it('應該拒絕更新其他教師的影片並回傳 403', async () => {
      // 建立另一個教師的影片
      const otherTeacherEnv = await UserTestHelpers.createTestUserWithToken({
        role: UserRole.TEACHER,
        email: 'other2@teacher.com'
      })
      
      const videoRepository = dataSource.getRepository(Video)
      const otherVideoData = createVideoEntityData({ teacher_id: otherTeacherEnv.user.id })
      const otherVideo = await videoRepository.save(otherVideoData)

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'put',
        `/api/videos/${otherVideo.id}`,
        teacherAuthToken,
        validVideoUpdateData
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.VIDEO_PERMISSION_REQUIRED)
    })

    it('應該處理不存在的影片並回傳 404', async () => {
      const nonExistentId = 999999

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'put',
        `/api/videos/${nonExistentId}`,
        teacherAuthToken,
        validVideoUpdateData
      )

      expect(response.status).toBe(404)
      expect(response.body.code).toBe(ERROR_CODES.VIDEO_NOT_FOUND)
    })

    it('應該驗證更新資料長度限制並回傳 400', async () => {
      const invalidUpdateData = {
        name: 'A'.repeat(201) // 超過200字元限制
      }

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'put',
        `/api/videos/${testVideo.id}`,
        teacherAuthToken,
        invalidUpdateData
      )

      expect(response.status).toBe(400)
      ValidationTestHelpers.expectErrorMessage(
        response.body.errors.name,
        MESSAGES.VALIDATION.VIDEO_NAME_TOO_LONG
      )
    })

    it('應該拒絕學生用戶更新並回傳 403', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'put',
        `/api/videos/${testVideo.id}`,
        studentAuthToken,
        validVideoUpdateData
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'put',
        `/api/videos/${testVideo.id}`,
        validVideoUpdateData
      )

      expect(response.status).toBe(401)
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })

  // ========================================
  // DELETE /api/videos/{id} - 刪除影片
  // ========================================

  describe('DELETE /api/videos/:id', () => {
    it('應該成功刪除影片並回傳 200', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'delete',
        `/api/videos/${testVideo.id}`,
        teacherAuthToken
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: 'success',
        message: expect.any(String),
        data: null
      })

      // 驗證影片已被軟刪除
      const videoRepository = dataSource.getRepository(Video)
      const deletedVideo = await videoRepository.findOne({ 
        where: { id: testVideo.id },
        withDeleted: true 
      })
      expect(deletedVideo?.deleted_at).not.toBeNull()
    })

    it('應該拒絕刪除正在使用的影片並回傳 400', async () => {
      // TODO: 需要建立課程關聯影片的測試場景
      // 這裡暫時跳過，等 Phase 5 課程影片關聯功能完成後再補充
      // 目前先測試基本的刪除功能
    })

    it('應該拒絕刪除其他教師的影片並回傳 403', async () => {
      // 建立另一個教師的影片
      const otherTeacherEnv = await UserTestHelpers.createTestUserWithToken({
        role: UserRole.TEACHER,
        email: 'other3@teacher.com'
      })
      
      const videoRepository = dataSource.getRepository(Video)
      const otherVideoData = createVideoEntityData({ teacher_id: otherTeacherEnv.user.id })
      const otherVideo = await videoRepository.save(otherVideoData)

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'delete',
        `/api/videos/${otherVideo.id}`,
        teacherAuthToken
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.VIDEO_PERMISSION_REQUIRED)
    })

    it('應該處理不存在的影片並回傳 404', async () => {
      const nonExistentId = 999999

      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'delete',
        `/api/videos/${nonExistentId}`,
        teacherAuthToken
      )

      expect(response.status).toBe(404)
      expect(response.body.code).toBe(ERROR_CODES.VIDEO_NOT_FOUND)
    })

    it('應該拒絕學生用戶刪除並回傳 403', async () => {
      const response = await RequestTestHelpers.sendAuthenticatedRequest(
        'delete',
        `/api/videos/${testVideo.id}`,
        studentAuthToken
      )

      expect(response.status).toBe(403)
      expect(response.body.code).toBe(ERROR_CODES.TEACHER_PERMISSION_REQUIRED)
    })

    it('應該拒絕未認證請求並回傳 401', async () => {
      const response = await RequestTestHelpers.testUnauthenticatedRequest(
        'delete',
        `/api/videos/${testVideo.id}`
      )

      expect(response.status).toBe(401)
      expect(response.body.code).toBe(ERROR_CODES.TOKEN_REQUIRED)
    })
  })
})