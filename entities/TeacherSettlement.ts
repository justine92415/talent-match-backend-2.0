import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { SettlementStatus } from './enums'

@Entity('teacher_settlements')
export class TeacherSettlement {
  /** 月結算ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 結算唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 教師ID */
  @Column()
  teacher_id!: number

  /** 結算月份（YYYY-MM） */
  @Column({ length: 7 })
  settlement_month!: string

  /** 該月總授課數 */
  @Column({ type: 'integer' })
  total_lessons!: number

  /** 該月總營收 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gross_revenue!: number

  /** 該月總平台費用 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_platform_fee!: number

  /** 該月實得收入 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  net_revenue!: number

  /** 預扣稅額（預留） */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax_amount!: number

  /** 結算狀態 */
  @Column({ type: 'enum', enum: SettlementStatus })
  status!: SettlementStatus

  /** 付款時間 */
  @Column({ type: 'timestamp', nullable: true })
  paid_at!: Date

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
