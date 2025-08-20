/**
 * 購物車測試 Helper 函式
 */

import { v4 as uuidv4 } from 'uuid'
import { dataSource } from '@db/data-source'
import { UserCartItem } from '@entities/UserCartItem'
import { Course } from '@entities/Course'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { Teacher } from '@entities/Teacher'
import { CourseStatus, ApplicationStatus, UserRole } from '@entities/enums'
import { UserTestHelpers } from '@tests/helpers/testHelpers'

/**
 * 購物車測試 Helper 函式
 */
export class CartTestHelpers {
  /**
   * 建立測試用的購物車項目
   */
  static async createCartItem(userId: number, overrides: any = {}) {
    const cartRepository = dataSource.getRepository(UserCartItem)
    const cartData = {
      uuid: uuidv4(),
      user_id: userId,
      course_id: 1,
      price_option_id: 1,
      quantity: 1,
      ...overrides
    }
    
    const cartItem = cartRepository.create(cartData)
    return await cartRepository.save(cartItem)
  }

  /**
   * 建立多個購物車項目
   */
  static async createMultipleCartItems(userId: number, count: number, overrides: any = {}) {
    const cartItems = []
    
    for (let i = 0; i < count; i++) {
      const item = await this.createCartItem(userId, {
        course_id: i + 1,
        price_option_id: i + 1,
        ...overrides
      })
      cartItems.push(item)
    }
    
    return cartItems
  }

  /**
   * 建立測試用的教師
   */
  static async createTestTeacher() {
    const { user } = await UserTestHelpers.createTestUserWithToken({ 
      role: UserRole.TEACHER 
    })
    const teacherRepository = dataSource.getRepository(Teacher)
    
    const teacherData = {
      uuid: uuidv4(),
      user_id: user.id,
      application_status: ApplicationStatus.APPROVED,
      specialties: ['程式設計', '資料分析'],
      experience_years: 5,
      introduction: '專業教師介紹',
      hourly_rate: 1000
    }
    
    const teacher = teacherRepository.create(teacherData)
    return await teacherRepository.save(teacher)
  }

  /**
   * 建立測試用的課程
   */
  static async createTestCourse(teacherId: number, index: number = 1) {
    const courseRepository = dataSource.getRepository(Course)
    
    const courseData = {
      uuid: uuidv4(),
      teacher_id: teacherId,
      name: `測試課程 ${index}`,
      content: `測試課程 ${index} 的詳細描述`,
      main_image: `/uploads/course-${index}.jpg`,
      main_category_id: 1,
      sub_category_id: 1,
      city_id: 1,
      status: CourseStatus.PUBLISHED
    }
    
    const course = courseRepository.create(courseData)
    return await courseRepository.save(course)
  }

  /**
   * 建立測試用的價格方案
   */
  static async createTestPriceOption(courseId: number, index: number = 1) {
    const priceOptionRepository = dataSource.getRepository(CoursePriceOption)
    
    const priceOptionData = {
      uuid: uuidv4(),
      course_id: courseId,
      price: index * 500 + 500, // 500, 1000, 1500...
      quantity: index * 5 + 5    // 5, 10, 15...
    }
    
    const priceOption = priceOptionRepository.create(priceOptionData)
    return await priceOptionRepository.save(priceOption)
  }

  /**
   * 建立完整的購物車測試環境
   */
  static async createCartTestEnvironment(options: {
    cartItemsCount?: number
    courseCount?: number
    withValidCourses?: boolean
  } = {}) {
    const { cartItemsCount = 2, courseCount = 2, withValidCourses = true } = options
    
    // 建立使用者
    const { user: student, authToken } = await UserTestHelpers.createTestUserWithToken()
    
    let courses: any[] = []
    let teachers: any[] = []
    let priceOptions: any[] = []
    
    if (withValidCourses) {
      // 建立教師和課程
      for (let i = 0; i < courseCount; i++) {
        const teacher = await this.createTestTeacher()
        const course = await this.createTestCourse(teacher.id, i + 1)
        const priceOption = await this.createTestPriceOption(course.id, i + 1)
        
        teachers.push(teacher)
        courses.push(course)
        priceOptions.push(priceOption)
      }
    }
    
    // 建立購物車項目
    const cartItems = []
    for (let i = 0; i < cartItemsCount; i++) {
      const item = await this.createCartItem(student.id, {
        course_id: courses[i]?.id || i + 1,
        price_option_id: priceOptions[i]?.id || i + 1
      })
      cartItems.push(item)
    }
    
    return {
      student,
      authToken,
      teachers,
      courses,
      priceOptions,
      cartItems
    }
  }

  /**
   * 清理購物車測試資料
   */
  static async cleanupCartTestData() {
    const cartRepository = dataSource.getRepository(UserCartItem)
    await cartRepository.delete({})
  }

  /**
   * 取得使用者的購物車項目
   */
  static async getUserCartItems(userId: number) {
    const cartRepository = dataSource.getRepository(UserCartItem)
    return await cartRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    })
  }

  /**
   * 檢查購物車項目是否存在
   */
  static async cartItemExists(userId: number, courseId: number, priceOptionId: number): Promise<boolean> {
    const cartRepository = dataSource.getRepository(UserCartItem)
    const count = await cartRepository.count({
      where: { 
        user_id: userId,
        course_id: courseId,
        price_option_id: priceOptionId
      }
    })
    return count > 0
  }
}