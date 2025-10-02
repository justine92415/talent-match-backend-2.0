/**
 * 評價服務層
 * 
 * 處理評價相關的業務邏輯，包括：
 * - 評價提交和權限驗證
 * - 評價查詢和篩選
 * - 課程統計更新
 * - 教師評分更新
 */

import { Repository, QueryRunner } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Review } from '@entities/Review'
import { Course } from '@entities/Course'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { Reservation } from '@entities/Reservation'
import { CourseRatingStat } from '@entities/CourseRatingStat'
import { BusinessError } from '@utils/errors'
import { MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import { ReservationStatus, CourseStatus } from '@entities/enums'
import { 
  CourseReviewsQueryParams, 
  MyReviewsQueryParams, 
  ReceivedReviewsQueryParams 
} from '@models/review'
import { v4 as uuidv4 } from 'uuid'

// 抽取常數以提高程式碼可維護性
const REVIEW_PERMISSIONS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409
} as const

const REVIEW_VALIDATION_ERRORS = {
  BAD_REQUEST: 400,
  UNPROCESSABLE_ENTITY: 422
} as const

export class ReviewService {
  private reviewRepository: Repository<Review>
  private courseRepository: Repository<Course>
  private teacherRepository: Repository<Teacher>
  private userRepository: Repository<User>
  private reservationRepository: Repository<Reservation>
  private courseRatingStatRepository: Repository<CourseRatingStat>

  constructor() {
    this.reviewRepository = dataSource.getRepository(Review)
    this.courseRepository = dataSource.getRepository(Course)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
    this.reservationRepository = dataSource.getRepository(Reservation)
    this.courseRatingStatRepository = dataSource.getRepository(CourseRatingStat)
  }

  /**
   * 提交評價
   */
  async submitReview(userId: number, data: { reservation_uuid: string; rate: number; comment: string }) {
    // 驗證預約是否存在且屬於該使用者
    const reservation = await this.reservationRepository.findOne({
      where: { 
        uuid: data.reservation_uuid,
        student_id: userId
      }
    })

    if (!reservation) {
      throw new BusinessError(
        ERROR_CODES.RESERVATION_NOT_FOUND,
        MESSAGES.BUSINESS.RESERVATION_NOT_FOUND,
        REVIEW_PERMISSIONS.NOT_FOUND
      )
    }

    // 驗證預約狀態是否已完成或已過期（課程結束）
    // 允許 COMPLETED 或 OVERDUE 狀態評價
    // OVERDUE 表示課程已結束但尚未手動確認完成，此時學生可以評價
    if (reservation.student_status !== ReservationStatus.COMPLETED && 
        reservation.student_status !== ReservationStatus.OVERDUE) {
      throw new BusinessError(
        ERROR_CODES.REVIEW_RESERVATION_NOT_COMPLETED,
        MESSAGES.BUSINESS.REVIEW_RESERVATION_NOT_COMPLETED,
        REVIEW_VALIDATION_ERRORS.BAD_REQUEST
      )
    }

    // 檢查是否已經評價過
    const existingReview = await this.reviewRepository.findOne({
      where: { reservation_id: reservation.id }
    })

    if (existingReview) {
      throw new BusinessError(
        ERROR_CODES.REVIEW_ALREADY_EXISTS,
        MESSAGES.BUSINESS.REVIEW_ALREADY_EXISTS,
        REVIEW_PERMISSIONS.CONFLICT
      )
    }

    // 使用 Transaction 確保資料一致性
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 建立評價記錄
      const newReviewData = {
        uuid: uuidv4(),
        reservation_id: reservation.id,
        course_id: reservation.course_id,
        teacher_id: reservation.teacher_id,
        user_id: userId,
        rate: data.rate,
        comment: data.comment
      }

      const review = await queryRunner.manager.save(Review, newReviewData)

      // 如果學生狀態是 OVERDUE，評價後自動標記為 COMPLETED
      // 因為評價本身就代表學生認為課程已完成
      if (reservation.student_status === ReservationStatus.OVERDUE) {
        await queryRunner.manager.update(Reservation, reservation.id, {
          student_status: ReservationStatus.COMPLETED
        })
      }

      // 更新課程評分統計
      await this.updateCourseRatingStats(queryRunner, reservation.course_id)

      // 更新教師評分統計
      await this.updateTeacherRatingStats(queryRunner, reservation.teacher_id)

      await queryRunner.commitTransaction()

      return {
        id: review.id,
        rate: review.rate,
        comment: review.comment,
        created_at: review.created_at
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 取得課程評價列表
   */
  async getCourseReviews(courseUuid: string, queryParams: CourseReviewsQueryParams = {}) {
    const { page = 1, limit = 10, rating, sort_by = 'created_at', sort_order = 'desc' } = queryParams

    // 驗證 UUID 格式
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(courseUuid)) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_NOT_FOUND,
        REVIEW_PERMISSIONS.NOT_FOUND
      )
    }

    // 驗證課程是否存在且已發佈
    const course = await this.courseRepository.findOne({
      where: { 
        uuid: courseUuid,
        status: CourseStatus.PUBLISHED
      }
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_NOT_FOUND,
        REVIEW_PERMISSIONS.NOT_FOUND
      )
    }

    // 建立查詢 - 使用 leftJoin 提升效能，一次查詢取得所有需要的資料
    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('users', 'student_user', 'review.user_id = student_user.id')
      .select([
        'review.id',
        'review.uuid',
        'review.rate',
        'review.comment',
        'review.created_at',
        'student_user.nick_name as student_name',
        'student_user.avatar_image as student_avatar'
      ])
      .where('review.course_id = :courseId', { courseId: course.id })

    // 評分篩選
    if (rating) {
      queryBuilder.andWhere('review.rate = :rating', { rating: Number(rating) })
    }

    // 排序優化 - 使用索引友好的排序
    const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    if (sort_by === 'rating') {
      queryBuilder.orderBy('review.rate', orderDirection)
      queryBuilder.addOrderBy('review.created_at', 'DESC') // 相同評分時按時間排序
    } else {
      queryBuilder.orderBy('review.created_at', orderDirection)
    }

    // 分頁優化 - 計算 offset 並限制查詢範圍
    const offset = (Number(page) - 1) * Number(limit)
    queryBuilder.skip(offset).take(Number(limit))

    // 並行查詢優化 - 同時取得資料、總數和評分統計
    const [rawResults, total, ratingStats] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
      // 取得評分統計
      this.reviewRepository
        .createQueryBuilder('review')
        .select([
          'AVG(review.rate) as average_rating',
          'COUNT(CASE WHEN review.rate = 5 THEN 1 END) as rating_5_count',
          'COUNT(CASE WHEN review.rate = 4 THEN 1 END) as rating_4_count',
          'COUNT(CASE WHEN review.rate = 3 THEN 1 END) as rating_3_count',
          'COUNT(CASE WHEN review.rate = 2 THEN 1 END) as rating_2_count',
          'COUNT(CASE WHEN review.rate = 1 THEN 1 END) as rating_1_count'
        ])
        .where('review.course_id = :courseId', { courseId: course.id })
        .getRawOne()
    ])

    // 資料轉換優化 - 減少不必要的物件建立
    const reviews = rawResults.map(row => ({
      id: row.review_id,
      uuid: row.review_uuid,
      rate: row.review_rate,
      comment: row.review_comment,
      created_at: row.review_created_at,
      student: {
        name: row.student_name,
        avatar_image: row.student_avatar
      }
    }))

    return {
      reviews,
      pagination: {
        current_page: Number(page),
        per_page: Number(limit),
        total,
        total_pages: Math.ceil(total / Number(limit))
      },
      course: {
        id: course.id,
        uuid: course.uuid,
        name: course.name
      },
      rating_stats: {
        average_rating: ratingStats?.average_rating ? Number(ratingStats.average_rating).toFixed(1) : '0.0',
        total_reviews: total,
        rating_distribution: {
          5: Number(ratingStats?.rating_5_count || 0),
          4: Number(ratingStats?.rating_4_count || 0),
          3: Number(ratingStats?.rating_3_count || 0),
          2: Number(ratingStats?.rating_2_count || 0),
          1: Number(ratingStats?.rating_1_count || 0)
        }
      }
    }
  }

  /**
   * 取得我的評價列表
   */
  async getMyReviews(userId: number, queryParams: MyReviewsQueryParams = {}) {
    const { page = 1, limit = 10, course_id, sort_by = 'created_at', sort_order = 'desc' } = queryParams

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('courses', 'course', 'review.course_id = course.id')
      .leftJoin('teachers', 'teacher', 'review.teacher_id = teacher.id')
      .leftJoin('users', 'teacher_user', 'teacher.user_id = teacher_user.id')
      .select([
        'review.id',
        'review.uuid',
        'review.rate',
        'review.comment',
        'review.created_at',
        'course.id as course_id',
        'course.uuid as course_uuid',
        'course.name as course_name',
        'teacher.id as teacher_id',
        'teacher_user.nick_name as teacher_name'
      ])
      .where('review.user_id = :userId', { userId })

    if (course_id) {
      queryBuilder.andWhere('review.course_id = :courseId', { courseId: course_id })
    }

    // 排序
    const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    if (sort_by === 'rating') {
      queryBuilder.orderBy('review.rate', orderDirection)
    } else {
      queryBuilder.orderBy('review.created_at', orderDirection)
    }

    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    const [rawResults, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount()
    ])

    const reviews = rawResults.map(row => ({
      id: row.review_id,
      uuid: row.review_uuid,
      rate: row.review_rate,
      comment: row.review_comment,
      created_at: row.review_created_at,
      course: {
        id: row.course_id,
        uuid: row.course_uuid,
        name: row.course_name
      },
      teacher: {
        id: row.teacher_id,
        name: row.teacher_name
      }
    }))

    return {
      reviews,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 取得教師收到的評價列表
   */
  async getReceivedReviews(userId: number, queryParams: ReceivedReviewsQueryParams = {}) {
    // 驗證使用者是否為教師
    const teacher = await this.teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new BusinessError(
        ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
        MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED,
        REVIEW_PERMISSIONS.FORBIDDEN
      )
    }

    const { page = 1, limit = 10, course_id, rating, sort_by = 'created_at', sort_order = 'desc' } = queryParams

    const queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .leftJoin('users', 'student_user', 'review.user_id = student_user.id')
      .leftJoin('courses', 'course', 'review.course_id = course.id')
      .select([
        'review.id',
        'review.uuid',
        'review.rate',
        'review.comment',
        'review.created_at',
        'student_user.nick_name as student_name',
        'course.id as course_id',
        'course.uuid as course_uuid',
        'course.name as course_name'
      ])
      .where('review.teacher_id = :teacherId', { teacherId: teacher.id })

    if (course_id) {
      queryBuilder.andWhere('review.course_id = :courseId', { courseId: course_id })
    }

    if (rating) {
      queryBuilder.andWhere('review.rate = :rating', { rating })
    }

    // 排序
    const orderDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
    if (sort_by === 'rating') {
      queryBuilder.orderBy('review.rate', orderDirection)
    } else {
      queryBuilder.orderBy('review.created_at', orderDirection)
    }

    const offset = (page - 1) * limit
    queryBuilder.skip(offset).take(limit)

    const [rawResults, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount()
    ])

    const reviews = rawResults.map(row => ({
      id: row.review_id,
      uuid: row.review_uuid,
      rate: row.review_rate,
      comment: row.review_comment,
      created_at: row.review_created_at,
      student: {
        name: row.student_name
      },
      course: {
        id: row.course_id,
        uuid: row.course_uuid,
        name: row.course_name
      }
    }))

    return {
      reviews,
      pagination: {
        current_page: page,
        per_page: limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 更新課程評分統計
   */
  private async updateCourseRatingStats(queryRunner: QueryRunner, courseId: number): Promise<void> {
    // 計算課程的平均評分和評價數量
    const result = await queryRunner.manager
      .createQueryBuilder(Review, 'review')
      .select('AVG(review.rate)', 'avgRating')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.course_id = :courseId', { courseId })
      .getRawOne()

    const avgRating = parseFloat(result.avgRating) || 0
    const reviewCount = parseInt(result.reviewCount) || 0

    // 更新課程表的統計資訊
    await queryRunner.manager.update(Course, courseId, {
      rate: Math.round(avgRating * 100) / 100,
      review_count: reviewCount
    })

    // 更新或建立課程評分統計表
    const existingStat = await queryRunner.manager.findOne(CourseRatingStat, {
      where: { course_id: courseId }
    })

    // 計算各評分的數量
    const ratingCounts = await queryRunner.manager
      .createQueryBuilder(Review, 'review')
      .select('review.rate', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.course_id = :courseId', { courseId })
      .groupBy('review.rate')
      .getRawMany()

    const ratingDistribution = {
      rating_1_count: 0,
      rating_2_count: 0,
      rating_3_count: 0,
      rating_4_count: 0,
      rating_5_count: 0
    }

    ratingCounts.forEach((item: { rating: string; count: string }) => {
      const rating = parseInt(item.rating)
      const count = parseInt(item.count)
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[`rating_${rating}_count` as keyof typeof ratingDistribution] = count
      }
    })

    if (existingStat) {
      await queryRunner.manager.update(CourseRatingStat, existingStat.id, {
        ...ratingDistribution
      })
    } else {
      const newStat = {
        course_id: courseId,
        ...ratingDistribution
      }
      await queryRunner.manager.save(CourseRatingStat, newStat)
    }
  }

  /**
   * 更新教師評分統計
   */
  private async updateTeacherRatingStats(queryRunner: QueryRunner, teacherId: number): Promise<void> {
    // 計算教師的平均評分
    const result = await queryRunner.manager
      .createQueryBuilder(Review, 'review')
      .select('AVG(review.rate)', 'avgRating')
      .where('review.teacher_id = :teacherId', { teacherId })
      .getRawOne()

    const avgRating = parseFloat(result.avgRating) || 0

    // 更新教師表的評分
    await queryRunner.manager.update(Teacher, teacherId, {
      average_rating: Math.round(avgRating * 100) / 100
    })
  }
}

// 匯出服務實例
export const reviewService = new ReviewService()