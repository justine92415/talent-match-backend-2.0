/**
 * 購買記錄測試 Helper 函式
 */

import { dataSource } from '@db/data-source'
import { UserCoursePurchase } from '@entities/UserCoursePurchase'

/**
 * 購買記錄測試 Helper 函式
 */
export class PurchaseTestHelpers {
  /**
   * 建立測試用的購買記錄
   */
  static async createPurchase(userId: number, overrides: any = {}) {
    const purchaseRepository = dataSource.getRepository(UserCoursePurchase)
    const purchaseData = {
      uuid: require('uuid').v4(),
      user_id: userId,
      course_id: 1,
      order_id: 1,
      quantity_total: 5,
      quantity_used: 0,
      ...overrides
    }
    
    const purchase = purchaseRepository.create(purchaseData)
    return await purchaseRepository.save(purchase)
  }

  /**
   * 建立多個購買記錄
   */
  static async createMultiplePurchases(userId: number, count: number, overrides: any = {}) {
    const purchases = []
    
    for (let i = 0; i < count; i++) {
      const purchase = await this.createPurchase(userId, {
        course_id: i + 1,
        order_id: i + 1,
        quantity_total: (i + 1) * 5,
        ...overrides
      })
      purchases.push(purchase)
    }
    
    return purchases
  }

  /**
   * 更新購買記錄的使用堂數
   */
  static async updatePurchaseUsage(purchaseId: number, quantityUsed: number) {
    const purchaseRepository = dataSource.getRepository(UserCoursePurchase)
    await purchaseRepository.update(purchaseId, { quantity_used: quantityUsed })
  }

  /**
   * 取得使用者的購買記錄
   */
  static async getUserPurchases(userId: number) {
    const purchaseRepository = dataSource.getRepository(UserCoursePurchase)
    return await purchaseRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    })
  }

  /**
   * 取得特定課程的購買記錄
   */
  static async getCoursePurchase(userId: number, courseId: number) {
    const purchaseRepository = dataSource.getRepository(UserCoursePurchase)
    return await purchaseRepository.findOne({
      where: { user_id: userId, course_id: courseId }
    })
  }

  /**
   * 清理購買記錄測試資料
   */
  static async cleanupPurchaseTestData() {
    const purchaseRepository = dataSource.getRepository(UserCoursePurchase)
    await purchaseRepository.delete({})
  }
}