import { Request, Response } from 'express'
import { TeacherDashboardService } from '@services/TeacherDashboardService'
import { TeacherDashboardMessages } from '@constants/Message'
import { handleErrorAsync, handleSuccess } from '@utils/index'

/**
 * 教師後台管理控制器
 * 
 * 遵循 TDD 開發原則和專案架構指示：
 * 1. 使用 handleErrorAsync 包裝所有方法，避免手動撰寫 try...catch
 * 2. 依賴中間件處理認證和驗證邏輯，避免重複實作
 * 3. 專注於業務邏輯委派和統一回應格式
 * 4. 使用統一的訊息管理常數
 * 5. 抽取重複的參數轉換邏輯，提升程式碼品質
 */
export class TeacherDashboardController {
  private teacherDashboardService: TeacherDashboardService

  constructor() {
    this.teacherDashboardService = new TeacherDashboardService()
  }

  /**
   * 抽取通用的參數轉換邏輯
   */
  private extractTeacherId(req: Request): number {
    return Number(req.params.teacherId)
  }

  private extractStudentId(req: Request): number {
    return Number(req.params.studentId)
  }

  private extractReservationId(req: Request): number {
    return Number(req.params.reservationId)
  }

  private extractSettlementId(req: Request): number {
    return Number(req.params.settlementId)
  }

  /**
   * 取得教師儀表板總覽
   * 
   * 路由: GET /api/teachers/:teacherId/dashboard/overview
   * 中間件: authenticateToken (認證), validateDashboardOverviewQuery (查詢參數驗證)
   * 權限: 教師角色 (由路由層中間件檢查)
   */
  getDashboardOverview = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    
    const result = await this.teacherDashboardService.getDashboardOverview(teacherId)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.DASHBOARD_SUCCESS))
  })

  /**
   * 取得教師統計資料
   * 
   * 路由: GET /api/teachers/:teacherId/dashboard/statistics
   * 中間件: authenticateToken, validateStatisticsQuery
   * 權限: 教師角色
   */
  getStatistics = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const options = req.query  // 已由驗證中間件處理
    
    const result = await this.teacherDashboardService.getStatistics(teacherId, options)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.STATS_SUCCESS))
  })

  /**
   * 取得學生列表
   * 
   * 路由: GET /api/teachers/:teacherId/students
   * 中間件: authenticateToken, validateStudentListQuery
   * 權限: 教師角色
   */
  getStudentList = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const options = req.query  // 已由驗證中間件處理
    
    const result = await this.teacherDashboardService.getStudentList(teacherId, options)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.STUDENTS_LIST_SUCCESS))
  })

  /**
   * 取得學生詳情
   * 
   * 路由: GET /api/teachers/:teacherId/students/:studentId
   * 中間件: authenticateToken (認證不會在這裡重複檢查)
   * 權限: 教師角色
   */
  getStudentDetail = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const studentId = this.extractStudentId(req)
    
    const studentDetail = await this.teacherDashboardService.getStudentDetail(teacherId, studentId)
    
    res.status(200).json(handleSuccess(studentDetail.data, TeacherDashboardMessages.STUDENT_DETAIL_SUCCESS))
  })

  /**
   * 取得學生購買記錄
   * 
   * 路由: GET /api/teachers/:teacherId/students/:studentId/purchases
   * 中間件: authenticateToken
   * 權限: 教師角色
   */
  getStudentPurchases = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const studentId = this.extractStudentId(req)
    
    const result = await this.teacherDashboardService.getStudentPurchases(teacherId, studentId)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.STUDENT_PURCHASES_SUCCESS))
  })

  /**
   * 取得學生預約記錄
   * 
   * 路由: GET /api/teachers/:teacherId/students/:studentId/reservations
   * 中間件: authenticateToken
   * 權限: 教師角色
   */
  getStudentReservations = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const studentId = this.extractStudentId(req)
    
    const result = await this.teacherDashboardService.getStudentReservations(teacherId, studentId)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.STUDENT_RESERVATIONS_SUCCESS))
  })

  /**
   * 取得預約列表
   * 
   * 路由: GET /api/teachers/:teacherId/reservations
   * 中間件: authenticateToken, validateReservationListQuery
   * 權限: 教師角色
   */
  getReservationList = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const options = req.query  // 已由驗證中間件處理
    
    const result = await this.teacherDashboardService.getReservationList(teacherId, options)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.RESERVATION_LIST_SUCCESS))
  })

  /**
   * 更新預約狀態
   * 
   * 路由: PUT /api/teachers/:teacherId/reservations/:reservationId/status
   * 中間件: authenticateToken, validateUpdateReservationStatus
   * 權限: 教師角色
   */
  updateReservationStatus = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const reservationId = this.extractReservationId(req)
    const statusData = req.body  // 已由驗證中間件處理
    
    const result = await this.teacherDashboardService.updateReservationStatus(teacherId, reservationId, statusData)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.UPDATE_RESERVATION_SUCCESS))
  })



  /**
   * 取得收益資料
   * 
   * 路由: GET /api/teachers/:teacherId/earnings
   * 中間件: authenticateToken
   * 權限: 教師角色
   */
  getEarnings = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    
    const result = await this.teacherDashboardService.getEarnings(teacherId)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.EARNINGS_SUCCESS))
  })

  /**
   * 取得結算列表
   * 
   * 路由: GET /api/teachers/:teacherId/settlements
   * 中間件: authenticateToken
   * 權限: 教師角色
   */
  getSettlementList = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    
    const result = await this.teacherDashboardService.getSettlementList(teacherId)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.SETTLEMENTS_SUCCESS))
  })

  /**
   * 取得結算詳情
   * 
   * 路由: GET /api/teachers/:teacherId/settlements/:settlementId
   * 中間件: authenticateToken
   * 權限: 教師角色
   */
  getSettlementDetail = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    const settlementId = this.extractSettlementId(req)
    
    const result = await this.teacherDashboardService.getSettlementDetail(teacherId, settlementId)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.SETTLEMENT_DETAIL_SUCCESS))
  })

  /**
   * 取得收益統計
   * 
   * 路由: GET /api/teachers/:teacherId/earnings/stats
   * 中間件: authenticateToken
   * 權限: 教師角色
   */
  getEarningsStats = handleErrorAsync(async (req: Request, res: Response): Promise<void> => {
    const teacherId = this.extractTeacherId(req)
    
    const result = await this.teacherDashboardService.getEarningsStats(teacherId)
    res.status(200).json(handleSuccess(result.data, TeacherDashboardMessages.EARNINGS_STATS_SUCCESS))
  })
}
