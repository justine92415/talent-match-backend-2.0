import { Request, Response, NextFunction } from 'express'

/**
 * 控制器方法包裝器，自動處理異常並轉發到錯誤處理中間件
 * @param fn 控制器方法
 * @returns 包裝後的控制器方法
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
