import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { CourseApplicationType, ApplicationStatus } from './enums'

@Entity('course_applications')
export class CourseApplication {
  /** 課程申請ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 申請唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 申請的課程ID */
  @Column()
  course_id!: number

  /** 申請教師ID */
  @Column()
  teacher_id!: number

  /** 申請類型 */
  @Column({ type: 'enum', enum: CourseApplicationType })
  application_type!: CourseApplicationType

  /** 申請狀態 */
  @Column({ type: 'enum', enum: ApplicationStatus })
  status!: ApplicationStatus

  /** 提交時間 */
  @Column({ type: 'timestamp' })
  submitted_at!: Date

  /** 審核時間 */
  @Column({ type: 'timestamp', nullable: true })
  reviewed_at!: Date

  /** 審核管理員ID */
  @Column({ nullable: true })
  reviewer_id!: number

  /** 審核備註或拒絕原因 */
  @Column({ type: 'text', nullable: true })
  review_notes!: string

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
