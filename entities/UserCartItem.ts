import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('user_cart_items')
export class UserCartItem {
  /** 購物車項目ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 購物車項目唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 使用者ID */
  @Column()
  user_id!: number

  /** 課程ID */
  @Column()
  course_id!: number

  /** 價格選項ID */
  @Column()
  price_option_id!: number

  /** 數量 */
  @Column({ type: 'integer' })
  quantity!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
