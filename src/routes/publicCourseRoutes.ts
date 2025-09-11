/**
 * 公開課程路由
 * 
 * 提供公開課程瀏覽的 API 端點，包括：
 * - GET /api/courses/public - 公開課程列表（支援搜尋和篩選）
 * - GET /api/courses/public/:id - 公開課程詳情
 * - GET /api/reviews/courses/:id - 課程評價列表
 * 
 * 這些端點不需要認證，提供給所有用戶瀏覽
 */

import { Router } from 'express'
import { publicCourseController } from '@controllers/PublicCourseController'
import { validateQuery, validateParams } from '@middleware/schemas/core'
import { publicCourseQuerySchema, courseReviewQuerySchema, teacherCourseQuerySchema, courseIdParamSchema, teacherIdParamSchema } from '@middleware/schemas/course/publicCourseSchemas'

const router = Router()

router.get('/public', validateQuery(publicCourseQuerySchema), publicCourseController.getPublicCourses)

router.get('/public/:id', validateParams(courseIdParamSchema), publicCourseController.getPublicCourseDetail)

export default router