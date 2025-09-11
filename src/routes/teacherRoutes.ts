import { Router } from 'express'
import { TeacherController } from '@controllers/TeacherController'
import { scheduleController } from '@controllers/ScheduleController'
import { learningExperienceController } from '@controllers/LearningExperienceController'
import { authenticateToken } from '@middleware/auth'
import { validateRequest } from '@middleware/schemas/core'
import {
  teacherApplicationSchema,
  teacherApplicationUpdateSchema,
  teacherProfileUpdateSchema,
  learningExperienceCreateSchema,
  learningExperienceUpdateSchema
} from '@middleware/schemas/user/teacherSchemas'
import {
  certificateCreateSchema,
  certificateUpdateSchema
} from '@middleware/schemas/user/certificateSchemas'
import { scheduleUpdateSchema, conflictsQuerySchema } from '@middleware/schemas/system/scheduleSchemas'
import { certificateController } from '@controllers/CertificateController'

const router = Router()
const teacherController = new TeacherController()


router.post('/apply', authenticateToken, validateRequest(teacherApplicationSchema, '教師申請參數驗證失敗'), teacherController.apply)


router.get('/application', authenticateToken, teacherController.getApplication)


router.put('/application', authenticateToken, validateRequest(teacherApplicationUpdateSchema, '更新申請參數驗證失敗'), teacherController.updateApplication)


router.post('/resubmit', authenticateToken, teacherController.resubmitApplication)


router.post('/submit', authenticateToken, teacherController.submit)


router.get('/profile', authenticateToken, teacherController.getProfile)


router.put('/profile', authenticateToken, validateRequest(teacherProfileUpdateSchema, '教師資料更新參數驗證失敗'), teacherController.updateProfile)


router.get('/work-experiences', authenticateToken, teacherController.getWorkExperiences)
router.post('/work-experiences', authenticateToken, teacherController.createWorkExperience)


router.put('/work-experiences/:id', authenticateToken, teacherController.updateWorkExperience)
router.delete('/work-experiences/:id', authenticateToken, teacherController.deleteWorkExperience)

// === 學習經歷管理路由 ===


router.get('/learning-experiences', authenticateToken, learningExperienceController.getLearningExperiences)


router.post('/learning-experiences', authenticateToken, validateRequest(learningExperienceCreateSchema), learningExperienceController.createLearningExperience)


router.put('/learning-experiences/:id', authenticateToken, validateRequest(learningExperienceUpdateSchema), learningExperienceController.updateLearningExperience)


router.delete('/learning-experiences/:id', authenticateToken, learningExperienceController.deleteLearningExperience)


router.get('/certificates', authenticateToken, certificateController.getCertificates)
router.post('/certificates', authenticateToken, validateRequest(certificateCreateSchema), certificateController.createCertificate)


router.put('/certificates/:id', authenticateToken, validateRequest(certificateUpdateSchema), certificateController.updateCertificate)
router.delete('/certificates/:id', authenticateToken, certificateController.deleteCertificate)

// === 教師時間管理路由 ===


router.get('/schedule', authenticateToken, scheduleController.getSchedule)


router.put('/schedule', authenticateToken, validateRequest(scheduleUpdateSchema), scheduleController.updateSchedule)


router.get('/schedule/conflicts', authenticateToken, validateRequest(conflictsQuerySchema, 'query'), scheduleController.checkConflicts)

export default router
