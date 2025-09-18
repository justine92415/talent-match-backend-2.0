/**
 * 公開課程服務層（簡化版）
 * 
 * 處理公開課程瀏覽、搜尋相關業務邏輯
 * 提供給未認證和已認證用戶的課程瀏覽功能
 * 
 * 效能優化說明：
 * 1. 使用批次查詢避免 N+1 問題
 * 2. 將瀏覽次數更新改為異步執行
 * 3. 實作價格排序功能
 * 4. 建議資料庫索引：
 *    - courses: (status, created_at, student_count)
 *    - courses: (name, content) - 全文搜索索引
 *    - courses: (main_category_id, sub_category_id, city, district, address)
 *    - course_price_options: (course_id, is_active, price)
 */

import { Repository, SelectQueryBuilder } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { Review } from '@entities/Review'
import { MainCategory } from '@entities/MainCategory'
import { SubCategory } from '@entities/SubCategory'
import { City } from '@entities/City'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { TeacherCertificate } from '@entities/TeacherCertificate'
import { TeacherWorkExperience } from '@entities/TeacherWorkExperience'
import { TeacherLearningExperience } from '@entities/TeacherLearningExperience'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { CourseStatus } from '@entities/enums'
import { PublicCourseListResponse, PublicCourseDetailResponse, CourseReviewListResponse, PublicCourseItem } from '../types/publicCourse.interface'

// 簡化的查詢介面
export interface SimpleCourseQuery {
  keyword?: string
  main_category_id?: number
  sub_category_id?: number
  city?: string
  sort?: 'newest' | 'popular' | 'price_low' | 'price_high'
  page?: number
  per_page?: number
}

export interface SimpleReviewQuery {
  page?: number
  per_page?: number
  rating?: number
  sort?: 'newest' | 'oldest' | 'rating_high' | 'rating_low'
}

// 常數定義
const DEFAULT_PAGINATION = {
  PAGE: 1,
  PER_PAGE: 12,
  MAX_PER_PAGE: 100
} as const

const DEFAULT_CATEGORY = {
  ID: 0,
  NAME: '未分類'
} as const

const DEFAULT_CITY = {
  ID: 0,
  NAME: '未指定'
} as const

const DEFAULT_TEACHER = {
  ID: 0,
  NICKNAME: '未知教師',
  TEACHING_YEARS: 0
} as const

const SORT_OPTIONS = {
  NEWEST: 'newest',
  POPULAR: 'popular',
  PRICE_LOW: 'price_low',
  PRICE_HIGH: 'price_high'
} as const

export class PublicCourseService {
  private courseRepository: Repository<Course>
  private teacherRepository: Repository<Teacher>
  private userRepository: Repository<User>
  private reviewRepository: Repository<Review>
  private mainCategoryRepository: Repository<MainCategory>
  private subCategoryRepository: Repository<SubCategory>
  private cityRepository: Repository<City>
  private coursePriceOptionRepository: Repository<CoursePriceOption>
  private teacherCertificateRepository: Repository<TeacherCertificate>
  private teacherWorkExperienceRepository: Repository<TeacherWorkExperience>
  private teacherLearningExperienceRepository: Repository<TeacherLearningExperience>

  constructor() {
    this.courseRepository = dataSource.getRepository(Course)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
    this.reviewRepository = dataSource.getRepository(Review)
    this.mainCategoryRepository = dataSource.getRepository(MainCategory)
    this.subCategoryRepository = dataSource.getRepository(SubCategory)
    this.cityRepository = dataSource.getRepository(City)
    this.coursePriceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.teacherCertificateRepository = dataSource.getRepository(TeacherCertificate)
    this.teacherWorkExperienceRepository = dataSource.getRepository(TeacherWorkExperience)
    this.teacherLearningExperienceRepository = dataSource.getRepository(TeacherLearningExperience)
  }

  /**
   * 取得公開課程列表（含搜尋功能）
   */
  async getPublicCourses(query: SimpleCourseQuery): Promise<PublicCourseListResponse> {
    const {
      keyword,
      main_category_id,
      sub_category_id,
      city,
      sort = 'newest',
      page = DEFAULT_PAGINATION.PAGE,
      per_page = DEFAULT_PAGINATION.PER_PAGE
    } = query

    // 建立查詢建構器與篩選條件
    let queryBuilder = this.buildQueryBuilder(query)

    // 應用排序邏輯
    queryBuilder = this.applySortOrder(queryBuilder, sort)

    // 分頁邏輯
    const offset = (page - 1) * per_page
    queryBuilder = queryBuilder.skip(offset).take(per_page)

    // 執行查詢
    const [courses, total] = await queryBuilder.getManyAndCount()

    return this.buildCoursesResponse(courses, total, page, per_page, query)
  }

  /**
   * 私有方法：建構查詢建構器與篩選條件
   */
  private buildQueryBuilder(query: SimpleCourseQuery) {
    const { keyword, main_category_id, sub_category_id, city } = query
    
    // 建立基本查詢條件
    const whereConditions: Record<string, string | number> = { status: CourseStatus.PUBLISHED }

    // 分類篩選
    if (main_category_id) whereConditions.main_category_id = main_category_id
    if (sub_category_id) whereConditions.sub_category_id = sub_category_id

    // 建立查詢建構器
    let queryBuilder = this.courseRepository.createQueryBuilder('course')
      .where(whereConditions)

    // 城市篩選
    if (city) {
      queryBuilder = queryBuilder.andWhere('course.city ILIKE :city', { city: `%${city}%` })
    }

    // 關鍵字搜尋
    if (keyword) {
      queryBuilder = queryBuilder.andWhere(
        '(course.name ILIKE :keyword OR course.content ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
    }

    return queryBuilder
  }

  /**
   * 私有方法：應用排序規則
   */
  private applySortOrder(queryBuilder: SelectQueryBuilder<Course>, sort: string) {
    switch (sort) {
      case SORT_OPTIONS.NEWEST:
        return queryBuilder.orderBy('course.created_at', 'DESC')
      case SORT_OPTIONS.POPULAR:
        return queryBuilder.orderBy('course.student_count', 'DESC')
      case SORT_OPTIONS.PRICE_LOW:
        return queryBuilder
          .leftJoin('course_price_options', 'cpo', 'cpo.course_id = course.id AND cpo.is_active = true')
          .orderBy('MIN(cpo.price)', 'ASC', 'NULLS LAST')
          .groupBy('course.id')
      case SORT_OPTIONS.PRICE_HIGH:
        return queryBuilder
          .leftJoin('course_price_options', 'cpo', 'cpo.course_id = course.id AND cpo.is_active = true')
          .orderBy('MAX(cpo.price)', 'DESC', 'NULLS LAST')
          .groupBy('course.id')
      default:
        return queryBuilder.orderBy('course.created_at', 'DESC')
    }
  }

  /**
   * 私有方法：建構課程列表回應
   */
  private async buildCoursesResponse(courseList: Course[], total: number, page: number, per_page: number, query: SimpleCourseQuery): Promise<PublicCourseListResponse> {
    const courses = await this.buildCourseListItems(courseList)
    
    return {
      courses,
      pagination: {
        current_page: page,
        per_page,
        total,
        total_pages: Math.ceil(total / per_page)
      },
      filters: {
        sort: query.sort || 'newest',
        main_category_id: query.main_category_id,
        sub_category_id: query.sub_category_id,
        city: query.city,
        keyword: query.keyword
      }
    }
  }

  /**
   * 取得公開課程詳情
   */
  async getPublicCourseDetail(courseId: number): Promise<PublicCourseDetailResponse> {
    // 驗證課程存在且已發布
    const course = await this.validateAndGetCourse(courseId)

    // 增加瀏覽次數（異步執行，不影響回應時間）
    this.courseRepository.increment({ id: courseId }, 'view_count', 1).catch(console.error)

    // 並行查詢相關資訊和價格選項
    const [teacher, mainCategory, subCategory, priceOptions, teacherCertificates, teacherWorkExperiences, teacherLearningExperiences] = await Promise.all([
      this.getTeacherByCourseId(course.teacher_id),
      this.getMainCategoryById(course.main_category_id),
      this.getSubCategoryById(course.sub_category_id),
      this.coursePriceOptionRepository.find({
        where: { course_id: courseId, is_active: true },
        order: { price: 'ASC' }
      }),
      // 查詢教師證書
      this.teacherCertificateRepository.find({
        where: { teacher_id: course.teacher_id },
        order: { created_at: 'DESC' }
      }),
      // 查詢教師工作經驗
      this.teacherWorkExperienceRepository.find({
        where: { teacher_id: course.teacher_id },
        order: { start_year: 'DESC', start_month: 'DESC' }
      }),
      // 查詢教師學習經歷
      this.teacherLearningExperienceRepository.find({
        where: { teacher_id: course.teacher_id },
        order: { start_year: 'DESC', start_month: 'DESC' }
      })
    ])

    return this.buildCourseDetailResponse(course, teacher, mainCategory, subCategory, priceOptions, teacherCertificates, teacherWorkExperiences, teacherLearningExperiences)
  }

  /**
   * 私有方法：驗證並取得課程
   */
  private async validateAndGetCourse(courseId: number) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId }
    })

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }

    if (course.status !== CourseStatus.PUBLISHED) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_PUBLISHED, MESSAGES.BUSINESS.COURSE_NOT_PUBLISHED, 404)
    }

    return course
  }

  /**
   * 私有方法：根據教師 ID 取得教師資訊
   */
  private async getTeacherByCourseId(teacherId: number) {
    return await this.teacherRepository
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.user', 'user')
      .where('teacher.id = :teacherId', { teacherId })
      .getOne()
  }

  /**
   * 私有方法：取得主分類資訊
   */
  private async getMainCategoryById(categoryId: number | null): Promise<MainCategory | null> {
    return categoryId
      ? await this.mainCategoryRepository.findOne({ where: { id: categoryId } })
      : null
  }

  /**
   * 私有方法：取得子分類資訊
   */
  private async getSubCategoryById(categoryId: number | null): Promise<SubCategory | null> {
    return categoryId
      ? await this.subCategoryRepository.findOne({ where: { id: categoryId } })
      : null
  }

  /**
   * 私有方法：取得分類資訊
   */
  private async getCategoryById(repository: Repository<MainCategory | SubCategory>, categoryId: number | null) {
    return categoryId 
      ? await repository.findOne({ where: { id: categoryId } })
      : null
  }

  /**
   * 私有方法：取得城市資訊
   */
  private async getCityById(cityId: number | null) {
    return cityId
      ? await this.cityRepository.findOne({ where: { id: cityId } })
      : null
  }

  /**
   * 私有方法：建構課程詳情回應
   */
  private buildCourseDetailResponse(
    course: Course, 
    teacher: Teacher & { user?: User } | null, 
    mainCategory: MainCategory | null, 
    subCategory: SubCategory | null, 
    priceOptions: CoursePriceOption[] = [],
    teacherCertificates: TeacherCertificate[] = [],
    teacherWorkExperiences: TeacherWorkExperience[] = [],
    teacherLearningExperiences: TeacherLearningExperience[] = []
  ): PublicCourseDetailResponse {
    return {
      course: {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        content: course.content || undefined,
        main_image: course.main_image || undefined,
        rate: course.rate,
        review_count: course.review_count,
        student_count: course.student_count,
        purchase_count: course.purchase_count || 0,
        survey_url: course.survey_url || undefined,
        purchase_message: course.purchase_message || undefined,
        city: course.city || undefined,
        district: course.district || undefined,
        address: course.address || undefined,
        main_category: mainCategory ? {
          id: mainCategory.id,
          name: mainCategory.name
        } : { id: 0, name: DEFAULT_CATEGORY.NAME },
        sub_category: subCategory ? {
          id: subCategory.id,
          name: subCategory.name
        } : { id: 0, name: DEFAULT_CATEGORY.NAME },
        created_at: course.created_at.toISOString()
      },
      teacher: teacher && teacher.user ? {
        id: teacher.id,
        user: {
          name: teacher.user.name || '',
          nick_name: teacher.user.nick_name,
          avatar_image: teacher.user.avatar_image || ''
        },
        city: teacher.city || '',
        district: teacher.district || '',
        address: teacher.address || '',
        introduction: teacher.introduction || '',
        total_students: 0, // TODO: 實際計算
        total_courses: 0,  // TODO: 實際計算
        average_rating: 0  // TODO: 實際計算
      } : {
        id: 0,
        user: {
          name: DEFAULT_TEACHER.NICKNAME,
          nick_name: DEFAULT_TEACHER.NICKNAME,
          avatar_image: ''
        },
        city: '',
        district: '',
        address: '',
        introduction: '',
        total_students: 0,
        total_courses: 0,
        average_rating: 0
      },
      price_options: priceOptions.map(option => ({
        id: option.id,
        uuid: option.uuid,
        price: parseFloat(option.price.toString()),
        quantity: option.quantity
      })),
      videos: [], // TODO: 查詢課程影片
      files: [], // TODO: 查詢課程檔案
      available_slots: [], // TODO: 查詢可預約時段
      recent_reviews: [], // TODO: 查詢最近評價
      recommended_courses: [], // TODO: 查詢推薦課程
      teacher_certificates: teacherCertificates.map(cert => ({
        id: cert.id,
        license_name: cert.license_name
      })),
      teacher_work_experiences: teacherWorkExperiences.map(exp => ({
        id: exp.id,
        company_name: exp.company_name,
        job_title: exp.job_title,
        start_year: exp.start_year,
        end_year: exp.end_year ?? null
      })),
      teacher_learning_experiences: teacherLearningExperiences.map(exp => ({
        id: exp.id,
        school_name: exp.school_name,
        department: exp.department,
        degree: exp.degree,
        start_year: exp.start_year,
        end_year: exp.end_year ?? null
      }))
    }
  }

  /**
   * 取得課程評價列表
   */
  async getCourseReviews(courseId: number, query: SimpleReviewQuery): Promise<CourseReviewListResponse> {
    const {
      page = DEFAULT_PAGINATION.PAGE,
      per_page = DEFAULT_PAGINATION.PER_PAGE,
      rating,
      sort = 'newest'
    } = query

    // 檢查課程是否存在且已發布
    const course = await this.courseRepository.findOne({
      where: { id: courseId, status: CourseStatus.PUBLISHED }
    })

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }

    // 建立查詢條件
    const whereConditions: Record<string, string | number> = { course_id: courseId }
    if (rating) whereConditions.rate = rating

    // 建立查詢建構器
    let queryBuilder = this.reviewRepository
      .createQueryBuilder('review')
      .where(whereConditions)

    // 排序邏輯
    switch (sort) {
      case 'newest':
        queryBuilder = queryBuilder.orderBy('review.created_at', 'DESC')
        break
      case 'oldest':
        queryBuilder = queryBuilder.orderBy('review.created_at', 'ASC')
        break
      case 'rating_high':
        queryBuilder = queryBuilder.orderBy('review.rate', 'DESC')
        break
      case 'rating_low':
        queryBuilder = queryBuilder.orderBy('review.rate', 'ASC')
        break
      default:
        queryBuilder = queryBuilder.orderBy('review.created_at', 'DESC')
    }

    // 分頁邏輯
    const offset = (page - 1) * per_page
    queryBuilder = queryBuilder.skip(offset).take(per_page)

    // 執行查詢
    const [reviews, total] = await queryBuilder.getManyAndCount()

    // 查詢用戶資訊
    const userIds = reviews.map(review => review.user_id)
    const users = userIds.length > 0 
      ? await this.userRepository.findByIds(userIds)
      : []

    // 轉換回應格式
    const reviewList = reviews.map(review => {
      const user = users.find(u => u.id === review.user_id)
      return {
        id: review.id,
        rate: review.rate || 0, // PublicReview 介面使用 rate
        comment: review.comment,
        user: {
          nick_name: user?.nick_name || '匿名用戶'
        },
        created_at: review.created_at.toISOString()
      }
    })

    return {
      reviews: reviewList,
      rating_stats: {
        average_rating: 0, // TODO: 從課程實體取得
        total_reviews: total,
        rating_1_count: 0, // TODO: 計算各評分數量
        rating_2_count: 0,
        rating_3_count: 0,
        rating_4_count: 0,
        rating_5_count: 0
      },
      pagination: {
        current_page: page,
        per_page: per_page,
        total: total,
        total_pages: Math.ceil(total / per_page)
      }
    }
  }

  /**
   * 私有方法：建構課程列表項目
   */
  private async buildCourseListItems(courses: Course[]): Promise<PublicCourseItem[]> {
    if (courses.length === 0) return []

    // 收集所有需要的 ID
    const courseIds = courses.map(c => c.id)
    const teacherIds = courses.map(c => c.teacher_id).filter(Boolean)
    const mainCategoryIds = courses.map(c => c.main_category_id).filter(Boolean)
    const subCategoryIds = courses.map(c => c.sub_category_id).filter(Boolean)

    // 批次查詢相關資料和價格選項
    const [teachers, mainCategories, subCategories, priceOptions] = await Promise.all([
      teacherIds.length > 0 
        ? this.teacherRepository
            .createQueryBuilder('teacher')
            .leftJoinAndSelect('teacher.user', 'user')
            .whereInIds(teacherIds)
            .getMany()
        : [],
      mainCategoryIds.length > 0 ? this.mainCategoryRepository.findByIds(mainCategoryIds) : [],
      subCategoryIds.length > 0 ? this.subCategoryRepository.findByIds(subCategoryIds) : [],
      this.coursePriceOptionRepository
        .createQueryBuilder('cpo')
        .select([
          'cpo.course_id',
          'MIN(cpo.price) as min_price',
          'MAX(cpo.price) as max_price'
        ])
        .where('cpo.course_id IN (:...courseIds)', { courseIds })
        .andWhere('cpo.is_active = :isActive', { isActive: true })
        .groupBy('cpo.course_id')
        .getRawMany()
    ])

    // 建構價格對應表
    const priceMap = new Map<number, { min_price: number; max_price: number }>()
    priceOptions.forEach((price: { course_id: number; min_price: string; max_price: string }) => {
      priceMap.set(price.course_id, {
        min_price: parseFloat(price.min_price) || 0,
        max_price: parseFloat(price.max_price) || 0
      })
    })

    // 建構回應格式
    return courses.map(course => {
      const teacher = teachers.find(t => t.id === course.teacher_id)
      const mainCategory = mainCategories.find(c => c.id === course.main_category_id)
      const subCategory = subCategories.find(c => c.id === course.sub_category_id)
      const priceInfo = priceMap.get(course.id) || { min_price: 0, max_price: 0 }

      return {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        main_image: course.main_image || undefined,
        min_price: priceInfo.min_price,
        max_price: priceInfo.max_price,
        rate: course.rate,
        review_count: course.review_count,
        student_count: course.student_count,
        city: course.city || undefined,
        district: course.district || undefined,
        address: course.address || undefined,
        main_category: mainCategory ? {
          id: mainCategory.id,
          name: mainCategory.name
        } : { id: 0, name: DEFAULT_CATEGORY.NAME },
        sub_category: subCategory ? {
          id: subCategory.id,
          name: subCategory.name
        } : { id: 0, name: DEFAULT_CATEGORY.NAME },
        teacher: teacher && teacher.user ? {
          id: teacher.id,
          user: {
            name: teacher.user.name || '',
            nick_name: teacher.user.nick_name,
            avatar_image: teacher.user.avatar_image || ''
          }
        } : {
          id: 0,
          user: {
            name: DEFAULT_TEACHER.NICKNAME,
            nick_name: DEFAULT_TEACHER.NICKNAME,
            avatar_image: ''
          }
        },
        created_at: course.created_at.toISOString(),
        updated_at: course.updated_at.toISOString()
      }
    })
  }
}

// 匯出服務實例
export const publicCourseService = new PublicCourseService()