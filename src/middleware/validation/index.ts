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