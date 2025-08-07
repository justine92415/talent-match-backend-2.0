import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('message_courses')
export class MessageCourse {
  /** 訊息課程關聯ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 關聯唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 訊息ID */
  @Column()
  message_id!: number

  /** 課程ID */
  @Column()
  course_id!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
