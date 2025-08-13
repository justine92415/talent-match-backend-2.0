import { Request, Response, NextFunction } from 'express'
import { ResponseHelper } from '../utils/responseHelper'

/**
 * 通用驗證中間件
 */
export class ValidationMiddleware {
  /**
   * 驗證路徑參數 ID
   */
  static validateId(paramName = 'id') {
    return (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params[paramName])

      if (isNaN(id) || id <= 0) {
        ResponseHelper.error(res, `無效的${paramName}參數`)
        return
      }

      // 將驗證後的 ID 附加到 request
      req.validatedId = id
      next()
    }
  }

  /**
   * 驗證必填欄位
   */
  static validateRequiredFields(fields: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: Record<string, string[]> = {}

      fields.forEach(field => {
        if (!req.body[field] || (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
          errors[field] = [`${field}為必填欄位`]
        }
      })

      if (Object.keys(errors).length > 0) {
        ResponseHelper.validationError(res, errors)
        return
      }

      next()
    }
  }

  /**
   * 驗證年份和月份
   */
  static validateDateFields() {
    return (req: Request, res: Response, next: NextFunction) => {
      const errors: Record<string, string[]> = {}
      const { start_year, start_month, end_year, end_month } = req.body

      // 驗證開始年份
      if (start_year !== undefined) {
        if (!Number.isInteger(start_year) || start_year < 1900 || start_year > new Date().getFullYear()) {
          errors.start_year = ['開始年份必須為有效的年份']
        }
      }

      // 驗證開始月份
      if (start_month !== undefined) {
        if (!Number.isInteger(start_month) || start_month < 1 || start_month > 12) {
          errors.start_month = ['開始月份必須為 1-12 之間的數字']
        }
      }

      // 驗證結束年份
      if (end_year !== undefined && end_year !== null) {
        if (!Number.isInteger(end_year) || end_year < 1900 || end_year > new Date().getFullYear()) {
          errors.end_year = ['結束年份必須為有效的年份']
        }
      }

      // 驗證結束月份
      if (end_month !== undefined && end_month !== null) {
        if (!Number.isInteger(end_month) || end_month < 1 || end_month > 12) {
          errors.end_month = ['結束月份必須為 1-12 之間的數字']
        }
      }

      // 驗證結束時間不能早於開始時間
      if (start_year && start_month && end_year && end_month) {
        const startDate = new Date(start_year, start_month - 1)
        const endDate = new Date(end_year, end_month - 1)

        if (endDate <= startDate) {
          errors.end_date = ['結束時間不能早於或等於開始時間']
        }
      }

      if (Object.keys(errors).length > 0) {
        ResponseHelper.validationError(res, errors)
        return
      }

      next()
    }
  }
}

// 擴展 Request 類型
declare global {
  namespace Express {
    interface Request {
      validatedId?: number
    }
  }
}
