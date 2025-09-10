import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { User } from './User'
import { UserRole as UserRoleEnum } from './enums'

@Entity('user_roles')
@Index(['user_id', 'role', 'is_active'], { unique: true })
export class UserRole {
  /** 使用者角色ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 使用者ID（外鍵） */
  @Column({ type: 'integer' })
  user_id!: number

  /** 角色名稱 */
  @Column({ type: 'enum', enum: UserRoleEnum })
  role!: UserRoleEnum

  /** 是否啟用 */
  @Column({ type: 'boolean', default: true })
  is_active!: boolean

  /** 角色授予時間 */
  @CreateDateColumn({ type: 'timestamp' })
  granted_at!: Date

  /** 角色撤銷時間 */
  @Column({ type: 'timestamp', nullable: true })
  revoked_at?: Date | null

  /** 授予者ID（管理員ID） */
  @Column({ type: 'integer', nullable: true })
  granted_by?: number | null

  /** 關聯到使用者 */
  @ManyToOne(() => User, user => user.roles)
  @JoinColumn({ name: 'user_id' })
  user!: User
}