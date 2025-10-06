/**
 * 首頁服務層
 *
 * 處理首頁相關的業務邏輯，包括：
 * - 評論摘要查詢
 * - 精選評論篩選
 */

import { Repository } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Review } from '@entities/Review'
import { User } from '@entities/User'
import { UserRole } from '@entities/UserRole'
import { UserRole as UserRoleEnum, CourseStatus, AccountStatus, ReservationStatus } from '@entities/enums'
import { Course } from '@entities/Course'
import { Teacher } from '@entities/Teacher'
import { MainCategory } from '@entities/MainCategory'
import { SubCategory } from '@entities/SubCategory'
import { City } from '@entities/City'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { TeacherAvailableSlot } from '@entities/TeacherAvailableSlot'
import { Video } from '@entities/Video'
import { CourseVideo } from '@entities/CourseVideo'
import { Reservation } from '@entities/Reservation'
import { TimeUtils } from '@utils/TimeUtils'

// 推薦課程項目介面
export interface RecommendedCourseItem {
  courseId: number
  title: string
  description: string
  coverImage: string
  teacher: {
    id: number
    name: string
    avatar: string
  }
  priceRange: {
    min: number
    perUnit: string
  }
  mainCategory: {
    id: number
    name: string
  }
  subCategory: {
    id: number
    name: string
  }
  rating: {
    average: number
    count: number
  }
  city: {
    id: number
    name: string
  }
}

// 推薦課程回應介面
export interface RecommendedCoursesResponse {
  courses: RecommendedCourseItem[]
}

export class HomeService {
  private reviewRepository: Repository<Review>
  private userRepository: Repository<User>
  private userRoleRepository: Repository<UserRole>
  private courseRepository: Repository<Course>
  private teacherRepository: Repository<Teacher>
  private mainCategoryRepository: Repository<MainCategory>
  private subCategoryRepository: Repository<SubCategory>
  private cityRepository: Repository<City>
  private priceOptionRepository: Repository<CoursePriceOption>
  private teacherAvailableSlotRepository: Repository<TeacherAvailableSlot>
  private videoRepository: Repository<Video>
  private courseVideoRepository: Repository<CourseVideo>
  private reservationRepository: Repository<Reservation>

  constructor() {
    this.reviewRepository = dataSource.getRepository(Review)
    this.userRepository = dataSource.getRepository(User)
    this.userRoleRepository = dataSource.getRepository(UserRole)
    this.courseRepository = dataSource.getRepository(Course)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.mainCategoryRepository = dataSource.getRepository(MainCategory)
    this.subCategoryRepository = dataSource.getRepository(SubCategory)
    this.cityRepository = dataSource.getRepository(City)
    this.priceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.teacherAvailableSlotRepository = dataSource.getRepository(TeacherAvailableSlot)
    this.videoRepository = dataSource.getRepository(Video)
    this.courseVideoRepository = dataSource.getRepository(CourseVideo)
    this.reservationRepository = dataSource.getRepository(Reservation)
  }

  /**
   * 取得首頁評論摘要
   * @param limit 精選評論數量（預設 6）
   */
  async getReviewsSummary(limit: number = 6) {
    // 1. 計算整體平均評分
    const overallRatingResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rate)', 'avgRating')
      .where('review.is_visible = :isVisible', { isVisible: true })
      .andWhere('review.deleted_at IS NULL')
      .getRawOne()

    const overallRating = overallRatingResult?.avgRating ? Math.round(parseFloat(overallRatingResult.avgRating) * 10) / 10 : 0

    // 2. 取得精選評論
    // 使用 TypeORM QueryBuilder 查詢所有符合條件的評論
    // 查詢 limit * 3 筆，以便在應用層去重後仍有足夠數據
    const allReviews = await this.reviewRepository
      .createQueryBuilder('review')
      .innerJoin('users', 'u', 'u.id = review.user_id')
      .innerJoin('user_roles', 'user_role', 'user_role.user_id = u.id')
      .select([
        'review.id as review_id',
        'review.user_id as user_id',
        'review.comment as comment',
        'review.created_at as created_at',
        'u.nick_name as student_name',
        'u.avatar_image as avatar_image',
        'u.avatar_google_url as avatar_google_url'
      ])
      .where('review.is_visible = :isVisible', { isVisible: true })
      .andWhere('review.deleted_at IS NULL')
      .andWhere('review.rate >= :minRate', { minRate: 4 })
      .andWhere('LENGTH(review.comment) >= :minLength', { minLength: 20 })
      .andWhere('user_role.role = :role', { role: UserRoleEnum.STUDENT })
      .andWhere('user_role.is_active = :isActive', { isActive: true })
      .andWhere('u.deleted_at IS NULL')
      .orderBy('review.created_at', 'DESC')
      .limit(limit * 3)
      .getRawMany()

    // 應用層去重：每個學生只保留最新的一則評論
    const userIdsSeen = new Set<number>()
    const uniqueReviews = []

    for (const review of allReviews) {
      if (!userIdsSeen.has(review.user_id)) {
        userIdsSeen.add(review.user_id)
        uniqueReviews.push(review)

        if (uniqueReviews.length >= limit) {
          break
        }
      }
    }

    // 格式化返回結果
    const formattedReviews = uniqueReviews.map(review => ({
      reviewId: review.review_id,
      student: {
        name: review.student_name,
        avatar: review.avatar_image || review.avatar_google_url || null
      },
      title: '', // 根據需求，目前評論沒有標題欄位
      content: review.comment,
      createdAt: new Date(review.created_at).toISOString()
    }))

    return {
      overallRating,
      featuredReviews: formattedReviews
    }
  }

  /**
   * 取得首頁短影音列表
   *
   * 排序邏輯（優先權由高到低）：
   * a. 課程評分高（>= 4.5）
   * b. 近期熱門（最近 30 天內預約數多）
   * c. 影片完整度（有標題、videoUrl）
   * d. 最新發布（createdAt DESC）
   *
   * @param mainCategoryId 主分類 ID 篩選（可選）
   * @param limit 返回數量（預設 5）
   */
  async getShortVideos(mainCategoryId?: number, limit: number = 5) {
    // 計算 30 天前的日期（台灣時區）
    const thirtyDaysAgo = TimeUtils.getTaiwanTime()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // 建立複雜查詢：連接多個表並計算排序依據
    let queryBuilder = this.videoRepository
      .createQueryBuilder('video')
      // 連接 CourseVideo 表（多對多關聯）
      .innerJoin(CourseVideo, 'cv', 'cv.video_id = video.id')
      // 連接 Course 表
      .innerJoin(Course, 'course', 'course.id = cv.course_id')
      // 連接 Teacher 表
      .innerJoin(Teacher, 'teacher', 'teacher.id = course.teacher_id')
      // 連接 User 表（教師的用戶資料）
      .innerJoin(User, 'user', 'user.id = teacher.user_id')
      // 左連接 MainCategory 表
      .leftJoin(MainCategory, 'main_category', 'main_category.id = course.main_category_id')
      // 左連接 Reservation（用於計算近期熱門度）
      .leftJoin(
        Reservation,
        'reservation',
        `reservation.course_id = course.id
         AND reservation.created_at >= :thirtyDaysAgo
         AND reservation.teacher_status::text = :completedStatus
         AND reservation.student_status::text = :completedStatus
         AND reservation.deleted_at IS NULL`,
        {
          thirtyDaysAgo,
          completedStatus: ReservationStatus.COMPLETED
        }
      )
      // 基本篩選條件
      .where('video.deleted_at IS NULL')
      .andWhere('course.status = :publishedStatus', { publishedStatus: CourseStatus.PUBLISHED })
      .andWhere('course.deleted_at IS NULL')

    // 如果指定主分類，則篩選
    if (mainCategoryId) {
      queryBuilder = queryBuilder.andWhere('course.main_category_id = :mainCategoryId', { mainCategoryId })
    }

    // 選擇需要的欄位和計算值
    queryBuilder = queryBuilder
      .select([
        'video.id AS video_id',
        'video.name AS video_name',
        'video.url AS video_url',
        'video.created_at AS video_created_at',
        'course.id AS course_id',
        'course.name AS course_name',
        'course.rate AS course_rate',
        'course.main_category_id AS main_category_id',
        'teacher.id AS teacher_id',
        'user.nick_name AS teacher_name',
        'main_category.name AS main_category_name',
        // 計算課程是否高評分（>= 4.5）
        'CASE WHEN course.rate >= 4.5 THEN 1 ELSE 0 END AS is_high_rated',
        // 計算近 30 天預約數
        'COUNT(DISTINCT reservation.id) AS recent_reservation_count',
        // 計算影片完整度（1: 完整, 0: 不完整）
        `CASE
          WHEN video.name IS NOT NULL
           AND video.name != ''
           AND video.url IS NOT NULL
           AND video.url != ''
          THEN 1
          ELSE 0
        END AS is_complete`
      ])
      .groupBy('video.id')
      .addGroupBy('course.id')
      .addGroupBy('teacher.id')
      .addGroupBy('user.id')
      .addGroupBy('main_category.id')
      // 排序邏輯：優先權由高到低
      .orderBy('is_high_rated', 'DESC') // a. 高評分優先
      .addOrderBy('recent_reservation_count', 'DESC') // b. 近期熱門
      .addOrderBy('is_complete', 'DESC') // c. 影片完整度
      .addOrderBy('video.created_at', 'DESC') // d. 最新發布
      .limit(limit)

    // 執行查詢
    const rawResults = await queryBuilder.getRawMany()

    // 轉換為回應格式
    const videos = rawResults.map(row => ({
      videoId: parseInt(row.video_id),
      courseId: parseInt(row.course_id),
      title: row.video_name || '',
      thumbnailUrl: row.video_url || '', // 注意：Video 表目前沒有獨立的 thumbnail 欄位，使用 url 作為替代
      videoUrl: row.video_url || '',
      duration: 0, // 注意：Video 表目前沒有 duration 欄位，預設為 0
      mainCategory: {
        id: row.main_category_id ? parseInt(row.main_category_id) : 0,
        name: row.main_category_name || '未分類'
      },
      course: {
        id: parseInt(row.course_id),
        title: row.course_name || ''
      },
      teacher: {
        id: parseInt(row.teacher_id),
        name: row.teacher_name || ''
      }
    }))

    return { videos }
  }

  /**
   * 取得推薦課程
   *
   * 排序邏輯（優先權由高到低）：
   * 1. 地區匹配優先（如果有 cityId，該地區課程排前面）
   * 2. 評分加權：(平均評分 × 0.7) + (評論數量 × 0.3 / 100)
   * 3. 可預約性：教師有設定 TeacherAvailableSlot
   * 4. 課程完整度：有 coverImage, description, price
   *
   * 多樣性控制：同一教師最多 1 堂課
   * 過濾條件：課程狀態為已發布、教師帳號為啟用狀態
   *
   * @param cityId - 可選的縣市 ID 篩選
   * @param limit - 返回數量，預設 6
   * @returns 推薦課程列表
   */
  async getRecommendedCourses(cityId?: number, limit: number = 6): Promise<RecommendedCoursesResponse> {
    // 如果有 cityId，先取得對應的城市名稱
    let cityName: string | null = null
    if (cityId) {
      const cityRecord = await this.cityRepository.findOne({ where: { id: cityId } })
      cityName = cityRecord?.city_name || null
    }

    // 使用 TypeORM QueryBuilder 查詢課程
    // 一次性 JOIN 所有需要的關聯資料，避免 N+1 查詢
    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoin('teachers', 'teacher', 'teacher.id = course.teacher_id')
      .leftJoin('users', 'user', 'user.id = teacher.user_id')
      .leftJoin('main_categories', 'mainCategory', 'mainCategory.id = course.main_category_id')
      .leftJoin('sub_categories', 'subCategory', 'subCategory.id = course.sub_category_id')
      .leftJoin('course_price_options', 'priceOption', 'priceOption.course_id = course.id AND priceOption.is_active = :priceActive', { priceActive: true })
      .leftJoin('teacher_available_slots', 'availableSlot', 'availableSlot.teacher_id = teacher.id AND availableSlot.is_active = :slotActive', { slotActive: true })
      .select([
        'course.id',
        'course.teacher_id',
        'course.name',
        'course.content',
        'course.main_image',
        'course.rate',
        'course.review_count',
        'course.main_category_id',
        'course.sub_category_id',
        'course.city',
        'teacher.id',
        'user.id',
        'user.nick_name',
        'user.avatar_image',
        'user.avatar_google_url',
        'mainCategory.id',
        'mainCategory.name',
        'subCategory.id',
        'subCategory.name'
      ])
      .addSelect('MIN(priceOption.price)', 'min_price')
      .addSelect('COUNT(DISTINCT availableSlot.id)', 'slot_count')
      .where('course.status = :status', { status: CourseStatus.PUBLISHED })
      .andWhere('user.account_status = :accountStatus', { accountStatus: AccountStatus.ACTIVE })
      .andWhere('course.deleted_at IS NULL')
      .groupBy('course.id')
      .addGroupBy('teacher.id')
      .addGroupBy('user.id')
      .addGroupBy('mainCategory.id')
      .addGroupBy('subCategory.id')

    // 如果有指定城市，加入城市篩選條件
    if (cityName) {
      queryBuilder.andWhere('course.city = :cityName', { cityName })
    }

    // 查詢 limit * 3 筆資料，以便後續在應用層過濾（同一教師最多 1 堂課）
    queryBuilder.limit(limit * 3)

    // 執行查詢並取得原始資料
    const rawResults = await queryBuilder.getRawMany()

    // 計算每個課程的評分並排序
    const coursesWithScores = rawResults.map(row => {
      const minPrice = row.min_price ? parseFloat(row.min_price) : 0
      const slotCount = row.slot_count ? parseInt(row.slot_count) : 0

      // 計算排序分數
      // 1. 地區匹配分數
      const cityMatchScore = cityName && row.course_city === cityName ? 1000 : 0

      // 2. 評分加權分數：(平均評分 × 0.7) + (評論數量 × 0.3 / 100)
      const ratingScore = ((row.course_rate || 0) * 0.7 + (row.course_review_count || 0) * 0.3 / 100) * 10

      // 3. 可預約性分數
      const bookableScore = slotCount > 0 ? 10 : 0

      // 4. 課程完整度分數
      const completenessScore =
        (row.course_main_image ? 1 : 0) + (row.course_content ? 1 : 0) + (minPrice > 0 ? 1 : 0)

      // 總分
      const totalScore = cityMatchScore + ratingScore + bookableScore + completenessScore

      return {
        row,
        minPrice,
        slotCount,
        totalScore
      }
    })

    // 按總分排序（降序）
    coursesWithScores.sort((a, b) => b.totalScore - a.totalScore)

    // 應用層過濾：確保同一教師最多一堂課
    const teacherIds = new Set<number>()
    const filteredCourses = []

    for (const item of coursesWithScores) {
      const teacherId = item.row.teacher_id
      if (teacherId && !teacherIds.has(teacherId)) {
        teacherIds.add(teacherId)
        filteredCourses.push(item)

        if (filteredCourses.length >= limit) {
          break
        }
      }
    }

    // 格式化結果
    const courses: RecommendedCourseItem[] = filteredCourses.map(item => {
      const row = item.row

      // 處理描述（截取前 100 字）
      let description = row.course_content || ''
      if (description.length > 100) {
        description = description.substring(0, 100) + '...'
      }

      // 處理頭像
      const avatar = row.user_avatar_image || row.user_avatar_google_url || ''

      // 取得城市資訊（Course 的 city 欄位是 string，所以 cityId 暫時設為 0）
      const cityId = 0
      const cityDisplayName = row.course_city || ''

      return {
        courseId: row.course_id,
        title: row.course_name || '',
        description,
        coverImage: row.course_main_image || '',
        teacher: {
          id: row.teacher_id || 0,
          name: row.user_nick_name || '',
          avatar
        },
        priceRange: {
          min: item.minPrice,
          perUnit: '堂'
        },
        mainCategory: {
          id: row.mainCategory_id || 0,
          name: row.mainCategory_name || ''
        },
        subCategory: {
          id: row.subCategory_id || 0,
          name: row.subCategory_name || ''
        },
        rating: {
          average: row.course_rate || 0,
          count: row.course_review_count || 0
        },
        city: {
          id: cityId,
          name: cityDisplayName
        }
      }
    })

    return { courses }
  }
}

// 匯出服務實例
export const homeService = new HomeService()
