import { dataSource } from '@db/data-source'
import { User } from '@entities/User'
import { FileUploadService } from './fileUploadService'
import { Errors } from '@utils/errors'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import {
  UserAvatarUploadRequest,
  UserAvatarUploadResponse,
  UserAvatarDeleteRequest,
  UserAvatarDeleteResponse,
  UserAvatarUpdate,
  AvatarFile,
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_MAX_FILE_SIZE
} from '../types/userAvatar.interface'
import * as fs from 'fs'

/**
 * 使用者頭像服務
 * 
 * 專門處理使用者頭像相關的業務邏輯：
 * - 頭像檔案上傳到 Firebase Storage
 * - 使用者資料表更新
 * - 舊頭像檔案清理
 * - 頭像檔案驗證
 */
export class UserAvatarService {
  private userRepository = dataSource.getRepository(User)
  private fileUploadService = new FileUploadService()

  /**
   * 上傳使用者頭像
   * 
   * @param request 頭像上傳請求
   * @returns 頭像上傳回應
   */
  async uploadAvatar(request: UserAvatarUploadRequest): Promise<UserAvatarUploadResponse> {
    try {
      // 檢查使用者是否存在
      const user = await this.findUserById(request.userId)
      
      // 驗證檔案
      this.validateAvatarFile(request.file)

      // 儲存舊頭像 URL 以便後續清理
      const oldAvatarUrl = user.avatar_image

      // 上傳檔案到 Firebase Storage
      const uploadedFile = await this.uploadFileToStorage(request.file, request.userId)

      // 清理暫存檔案
      this.cleanupTempFile(request.file.filepath)

      // 更新使用者頭像資料
      await this.updateUserAvatar({
        userId: request.userId,
        avatarUrl: uploadedFile.downloadURL,
        oldAvatarUrl: oldAvatarUrl || undefined
      })

      // 清理舊頭像（如果存在且不是 Google 頭像）
      if (oldAvatarUrl && !oldAvatarUrl.includes('googleapis.com') && !oldAvatarUrl.includes('googleusercontent.com')) {
        try {
          await this.fileUploadService.deleteFile(this.extractFirebaseUrlFromDownloadUrl(oldAvatarUrl))
        } catch (error) {
          console.warn('清理舊頭像失敗，但不影響新頭像上傳:', error)
        }
      }

      // 重新獲取更新後的使用者資料
      const updatedUser = await this.findUserById(request.userId)

      return {
        success: true,
        message: MESSAGES.AUTH.AVATAR_UPLOADED,
        data: {
          avatarUrl: uploadedFile.downloadURL,
          user: {
            id: updatedUser.id,
            nick_name: updatedUser.nick_name,
            avatar_image: updatedUser.avatar_image!
          }
        }
      }
    } catch (error) {
      console.error('頭像上傳失敗:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_UPLOAD_FAILED,
        {},
        MESSAGES.BUSINESS.AVATAR_UPLOAD_FAILED
      )
    }
  }

  /**
   * 刪除使用者頭像
   * 
   * @param request 頭像刪除請求
   * @returns 頭像刪除回應
   */
  async deleteAvatar(request: UserAvatarDeleteRequest): Promise<UserAvatarDeleteResponse> {
    try {
      // 檢查使用者是否存在
      const user = await this.findUserById(request.userId)

      if (!user.avatar_image) {
        return {
          success: true,
          message: '使用者尚未設定頭像'
        }
      }

      const currentAvatarUrl = user.avatar_image

      // 不能刪除 Google 頭像，只能清除資料庫記錄
      if (!currentAvatarUrl.includes('googleapis.com') && !currentAvatarUrl.includes('googleusercontent.com')) {
        try {
          await this.fileUploadService.deleteFile(this.extractFirebaseUrlFromDownloadUrl(currentAvatarUrl))
        } catch (error) {
          console.warn('清理頭像檔案失敗:', error)
        }
      }

      // 清除使用者頭像記錄
      await this.clearUserAvatar(request.userId)

      return {
        success: true,
        message: MESSAGES.AUTH.AVATAR_DELETED
      }
    } catch (error) {
      console.error('頭像刪除失敗:', error)
      
      if (error instanceof Error) {
        throw error
      }
      
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_DELETE_FAILED,
        {},
        MESSAGES.BUSINESS.AVATAR_DELETE_FAILED
      )
    }
  }

  /**
   * 根據 ID 查找使用者
   * 
   * @param userId 使用者 ID
   * @returns 使用者實體
   */
  private async findUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    })

    if (!user) {
      throw Errors.userNotFound()
    }

    return user
  }

  /**
   * 驗證頭像檔案
   * 
   * @param file 檔案物件
   */
  private validateAvatarFile(file: any): void {
    if (!file) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_REQUIRED,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_REQUIRED
      )
    }

    // 檢查檔案格式
    if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_FORMAT_INVALID,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_FORMAT_INVALID
      )
    }

    // 檢查檔案大小
    if (file.size > AVATAR_MAX_FILE_SIZE) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_TOO_LARGE,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_TOO_LARGE
      )
    }

    // 檢查檔案是否存在
    if (!fs.existsSync(file.filepath)) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_FILE_CORRUPTED,
        {},
        MESSAGES.VALIDATION.AVATAR_FILE_CORRUPTED
      )
    }
  }

  /**
   * 上傳檔案到 Firebase Storage
   * 
   * @param file 檔案物件
   * @param userId 使用者 ID
   * @returns 上傳檔案資訊
   */
  private async uploadFileToStorage(file: any, userId: number): Promise<AvatarFile> {
    try {
      const uploadedFile = await this.fileUploadService.uploadFile(
        file.filepath,
        file.originalFilename || `avatar_${userId}`,
        file.mimetype,
        {
          destination: `avatars/user_${userId}`,
          public: true,
          metadata: {
            customMetadata: {
              userId: userId.toString(),
              uploadType: 'avatar'
            }
          }
        }
      )

      return {
        originalName: uploadedFile.originalName,
        fileName: uploadedFile.fileName,
        mimeType: uploadedFile.mimeType,
        size: uploadedFile.size,
        downloadURL: uploadedFile.downloadURL,
        firebaseUrl: uploadedFile.firebaseUrl,
        uploadedAt: uploadedFile.uploadedAt
      }
    } catch (error) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_PROCESSING_FAILED,
        {},
        MESSAGES.BUSINESS.AVATAR_PROCESSING_FAILED
      )
    }
  }

  /**
   * 更新使用者頭像資料
   * 
   * @param update 頭像更新資料
   */
  private async updateUserAvatar(update: UserAvatarUpdate): Promise<void> {
    try {
      await this.userRepository.update(
        { id: update.userId },
        { avatar_image: update.avatarUrl }
      )
    } catch (error) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_UPDATE_FAILED,
        {},
        MESSAGES.BUSINESS.AVATAR_UPDATE_FAILED
      )
    }
  }

  /**
   * 清除使用者頭像記錄
   * 
   * @param userId 使用者 ID
   */
  private async clearUserAvatar(userId: number): Promise<void> {
    try {
      await this.userRepository.update(
        { id: userId },
        { avatar_image: null }
      )
    } catch (error) {
      throw Errors.validationWithCode(
        ERROR_CODES.AVATAR_UPDATE_FAILED,
        {},
        MESSAGES.BUSINESS.AVATAR_UPDATE_FAILED
      )
    }
  }

  /**
   * 從下載 URL 提取 Firebase URL
   * 
   * @param downloadUrl 公開下載 URL
   * @returns Firebase URL (gs://...)
   */
  private extractFirebaseUrlFromDownloadUrl(downloadUrl: string): string {
    // 解析 Firebase Storage 的公開 URL 格式
    // https://firebasestorage.googleapis.com/v0/b/bucket/o/path?alt=media
    const match = downloadUrl.match(/\/b\/([^\/]+)\/o\/([^?]+)/)
    
    if (!match) {
      throw new Error('無法解析 Firebase URL 格式')
    }

    const [, bucketName, encodedPath] = match
    const filePath = decodeURIComponent(encodedPath)
    
    return `gs://${bucketName}/${filePath}`
  }

  /**
   * 清理暫存檔案
   * 
   * @param filePath 暫存檔案路徑
   */
  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
        console.log(`已清理暫存檔案: ${filePath}`)
      }
    } catch (error) {
      console.warn(`清理暫存檔案失敗: ${filePath}`, error)
      // 不拋出錯誤，避免影響主要流程
    }
  }
}

export const userAvatarService = new UserAvatarService()