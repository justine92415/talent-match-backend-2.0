/**
 * 公開教師路由
 * 
 * 提供教師公開資料的 API 端點：
 * - GET /api/teachers/public/:id - 教師公開資料
 * - GET /api/teachers/public/:id/courses - 教師課程列表
 */

import { Router } from 'express'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { teacherCourseQuerySchema } from '@middleware/schemas/course/publicCourseSchemas'
import { publicTeacherController } from '@controllers/PublicTeacherController'

const router = Router()

router.get('/public/:id', publicTeacherController.getPublicTeacher)

router.get('/public/:id/courses', createSchemasMiddleware({ query: teacherCourseQuerySchema }), publicTeacherController.getTeacherCourses)

export default router