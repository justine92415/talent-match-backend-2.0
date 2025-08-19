/**
 * 公開教師路由
 * 
 * 提供教師公開資料的 API 端點：
 * - GET /api/teachers/public/:id - 教師公開資料
 * - GET /api/teachers/public/:id/courses - 教師課程列表
 */

import { Router } from 'express'
import { validateTeacherCourseQuery } from '@middleware/validation/publicCourseValidation'
import { publicTeacherController } from '@src/controllers/PublicTeacherController'

const router = Router()

/**
 * 取得教師公開資料
 * GET /api/teachers/public/:id
 */
router.get('/public/:id', publicTeacherController.getPublicTeacher)

/**
 * 取得教師課程列表
 * GET /api/teachers/public/:id/courses
 */
router.get('/public/:id/courses', validateTeacherCourseQuery, publicTeacherController.getTeacherCourses)

export default router