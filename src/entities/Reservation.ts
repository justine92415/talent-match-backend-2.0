import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { ReservationStatus } from './enums'
import { User } from './User'
import { Course } from './Course'

@Entity('reservations')
// 新增複合索引以優化查詢效能
@Index('idx_reservation_student_time', ['student_id', 'reserve_time'])
@Index('idx_reservation_teacher_time', ['teacher_id', 'reserve_time'])
@Index('idx_reservation_teacher_date_status', ['teacher_id', 'reserve_time', 'teacher_status'])
@Index('idx_reservation_student_date_status', ['student_id', 'reserve_time', 'student_status'])
export class Reservation {
  /** 預約ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 預約唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 預約的課程ID */
  @Column()
  course_id!: number

  /** 授課教師ID */
  @Column()
  teacher_id!: number

  /** 預約學生ID */
  @Column()
  student_id!: number

  /** 課程關聯 */
  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course!: Course

  /** 授課教師關聯 */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'teacher_id' })
  teacher!: User

  /** 預約學生關聯 */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student!: User

  /** 預約上課時間 */
  @Column({ type: 'timestamp' })
  reserve_time!: Date

  /** 教師端預約狀態 */
  @Column({ type: 'enum', enum: ReservationStatus })
  teacher_status!: ReservationStatus

  /** 學生端預約狀態 */
  @Column({ type: 'enum', enum: ReservationStatus })
  student_status!: ReservationStatus

  /** 教師回應期限 */
  @Column({ type: 'timestamp', nullable: true })
  response_deadline!: Date | null

  /** 拒絕原因（當狀態為 cancelled 時記錄） */
  @Column({ type: 'text', nullable: true })
  rejection_reason!: string | null

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
