import { Router } from 'express'
import { ping } from '../controllers/PingController'

const router = Router()

/**
 * @swagger
 * /api/ping:
 *   get:
 *     tags:
 *       - Ping
 *     summary: 測試 API 連線
 *     description: 用於測試 API 服務是否正常運作
 *     responses:
 *       200:
 *         description: 成功回應
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: pong
 */
router.get('/ping', ping)

export default router
