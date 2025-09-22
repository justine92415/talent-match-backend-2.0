import { PaymentStatus } from '@entities/enums'

/**
 * 付款建立請求型別
 */
export interface PaymentCreateRequest {
  order_id: number
}

/**
 * 付款處理結果型別
 */
export interface PaymentResult {
  order_id: number
  payment_status: PaymentStatus
  paid_at: Date
}

/**
 * 付款成功回應型別
 */
export interface PaymentCreateResponse {
  payment: PaymentResult
  order: {
    id: number
    uuid: string
    payment_status: PaymentStatus
    paid_at: Date
  }
  purchases: PurchaseRecord[]
}

/**
 * 購買記錄型別
 */
export interface PurchaseRecord {
  id: number
  uuid: string
  user_id: number
  course_id: number
  order_id: number
  quantity_total: number
  quantity_used: number
  created_at: Date
}

/**
 * 購買記錄詳細資料型別
 */
export interface PurchaseRecordWithDetails {
  id: number
  uuid: string
  user_id: number
  course_id: number
  order_id: number
  quantity_total: number
  quantity_used: number
  quantity_remaining: number
  created_at: Date
  course: {
    id: number
    uuid: string
    name: string
    main_image: string | null
    teacher: {
      id: number
      user: {
        name: string
        nick_name: string
      }
    }
  }
  order: {
    id: number
    uuid: string
    total_amount: number
    paid_at: Date
  } | null
}

/**
 * 課程購買記錄詳情
 */
export interface CoursePurchaseDetail {
  id: number
  uuid: string
  user_id: number
  course_id: number
  order_id: number
  quantity_total: number
  quantity_used: number
  quantity_remaining: number
  created_at: Date
  course: {
    id: number
    uuid: string
    name: string
    teacher: {
      user: {
        nick_name: string
      }
    }
  } | null
}

/**
 * 購買記錄查詢參數型別
 */
export interface PurchaseQueryParams {
  page?: number
  per_page?: number
}

/**
 * 購買記錄回應型別
 */
export interface PurchaseResponse {
  purchases: PurchaseRecordWithDetails[]
}