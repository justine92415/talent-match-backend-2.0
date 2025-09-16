import { Router } from 'express'
import { adminController } from '@controllers/AdminController'
import { authenticateAdmin, requireAdminPermission } from '@middleware/auth'
import { 
  validateRequest
} from '@middleware/schemas'
import { 
  adminLoginSchema,
  rejectionRequestSchema
} from '@middleware/schemas/auth'
import { MESSAGES } from '@constants/Message'

const router = Router()

// Admin login route
router.post(
  '/login',
  validateRequest(adminLoginSchema, MESSAGES.BUSINESS.LOGIN_FAILED),
  adminController.login
)

// Admin logout route
router.post('/logout', authenticateAdmin, adminController.logout)

// Get admin profile
router.get('/profile', authenticateAdmin, adminController.getProfile)

// Get teacher applications list
router.get('/teacher-applications', authenticateAdmin, requireAdminPermission, adminController.getTeacherApplications)

// Approve teacher application
router.post(
  '/teachers/:teacherId/approve',
  authenticateAdmin,
  requireAdminPermission,
  adminController.approveTeacherApplication
)

// Reject teacher application
router.post(
  '/teachers/:teacherId/reject',
  authenticateAdmin,
  requireAdminPermission,
  validateRequest(rejectionRequestSchema, MESSAGES.ADMIN.TEACHER_APPLICATION_REJECTED),
  adminController.rejectTeacherApplication
)

// Approve course application
router.post(
  '/courses/:courseId/approve',
  authenticateAdmin,
  requireAdminPermission,
  adminController.approveCourseApplication
)

// Reject course application
router.post(
  '/courses/:courseId/reject',
  authenticateAdmin,
  requireAdminPermission,
  validateRequest(rejectionRequestSchema, MESSAGES.ADMIN.COURSE_APPLICATION_REJECTED),
  adminController.rejectCourseApplication
)

export default router