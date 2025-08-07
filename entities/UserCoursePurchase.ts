import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('user_course_purchases')
export class UserCoursePurchase {
  /** 使用者課程購買記錄ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 購買記錄唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 使用者ID */
  @Column()
  user_id!: number

  /** 課程ID */
  @Column()
  course_id!: number

  /** 訂單ID */
  @Column()
  order_id!: number

  /** 購買總堂數 */
  @Column({ type: 'integer' })
  quantity_total!: number

  /** 已使用堂數 */
  @Column({ type: 'integer', default: 0 })
  quantity_used!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
