/**
 * 購物車服務層
 * 處理購物車相關的業務邏輯和資料庫操作
 */

import { v4 as uuidv4 } from 'uuid'
import { Repository } from 'typeorm'
import { dataSource } from '@db/data-source'
import { UserCartItem } from '@entities/UserCartItem'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { Teacher } from '@entities/Teacher'
import { User } from '@entities/User'
import { MainCategory } from '@entities/MainCategory'
import { SubCategory } from '@entities/SubCategory'
import { CourseStatus, ApplicationStatus } from '@entities/enums'
import { BusinessError, ValidationError } from '@utils/errors'
import { ERROR_CODES, MESSAGES } from '@constants/index'
import type { 
  CartItemCreateRequest,
  CartItemUpdateRequest, 
  CartResponse,
  CartSummary,
  CartItemWithDetails
} from '../types'

export class CartService {
  private cartRepository: Repository<UserCartItem>
  private courseRepository: Repository<Course>
  private priceOptionRepository: Repository<CoursePriceOption>
  private teacherRepository: Repository<Teacher>
  private userRepository: Repository<User>
  private mainCategoryRepository: Repository<MainCategory>
  private subCategoryRepository: Repository<SubCategory>

  constructor() {
    this.cartRepository = dataSource.getRepository(UserCartItem)
    this.courseRepository = dataSource.getRepository(Course)
    this.priceOptionRepository = dataSource.getRepository(CoursePriceOption)
    this.teacherRepository = dataSource.getRepository(Teacher)
    this.userRepository = dataSource.getRepository(User)
    this.mainCategoryRepository = dataSource.getRepository(MainCategory)
    this.subCategoryRepository = dataSource.getRepository(SubCategory)
  }

  /**
   * 加入購物車項目
   */
  async addItem(userId: number, itemData: CartItemCreateRequest): Promise<{
    item: CartItemWithDetails;
    isUpdate: boolean;
  }> {
    // 1. 驗證課程存在且已發布
    const course = await this.validateCourseExists(itemData.course_id)
    
    // 2. 驗證價格方案存在且屬於該課程
    const priceOption = await this.validatePriceOption(itemData.price_option_id, itemData.course_id)

    // 3. 驗證用戶不是課程的教師
    await this.validateUserNotTeacher(userId, course.teacher_id)

    // 4. 檢查是否已存在相同的購物車項目
    const existingItem = await this.findExistingCartItem(
      userId, 
      itemData.course_id, 
      itemData.price_option_id
    )

    if (existingItem) {
      // 如果已存在，則更新數量
      const newQuantity = existingItem.quantity + itemData.quantity
      const updatedItem = await this.updateItemQuantity(existingItem.id, newQuantity, userId)
      return {
        item: updatedItem,
        isUpdate: true
      }
    } else {
      // 建立新的購物車項目
      const cartItem = this.cartRepository.create({
        uuid: uuidv4(),
        user_id: userId,
        course_id: itemData.course_id,
        price_option_id: itemData.price_option_id,
        quantity: itemData.quantity || 1
      })

      const savedItem = await this.cartRepository.save(cartItem)
      const newItem = await this.getItemWithDetails(savedItem.id)
      return {
        item: newItem,
        isUpdate: false
      }
    }
  }

  /**
   * 取得購物車列表
   */
  async getCart(userId: number, includeDetails: boolean = true): Promise<CartResponse> {
    const cartItems = await this.cartRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    })

    const items: CartItemWithDetails[] = []
    let totalAmount = 0
    let totalItems = 0

    let validItems = 0
    let invalidItems = 0

    for (const item of cartItems) {
      const itemWithDetails = await this.getItemWithDetails(item.id)
      items.push(itemWithDetails)
      
      if (itemWithDetails.is_valid) {
        validItems++
        // 只計算有效項目的總金額
        if (itemWithDetails.price_option) {
          totalAmount += itemWithDetails.price_option.price * itemWithDetails.quantity
        }
      } else {
        invalidItems++
      }
      
      totalItems += item.quantity
    }

    const summary: CartSummary = {
      total_items: totalItems,
      total_amount: totalAmount,
      valid_items: validItems,
      invalid_items: invalidItems
    }

    return {
      cart_items: items,
      summary
    }
  }

  /**
   * 更新購物車項目數量
   */
  async updateItem(
    itemId: number, 
    updateData: CartItemUpdateRequest, 
    userId: number
  ): Promise<CartItemWithDetails> {
    // 驗證項目存在且屬於該用戶
    const cartItem = await this.validateCartItemOwnership(itemId, userId)
    
    return await this.updateItemQuantity(itemId, updateData.quantity, userId)
  }

  /**
   * 刪除購物車項目
   */
  async removeItem(itemId: number, userId: number): Promise<void> {
    // 驗證項目存在且屬於該用戶
    await this.validateCartItemOwnership(itemId, userId)

    const result = await this.cartRepository.delete({ id: itemId, user_id: userId })
    
    if (result.affected === 0) {
      throw new BusinessError(
        ERROR_CODES.CART_ITEM_NOT_FOUND,
        MESSAGES.BUSINESS.CART_ITEM_NOT_FOUND,
        404
      )
    }
  }

  /**
   * 清空購物車
   */
  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ user_id: userId })
  }

  /**
   * 驗證課程存在且已發布
   */
  private async validateCourseExists(courseId: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, status: CourseStatus.PUBLISHED }
    })

    if (!course) {
      throw new BusinessError(
        ERROR_CODES.COURSE_NOT_FOUND,
        MESSAGES.BUSINESS.COURSE_NOT_FOUND,
        404
      )
    }

    return course
  }

  /**
   * 驗證價格方案存在且屬於指定課程
   */
  private async validatePriceOption(
    priceOptionId: number, 
    courseId: number
  ): Promise<CoursePriceOption> {
    const priceOption = await this.priceOptionRepository.findOne({
      where: { 
        id: priceOptionId,
        course_id: courseId 
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
   * 驗證用戶不是課程的教師
   */
  private async validateUserNotTeacher(userId: number, teacherId: number): Promise<void> {
    const teacher = await this.teacherRepository.findOne({
      where: { 
        id: teacherId,
        user_id: userId,
        application_status: ApplicationStatus.APPROVED 
      }
    })

    if (teacher) {
      throw new BusinessError(
        ERROR_CODES.CANNOT_PURCHASE_OWN_COURSE,
        MESSAGES.BUSINESS.CANNOT_PURCHASE_OWN_COURSE,
        403
      )
    }
  }

  /**
   * 尋找現有的購物車項目
   */
  private async findExistingCartItem(
    userId: number, 
    courseId: number, 
    priceOptionId: number
  ): Promise<UserCartItem | null> {
    return await this.cartRepository.findOne({
      where: {
        user_id: userId,
        course_id: courseId,
        price_option_id: priceOptionId
      }
    })
  }

  /**
   * 驗證購物車項目所有權
   */
  private async validateCartItemOwnership(itemId: number, userId: number): Promise<UserCartItem> {
    // 先檢查項目是否存在
    const existsItem = await this.cartRepository.findOne({
      where: { id: itemId }
    })

    if (!existsItem) {
      throw new BusinessError(
        ERROR_CODES.CART_ITEM_NOT_FOUND,
        MESSAGES.BUSINESS.CART_ITEM_NOT_FOUND,
        404
      )
    }

    // 再檢查是否屬於該用戶（權限檢查）
    if (existsItem.user_id !== userId) {
      throw new BusinessError(
        ERROR_CODES.UNAUTHORIZED_CART_ACCESS,
        MESSAGES.BUSINESS.UNAUTHORIZED_CART_ACCESS,
        403
      )
    }

    return existsItem
  }

  /**
   * 更新項目數量的內部方法
   */
  private async updateItemQuantity(
    itemId: number, 
    quantity: number, 
    userId: number
  ): Promise<CartItemWithDetails> {
    await this.cartRepository.update(
      { id: itemId, user_id: userId },
      { quantity }
    )

    return await this.getItemWithDetails(itemId)
  }

  /**
   * 取得包含詳細資訊的購物車項目
   */
  private async getItemWithDetails(itemId: number): Promise<CartItemWithDetails> {
    // 先取得基本購物車項目資料
    const cartItem = await this.cartRepository.findOne({
      where: { id: itemId }
    })

    if (!cartItem) {
      throw new BusinessError(
        ERROR_CODES.CART_ITEM_NOT_FOUND,
        MESSAGES.BUSINESS.CART_ITEM_NOT_FOUND,
        404
      )
    }

    // 分別查詢關聯資料
    const course = await this.courseRepository.findOne({
      where: { id: cartItem.course_id }
    })

    let teacher = null
    let mainCategory = null
    let subCategory = null
    
    if (course) {
      teacher = await this.teacherRepository.findOne({
        where: { id: course.teacher_id },
        relations: ['user']
      })
      
      // 查詢主分類
      if (course.main_category_id) {
        mainCategory = await this.mainCategoryRepository.findOne({
          where: { id: course.main_category_id }
        })
      }
      
      // 查詢次分類
      if (course.sub_category_id) {
        subCategory = await this.subCategoryRepository.findOne({
          where: { id: course.sub_category_id }
        })
      }
    }

    const priceOption = await this.priceOptionRepository.findOne({
      where: { id: cartItem.price_option_id }
    })

    // 檢查商品有效性
    let isValid = true
    let invalidReason: string | undefined

    if (!course || course.status !== CourseStatus.PUBLISHED) {
      isValid = false
      invalidReason = '課程不存在或未發布'
    } else if (!priceOption) {
      isValid = false
      invalidReason = '價格方案不存在'
    }

    return {
      id: cartItem.id,
      uuid: cartItem.uuid,
      user_id: cartItem.user_id,
      course_id: cartItem.course_id,
      price_option_id: cartItem.price_option_id,
      quantity: cartItem.quantity,
      is_valid: isValid,
      invalid_reason: invalidReason,
      created_at: cartItem.created_at,
      updated_at: cartItem.updated_at,
      course: course && teacher ? {
        id: course.id,
        uuid: course.uuid,
        name: course.name,
        main_image: course.main_image,
        status: course.status.toString(),
        main_category: mainCategory ? {
          id: mainCategory.id,
          name: mainCategory.name
        } : null,
        sub_category: subCategory ? {
          id: subCategory.id,
          name: subCategory.name
        } : null,
        teacher: {
          id: teacher.id,
          user: {
            name: teacher.user.name || '',
            nick_name: teacher.user.nick_name
          }
        }
      } : null,
      price_option: priceOption ? {
        id: priceOption.id,
        uuid: priceOption.uuid,
        price: priceOption.price,
        quantity: priceOption.quantity
      } : null
    }
  }
}

// 匯出服務實例
export const cartService = new CartService()