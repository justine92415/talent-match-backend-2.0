import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm'
import { UserRole as UserRoleEnum, AccountStatus } from './enums'
import { UserRole } from './UserRole'

@Entity('users')
export class User {
  /** 使用者ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 使用者唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** Google OAuth ID */
  @Column({ type: 'varchar', length: 255, nullable: true })
  google_id?: string | null

  /** 使用者真實姓名 */
  @Column({ type: 'varchar', length: 100, nullable: true })
  name?: string | null

  /** 使用者暱稱 */
  @Column({ type: 'varchar', length: 50 })
  nick_name!: string

  /** 電子郵件地址 */
  @Column({ type: 'varchar', length: 255 })
  email!: string

  /** 密碼（加密後） */
  @Column({ type: 'varchar', length: 255, nullable: true })
  password?: string | null

  /** 生日 */
  @Column({ type: 'date', nullable: true })
  birthday?: Date | null

  /** 聯絡電話 */
  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_phone?: string | null

  /** 頭像圖片路徑 */
  @Column({ type: 'text', nullable: true })
  avatar_image?: string | null

  /** Google 頭像網址 */
  @Column({ type: 'text', nullable: true })
  avatar_google_url?: string | null

  /** 使用者角色 */
  @Column({ type: 'enum', enum: UserRoleEnum })
  role!: UserRoleEnum

  /** 帳號狀態 */
  @Column({ type: 'enum', enum: AccountStatus })
  account_status!: AccountStatus

  /** 重設密碼令牌 */
  @Column({ type: 'varchar', length: 128, nullable: true })
  password_reset_token?: string | null

  /** 重設密碼令牌過期時間 */
  @Column({ type: 'timestamp', nullable: true })
  password_reset_expires_at?: Date | null

  /** 最後登入時間 */
  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date | null

  /** 連續登入失敗次數 */
  @Column({ type: 'integer', default: 0 })
  login_attempts!: number

  /** 帳號鎖定到此時間 */
  @Column({ type: 'timestamp', nullable: true })
  locked_until?: Date | null

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date

  /** 刪除時間（軟刪除） */
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deleted_at?: Date | null

  /** 使用者角色列表 */
  @OneToMany(() => UserRole, userRole => userRole.user)
  roles!: UserRole[]
}
