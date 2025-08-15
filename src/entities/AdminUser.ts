import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'
import { AdminRole } from './enums'

@Entity('admin_users')
export class AdminUser {
  /** 管理員ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 管理員帳號 */
  @Column({ length: 50 })
  username!: string

  /** 密碼（加密後） */
  @Column({ length: 255 })
  password!: string

  /** 管理員姓名 */
  @Column({ length: 100 })
  name!: string

  /** 管理員電子郵件 */
  @Column({ length: 255 })
  email!: string

  /** 管理員角色 */
  @Column({ type: 'enum', enum: AdminRole })
  role!: AdminRole

  /** 是否啟用 */
  @Column({ type: 'boolean', default: true })
  is_active!: boolean

  /** 最後登入時間 */
  @Column({ type: 'timestamp', nullable: true })
  last_login_at!: Date

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
