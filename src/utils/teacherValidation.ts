/**
 * 教師控制器驗證工具函式
 */
import { ValidationError } from '@models/index'
import { TEACHER_VALIDATION } from '../constants/validation'

/**
 * 驗證教師申請資料
 * @param nationality 國籍
 * @param introduction 自我介紹
 * @returns 驗證錯誤物件
 */
export function validateTeacherApplication(nationality: string, introduction: string): ValidationError {
  const errors: ValidationError = {}
  
  // 驗證國籍
  if (!nationality || nationality.trim().length === 0) {
    errors.nationality = ['國籍為必填欄位']
  } else if (nationality.length > TEACHER_VALIDATION.NATIONALITY.MAX_LENGTH) {
    errors.nationality = [`國籍長度不可超過${TEACHER_VALIDATION.NATIONALITY.MAX_LENGTH}字元`]
  }

  // 驗證自我介紹
  if (!introduction || introduction.trim().length === 0) {
    errors.introduction = ['自我介紹為必填欄位']
  } else if (introduction.length < TEACHER_VALIDATION.INTRODUCTION.MIN_LENGTH) {
    errors.introduction = [`自我介紹至少需要${TEACHER_VALIDATION.INTRODUCTION.MIN_LENGTH}字元`]
  } else if (introduction.length > TEACHER_VALIDATION.INTRODUCTION.MAX_LENGTH) {
    errors.introduction = [`自我介紹最多${TEACHER_VALIDATION.INTRODUCTION.MAX_LENGTH}字元`]
  }

  return errors
}

/**
 * 驗證教師申請更新資料
 * @param nationality 國籍（可選）
 * @param introduction 自我介紹（可選）
 * @returns 驗證錯誤物件
 */
export function validateTeacherApplicationUpdate(
  nationality?: string, 
  introduction?: string
): ValidationError {
  const errors: ValidationError = {}
  
  // 驗證國籍（如果提供）
  if (nationality !== undefined) {
    if (typeof nationality !== 'string' || nationality.trim().length === 0) {
      errors.nationality = ['國籍格式不正確']
    } else if (nationality.length > TEACHER_VALIDATION.NATIONALITY.MAX_LENGTH) {
      errors.nationality = [`國籍長度不可超過${TEACHER_VALIDATION.NATIONALITY.MAX_LENGTH}字元`]
    }
  }

  // 驗證自我介紹（如果提供）
  if (introduction !== undefined) {
    if (typeof introduction !== 'string' || introduction.trim().length === 0) {
      errors.introduction = ['自我介紹格式不正確']
    } else if (introduction.length < TEACHER_VALIDATION.INTRODUCTION.MIN_LENGTH) {
      errors.introduction = [`自我介紹至少需要${TEACHER_VALIDATION.INTRODUCTION.MIN_LENGTH}字元`]
    } else if (introduction.length > TEACHER_VALIDATION.INTRODUCTION.MAX_LENGTH) {
      errors.introduction = [`自我介紹最多${TEACHER_VALIDATION.INTRODUCTION.MAX_LENGTH}字元`]
    }
  }

  return errors
}