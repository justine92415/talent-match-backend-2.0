/**
 * 預約管理控制器
 * 處理預約相關的 HTTP 請求與回應
 * 
 * 主要功能：
 * 1. 建立預約（POST /reservations）
 * 2. 查詢預約列表（GET /reservations）
 * 3. 更新預約狀態（PUT /reservations/:id/status）
 * 4. 取消預約（DELETE /reservations/:id）
 * 5. 日曆檢視（GET /reservations/calendar）
 */

import { Request, Response, NextFunction } from 'express'
import { reservationService } from '@services/index'
import { handleErrorAsync, handleSuccess, handleCreated } from '@utils/index'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import type {
  CreateReservationRequest,
  ReservationListQuery,
  UpdateReservationStatusRequest,
  CalendarViewQuery
} from '@models/reservation.interface'

export class ReservationController {
  private reservationService = reservationService

  /**
   * 建立預約
   * POST /reservations
   */
  createReservation = handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const studentId = req.user?.userId
      if (!studentId) {
        throw new BusinessError(
          ERROR_CODES.UNAUTHORIZED_ACCESS,
          MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
          401
        )
      }

      const requestData: CreateReservationRequest = req.body

      const result = await this.reservationService.createReservation(
        studentId,
        requestData
      )

      res.status(201).json(
        handleCreated(result, MESSAGES.RESERVATION.CREATED)
      )
    }
  )

  /**
   * 查詢預約列表
   * GET /reservations
   */
  getReservationList = handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.userId
      if (!userId) {
        throw new BusinessError(
          ERROR_CODES.UNAUTHORIZED_ACCESS,
          MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
          401
        )
      }

      // 從查詢參數取得使用者角色（預設為學生）
      const userRole = req.query.role as 'teacher' | 'student' || 'student'

      // 解析查詢參數
      const query: ReservationListQuery = {
        role: req.query.role as 'teacher' | 'student',
        status: req.query.status as any,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        per_page: req.query.per_page ? parseInt(req.query.per_page as string, 10) : 10
      }

      const result = await this.reservationService.getReservations(
        userId,
        userRole,
        query
      )

      res.status(200).json(
        handleSuccess(result, MESSAGES.RESERVATION.LIST_SUCCESS)
      )
    }
  )

  /**
   * 更新預約狀態
   * PUT /reservations/:id/status
   */
  updateReservationStatus = handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.userId
      if (!userId) {
        throw new BusinessError(
          ERROR_CODES.UNAUTHORIZED_ACCESS,
          MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
          401
        )
      }

      const reservationId = parseInt(req.params.id, 10)
      if (isNaN(reservationId)) {
        throw new BusinessError(
          ERROR_CODES.VALIDATION_ERROR,
          MESSAGES.VALIDATION.RESERVATION_COURSE_ID_INVALID,
          400
        )
      }

      const requestData: UpdateReservationStatusRequest = req.body

      const result = await this.reservationService.updateReservationStatus(
        reservationId,
        userId,
        requestData
      )

      res.status(200).json(
        handleSuccess(result, MESSAGES.RESERVATION.STATUS_UPDATED)
      )
    }
  )

  /**
   * 取消預約
   * DELETE /reservations/:id
   */
  cancelReservation = handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.userId
      if (!userId) {
        throw new BusinessError(
          ERROR_CODES.UNAUTHORIZED_ACCESS,
          MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
          401
        )
      }

      const reservationId = parseInt(req.params.id, 10)
      if (isNaN(reservationId)) {
        throw new BusinessError(
          ERROR_CODES.VALIDATION_ERROR,
          MESSAGES.VALIDATION.RESERVATION_COURSE_ID_INVALID,
          400
        )
      }

      const result = await this.reservationService.cancelReservation(
        reservationId,
        userId
      )

      res.status(200).json(
        handleSuccess(result, MESSAGES.RESERVATION.CANCELLED)
      )
    }
  )

  /**
   * 取得日曆檢視
   * GET /reservations/calendar
   */
  getCalendarView = handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.userId
      if (!userId) {
        throw new BusinessError(
          ERROR_CODES.UNAUTHORIZED_ACCESS,
          MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
          401
        )
      }

      // 從查詢參數取得使用者角色（預設為學生）
      const userRole = req.query.role as 'teacher' | 'student' || 'student'

      // 解析查詢參數
      const query: CalendarViewQuery = {
        view: req.query.view as 'week' | 'month',
        date: req.query.date as string,
        role: req.query.role as 'teacher' | 'student'
      }

      const result = await this.reservationService.getCalendarView(
        userId,
        userRole,
        query
      )

      res.status(200).json(
        handleSuccess(result, MESSAGES.RESERVATION.CALENDAR_SUCCESS)
      )
    }
  )

  /**
   * 取得預約詳情
   * GET /reservations/:id
   */
  getReservationDetail = handleErrorAsync(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?.userId
      if (!userId) {
        throw new BusinessError(
          ERROR_CODES.UNAUTHORIZED_ACCESS,
          MESSAGES.BUSINESS.UNAUTHORIZED_ACCESS,
          401
        )
      }

      const reservationId = parseInt(req.params.id, 10)
      if (isNaN(reservationId)) {
        throw new BusinessError(
          ERROR_CODES.VALIDATION_ERROR,
          MESSAGES.VALIDATION.RESERVATION_COURSE_ID_INVALID,
          400
        )
      }

      // 這裡需要額外實作取得預約詳情的方法
      // 目前先回傳基本回應
      res.status(200).json(
        handleSuccess({ id: reservationId }, MESSAGES.RESERVATION.DETAIL_SUCCESS)
      )
    }
  )
}

// 匯出控制器實例
export const reservationController = new ReservationController()