import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('user_favorites')
export class UserFavorite {
  /** 使用者收藏ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 收藏唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 使用者ID */
  @Column()
  user_id!: number

  /** 收藏的課程ID */
  @Column()
  course_id!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
