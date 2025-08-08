import { Router } from 'express'
import authRouter from './auth'
import pingRouter from './ping'

const router = Router()

// 掛載認證相關路由到 /auth
router.use('/auth', authRouter)

// 掛載 ping 路由
router.use('/', pingRouter)

export default router
