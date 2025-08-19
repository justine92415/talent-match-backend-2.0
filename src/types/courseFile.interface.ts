/**
 * 課程檔案相關型別定義
 * 
 * 包含課程檔案管理、上傳、驗證相關的介面定義
 * 與 CourseFile 實體對應
 */

// ==================== 課程檔案基本介面 ====================

/** 課程檔案基本資訊 */
export interface CourseFileInfo {
  id: number
  uuid: string
  course_id: number
  name: string
  file_id: string
  url: string
  created_at: Date
  updated_at: Date
}

/** 檔案上傳資料 */
export interface FileUploadData {
  originalname: string
  filename: string
  mimetype: string
  size: number
  path: string
  buffer?: Buffer
}

// ==================== API 請求參數介面 ====================

/** 課程檔案查詢參數 */
export interface CourseFileQueryParams {
  page?: number
  per_page?: number
}

/** 課程檔案上傳請求參數（multipart/form-data） */
export interface CourseFileUploadRequest {
  files: FileUploadData[]
  descriptions?: string[]
}

/** 檔案上傳處理結果 */
export interface FileUploadResult {
  success: boolean
  file?: CourseFileInfo
  error?: string
  originalName: string
}

// ==================== API 回應格式介面 ====================

/** 課程檔案列表回應 */
export interface CourseFileListResponse {
  files: CourseFileInfo[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
  summary: {
    total_files: number
  }
}

/** 課程檔案上傳回應 */
export interface CourseFileUploadResponse {
  uploaded_files: CourseFileInfo[]
  upload_summary: {
    total_uploaded: number
    failed_uploads: number
    failed_files?: Array<{
      filename: string
      error: string
    }>
  }
}

// ==================== 驗證相關介面 ====================

/** 檔案驗證規則 */
export interface FileValidationRules {
  maxFileSize: number          // 單檔最大大小 (bytes)
  maxTotalFiles: number        // 課程最大檔案數量
  maxUploadFiles: number       // 單次最大上傳檔案數
  allowedMimeTypes: string[]   // 允許的 MIME 類型
  allowedExtensions: string[]  // 允許的副檔名
}

/** 檔案驗證結果 */
export interface FileValidationResult {
  isValid: boolean
  errors: string[]
  validFiles: FileUploadData[]
  invalidFiles: Array<{
    file: FileUploadData
    errors: string[]
  }>
}

// ==================== 業務邏輯介面 ====================

/** 課程檔案權限檢查 */
export interface CourseFilePermission {
  canView: boolean
  canUpload: boolean  
  canDelete: boolean
  remainingSlots: number  // 剩餘可上傳檔案數量
}

/** 課程檔案統計 */
export interface CourseFileStats {
  total_files: number
  total_size: number  // 總大小 (bytes)
  file_types: Record<string, number>  // 各類型檔案數量統計
}

// ==================== 服務層介面 ====================

/** 課程檔案服務建立參數 */
export interface CreateCourseFileParams {
  course_id: number
  name: string
  file_id: string
  url: string
}

/** 課程檔案服務查詢參數 */
export interface FindCourseFilesParams {
  course_id: number
  page?: number
  per_page?: number
}

/** 批量檔案處理參數 */
export interface BatchFileProcessParams {
  course_id: number
  teacher_id: number
  files: FileUploadData[]
  descriptions?: string[]
}

// ==================== 檔案處理常數 ====================

/** 支援的檔案類型配置 */
export interface SupportedFileTypes {
  documents: {
    mimeTypes: string[]
    extensions: string[]
    maxSize: number
  }
  images: {
    mimeTypes: string[]
    extensions: string[]
    maxSize: number
  }
  archives: {
    mimeTypes: string[]
    extensions: string[]
    maxSize: number
  }
}

// ==================== 錯誤處理相關介面 ====================

/** 檔案處理錯誤資訊 */
export interface FileProcessError {
  filename: string
  originalName: string
  errorCode: string
  errorMessage: string
  details?: any
}

/** 檔案上傳錯誤摘要 */
export interface FileUploadErrorSummary {
  total_attempted: number
  successful_uploads: number
  failed_uploads: number
  errors: FileProcessError[]
}