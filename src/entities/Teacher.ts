import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Generated, OneToOne, JoinColumn } from 'typeorm'
import { ApplicationStatus } from './enums'
import { User } from './User'

@Entity('teachers')
export class Teacher {
  /** 教師ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 教師唯一識別碼 */
  @Generated('uuid')
  @Column({ type: 'uuid' })
  uuid!: string

  /** 一對一關聯到使用者 */
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User

  /** 使用者ID（外鍵） */
  @Column()
  user_id!: number

  /** 預設為待審核 */
  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  application_status!: ApplicationStatus

  /** 申請提交時間 */
  @Column({ type: 'timestamp', nullable: true })
  application_submitted_at?: Date

  /** 審核完成時間 */
  @Column({ type: 'timestamp', nullable: true })
  application_reviewed_at?: Date

  /** 審核者ID */
  @Column({ nullable: true })
  reviewer_id?: number

  /** 審核備註或拒絕原因 */
  @Column({ type: 'text', nullable: true })
  review_notes?: string

  /** 國籍 */
  @Column({ length: 50, nullable: true })
  nationality?: string

  /** 教師自我介紹 */
  @Column({ type: 'text', nullable: true })
  introduction?: string

  /** 總學生數 */
  @Column({ type: 'integer', default: 0 })
  total_students!: number

  /** 總課程數 */
  @Column({ type: 'integer', default: 0 })
  total_courses!: number

  /** 平均評分 */
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating!: number

  /** 總收入 */
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_earnings!: number

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
