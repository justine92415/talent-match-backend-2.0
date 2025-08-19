import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm'
import { VideoType } from './enums'

@Entity('videos')
@Index('idx_video_teacher_id', ['teacher_id'])
@Index('idx_video_category', ['category'])
@Index('idx_video_deleted_at', ['deleted_at'])
@Index('idx_video_teacher_category', ['teacher_id', 'category'])
export class Video {
  /** 影片ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 影片唯一識別碼 */
  @Column({ type: 'uuid', unique: true })
  uuid!: string

  /** 上傳影片的教師ID */
  @Column()
  teacher_id!: number

  /** 影片名稱 */
  @Column({ length: 200 })
  name!: string

  /** 影片分類 */
  @Column({ length: 100, nullable: true })
  category!: string

  /** 影片介紹 */
  @Column({ type: 'text', nullable: true })
  intro!: string

  /** 影片網址 */
  @Column({ type: 'text', nullable: true })
  url!: string

  /** 影片類型 */
  @Column({ type: 'enum', enum: VideoType })
  video_type!: VideoType

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
