/**
 * 預約過期處理服務
 * 負責自動檢查和處理過期的預約
 */

import { Repository, LessThan } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Reservation } from '@entities/Reservation'
import { ReservationStatus } from '@entities/enums'

export class ReservationExpirationService {
  private reservationRepository: Repository<Reservation>

  constructor() {
    this.reservationRepository = dataSource.getRepository(Reservation)
  }

  /**
   * 檢查並處理過期的預約
   * 將過期且仍為 PENDING 狀態的預約設為已取消
   */
  async handleExpiredReservations(): Promise<{ count: number; expiredReservations: number[] }> {
    const now = new Date()
    
    // 查找所有已過期但仍處於等待確認狀態的預約
    const expiredReservations = await this.reservationRepository.find({
      where: {
        teacher_status: ReservationStatus.PENDING,
        response_deadline: LessThan(now),
      },
      select: ['id', 'uuid', 'student_id', 'teacher_id', 'course_id', 'response_deadline']
    })

    if (expiredReservations.length === 0) {
      return { count: 0, expiredReservations: [] }
    }

    const expiredIds: number[] = []

    // 批次更新過期預約的狀態
    for (const reservation of expiredReservations) {
      try {
        await this.reservationRepository.update(reservation.id, {
          teacher_status: ReservationStatus.CANCELLED,
          student_status: ReservationStatus.CANCELLED,
          response_deadline: null
        })
        
        expiredIds.push(reservation.id)
      } catch (error) {
        console.error(`取消預約 ID ${reservation.id} 時發生錯誤:`, error)
      }
    }

    return { 
      count: expiredIds.length, 
      expiredReservations: expiredIds 
    }
  }
}

// 匯出服務實例
export const reservationExpirationService = new ReservationExpirationService()