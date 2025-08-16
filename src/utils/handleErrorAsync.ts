import { Request, Response, NextFunction } from 'express';
import { AsyncFunction } from '@src/types/handleErrorAsync.interface';

/**
 * 統一的異步錯誤處理包裝器
 * 
 * 用於包裝控制器方法，自動捕獲異步錯誤並傳遞給錯誤處理中間件
 * 替代手動撰寫 try...catch 語法
 * 
 * @param func 異步控制器函式
 * @returns 包裝後的函式，會自動處理錯誤
 * 
 * @example
 * ```typescript
 * // 使用前 (需要手動 try...catch)
 * async register(req: Request, res: Response, next: NextFunction) {
 *   try {
 *     const result = await authService.register(req.body);
 *     res.json({ data: result });
 *   } catch (error) {
 *     next(error);
 *   }
 * }
 * 
 * // 使用後 (自動錯誤處理)
 * register = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
 *   const result = await authService.register(req.body);
 *   res.json({ data: result });
 * });
 * ```
 */
const handleErrorAsync = (func: AsyncFunction) => {
  return function (req: Request, res: Response, next: NextFunction) {
    func(req, res, next).catch((error) => next(error));
  };
};

export default handleErrorAsync;