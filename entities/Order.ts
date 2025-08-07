import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { OrderStatus, PurchaseWay, PaymentStatus } from './enums'

@Entity('orders')
export class Order {
  /** 訂單ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 訂單唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 購買者ID */
  @Column()
  buyer_id!: number

  /** 訂單狀態 */
  @Column({ type: 'enum', enum: OrderStatus })
  status!: OrderStatus

  /** 付款方式 */
  @Column({ type: 'enum', enum: PurchaseWay })
  purchase_way!: PurchaseWay

  /** 購買者姓名 */
  @Column({ length: 100 })
  buyer_name!: string

  /** 購買者電話 */
  @Column({ length: 20 })
  buyer_phone!: string

  /** 購買者電子郵件 */
  @Column({ length: 255 })
  buyer_email!: string

  /** 訂單總金額 */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_amount!: number

  /** 付款狀態 */
  @Column({ type: 'enum', enum: PaymentStatus })
  payment_status!: PaymentStatus

  /** 付款完成時間 */
  @Column({ type: 'timestamp', nullable: true })
  paid_at!: Date

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  /** 軟刪除時間 */
  @Column({ type: 'timestamp', nullable: true })
  deleted_at!: Date
}
