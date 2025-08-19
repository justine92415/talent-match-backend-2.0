import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('sub_categories')
export class SubCategory {
  /** 次分類ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 關聯的主分類ID */
  @Column({ type: 'integer' })
  main_category_id!: number

  /** 次分類名稱 */
  @Column({ type: 'varchar', length: 100 })
  name!: string

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