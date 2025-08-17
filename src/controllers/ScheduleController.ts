import type { Request, Response, NextFunction } from 'express'
import { scheduleService } from '@services/scheduleService'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import type {
  UpdateScheduleRequest,
  CheckConflictsRequest
} from '@models/index'

export class ScheduleController {
  /**
   * GET /api/teachers/schedule
   * 取得教師可預約時段設定
   */
  getSchedule = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId

    const result = await scheduleService.getScheduleByUserId(userId)

    res.json(handleSuccess(result, '取得教師時段設定成功'))
  })

  /**
   * PUT /api/teachers/schedule
   * 更新教師可預約時段設定
   */
  updateSchedule = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.userId
    const requestData: UpdateScheduleRequest = req.body

    const result = await scheduleService.updateScheduleByUserId(userId, requestData)

    res.json(handleSuccess(result, '教師時段設定更新成功'))
  })

  /**
   * GET /api/teachers/schedule/conflicts
   * 檢查教師時段衝突
   */
  checkConflicts = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: '使用者ID不存在'
      })
      return
    }

    // 處理查詢參數，特別是 slot_ids
    const queryParams: CheckConflictsRequest = {
      slot_ids: undefined,
      from_date: req.query.from_date as string,
      to_date: req.query.to_date as string
    }

    // 安全處理 slot_ids 參數
    if (req.query.slot_ids) {
      const slotIdsStr = String(req.query.slot_ids)
      try {
        // 檢查格式是否正確（數字用逗號分隔）
        if (!/^(\d+)(,\d+)*$/.test(slotIdsStr)) {
          res.status(400).json({
            status: 'error',
            message: '參數驗證失敗',
            errors: {
              slot_ids: ['slot_ids 格式錯誤，應為以逗號分隔的數字，如：1,2,3']
            }
          })
          return
        }
        
        queryParams.slot_ids = slotIdsStr.split(',').map(id => {
          const num = parseInt(id.trim(), 10)
          if (isNaN(num) || num <= 0) {
            throw new Error('無效的時段ID')
          }
          return num
        })
      } catch (error) {
        res.status(400).json({
          status: 'error',
          message: '參數驗證失敗',
          errors: {
            slot_ids: ['slot_ids 包含無效的數字']
          }
        })
        return
      }
    }

    const result = await scheduleService.checkConflictsByUserId(userId, queryParams)

    res.json(handleSuccess(result, '時段衝突檢查完成'))
  })
}

export const scheduleController = new ScheduleController()