/**
 * 公開教師服務
 * 
 * 處理教師公開資訊相關的業務邏輯，包括：
 * - 教師公開資料查詢
 * - 教師課程列表查詢
 */

import { Repository, In, IsNull } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Teacher } from '@entities/Teacher'
import { Course } from '@entities/Course'
import { CourseRatingStat } from '@entities/CourseRatingStat'
import { Reservation } from '@entities/Reservation'
import { PublicTeacherProfile, PublicTeacherCourse } from '@models/publicTeacher.interface'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { ReservationStatus } from '@entities/enums'

/**
 * 教師課程查詢參數介面
 */
interface TeacherCoursesQuery {
  page?: number
  per_page?: number
  limit?: number  // 向後相容
  status?: string
  keyword?: string
}

export class PublicTeacherService {
  private teacherRepository: Repository<Teacher>
  private courseRepository: Repository<Course>
  private courseRatingStatRepository: Repository<CourseRatingStat>
  private reservationRepository: Repository<Reservation>

  constructor() {
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.courseRepository = dataSource.getRepository(Course)
    this.courseRatingStatRepository = dataSource.getRepository(CourseRatingStat)
    this.reservationRepository = dataSource.getRepository(Reservation)
  }

  /**
   * 取得教師公開資料
   */
  async getPublicTeacher(teacherId: number): Promise<PublicTeacherProfile> {
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId },
      relations: ['user']
    })

    if (!teacher) {
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_FOUND, MESSAGES.BUSINESS.TEACHER_NOT_FOUND, 404)
    }

    const totalCompletedLessons = await this.getTeacherCompletedLessonCount(teacher.id)

    return {
      id: teacher.id,
      name: teacher.user?.name || '未提供姓名',
      email: teacher.user?.email || '未提供信箱',
      bio: undefined,
      expertise: undefined,
      city: teacher.city,
      district: teacher.district,
      address: teacher.address,
      introduction: teacher.introduction,
      total_students: teacher.total_students,
      total_courses: teacher.total_courses,
      average_rating: Number(teacher.average_rating),
  total_completed_lessons: totalCompletedLessons,
      total_earnings: 0, // 不顯示實際金額
      created_at: teacher.created_at.toISOString(),
      user: {
        name: teacher.user?.name || '未提供姓名',
        email: teacher.user?.email || '未提供信箱'
      }
    }
  }

  /**
   * 計算教師累積完成課堂數
   */
  private async getTeacherCompletedLessonCount(teacherId: number): Promise<number> {
    return this.reservationRepository.count({
      where: {
        teacher_id: teacherId,
        teacher_status: ReservationStatus.COMPLETED,
        student_status: ReservationStatus.COMPLETED,
        deleted_at: IsNull()
      }
    })
  }

  /**
   * 取得教師課程列表
   */
  async getTeacherCourses(teacherId: number, query: TeacherCoursesQuery) {
    // 驗證教師是否存在
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacherId }
    })

    if (!teacher) {
      throw new BusinessError(ERROR_CODES.TEACHER_NOT_FOUND, MESSAGES.BUSINESS.TEACHER_NOT_FOUND, 404)
    }

    const { page = 1, per_page = 10, limit = 10, status = 'published' } = query
    const actualLimit = per_page || limit
    const skip = (page - 1) * actualLimit
    const take = actualLimit

    // 建立查詢條件
    const whereCondition = {
      teacher_id: teacherId,
      status: status as any  // 暫時使用 any 直到導入正確的 CourseStatus 枚舉
    }

    const [courses, total] = await this.courseRepository.findAndCount({
      where: whereCondition,
      take,
      skip,
      order: {
        created_at: 'DESC'
      }
    })

    // 取得課程評分統計
    const courseIds = courses.map(course => course.id)
    const ratingStats = courseIds.length > 0 
      ? await this.courseRatingStatRepository.find({
          where: { course_id: In(courseIds) }
        }) 
      : []

    // 建立評分統計對應表
    const ratingStatsMap = new Map<number, CourseRatingStat>()
    ratingStats.forEach(stat => {
      ratingStatsMap.set(stat.course_id, stat)
    })

    // 轉換資料格式
    const publicCourses: PublicTeacherCourse[] = courses.map(course => {
      const ratingStat = ratingStatsMap.get(course.id)

      return {
        id: course.id,
        title: course.name,
        description: course.content,
        status: course.status,
        main_category: null,
        sub_category: null,
        city: null,
        price_min: null,
        price_max: null,
        total_hours: null,
        image: course.main_image,
        rating_stats: ratingStat ? {
          average_rating: Number(course.rate) || 0,
          total_reviews: (ratingStat.rating_1_count + 
                         ratingStat.rating_2_count + 
                         ratingStat.rating_3_count + 
                         ratingStat.rating_4_count + 
                         ratingStat.rating_5_count),
          rating_distribution: {
            '1': ratingStat.rating_1_count,
            '2': ratingStat.rating_2_count,
            '3': ratingStat.rating_3_count,
            '4': ratingStat.rating_4_count,
            '5': ratingStat.rating_5_count
          }
        } : null,
        created_at: course.created_at.toISOString()
      }
    })

    return {
      courses: publicCourses,
      pagination: {
        current_page: page,
        per_page: actualLimit,
        total,
        total_pages: Math.ceil(total / actualLimit)
      }
    }
  }
}

// 匯出服務實例
export const publicTeacherService = new PublicTeacherService()