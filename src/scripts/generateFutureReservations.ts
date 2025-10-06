#!/usr/bin/env ts-node-esm

/**
 * 產生未來預約資料腳本
 * 
 * 功能：
 * 1. 查詢已購買課程的學生和課程資料
 * 2. 根據教師的 available_slots 產生未來的預約記錄
 * 3. 避免時段衝突，預約狀態為 reserved
 * 
 * 使用方式：
 * npm run generate-future-reservations                    # 預設未來 1 個月，每個購買記錄 5 筆
 * npm run generate-future-reservations -- --months=3      # 未來 3 個月
 * npm run generate-future-reservations -- --weeks=2       # 未來 2 週
 * npm run generate-future-reservations -- --count=10      # 每個購買記錄 10 筆預約
 * npm run generate-future-reservations -- --student-id=6  # 指定學生
 */

import * as dotenv from 'dotenv'
import { DataSource, IsNull } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { Reservation } from '@entities/Reservation'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { Course } from '@entities/Course'
import { User } from '@entities/User'
import { UserRole } from '@entities/UserRole'
import { Teacher } from '@entities/Teacher'
import { Review } from '@entities/Review'
import { ReservationStatus } from '@entities/enums'

// 載入環境變數
dotenv.config()

// 建立資料源配置
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST === 'postgres' ? 'localhost' : (process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'postgres',
  entities: [
    User,
    UserRole,
    Teacher,
    Course,
    Reservation,
    Review,
    UserCoursePurchase,
    TeacherAvailableSlot
  ],
  ssl: process.env.DB_ENABLE_SSL === 'true' ? { rejectUnauthorized: false } : false
})

interface PurchaseWithCourse {
  purchaseId: number
  userId: number
  courseId: number
  teacherId: number
  quantityTotal: number
  quantityUsed: number
  availableSlots: TeacherAvailableSlot[]
}

interface GenerateOptions {
  /** 往後幾個月的預約資料 */
  months: number
  /** 往後幾週的預約資料（優先於 months） */
  weeks?: number
  /** 每個購買記錄要產生的預約數量 */
  reservationsPerPurchase: number
  /** 指定學生 ID（可選） */
  studentId?: number
}

class FutureReservationGenerator {
  private dataSource: DataSource

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource
  }

  /**
   * 主要執行函式
   */
  async generate(options: GenerateOptions): Promise<void> {
    console.log('🚀 開始產生未來預約資料...')
    
    if (options.weeks) {
      console.log(`📅 時間範圍：未來 ${options.weeks} 週`)
    } else {
      console.log(`📅 時間範圍：未來 ${options.months} 個月`)
    }
    
    console.log(`📊 每個購買記錄產生 ${options.reservationsPerPurchase} 筆預約`)
    
    if (options.studentId) {
      console.log(`👤 指定學生 ID: ${options.studentId}`)
    } else {
      console.log(`👥 處理所有學生`)
    }
    console.log()

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 驗證學生是否存在（如果指定了學生 ID）
      if (options.studentId) {
        await this.validateStudent(options.studentId, queryRunner)
      }

      // 1. 查詢所有已購買課程的記錄
      const purchases = await this.getPurchasesWithCourseInfo(queryRunner, options.studentId)
      console.log(`✅ 找到 ${purchases.length} 筆購買記錄\n`)

      if (purchases.length === 0) {
        const message = options.studentId 
          ? `學生 ID ${options.studentId} 沒有任何購買記錄`
          : '沒有找到任何購買記錄'
        console.log(`⚠️  ${message}，結束執行`)
        return
      }

      let totalCreated = 0

      // 2. 為每個購買記錄產生預約
      for (const purchase of purchases) {
        console.log(`\n處理購買記錄 #${purchase.purchaseId}:`)
        console.log(`  學生 ID: ${purchase.userId}`)
        console.log(`  課程 ID: ${purchase.courseId}`)
        console.log(`  教師 ID: ${purchase.teacherId}`)
        console.log(`  可用時段數: ${purchase.availableSlots.length}`)
        console.log(`  剩餘堂數: ${purchase.quantityTotal - purchase.quantityUsed}`)

        if (purchase.availableSlots.length === 0) {
          console.log(`  ⚠️  教師沒有設定可預約時段，跳過`)
          continue
        }

        const reservations = await this.generateReservationsForPurchase(
          purchase,
          options,
          queryRunner
        )

        totalCreated += reservations.length
        console.log(`  ✅ 建立了 ${reservations.length} 筆預約`)
      }

      await queryRunner.commitTransaction()
      console.log(`\n🎉 成功產生 ${totalCreated} 筆未來預約資料！`)

    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.error('❌ 產生預約資料失敗，已回滾：', error)
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 驗證學生是否存在
   */
  private async validateStudent(studentId: number, queryRunner: any): Promise<void> {
    const userRepo = queryRunner.manager.getRepository(User)
    const user = await userRepo.findOne({
      where: { id: studentId }
    })

    if (!user) {
      throw new Error(`學生 ID ${studentId} 不存在`)
    }

    console.log(`✅ 找到學生：${user.name || user.nick_name} (${user.email})`)
  }

  /**
   * 查詢購買記錄及相關課程資訊
   */
  private async getPurchasesWithCourseInfo(queryRunner: any, studentId?: number): Promise<PurchaseWithCourse[]> {
    const purchaseRepo = queryRunner.manager.getRepository(UserCoursePurchase)
    const courseRepo = queryRunner.manager.getRepository(Course)
    const slotRepo = queryRunner.manager.getRepository(TeacherAvailableSlot)

    // 根據是否指定學生 ID 來查詢
    const whereCondition = studentId ? { user_id: studentId } : {}
    const purchases = await purchaseRepo.find({
      where: whereCondition,
      order: { id: 'ASC' }
    })

    const result: PurchaseWithCourse[] = []

    for (const purchase of purchases) {
      const course = await courseRepo.findOne({
        where: { id: purchase.course_id }
      })

      if (!course) {
        console.log(`  ⚠️  找不到課程 ID ${purchase.course_id}，跳過`)
        continue
      }

      const availableSlots = await slotRepo.find({
        where: {
          teacher_id: course.teacher_id,
          is_active: true
        }
      })

      result.push({
        purchaseId: purchase.id,
        userId: purchase.user_id,
        courseId: purchase.course_id,
        teacherId: course.teacher_id,
        quantityTotal: purchase.quantity_total,
        quantityUsed: purchase.quantity_used,
        availableSlots
      })
    }

    return result
  }

  /**
   * 為單一購買記錄產生預約
   */
  private async generateReservationsForPurchase(
    purchase: PurchaseWithCourse,
    options: GenerateOptions,
    queryRunner: any
  ): Promise<Reservation[]> {
    const reservationRepo = queryRunner.manager.getRepository(Reservation)
    const reservations: Reservation[] = []

    // 計算可以產生的預約數量（不超過購買的堂數）
    const maxReservations = Math.min(
      options.reservationsPerPurchase,
      purchase.quantityTotal - purchase.quantityUsed
    )

    if (maxReservations <= 0) {
      console.log(`  ⚠️  沒有剩餘堂數可以預約`)
      return []
    }

    // 產生未來的預約時間（含衝突檢查）
    const futureDates = await this.generateFutureDatesWithoutConflict(
      options.weeks || options.months,
      options.weeks ? 'weeks' : 'months',
      maxReservations,
      purchase.availableSlots,
      purchase.teacherId,
      queryRunner
    )

    if (futureDates.length === 0) {
      console.log(`  ⚠️  無法找到足夠的無衝突時段`)
      return []
    }

    for (let i = 0; i < futureDates.length; i++) {
      const reservation = reservationRepo.create({
        uuid: uuidv4(),
        course_id: purchase.courseId,
        teacher_id: purchase.teacherId,
        student_id: purchase.userId,
        reserve_time: futureDates[i],
        teacher_status: ReservationStatus.RESERVED,  // 雙方都是已確認狀態
        student_status: ReservationStatus.RESERVED,
        response_deadline: null,
        rejection_reason: null
      })

      reservations.push(reservation)
    }

    // 批次儲存
    await reservationRepo.save(reservations)

    // 更新已使用堂數（未來預約都是 reserved 狀態，需要佔用堂數）
    const purchaseRepo = queryRunner.manager.getRepository(UserCoursePurchase)
    await purchaseRepo.update(
      { id: purchase.purchaseId },
      { quantity_used: purchase.quantityUsed + reservations.length }
    )

    return reservations
  }

  /**
   * 產生未來的日期時間（基於教師的可預約時段，含衝突檢查）
   */
  private async generateFutureDatesWithoutConflict(
    timeValue: number,
    timeUnit: 'weeks' | 'months',
    count: number,
    availableSlots: TeacherAvailableSlot[],
    teacherId: number,
    queryRunner: any
  ): Promise<Date[]> {
    const dates: Date[] = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1) // 從明天開始
    const endDate = new Date()
    
    // 根據時間單位設定結束日期
    if (timeUnit === 'weeks') {
      endDate.setDate(endDate.getDate() + (timeValue * 7))
    } else {
      endDate.setMonth(endDate.getMonth() + timeValue)
    }

    const reservationRepo = queryRunner.manager.getRepository(Reservation)
    const maxAttempts = count * 15 // 最多嘗試次數，避免無限迴圈

    let attempts = 0

    // 產生隨機日期，確保無衝突且不過於密集
    while (dates.length < count && attempts < maxAttempts) {
      attempts++

      // 隨機選擇一個時段
      const slot = availableSlots[Math.floor(Math.random() * availableSlots.length)]
      
      // 在時間範圍內隨機選擇一個日期
      const randomTime = startDate.getTime() + 
        Math.random() * (endDate.getTime() - startDate.getTime())
      const randomDate = new Date(randomTime)

      // 調整到該時段對應的星期幾
      const dayDiff = slot.weekday - randomDate.getDay()
      randomDate.setDate(randomDate.getDate() + dayDiff)

      // 如果超出範圍，調整一週
      if (randomDate > endDate) {
        randomDate.setDate(randomDate.getDate() - 7)
      } else if (randomDate < startDate) {
        randomDate.setDate(randomDate.getDate() + 7)
      }

      // 確保是未來的日期
      if (randomDate <= new Date()) {
        continue
      }

      // 設定時間
      const [hours, minutes] = slot.start_time.split(':').map(Number)
      randomDate.setHours(hours, minutes, 0, 0)

      // 檢查是否與已產生的時段重複
      if (dates.some(d => d.getTime() === randomDate.getTime())) {
        continue
      }

      // 避免過於密集：檢查是否與已產生的預約時間太接近（同一天）
      const sameDay = dates.some(d => 
        d.getFullYear() === randomDate.getFullYear() &&
        d.getMonth() === randomDate.getMonth() &&
        d.getDate() === randomDate.getDate()
      )

      if (sameDay) {
        continue
      }

      // 檢查資料庫中是否已有該時段的預約（未刪除的）
      const existingReservation = await reservationRepo.findOne({
        where: {
          teacher_id: teacherId,
          reserve_time: randomDate,
          deleted_at: IsNull()
        }
      })

      if (!existingReservation) {
        dates.push(randomDate)
      }
    }

    if (dates.length < count) {
      console.log(`  ⚠️  只能產生 ${dates.length}/${count} 筆無衝突的預約（其他時段已被預約或過於密集）`)
    }

    return dates.sort((a, b) => a.getTime() - b.getTime())
  }
}

/**
 * 解析命令列參數
 */
function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2)
  const options: GenerateOptions = {
    months: 1,                    // 預設未來 1 個月
    reservationsPerPurchase: 5,   // 預設每個購買記錄 5 筆
  }

  args.forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=')
    switch (key) {
      case 'months':
        options.months = parseInt(value, 10)
        break
      case 'weeks':
        options.weeks = parseInt(value, 10)
        break
      case 'count':
        options.reservationsPerPurchase = parseInt(value, 10)
        break
      case 'student-id':
        options.studentId = parseInt(value, 10)
        if (isNaN(options.studentId)) {
          throw new Error('student-id 必須是有效的數字')
        }
        break
    }
  })

  return options
}

/**
 * 主程式入口
 */
async function main() {
  try {
    await dataSource.initialize()
    console.log('✅ 資料庫連線成功\n')

    const options = parseArgs()
    const generator = new FutureReservationGenerator(dataSource)
    await generator.generate(options)

    await dataSource.destroy()
    console.log('\n✅ 資料庫連線已關閉')
    process.exit(0)
  } catch (error) {
    console.error('❌ 執行失敗：', error)
    process.exit(1)
  }
}

// 執行主程式
if (require.main === module) {
  main()
}

export { FutureReservationGenerator, GenerateOptions }