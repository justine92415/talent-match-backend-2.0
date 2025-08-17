import { Router } from 'express'
import authRoutes from '@routes/authRoutes'
import teacherRoutes from '@routes/teacherRoutes'
import courseRoutes from '@routes/courseRoutes'
import priceOptionRoutes from '@routes/priceOptionRoutes'
import videoRoutes from '@routes/videoRoutes'

const router = Router()

// 掛載認證相關路由
router.use('/auth', authRoutes)

// 掛載教師相關路由
router.use('/teachers', teacherRoutes)

// 掛載課程相關路由
router.use('/courses', courseRoutes)

// 掛載課程價格方案相關路由
router.use('/courses', priceOptionRoutes)

// 掛載影片管理相關路由
router.use('/videos', videoRoutes)

export default router
