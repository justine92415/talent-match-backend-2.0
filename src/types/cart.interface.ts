import { UserCartItem } from '@entities/UserCartItem'
import { Course } from '@entities/Course'
import { User } from '@entities/User'
import { CoursePriceOption } from '@entities/CoursePriceOption'
import { Teacher } from '@entities/Teacher'

/**
 * 購物車項目基本資料型別
 */
export interface CartItemData {
  course_id: number
  price_option_id: number
  quantity: number
}

/**
 * 購物車項目建立請求型別
 */
export interface CartItemCreateRequest {
  course_id: number
  price_option_id: number
  quantity: number
}

/**
 * 購物車項目更新請求型別
 */
export interface CartItemUpdateRequest {
  quantity: number
}

/**
 * 購物車項目回應型別 - 包含完整關聯資料
 */
export interface CartItemWithDetails {
  id: number
  uuid: string
  user_id: number
  course_id: number
  price_option_id: number
  quantity: number
  is_valid: boolean
  invalid_reason?: string
  created_at: Date
  updated_at: Date
  course: {
    id: number
    uuid: string
    name: string
    main_image: string | null
    status: string
    teacher: {
      id: number
      user: {
        name: string
        nick_name: string
      }
    }
  } | null
  price_option: {
    id: number
    uuid: string
    price: number
    quantity: number
  } | null
}

/**
 * 購物車內容摘要型別
 */
export interface CartSummary {
  total_items: number
  total_amount: number
  valid_items: number
  invalid_items: number
}

/**
 * 購物車完整回應型別
 */
export interface CartResponse {
  cart_items: CartItemWithDetails[]
  summary: CartSummary
  warnings?: string[]
}

/**
 * 購物車商品有效性檢查結果
 */
export interface CartItemValidation {
  id: number
  is_valid: boolean
  invalid_reason?: string
  course_exists: boolean
  course_published: boolean
  teacher_active: boolean
  price_option_exists: boolean
}

/**
 * 基於實體的工具型別
 */
export type CartItemEntity = Omit<UserCartItem, 'created_at' | 'updated_at'>
export type CartItemCreate = Omit<UserCartItem, 'id' | 'created_at' | 'updated_at'>
export type CartItemUpdate = Partial<Pick<UserCartItem, 'quantity'>>