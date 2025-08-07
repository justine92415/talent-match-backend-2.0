import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('teacher_available_slots')
export class TeacherAvailableSlot {
  /** 可預約時段ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 教師ID */
  @Column()
  teacher_id!: number

  /** 星期幾（0=週日, 1=週一, ..., 6=週六） */
  @Column({ type: 'integer' })
  weekday!: number

  /** 開始時間 */
  @Column({ type: 'time' })
  start_time!: string

  /** 結束時間 */
  @Column({ type: 'time' })
  end_time!: string

  /** 是否啟用 */
  @Column({ type: 'boolean', default: true })
  is_active!: boolean

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
