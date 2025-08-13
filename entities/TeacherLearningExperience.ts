import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('teacher_learning_experiences')
export class TeacherLearningExperience {
  /** 學習經歷ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 關聯的教師ID */
  @Column()
  teacher_id!: number

  /** 是否仍在學 */
  @Column({ type: 'boolean' })
  is_in_school!: boolean

  /** 學位 */
  @Column({ length: 50 })
  degree!: string

  /** 學校名稱 */
  @Column({ length: 200 })
  school_name!: string

  /** 科系 */
  @Column({ length: 200 })
  department!: string

  /** 地區：TRUE=台灣, FALSE=海外 */
  @Column({ type: 'boolean' })
  region!: boolean

  /** 開始年份 */
  @Column({ type: 'integer' })
  start_year!: number

  /** 開始月份 */
  @Column({ type: 'integer' })
  start_month!: number

  /** 結束年份 */
  @Column({ type: 'integer', nullable: true })
  end_year!: number | null

  /** 結束月份 */
  @Column({ type: 'integer', nullable: true })
  end_month!: number | null

  /** 學歷證明檔案路徑 */
  @Column({ type: 'text', nullable: true })
  file_path!: string | null

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
