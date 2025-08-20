/**
 * 評價測試 Helper 函式
 * 遵循 TDD 指示文件：建立測試輔助工具，簡化評價相關的測試資料準備和驗證
 */

import { dataSource } from '@db/data-source'
import { Review } from '@entities/Review'
import { Course } from '@entities/Course'
import { Teacher } from '@entities/Teacher'
import { Reservation } from '@entities/Reservation'
import { User } from '@entities/User'
import { CourseRatingStat } from '@entities/CourseRatingStat'
import { ReservationStatus, CourseStatus, UserRole, AccountStatus, ApplicationStatus } from '@entities/enums'
import { validReviewCreateData, validReviewData } from '@tests/fixtures/reviewFixtures'
import { ReviewCreateData } from '@models/review'
import { v4 as uuidv4 } from 'uuid'

/**
 * 評價相關測試 Helper 函式
 */
export class ReviewTestHelpers {
  /**
   * 建立測試用的已完成預約
   */
  static async createCompletedReservation(overrides: Partial<any> = {}) {
    // 先建立使用者（學生）
    const userRepository = dataSource.getRepository(User)
    const studentData = {
      email: 'student@test.com',
      nick_name: 'Test Student',
      password: 'hashed_password',
      role: UserRole.STUDENT,
      account_status: AccountStatus.ACTIVE,
      uuid: uuidv4(),
      ...overrides.studentData
    }
    const student = await userRepository.save(studentData)

    // 建立教師使用者
    const teacherUserData = {
      email: 'teacher@test.com',
      nick_name: 'Test Teacher',
      password: 'hashed_password',
      role: UserRole.TEACHER,
      account_status: AccountStatus.ACTIVE,
      uuid: uuidv4(),
      ...overrides.teacherUserData
    }
    const teacherUser = await userRepository.save(teacherUserData)

    // 建立教師記錄
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacherData = {
      uuid: uuidv4(),
      user_id: teacherUser.id,
      application_status: ApplicationStatus.APPROVED,
      ...overrides.teacherData
    }
    const teacher = await teacherRepository.save(teacherData)

    // 建立課程
    const courseRepository = dataSource.getRepository(Course)
    const courseData = {
      uuid: uuidv4(),
      teacher_id: teacher.id,
      name: 'Test Course',
      status: CourseStatus.PUBLISHED,
      rate: 0,
      review_count: 0,
      ...overrides.courseData
    }
    const course = await courseRepository.save(courseData)

    // 建立已完成的預約
    const reservationRepository = dataSource.getRepository(Reservation)
    const reservationData = {
      uuid: uuidv4(),
      course_id: course.id,
      teacher_id: teacher.id,
      student_id: student.id,
      reserve_time: new Date('2025-08-15 14:00:00'),
      teacher_status: ReservationStatus.COMPLETED,
      student_status: ReservationStatus.COMPLETED,
      ...overrides.reservationData
    }
    const reservation = await reservationRepository.save(reservationData)

    return {
      student,
      teacherUser,
      teacher,
      course,
      reservation
    }
  }

  /**
   * 建立測試用的評價記錄
   */
  static async createReviewEntity(reviewData: Partial<ReviewCreateData> = {}) {
    const reviewRepository = dataSource.getRepository(Review)
    const review = reviewRepository.create({
      uuid: uuidv4(),
      ...validReviewCreateData,
      ...reviewData
    })
    return await reviewRepository.save(review)
  }

  /**
   * 建立多個評價記錄（用於列表測試）
   */
  static async createMultipleReviews(count: number = 5, courseId: number, teacherId: number) {
    const reviews = []
    for (let i = 1; i <= count; i++) {
      // 建立學生
      const userRepository = dataSource.getRepository(User)
      const studentData = {
        email: `student${i}@test.com`,
        nick_name: `Student ${i}`,
        password: 'hashed_password',
        role: UserRole.STUDENT,
        account_status: AccountStatus.ACTIVE,
        uuid: uuidv4()
      }
      const student = await userRepository.save(studentData)

      // 建立預約
      const reservationRepository = dataSource.getRepository(Reservation)
      const reservation = reservationRepository.create({
        uuid: uuidv4(),
        course_id: courseId,
        teacher_id: teacherId,
        student_id: student.id,
        reserve_time: new Date(`2025-08-${10 + i} 14:00:00`),
        teacher_status: ReservationStatus.COMPLETED,
        student_status: ReservationStatus.COMPLETED
      })
      await reservationRepository.save(reservation)

      // 建立評價
      const review = await this.createReviewEntity({
        reservation_id: reservation.id,
        course_id: courseId,
        user_id: student.id,
        teacher_id: teacherId,
        rate: 5 - (i % 5), // 產生不同的評分
        comment: `這是第${i}個評價。老師教得很好，內容很實用！講解清晰，實作練習很有幫助。課程安排得很有條理，推薦給想學習的朋友。`
      })
      reviews.push(review)
    }
    return reviews
  }

  /**
   * 更新課程評分統計
   */
  static async updateCourseRatingStats(courseId: number) {
    const reviewRepository = dataSource.getRepository(Review)
    const courseRepository = dataSource.getRepository(Course)
    const courseRatingStatRepository = dataSource.getRepository(CourseRatingStat)

    // 計算平均評分和評價數量
    const reviews = await reviewRepository.find({
      where: { course_id: courseId, is_visible: true }
    })

    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rate, 0) / totalReviews 
      : 0

    // 更新課程統計
    await courseRepository.update(courseId, {
      rate: Number(averageRating.toFixed(2)),
      review_count: totalReviews
    })

    // 更新評分分佈統計
    const ratingCounts = {
      rating_1_count: reviews.filter(r => r.rate === 1).length,
      rating_2_count: reviews.filter(r => r.rate === 2).length,
      rating_3_count: reviews.filter(r => r.rate === 3).length,
      rating_4_count: reviews.filter(r => r.rate === 4).length,
      rating_5_count: reviews.filter(r => r.rate === 5).length
    }

    const existingStat = await courseRatingStatRepository.findOne({
      where: { course_id: courseId }
    })

    if (existingStat) {
      await courseRatingStatRepository.update(courseId, ratingCounts)
    } else {
      await courseRatingStatRepository.save({
        course_id: courseId,
        ...ratingCounts
      })
    }
  }

  /**
   * 清理評價測試資料
   */
  static async cleanupReviewTestData() {
    const reviewRepository = dataSource.getRepository(Review)
    const reservationRepository = dataSource.getRepository(Reservation)
    const courseRepository = dataSource.getRepository(Course)
    const teacherRepository = dataSource.getRepository(Teacher)
    const userRepository = dataSource.getRepository(User)
    const courseRatingStatRepository = dataSource.getRepository(CourseRatingStat)

    // 按照外鍵依賴順序清理
    await reviewRepository.clear()
    await courseRatingStatRepository.clear()
    await reservationRepository.clear()
    await courseRepository.clear()
    await teacherRepository.clear()
    await userRepository.clear()
  }

  /**
   * 驗證評價回應結構
   */
  static validateReviewResponse(review: any) {
    expect(review).toHaveProperty('id')
    expect(review).toHaveProperty('rate')
    expect(review).toHaveProperty('comment')
    expect(review).toHaveProperty('created_at')
    expect(typeof review.id).toBe('number')
    expect(typeof review.rate).toBe('number')
    expect(typeof review.comment).toBe('string')
    expect(typeof review.created_at).toBe('string')
  }

  /**
   * 驗證分頁回應結構
   */
  static validatePaginationResponse(pagination: any) {
    expect(pagination).toHaveProperty('current_page')
    expect(pagination).toHaveProperty('per_page')
    expect(pagination).toHaveProperty('total')
    expect(pagination).toHaveProperty('total_pages')
    expect(typeof pagination.current_page).toBe('number')
    expect(typeof pagination.per_page).toBe('number')
    expect(typeof pagination.total).toBe('number')
    expect(typeof pagination.total_pages).toBe('number')
  }

  /**
   * 驗證課程資訊回應結構
   */
  static validateCourseInfoResponse(courseInfo: any) {
    expect(courseInfo).toHaveProperty('id')
    expect(courseInfo).toHaveProperty('name')
    expect(courseInfo).toHaveProperty('average_rate')
    expect(courseInfo).toHaveProperty('review_count')
    expect(typeof courseInfo.id).toBe('number')
    expect(typeof courseInfo.name).toBe('string')
    expect(typeof courseInfo.average_rate).toBe('number')
    expect(typeof courseInfo.review_count).toBe('number')
  }

  /**
   * 建立測試用的未完成預約（用於測試評價條件）
   */
  static async createIncompleteReservation(overrides: Partial<any> = {}) {
    const testData = await this.createCompletedReservation(overrides)
    
    // 將預約狀態改為未完成
    const reservationRepository = dataSource.getRepository(Reservation)
    await reservationRepository.update(testData.reservation.id, {
      teacher_status: ReservationStatus.RESERVED,
      student_status: ReservationStatus.RESERVED
    })

    return testData
  }

  /**
   * 建立其他使用者的預約（用於測試權限控制）
   */
  static async createOtherUserReservation() {
    const userRepository = dataSource.getRepository(User)
    const otherUserData = {
      email: 'otheruser@test.com',
      nick_name: 'Other User',
      password: 'hashed_password',
      role: UserRole.STUDENT,
      account_status: AccountStatus.ACTIVE,
      uuid: uuidv4()
    }
    const otherUser = await userRepository.save(otherUserData)

    const testData = await this.createCompletedReservation({
      studentData: { id: otherUser.id }
    })

    return { ...testData, otherUser }
  }
}