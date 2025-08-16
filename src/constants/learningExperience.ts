/**
 * 學習經歷業務邏輯相關常數定義
 */

/**
 * 學習經歷業務常數
 */
export const LEARNING_EXPERIENCE_BUSINESS = {
  /** 最大學習經歷年份範圍 */
  MAX_LEARNING_YEARS: 20,
  
  /** 排序設定 */
  DEFAULT_ORDER_BY: 'start_year',
  DEFAULT_ORDER_DIRECTION: 'DESC' as const,
} as const

/**
 * 學習經歷業務驗證規則
 */
export const LEARNING_EXPERIENCE_RULES = {
  /** 學習年份範圍驗證 */
  YEAR_RANGE: {
    MAX_DURATION: LEARNING_EXPERIENCE_BUSINESS.MAX_LEARNING_YEARS
  }
} as const