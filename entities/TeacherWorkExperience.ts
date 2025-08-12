import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('teacher_work_experiences')
export class TeacherWorkExperience {
  /** 工作經驗ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 關聯的教師ID */
  @Column()
  teacher_id!: number

  /** 是否仍在職 */
  @Column({ type: 'boolean' })
  is_working!: boolean

  /** 公司名稱 */
  @Column({ length: 200 })
  company_name!: string

  /** 工作地點 */
  @Column({ length: 200 })
  workplace!: string

  /** 工作類別 */
  @Column({ length: 100 })
  job_category!: string

  /** 職位名稱 */
  @Column({ length: 100 })
  job_title!: string

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

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
