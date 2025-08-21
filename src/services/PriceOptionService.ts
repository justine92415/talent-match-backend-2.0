/**
 * 價格方案服務層
 * 
 * 處理課程價格方案相關的業務邏輯，包括：
 * - CRUD 操作
 * - 權限檢查 
 * - 業務規則驗證（重複檢查、數量限制）
 * - 課程狀態檢查
 */

import { Repository, Not, FindOptionsWhere } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '@db/data-source'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { Teacher } from '@entities/Teacher'
import { BusinessError } from '@utils/errors'
import { MESSAGES } from '@constants/Message'
import { ERROR_CODES } from '@constants/ErrorCode'
import { PRICE_OPTION_LIMITS } from '@constants/priceOption'
import type { PriceOptionCreateRequest, PriceOptionUpdateRequest, PriceOption } from '@models/index'

/**
 * 價格方案服務類別
 * 
 * 提供價格方案管理的完整業務邏輯實作
 */
export class PriceOptionService {
  private priceOptionRepository: Repository<CoursePriceOption>
  private courseRepository: Repository<Course>
  private teacherRepository: Repository<Teacher>

  constructor() {
    this.priceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.courseRepository = dataSource.getRepository(Course)
    this.teacherRepository = dataSource.getRepository(Teacher)
  }

  /**
   * 查詢課程的價格方案列表
   * 
   * @param courseId 課程 ID
   * @param teacherId 教師 ID（用於權限檢查）
   * @returns 價格方案列表
   * @throws BusinessError 當課程不存在或無權限時
   */
  async findPriceOptionsByCourse(courseId: number, teacherId: number): Promise<PriceOption[]> {
    // 檢查課程是否存在且屬於該教師
    await this.validateCourseAccess(courseId, teacherId)

    // 查詢該課程的所有啟用價格方案
    const priceOptions = await this.priceOptionRepository.find({
      where: { 
        course_id: courseId,
        is_active: true 
      },
      order: { price: 'ASC' }
    })

    return priceOptions.map(this.mapToResponseFormat)
  }

  /**
   * 建立新的價格方案
   * 
   * @param courseId 課程 ID
   * @param teacherId 教師 ID（用於權限檢查）
   * @param priceOptionData 價格方案資料
   * @returns 建立的價格方案
   * @throws BusinessError 當驗證失敗時
   */
  async createPriceOption(
    courseId: number, 
    teacherId: number, 
    priceOptionData: PriceOptionCreateRequest
  ): Promise<PriceOption> {
    // 檢查課程是否存在且屬於該教師
    await this.validateCourseAccess(courseId, teacherId)

    // 檢查價格方案數量限制
    await this.validatePriceOptionLimit(courseId)

    // 檢查是否有重複的價格組合
    await this.validateUniquePrice(courseId, priceOptionData.price, priceOptionData.quantity)

    // 建立價格方案
    const priceOption = this.priceOptionRepository.create({
      uuid: uuidv4(),
      course_id: courseId,
      price: priceOptionData.price,
      quantity: priceOptionData.quantity,
      is_active: true
    })

    const savedPriceOption = await this.priceOptionRepository.save(priceOption)
    return this.mapToResponseFormat(savedPriceOption)
  }

  /**
   * 更新價格方案
   * 
   * @param courseId 課程 ID
   * @param priceOptionId 價格方案 ID
   * @param teacherId 教師 ID（用於權限檢查）
   * @param updateData 更新資料
   * @returns 更新後的價格方案
   * @throws BusinessError 當驗證失敗時
   */
  async updatePriceOption(
    courseId: number,
    priceOptionId: number,
    teacherId: number,
    updateData: PriceOptionUpdateRequest
  ): Promise<PriceOption> {
    // 檢查課程是否存在且屬於該教師
    await this.validateCourseAccess(courseId, teacherId)

    // 檢查價格方案是否存在
    const priceOption = await this.findPriceOptionById(priceOptionId, courseId)

    // 如果要更新價格或堂數，檢查是否會造成重複
    if (updateData.price !== undefined || updateData.quantity !== undefined) {
      const newPrice = updateData.price ?? priceOption.price
      const newQuantity = updateData.quantity ?? priceOption.quantity
      
      // 只有當價格組合真的有變更時才檢查重複
      if (newPrice !== priceOption.price || newQuantity !== priceOption.quantity) {
        await this.validateUniquePrice(courseId, newPrice, newQuantity, priceOptionId)
      }
    }

    // 更新價格方案
    await this.priceOptionRepository.update(priceOptionId, updateData)

    // 重新查詢並回傳更新後的資料
    const updatedPriceOption = await this.findPriceOptionById(priceOptionId, courseId)
    return this.mapToResponseFormat(updatedPriceOption)
  }

  /**
   * 刪除價格方案（軟刪除）
   * 
   * @param courseId 課程 ID
   * @param priceOptionId 價格方案 ID
   * @param teacherId 教師 ID（用於權限檢查）
   * @throws BusinessError 當驗證失敗時
   */
  async deletePriceOption(courseId: number, priceOptionId: number, teacherId: number): Promise<void> {
    // 檢查課程是否存在且屬於該教師
    await this.validateCourseAccess(courseId, teacherId)

    // 檢查價格方案是否存在
    await this.findPriceOptionById(priceOptionId, courseId)

    // 執行軟刪除（設為 is_active = false）
    await this.priceOptionRepository.update(priceOptionId, { is_active: false })
  }

  /**
   * 驗證課程存在且使用者有權限存取
   * 
   * @param courseId 課程 ID
   * @param teacherId 教師 ID
   * @throws BusinessError 當課程不存在或無權限時
   */
  private async validateCourseAccess(courseId: number, teacherId: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId }
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_NOT_FOUND,
        404
      )
    }

    // 檢查是否為課程擁有者
    if (course.teacher_id !== teacherId) {
      throw new BusinessError(
        ERROR_CODES.TEACHER_PERMISSION_REQUIRED,
        MESSAGES.BUSINESS.TEACHER_PERMISSION_REQUIRED,
        403
      )
    }

    return course
  }

  /**
   * 驗證價格方案數量限制
   * 
   * @param courseId 課程 ID
   * @throws BusinessError 當超過數量限制時
   */
  private async validatePriceOptionLimit(courseId: number): Promise<void> {
    const currentCount = await this.priceOptionRepository.count({
      where: { 
        course_id: courseId,
        is_active: true 
      }
    })

    if (currentCount >= PRICE_OPTION_LIMITS.MAX_OPTIONS_PER_COURSE) {
      throw new BusinessError(
        ERROR_CODES.PRICE_OPTION_LIMIT_EXCEEDED,
        MESSAGES.BUSINESS.PRICE_OPTION_LIMIT_EXCEEDED
      )
    }
  }

  /**
   * 驗證價格組合的唯一性
   * 
   * @param courseId 課程 ID
   * @param price 價格
   * @param quantity 堂數
   * @param excludeId 排除的價格方案 ID（用於更新時）
   * @throws BusinessError 當價格組合重複時
   */
  private async validateUniquePrice(
    courseId: number, 
    price: number, 
    quantity: number, 
    excludeId?: number
  ): Promise<void> {
    const whereCondition: FindOptionsWhere<CoursePriceOption> = {
      course_id: courseId,
      price: price,
      quantity: quantity,
      is_active: true
    }

    // 更新時排除當前記錄
    if (excludeId) {
      whereCondition.id = Not(excludeId)
    }

    const existingOption = await this.priceOptionRepository.findOne({
      where: whereCondition
    })

    if (existingOption) {
      throw new BusinessError(
        ERROR_CODES.PRICE_OPTION_DUPLICATE,
        MESSAGES.BUSINESS.PRICE_OPTION_DUPLICATE,
        409
      )
    }
  }

  /**
   * 根據 ID 查找價格方案
   * 
   * @param priceOptionId 價格方案 ID
   * @param courseId 課程 ID
   * @returns 價格方案實體
   * @throws BusinessError 當價格方案不存在時
   */
  private async findPriceOptionById(priceOptionId: number, courseId: number): Promise<CoursePriceOption> {
    const priceOption = await this.priceOptionRepository.findOne({
      where: { 
        id: priceOptionId,
        course_id: courseId,
        is_active: true 
      }
    })

    if (!priceOption) {
      throw new BusinessError(
        ERROR_CODES.PRICE_OPTION_NOT_FOUND,
        MESSAGES.BUSINESS.PRICE_OPTION_NOT_FOUND,
        404
      )
    }

    return priceOption
  }

  /**
   * 將資料庫實體轉換為 API 回應格式
   * 
   * @param priceOption 價格方案實體
   * @returns API 回應格式的價格方案
   */
  private mapToResponseFormat(priceOption: CoursePriceOption): PriceOption {
    return {
      id: priceOption.id,
      uuid: priceOption.uuid,
      course_id: priceOption.course_id,
      price: Number(priceOption.price), // 將 decimal 轉為 number
      quantity: priceOption.quantity,
      is_active: priceOption.is_active,
      created_at: priceOption.created_at,
      updated_at: priceOption.updated_at
    }
  }
}

// 匯出服務實例
export const priceOptionService = new PriceOptionService()