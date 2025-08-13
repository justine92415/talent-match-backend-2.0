import { Router } from 'express'
import { TeacherCertificateController } from '../../controllers/teachers/TeacherCertificateController'
import { authenticateToken } from '../../middleware/auth'

const router = Router()

/**
 * @swagger
 * components:
 *   schemas:
 *     TeacherCertificateRequest:
 *       type: object
 *       required:
 *         - certificate_name
 *         - issuing_organization
 *         - issue_year
 *         - issue_month
 *       properties:
 *         certificate_name:
 *           type: string
 *           description: 證書名稱
 *           example: "AWS Certified Solutions Architect"
 *           minLength: 1
 *           maxLength: 100
 *         issuing_organization:
 *           type: string
 *           description: 發證機構
 *           example: "Amazon Web Services"
 *           minLength: 1
 *           maxLength: 100
 *         issue_year:
 *           type: number
 *           description: 取得年份
 *           example: 2023
 *           minimum: 1900
 *         issue_month:
 *           type: number
 *           description: 取得月份
 *           example: 6
 *           minimum: 1
 *           maximum: 12
 *         expiry_year:
 *           type: number
 *           description: 到期年份（選填）
 *           example: 2026
 *           minimum: 1900
 *         expiry_month:
 *           type: number
 *           description: 到期月份（選填）
 *           example: 6
 *           minimum: 1
 *           maximum: 12
 *         credential_id:
 *           type: string
 *           description: 證書編號（選填）
 *           example: "AWS-SAA-123456"
 *           maxLength: 100
 *         credential_url:
 *           type: string
 *           description: 證書驗證網址（選填）
 *           example: "https://www.credly.com/badges/..."
 *           maxLength: 500
 *     TeacherCertificateResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           example: 1
 *         teacher_id:
 *           type: number
 *           example: 123
 *         certificate_name:
 *           type: string
 *           example: "AWS Certified Solutions Architect"
 *         issuing_organization:
 *           type: string
 *           example: "Amazon Web Services"
 *         issue_year:
 *           type: number
 *           example: 2023
 *         issue_month:
 *           type: number
 *           example: 6
 *         expiry_year:
 *           type: number
 *           example: 2026
 *         expiry_month:
 *           type: number
 *           example: 6
 *         credential_id:
 *           type: string
 *           example: "AWS-SAA-123456"
 *         credential_url:
 *           type: string
 *           example: "https://www.credly.com/badges/..."
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-08T10:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-01-08T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/teachers/certificates:
 *   get:
 *     tags:
 *       - 教師證書
 *     summary: 取得證書列表
 *     description: |
 *       取得當前教師的證書列表
 *
 *       **業務規則：**
 *       - 只能查看自己的證書
 *       - 按建立時間排序
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: 查詢成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         certificates:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/TeacherCertificateResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authenticateToken, TeacherCertificateController.getCertificates)

/**
 * @swagger
 * /api/teachers/certificates:
 *   post:
 *     tags:
 *       - 教師證書
 *     summary: 建立證書
 *     description: |
 *       新增一筆證書記錄
 *
 *       **業務規則：**
 *       - 證書名稱不可重複
 *       - 到期時間必須晚於取得時間（如填寫）
 *       - 證書編號在同一發證機構內不可重複（如填寫）
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherCertificateRequest'
 *     responses:
 *       201:
 *         description: 建立成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         certificate:
 *                           $ref: '#/components/schemas/TeacherCertificateResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 資源衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authenticateToken, TeacherCertificateController.createCertificate)

/**
 * @swagger
 * /api/teachers/certificates/{id}:
 *   put:
 *     tags:
 *       - 教師證書
 *     summary: 更新證書
 *     description: |
 *       更新指定的證書記錄
 *
 *       **業務規則：**
 *       - 只能更新自己的證書
 *       - 證書名稱不可與其他證書重複
 *       - 到期時間必須晚於取得時間（如填寫）
 *       - 證書編號在同一發證機構內不可重複（如填寫）
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師且為資源擁有者
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 證書ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeacherCertificateRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         certificate:
 *                           $ref: '#/components/schemas/TeacherCertificateResponse'
 *       400:
 *         description: 參數驗證錯誤
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 資源衝突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', authenticateToken, TeacherCertificateController.updateCertificate)

/**
 * @swagger
 * /api/teachers/certificates/{id}:
 *   delete:
 *     tags:
 *       - 教師證書
 *     summary: 刪除證書
 *     description: |
 *       刪除指定的證書記錄
 *
 *       **業務規則：**
 *       - 只能刪除自己的證書
 *       - 刪除操作不可恢復
 *
 *       **權限要求：**
 *       - 需要登入
 *       - 需要是教師且為資源擁有者
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: 證書ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 刪除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: 未授權
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 權限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 資源不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', authenticateToken, TeacherCertificateController.deleteCertificate)

export default router
