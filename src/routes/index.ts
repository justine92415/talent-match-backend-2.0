import { Router } from 'express'
import authRoutes from '@routes/authRoutes'
import teacherRoutes from '@routes/teacherRoutes'

const router = Router()

// 掛載認證相關路由
router.use('/auth', authRoutes)

// 掛載教師相關路由
router.use('/teachers', teacherRoutes)

export default router
