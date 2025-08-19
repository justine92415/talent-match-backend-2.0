/**
 * 課程檔案相關測試 fixtures
 */

import type { FileUploadData, CourseFileUploadRequest } from '@models/index'

/**
 * 有效的檔案上傳請求資料
 */
export const validCourseFileUploadRequest: CourseFileUploadRequest = {
  files: [
    {
      originalname: 'course-syllabus.pdf',
      filename: 'uuid-course-syllabus.pdf',
      mimetype: 'application/pdf',
      size: 512000, // 500KB
      path: '/tmp/uuid-course-syllabus.pdf'
    }
  ]
}

/**
 * 多檔案上傳請求資料
 */
export const multipleFilesUploadRequest: CourseFileUploadRequest = {
  files: [
    {
      originalname: 'course-syllabus.pdf',
      filename: 'uuid1-course-syllabus.pdf',
      mimetype: 'application/pdf',
      size: 512000, // 500KB
      path: '/tmp/uuid1-course-syllabus.pdf'
    },
    {
      originalname: 'reading-list.docx',
      filename: 'uuid2-reading-list.docx',
      mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 256000, // 250KB
      path: '/tmp/uuid2-reading-list.docx'
    },
    {
      originalname: 'practice-exercises.xlsx',
      filename: 'uuid3-practice-exercises.xlsx',
      mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: 128000, // 125KB
      path: '/tmp/uuid3-practice-exercises.xlsx'
    }
  ]
}

/**
 * 檔案大小超過限制的上傳請求
 */
export const oversizeFileUploadRequest: CourseFileUploadRequest = {
  files: [
    {
      originalname: 'large-document.pdf',
      filename: 'uuid-large-document.pdf',
      mimetype: 'application/pdf',
      size: 11 * 1024 * 1024, // 11MB (超過10MB限制)
      path: '/tmp/uuid-large-document.pdf'
    }
  ]
}

/**
 * 不支援格式的檔案上傳請求
 */
export const unsupportedFormatUploadRequest: CourseFileUploadRequest = {
  files: [
    {
      originalname: 'executable.exe',
      filename: 'uuid-executable.exe',
      mimetype: 'application/octet-stream',
      size: 1024000,
      path: '/tmp/uuid-executable.exe'
    }
  ]
}

/**
 * 檔案數量超過限制的上傳請求
 */
export const tooManyFilesUploadRequest: CourseFileUploadRequest = {
  files: Array.from({ length: 11 }, (_, i) => ({ // 超過10個檔案限制
    originalname: `document-${i + 1}.pdf`,
    filename: `uuid${i + 1}-document-${i + 1}.pdf`,
    mimetype: 'application/pdf',
    size: 100000,
    path: `/tmp/uuid${i + 1}-document-${i + 1}.pdf`
  }))
}

/**
 * 測試用的課程檔案資料
 */
export const testCourseFileData = {
  name: '課程大綱',
  file_id: 'test-file-uuid-123456',
  url: '/uploads/courses/test-file-uuid-123456.pdf',
  size: 512000,
  mime_type: 'application/pdf',
  original_filename: 'course-syllabus.pdf'
}

/**
 * 批次測試檔案資料
 */
export const batchTestCourseFiles = [
  {
    name: '課程大綱',
    file_id: 'test-file-uuid-001',
    url: '/uploads/courses/test-file-uuid-001.pdf',
    size: 512000,
    mime_type: 'application/pdf',
    original_filename: 'course-syllabus.pdf'
  },
  {
    name: '參考資料',
    file_id: 'test-file-uuid-002',
    url: '/uploads/courses/test-file-uuid-002.docx',
    size: 256000,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    original_filename: 'reference-materials.docx'
  },
  {
    name: '練習題目',
    file_id: 'test-file-uuid-003',
    url: '/uploads/courses/test-file-uuid-003.xlsx',
    size: 128000,
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    original_filename: 'practice-exercises.xlsx'
  }
]

/**
 * 支援的檔案類型清單（用於測試驗證）
 */
export const supportedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
]

/**
 * 檔案大小限制（位元組）
 */
export const fileSizeLimits = {
  maxSingleFileSize: 10 * 1024 * 1024, // 10MB
  maxTotalSize: 50 * 1024 * 1024, // 50MB
  maxFileCount: 10
}