import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm'

@Entity('chat_participants')
export class ChatParticipant {
  /** 聊天室參與者ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 參與者唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 聊天室ID */
  @Column()
  chat_id!: number

  /** 參與者使用者ID */
  @Column()
  user_id!: number

  /** 未讀訊息數 */
  @Column({ type: 'integer', default: 0 })
  unread_count!: number

  /** 加入時間 */
  @Column({ type: 'timestamp' })
  joined_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
