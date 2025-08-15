/**
 * 驗證錯誤物件介面
 */
export interface ValidationError {
  [field: string]: string[]
}