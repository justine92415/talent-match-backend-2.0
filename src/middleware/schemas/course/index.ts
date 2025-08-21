/**
 * 課程相關驗證規則統一匯出
 */

export * from './courseSchemas'
export * from './videoSchemas'
export * from './videoValidationSchemas'
export * from './fileSchemas'
export * from './priceSchemas'

// 公開課程驗證 Schemas - 只匯出純 Schema，不匯出已刪除的自定義函式
export {
  publicCourseQuerySchema,
  courseReviewQuerySchema,
  teacherCourseQuerySchema,
  courseIdParamSchema,
  teacherIdParamSchema
} from './publicCourseSchemas'