import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm'
import { UserRole, AccountStatus } from './enums'

@Entity('users')
export class User {
  /** 使用者ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 使用者唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** Google OAuth ID */
  @Column({ length: 255, nullable: true })
  google_id!: string

  /** 使用者真實姓名 */
  @Column({ length: 100, nullable: true })
  name!: string

  /** 使用者暱稱 */
  @Column({ length: 50 })
  nick_name!: string

  /** 電子郵件地址 */
  @Column({ length: 255 })
  email!: string

  /** 密碼（加密後） */
  @Column({ length: 255, nullable: true })
  password!: string

  /** 生日 */
  @Column({ type: 'date', nullable: true })
  birthday!: Date

  /** 聯絡電話 */
  @Column({ length: 20, nullable: true })
  contact_phone!: string

  /** 頭像圖片路徑 */
  @Column({ type: 'text', nullable: true })
  avatar_image!: string

  /** Google 頭像網址 */
  @Column({ type: 'text', nullable: true })
  avatar_google_url!: string

  /** 使用者角色 */
  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole

  /** 帳號狀態 */
  @Column({ type: 'enum', enum: AccountStatus })
  account_status!: AccountStatus

  /** 重設密碼令牌 */
  @Column({ length: 128, nullable: true })
  password_reset_token!: string

  /** 重設密碼令牌過期時間 */
  @Column({ type: 'timestamp', nullable: true })
  password_reset_expires_at!: Date

  /** 最後登入時間 */
  @Column({ type: 'timestamp', nullable: true })
  last_login_at!: Date

  /** 連續登入失敗次數 */
  @Column({ type: 'integer', default: 0 })
  login_attempts!: number

  /** 帳號鎖定到此時間 */
  @Column({ type: 'timestamp', nullable: true })
  locked_until!: Date

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  /** 刪除時間（軟刪除） */
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at!: Date
}
