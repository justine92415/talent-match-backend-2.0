import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { TeacherAvailableSlot } from '../entities/TeacherAvailableSlot'
import { NotFoundError, ValidationError } from '../middleware/errorHandler'

interface ScheduleSlot {
  weekday: number
  start_time: string
  end_time: string
  is_active?: boolean
}

export class TeacherScheduleService {
  /**
   * 取得教師時間表
   */
  static async getSchedule(userId: number): Promise<TeacherAvailableSlot[]> {
    const teacherRepository = dataSource.getRepository(Teacher)
    const slotRepository = dataSource.getRepository(TeacherAvailableSlot)

    // 檢查教師身份
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 取得時間設定
    const slots = await slotRepository.find({
      where: { teacher_id: teacher.id },
      order: { weekday: 'ASC', start_time: 'ASC' }
    })

    return slots
  }

  /**
   * 更新教師時間表
   */
  static async updateSchedule(userId: number, schedule: ScheduleSlot[]): Promise<TeacherAvailableSlot[]> {
    const teacherRepository = dataSource.getRepository(Teacher)
    const slotRepository = dataSource.getRepository(TeacherAvailableSlot)

    // 參數驗證
    this.validateSchedule(schedule)

    // 檢查教師身份
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 先刪除現有的時段設定
    await slotRepository.delete({ teacher_id: teacher.id })

    // 新增新的時段設定
    const newSlots = schedule.map((slot: ScheduleSlot) => ({
      teacher_id: teacher.id,
      weekday: slot.weekday,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_active: slot.is_active !== false // 預設為 true
    }))

    const savedSlots = await slotRepository.save(newSlots)
    return savedSlots
  }

  /**
   * 檢查時段衝突
   */
  static async checkTimeSlotConflicts(
    userId: number,
    weekday: number,
    start_time: string,
    end_time: string
  ): Promise<{ hasConflict: boolean; conflicts: TeacherAvailableSlot[] }> {
    const teacherRepository = dataSource.getRepository(Teacher)
    const slotRepository = dataSource.getRepository(TeacherAvailableSlot)

    // 參數驗證
    this.validateTimeSlotParams(weekday, start_time, end_time)

    // 檢查教師身份
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    // 檢查時段衝突
    const conflictingSlots = await slotRepository.find({
      where: {
        teacher_id: teacher.id,
        weekday: weekday,
        is_active: true
      }
    })

    // 檢查時間重疊
    const conflicts = conflictingSlots.filter(slot => {
      const slotStart = slot.start_time
      const slotEnd = slot.end_time

      // 檢查時間重疊：新時間的開始時間小於現有時間的結束時間 && 新時間的結束時間大於現有時間的開始時間
      return start_time < slotEnd && end_time > slotStart
    })

    return {
      hasConflict: conflicts.length > 0,
      conflicts
    }
  }

  /**
   * 驗證時間表資料
   */
  private static validateSchedule(schedule: ScheduleSlot[]): void {
    const errors: Record<string, string[]> = {}

    if (!schedule || !Array.isArray(schedule)) {
      errors.schedule = ['時段設定為必填欄位']
      throw new ValidationError(errors)
    }

    // 驗證每個時段
    schedule.forEach((slot, index) => {
      const slotErrors: string[] = []

      if (typeof slot.weekday !== 'number' || slot.weekday < 0 || slot.weekday > 6) {
        slotErrors.push('星期必須為 0-6 的數字')
      }

      if (!slot.start_time || typeof slot.start_time !== 'string') {
        slotErrors.push('開始時間為必填欄位')
      } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(slot.start_time)) {
        slotErrors.push('開始時間格式錯誤，請使用 HH:MM 格式')
      }

      if (!slot.end_time || typeof slot.end_time !== 'string') {
        slotErrors.push('結束時間為必填欄位')
      } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(slot.end_time)) {
        slotErrors.push('結束時間格式錯誤，請使用 HH:MM 格式')
      }

      if (slot.start_time && slot.end_time && slot.start_time >= slot.end_time) {
        slotErrors.push('結束時間必須晚於開始時間')
      }

      if (slotErrors.length > 0) {
        errors[`schedule[${index}]`] = slotErrors
      }
    })

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }
  }

  /**
   * 驗證時段查詢參數
   */
  private static validateTimeSlotParams(weekday: number, start_time: string, end_time: string): void {
    const errors: Record<string, string[]> = {}

    if (isNaN(weekday) || weekday < 0 || weekday > 6) {
      errors.weekday = ['星期必須為 0-6 的數字']
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(start_time)) {
      errors.start_time = ['開始時間格式錯誤，請使用 HH:MM 格式']
    }

    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(end_time)) {
      errors.end_time = ['結束時間格式錯誤，請使用 HH:MM 格式']
    }

    if (start_time && end_time && start_time >= end_time) {
      errors.time_range = ['結束時間必須晚於開始時間']
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }
  }
}
