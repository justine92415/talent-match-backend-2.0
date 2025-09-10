import { Request } from 'express'
import Joi from 'joi'
import { AdminTokenPayload } from './admin.interface'
import { JwtTokenPayload } from './auth.interface'

/**
 * 認證後的使用者資訊 - 支援多重角色
 */
export interface AuthenticatedUser {
  userId: number
  role: string  // 主要角色，向後相容性
  roles: string[]  // 所有角色陣列
  type: string
}

/**
 * 擴展的 Request 介面 - 包含使用者認證資訊
 */
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser
}

/**
 * 擴展的 Request 介面 - 包含管理員認證資訊
 */
export interface AdminAuthenticatedRequest extends Request {
  admin?: AdminTokenPayload
}

/**
 * 擴展的 Request 介面 - 包含使用者和管理員認證資訊
 */
export interface FullAuthenticatedRequest extends Request {
  user?: AuthenticatedUser
  admin?: AdminTokenPayload
}

/**
 * 驗證錯誤詳情格式
 */
export interface ValidationErrorDetails {
  [fieldPath: string]: string[]
}

/**
 * 驗證配置選項
 */
export interface ValidationConfig {
  /** 請求體驗證 Schema */
  body?: Joi.Schema
  /** 路徑參數驗證 Schema */
  params?: Joi.Schema
  /** 查詢參數驗證 Schema */
  query?: Joi.Schema
  /** 請求標頭驗證 Schema */
  headers?: Joi.Schema
  /** 自訂錯誤訊息 */
  errorMessage?: string
}

/**
 * 中間件錯誤回應介面
 */
export interface MiddlewareErrorResponse {
  status: 'error'
  code: string
  message: string
  errors?: ValidationErrorDetails
}

// 全域類型擴展 - 支援多重角色
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
      admin?: AdminTokenPayload
    }
  }
}

// 確保模組被正確解析
export {}