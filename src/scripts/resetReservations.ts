#!/usr/bin/env ts-node-esm

/**
 * 還原學生預約記錄腳本
 * 
 * 功能：
 * 1. 刪除預約記錄（硬刪除）
 * 2. 重設購買記錄的 quantity_used 為 0
 * 
 * 使用方式：
 * npm run reset-reservations                    # 刪除所有預約記錄
 * npm run reset-reservations -- --student-id=6  # 只刪除特定學生的預約
 */

import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { Reservation } from '@entities/Reservation'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'
import { User } from '@entities/User'
import { UserRole } from '@entities/UserRole'
import { Course } from '@entities/Course'
import { Teacher } from '@entities/Teacher'
import { Review } from '@entities/Review'

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
    UserCoursePurchase
  ],
  ssl: process.env.DB_ENABLE_SSL === 'true' ? { rejectUnauthorized: false } : false
})

interface ResetOptions {
  /** 指定學生 ID，不指定則處理所有 */
  studentId?: number
}

class ReservationResetter {
  private dataSource: DataSource

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource
  }

  /**
   * 主要執行函式
   */
  async reset(options: ResetOptions): Promise<void> {
    console.log('🔄 開始還原預約記錄...')
    
    if (options.studentId) {
      console.log(`👤 指定學生 ID: ${options.studentId}`)
    } else {
      console.log('👥 處理所有學生')
    }
    console.log()

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      let deletedCount = 0
      let resetCount = 0

      // 1. 刪除預約記錄
      if (options.studentId) {
        // 驗證學生是否存在
        await this.validateStudent(options.studentId, queryRunner)
        deletedCount = await this.deleteReservationsByStudent(options.studentId, queryRunner)
        resetCount = await this.resetPurchasesByStudent(options.studentId, queryRunner)
      } else {
        deletedCount = await this.deleteAllReservations(queryRunner)
        resetCount = await this.resetAllPurchases(queryRunner)
      }

      await queryRunner.commitTransaction()
      
      console.log(`\n🎉 還原完成！`)
      console.log(`📊 統計結果：`)
      console.log(`  ❌ 刪除預約記錄：${deletedCount} 筆`)
      console.log(`  🔄 重設購買記錄：${resetCount} 筆`)

    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.error('❌ 還原失敗，已回滾：', error)
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
   * 刪除特定學生的預約記錄
   */
  private async deleteReservationsByStudent(studentId: number, queryRunner: any): Promise<number> {
    const reservationRepo = queryRunner.manager.getRepository(Reservation)

    // 先查詢要刪除的記錄數量
    const reservations = await reservationRepo.find({
      where: { student_id: studentId }
    })

    console.log(`📋 找到 ${reservations.length} 筆該學生的預約記錄`)

    if (reservations.length === 0) {
      console.log(`  ⚠️  該學生沒有任何預約記錄`)
      return 0
    }

    // 執行刪除
    const result = await reservationRepo.delete({ student_id: studentId })
    console.log(`  ✅ 已刪除 ${result.affected || 0} 筆預約記錄`)

    return result.affected || 0
  }

  /**
   * 刪除所有預約記錄
   */
  private async deleteAllReservations(queryRunner: any): Promise<number> {
    const reservationRepo = queryRunner.manager.getRepository(Reservation)
    const reviewRepo = queryRunner.manager.getRepository(Review)

    // 先查詢總數
    const totalCount = await reservationRepo.count()
    console.log(`📋 找到 ${totalCount} 筆預約記錄`)

    if (totalCount === 0) {
      console.log(`  ⚠️  沒有任何預約記錄`)
      return 0
    }

    // 先刪除相關的 reviews（避免外鍵約束問題）
    const reviewCount = await reviewRepo.count()
    if (reviewCount > 0) {
      await reviewRepo.clear()
      console.log(`  🗑️  先刪除 ${reviewCount} 筆評價記錄`)
    }

    // 使用 delete 而不是 clear 來避免外鍵約束問題
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from(Reservation)
      .execute()

    console.log(`  ✅ 已刪除 ${totalCount} 筆預約記錄`)

    return totalCount
  }

  /**
   * 重設特定學生的購買記錄
   */
  private async resetPurchasesByStudent(studentId: number, queryRunner: any): Promise<number> {
    const purchaseRepo = queryRunner.manager.getRepository(UserCoursePurchase)

    // 先查詢該學生的購買記錄
    const purchases = await purchaseRepo.find({
      where: { user_id: studentId }
    })

    console.log(`💰 找到 ${purchases.length} 筆該學生的購買記錄`)

    if (purchases.length === 0) {
      console.log(`  ⚠️  該學生沒有任何購買記錄`)
      return 0
    }

    // 顯示重設前的狀態
    for (const purchase of purchases) {
      console.log(`  📦 課程 ${purchase.course_id}: ${purchase.quantity_used}/${purchase.quantity_total} → 0/${purchase.quantity_total}`)
    }

    // 執行重設
    const result = await purchaseRepo.update(
      { user_id: studentId },
      { quantity_used: 0 }
    )

    console.log(`  ✅ 已重設 ${result.affected || 0} 筆購買記錄`)
    return result.affected || 0
  }

  /**
   * 重設所有購買記錄
   */
  private async resetAllPurchases(queryRunner: any): Promise<number> {
    const purchaseRepo = queryRunner.manager.getRepository(UserCoursePurchase)

    // 先查詢有使用堂數的記錄
    const purchasesWithUsage = await purchaseRepo
      .createQueryBuilder('purchase')
      .where('purchase.quantity_used > 0')
      .getMany()

    console.log(`💰 找到 ${purchasesWithUsage.length} 筆有使用堂數的購買記錄`)

    if (purchasesWithUsage.length === 0) {
      console.log(`  ⚠️  所有購買記錄的使用堂數都已經是 0`)
      return 0
    }

    // 顯示重設統計
    const totalUsed = purchasesWithUsage.reduce((sum: number, p: UserCoursePurchase) => sum + p.quantity_used, 0)
    console.log(`  📊 總共重設 ${totalUsed} 堂使用記錄`)

    // 執行重設 - 使用 createQueryBuilder 避免空條件問題
    const result = await purchaseRepo
      .createQueryBuilder()
      .update(UserCoursePurchase)
      .set({ quantity_used: 0 })
      .where('quantity_used > 0')
      .execute()

    console.log(`  ✅ 已重設 ${result.affected || 0} 筆購買記錄`)
    return result.affected || 0
  }
}

/**
 * 解析命令列參數
 */
function parseArgs(): ResetOptions {
  const args = process.argv.slice(2)
  const options: ResetOptions = {}

  args.forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=')
    switch (key) {
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
    const resetter = new ReservationResetter(dataSource)
    await resetter.reset(options)

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

export { ReservationResetter, ResetOptions }