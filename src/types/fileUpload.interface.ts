export interface UploadedFile {
  originalName: string
  fileName: string
  mimeType: string
  size: number
  downloadURL: string
  firebaseUrl: string
  uploadedAt: Date
}

export interface FileUploadRequest {
  files: any[]
  userId?: number
  category?: string
}

export interface FirebaseFileUploadResponse {
  success: boolean
  files: UploadedFile[]
  message?: string
}

export interface FileDeleteRequest {
  fileUrl: string
  userId?: number
}

export interface FileDeleteResponse {
  success: boolean
  message?: string
}

export interface FileMetadata {
  id: string
  name: string
  bucket: string
  generation: string
  contentType: string
  size: number
  md5Hash: string
  crc32c: string
  etag: string
  timeCreated: string
  updated: string
}

export interface FirebaseUploadOptions {
  destination?: string
  metadata?: {
    contentType?: string
    customMetadata?: Record<string, string>
  }
  public?: boolean
}

export interface FileUploadValidation {
  allowedMimeTypes: string[]
  maxFileSize: number
  maxFiles: number
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const MAX_FILES = 5