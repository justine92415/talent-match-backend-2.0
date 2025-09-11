import { Request, Response, NextFunction } from 'express'
import { isFirebaseConfigured } from '../config/firebase'

export const checkFirebaseConfig = (req: Request, res: Response, next: NextFunction) => {
  if (!isFirebaseConfigured()) {
    return res.status(503).json({
      success: false,
      message: 'Firebase service is not available. File upload feature is disabled.',
      error: 'SERVICE_UNAVAILABLE'
    })
  }
  
  next()
}