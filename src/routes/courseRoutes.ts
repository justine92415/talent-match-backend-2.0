/**
 * 課程路由
 * 
 * 提供課程管理的 API 端點，包括：
 * - POST /api/courses - 建立課程
 * - PUT /api/courses/:id - 更新課程
 * - GET /api/courses/:id - 取得課程詳情
 * - GET /api/courses - 教師課程列表
 * - DELETE /api/courses/:id - 刪除課程
 * 
 * 所有端點都需要教師身份認證
 */

import { Router } from 'express'
import { CourseController } from '@controllers/CourseController'
import { CourseVideoController } from '@controllers/CourseVideoController'
import { CourseFileController } from '@controllers/CourseFileController'
import { reviewController } from '@controllers/ReviewController'
import { createSchemasMiddleware } from '@middleware/schemas/core'
import { 
  createCourseSchema,
  updateCourseSchema,
  courseIdSchema,
  courseListQuerySchema
} from '@middleware/schemas/course/courseSchemas'
import {
  linkVideosToCourseBodySchema,
  updateVideoOrderBodySchema,
  removeCourseVideoParamSchema,
  courseVideoIdParamSchema,
  courseIdForUpdateParamSchema
} from '@middleware/schemas/course/videoValidationSchemas'
import {
  getCourseFilesParamSchema,
  getCourseFilesQuerySchema,
  uploadCourseFilesParamSchema,
  uploadCourseFilesBodySchema,
  deleteCourseFileParamSchema
} from '@middleware/schemas/course/fileSchemas'
import {
  courseReviewQuerySchema
} from '@middleware/schemas/course/publicCourseSchemas'
import { authenticateToken } from '@middleware/auth/userAuth'

const router = Router()
const courseController = new CourseController()
const courseVideoController = new CourseVideoController()
const courseFileController = new CourseFileController()

// Create course
router.post('/', authenticateToken, createSchemasMiddleware({ body: createCourseSchema }), courseController.createCourse)

// Update course
router.put('/:id', authenticateToken, createSchemasMiddleware({ params: courseIdSchema, body: updateCourseSchema }), courseController.updateCourse)

// Get course by ID
router.get('/:id', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.getCourse)

// Get teacher's course list
router.get('/', authenticateToken, createSchemasMiddleware({ query: courseListQuerySchema }), courseController.getCourseList)

// Delete course
router.delete('/:id', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.deleteCourse)

// Submit course for review
router.post('/:id/submit', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.submitCourse)

// Resubmit course for review
router.post('/:id/resubmit', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.resubmitCourse)

// Publish course
router.post('/:id/publish', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.publishCourse)

// Archive course
router.post('/:id/archive', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), courseController.archiveCourse)

// Link videos to course
router.post('/:id/videos', authenticateToken, createSchemasMiddleware({ body: linkVideosToCourseBodySchema }), CourseVideoController.linkVideos)

// Update video order
router.put('/:course_id/videos/order', authenticateToken, createSchemasMiddleware({ params: courseIdForUpdateParamSchema, body: updateVideoOrderBodySchema }), CourseVideoController.updateVideoOrder)

// Remove video from course
router.delete('/:course_id/videos/:video_id', authenticateToken, createSchemasMiddleware({ params: removeCourseVideoParamSchema }), CourseVideoController.removeCourseVideo)

// Get course videos
router.get('/:id/videos', authenticateToken, createSchemasMiddleware({ params: courseIdSchema }), CourseVideoController.getCourseVideos)

// Get course files
router.get('/:id/files', authenticateToken, createSchemasMiddleware({ params: getCourseFilesParamSchema, query: getCourseFilesQuerySchema }), CourseFileController.getCourseFiles)

// Upload course files
router.post('/:id/files', authenticateToken, createSchemasMiddleware({ params: uploadCourseFilesParamSchema, body: uploadCourseFilesBodySchema }), CourseFileController.uploadCourseFiles)

// Delete course file
router.delete('/:course_id/files/:file_id', authenticateToken, createSchemasMiddleware({ params: deleteCourseFileParamSchema }), CourseFileController.deleteCourseFile)

// Get course reviews
router.get('/:id/reviews', authenticateToken, createSchemasMiddleware({ params: courseIdSchema, query: courseReviewQuerySchema }), reviewController.getCourseReviews)

export default router