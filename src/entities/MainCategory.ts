import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('main_categories')
export class MainCategory {
  /** 主分類ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 主分類名稱 */
  @Column({ type: 'varchar', length: 100 })
  name!: string

  /** 主分類圖示網址 */
  @Column({ type: 'varchar', length: 255, nullable: true })
  icon_url!: string

  /** 顯示順序 */
  @Column({ type: 'integer', default: 0 })
  display_order!: number

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