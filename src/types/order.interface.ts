import { Order } from '@entities/Order'
import { OrderItem } from '@entities/OrderItem'
import { PurchaseWay, PaymentStatus } from '@entities/enums'

/**
 * 訂單建立請求型別
 */
export interface OrderCreateRequest {
  purchase_way: PurchaseWay
  buyer_name: string
  buyer_phone: string
  buyer_email: string
}

/**
 * 訂單項目詳細資料型別
 */
export interface OrderItemWithDetails {
  id: number
  uuid: string
  order_id: number
  course_id: number
  price_option_id: number
  quantity: number
  unit_price: number
  total_price: number
  created_at: Date
  updated_at: Date
  course: {
    id: number
    uuid: string
    name: string
    main_image: string | null
    teacher: {
      user: {
        nick_name: string
      }
    }
  }
  price_option: {
    id: number
    uuid: string
    price: number
    quantity: number
  }
}

/**
 * 訂單完整資料型別
 */
export interface OrderWithDetails {
  id: number
  uuid: string
  buyer_id: number
  purchase_way: PurchaseWay
  buyer_name: string
  buyer_phone: string
  buyer_email: string
  total_amount: number
  payment_status: PaymentStatus
  paid_at?: Date
  created_at: Date
  updated_at: Date
}

/**
 * 訂單建立回應型別
 */
export interface OrderCreateResponse {
  order: OrderWithDetails
  order_items: OrderItemWithDetails[]
}

/**
 * 訂單列表項目型別
 */
export interface OrderListItem {
  id: number
  uuid: string
  purchase_way: PurchaseWay
  buyer_name: string
  total_amount: number
  payment_status: PaymentStatus
  paid_at?: Date
  created_at: Date
  items_count: number
  courses_summary: {
    course_name: string
    total_quantity: number
  }[]
}

/**
 * 訂單查詢參數型別
 */
export interface OrderQueryParams {
  status?: PaymentStatus
  page?: number
  per_page?: number
}

/**
 * 訂單分頁回應型別
 */
export interface OrderPaginatedResponse {
  orders: OrderListItem[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

/**
 * 訂單取消回應型別
 */
export interface OrderCancelResponse {
  order: {
    id: number
    uuid: string
    payment_status: PaymentStatus
    updated_at: Date
  }
}

/**
 * 基於實體的工具型別
 */
export type OrderEntity = Omit<Order, 'created_at' | 'updated_at' | 'deleted_at'>
export type OrderCreate = Omit<Order, 'id' | 'uuid' | 'payment_status' | 'paid_at' | 'created_at' | 'updated_at' | 'deleted_at'>
export type OrderItemEntity = Omit<OrderItem, 'created_at' | 'updated_at'>
export type OrderItemCreate = Omit<OrderItem, 'id' | 'uuid' | 'created_at' | 'updated_at'>