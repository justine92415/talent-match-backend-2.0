import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'

const router = Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 使用者註冊
 *     description: 使用 email 和密碼註冊新帳號
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nick_name
 *               - email
 *               - password
 *             properties:
 *               nick_name:
 *                 type: string
 *                 description: 使用者暱稱
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *               password:
 *                 type: string
 *                 description: 密碼
 *     responses:
 *       201:
 *         description: 註冊成功
 *       400:
 *         description: 參數錯誤
 *       409:
 *         description: Email 已被註冊
 */
router.post('/register', AuthController.register)

export default router
