/**
 * 測試工具函式
 * 提供常用的測試輔助函式，包含獨特 Email 產生器等工具
 */

import { validUserData } from '@tests/fixtures/userFixtures'
import { TestUserCreateData } from '@models/index'

/**
 * 產生獨特的 Email 地址（用於避免重複註冊錯誤）
 * @param prefix Email 前綴
 * @returns 獨特的 Email 地址
 */
export const createUniqueEmail = (prefix: string = 'test'): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}-${timestamp}-${random}@example.com`
}

/**
 * 產生獨特的使用者資料（用於避免重複註冊錯誤）
 * @param overrides 覆寫資料
 * @returns 獨特的使用者資料
 */
export const createUniqueUserData = (overrides: Partial<TestUserCreateData> = {}) => ({
  ...validUserData,
  email: createUniqueEmail(),
  nick_name: `測試使用者-${Date.now()}`,
  ...overrides
})

/**
 * 等待指定毫秒數
 * @param ms 毫秒數
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重試執行函式直到成功或達到最大重試次數
 * @param fn 要執行的函式
 * @param maxRetries 最大重試次數
 * @param delayMs 重試間隔毫秒數
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries) {
        await delay(delayMs)
      }
    }
  }

  throw lastError!
}

/**
 * 產生隨機字串
 * @param length 字串長度
 * @returns 隨機字串
 */
export const randomString = (length: number): string => {
  return Math.random().toString(36).substr(2, length)
}

/**
 * 深拷貝物件
 * @param obj 要拷貝的物件
 * @returns 拷貝後的物件
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

export default {
  createUniqueEmail,
  createUniqueUserData,
  delay,
  retry,
  randomString,
  deepClone
}