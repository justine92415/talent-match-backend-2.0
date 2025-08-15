import { Router } from 'express'
import authRoutes from './authRoutes'
import teacherRoutes from './teacherRoutes'

const router = Router()

// 掛載認證相關路由
router.use('/auth', authRoutes)

// 掛載教師相關路由
router.use('/teachers', teacherRoutes)

export default router
