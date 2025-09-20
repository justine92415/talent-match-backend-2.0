import { Request, Response, NextFunction } from 'express'
import { scheduleService } from '@services/ScheduleService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { SUCCESS, MESSAGES } from '@constants/Message'
import { ValidationError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import type {
  UpdateScheduleRequest,
  CheckConflictsRequest,
  WeeklyScheduleRequest,
  WeeklyScheduleResponse
} from '@models/index'

export class ScheduleController {
  /**
   * GET /api/teachers/schedule
   * 取得教師台灣週次時段設定
   */
  getSchedule = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId

    const result = await scheduleService.getWeeklyScheduleByUserId(userId)

    res.json(handleSuccess(result, SUCCESS.SCHEDULE_SETTINGS_GET_SUCCESS))
  })

  /**
   * PUT /api/teachers/schedule
   * 更新教師可預約時段設定 (台灣週次格式)
   */
  updateSchedule = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const requestData: WeeklyScheduleRequest = req.body

    const result = await scheduleService.updateWeeklyScheduleByUserId(userId, requestData)

    res.json(handleSuccess(result, SUCCESS.SCHEDULE_SETTINGS_UPDATE_SUCCESS))
  })

  /**
   * GET /api/teachers/schedule/conflicts
   * 檢查教師時段衝突
   */
  checkConflicts = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId

    // 處理查詢參數，參數驗證由中間件處理
    const queryParams: CheckConflictsRequest = {
      slot_ids: undefined,
      from_date: req.query.from_date as string,
      to_date: req.query.to_date as string
    }

    // 處理 slot_ids 參數
    if (req.query.slot_ids) {
      const slotIdsStr = String(req.query.slot_ids)
      // 驗證 slot_ids 是否為有效數字
      const slotIds = (req.query.slot_ids as string).split(',').map(id => {
        const parsed = parseInt(id.trim())
        if (isNaN(parsed)) {
          throw new ValidationError(
            ERROR_CODES.VALIDATION_FAILED, 
            MESSAGES.VALIDATION.INVALID_SLOT_IDS,
            { slot_ids: ['時段ID格式不正確，必須為數字格式'] }
          )
        }
        return parsed
      })
      queryParams.slot_ids = slotIds
    }

    const result = await scheduleService.checkConflictsByUserId(userId, queryParams)

    res.json(handleSuccess(result, SUCCESS.SCHEDULE_CONFLICT_CHECK_SUCCESS))
  })
}

export const scheduleController = new ScheduleController()