import { Router } from 'express'
import userRoutes from './users'

const router = Router()

// API 路由
router.use('/users', userRoutes)

export default router
