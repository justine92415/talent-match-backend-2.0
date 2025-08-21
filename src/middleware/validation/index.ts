// 統一匯出所有驗證相關功能

// 通用驗證工具
export { formatJoiErrors, validateRequest } from './common'
export type { RequestData } from './common'

// 認證相關驗證 Schema
export {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from './auth'

// 管理員相關驗證 Schema
export {
  adminLoginSchema,
  rejectionRequestSchema
} from './admin'

// 使用者相關驗證 Schema
export {
  updateProfileSchema
} from './user'

// 教師相關驗證 Schema
export {
  teacherApplicationSchema,
  teacherApplicationUpdateSchema,
  teacherProfileUpdateSchema,
  learningExperienceCreateSchema,
  learningExperienceUpdateSchema
} from './teacher'

// 證書相關驗證 Schema
export {
  certificateCreateSchema,
  certificateUpdateSchema
} from './certificate'

// 價格方案相關驗證 Schema
export {
  priceOptionCreateSchema,
  priceOptionUpdateSchema,
  priceOptionIdParamSchema,
  courseIdParamSchema
} from './priceOptionValidation'

// 課程影片關聯相關驗證 Schema 和中間件
export {
  linkVideosToCourseBodySchema,
  updateVideoOrderBodySchema,
  courseVideoIdParamSchema,
  courseIdForUpdateParamSchema,
  removeCourseVideoParamSchema,
  courseVideoSchemas,
  validateLinkVideosToCourse,
  validateUpdateVideoOrder,
  validateRemoveCourseVideo,
  validateGetCourseVideos
} from './courseVideoValidation'

// 課程檔案相關驗證 Schema 和中間件
export {
  getCourseFilesParamSchema,
  getCourseFilesQuerySchema,
  uploadCourseFilesParamSchema,
  uploadCourseFilesBodySchema,
  deleteCourseFileParamSchema,
  courseFileSchemas,
  validateGetCourseFiles,
  validateUploadCourseFiles,
  validateDeleteCourseFile
} from './courseFileValidation'

// 訂單相關驗證 Schema 和中間件
export {
  createOrderBodySchema,
  getOrderListQuerySchema,
  orderIdParamSchema,
  processPaymentBodySchema,
  orderSchemas,
  validateCreateOrder,
  validateGetOrderList,
  validateOrderId,
  validateProcessPayment
} from './orderValidation'

// 購物車相關驗證 Schema 和中間件
export {
  addCartItemBodySchema,
  updateCartItemBodySchema,
  cartItemIdParamSchema,
  cartSchemas,
  validateAddCartItem,
  validateUpdateCartItem,
  validateCartItemId
} from './cartValidation'

// 購買記錄相關驗證 Schema 和中間件
export {
  usePurchaseBodySchema,
  purchaseIdParamSchema,
  courseIdParamSchema as purchaseCourseIdParamSchema,
  getPurchaseListQuerySchema,
  purchaseSchemas,
  validateUsePurchase,
  validatePurchaseId,
  validateCourseId as validatePurchaseCourseId,
  validateGetPurchaseList
} from './purchaseValidation'

// 預約管理相關驗證 Schema
export {
  createReservationSchema,
  reservationListQuerySchema,
  updateReservationStatusSchema,
  reservationIdParamSchema,
  calendarViewQuerySchema
} from './reservationValidation'

// 評價相關驗證 Schema
export {
  reviewCreateSchema,
  courseReviewsQuerySchema,
  myReviewsQuerySchema,
  receivedReviewsQuerySchema,
  courseUuidParamSchema
} from './review'

// 教師後台管理驗證中間件
export {
  teacherDashboardValidation,
  teacherDashboardSchemas
} from './teacherDashboard'