import { Router } from 'express'
import authRouter from './auth'
import pingRouter from './ping'
import validationRouter from './validation'
import usersRouter from './users'
import teachersRouter from './teachers'
import coursesRouter from './courses'

const router = Router()

// 掛載認證相關路由到 /auth
router.use('/auth', authRouter)

// 掛載驗證相關路由到 /validation
router.use('/validation', validationRouter)

// 掛載使用者相關路由到 /users
router.use('/users', usersRouter)

// 掛載教師相關路由到 /teachers
router.use('/teachers', teachersRouter)

// 掛載課程相關路由到 /courses
router.use('/courses', coursesRouter)

// 掛載 ping 路由
router.use('/', pingRouter)

export default router
