import { Router } from 'express'
import { UserAvatarController } from '../controllers/UserAvatarController'
import { authenticateToken } from '@middleware/auth'
import { checkFirebaseConfig } from '../middleware/firebaseCheck'
import { parseAvatarFile, validateAvatarFileMiddleware } from '../middleware/upload/avatarUpload'

const router = Router()
const userAvatarController = new UserAvatarController()

/**
 * @swagger
 * /api/upload/avatar:
 *   post:
 *     tags:
 *       - User Avatar
 *     summary: 上傳使用者頭像
 *     description: |
 *       上傳使用者個人頭像到 Firebase Storage。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者已登入（JWT Token）
 *       - 驗證 Firebase Storage 配置
 *       - 解析上傳的頭像檔案（使用 formidable）
 *       - 驗證檔案格式（僅支援 JPEG, JPG, PNG, WebP）
 *       - 驗證檔案大小（最大 5MB）
 *       - 刪除使用者之前的頭像（如果存在）
 *       - 上傳新頭像到 Firebase Storage
 *       - 更新使用者的頭像 URL
 *       - 清理暫存檔案
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: 頭像檔案（支援 JPEG, JPG, PNG, WebP，最大 5MB）
 *             required:
 *               - avatar
 *     responses:
 *       201:
 *         description: 頭像上傳成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarUploadSuccessResponse'
 *       400:
 *         description: 請求參數錯誤或業務邏輯錯誤
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/AvatarValidationErrorResponse'
 *                 - $ref: '#/components/schemas/AvatarBusinessErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: 檔案驗證錯誤
 *                 value:
 *                   status: "error"
 *                   message: "頭像檔案驗證失敗"
 *                   errors:
 *                     avatar: ["頭像檔案為必填項目"]
 *               format_error:
 *                 summary: 格式不支援錯誤
 *                 value:
 *                   status: "error"
 *                   message: "不支援的檔案格式 \"image/svg+xml\"。僅支援: JPEG, JPG, PNG, WebP"
 *                   errors:
 *                     avatar: ["不支援的檔案格式 \"image/svg+xml\"。僅支援: JPEG, JPG, PNG, WebP"]
 *                     currentFormat: ["當前格式: image/svg+xml"]
 *                     fileName: ["檔案名稱: example.svg"]
 *               size_error:
 *                 summary: 檔案過大錯誤
 *                 value:
 *                   status: "error"
 *                   message: "檔案大小超過限制。當前大小: 8.5MB，最大允許: 5.0MB"
 *                   errors:
 *                     avatar: ["檔案大小超過限制。當前大小: 8.5MB，最大允許: 5.0MB"]
 *                     fileSize: ["當前大小: 8.5MB"]
 *                     maxSize: ["最大允許: 5.0MB"]
 *               business_error:
 *                 summary: 上傳失敗
 *                 value:
 *                   status: "error"
 *                   message: "頭像上傳失敗，請重試"
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       413:
 *         description: 檔案過大
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarValidationErrorResponse'
 *             example:
 *               status: "error"
 *               message: "頭像檔案驗證失敗"
 *               errors:
 *                 fileSize: ["檔案大小超過限制（最大 5MB）"]
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.post('/avatar', 
  authenticateToken, 
  checkFirebaseConfig, 
  parseAvatarFile,
  validateAvatarFileMiddleware,
  userAvatarController.uploadAvatar
)

/**
 * @swagger
 * /api/upload/avatar:
 *   delete:
 *     tags:
 *       - User Avatar
 *     summary: 刪除使用者頭像
 *     description: |
 *       從 Firebase Storage 刪除使用者頭像並清除資料庫記錄。
 *       
 *       **業務邏輯**：
 *       - 驗證使用者已登入（JWT Token）
 *       - 驗證 Firebase Storage 配置
 *       - 查找使用者目前的頭像資訊
 *       - 從 Firebase Storage 刪除頭像檔案
 *       - 清除使用者的頭像 URL
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 頭像刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarDeleteSuccessResponse'
 *       401:
 *         description: 未授權 - Token 無效或過期
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedErrorResponse'
 *       404:
 *         description: 頭像不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AvatarNotFoundErrorResponse'
 *       500:
 *         description: 伺服器內部錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerErrorResponse'
 */
router.delete('/avatar', 
  authenticateToken, 
  checkFirebaseConfig, 
  userAvatarController.deleteAvatar
)

export { router as uploadRoutes }