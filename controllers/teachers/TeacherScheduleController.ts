import { Request, Response } from 'express'
import { ResponseHelper } from '../../utils/responseHelper'
import { ValidationError } from '../../middleware/errorHandler'
import { dataSource } from '../../db/data-source'
import { Teacher } from '../../entities/Teacher'
import { TeacherAvailableSlot } from '../../entities/TeacherAvailableSlot'

interface TimeSlot {
  weekday: number
  start_time: string
  end_time: string
}

export class TeacherScheduleController {
  /**
   * 查看可預約時段設定
   */
  static async getSchedule(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res, '請先登入')
        return
      }

      // 驗證教師身份
      const teacherRepository = dataSource.getRepository(Teacher)
      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        ResponseHelper.forbidden(res, '查看', '時段設定')
        return
      }

      const slotRepository = dataSource.getRepository(TeacherAvailableSlot)
      const slots = await slotRepository.find({
        where: { teacher_id: teacher.id },
        order: { weekday: 'ASC', start_time: 'ASC' }
      })

      ResponseHelper.success(res, '查詢成功', { schedule: slots })
    } catch (error) {
      console.error('Get schedule error:', error)
      ResponseHelper.serverError(res)
    }
  }

  /**
   * 更新可預約時段設定
   */
  static async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res, '請先登入')
        return
      }

      const { schedule } = req.body

      // 驗證參數
      const errors: Record<string, string[]> = {}

      if (!schedule || !Array.isArray(schedule)) {
        errors.schedule = ['時段設定為必填欄位']
      } else {
        schedule.forEach((slot: TimeSlot, index: number) => {
          const prefix = `schedule[${index}]`

          if (!Number.isInteger(slot.weekday) || slot.weekday < 0 || slot.weekday > 6) {
            errors[`${prefix}.weekday`] = ['星期必須是0-6的整數']
          }

          if (!slot.start_time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(slot.start_time)) {
            errors[`${prefix}.start_time`] = ['開始時間格式錯誤（必須是HH:mm）']
          }

          if (!slot.end_time || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(slot.end_time)) {
            errors[`${prefix}.end_time`] = ['結束時間格式錯誤（必須是HH:mm）']
          }

          if (slot.start_time && slot.end_time && slot.start_time >= slot.end_time) {
            errors[`${prefix}.time_range`] = ['開始時間必須早於結束時間']
          }
        })
      }

      if (Object.keys(errors).length > 0) {
        throw new ValidationError(errors)
      }

      // 驗證教師身份
      const teacherRepository = dataSource.getRepository(Teacher)
      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        ResponseHelper.forbidden(res, '修改', '時段設定')
        return
      }

      const slotRepository = dataSource.getRepository(TeacherAvailableSlot)

      // 刪除所有現有時段
      await slotRepository.delete({ teacher_id: teacher.id })

      // 建立新的時段
      const newSlots = schedule.map((slot: TimeSlot) => {
        const newSlot = new TeacherAvailableSlot()
        newSlot.teacher_id = teacher.id
        newSlot.weekday = slot.weekday
        newSlot.start_time = slot.start_time
        newSlot.end_time = slot.end_time
        newSlot.is_active = true // 預設啟用
        newSlot.created_at = new Date()
        newSlot.updated_at = new Date()
        return newSlot
      })

      await slotRepository.save(newSlots)

      // 查詢更新後的時段
      const updatedSlots = await slotRepository.find({
        where: { teacher_id: teacher.id },
        order: { weekday: 'ASC', start_time: 'ASC' }
      })

      ResponseHelper.success(res, '更新時間表成功', { schedule: updatedSlots })
    } catch (error) {
      if (error instanceof ValidationError) {
        ResponseHelper.validationError(res, error.errors)
      } else {
        console.error('Update schedule error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 檢查時段衝突（透過查詢參數）
   */
  static async checkTimeSlotConflicts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res, '請先登入')
        return
      }

      const { weekday, start_time, end_time } = req.query

      // 驗證查詢參數
      const errors: Record<string, string[]> = {}

      if (!weekday) {
        errors.weekday = ['星期為必填參數']
      } else if (!/^[0-6]$/.test(weekday as string)) {
        errors.weekday = ['星期必須是0-6的整數']
      }

      if (!start_time) {
        errors.start_time = ['開始時間為必填參數']
      } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(start_time as string)) {
        errors.start_time = ['開始時間格式錯誤（必須是HH:mm）']
      }

      if (!end_time) {
        errors.end_time = ['結束時間為必填參數']
      } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(end_time as string)) {
        errors.end_time = ['結束時間格式錯誤（必須是HH:mm）']
      }

      if (start_time && end_time && start_time >= end_time) {
        errors.time_range = ['開始時間必須早於結束時間']
      }

      if (Object.keys(errors).length > 0) {
        throw new ValidationError(errors)
      }

      // 驗證教師身份
      const teacherRepository = dataSource.getRepository(Teacher)
      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        ResponseHelper.forbidden(res, '檢查', '時段設定')
        return
      }

      // 檢查是否與現有時段衝突
      const slotRepository = dataSource.getRepository(TeacherAvailableSlot)
      const existingSlots = await slotRepository.find({
        where: {
          teacher_id: teacher.id,
          weekday: parseInt(weekday as string),
          is_active: true
        }
      })

      let hasConflict = false
      const conflicts: any[] = []

      for (const slot of existingSlots) {
        const slotStart = slot.start_time
        const slotEnd = slot.end_time
        const queryStart = start_time as string
        const queryEnd = end_time as string

        // 檢查時間重疊
        if (queryStart < slotEnd && queryEnd > slotStart) {
          hasConflict = true
          conflicts.push({
            weekday: slot.weekday,
            start_time: slotStart,
            end_time: slotEnd,
            conflicting_reservations: 0 // 這裡可以擴展來檢查實際預約
          })
        }
      }

      ResponseHelper.success(res, '檢查完成', {
        has_conflict: hasConflict,
        conflicts
      })
    } catch (error) {
      if (error instanceof ValidationError) {
        ResponseHelper.validationError(res, error.errors)
      } else {
        console.error('Check time slot conflicts error:', error)
        ResponseHelper.serverError(res)
      }
    }
  }

  /**
   * 檢查時段衝突（透過 POST body）
   */
  static async checkConflicts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        ResponseHelper.unauthorized(res, '請先登入')
        return
      }

      const { schedule } = req.body

      if (!schedule || !Array.isArray(schedule)) {
        ResponseHelper.error(res, '時段設定為必填欄位')
        return
      }

      // 驗證教師身份
      const teacherRepository = dataSource.getRepository(Teacher)
      const teacher = await teacherRepository.findOne({
        where: { user_id: userId }
      })

      if (!teacher) {
        ResponseHelper.forbidden(res, '檢查', '時段設定')
        return
      }

      // 檢查時段內部衝突
      const conflicts: string[] = []

      for (let i = 0; i < schedule.length; i++) {
        for (let j = i + 1; j < schedule.length; j++) {
          const slot1 = schedule[i]
          const slot2 = schedule[j]

          // 同一天的時段檢查
          if (slot1.weekday === slot2.weekday) {
            const start1 = slot1.start_time
            const end1 = slot1.end_time
            const start2 = slot2.start_time
            const end2 = slot2.end_time

            // 檢查時間重疊
            if ((start1 < end2 && end1 > start2) || (start2 < end1 && end2 > start1)) {
              conflicts.push(`星期${slot1.weekday} ${start1}-${end1} 與 ${start2}-${end2} 時段重疊`)
            }
          }
        }
      }

      ResponseHelper.success(res, '檢查完成', {
        has_conflicts: conflicts.length > 0,
        conflicts
      })
    } catch (error) {
      console.error('Check conflicts error:', error)
      ResponseHelper.serverError(res)
    }
  }
}
