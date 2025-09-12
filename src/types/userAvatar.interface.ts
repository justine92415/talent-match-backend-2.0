/**
 * 使用者頭像上傳相關型別定義
 */

// 基礎頭像檔案型別
export interface AvatarFile {
  originalName: string
  fileName: string
  mimeType: string
  size: number
  downloadURL: string
  firebaseUrl: string
  uploadedAt: Date
}

// 頭像上傳請求型別
export interface UserAvatarUploadRequest {
  userId: number
  file: any // formidable File 物件
}

// 頭像上傳回應型別
export interface UserAvatarUploadResponse {
  success: boolean
  message: string
  data: {
    avatarUrl: string
    user: {
      id: number
      nick_name: string
      avatar_image: string
    }
  }
}

// 頭像刪除請求型別
export interface UserAvatarDeleteRequest {
  userId: number
  avatarUrl?: string
}

// 頭像刪除回應型別
export interface UserAvatarDeleteResponse {
  success: boolean
  message: string
}

// 頭像驗證配置
export interface AvatarValidationConfig {
  allowedMimeTypes: string[]
  maxFileSize: number
  maxWidth?: number
  maxHeight?: number
  minWidth?: number
  minHeight?: number
}

// 頭像上傳限制常數
export const AVATAR_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
] as const

export const AVATAR_MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const AVATAR_MAX_WIDTH = 2000
export const AVATAR_MAX_HEIGHT = 2000
export const AVATAR_MIN_WIDTH = 100
export const AVATAR_MIN_HEIGHT = 100

// 頭像處理選項
export interface AvatarProcessingOptions {
  resize?: {
    width: number
    height: number
  }
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

// 使用者頭像更新型別
export interface UserAvatarUpdate {
  userId: number
  avatarUrl: string
  oldAvatarUrl?: string
}