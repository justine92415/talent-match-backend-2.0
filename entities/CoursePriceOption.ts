import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('course_price_options')
export class CoursePriceOption {
  /** 價格選項ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 價格選項唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 關聯的課程ID */
  @Column()
  course_id!: number

  /** 價格 */
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number

  /** 堂數 */
  @Column({ type: 'integer' })
  quantity!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
