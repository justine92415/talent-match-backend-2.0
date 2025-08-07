import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('chats')
export class Chat {
  /** 聊天室ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 聊天室唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 最新訊息ID */
  @Column({ nullable: true })
  latest_message_id!: number

  /** 最新訊息內容 */
  @Column({ type: 'text', nullable: true })
  latest_message_text!: string

  /** 最新訊息發送時間 */
  @Column({ type: 'timestamp', nullable: true })
  latest_message_sent_at!: Date

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
