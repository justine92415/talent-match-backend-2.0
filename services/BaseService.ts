import { dataSource } from '../db/data-source'
import { Teacher } from '../entities/Teacher'
import { NotFoundError } from '../middleware/errorHandler'

/**
 * 基礎服務類別
 */
export abstract class BaseService {
  /**
   * 根據使用者ID取得教師記錄
   */
  protected static async getTeacherByUserId(userId: number): Promise<Teacher> {
    const teacherRepository = dataSource.getRepository(Teacher)
    const teacher = await teacherRepository.findOne({
      where: { user_id: userId }
    })

    if (!teacher) {
      throw new NotFoundError('教師資料')
    }

    return teacher
  }
}

/**
 * 參數驗證輔助類別
 */
export class ValidationHelper {
  /**
   * 驗證必填欄位
   */
  static validateRequired(value: any, fieldName: string): string[] {
    const errors: string[] = []

    if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${fieldName}為必填欄位`)
    }

    return errors
  }

  /**
   * 驗證字串長度
   */
  static validateStringLength(value: string | undefined, fieldName: string, minLength?: number, maxLength?: number): string[] {
    const errors: string[] = []

    if (value !== undefined) {
      if (minLength && value.length < minLength) {
        errors.push(`${fieldName}長度不能少於 ${minLength} 字`)
      }
      if (maxLength && value.length > maxLength) {
        errors.push(`${fieldName}長度不能超過 ${maxLength} 字`)
      }
    }

    return errors
  }

  /**
   * 驗證年份
   */
  static validateYear(year: number | undefined, fieldName: string): string[] {
    const errors: string[] = []
    const currentYear = new Date().getFullYear()

    if (year !== undefined) {
      if (!Number.isInteger(year) || year < 1970 || year > currentYear) {
        errors.push(`${fieldName}必須為有效的年份 (1970-${currentYear})`)
      }
    }

    return errors
  }

  /**
   * 驗證月份
   */
  static validateMonth(month: number | undefined, fieldName: string): string[] {
    const errors: string[] = []

    if (month !== undefined) {
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        errors.push(`${fieldName}必須為 1-12 之間的數字`)
      }
    }

    return errors
  }

  /**
   * 收集所有驗證錯誤
   */
  static collectErrors(...errorArrays: string[][]): Record<string, string[]> {
    const allErrors: Record<string, string[]> = {}

    errorArrays.forEach((errors, index) => {
      if (errors.length > 0) {
        allErrors[`field_${index}`] = errors
      }
    })

    return allErrors
  }
}
