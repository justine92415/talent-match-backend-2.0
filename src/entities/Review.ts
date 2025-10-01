import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm'
import { Reservation } from './Reservation'

@Entity('reviews')
export class Review {
  /** 評價ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 評價唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 關聯的預約ID（一對一） */
  @Column()
  reservation_id!: number

  /** 關聯的預約（存在即表示已留下評論） */
  @OneToOne(() => Reservation, reservation => reservation.review)
  @JoinColumn({ name: 'reservation_id' })
  reservation!: Reservation

  /** 評價的課程ID */
  @Column()
  course_id!: number

  /** 評價者ID */
  @Column()
  user_id!: number

  /** 被評價的教師ID */
  @Column()
  teacher_id!: number

  /** 評分（1-5分） */
  @Column({ type: 'integer' })
  rate!: number

  /** 評價內容 */
  @Column({ type: 'text', nullable: true })
  comment!: string

  /** 是否顯示（預留管理功能） */
  @Column({ type: 'boolean', default: true })
  is_visible!: boolean

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
