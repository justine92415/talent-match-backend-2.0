import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('course_videos')
export class CourseVideo {
  /** 課程影片關聯ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 關聯的課程ID */
  @Column()
  course_id!: number

  /** 關聯的影片ID */
  @Column()
  video_id!: number

  /** 影片在課程中的顯示順序 */
  @Column({ type: 'integer' })
  display_order!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
