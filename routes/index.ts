import { Router } from 'express'
import userRoutes from './users'
import pingRoutes from './ping'

const router = Router()

// API 路由
router.use('/users', userRoutes)
router.use('/', pingRoutes)

export default router
