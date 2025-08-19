/**
 * 課程影片關聯服務層 (CourseVideoService)
 * 
 * 遵循專案開發準則：
 * - 使用 TypeOR  async linkVideos(courseId: number, teacherId: number, data: any): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {sitory 模式
 * - 實作錯誤工廠函式與統一錯誤處理
 * - 實作      // 4. 建立課程影片關聯記錄
      const newCourseVideos = data.video_ids.map((videoId, index) => {
        const courseVideo = new CourseVideo()
        courseVideo.course_id = courseId
        courseVideo.video_id = videoId
        
        // 從order_info中找到對應的設定
        const orderInfo = data.order_info.find(info => info.video_id === videoId)
        courseVideo.display_order = orderInfo?.display_order || index + 1
        courseVideo.is_preview = orderInfo?.is_preview || false
        
        return courseVideo
      })
 * - 支援批次操作和事務處理
 * - 提供權限檢查和資料一致性保證
 */

import { Repository, IsNull, In } from 'typeorm'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { Video } from '@entities/Video'
import { CourseVideo } from '@entities/CourseVideo'
import { BusinessError } from '@utils/errors'
import { ERROR_CODES } from '@constants/ErrorCode'
import { MESSAGES } from '@constants/Message'
import type { 
  LinkVideosRequest, 
  LinkVideosResponse,
  UpdateVideoOrderRequest,
  UpdateVideoOrderResponse,
  CourseVideoListResponse
} from '@models/courseVideo.interface'

// 移除課程影片回應介面
interface RemoveCourseVideoResponse {
  course_id: number
  video_id: number
  removed: boolean
  removed_at: string
}

/**
 * 課程影片關聯服務類別
 */
export class CourseVideoService {
  private courseRepository: Repository<Course>
  private videoRepository: Repository<Video>
  private courseVideoRepository: Repository<CourseVideo>

  constructor() {
    this.courseRepository = dataSource.getRepository(Course)
    this.videoRepository = dataSource.getRepository(Video)
    this.courseVideoRepository = dataSource.getRepository(CourseVideo)
  }

  /**
   * 連結影片到課程
   * @param courseId 課程ID
   * @param teacherId 教師ID（用於權限檢查）
   * @param data 連結請求資料
   * @returns 連結結果
   */
  async linkVideos(courseId: number, teacherId: number, data: LinkVideosRequest): Promise<LinkVideosResponse> {
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. 檢查課程是否存在且屬於該教師
      const course = await this.courseRepository.findOne({
        where: { 
          id: courseId,
          teacher_id: teacherId 
        }
      })

      if (!course) {
        throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND)
      }

      // 2. 檢查所有影片是否存在且屬於該教師
      const videos = await this.videoRepository.find({
        where: {
          id: In(data.video_ids),
          teacher_id: teacherId,
          deleted_at: IsNull()
        }
      })

      if (videos.length !== data.video_ids.length) {
        const foundVideoIds = videos.map(v => v.id)
        const notFoundVideoIds = data.video_ids.filter(id => !foundVideoIds.includes(id))
        
        // 檢查未找到的影片是否是權限問題
        const allVideos = await this.videoRepository.find({
          where: {
            id: In(notFoundVideoIds)
          }
        })
        
        if (allVideos.length > 0) {
          throw new BusinessError(ERROR_CODES.VIDEO_NOT_OWNED_BY_TEACHER, MESSAGES.BUSINESS.VIDEO_NOT_OWNED_BY_TEACHER, 403)
        } else {
          throw new BusinessError(ERROR_CODES.VIDEO_NOT_FOUND, MESSAGES.BUSINESS.VIDEO_NOT_FOUND, 404)
        }
      }

      // 3. 檢查是否有影片已經關聯到該課程
      const existingLinks = await this.courseVideoRepository.find({
        where: {
          course_id: courseId,
          video_id: In(data.video_ids)
        }
      })

      if (existingLinks.length > 0) {
        throw new BusinessError(ERROR_CODES.COURSE_VIDEO_ALREADY_LINKED, MESSAGES.BUSINESS.COURSE_VIDEO_ALREADY_LINKED)
      }

      // 4. 建立課程影片關聯
      const newCourseVideos = data.video_ids.map((videoId, index) => {
        // 找到對應的 order_info
        const orderInfo = data.order_info?.find(info => info.video_id === videoId)
        
        const courseVideo = new CourseVideo()
        courseVideo.course_id = courseId
        courseVideo.video_id = videoId
        courseVideo.display_order = orderInfo?.display_order || (index + 1) // 優先使用 order_info 的順序
        courseVideo.is_preview = orderInfo?.is_preview || false // 從 order_info 取得 is_preview
        return courseVideo
      })

      const savedCourseVideos = await queryRunner.manager.save(CourseVideo, newCourseVideos)

      await queryRunner.commitTransaction()

      // 5. 準備回應資料
      const courseVideoDetails = savedCourseVideos.map(cv => {
        const video = videos.find(v => v.id === cv.video_id)!
        return {
          id: cv.id,
          course_id: cv.course_id,
          video_id: cv.video_id,
          display_order: cv.display_order,
          is_preview: cv.is_preview,
          created_at: cv.created_at,
          updated_at: cv.updated_at,
          video: {
            id: video.id,
            uuid: video.uuid,
            teacher_id: video.teacher_id,
            name: video.name,
            category: video.category,
            intro: video.intro,
            url: video.url,
            video_type: video.video_type,
            created_at: video.created_at.toISOString()
          }
        }
      })

      return {
        course_videos: courseVideoDetails
      }

    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 更新課程影片順序
   * @param courseId 課程ID
   * @param teacherId 教師ID（用於權限檢查）
   * @param data 順序更新資料
   * @returns 更新結果
   */
  async updateVideoOrder(courseId: number, teacherId: number, data: UpdateVideoOrderRequest): Promise<UpdateVideoOrderResponse> {
    const queryRunner = dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. 檢查課程是否存在且屬於該教師
      const course = await this.courseRepository.findOne({
        where: { 
          id: courseId,
          teacher_id: teacherId 
        }
      })

      if (!course) {
        throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
      }

      // 2. 檢查所有影片是否都關聯到該課程
      const videoIds = data.video_orders.map(vo => vo.video_id)
      const existingCourseVideos = await this.courseVideoRepository.find({
        where: {
          course_id: courseId,
          video_id: In(videoIds)
        }
      })

      if (existingCourseVideos.length !== videoIds.length) {
        throw new BusinessError(ERROR_CODES.COURSE_VIDEO_NOT_FOUND, MESSAGES.BUSINESS.COURSE_VIDEO_NOT_FOUND, 404)
      }

      // 3. 更新每個影片的順序
      const updatedCourseVideos = []
      for (const orderData of data.video_orders) {
        const courseVideo = existingCourseVideos.find(cv => cv.video_id === orderData.video_id)
        if (courseVideo) {
          courseVideo.display_order = orderData.display_order
          const saved = await queryRunner.manager.save(CourseVideo, courseVideo)
          updatedCourseVideos.push(saved)
        }
      }

      await queryRunner.commitTransaction()

      // 4. 準備回應資料
      const updatedOrders = updatedCourseVideos.map(cv => ({
        video_id: cv.video_id,
        display_order: cv.display_order
      }))

      return {
        updated_orders: updatedOrders
      }

    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * 移除課程影片關聯
   * @param courseId 課程ID
   * @param videoId 影片ID
   * @param teacherId 教師ID（用於權限檢查）
   * @returns 移除結果
   */
  async removeCourseVideo(courseId: number, videoId: number, teacherId: number): Promise<RemoveCourseVideoResponse> {
        // 1. 檢查課程是否存在且屬於教師
    const course = await this.courseRepository.findOne({
      where: { id: courseId, teacher_id: teacherId }
    })

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }

    // 2. 檢查課程影片關聯是否存在
    const courseVideo = await this.courseVideoRepository.findOne({
      where: {
        course_id: courseId,
        video_id: videoId
      }
    })

    if (!courseVideo) {
      throw new BusinessError(ERROR_CODES.COURSE_VIDEO_NOT_FOUND, MESSAGES.BUSINESS.COURSE_VIDEO_NOT_FOUND, 404)
    }

    // 3. 檢查影片是否屬於該教師
    const video = await this.videoRepository.findOne({
      where: {
        id: videoId,
        teacher_id: teacherId,
        deleted_at: IsNull()
      }
    })

    if (!video) {
      throw new BusinessError(ERROR_CODES.VIDEO_NOT_OWNED_BY_TEACHER, MESSAGES.BUSINESS.VIDEO_NOT_OWNED_BY_TEACHER, 403)
    }

    // 4. 移除關聯
    await this.courseVideoRepository.remove(courseVideo)

    return {
      course_id: courseId,
      video_id: videoId,
      removed: true,
      removed_at: new Date().toISOString()
    }
  }

  /**
   * 取得課程的影片列表
   * @param courseId 課程ID
   * @param teacherId 教師ID（用於權限檢查，可選）
   * @returns 課程影片列表
   */
  async getCourseVideoList(courseId: number, teacherId?: number): Promise<CourseVideoListResponse> {
    // 1. 檢查課程是否存在
    const whereCondition: { id: number; teacher_id?: number } = { id: courseId }
    if (teacherId) {
      whereCondition.teacher_id = teacherId
    }

    const course = await this.courseRepository.findOne({
      where: whereCondition
    })

    if (!course) {
      throw new BusinessError(ERROR_CODES.COURSE_NOT_FOUND, MESSAGES.BUSINESS.COURSE_NOT_FOUND, 404)
    }

    // 2. 取得課程影片關聯列表（按順序排列）
    const courseVideos = await this.courseVideoRepository.find({
      where: { course_id: courseId },
      order: { display_order: 'ASC' }
    })

    // 3. 取得對應的影片資訊
    const videoIds = courseVideos.map(cv => cv.video_id)
    const videos = videoIds.length > 0 ? await this.videoRepository.find({
      where: {
        id: In(videoIds),
        deleted_at: IsNull()
      }
    }) : []

    // 4. 組合資料
    const videoMap = new Map(videos.map(v => [v.id, v]))
    const courseVideoDetails = courseVideos
      .filter(cv => videoMap.has(cv.video_id))
      .map(cv => {
        const video = videoMap.get(cv.video_id)!
        return {
          id: cv.id,
          course_id: cv.course_id,
          video_id: cv.video_id,
          display_order: cv.display_order,
          is_preview: cv.is_preview,
          created_at: cv.created_at,
          updated_at: cv.updated_at,
          video: {
            id: video.id,
            uuid: video.uuid,
            teacher_id: video.teacher_id,
            name: video.name,
            category: video.category,
            intro: video.intro,
            url: video.url,
            video_type: video.video_type,
            created_at: video.created_at.toISOString()
          }
        }
      })

    return {
      course_videos: courseVideoDetails,
      summary: {
        total_videos: courseVideoDetails.length,
        preview_videos: courseVideoDetails.filter(v => v.is_preview).length,
        regular_videos: courseVideoDetails.filter(v => !v.is_preview).length
      }
    }
  }

  /**
   * 檢查課程影片關聯是否存在
   * @param courseId 課程ID
   * @param videoId 影片ID
   * @returns 是否存在關聯
   */
  async checkCourseVideoExists(courseId: number, videoId: number): Promise<boolean> {
    const count = await this.courseVideoRepository.count({
      where: {
        course_id: courseId,
        video_id: videoId
      }
    })
    return count > 0
  }

  /**
   * 取得課程的影片總數
   * @param courseId 課程ID
   * @returns 影片總數
   */
  async getCourseVideoCount(courseId: number): Promise<number> {
    return await this.courseVideoRepository.count({
      where: { course_id: courseId }
    })
  }

  /**
   * 取得教師擁有的所有課程影片關聯
   * @param teacherId 教師ID
   * @returns 課程影片關聯統計
   */
  async getTeacherCourseVideoStats(teacherId: number): Promise<{
    total_courses: number
    total_videos: number
    total_links: number
  }> {
    // 取得教師的課程數
    const totalCourses = await this.courseRepository.count({
      where: { teacher_id: teacherId }
    })

    // 取得教師的影片數
    const totalVideos = await this.videoRepository.count({
      where: { 
        teacher_id: teacherId,
        deleted_at: IsNull()
      }
    })

    // 取得教師課程的所有影片關聯數
    const courseIds = await this.courseRepository.find({
      where: { teacher_id: teacherId },
      select: ['id']
    })

    let totalLinks = 0
    if (courseIds.length > 0) {
      const ids = courseIds.map(c => c.id)
      totalLinks = await this.courseVideoRepository.count({
        where: {
          course_id: In(ids)
        }
      })
    }

    return {
      total_courses: totalCourses,
      total_videos: totalVideos,
      total_links: totalLinks
    }
  }
}

// 建立服務實例
const courseVideoService = new CourseVideoService()
export { courseVideoService }