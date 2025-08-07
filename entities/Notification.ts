import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { NotificationType } from './enums'

@Entity('notifications')
export class Notification {
  /** 通知ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 通知唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 接收通知的使用者ID */
  @Column()
  user_id!: number

  /** 通知類型 */
  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType

  /** 通知標題 */
  @Column({ length: 200 })
  title!: string

  /** 通知內容 */
  @Column({ type: 'text' })
  content!: string

  /** 是否已讀 */
  @Column({ type: 'boolean', default: false })
  is_read!: boolean

  /** 已讀時間 */
  @Column({ type: 'timestamp', nullable: true })
  read_at!: Date

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
