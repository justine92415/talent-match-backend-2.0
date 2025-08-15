import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { MessageType, MessageTarget } from './enums'

@Entity('messages')
export class Message {
  /** 訊息ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 訊息唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 聊天室ID（一對一聊天） */
  @Column({ nullable: true })
  chat_id!: number

  /** 發送者ID */
  @Column()
  sender_id!: number

  /** 訊息內容（純文字） */
  @Column({ type: 'text' })
  text!: string

  /** 公告標題（僅公告訊息使用） */
  @Column({ length: 200, nullable: true })
  announcement_title!: string

  /** 訊息類型 */
  @Column({ type: 'enum', enum: MessageType })
  type!: MessageType

  /** 訊息目標對象（僅公告訊息使用） */
  @Column({ type: 'enum', enum: MessageTarget, nullable: true })
  target!: MessageTarget

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
