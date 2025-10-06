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

  /**
   * 將課程已結束的預約標記為 OVERDUE
   * 課程結束後立即執行
   */
  async markReservationsOverdue(): Promise<{ count: number; overdueReservations: number[] }> {
    const startTime = Date.now()
    const now = new Date()
    
    console.log('========================================')
    console.log('📋 [定時任務] 課程結束檢查開始')
    console.log(`⏰ 執行時間: ${now.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`)
    console.log(`⏰ 執行時間 ISO: ${now.toISOString()}`)
    console.log(`⏰ 執行時間 timestamp: ${now.getTime()}`)
    console.log('========================================')
    
    // 🔍 Debug: 先查詢所有 RESERVED 狀態的預約（不管時間）
    const allReserved = await this.reservationRepository.find({
      where: {
        teacher_status: ReservationStatus.RESERVED,
        student_status: ReservationStatus.RESERVED
      },
      select: ['id', 'reserve_time', 'teacher_status', 'student_status'],
      take: 20
    })
    
    console.log(`🔍 [DEBUG] 資料庫中所有 RESERVED 狀態的預約: ${allReserved.length} 筆`)
    allReserved.forEach(r => {
      const reserveTime = new Date(r.reserve_time)
      const isPast = reserveTime.getTime() < now.getTime()
      console.log(`   - ID ${r.id}:`)
      console.log(`     reserve_time: ${r.reserve_time}`)
      console.log(`     reserve_time ISO: ${reserveTime.toISOString()}`)
      console.log(`     reserve_time timestamp: ${reserveTime.getTime()}`)
      console.log(`     台灣時間: ${reserveTime.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}`)
      console.log(`     是否已過期: ${isPast} (now: ${now.getTime()}, reserve: ${reserveTime.getTime()}, diff: ${now.getTime() - reserveTime.getTime()}ms)`)
    })
    
    // 查找所有課程時間已過但狀態仍為 RESERVED 的預約
    const reservationsToMark = await this.reservationRepository.find({
      where: {
        teacher_status: ReservationStatus.RESERVED,
        student_status: ReservationStatus.RESERVED,
        reserve_time: LessThan(now) // 課程時間已過
      },
      select: ['id', 'reserve_time']
    })

    console.log(`🔍 查詢結果: 找到 ${reservationsToMark.length} 筆已結束但未標記的預約`)
    console.log(`🔍 [DEBUG] 查詢條件:`)
    console.log(`   - teacher_status = RESERVED`)
    console.log(`   - student_status = RESERVED`)
    console.log(`   - reserve_time < ${now.toISOString()}`)
    
    if (reservationsToMark.length === 0) {
      console.log('✅ 沒有需要標記為過期的預約')
      console.log(`⏱️  執行時間: ${Date.now() - startTime}ms`)
      console.log('========================================\n')
      return { count: 0, overdueReservations: [] }
    }

    const overdueIds: number[] = []
    const failedIds: number[] = []

    // 批次更新為 OVERDUE 狀態
    for (const reservation of reservationsToMark) {
      try {
        const reserveTime = reservation.reserve_time.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })
        const timePassed = Math.floor((now.getTime() - reservation.reserve_time.getTime()) / (1000 * 60))
        
        console.log(`  ⚙️  處理預約 ID: ${reservation.id}`)
        console.log(`      - 預約時間: ${reserveTime}`)
        console.log(`      - 已過時間: ${timePassed} 分鐘`)
        
        await this.reservationRepository.update(reservation.id, {
          teacher_status: ReservationStatus.OVERDUE,
          student_status: ReservationStatus.OVERDUE
        })
        
        overdueIds.push(reservation.id)
        console.log(`  ✅ 預約 ID ${reservation.id} 已標記為 OVERDUE`)
      } catch (error) {
        failedIds.push(reservation.id)
        const errorMessage = error instanceof Error ? error.message : '未知錯誤'
        console.error(`  ❌ 標記預約 ID ${reservation.id} 為過期時發生錯誤:`, errorMessage)
        if (error instanceof Error && error.stack) {
          console.error(`     堆疊追蹤: ${error.stack}`)
        }
      }
    }

    console.log('----------------------------------------')
    console.log(`✅ 成功標記: ${overdueIds.length} 筆`)
    if (overdueIds.length > 0) {
      console.log(`   預約 ID: [${overdueIds.join(', ')}]`)
    }
    if (failedIds.length > 0) {
      console.log(`❌ 標記失敗: ${failedIds.length} 筆`)
      console.log(`   預約 ID: [${failedIds.join(', ')}]`)
    }
    console.log(`⏱️  總執行時間: ${Date.now() - startTime}ms`)
    console.log('========================================\n')

    return { 
      count: overdueIds.length, 
      overdueReservations: overdueIds 
    }
  }

  /**
   * 自動完成過期24小時的預約
   * OVERDUE 狀態維持24小時後自動標記為 COMPLETED
   * 處理以下情況：
   * 1. 雙方都是 OVERDUE
   * 2. 一方已完成，另一方還是 OVERDUE
   */
  async autoCompleteOverdueReservations(): Promise<{ count: number; completedReservations: number[] }> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // 使用更簡單的查詢方式避免enum比較問題
    const overdueReservations = await this.reservationRepository.find({
      where: [
        // 情況1: 雙方都是overdue
        {
          reserve_time: LessThan(twentyFourHoursAgo),
          teacher_status: ReservationStatus.OVERDUE,
          student_status: ReservationStatus.OVERDUE
        },
        // 情況2: 教師completed，學生overdue
        {
          reserve_time: LessThan(twentyFourHoursAgo),
          teacher_status: ReservationStatus.COMPLETED,
          student_status: ReservationStatus.OVERDUE
        },
        // 情況3: 教師overdue，學生completed
        {
          reserve_time: LessThan(twentyFourHoursAgo),
          teacher_status: ReservationStatus.OVERDUE,
          student_status: ReservationStatus.COMPLETED
        }
      ],
      select: ['id', 'reserve_time', 'teacher_status', 'student_status']
    })

    if (overdueReservations.length === 0) {
      return { count: 0, completedReservations: [] }
    }

    const completedIds: number[] = []

    // 批次更新為 COMPLETED 狀態
    for (const reservation of overdueReservations) {
      try {
        await this.reservationRepository.update(reservation.id, {
          teacher_status: ReservationStatus.COMPLETED,
          student_status: ReservationStatus.COMPLETED
        })
        
        completedIds.push(reservation.id)
      } catch (error) {
        console.error(`自動完成預約 ID ${reservation.id} 時發生錯誤:`, error)
      }
    }

    return { 
      count: completedIds.length, 
      completedReservations: completedIds 
    }
  }

  /**
   * 手動執行所有預約狀態檢查和更新
   * 統一的入口方法，按順序執行所有檢查
   */
  async processAllReservationUpdates(): Promise<{
    expiredCount: number
    overdueCount: number
    completedCount: number
    summary: string
  }> {
    console.log('手動執行預約狀態更新...')
    
    // 1. 處理教師回應期限過期的預約
    const expiredResult = await this.handleExpiredReservations()
    console.log(`處理過期預約: ${expiredResult.count} 筆`)

    // 2. 標記課程已結束的預約為 OVERDUE
    const overdueResult = await this.markReservationsOverdue()
    console.log(`標記過期預約: ${overdueResult.count} 筆`)

    // 3. 自動完成過期24小時的預約
    const completedResult = await this.autoCompleteOverdueReservations()
    console.log(`自動完成預約: ${completedResult.count} 筆`)

    const summary = `預約狀態更新完成 - 過期: ${expiredResult.count}, 標記過期: ${overdueResult.count}, 自動完成: ${completedResult.count}`
    console.log(summary)

    return {
      expiredCount: expiredResult.count,
      overdueCount: overdueResult.count,
      completedCount: completedResult.count,
      summary
    }
  }
}

// 匯出服務實例
export const reservationExpirationService = new ReservationExpirationService()