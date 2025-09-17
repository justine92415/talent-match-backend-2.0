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

/**
 * @swagger
 * /api/teacher-dashboard/{teacherId}/overview:
 *   get:
 *     summary: 取得教師儀表板概覽
 *     description: |
 *       取得教師儀表板的概覽資訊，包含課程統計、學生統計、收入統計和近期活動等資料。
 *       只有教師本人可以查看自己的儀表板資料。
 *       
 *       **包含資訊：**
 *       - 課程統計（總數、已發布、審核中等）
 *       - 學生統計（總學生數、活躍學生數）
 *       - 收入統計（本月收入、總收入）
 *       - 近期活動（新預約、新評價等）
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的儀表板資料
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: query
 *         name: date_range
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 1y]
 *           default: 30d
 *         description: 統計資料時間範圍
 *         example: "30d"
 *     responses:
 *       200:
 *         description: 成功取得儀表板概覽
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/TeacherDashboardOverview'
 *             examples:
 *               success:
 *                 summary: 成功回應範例
 *                 value:
 *                   status: "success"
 *                   message: "成功取得儀表板概覽"
 *                   data:
 *                     course_stats:
 *                       total_courses: 5
 *                       published_courses: 3
 *                       pending_courses: 1
 *                       draft_courses: 1
 *                     student_stats:
 *                       total_students: 25
 *                       active_students: 18
 *                       new_students_this_month: 3
 *                     earning_stats:
 *                       total_earnings: 150000
 *                       this_month_earnings: 25000
 *                       last_month_earnings: 22000
 *                       growth_rate: 13.6
 *                     recent_activities:
 *                       - type: "new_reservation"
 *                         message: "新預約：Python 基礎課程"
 *                         created_at: "2024-01-20T10:30:00Z"
 *                       - type: "new_review"
 *                         message: "收到新評價：5 星評價"
 *                         created_at: "2024-01-19T16:45:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 權限不足，只能查看自己的儀表板
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               access_denied:
 *                 summary: 權限不足
 *                 value:
 *                   status: "error"
 *                   message: "您只能存取自己的教師後台資料"
 *                   error_code: "ACCESS_DENIED"
 *       404:
 *         description: 教師不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:teacherId/overview',
  ...authMiddlewareChains.teacherAuth,
  requireTeacherOwnership,
  teacherDashboardSchemas.validateDashboardOverviewQuery,
  teacherDashboardController.getDashboardOverview
)

/**
 * @swagger
 * /api/teacher-dashboard/{teacherId}/statistics:
 *   get:
 *     summary: 取得教師詳細統計資料
 *     description: |
 *       取得教師的詳細統計資料，包含各種時間區間的數據分析。
 *       提供更深入的數據分析，幫助教師了解教學表現和業務狀況。
 *       
 *       **統計內容：**
 *       - 課程表現統計（瀏覽數、報名數、完課率）
 *       - 收入趨勢分析（日、週、月收入變化）
 *       - 學生行為分析（活躍度、滿意度）
 *       - 教學效果評估（評價分數、推薦率）
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的統計資料
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 統計開始日期
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 統計結束日期
 *         example: "2024-01-31"
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: 統計資料的時間粒度
 *         example: "daily"
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
 *                     data:
 *                       $ref: '#/components/schemas/TeacherDetailedStatistics'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:teacherId/statistics',
  ...authMiddlewareChains.teacherAuth,
  requireTeacherOwnership,
  teacherDashboardSchemas.validateStatisticsQuery,
  teacherDashboardController.getStatistics
)

/**
 * @swagger
 * /api/teacher-dashboard/{teacherId}/students:
 *   get:
 *     summary: 取得教師學生列表
 *     description: |
 *       取得教師的學生列表，包含學生基本資訊、學習進度和互動記錄。
 *       支援分頁瀏覽、搜索和多種篩選條件。
 *       
 *       **功能特色：**
 *       - 支援學生姓名搜索
 *       - 依學習狀態篩選
 *       - 依加入時間排序
 *       - 顯示學習進度和最後互動時間
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的學生
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *         example: 1
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每頁顯示數量
 *         example: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 200
 *         description: 搜索學生姓名或暱稱
 *         example: "王小明"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, completed]
 *         description: 學習狀態篩選
 *         example: "active"
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
 *                     data:
 *                       type: object
 *                       properties:
 *                         students:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherStudentInfo'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:teacherId/students',
  ...authMiddlewareChains.teacherAuth,
  teacherDashboardSchemas.validateStudentListQuery,
  teacherDashboardController.getStudentList
)

/**
 * @swagger
 * /api/teacher-dashboard/{teacherId}/students/{studentId}:
 *   get:
 *     summary: 取得學生詳細資訊
 *     description: |
 *       取得特定學生的詳細資訊，包含學習記錄、課程進度、互動歷史等。
 *       幫助教師更好地了解個別學生的學習狀況。
 *       
 *       **包含資訊：**
 *       - 學生基本資訊
 *       - 課程學習進度
 *       - 作業和測驗成績
 *       - 互動記錄和回饋
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己學生的詳細資訊
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 學生 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功取得學生詳細資訊
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/StudentDetailInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       404:
 *         description: 學生不存在或非該教師的學生
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * /api/teacher-dashboard/{teacherId}/reservations:
 *   get:
 *     summary: 取得教師預約列表
 *     description: |
 *       取得教師的課程預約列表，包含待確認、已確認、已完成等各種狀態的預約。
 *       支援分頁瀏覽和狀態篩選，幫助教師管理課程安排。
 *       
 *       **功能特色：**
 *       - 支援預約狀態篩選
 *       - 依預約時間排序
 *       - 顯示學生資訊和課程詳情
 *       - 支援批次操作
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的預約記錄
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每頁顯示數量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled]
 *         description: 預約狀態篩選
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 預約開始日期篩選
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 預約結束日期篩選
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
 *                     data:
 *                       type: object
 *                       properties:
 *                         reservations:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherReservationInfo'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * /api/teacher-dashboard/{teacherId}/reservations/{reservationId}/status:
 *   put:
 *     summary: 更新預約狀態
 *     description: |
 *       更新指定預約的狀態，教師可以確認、拒絕或完成預約。
 *       狀態變更會自動通知學生，並記錄操作歷史。
 *       
 *       **可用狀態轉換：**
 *       - pending → confirmed (確認預約)
 *       - pending → rejected (拒絕預約)
 *       - confirmed → completed (標記完成)
 *       - confirmed → cancelled (取消預約)
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能更新自己的預約狀態
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 預約 ID
 *         example: 1
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
 *                 enum: [confirmed, rejected, completed, cancelled]
 *                 description: 新的預約狀態
 *               reason:
 *                 type: string
 *                 maxLength: 500
 *                 description: 狀態變更原因（拒絕或取消時建議提供）
 *           examples:
 *             confirm:
 *               summary: 確認預約
 *               value:
 *                 status: "confirmed"
 *             reject:
 *               summary: 拒絕預約
 *               value:
 *                 status: "rejected"
 *                 reason: "該時段已有其他安排"
 *     responses:
 *       200:
 *         description: 預約狀態更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       404:
 *         description: 預約不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 狀態轉換無效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * /api/teacher-dashboard/{teacherId}/earnings:
 *   get:
 *     summary: 取得教師收入記錄
 *     description: |
 *       取得教師的詳細收入記錄，包含每筆課程收入、佣金扣除、實際收入等資訊。
 *       支援分頁瀏覽和時間範圍篩選，幫助教師追蹤收入狀況。
 *       
 *       **功能特色：**
 *       - 詳細收入明細
 *       - 佣金計算透明
 *       - 支援時間範圍篩選
 *       - 匯出功能（CSV/Excel）
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的收入記錄
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每頁顯示數量
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 收入開始日期
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 收入結束日期
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, paid]
 *         description: 收入狀態篩選
 *     responses:
 *       200:
 *         description: 成功取得收入記錄
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         earnings:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherEarningInfo'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *                         summary:
 *                           $ref: '#/components/schemas/EarningSummary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * /api/teacher-dashboard/{teacherId}/settlements:
 *   get:
 *     summary: 取得教師結算記錄列表
 *     description: |
 *       取得教師的結算記錄列表，包含月度結算、季度結算等定期結算資訊。
 *       結算記錄包含結算金額、手續費、實際撥款金額等詳細資料。
 *       
 *       **功能特色：**
 *       - 月度/季度結算記錄
 *       - 結算狀態追蹤
 *       - 撥款明細
 *       - 稅務資訊
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的結算記錄
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 頁碼
 *       - in: query
 *         name: per_page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每頁顯示數量
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           minimum: 2020
 *         description: 結算年份篩選
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [processing, completed, cancelled]
 *         description: 結算狀態篩選
 *     responses:
 *       200:
 *         description: 成功取得結算記錄列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         settlements:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherSettlementInfo'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * /api/teacher-dashboard/{teacherId}/settlements/{settlementId}:
 *   get:
 *     summary: 取得結算記錄詳情
 *     description: |
 *       取得指定結算記錄的詳細資訊，包含結算期間內的所有收入明細、
 *       扣除項目、稅務資訊和實際撥款詳情。
 *       
 *       **詳情內容：**
 *       - 結算期間和總額
 *       - 收入明細列表
 *       - 各項扣除和手續費
 *       - 撥款銀行資訊
 *       - 相關發票和憑證
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的結算詳情
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: path
 *         name: settlementId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 結算記錄 ID
 *         example: 1
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
 *                     data:
 *                       $ref: '#/components/schemas/SettlementDetailInfo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       404:
 *         description: 結算記錄不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
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
 * /api/teacher-dashboard/{teacherId}/earnings-stats:
 *   get:
 *     summary: 取得教師收入統計
 *     description: |
 *       取得教師的收入統計資料，包含各種時間維度的收入分析和趨勢圖表資料。
 *       提供深入的收入分析，幫助教師了解收入變化趨勢和業績表現。
 *       
 *       **統計內容：**
 *       - 收入趨勢分析（日/週/月/年）
 *       - 課程收入分布
 *       - 學生來源分析
 *       - 收入預測和目標對比
 *       
 *       **權限要求：**
 *       - 需要教師身份認證
 *       - 只能查看自己的收入統計
 *     tags:
 *       - Teacher Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 教師 ID
 *         example: 1
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d, 6m, 1y]
 *           default: 30d
 *         description: 統計時間週期
 *         example: "30d"
 *       - in: query
 *         name: group_by
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: 統計資料分組方式
 *         example: "day"
 *       - in: query
 *         name: include_forecast
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含收入預測
 *         example: true
 *     responses:
 *       200:
 *         description: 成功取得收入統計
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EarningsStatistics'
 *             examples:
 *               success:
 *                 summary: 成功回應範例
 *                 value:
 *                   status: "success"
 *                   message: "成功取得收入統計"
 *                   data:
 *                     summary:
 *                       total_earnings: 125000
 *                       period_earnings: 25000
 *                       growth_rate: 15.5
 *                       avg_daily_earnings: 833
 *                     trends:
 *                       - date: "2024-01-01"
 *                         earnings: 1200
 *                         course_count: 3
 *                       - date: "2024-01-02"
 *                         earnings: 800
 *                         course_count: 2
 *                     course_breakdown:
 *                       - course_name: "Python 基礎"
 *                         earnings: 15000
 *                         percentage: 60
 *                       - course_name: "進階 JavaScript"
 *                         earnings: 10000
 *                         percentage: 40
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/AccessDeniedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  '/:teacherId/earnings-stats',
  authenticateToken,
  requireTeacher,
  teacherDashboardSchemas.validateEarningsSummaryQuery,
  teacherDashboardController.getEarningsStats
)

export default router