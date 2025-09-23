/**
 * 預約管理服務層
 * 處理預約相關的核心業務邏輯
 * 
 * 主要功能：
 * 1. 預約建立（衝突檢查、課程堂數驗證）
 * 2. 狀態更新（雙方確認機制）
 * 3. 取消邏輯（時間限制、退款）
 * 4. 列表查詢（角色權限、篩選分頁）
 * 5. 日曆檢視功能
 */

import { v4 as uuidv4 } from 'uuid'
import { Repository, IsNull } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Reservation } from '@entities/Reservation'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { ReservationStatus } from '@entities/enums'
import { BusinessError, ValidationError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import type {
  CreateReservationRequest,
  CreateReservationResponse,
  ReservationListQuery,
  ReservationListResponse,
  UpdateReservationStatusRequest,
  UpdateReservationStatusResponse,
  CancelReservationResponse,
  CalendarViewQuery,
  CalendarViewResponse,
  ReservationDetail,
  CalendarDayData,
  CalendarReservation
} from '@models/reservation.interface'

export class ReservationService {
  private reservationRepository: Repository<Reservation>
  private purchaseRepository: Repository<UserCoursePurchase>
  private availableSlotRepository: Repository<TeacherAvailableSlot>

  constructor() {
    this.reservationRepository = dataSource.getRepository(Reservation)
    this.purchaseRepository = dataSource.getRepository(UserCoursePurchase)
    this.availableSlotRepository = dataSource.getRepository(TeacherAvailableSlot)
  }

  /**
   * 建立預約
   */
  async createReservation(
    studentId: number,
    request: CreateReservationRequest
  ): Promise<CreateReservationResponse> {
    const { course_id, teacher_id, reserve_date, reserve_time } = request

    // 1. 驗證學生是否有該課程的購買記錄和剩餘堂數
    const purchase = await this.validateStudentPurchase(studentId, course_id)
    
    // 2-3. 並行執行驗證以提升效能
    await Promise.all([
      this.validateTeacherAvailability(teacher_id, reserve_date, reserve_time),
      this.validateTimeSlotConflict(teacher_id, reserve_date, reserve_time)
    ])

    // 4. 建立預約時間
    const reserveDateTime = this.parseReserveDateTime(reserve_date, reserve_time)

    // 5. 建立預約記錄
    const reservation = this.reservationRepository.create({
      uuid: uuidv4(),
      course_id,
      teacher_id,
      student_id: studentId,
      reserve_time: reserveDateTime,
      teacher_status: ReservationStatus.RESERVED,
      student_status: ReservationStatus.RESERVED
    })

    const savedReservation = await this.reservationRepository.save(reservation)

    // 6. 更新購買記錄的已使用堂數
    await this.updateUsedLessons(purchase.id, purchase.quantity_used + 1)

    // 7. 直接轉換預約資料，避免額外的資料庫查詢
    const reservationWithDetails = this.transformReservationToResponse(savedReservation)
    const remainingLessons = this.calculateRemainingLessons(purchase)

    return {
      reservation: reservationWithDetails,
      remaining_lessons: remainingLessons
    }
  }

  /**
   * 查詢預約列表  
   */
  async getReservations(
    userId: number,
    userRole: 'teacher' | 'student',
    query: ReservationListQuery
  ): Promise<ReservationListResponse> {
    const {
      status,
      date_from,
      date_to,
      page = 1,
      per_page = 10
    } = query

    // 建立基礎查詢（簡化版本，避免複雜的關聯查詢）
    const queryBuilder = this.reservationRepository.createQueryBuilder('reservation')

    // 根據角色過濾
    if (userRole === 'student') {
      queryBuilder.where('reservation.student_id = :userId', { userId })
    } else {
      queryBuilder.where('reservation.teacher_id = :userId', { userId })
    }

    // 狀態過濾
    if (status) {
      if (userRole === 'student') {
        queryBuilder.andWhere('reservation.student_status = :status', { status })
      } else {
        queryBuilder.andWhere('reservation.teacher_status = :status', { status })
      }
    }

    // 日期範圍過濾
    if (date_from && date_to) {
      const fromDate = new Date(date_from)
      const toDate = new Date(date_to)
      toDate.setHours(23, 59, 59, 999) // 包含整天

      queryBuilder.andWhere('reservation.reserve_time BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate
      })
    }

    // 排除已軟刪除的記錄
    queryBuilder.andWhere('reservation.deleted_at IS NULL')

    // 排序：最新的預約在前
    queryBuilder.orderBy('reservation.reserve_time', 'DESC')

    // 分頁
    const skip = (page - 1) * per_page
    queryBuilder.skip(skip).take(per_page)

    const [reservations, total] = await queryBuilder.getManyAndCount()

    // 轉換為回應格式
    const reservationList = reservations.map(reservation => this.transformReservationToResponse(reservation))

    return {
      reservations: reservationList,
      pagination: {
        current_page: page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page)
      }
    }
  }

  /**
   * 更新預約狀態
   */
  async updateReservationStatus(
    reservationId: number,
    userId: number,
    request: UpdateReservationStatusRequest
  ): Promise<UpdateReservationStatusResponse> {
    const { status_type } = request

    // 1. 查找預約
    const reservation = await this.getReservationById(reservationId)

    // 2. 根據狀態類型確定角色並驗證權限
    let role: 'student' | 'teacher'
    
    if (status_type === 'teacher-complete') {
      role = 'teacher'
      this.validateReservationAccess(reservation, userId, role)
      reservation.teacher_status = ReservationStatus.COMPLETED
    } else if (status_type === 'student-complete') {
      role = 'student'
      this.validateReservationAccess(reservation, userId, role)
      reservation.student_status = ReservationStatus.COMPLETED
    } else {
      throw new ValidationError(
        ERROR_CODES.RESERVATION_STATUS_INVALID,
        MESSAGES.RESERVATION.STATUS_UPDATED
      )
    }

    // 3. 儲存更新
    const updatedReservation = await this.reservationRepository.save(reservation)

    // 4. 檢查是否雙方都已確認完成
    const is_fully_completed = 
      updatedReservation.teacher_status === ReservationStatus.COMPLETED &&
      updatedReservation.student_status === ReservationStatus.COMPLETED

    // 5. 直接轉換預約資料，避免額外的資料庫查詢
    const reservationWithDetails = this.transformReservationToResponse(updatedReservation)

    return {
      reservation: reservationWithDetails,
      is_fully_completed
    }
  }

  /**
   * 取消預約
   */
  async cancelReservation(
    reservationId: number,
    userId: number
  ): Promise<CancelReservationResponse> {
    // 1. 查找預約
    const reservation = await this.getReservationById(reservationId)

    // 2. 驗證權限（學生或教師都可以取消）
    const isStudent = reservation.student_id === userId
    const isTeacher = reservation.teacher_id === userId
    
    if (!isStudent && !isTeacher) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_UNAUTHORIZED_ACCESS,
        MESSAGES.RESERVATION.CANCELLED
      )
    }

    // 3. 驗證取消條件
    this.validateCancellationRules(reservation)

    // 4. 更新狀態為已取消
    reservation.teacher_status = ReservationStatus.CANCELLED
    reservation.student_status = ReservationStatus.CANCELLED

    const updatedReservation = await this.reservationRepository.save(reservation)

    // 5. 退還課程堂數
    const refundedLessons = await this.refundLesson(reservation.student_id, reservation.course_id)

    // 6. 直接轉換預約資料，避免額外的資料庫查詢
    const reservationWithDetails = this.transformReservationToResponse(updatedReservation)

    return {
      reservation: reservationWithDetails,
      refunded_lessons: refundedLessons
    }
  }

  /**
   * 取得日曆檢視
   */
  async getCalendarView(
    userId: number,
    userRole: 'teacher' | 'student', 
    query: CalendarViewQuery
  ): Promise<CalendarViewResponse> {
    const { view, date } = query
    const targetDate = new Date(date)

    // 計算日期範圍
    const dateRange = this.calculateDateRange(view, targetDate)

    // 查詢該時間範圍內的預約（簡化版本，避免複雜的關聯查詢）
    const queryBuilder = this.reservationRepository.createQueryBuilder('reservation')
      .where('reservation.reserve_time BETWEEN :startDate AND :endDate', {
        startDate: dateRange.start,
        endDate: dateRange.end
      })
      .andWhere('reservation.deleted_at IS NULL')

    // 根據角色過濾
    if (userRole === 'student') {
      queryBuilder.andWhere('reservation.student_id = :userId', { userId })
    } else {
      queryBuilder.andWhere('reservation.teacher_id = :userId', { userId })
    }

    const reservations = await queryBuilder.getMany()

    // 組織日曆資料
    const calendarData = this.organizeCalendarData(view, dateRange, reservations)

    // 根據檢視類型返回不同格式
    if (view === 'month') {
      return {
        view: 'month',
        period: {
          year: targetDate.getFullYear(),
          month: targetDate.getMonth() + 1,
          start_date: dateRange.start.toISOString().split('T')[0],
          end_date: dateRange.end.toISOString().split('T')[0]
        },
        calendar_data: calendarData as any, // 暫時使用 any，待型別定義完善
        summary: {
          total_reservations: reservations.length,
          completed_reservations: reservations.filter(r => 
            r.teacher_status === ReservationStatus.COMPLETED && 
            r.student_status === ReservationStatus.COMPLETED
          ).length,
          upcoming_reservations: reservations.filter(r =>
            r.teacher_status === ReservationStatus.RESERVED &&
            r.student_status === ReservationStatus.RESERVED
          ).length
        }
      }
    } else {
      return {
        view: 'week',
        period: {
          start_date: dateRange.start.toISOString().split('T')[0],
          end_date: dateRange.end.toISOString().split('T')[0]
        },
        calendar_data: calendarData
      }
    }
  }

  // 私有輔助方法

  /**
   * 驗證學生課程購買記錄和剩餘堂數
   */
  private async validateStudentPurchase(studentId: number, courseId: number): Promise<UserCoursePurchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: {
        user_id: studentId,
        course_id: courseId
      }
    })

    if (!purchase) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_COURSE_NOT_PURCHASED,
        MESSAGES.BUSINESS.RESERVATION_COURSE_NOT_PURCHASED
      )
    }

    const remainingLessons = purchase.quantity_total - purchase.quantity_used
    if (remainingLessons <= 0) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_INSUFFICIENT_LESSONS,
        MESSAGES.BUSINESS.INSUFFICIENT_PURCHASE_QUANTITY
      )
    }

    return purchase
  }

  /**
   * 驗證教師在指定時間是否可用
   */
  private async validateTeacherAvailability(teacherId: number, date: string, time: string): Promise<void> {
    const reserveDate = new Date(date)
    const weekday = reserveDate.getDay()

    // 解析請求的時間
    const [requestHour, requestMinute] = time.split(':').map(Number)
    const requestTime = requestHour * 60 + requestMinute

    // 查找教師該週日的所有可用時段
    const availableSlots = await this.availableSlotRepository.find({
      where: {
        teacher_id: teacherId,
        weekday,
        is_active: true
      }
    })

    if (availableSlots.length === 0) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_TEACHER_UNAVAILABLE,
        MESSAGES.BUSINESS.RESERVATION_TEACHER_UNAVAILABLE
      )
    }

    // 檢查是否有時段包含請求的時間
    const matchingSlot = availableSlots.find(slot => {
      const [startHour, startMinute] = slot.start_time.split(':').map(Number)
      const [endHour, endMinute] = slot.end_time.split(':').map(Number)

      const startTime = startHour * 60 + startMinute
      const endTime = endHour * 60 + endMinute

      // 檢查請求時間是否在此時段範圍內
      return requestTime >= startTime && requestTime < endTime
    })

    if (!matchingSlot) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_TEACHER_UNAVAILABLE,
        MESSAGES.BUSINESS.RESERVATION_TEACHER_UNAVAILABLE
      )
    }
  }

  /**
   * 檢查時段衝突
   */
  private async validateTimeSlotConflict(teacherId: number, date: string, time: string): Promise<void> {
    const reserveDateTime = this.parseReserveDateTime(date, time)

    // 檢查同一時間是否已有預約（未取消的）
    const conflictingReservation = await this.reservationRepository.findOne({
      where: {
        teacher_id: teacherId,
        reserve_time: reserveDateTime,
        teacher_status: ReservationStatus.RESERVED,
        deleted_at: IsNull()
      }
    })

    if (conflictingReservation) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_CONFLICT,
        MESSAGES.BUSINESS.RESERVATION_CONFLICT,
        409  // 時段衝突應該回傳 409
      )
    }
  }

  /**
   * 解析預約日期時間
   */
  private parseReserveDateTime(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    
    return new Date(year, month - 1, day, hour, minute)
  }

  /**
   * 更新已使用課程堂數
   */
  private async updateUsedLessons(purchaseId: number, newUsedCount: number): Promise<void> {
    await this.purchaseRepository.update(purchaseId, {
      quantity_used: newUsedCount
    })
  }

  /**
   * 計算剩餘課程堂數
   */
  private calculateRemainingLessons(purchase: UserCoursePurchase) {
    const remaining = purchase.quantity_total - (purchase.quantity_used + 1) // +1 因為剛預約了一堂

    return {
      total: purchase.quantity_total,
      used: purchase.quantity_used + 1,
      remaining
    }
  }

  /**
   * 根據ID取得預約記錄
   */
  private async getReservationById(reservationId: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { 
        id: reservationId, 
        deleted_at: IsNull() 
      }
    })

    if (!reservation) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_NOT_FOUND,
        MESSAGES.RESERVATION.DETAIL_SUCCESS, // 使用現有訊息常數，實際應該新增專用的不存在訊息
        404  // 預約不存在應該回傳 404
      )
    }

    return reservation
  }

  /**
   * 驗證預約存取權限
   */
  private validateReservationAccess(reservation: Reservation, userId: number, role: 'student' | 'teacher'): void {
    const hasAccess = role === 'student' 
      ? reservation.student_id === userId
      : reservation.teacher_id === userId

    if (!hasAccess) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_UNAUTHORIZED_ACCESS,
        MESSAGES.RESERVATION.STATUS_UPDATED
      )
    }
  }

  /**
   * 驗證取消預約的規則
   */
  private validateCancellationRules(reservation: Reservation): void {
    // 檢查是否已完成
    if (reservation.teacher_status === ReservationStatus.COMPLETED || 
        reservation.student_status === ReservationStatus.COMPLETED) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_ALREADY_COMPLETED,
        MESSAGES.RESERVATION.FULLY_COMPLETED
      )
    }

    // 檢查是否已取消
    if (reservation.teacher_status === ReservationStatus.CANCELLED) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_ALREADY_CANCELLED,
        MESSAGES.RESERVATION.CANCELLED
      )
    }

    // 檢查24小時取消限制
    const now = new Date()
    const timeDifference = reservation.reserve_time.getTime() - now.getTime()
    const hoursUntilReservation = timeDifference / (1000 * 60 * 60)

    if (hoursUntilReservation < 24) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_CANCEL_TIME_LIMIT,
        MESSAGES.RESERVATION.CANCELLED
      )
    }
  }

  /**
   * 退還課程堂數
   */
  private async refundLesson(studentId: number, courseId: number): Promise<number> {
    const purchase = await this.purchaseRepository.findOne({
      where: {
        user_id: studentId,
        course_id: courseId
      }
    })

    if (purchase && purchase.quantity_used > 0) {
      await this.purchaseRepository.update(purchase.id, {
        quantity_used: purchase.quantity_used - 1
      })
      return 1
    }

    return 0
  }

  /**
   * 取得預約詳細資料
   */
  private async getReservationWithDetails(reservationId: number): Promise<ReservationDetail> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId }
      // 移除 relations 以避免關聯查詢錯誤
    })

    if (!reservation) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_NOT_FOUND,
        MESSAGES.BUSINESS.RESERVATION_NOT_FOUND,
        404  // 預約不存在應該回傳 404
      )
    }

    return this.transformReservationToResponse(reservation)
  }

  /**
   * 轉換預約資料為回應格式
   * @param reservation 預約資料
   * @param includeDetails 是否包含課程和教師詳細資訊（預設為 false 以提升效能）
   */
  private transformReservationToResponse(reservation: Reservation, includeDetails = false): ReservationDetail {
    const baseData: ReservationDetail = {
      id: reservation.id,
      uuid: reservation.uuid,
      course_id: reservation.course_id,
      teacher_id: reservation.teacher_id,
      student_id: reservation.student_id,
      reserve_time: reservation.reserve_time,
      teacher_status: reservation.teacher_status,
      student_status: reservation.student_status,
      created_at: reservation.created_at,
      updated_at: reservation.updated_at
    }

    // 只有在需要時才包含詳細資訊，避免不必要的記憶體使用
    if (includeDetails) {
      baseData.course = {
        id: reservation.course_id,
        name: '課程名稱', // TODO: 在實際應用中需要透過關聯查詢取得
        teacher: {
          user: {
            nick_name: '教師名稱' // TODO: 在實際應用中需要透過關聯查詢取得
          }
        }
      }
    }

    return baseData
  }

  /**
   * 計算日曆檢視的日期範圍
   */
  private calculateDateRange(view: 'week' | 'month', targetDate: Date): { start: Date; end: Date } {
    const start = new Date(targetDate)
    const end = new Date(targetDate)

    if (view === 'week') {
      // 週檢視：從週一開始到週日結束
      const dayOfWeek = start.getDay()
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      start.setDate(start.getDate() + mondayOffset)
      end.setDate(start.getDate() + 6)
    } else {
      // 月檢視：從月初到月末
      start.setDate(1)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
    }

    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)

    return { start, end }
  }

  /**
   * 組織日曆資料
   */
  private organizeCalendarData(view: 'week' | 'month', dateRange: { start: Date; end: Date }, reservations: Reservation[]): CalendarDayData[] {
    const calendarDays: CalendarDayData[] = []
    const current = new Date(dateRange.start)

    while (current <= dateRange.end) {
      const dateString = current.toISOString().split('T')[0]
      
      // 找到該日的預約
      const dayReservations = reservations.filter(reservation => {
        const reserveDate = new Date(reservation.reserve_time)
        return reserveDate.toISOString().split('T')[0] === dateString
      })

      calendarDays.push({
        date: dateString,
        weekday: current.getDay(),
        weekday_name: this.getWeekdayName(current.getDay()),
        reservations: dayReservations.map(r => this.transformReservationToCalendar(r))
      })

      current.setDate(current.getDate() + 1)
    }

    return calendarDays
  }

  /**
   * 轉換預約資料為日曆預約格式
   */
  private transformReservationToCalendar(reservation: Reservation): CalendarReservation {
    const reserveTime = new Date(reservation.reserve_time)
    const status = this.getReservationStatus(reservation)
    
    return {
      id: reservation.id,
      uuid: reservation.uuid,
      time: reserveTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }),
      duration: 60, // 預設60分鐘，實際應該從課程設定取得
      status,
      course: {
        id: reservation.course_id,
        name: '課程名稱' // 在實際應用中需要查詢取得
      },
      participant: {
        id: reservation.student_id, // 或 teacher_id，根據角色而定
        nick_name: '參與者名稱', // 在實際應用中需要查詢取得
        role: 'student' // 根據當前使用者角色決定顯示對方角色
      }
    }
  }

  /**
   * 取得預約狀態
   */
  private getReservationStatus(reservation: Reservation): 'reserved' | 'completed' | 'cancelled' {
    if (reservation.teacher_status === ReservationStatus.CANCELLED || 
        reservation.student_status === ReservationStatus.CANCELLED) {
      return 'cancelled'
    }
    
    if (reservation.teacher_status === ReservationStatus.COMPLETED && 
        reservation.student_status === ReservationStatus.COMPLETED) {
      return 'completed'
    }
    
    return 'reserved'
  }

  /**
   * 取得星期名稱
   */
  private getWeekdayName(weekday: number): string {
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
    return weekdays[weekday]
  }
}

// 匯出服務實例
export const reservationService = new ReservationService()