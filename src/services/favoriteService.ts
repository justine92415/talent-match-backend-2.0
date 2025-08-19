/**
 * 收藏功能服務層
 * 
 * 處理用戶收藏課程相關的業務邏輯
 * 包括新增、移除、查詢收藏等功能
 */

import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '@db/data-source'
import { UserFavorite } from '@entities/UserFavorite'
import { Course } from '@entities/Course'
import { User } from '@entities/User'
import { Teacher } from '@entities/Teacher'
import { Errors, BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import { CourseStatus } from '@entities/enums'
import type { FavoriteListResponse, FavoriteListQuery, FavoriteInfo } from '@models/publicCourse.interface'

// 常數定義
const DEFAULT_PAGINATION = {
  PAGE: 1,
  PER_PAGE: 12,
  MAX_PER_PAGE: 100
} as const

export class FavoriteService {
  private userFavoriteRepository: Repository<UserFavorite>
  private courseRepository: Repository<Course>
  private userRepository: Repository<User>
  private teacherRepository: Repository<Teacher>

  constructor() {
    this.userFavoriteRepository = dataSource.getRepository(UserFavorite)
    this.courseRepository = dataSource.getRepository(Course)
    this.userRepository = dataSource.getRepository(User)
    this.teacherRepository = dataSource.getRepository(Teacher)
  }

  /**
   * 新增課程到收藏清單
   */
  async addToFavorites(userId: number, courseId: number): Promise<FavoriteInfo> {
    // 檢查用戶是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw Errors.userNotFound()
    }

    // 檢查課程是否存在且已發布
    const course = await this.courseRepository.findOne({
      where: { id: courseId, status: CourseStatus.PUBLISHED }
    })

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }

    // 檢查教師是否嘗試收藏自己的課程
    const teacher = await this.teacherRepository.findOne({
      where: { id: course.teacher_id, user_id: userId }
    })

    if (teacher) {
      throw new BusinessError(ERROR_CODES.CANNOT_FAVORITE_OWN_COURSE, MESSAGES.BUSINESS.CANNOT_FAVORITE_OWN_COURSE, 403)
    }

    // 檢查是否已經收藏
    const existingFavorite = await this.userFavoriteRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })

    if (existingFavorite) {
      throw new BusinessError(ERROR_CODES.FAVORITE_ALREADY_EXISTS, MESSAGES.BUSINESS.FAVORITE_ALREADY_EXISTS, 409)
    }

    // 建立新的收藏記錄
    const favorite = this.userFavoriteRepository.create({
      uuid: uuidv4(),
      user_id: userId,
      course_id: courseId
    })

    await this.userFavoriteRepository.save(favorite)

    return {
      id: favorite.id,
      uuid: favorite.uuid,
      course_id: courseId,
      user_id: userId,
      created_at: favorite.created_at.toISOString()
    }
  }

  /**
   * 從收藏清單移除課程
   */
  async removeFromFavorites(userId: number, courseId: number): Promise<void> {
    // 檢查收藏是否存在
    const favorite = await this.userFavoriteRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })

    if (!favorite) {
      throw new BusinessError(ERROR_CODES.FAVORITE_NOT_FOUND, MESSAGES.BUSINESS.FAVORITE_NOT_FOUND, 404)
    }

    // 刪除收藏記錄
    await this.userFavoriteRepository.remove(favorite)
  }

  /**
   * 取得用戶收藏清單
   */
  async getUserFavorites(userId: number, query: FavoriteListQuery): Promise<FavoriteListResponse> {
    const {
      page = DEFAULT_PAGINATION.PAGE,
      per_page = DEFAULT_PAGINATION.PER_PAGE
    } = query

    // 檢查用戶是否存在
    const user = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) {
      throw Errors.userNotFound()
    }

    // 建立查詢建構器 - 先取得收藏記錄
    const offset = (page - 1) * per_page
    const [favorites, total] = await this.userFavoriteRepository.findAndCount({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      skip: offset,
      take: per_page
    })

    // 如果沒有收藏記錄，直接返回空結果
    if (favorites.length === 0) {
      return {
        favorites: [],
        pagination: {
          current_page: page,
          per_page,
          total: 0,
          total_pages: 0
        }
      }
    }

    // 取得課程詳情
    const courseIds = favorites.map(f => f.course_id)
    const courses = await this.courseRepository
      .createQueryBuilder('course')
      .where('course.id IN (:...courseIds)', { courseIds })
      .andWhere('course.status = :status', { status: CourseStatus.PUBLISHED })
      .getMany()

    // 建立課程 ID 到課程的對映
    const courseMap = new Map(courses.map(course => [course.id, course]))

    // 轉換回應格式（只包含已發布的課程）
    const favoriteList = favorites
      .map(favorite => {
        const course = courseMap.get(favorite.course_id)
        if (!course) return null // 如果課程不存在或未發布，跳過

        return {
          id: favorite.id,
          course: {
            id: course.id,
            uuid: course.uuid,
            name: course.name,
            description: course.content || '',
            image: course.main_image,
            rate: course.rate,
            review_count: course.review_count,
            student_count: course.student_count
          },
          created_at: favorite.created_at.toISOString()
        }
      })
      .filter(Boolean) // 過濾掉 null 值

    return {
      favorites: favoriteList as any, // 暫時使用 any 避免型別錯誤
      pagination: {
        current_page: page,
        per_page: per_page,
        total: favoriteList.length, // 使用過濾後的數量
        total_pages: Math.ceil(favoriteList.length / per_page)
      }
    }
  }

  /**
   * 檢查用戶是否已收藏特定課程
   */
  async isFavorited(userId: number, courseId: number): Promise<boolean> {
    const favorite = await this.userFavoriteRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })

    return !!favorite
  }

  /**
   * 批次檢查課程收藏狀態
   */
  async getFavoriteStatus(userId: number, courseIds: number[]): Promise<Record<number, boolean>> {
    if (courseIds.length === 0) {
      return {}
    }

    const favorites = await this.userFavoriteRepository.find({
      where: { 
        user_id: userId,
        course_id: courseIds.length === 1 ? courseIds[0] : undefined
      }
    })

    const favoriteMap: Record<number, boolean> = {}
    
    // 初始化所有課程為未收藏
    courseIds.forEach(id => {
      favoriteMap[id] = false
    })

    // 設定已收藏的課程
    favorites.forEach(favorite => {
      favoriteMap[favorite.course_id] = true
    })

    return favoriteMap
  }
}