import { Router } from 'express'
import { FileUploadController } from '../controllers/FileUploadController'
import { authenticateToken } from '@middleware/auth'
import { checkFirebaseConfig } from '../middleware/firebaseCheck'

const router = Router()
const fileUploadController = new FileUploadController()

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     tags:
 *       - File Upload
 *     summary: 上傳多個檔案
 *     description: |
 *       上傳一個或多個檔案到 Firebase Storage
 *       
 *       **支援格式**：
 *       - 圖片: JPEG, JPG, PNG, GIF, WebP
 *       - 文件: PDF, DOC, DOCX, TXT
 *       
 *       **限制**：
 *       - 最大檔案大小: 10MB
 *       - 最大檔案數量: 5個
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 要上傳的檔案列表
 *               category:
 *                 type: string
 *                 description: 檔案分類 (optional)
 *                 example: "documents"
 *             required:
 *               - files
 *     responses:
 *       201:
 *         description: 檔案上傳成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "檔案上傳成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           originalName:
 *                             type: string
 *                             example: "example.pdf"
 *                           fileName:
 *                             type: string
 *                             example: "uuid-generated-name.pdf"
 *                           mimeType:
 *                             type: string
 *                             example: "application/pdf"
 *                           size:
 *                             type: number
 *                             example: 1024000
 *                           downloadURL:
 *                             type: string
 *                             example: "https://storage.googleapis.com/bucket/file.pdf"
 *                           firebaseUrl:
 *                             type: string
 *                             example: "gs://bucket/uploads/documents/file.pdf"
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: 請求錯誤
 *       401:
 *         description: 未授權
 *       413:
 *         description: 檔案過大
 */
router.post('/upload', authenticateToken, checkFirebaseConfig, fileUploadController.uploadFiles)

/**
 * @swagger
 * /api/files/delete:
 *   delete:
 *     tags:
 *       - File Upload
 *     summary: 刪除檔案
 *     description: 從 Firebase Storage 刪除指定檔案
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 description: Firebase Storage 檔案 URL
 *                 example: "gs://bucket/uploads/documents/file.pdf"
 *             required:
 *               - fileUrl
 *     responses:
 *       200:
 *         description: 檔案刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "檔案刪除成功"
 *       400:
 *         description: 請求錯誤
 *       401:
 *         description: 未授權
 *       404:
 *         description: 檔案不存在
 */
router.delete('/delete', authenticateToken, checkFirebaseConfig, fileUploadController.deleteFile)

/**
 * @swagger
 * /api/files/metadata/{fileUrl}:
 *   get:
 *     tags:
 *       - File Upload
 *     summary: 取得檔案資訊
 *     description: 取得指定檔案的詳細資訊
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileUrl
 *         required: true
 *         schema:
 *           type: string
 *         description: URL 編碼的 Firebase Storage 檔案 URL
 *     responses:
 *       200:
 *         description: 取得檔案資訊成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "取得檔案資訊成功"
 *                 data:
 *                   type: object
 *                   description: Firebase 檔案 metadata
 *       400:
 *         description: 請求錯誤
 *       401:
 *         description: 未授權
 *       404:
 *         description: 檔案不存在
 */
router.get('/metadata/:fileUrl', authenticateToken, checkFirebaseConfig, fileUploadController.getFileMetadata)

/**
 * @swagger
 * /api/files/download-url:
 *   post:
 *     tags:
 *       - File Upload
 *     summary: 生成下載連結
 *     description: 為私有檔案生成帶有過期時間的下載連結
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 description: Firebase Storage 檔案 URL
 *                 example: "gs://bucket/uploads/documents/file.pdf"
 *               expiresInMinutes:
 *                 type: number
 *                 description: 連結有效期限（分鐘）
 *                 example: 60
 *                 default: 60
 *             required:
 *               - fileUrl
 *     responses:
 *       200:
 *         description: 下載連結生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "下載連結生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     downloadUrl:
 *                       type: string
 *                       example: "https://storage.googleapis.com/..."
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 請求錯誤
 *       401:
 *         description: 未授權
 */
router.post('/download-url', authenticateToken, checkFirebaseConfig, fileUploadController.generateDownloadUrl)

/**
 * @swagger
 * /api/files/test-connection:
 *   get:
 *     tags:
 *       - File Upload
 *     summary: 診斷 Firebase Storage 連接
 *     description: 檢查 Firebase Storage 配置和連接狀態，幫助診斷上傳問題
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 連接診斷成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Firebase Storage 診斷完成"
 *                 data:
 *                   type: object
 *                   properties:
 *                     bucketName:
 *                       type: string
 *                       example: "talent-match-2.firebasestorage.app"
 *                     bucketExists:
 *                       type: boolean
 *                       example: true
 *                     recommendation:
 *                       type: string
 *                       example: "✅ Bucket 存在，可以進行檔案操作"
 *       500:
 *         description: 連接診斷失敗
 *       401:
 *         description: 未授權
 */
router.get('/test-connection', authenticateToken, fileUploadController.testConnection)

export { router as fileUploadRoutes }