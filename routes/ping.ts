import { Router } from 'express'
import { ping } from '../controllers/PingController'

const router = Router()

router.get('/ping', ping)

export default router
