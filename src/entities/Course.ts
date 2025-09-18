import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { CourseStatus } from './enums'

@Entity('courses')
export class Course {
  /** 課程ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 課程唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 開課教師ID */
  @Column()
  teacher_id!: number

  /** 課程名稱 */
  @Column({ length: 200 })
  name!: string

  /** 課程封面圖片路徑 */
  @Column({ type: 'text', nullable: true })
  main_image!: string

  /** 課程詳細描述 */
  @Column({ type: 'text', nullable: true })
  content!: string

  /** 課程平均評分（0-5分） */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rate!: number

  /** 評價總數 */
  @Column({ type: 'integer', default: 0 })
  review_count!: number

  /** 課程瀏覽次數 */
  @Column({ type: 'integer', default: 0 })
  view_count!: number

  /** 課程購買次數 */
  @Column({ type: 'integer', default: 0 })
  purchase_count!: number

  /** 學生總數 */
  @Column({ type: 'integer', default: 0 })
  student_count!: number

  /** 主分類ID */
  @Column({ type: 'integer', nullable: true })
  main_category_id!: number

  /** 次分類ID */
  @Column({ type: 'integer', nullable: true })
  sub_category_id!: number

  /** 城市ID */
  @Column({ type: 'integer', nullable: true })
  city_id!: number

  /** 區域代碼（保留彈性使用） */
  @Column({ length: 10, nullable: true })
  dist_id!: string

  /** 問卷調查網址 */
  @Column({ type: 'text', nullable: true })
  survey_url!: string

  /** 購買後顯示的訊息 */
  @Column({ type: 'text', nullable: true })
  purchase_message!: string

  /** 課程狀態 */
  @Column({ type: 'enum', enum: CourseStatus })
  status!: CourseStatus

  /** 提交審核時的備註 */
  @Column({ type: 'text', nullable: true })
  submission_notes!: string | null

  /** 封存課程的原因 */
  @Column({ type: 'text', nullable: true })
  archive_reason!: string | null

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
