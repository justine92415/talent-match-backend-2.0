/**
 * 檔案上傳 API 整合測試
 * 測試所有檔案上傳相關的 API endpoints
 */

import request from 'supertest'
import app from '../../app'
import { dataSource } from '@db/data-source'
import { UserTestHelpers } from '@tests/helpers/testHelpers'
import path from 'path'
import * as fs from 'fs'

describe('檔案上傳 API 整合測試', () => {
  let testUser: any
  let authToken: string
  let testFilePath: string
  let testImagePath: string
  let uploadedFiles: any[] = []

  beforeAll(async () => {
    await dataSource.initialize()
    
    // 建立測試檔案目錄
    const testDir = path.join(process.cwd(), 'tmp', 'test-files')
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }

    // 建立測試文件檔案
    testFilePath = path.join(testDir, 'test-document.txt')
    fs.writeFileSync(testFilePath, 'This is a test document for file upload testing.')

    // 建立測試圖片檔案 (簡單的 1x1 PNG)
    testImagePath = path.join(testDir, 'test-image.png')
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width = 1
      0x00, 0x00, 0x00, 0x01, // height = 1
      0x08, 0x02, // bit depth = 8, color type = 2 (RGB)
      0x00, 0x00, 0x00, // compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x0C, // IDAT chunk size
      0x49, 0x44, 0x41, 0x54, // IDAT
      0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 
      0x02, 0x00, 0x01, // compressed data
      0xE2, 0x21, 0xBC, 0x33, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk size
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ])
    fs.writeFileSync(testImagePath, pngBuffer)
  })

  afterAll(async () => {
    // 清理測試檔案
    try {
      if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath)
      if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath)
      
      const testDir = path.join(process.cwd(), 'tmp', 'test-files')
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true })
      }
    } catch (error) {
      console.warn('清理測試檔案時發生錯誤:', error)
    }

    await dataSource.destroy()
  })

  beforeEach(async () => {
    // 建立測試使用者和授權令牌
    const userTestResult = await UserTestHelpers.createTestUserWithToken()
    testUser = userTestResult.user
    authToken = userTestResult.authToken
    uploadedFiles = []
  })

  afterEach(async () => {
    // 清理上傳的檔案 (在實際環境中會從 Firebase 刪除)
    uploadedFiles = []
    // 清理測試資料會在 beforeEach 中自動處理
  })

  describe('POST /api/files/upload', () => {
    it('應該成功上傳單個文件檔案', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testFilePath)
        .field('category', 'documents')

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('檔案上傳成功')
      expect(response.body.data.files).toHaveLength(1)
      
      const uploadedFile = response.body.data.files[0]
      expect(uploadedFile).toHaveProperty('originalName', 'test-document.txt')
      expect(uploadedFile).toHaveProperty('fileName')
      expect(uploadedFile).toHaveProperty('mimeType', 'text/plain')
      expect(uploadedFile).toHaveProperty('size')
      expect(uploadedFile).toHaveProperty('downloadURL')
      expect(uploadedFile).toHaveProperty('firebaseUrl')
      expect(uploadedFile).toHaveProperty('uploadedAt')
      
      uploadedFiles.push(uploadedFile)
    }, 30000)

    it('應該成功上傳單個圖片檔案', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testImagePath)
        .field('category', 'images')

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.files).toHaveLength(1)
      
      const uploadedFile = response.body.data.files[0]
      expect(uploadedFile.originalName).toBe('test-image.png')
      expect(uploadedFile.mimeType).toBe('image/png')
      
      uploadedFiles.push(uploadedFile)
    }, 30000)

    it('應該成功上傳多個檔案', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testFilePath)
        .attach('files', testImagePath)
        .field('category', 'mixed')

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.files).toHaveLength(2)
      
      uploadedFiles.push(...response.body.data.files)
    }, 30000)

    it('當未提供檔案時應該返回 400', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('category', 'documents')

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('請選擇要上傳的檔案')
    })

    it('當未提供授權令牌時應該返回 401', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .attach('files', testFilePath)

      expect(response.status).toBe(401)
    })

    it('當提供無效授權令牌時應該返回 401', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer invalid-token')
        .attach('files', testFilePath)

      expect(response.status).toBe(401)
    })
  })

  describe('POST /api/files/download-url', () => {
    let testFileUrl: string

    beforeEach(async () => {
      // 先上傳一個測試檔案
      const uploadResponse = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testFilePath)

      testFileUrl = uploadResponse.body.data.files[0].firebaseUrl
      uploadedFiles.push(uploadResponse.body.data.files[0])
    })

    it('應該成功生成下載連結', async () => {
      const response = await request(app)
        .post('/api/files/download-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileUrl: testFileUrl,
          expiresInMinutes: 30
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('下載連結生成成功')
      expect(response.body.data).toHaveProperty('downloadUrl')
      expect(response.body.data).toHaveProperty('expiresAt')
    }, 15000)

    it('當未提供檔案 URL 時應該返回 400', async () => {
      const response = await request(app)
        .post('/api/files/download-url')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expiresInMinutes: 30
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('請提供檔案 URL')
    })

    it('當未提供授權令牌時應該返回 401', async () => {
      const response = await request(app)
        .post('/api/files/download-url')
        .send({
          fileUrl: testFileUrl
        })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/files/delete', () => {
    let testFileUrl: string

    beforeEach(async () => {
      // 先上傳一個測試檔案
      const uploadResponse = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testFilePath)

      testFileUrl = uploadResponse.body.data.files[0].firebaseUrl
      uploadedFiles.push(uploadResponse.body.data.files[0])
    })

    it('應該成功刪除檔案', async () => {
      const response = await request(app)
        .delete('/api/files/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fileUrl: testFileUrl
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('檔案刪除成功')
    }, 15000)

    it('當未提供檔案 URL 時應該返回 400', async () => {
      const response = await request(app)
        .delete('/api/files/delete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('請提供檔案 URL')
    })

    it('當未提供授權令牌時應該返回 401', async () => {
      const response = await request(app)
        .delete('/api/files/delete')
        .send({
          fileUrl: testFileUrl
        })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/files/metadata/:fileUrl', () => {
    let testFileUrl: string

    beforeEach(async () => {
      // 先上傳一個測試檔案
      const uploadResponse = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('files', testFilePath)

      testFileUrl = uploadResponse.body.data.files[0].firebaseUrl
      uploadedFiles.push(uploadResponse.body.data.files[0])
    })

    it('應該成功取得檔案資訊', async () => {
      const encodedUrl = encodeURIComponent(testFileUrl)
      const response = await request(app)
        .get(`/api/files/metadata/${encodedUrl}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('取得檔案資訊成功')
      expect(response.body.data).toHaveProperty('name')
      expect(response.body.data).toHaveProperty('size')
      expect(response.body.data).toHaveProperty('contentType')
    }, 15000)

    it('當未提供授權令牌時應該返回 401', async () => {
      const encodedUrl = encodeURIComponent(testFileUrl)
      const response = await request(app)
        .get(`/api/files/metadata/${encodedUrl}`)

      expect(response.status).toBe(401)
    })
  })
})