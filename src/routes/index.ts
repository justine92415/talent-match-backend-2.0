import { Router } from 'express'
import authRoutes from '@routes/authRoutes'
import adminRoutes from '@routes/adminRoutes'
import teacherRoutes from '@routes/teacherRoutes'
import teacherDashboardRoutes from '@routes/teacherDashboardRoutes'
import courseRoutes from '@routes/courseRoutes'
import publicCourseRoutes from '@routes/publicCourseRoutes'
import publicTeacherRoutes from '@routes/publicTeacherRoutes'
import reviewRoutes from '@routes/reviewRoutes'
import favoriteRoutes from '@routes/favoriteRoutes'
import priceOptionRoutes from '@routes/priceOptionRoutes'
import videoRoutes from '@routes/videoRoutes'
import cartRoutes from '@routes/cartRoutes'
import orderRoutes from '@routes/orderRoutes'
import purchaseRoutes from '@routes/purchaseRoutes'
import reservationRoutes from '@routes/reservationRoutes'

const router = Router()

// 掛載認證相關路由
router.use('/auth', authRoutes)

// 掛載管理員相關路由
router.use('/admin', adminRoutes)

// 掛載教師相關路由
router.use('/teachers', teacherRoutes)

// 掛載教師後台管理路由
router.use('/teacher-dashboard', teacherDashboardRoutes)

// 掛載公開教師路由（必須在 teacherRoutes 之前避免衝突）
router.use('/teachers', publicTeacherRoutes)

// 掛載公開課程瀏覽路由（必須在 courseRoutes 之前，避免路由衝突）
router.use('/courses', publicCourseRoutes)

// 掛載評價相關路由
router.use('/reviews', reviewRoutes)

// 掛載課程相關路由
router.use('/courses', courseRoutes)

// 掛載收藏功能路由  
router.use('/favorites', favoriteRoutes)

// 掛載課程價格方案相關路由
router.use('/courses', priceOptionRoutes)

// 掛載影片管理相關路由
router.use('/videos', videoRoutes)

// 掛載購物車相關路由
router.use('/cart', cartRoutes)

// 掛載訂單相關路由
router.use('/orders', orderRoutes)

// 掛載購買記錄相關路由
router.use('/purchases', purchaseRoutes)

// 掛載預約管理相關路由
router.use('/reservations', reservationRoutes)

export default router
