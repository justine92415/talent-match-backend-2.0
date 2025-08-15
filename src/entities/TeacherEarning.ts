import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { EarningStatus } from './enums'

@Entity('teacher_earnings')
export class TeacherEarning {
  /** 收入記錄ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 收入記錄唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 教師ID */
  @Column()
  teacher_id!: number

  /** 訂單ID */
  @Column()
  order_id!: number

  /** 預約ID（實際上課才計算收入） */
  @Column()
  reservation_id!: number

  /** 課程原價 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gross_amount!: number

  /** 平台手續費率 */
  @Column({ type: 'decimal', precision: 5, scale: 4 })
  platform_fee_rate!: number

  /** 平台手續費金額 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platform_fee!: number

  /** 教師實得金額 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  net_amount!: number

  /** 收入狀態 */
  @Column({ type: 'enum', enum: EarningStatus })
  status!: EarningStatus

  /** 結算月份（YYYY-MM） */
  @Column({ length: 7 })
  settlement_month!: string

  /** 結算時間 */
  @Column({ type: 'timestamp', nullable: true })
  settled_at!: Date

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
