import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('audit_logs')
export class AuditLog {
  /** 操作日誌ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 操作者ID */
  @Column()
  user_id!: number

  /** 操作的資料表名稱 */
  @Column({ length: 50 })
  table_name!: string

  /** 操作的記錄ID */
  @Column()
  record_id!: number

  /** 操作類型：INSERT, UPDATE, DELETE */
  @Column({ length: 20 })
  action!: string

  /** 操作前的資料值 */
  @Column({ type: 'jsonb', nullable: true })
  old_values!: object

  /** 操作後的資料值 */
  @Column({ type: 'jsonb', nullable: true })
  new_values!: object

  /** 操作者IP位址 */
  @Column({ type: 'inet', nullable: true })
  ip_address!: string

  /** 操作者瀏覽器資訊 */
  @Column({ type: 'text', nullable: true })
  user_agent!: string

  /** 操作時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date
}
