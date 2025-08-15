import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('teacher_certificates')
export class TeacherCertificate {
  /** 證書ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 關聯的教師ID */
  @Column()
  teacher_id!: number

  /** 發證機構 */
  @Column({ length: 200 })
  verifying_institution!: string

  /** 證書名稱 */
  @Column({ length: 200 })
  license_name!: string

  /** 證書持有人姓名 */
  @Column({ length: 100 })
  holder_name!: string

  /** 證書編號 */
  @Column({ length: 100 })
  license_number!: string

  /** 證書檔案路徑 */
  @Column({ type: 'text' })
  file_path!: string

  /** 證書類別ID */
  @Column({ length: 50 })
  category_id!: string

  /** 證書主題 */
  @Column({ length: 100 })
  subject!: string

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
