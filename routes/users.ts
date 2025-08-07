import { Router } from 'express'
import { UserController } from '../controllers/UserController'

const router = Router()
const userController = new UserController()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 使用者管理 API
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: 取得所有使用者
 *     description: 取得系統中所有使用者的清單
 *     responses:
 *       200:
 *         description: 成功取得使用者清單
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', userController.getAllUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: 根據 ID 取得使用者
 *     description: 根據指定的 ID 取得單一使用者資訊
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 使用者 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 成功取得使用者
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 找不到使用者
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', userController.getUserById)

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: 建立新使用者
 *     description: 建立一個新的使用者帳號
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 使用者名稱
 *                 example: john_doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: 密碼
 *                 example: password123
 *     responses:
 *       201:
 *         description: 成功建立使用者
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 使用者建立成功
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 請求參數錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', userController.createUser)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: 更新使用者
 *     description: 更新指定 ID 的使用者資訊
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 使用者 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: 使用者名稱
 *                 example: john_doe_updated
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 電子郵件
 *                 example: john.updated@example.com
 *               password:
 *                 type: string
 *                 description: 密碼
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: 成功更新使用者
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 使用者更新成功
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 找不到使用者
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', userController.updateUser)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: 刪除使用者
 *     description: 刪除指定 ID 的使用者
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 使用者 ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 成功刪除使用者
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 使用者刪除成功
 *       404:
 *         description: 找不到使用者
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 伺服器錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', userController.deleteUser)

export default router
