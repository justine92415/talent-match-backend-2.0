import { Router } from 'express'
import { TeacherDashboardController } from '@controllers/TeacherDashboardController'

const teacherDashboardController = new TeacherDashboardController()
import { 
  authMiddlewareChains, 
  requireOwnership,
  authenticateToken,
  requireTeacher
} from '@middleware/auth'
import { teacherDashboardValidation as teacherDashboardSchemas } from '@middleware/schemas/system'

const router = Router()

/**
 * 教師後台擁有者權限檢查
 * 確保教師只能存取自己的後台資料
 */
const requireTeacherOwnership = requireOwnership(
  (req) => req.params.teacherId || req.params.id,
  async (userId: number, teacherId: string | number): Promise<boolean> => {
    if (!teacherId) {
      return false
    }
    
    // 查詢資料庫確認教師申請記錄的 user_id 是否等於當前使用者ID
    try {
      const { dataSource } = await import('@db/data-source')
      const { Teacher } = await import('@entities/Teacher')
      
      const teacherRepository = dataSource.getRepository(Teacher)
      const teacher = await teacherRepository.findOne({
        where: { id: parseInt(teacherId.toString()) },
        select: ['id', 'user_id']
      })
      
      if (!teacher) {
        return false
      }
      
      return teacher.user_id === userId
    } catch (error) {
      console.error('Error checking teacher ownership:', error)
      return false
    }
  },
  '您只能存取自己的教師後台資料'
)

router.get(
  '/:teacherId/overview',
  ...authMiddlewareChains.teacherAuth,
  requireTeacherOwnership,
  teacherDashboardSchemas.validateDashboardOverviewQuery,
  teacherDashboardController.getDashboardOverview
)

router.get(
  '/:teacherId/statistics',
  ...authMiddlewareChains.teacherAuth,
  requireTeacherOwnership,
  teacherDashboardSchemas.validateStatisticsQuery,
  teacherDashboardController.getStatistics
)

router.get(
  '/:teacherId/students',
  ...authMiddlewareChains.teacherAuth,
  teacherDashboardSchemas.validateStudentListQuery,
  teacherDashboardController.getStudentList
)

router.get(
  '/:teacherId/students/:studentId',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateStudentIdParams,
  teacherDashboardController.getStudentDetail
)

router.get(
  '/:teacherId/reservations',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateReservationListQuery,
  teacherDashboardController.getReservationList
)

router.put(
  '/:teacherId/reservations/:reservationId/status',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateUpdateReservationStatus,
  teacherDashboardController.updateReservationStatus
)

router.get(
  '/:teacherId/earnings',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateEarningsListQuery,
  teacherDashboardController.getEarnings
)

router.get(
  '/:teacherId/settlements',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateSettlementListQuery,
  teacherDashboardController.getSettlementList
)

router.get(
  '/:teacherId/settlements/:settlementId',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateSettlementIdParams,
  teacherDashboardController.getSettlementDetail
)

router.get(
  '/:teacherId/earnings-stats',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateEarningsSummaryQuery,
  teacherDashboardController.getEarningsStats
)

export default router