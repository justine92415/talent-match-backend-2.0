import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('course_rating_stats')
export class CourseRatingStat {
  /** 評分統計ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 課程ID（一對一） */
  @Column()
  course_id!: number

  /** 1星評價數 */
  @Column({ type: 'integer', default: 0 })
  rating_1_count!: number

  /** 2星評價數 */
  @Column({ type: 'integer', default: 0 })
  rating_2_count!: number

  /** 3星評價數 */
  @Column({ type: 'integer', default: 0 })
  rating_3_count!: number

  /** 4星評價數 */
  @Column({ type: 'integer', default: 0 })
  rating_4_count!: number

  /** 5星評價數 */
  @Column({ type: 'integer', default: 0 })
  rating_5_count!: number

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
