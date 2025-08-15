import { Router } from 'express'
import authRoutes from './authRoutes'

const router = Router()

// 掛載認證相關路由
router.use('/auth', authRoutes)

export default router
