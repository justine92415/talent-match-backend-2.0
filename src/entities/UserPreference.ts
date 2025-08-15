import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('user_preferences')
export class UserPreference {
  /** 使用者偏好設定ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 偏好設定唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 使用者ID */
  @Column()
  user_id!: number

  /** 偏好ID */
  @Column()
  preference_id!: number

  /** 偏好標籤陣列 */
  @Column({ type: 'text', array: true })
  preference_tags!: string[]

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
