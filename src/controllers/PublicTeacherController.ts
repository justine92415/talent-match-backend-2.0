/**
 * 公開教師控制器
 * 
 * 處理教師公開資料相關的 HTTP 請求，包括：
 * - GET /api/teachers/public/:id - 教師公開資料
 * - GET /api/teachers/public/:id/courses - 教師課程列表
 */

import { Request, Response, NextFunction } from 'express'
import { handleErrorAsync, handleSuccess } from '@utils/index'
import { SUCCESS } from '@constants/Message'
import { PublicTeacherService } from '@src/services/publicTeacherService'

const publicTeacherService = new PublicTeacherService()

export class PublicTeacherController {
  /**
   * @swagger
   * /api/teachers/public/{id}:
   *   get:
   *     summary: 取得教師公開資料
   *     description: 取得指定教師的公開個人資訊，包括基本資料、統計數據等
   *     tags: [Public Teachers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: 教師ID
   *         example: 41
   *     responses:
   *       200:
   *         description: 成功取得教師資料
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "success"
   *                 message:
   *                   type: string
   *                   example: "成功取得教師公開資料"
   *                 data:
   *                   type: object
   *                   properties:
   *                     teacher:
   *                       $ref: '#/components/schemas/PublicTeacherProfile'
   *       404:
   *         description: 教師不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 伺服器錯誤
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getPublicTeacher = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = parseInt(req.params.id)
    
    // 基本ID格式驗證
    if (isNaN(teacherId) || teacherId <= 0) {
      const { BusinessError } = await import('@utils/errors')
      const { ERROR_CODES } = await import('@constants/ErrorCode')
      const { MESSAGES } = await import('@constants/Message')
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_FOUND, MESSAGES.BUSINESS.TEACHER_NOT_FOUND, 404)
    }
    
    const teacher = await publicTeacherService.getPublicTeacher(teacherId)
    res.json(handleSuccess({ teacher }, SUCCESS.PUBLIC_TEACHER_PROFILE_SUCCESS))
  })

  /**
   * @swagger
   * /api/teachers/public/{id}/courses:
   *   get:
   *     summary: 取得教師課程列表
   *     description: 取得指定教師的已發布課程列表，支援分頁功能
   *     tags: [Public Teachers]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: 教師ID
   *         example: 45
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: 頁碼
   *         example: 1
   *       - in: query
   *         name: per_page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 12
   *         description: 每頁筆數
   *         example: 12
   *     responses:
   *       200:
   *         description: 成功取得教師課程列表
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "success"
   *                 message:
   *                   type: string
   *                   example: "成功取得教師課程列表"
   *                 data:
   *                   type: object
   *                   properties:
   *                     courses:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/TeacherCourse'
   *                     pagination:
   *                       $ref: '#/components/schemas/PaginationInfo'
   *                     teacher:
   *                       $ref: '#/components/schemas/TeacherBasicInfo'
   *       404:
   *         description: 教師不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       500:
   *         description: 伺服器錯誤
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  getTeacherCourses = handleErrorAsync(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = parseInt(req.params.id)
    const query = req.query as any
    
    // 基本ID格式驗證
    if (isNaN(teacherId) || teacherId <= 0) {
      const { BusinessError } = await import('@utils/errors')
      const { ERROR_CODES } = await import('@constants/ErrorCode')
      const { MESSAGES } = await import('@constants/Message')
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_FOUND, MESSAGES.BUSINESS.TEACHER_NOT_FOUND, 404)
    }
    
    const result = await publicTeacherService.getTeacherCourses(teacherId, query)
    res.json(handleSuccess(result, SUCCESS.PUBLIC_TEACHER_COURSES_SUCCESS))
  })
}

export const publicTeacherController = new PublicTeacherController()