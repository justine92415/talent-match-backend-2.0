import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('cities')
export class City {
  /** 城市ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 城市代碼 */
  @Column({ type: 'varchar', length: 10, unique: true })
  city_code!: string

  /** 城市名稱 */
  @Column({ type: 'varchar', length: 50 })
  city_name!: string

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
