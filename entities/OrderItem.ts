import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('order_items')
export class OrderItem {
  /** 訂單項目ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 訂單項目唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 關聯的訂單ID */
  @Column()
  order_id!: number

  /** 購買的課程ID */
  @Column()
  course_id!: number

  /** 選擇的價格方案ID */
  @Column()
  price_option_id!: number

  /** 購買數量 */
  @Column({ type: 'integer' })
  quantity!: number

  /** 單價 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price!: number

  /** 總價 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
