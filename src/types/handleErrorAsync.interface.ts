import { Request, Response, NextFunction } from 'express';

/**
 * 異步控制器函式類型定義
 */
export type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;