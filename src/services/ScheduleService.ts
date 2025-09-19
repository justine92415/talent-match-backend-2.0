import { dataSource } from '@db/data-source'
import { In } from 'typeorm'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { Reservation } from '@entities/Reservation'
import { Teacher } from '@entities/Teacher'
import { BusinessError, ValidationError } from '@utils/errors'
import { 
  TIME_FORMAT, 
  WEEKDAYS, 
  DATE_LIMITS, 
  SCHEDULE_ERRORS, 
  SCHEDULE_ERROR_CODES,
  WEEKLY_WEEKDAYS,
  STANDARD_SLOTS,
  SLOT_RULES
} from '@constants/schedule'
import type {
  GetScheduleResponse,
  UpdateScheduleRequest,
  UpdateScheduleResponse,
  CheckConflictsRequest,
  CheckConflictsResponse,
  AvailableSlotData,
  SlotValidationError,
  ConflictInfo,
  WeeklyScheduleRequest,
  WeeklyScheduleResponse,
  StandardSlot,
  WeekdayString,
  WeeklySlotValidationError
} from '@models/index'
import { ReservationStatus } from '@entities/enums'

export class ScheduleService {
  private teacherAvailableSlotRepo = dataSource.getRepository(TeacherAvailableSlot)
  private reservationRepo = dataSource.getRepository(Reservation)
  private teacherRepo = dataSource.getRepository(Teacher)

  /**
   * 格式化時間字串，將 "HH:MM:SS" 轉換為 "HH:MM"
   */
  private formatTime(timeString: string): string {
    if (!timeString) return timeString
    
    // 如果已經是 HH:MM 格式，直接回傳
    if (timeString.length === 5 && TIME_FORMAT.HH_MM.test(timeString)) {
      return timeString
    }
    
    // 如果是 HH:MM:SS 格式，截取前5個字元
    if (timeString.length === 8 && TIME_FORMAT.HH_MM_SS.test(timeString)) {
      return timeString.substring(0, 5)
    }
    
    // 如果是 H:MM 格式，補零
    if (timeString.length === 4 && TIME_FORMAT.H_MM.test(timeString)) {
      return '0' + timeString
    }
    
    return timeString
  }

  /**
   * 通過userId取得教師實體
   */
  private async getTeacherByUserId(userId: number): Promise<Teacher> {
    const teacher = await this.teacherRepo.findOne({
      where: { user_id: userId }
    })
    
    if (!teacher) {
      throw new BusinessError(
        SCHEDULE_ERROR_CODES.TEACHER_NOT_FOUND, 
        SCHEDULE_ERRORS.TEACHER_NOT_FOUND, 
        404
      )
    }

    return teacher
  }

  /**
   * 通過teacherId驗證教師實體
   */
  private async validateTeacher(teacherId: number): Promise<Teacher> {
    const teacher = await this.teacherRepo.findOne({
      where: { id: teacherId }
    })
    
    if (!teacher) {
      throw new BusinessError(
        SCHEDULE_ERROR_CODES.TEACHER_NOT_FOUND, 
        SCHEDULE_ERRORS.TEACHER_NOT_FOUND, 
        404
      )
    }

    return teacher
  }

  /**
   * 通過userId取得教師的可預約時段
   */
  async getScheduleByUserId(userId: number): Promise<GetScheduleResponse> {
    const teacher = await this.getTeacherByUserId(userId)
    return this.getSchedule(teacher.id)
  }

  /**
   * 通過userId更新教師的可預約時段
   */
  async updateScheduleByUserId(userId: number, data: UpdateScheduleRequest): Promise<UpdateScheduleResponse> {
    const teacher = await this.getTeacherByUserId(userId)
    return this.updateSchedule(teacher.id, data)
  }

  /**
   * 通過userId檢查時段衝突
   */
  async checkConflictsByUserId(userId: number, data?: CheckConflictsRequest): Promise<CheckConflictsResponse> {
    const teacher = await this.getTeacherByUserId(userId)
    return this.checkConflicts(teacher.id, data)
  }

  /**
   * 取得教師的可預約時段
   */
  async getSchedule(teacherId: number): Promise<GetScheduleResponse> {
    // 驗證教師是否存在
    await this.validateTeacher(teacherId)

    // 取得教師的可預約時段
    const availableSlots = await this.teacherAvailableSlotRepo.find({
      where: { teacher_id: teacherId },
      order: { weekday: 'ASC', start_time: 'ASC' }
    })

    // 格式化時間格式
    const formattedSlots = availableSlots.map(slot => ({
      ...slot,
      start_time: this.formatTime(slot.start_time),
      end_time: this.formatTime(slot.end_time)
    }))

    return {
      available_slots: formattedSlots,
      total_slots: availableSlots.length
    }
  }

  /**
   * 更新教師的可預約時段
   */
  async updateSchedule(teacherId: number, data: UpdateScheduleRequest): Promise<UpdateScheduleResponse> {
    // 驗證教師是否存在
    await this.validateTeacher(teacherId)

    // 驗證所有時段資料
    const validationErrors: SlotValidationError[] = []
    for (let i = 0; i < data.available_slots.length; i++) {
      const slotErrors = this.validateSlot(data.available_slots[i])
      slotErrors.forEach(error => {
        validationErrors.push({ ...error, slot_index: i })
      })
    }

    if (validationErrors.length > 0) {
      const errorMessages: Record<string, string[]> = {}
      validationErrors.forEach(error => {
        const key = `available_slots[${error.slot_index}].${error.field}`
        if (!errorMessages[key]) errorMessages[key] = []
        errorMessages[key].push(error.message)
      })
      
      throw new ValidationError(
        SCHEDULE_ERROR_CODES.VALIDATION_ERROR, 
        SCHEDULE_ERRORS.VALIDATION_FAILED, 
        errorMessages
      )
    }

    return await dataSource.transaction(async manager => {
      const slotRepo = manager.getRepository(TeacherAvailableSlot)
      
      // 刪除現有的時段
      const existingSlots = await slotRepo.find({
        where: { teacher_id: teacherId }
      })
      
      if (existingSlots.length > 0) {
        await slotRepo.remove(existingSlots)
      }

      // 建立新的時段
      const newSlots = []
      for (const slotData of data.available_slots) {
        const slot = slotRepo.create({
          teacher_id: teacherId,
          ...slotData
        })
        newSlots.push(slot)
      }

      const savedSlots = newSlots.length > 0 ? await slotRepo.save(newSlots) : []

      // 格式化時間格式
      const formattedSlots = savedSlots.map(slot => ({
        ...slot,
        start_time: this.formatTime(slot.start_time),
        end_time: this.formatTime(slot.end_time)
      }))

      return {
        available_slots: formattedSlots,
        updated_count: 0,
        created_count: savedSlots.length,
        deleted_count: existingSlots.length
      }
    })
  }

  /**
   * 建立預設日期範圍
   */
  private createDefaultDateRange(data?: CheckConflictsRequest): { fromDate: Date; toDate: Date } {
    const fromDate = data?.from_date ? new Date(data.from_date) : new Date()
    const toDate = data?.to_date 
      ? new Date(data.to_date) 
      : new Date(Date.now() + DATE_LIMITS.DEFAULT_FUTURE_DAYS * 24 * 60 * 60 * 1000)

    return { fromDate, toDate }
  }

  /**
   * 驗證日期範圍
   */
  private validateDateRange(fromDate: Date, toDate: Date): void {
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new ValidationError(
        SCHEDULE_ERROR_CODES.INVALID_DATE_FORMAT, 
        SCHEDULE_ERRORS.INVALID_DATE_FORMAT, 
        { date: ['日期格式必須為 YYYY-MM-DD'] }
      )
    }

    if (fromDate >= toDate) {
      throw new ValidationError(
        SCHEDULE_ERROR_CODES.INVALID_DATE_RANGE, 
        SCHEDULE_ERRORS.INVALID_DATE_RANGE, 
        { date: ['結束日期必須晚於開始日期'] }
      )
    }
  }

  /**
   * 檢查時段衝突
   */
  async checkConflicts(teacherId: number, data?: CheckConflictsRequest): Promise<CheckConflictsResponse> {
    // 設定預設檢查時間範圍
    const { fromDate, toDate } = this.createDefaultDateRange(data)

    // 驗證日期格式和邏輯
    this.validateDateRange(fromDate, toDate)

    // 同時取得教師資訊和可預約時段，提高效能
    const teacherPromise = this.teacherRepo.findOne({
      where: { id: teacherId }
    })

    // 設定時段查詢條件
    const slotCondition: { teacher_id: number; id?: ReturnType<typeof In> } = { teacher_id: teacherId }
    if (data?.slot_ids && data.slot_ids.length > 0) {
      slotCondition.id = In(data.slot_ids)
    }

    const slotsPromise = this.teacherAvailableSlotRepo.find({
      where: slotCondition
    })

    // 取得時間範圍內的預約
    const reservationsPromise = this.reservationRepo
      .createQueryBuilder('reservation')
      .where('reservation.teacher_id = :teacherId', { teacherId })
      .andWhere('reservation.reserve_time >= :fromDate', { fromDate })
      .andWhere('reservation.reserve_time <= :toDate', { toDate })
      .andWhere('reservation.teacher_status IN (:...statuses)', { 
        statuses: [ReservationStatus.RESERVED, ReservationStatus.COMPLETED] 
      })
      .getMany()

    // 並行執行所有查詢，提高效能
    const [teacher, availableSlots, reservations] = await Promise.all([
      teacherPromise,
      slotsPromise,
      reservationsPromise
    ])

    // 驗證教師是否存在
    if (!teacher) {
      throw new BusinessError(
        SCHEDULE_ERROR_CODES.TEACHER_NOT_FOUND, 
        SCHEDULE_ERRORS.TEACHER_NOT_FOUND, 
        404
      )
    }

    // 檢查衝突
    const conflicts: ConflictInfo[] = this.detectConflicts(availableSlots, reservations)

    return {
      has_conflicts: conflicts.length > 0,
      conflicts,
      total_conflicts: conflicts.length,
      check_period: {
        from_date: fromDate.toISOString().split('T')[0],
        to_date: toDate.toISOString().split('T')[0]
      }
    }
  }

  /**
   * 檢測衝突邏輯
   */
  private detectConflicts(
    availableSlots: TeacherAvailableSlot[], 
    reservations: Reservation[]
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = []

    for (const reservation of reservations) {
      const reserveTime = new Date(reservation.reserve_time)
      // 使用 UTC 時間進行衝突檢測，確保時區一致性
      const reserveWeekday = reserveTime.getUTCDay()
      const reserveHour = reserveTime.getUTCHours()
      const reserveMinute = reserveTime.getUTCMinutes()
      const reserveTimeStr = `${reserveHour.toString().padStart(2, '0')}:${reserveMinute.toString().padStart(2, '0')}`

      // 找到可能衝突的時段
      for (const slot of availableSlots) {
        if (slot.weekday === reserveWeekday) {
          // 解析時段時間
          const [slotStartHour, slotStartMinute] = slot.start_time.split(':').map(Number)
          const [slotEndHour, slotEndMinute] = slot.end_time.split(':').map(Number)
          
          const slotStartTotalMinutes = slotStartHour * 60 + slotStartMinute
          const slotEndTotalMinutes = slotEndHour * 60 + slotEndMinute
          const reserveTotalMinutes = reserveHour * 60 + reserveMinute
          
          // 檢查預約時間是否在可預約時段內
          if (reserveTotalMinutes >= slotStartTotalMinutes && reserveTotalMinutes < slotEndTotalMinutes) {
            conflicts.push({
              slot_id: slot.id,
              reservation_id: reservation.id,
              reserve_time: reservation.reserve_time,
              student_id: reservation.student_id,
              reason: `預約時間 ${reserveTimeStr} 與可預約時段 ${slot.start_time}-${slot.end_time} 產生時段衝突`
            })
          }
        }
      }
    }

    return conflicts
  }

  /**
   * 驗證時段資料
   */
  validateSlot(slot: AvailableSlotData): SlotValidationError[] {
    const errors: SlotValidationError[] = []

    // 驗證星期
    if (slot.weekday === undefined || slot.weekday === null) {
      errors.push({
        field: 'weekday',
        message: SCHEDULE_ERRORS.WEEKDAY_REQUIRED
      })
    } else if (typeof slot.weekday !== 'number' || slot.weekday < WEEKDAYS.MIN || slot.weekday > WEEKDAYS.MAX) {
      errors.push({
        field: 'weekday',
        message: SCHEDULE_ERRORS.WEEKDAY_INVALID
      })
    }

    // 驗證開始時間
    if (!slot.start_time) {
      errors.push({
        field: 'start_time',
        message: SCHEDULE_ERRORS.START_TIME_REQUIRED
      })
    } else if (!this.validateTimeFormat(slot.start_time)) {
      errors.push({
        field: 'start_time',
        message: SCHEDULE_ERRORS.INVALID_TIME_FORMAT
      })
    }

    // 驗證結束時間
    if (!slot.end_time) {
      errors.push({
        field: 'end_time',
        message: SCHEDULE_ERRORS.END_TIME_REQUIRED
      })
    } else if (!this.validateTimeFormat(slot.end_time)) {
      errors.push({
        field: 'end_time',
        message: SCHEDULE_ERRORS.INVALID_TIME_FORMAT
      })
    }

    // 驗證時間邏輯
    if (slot.start_time && slot.end_time && this.validateTimeFormat(slot.start_time) && this.validateTimeFormat(slot.end_time)) {
      if (!this.validateTimeLogic(slot.start_time, slot.end_time)) {
        errors.push({
          field: 'end_time',
          message: SCHEDULE_ERRORS.TIME_LOGIC_ERROR
        })
      }
    }

    return errors
  }

  /**
   * 檢查時間格式
   */
  validateTimeFormat(time: string): boolean {
    return TIME_FORMAT.VALIDATION_PATTERN.test(time)
  }

  /**
   * 檢查時間邏輯
   */
  validateTimeLogic(startTime: string, endTime: string): boolean {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    return endMinutes > startMinutes
  }

  // ==================== 台灣週次時段系統方法 ====================

  /**
   * 通過userId更新教師的台灣週次時段設定
   */

  /**
   * 更新教師的台灣週次時段設定
   */
  async updateWeeklySchedule(teacherId: number, data: WeeklyScheduleRequest): Promise<WeeklyScheduleResponse> {
    // 驗證教師是否存在
    await this.validateTeacher(teacherId)

    // 驗證週次時段資料
    const validationErrors: SlotValidationError[] = []
    
    // 基本格式驗證
    if (!data.weekly_schedule || typeof data.weekly_schedule !== 'object') {
      validationErrors.push({
        field: 'weekly_schedule',
        message: SCHEDULE_ERRORS.WEEKLY_SCHEDULE_REQUIRED
      })
    } else {
      // 驗證每個週次的時段
      for (const [weekDay, timeSlots] of Object.entries(data.weekly_schedule)) {
        if (!SLOT_RULES.VALID_WEEK_DAYS.includes(weekDay as WeekdayString)) {
          validationErrors.push({
            field: `weekly_schedule.${weekDay}`,
            message: SCHEDULE_ERRORS.WEEKLY_WEEKDAY_INVALID
          })
          continue
        }
        
        if (!Array.isArray(timeSlots)) continue
        
        // 檢查時段有效性
        const uniqueSlots = new Set()
        for (const timeSlot of timeSlots) {
          if (uniqueSlots.has(timeSlot)) {
            validationErrors.push({
              field: `weekly_schedule.${weekDay}`,
              message: `${weekDay}有重複的時段: ${timeSlot}`
            })
          } else {
            uniqueSlots.add(timeSlot)
          }
          
          if (!STANDARD_SLOTS.includes(timeSlot)) {
            validationErrors.push({
              field: `weekly_schedule.${weekDay}`,
              message: `無效的時段: ${timeSlot}，必須為標準時段`
            })
          }
        }
      }
    }
    if (validationErrors.length > 0) {
      const errorMessages: Record<string, string[]> = {}
      validationErrors.forEach(error => {
        const key = error.field || 'weekly_schedule'
        if (!errorMessages[key]) errorMessages[key] = []
        errorMessages[key].push(error.message)
      })
      
      throw new ValidationError(
        SCHEDULE_ERROR_CODES.VALIDATION_ERROR,
        SCHEDULE_ERRORS.VALIDATION_FAILED,
        errorMessages
      )
    }

    return await dataSource.transaction(async manager => {
      const slotRepo = manager.getRepository(TeacherAvailableSlot)
      
      // 刪除現有的時段
      const existingSlots = await slotRepo.find({
        where: { teacher_id: teacherId }
      })
      
      let deletedCount = 0
      if (existingSlots.length > 0) {
        await slotRepo.remove(existingSlots)
        deletedCount = existingSlots.length
      }

      // 轉換台灣週次時段為資料庫格式並建立新時段
      const newSlots = this.convertScheduleToSlots(teacherId, data.weekly_schedule)
      const savedSlots = newSlots.length > 0 ? await slotRepo.save(newSlots) : []

      // 統計資料
      const weeklySchedule = this.convertSlotsToSchedule(savedSlots)
      const slotsByDay = this.calculateSlotsByDay(weeklySchedule)
      const totalSlots = Object.values(slotsByDay).reduce((sum, count) => (sum || 0) + (count || 0), 0)

      return {
        weekly_schedule: weeklySchedule,
        total_slots: totalSlots,
        slots_by_day: slotsByDay,
        updated_count: 0, // 全部重建，所以沒有更新
        created_count: savedSlots.length,
        deleted_count: deletedCount
      }
    })
  }

  /**
   * 通過userId取得教師的台灣週次時段設定
   */
  async getWeeklyScheduleByUserId(userId: number): Promise<WeeklyScheduleResponse> {
    const teacher = await this.getTeacherByUserId(userId)
    return this.getWeeklySchedule(teacher.id)
  }

  /**
   * 通過userId更新教師的週次時段設定
   */
  async updateWeeklyScheduleByUserId(userId: number, data: WeeklyScheduleRequest): Promise<WeeklyScheduleResponse> {
    const teacher = await this.getTeacherByUserId(userId)
    return this.updateWeeklySchedule(teacher.id, data)
  }

  /**
   * 取得教師的週次時段設定
   */
  async getWeeklySchedule(teacherId: number): Promise<WeeklyScheduleResponse> {
    // 驗證教師是否存在
    await this.validateTeacher(teacherId)

    // 取得時段資料
    const slots = await this.teacherAvailableSlotRepo.find({
      where: { teacher_id: teacherId },
      order: {
        weekday: 'ASC',
        start_time: 'ASC'
      }
    })

    // 轉換為台灣週次格式
    const weeklySchedule = this.convertSlotsToSchedule(slots)
    const slotsByDay = this.calculateSlotsByDay(weeklySchedule)
    const totalSlots = Object.values(slotsByDay).reduce((sum, count) => (sum || 0) + (count || 0), 0)

    return {
      weekly_schedule: weeklySchedule,
      total_slots: totalSlots,
      slots_by_day: slotsByDay,
      updated_count: 0,
      created_count: 0,
      deleted_count: 0
    }
  }

  /**
   * 驗證週次時段資料
   */
  private validateWeeklySchedule(weeklySchedule: { [key: string]: StandardSlot[] }): WeeklySlotValidationError[] {
    const errors: WeeklySlotValidationError[] = []

    for (const [weekDay, timeSlots] of Object.entries(weeklySchedule)) {
      // 驗證週次
      if (!SLOT_RULES.VALID_WEEK_DAYS.includes(weekDay as WeekdayString)) {
        errors.push({
          week_day: weekDay as WeekdayString,
          error_type: 'INVALID_WEEK_DAY',
          message: SCHEDULE_ERRORS.WEEKLY_WEEKDAY_INVALID
        })
        continue
      }

      if (!Array.isArray(timeSlots)) continue

      // 檢查重複時段
      const uniqueSlots = new Set()
      for (const timeSlot of timeSlots) {
        if (uniqueSlots.has(timeSlot)) {
          errors.push({
            week_day: weekDay as WeekdayString,
            time_slot: timeSlot,
            error_type: 'DUPLICATE_TIME_SLOT',
            message: SCHEDULE_ERRORS.DUPLICATE_TIME_SLOT
          })
        }
        uniqueSlots.add(timeSlot)

        // 驗證時間是否為標準時段
        if (!STANDARD_SLOTS.includes(timeSlot)) {
          errors.push({
            week_day: weekDay as WeekdayString,
            time_slot: timeSlot,
            error_type: 'INVALID_TIME_SLOT',
            message: SCHEDULE_ERRORS.INVALID_TIME_SLOT
          })
        }
      }
    }

    return errors
  }

  /**
   * 將週次時段轉換為資料庫時段格式
   */
  private convertScheduleToSlots(teacherId: number, weeklySchedule: { [key: string]: StandardSlot[] }): TeacherAvailableSlot[] {
    const slots: TeacherAvailableSlot[] = []

    for (const [weekDayStr, timeSlots] of Object.entries(weeklySchedule)) {
      const weekDay = parseInt(weekDayStr) // 週次 1-7
      const legacyWeekday = weekDay === 7 ? 0 : weekDay // 轉換為傳統格式 (週日=0)

      for (const timeSlot of timeSlots) {
        // 計算結束時間（+1小時）
        const [hour, minute] = timeSlot.split(':').map(Number)
        const endHour = hour + 1
        const endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

        const slot = this.teacherAvailableSlotRepo.create({
          teacher_id: teacherId,
          weekday: legacyWeekday,
          start_time: timeSlot,
          end_time: endTime,
          is_active: true
        })
        slots.push(slot)
      }
    }

    return slots
  }

  /**
   * 將資料庫時段格式轉換為週次時段
   */
  private convertSlotsToSchedule(slots: TeacherAvailableSlot[]): { [K in WeekdayString]?: StandardSlot[] } {
    const schedule: { [K in WeekdayString]?: StandardSlot[] } = {}

    for (const slot of slots) {
      // 轉換傳統週次為週次格式
      const weekday = slot.weekday === 0 ? 7 : slot.weekday // 週日=0 → 週日=7
      const weekDayStr = weekday.toString() as WeekdayString

      // 格式化時間
      const startTime = this.formatTime(slot.start_time) as StandardSlot

      if (!schedule[weekDayStr]) {
        schedule[weekDayStr] = []
      }
      schedule[weekDayStr]!.push(startTime)
    }

    // 排序每天的時段
    for (const timeSlots of Object.values(schedule)) {
      if (timeSlots) {
        timeSlots.sort()
      }
    }

    return schedule
  }

  /**
   * 計算各天的時段數量
   */
  private calculateSlotsByDay(weeklySchedule: { [K in WeekdayString]?: StandardSlot[] }): { [K in WeekdayString]?: number } {
    const slotsByDay: { [K in WeekdayString]?: number } = {}

    for (const [weekDay, timeSlots] of Object.entries(weeklySchedule)) {
      slotsByDay[weekDay as WeekdayString] = timeSlots?.length || 0
    }

    return slotsByDay
  }
}

export const scheduleService = new ScheduleService()