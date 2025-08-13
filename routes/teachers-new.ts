import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'

// 引入專用路由模組
import applicationRoutes from './teachers/application'
import workExperienceRoutes from './teachers/workExperience'
import learningExperienceRoutes from './teachers/learningExperience'
import certificateRoutes from './teachers/certificate'
import profileRoutes from './teachers/profile'
import scheduleRoutes from './teachers/schedule'

const router = Router()

/**
 * @swagger
 * tags:
 *   - name: Teachers - Application
 *     description: 教師申請相關功能
 *   - name: 教師工作經驗
 *     description: 教師工作經驗管理
 *   - name: 教師學習經歷
 *     description: 教師學習經歷管理
 *   - name: 教師證書
 *     description: 教師證書管理
 *   - name: 教師資料管理
 *     description: 教師基本資料管理
 *   - name: 教師時間管理
 *     description: 教師時間排程管理
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         message:
 *           type: string
 *           example: 操作成功
 *         data:
 *           type: object
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: 錯誤訊息
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: 參數驗證失敗
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: array
 *             items:
 *               type: string
 */

// 申請管理路由
router.use('/', applicationRoutes)

// 工作經驗管理路由
router.use('/work-experiences', workExperienceRoutes)

// 學習經歷管理路由
router.use('/learning-experiences', learningExperienceRoutes)

// 證書管理路由
router.use('/certificates', certificateRoutes)

// 基本資料管理路由
router.use('/profile', profileRoutes)

// 時間管理路由
router.use('/schedule', scheduleRoutes)

export default router
