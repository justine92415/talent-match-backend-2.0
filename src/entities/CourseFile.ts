import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('course_files')
export class CourseFile {
  /** 課程檔案ID（主鍵） */
  @PrimaryGeneratedColumn()
  id!: number

  /** 課程檔案唯一識別碼 */
  @Column({ type: 'uuid' })
  uuid!: string

  /** 關聯的課程ID */
  @Column()
  course_id!: number

  /** 檔案名稱 */
  @Column({ length: 255 })
  name!: string

  /** 檔案ID */
  @Column({ type: 'uuid' })
  file_id!: string

  /** 檔案網址 */
  @Column({ type: 'text' })
  url!: string

  /** 建立時間 */
  @CreateDateColumn({ type: 'timestamp' })
  created_at!: Date

  /** 更新時間 */
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at!: Date
}
