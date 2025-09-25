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
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { Course } from '@entities/Course'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { ReservationStatus } from '@entities/enums'
import { BusinessError, ValidationError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { TimeUtils } from '@utils/TimeUtils'
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
  CalendarReservation,
  TeacherReservationQuery,
  TeacherReservationResponse,
  TeacherReservationItem
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

    // 5. 計算教師回應期限
    const responseDeadline = this.calculateResponseDeadline(reserveDateTime)

    // 6. 建立預約記錄（設定初始狀態為待確認）
    const reservation = this.reservationRepository.create({
      uuid: uuidv4(),
      course_id,
      teacher_id,
      student_id: studentId,
      reserve_time: reserveDateTime,
      teacher_status: ReservationStatus.PENDING,
      student_status: ReservationStatus.RESERVED,
      response_deadline: responseDeadline
    })

    const savedReservation = await this.reservationRepository.save(reservation)

    // 注意：暫時不扣除課程堂數，待教師確認後再扣除
    // await this.updateUsedLessons(purchase.id, purchase.quantity_used + 1)

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
      course_id,
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

    // 課程篩選
    if (course_id) {
      queryBuilder.andWhere('reservation.course_id = :courseId', { courseId: course_id })
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
   * 學生查詢自己的預約列表
   */
  async getStudentReservations(
    studentId: number,
    query: Omit<ReservationListQuery, 'role'>
  ): Promise<ReservationListResponse> {
    const {
      status,
      course_id,
      date_from,
      date_to,
      page = 1,
      per_page = 10
    } = query

    // 建立基礎查詢（簡化版本，避免複雜的關聯查詢）
    const queryBuilder = this.reservationRepository.createQueryBuilder('reservation')

    // 只查詢學生自己的預約
    queryBuilder.where('reservation.student_id = :studentId', { studentId })

    // 課程篩選
    if (course_id) {
      queryBuilder.andWhere('reservation.course_id = :courseId', { courseId: course_id })
    }

    // 狀態過濾 - 使用學生狀態
    if (status) {
      queryBuilder.andWhere('reservation.student_status = :status', { status })
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
   * 教師查詢課程預約列表
   */
  async getTeacherCourseReservations(
    userId: number,
    query: TeacherReservationQuery
  ): Promise<TeacherReservationResponse> {
    // 先根據 userId 找到教師記錄
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })
    
    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ACCESS,
        '教師資料不存在',
        404
      )
    }

    const teacherId = teacher.id
    const {
      course_id,
      time_range,
      date_from,
      date_to,
      status,
      student_search,
      page = 1,
      per_page = 10
    } = query

    // 建立查詢 - 先獲取預約記錄，然後批量查詢關聯資料
    const queryBuilder = this.reservationRepository.createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.course', 'course')
      .leftJoinAndSelect('reservation.student', 'student')
      .leftJoinAndSelect('reservation.teacher', 'teacher')
      
    // 教師篩選（只能查詢自己的課程預約）
    queryBuilder.where('reservation.teacher_id = :teacherId', { teacherId })

    // 課程篩選
    if (course_id) {
      queryBuilder.andWhere('reservation.course_id = :courseId', { courseId: course_id })
    }

    // 時間範圍篩選
    if (time_range && time_range !== 'all') {
      const dateRange = this.getDateRange(time_range)
      if (dateRange) {
        queryBuilder.andWhere('reservation.reserve_time BETWEEN :startDate AND :endDate', {
          startDate: dateRange.start,
          endDate: dateRange.end
        })
      }
    } else if (date_from && date_to) {
      // 自定義日期範圍
      const fromDate = new Date(date_from)
      const toDate = new Date(date_to)
      toDate.setHours(23, 59, 59, 999)

      queryBuilder.andWhere('reservation.reserve_time BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate
      })
    }

    // 狀態篩選
    if (status && status !== 'all') {
      if (status === 'pending') {
        queryBuilder.andWhere('reservation.teacher_status = :status', { status: 'pending' })
      } else {
        // 使用綜合狀態邏輯
        this.addOverallStatusFilter(queryBuilder, status)
      }
    }

    // 學生搜尋（暱稱或ID）
    if (student_search) {
      const isNumeric = /^\d+$/.test(student_search)
      if (isNumeric) {
        // 數字搜尋：同時搜尋學生ID和暱稱
        queryBuilder.andWhere(
          '(student.id = :studentId OR student.nick_name LIKE :studentName)',
          { 
            studentId: parseInt(student_search),
            studentName: `%${student_search}%`
          }
        )
      } else {
        // 文字搜尋：僅搜尋暱稱
        queryBuilder.andWhere('student.nick_name LIKE :studentName', { 
          studentName: `%${student_search}%` 
        })
      }
    }

    // 排除已軟刪除的記錄
    queryBuilder.andWhere('reservation.deleted_at IS NULL')

    // 排序：按預約時間最新在前
    queryBuilder.orderBy('reservation.reserve_time', 'DESC')

    // 分頁
    const skip = (page - 1) * per_page
    queryBuilder.skip(skip).take(per_page)

    const [reservations, total] = await queryBuilder.getManyAndCount()

    // 轉換為回應格式
    const reservationList = reservations.map(reservation => 
      this.transformToTeacherReservationItem(reservation)
    )

    return {
      status: 'success',
      message: '預約列表查詢成功',
      data: {
        reservations: reservationList,
        pagination: {
          current_page: page,
          per_page,
          total,
          total_pages: Math.ceil(total / per_page)
        }
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
    // 使用統一的時間工具計算星期幾
    const weekday = TimeUtils.getUTCWeekday(date)

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

    // 使用統一的時間比較邏輯檢查是否有匹配的時段
    const hasMatchingSlot = availableSlots.some(slot => 
      TimeUtils.isTimeInRange(time, slot.start_time, slot.end_time)
    )

    if (!hasMatchingSlot) {
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
   * 解析預約日期時間（使用 UTC 避免時區問題）
   */
  private parseReserveDateTime(date: string, time: string): Date {
    return TimeUtils.dateTimeToUTC(date, time)
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
        MESSAGES.BUSINESS.RESERVATION_UNAUTHORIZED_ACCESS
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
        MESSAGES.BUSINESS.RESERVATION_CANCEL_TIME_LIMIT
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
      rejection_reason: reservation.rejection_reason,
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

  /**
   * 計算教師回應期限
   */
  private calculateResponseDeadline(reserveTime: Date): Date {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999) // 設定為明天的結束時間
    
    const responseDeadline = new Date(now)
    
    // 檢查是否為隔天預約
    if (reserveTime.getTime() <= tomorrow.getTime()) {
      // 隔天預約：12小時回應期限
      responseDeadline.setTime(now.getTime() + 12 * 60 * 60 * 1000)
    } else {
      // 其他預約：24小時回應期限
      responseDeadline.setTime(now.getTime() + 24 * 60 * 60 * 1000)
    }
    
    return responseDeadline
  }

  /**
   * 教師確認預約
   */
  async confirmReservation(reservationId: number, userId: number): Promise<ReservationDetail> {
    // 1. 先根據 userId 找到教師記錄
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })
    
    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ACCESS,
        '教師資料不存在',
        404
      )
    }

    const teacherId = teacher.id

    // 2. 查找預約
    const reservation = await this.getReservationById(reservationId)

    // 3. 驗證權限
    this.validateReservationAccess(reservation, teacherId, 'teacher')

    // 4. 檢查預約狀態
    if (reservation.teacher_status !== ReservationStatus.PENDING) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_STATUS_INVALID,
        '預約狀態無效，只有待確認的預約可以被確認',
        400
      )
    }

    // 4. 檢查是否超過回應期限
    const now = new Date()
    if (reservation.response_deadline && now > reservation.response_deadline) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_STATUS_INVALID,
        '預約已過期，無法確認',
        400
      )
    }

    // 5. 更新預約狀態
    reservation.teacher_status = ReservationStatus.RESERVED
    reservation.response_deadline = null // 清除回應期限

    const updatedReservation = await this.reservationRepository.save(reservation)

    // 6. 扣除學生課程堂數
    const purchase = await this.validateStudentPurchase(reservation.student_id, reservation.course_id)
    await this.updateUsedLessons(purchase.id, purchase.quantity_used + 1)

    return this.transformReservationToResponse(updatedReservation)
  }

  /**
   * 教師拒絕預約
   */
  async rejectReservation(reservationId: number, userId: number, reason?: string): Promise<ReservationDetail> {
    // 1. 先根據 userId 找到教師記錄
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })
    
    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_ACCESS,
        '教師資料不存在',
        404
      )
    }

    const teacherId = teacher.id

    // 2. 查找預約
    const reservation = await this.getReservationById(reservationId)

    // 3. 驗證權限
    this.validateReservationAccess(reservation, teacherId, 'teacher')

    // 4. 檢查預約狀態
    if (reservation.teacher_status !== ReservationStatus.PENDING) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_STATUS_INVALID,
        '預約狀態無效，只有待確認的預約可以被拒絕',
        400
      )
    }

    // 5. 更新預約狀態
    reservation.teacher_status = ReservationStatus.CANCELLED
    reservation.student_status = ReservationStatus.CANCELLED
    reservation.response_deadline = null // 清除回應期限
    reservation.rejection_reason = reason || null // 儲存拒絕原因

    const updatedReservation = await this.reservationRepository.save(reservation)

    // 5. 不需要退還課程堂數，因為創建預約時沒有扣除

    return this.transformReservationToResponse(updatedReservation)
  }

  /**
   * 取得時間範圍的開始和結束日期
   */
  private getDateRange(timeRange: string): { start: Date; end: Date } | null {
    const now = new Date()
    
    switch (timeRange) {
      case 'today': {
        const start = new Date(now)
        start.setHours(0, 0, 0, 0)
        const end = new Date(now)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
      case 'week': {
        const start = new Date(now)
        const dayOfWeek = start.getDay()
        const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // 週一開始
        start.setDate(diff)
        start.setHours(0, 0, 0, 0)
        
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        return { start, end }
      }
      case 'month': {
        const start = new Date(now.getFullYear(), now.getMonth(), 1)
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        return { start, end }
      }
      default:
        return null
    }
  }

  /**
   * 為查詢添加綜合狀態篩選條件
   */
  private addOverallStatusFilter(queryBuilder: any, status: string): void {
    switch (status) {
      case 'reserved':
        queryBuilder.andWhere(
          '(reservation.teacher_status = :teacherReserved AND reservation.student_status = :studentReserved)',
          { teacherReserved: 'reserved', studentReserved: 'reserved' }
        )
        break
      case 'completed':
        queryBuilder.andWhere(
          '(reservation.teacher_status = :teacherCompleted AND reservation.student_status = :studentCompleted)',
          { teacherCompleted: 'completed', studentCompleted: 'completed' }
        )
        break
      case 'cancelled':
        queryBuilder.andWhere(
          '(reservation.teacher_status = :teacherCancelled OR reservation.student_status = :studentCancelled)',
          { teacherCancelled: 'cancelled', studentCancelled: 'cancelled' }
        )
        break
    }
  }

  /**
   * 將預約實體轉換為教師預約查詢回應格式
   */
  private transformToTeacherReservationItem(reservation: any): TeacherReservationItem {
    const reserveTime = new Date(reservation.reserve_time)
    const SLOT_DURATION_MINUTES = 60 // 預設課程時長

    // 計算結束時間
    const endTime = new Date(reserveTime)
    endTime.setMinutes(endTime.getMinutes() + SLOT_DURATION_MINUTES)

    // 格式化時間
    const reserve_date = reserveTime.toISOString().split('T')[0] // YYYY-MM-DD
    const reserve_time_str = reserveTime.toTimeString().slice(0, 5) // HH:mm
    const reserve_start_time = reserve_time_str
    const reserve_end_time = endTime.toTimeString().slice(0, 5) // HH:mm

    // 綜合狀態邏輯
    let overall_status: 'pending' | 'reserved' | 'completed' | 'cancelled'
    if (reservation.teacher_status === 'cancelled' || reservation.student_status === 'cancelled') {
      overall_status = 'cancelled'
    } else if (reservation.teacher_status === 'pending') {
      overall_status = 'pending'
    } else if (reservation.teacher_status === 'completed' && reservation.student_status === 'completed') {
      overall_status = 'completed'
    } else {
      overall_status = 'reserved'
    }

    return {
      id: reservation.id,
      uuid: reservation.uuid,
      reserve_date,
      reserve_time: reserve_time_str,
      reserve_start_time,
      reserve_end_time,
      reserve_datetime: reservation.reserve_time.toISOString(),
      student: {
        id: reservation.student.id,
        nick_name: reservation.student.nick_name
      },
      course: {
        id: reservation.course.id,
        name: reservation.course.name
      },
      teacher_status: reservation.teacher_status,
      student_status: reservation.student_status,
      overall_status,
      created_at: reservation.created_at.toISOString(),
      updated_at: reservation.updated_at.toISOString(),
      response_deadline: reservation.response_deadline?.toISOString()
    }
  }
}

// 匯出服務實例
export const reservationService = new ReservationService()