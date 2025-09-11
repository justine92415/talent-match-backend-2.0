import { Router } from 'express'
import { TeacherDashboardController } from '@controllers/TeacherDashboardController'

const teacherDashboardController = new TeacherDashboardController()
import { 
  authMiddlewareChains, 
  createAuthChain, 
  requireOwnership,
  authenticateToken,
  requireTeacher
} from '@middleware/auth'
import { teacherDashboardValidation as teacherDashboardSchemas } from '@middleware/schemas/system'
import { UserRole } from '@entities/enums'

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

/**
 * @swagger
 * tags:
 *   name: TeacherDashboard
 *   description: 教師後台管理系統 API
 */

/**
 * @swagger
 * components:
 *   responses:
 *     Unauthorized:
 *       description: 未授權存取
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "TOKEN_REQUIRED"
 *                   message:
 *                     type: string
 *                     example: "需要授權令牌"
 *     Forbidden:
 *       description: 權限不足
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/ErrorResponse'
 *               - type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "TEACHER_DASHBOARD_ACCESS_DENIED"
 *                   message:
 *                     type: string
 *                     example: "您沒有權限查看此教師後台資料"
 *   schemas:
 *     TeacherDashboardOverview:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: integer
 *           description: 總學生數
 *         totalCourses:
 *           type: integer
 *           description: 總課程數
 *         totalReservations:
 *           type: integer
 *           description: 總預約數
 *         completedReservations:
 *           type: integer
 *           description: 已完成預約數
 *         pendingReservations:
 *           type: integer
 *           description: 待處理預約數
 *         totalEarnings:
 *           type: number
 *           format: float
 *           description: 總收益
 *         monthlyReservations:
 *           type: integer
 *           description: 本月預約數
 *         monthlyEarnings:
 *           type: number
 *           format: float
 *           description: 本月收益
 *         averageRating:
 *           type: number
 *           format: float
 *           description: 平均評分
 *         completionRate:
 *           type: number
 *           format: float
 *           description: 完成率
 *     TeacherStatistics:
 *       type: object
 *       properties:
 *         overview:
 *           type: object
 *           properties:
 *             totalStudents:
 *               type: integer
 *             totalCourses:
 *               type: integer
 *             totalReservations:
 *               type: integer
 *             totalEarnings:
 *               type: number
 *               format: float
 *         summary:
 *           type: object
 *           properties:
 *             totalRevenue:
 *               type: number
 *               format: float
 *             totalStudents:
 *               type: integer
 *             completedClasses:
 *               type: integer
 *             averageRating:
 *               type: number
 *               format: float
 *         performance:
 *           type: object
 *           properties:
 *             averageRating:
 *               type: number
 *               format: float
 *             completionRate:
 *               type: number
 *               format: float
 *             responseRate:
 *               type: number
 *               format: float
 *     StudentListItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *         enrolledCourses:
 *           type: integer
 *         totalLessons:
 *           type: integer
 *         completedLessons:
 *           type: integer
 *         totalSpent:
 *           type: number
 *           format: float
 *         averageRating:
 *           type: number
 *           format: float
 *         lastReservationDate:
 *           type: string
 *           format: date
 *     PaginatedStudentList:
 *       type: object
 *       properties:
 *         students:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StudentListItem'
 *         pagination:
 *           $ref: '#/components/schemas/PaginationMeta'
 *     PaginationMeta:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: 當前頁數
 *         limit:
 *           type: integer
 *           description: 每頁筆數
 *         total:
 *           type: integer
 *           description: 總筆數
 *         totalPages:
 *           type: integer
 *           description: 總頁數
 *     ReservationItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         studentName:
 *           type: string
 *         courseName:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 *         duration:
 *           type: integer
 *           description: 持續時間（分鐘）
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         studentId:
 *           type: integer
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [error]
 *         code:
 *           type: string
 *           description: 錯誤代碼
 *         message:
 *           type: string
 *           description: 錯誤訊息
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [success]
 *         message:
 *           type: string
 *           description: 成功訊息
 *         data:
 *           type: object
 *           description: 回應資料
 */

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/overview:
 *   get:
 *     summary: 取得教師儀表板總覽統計
 *     description: 獲取教師後台儀表板的總覽數據，包括學生數、課程數、預約數、收益統計等關鍵指標
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *     responses:
 *       200:
 *         description: 成功取得儀表板總覽資料
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得儀表板數據成功"
 *                     data:
 *                       $ref: '#/components/schemas/TeacherDashboardOverview'
 *       401:
 *         description: 未授權存取
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "TOKEN_REQUIRED"
 *                     message:
 *                       type: string
 *                       example: "需要授權令牌"
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "TEACHER_DASHBOARD_ACCESS_DENIED"
 *                     message:
 *                       type: string
 *                       example: "您沒有權限查看此教師後台資料"
 *       500:
 *         description: 內部伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 方法1：使用認證鏈
router.get(
  '/:teacherId/overview',
  ...authMiddlewareChains.teacherAuth,
  requireTeacherOwnership,
  teacherDashboardSchemas.validateDashboardOverviewQuery,
  teacherDashboardController.getDashboardOverview
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/statistics:
 *   get:
 *     summary: 取得教師詳細統計資料
 *     description: 獲取教師的詳細統計數據，包括總覽、績效指標、趨勢分析等
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 統計起始日期 (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 統計結束日期 (YYYY-MM-DD)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [earnings, performance, all]
 *         description: 統計類型
 *     responses:
 *       200:
 *         description: 成功取得統計資料
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得教師統計數據成功"
 *                     data:
 *                       $ref: '#/components/schemas/TeacherStatistics'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "日期格式錯誤"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
// 統計資料路由 - 需要教師身份且擁有權限驗證
router.get(
  '/:teacherId/statistics',
  ...authMiddlewareChains.teacherAuth,
  requireTeacherOwnership,
  teacherDashboardSchemas.validateStatisticsQuery,
  teacherDashboardController.getStatistics
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/students:
 *   get:
 *     summary: 取得學生列表
 *     description: 獲取教師的學生列表，支援分頁、搜尋和狀態篩選
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數（最大100）
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜尋關鍵字（學生姓名或信箱）
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: 學生狀態篩選
 *     responses:
 *       200:
 *         description: 成功取得學生列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得學生列表成功"
 *                     data:
 *                       $ref: '#/components/schemas/PaginatedStudentList'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "每頁最多只能查詢 100 筆資料"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/:teacherId/students',
  ...authMiddlewareChains.teacherAuth,
  teacherDashboardSchemas.validateStudentListQuery,
  teacherDashboardController.getStudentList
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/students/{studentId}:
 *   get:
 *     summary: 取得學生詳細資料
 *     description: 獲取特定學生的詳細資料，包括基本資訊、學習紀錄、預約紀錄等
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 學生ID
 *     responses:
 *       200:
 *         description: 成功取得學生詳細資料
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得學生詳情成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 學生不存在
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "STUDENT_NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "學生不存在"
 */
router.get(
  '/:teacherId/students/:studentId',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateStudentIdParams,
  teacherDashboardController.getStudentDetail
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/reservations:
 *   get:
 *     summary: 取得預約列表
 *     description: 獲取教師的預約列表，支援狀態篩選和日期範圍篩選
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *         description: 預約狀態篩選
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 開始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 結束日期
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *     responses:
 *       200:
 *         description: 成功取得預約列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得預約列表成功"
 *                     data:
 *                       type: object
 *                       properties:
 *                         reservations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ReservationItem'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/:teacherId/reservations',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateReservationListQuery,
  teacherDashboardController.getReservationList
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/reservations/{reservationId}/status:
 *   put:
 *     summary: 更新預約狀態
 *     description: 教師更新預約的狀態（確認、取消等）
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 預約ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, cancelled, completed]
 *                 description: 新的預約狀態
 *               note:
 *                 type: string
 *                 description: 備註（選填）
 *     responses:
 *       200:
 *         description: 成功更新預約狀態
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "更新預約狀態成功"
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "VALIDATION_ERROR"
 *                     message:
 *                       type: string
 *                       example: "無效的預約狀態"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 預約不存在
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "RESERVATION_NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "預約記錄不存在"
 */
router.put(
  '/:teacherId/reservations/:reservationId/status',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateUpdateReservationStatus,
  teacherDashboardController.updateReservationStatus
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/earnings:
 *   get:
 *     summary: 取得收益列表
 *     description: 獲取教師的收益明細記錄，支援狀態篩選
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, settled]
 *         description: 收益狀態篩選
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *     responses:
 *       200:
 *         description: 成功取得收益列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得收入明細成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/:teacherId/earnings',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateEarningsListQuery,
  teacherDashboardController.getEarnings
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/settlements:
 *   get:
 *     summary: 取得結算列表
 *     description: 獲取教師的結算記錄列表
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每頁筆數
 *     responses:
 *       200:
 *         description: 成功取得結算記錄
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得結算記錄成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/:teacherId/settlements',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateSettlementListQuery,
  teacherDashboardController.getSettlementList
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/settlements/{settlementId}:
 *   get:
 *     summary: 取得結算詳情
 *     description: 獲取特定結算記錄的詳細資訊
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *       - in: path
 *         name: settlementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 結算記錄ID
 *     responses:
 *       200:
 *         description: 成功取得結算詳情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得結算詳情成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: 結算記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "SETTLEMENT_NOT_FOUND"
 *                     message:
 *                       type: string
 *                       example: "結算記錄不存在"
 */
router.get(
  '/:teacherId/settlements/:settlementId',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateSettlementIdParams,
  teacherDashboardController.getSettlementDetail
)

/**
 * @swagger
 * /teacher-dashboard/{teacherId}/earnings-stats:
 *   get:
 *     summary: 取得收益統計
 *     description: 獲取教師的收益統計總結資料
 *     tags: [TeacherDashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教師ID
 *     responses:
 *       200:
 *         description: 成功取得收益統計
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "取得收入統計成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get(
  '/:teacherId/earnings-stats',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateEarningsSummaryQuery,
  teacherDashboardController.getEarningsStats
)

export default router
