/**
 * 課程影片關聯 Joi 驗證 Schemas
 * 
 * 遵循專案開發準則：
 * - 使用 MESSAGES 常數確保錯誤訊息一致性
 * - 支援影片ID列表驗證
 * - 支援影片順序設定驗證
 * - 支援預覽標示驗證
 * - 整合專案既有的驗證架構
 */

import Joi from 'joi'
import { MESSAGES } from '@constants/Message'

// ========================================
// 基礎驗證規則
// ========================================

/** 影片ID驗證規則 */
const videoIdSchema = Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
    'number.base': MESSAGES.VALIDATION.VIDEO_ID_INVALID,
    'number.integer': MESSAGES.VALIDATION.VIDEO_ID_INVALID,
    'number.positive': MESSAGES.VALIDATION.VIDEO_ID_INVALID,
    'any.required': MESSAGES.VALIDATION.VIDEO_ID_INVALID,
  })

/** 課程ID驗證規則 */
const courseIdSchema = Joi.number()
  .integer()
  .positive()
  .required()
  .messages({
    'number.base': '課程ID格式不正確',
    'number.integer': '課程ID必須為整數',
    'number.positive': '課程ID必須為正整數',
    'any.required': '課程ID為必填欄位',
  })

/** 顯示順序驗證規則 */
const displayOrderSchema = Joi.number()
  .integer()
  .min(1)
  .max(1000)
  .required()
  .messages({
    'number.base': MESSAGES.VALIDATION.DISPLAY_ORDER_INVALID,
    'number.integer': MESSAGES.VALIDATION.DISPLAY_ORDER_INVALID,
    'number.min': MESSAGES.VALIDATION.DISPLAY_ORDER_INVALID,
    'number.max': MESSAGES.VALIDATION.DISPLAY_ORDER_INVALID,
    'any.required': MESSAGES.VALIDATION.DISPLAY_ORDER_REQUIRED,
  })

/** 預覽標示驗證規則 */
const isPreviewSchema = Joi.boolean()
  .default(false)
  .messages({
    'boolean.base': MESSAGES.VALIDATION.IS_PREVIEW_INVALID,
  })

// ========================================
// 影片順序資訊驗證
// ========================================

/** 影片順序項目驗證 */
const videoOrderItemSchema = Joi.object({
  video_id: videoIdSchema,
  display_order: displayOrderSchema,
  is_preview: isPreviewSchema.optional(),
}).required()

/** 影片順序更新項目驗證 */
const videoOrderUpdateSchema = Joi.object({
  video_id: videoIdSchema,
  display_order: displayOrderSchema,
}).required()

// ========================================
// API 請求驗證 Schemas
// ========================================

/**
 * 連結影片到課程 - POST /api/courses/:id/videos
 * Body Schema
 */
export const linkVideosToCourseBodySchema = Joi.object({
  video_ids: Joi.array()
    .items(videoIdSchema)
    .min(1)
    .max(50)
    .unique()
    .required()
    .messages({
      'array.base': MESSAGES.VALIDATION.VIDEO_IDS_INVALID,
      'array.min': MESSAGES.VALIDATION.VIDEO_IDS_REQUIRED,
      'array.max': MESSAGES.VALIDATION.VIDEO_IDS_INVALID,
      'array.unique': MESSAGES.VALIDATION.VIDEO_IDS_INVALID,
      'array.includesRequiredUnknowns': MESSAGES.VALIDATION.VIDEO_IDS_REQUIRED,
      'any.required': MESSAGES.VALIDATION.VIDEO_IDS_REQUIRED,
    }),
  order_info: Joi.array()
    .items(videoOrderItemSchema)
    .min(1)
    .max(50)
    .required()
    .custom((value, helpers) => {
      // 驗證 order_info 和 video_ids 長度一致
      const videoIds = helpers.state.ancestors[0].video_ids
      if (videoIds && value.length !== videoIds.length) {
        return helpers.error('custom.mismatch')
      }

      // 驗證 order_info 中的 video_id 都在 video_ids 中
      const videoIdSet = new Set(videoIds)
      for (const item of value) {
        if (!videoIdSet.has(item.video_id)) {
          return helpers.error('custom.invalid-video-id')
        }
      }

      // 驗證顯示順序不重複
      const orders = value.map((item: any) => item.display_order)
      const uniqueOrders = new Set(orders)
      if (orders.length !== uniqueOrders.size) {
        return helpers.error('custom.duplicate-order')
      }

      return value
    })
    .messages({
      'array.base': 'order_info 必須為陣列',
      'array.min': 'order_info 至少需要一個項目',
      'array.max': 'order_info 最多只能有 50 個項目',
      'any.required': 'order_info 為必填欄位',
      'custom.mismatch': 'order_info 和 video_ids 的數量必須一致',
      'custom.invalid-video-id': 'order_info 中包含不在 video_ids 中的影片',
      'custom.duplicate-order': '顯示順序不能重複',
    }),
}).required()

/**
 * 課程ID參數驗證 Schema (課程影片關聯用)
 */
export const courseVideoIdParamSchema = Joi.object({
  id: courseIdSchema,
}).required()

/**
 * 更新課程影片順序 - PUT /api/courses/:course_id/videos/order
 * Body Schema
 */
export const updateVideoOrderBodySchema = Joi.object({
  video_orders: Joi.array()
    .items(videoOrderUpdateSchema)
    .min(1)
    .max(50)
    .required()
    .custom((value, helpers) => {
      // 驗證影片ID不重複
      const videoIds = value.map((item: any) => item.video_id)
      const uniqueVideoIds = new Set(videoIds)
      if (videoIds.length !== uniqueVideoIds.size) {
        return helpers.error('custom.duplicate-video-id')
      }

      // 驗證顯示順序不重複
      const orders = value.map((item: any) => item.display_order)
      const uniqueOrders = new Set(orders)
      if (orders.length !== uniqueOrders.size) {
        return helpers.error('custom.duplicate-order')
      }

      // 驗證順序連續性（1, 2, 3, ...）
      const sortedOrders = [...orders].sort((a, b) => a - b)
      for (let i = 0; i < sortedOrders.length; i++) {
        if (sortedOrders[i] !== i + 1) {
          return helpers.error('custom.invalid-sequence')
        }
      }

      return value
    })
    .messages({
      'array.base': MESSAGES.VALIDATION.VIDEO_ORDERS_INVALID,
      'array.min': MESSAGES.VALIDATION.VIDEO_ORDERS_REQUIRED,
      'array.max': MESSAGES.VALIDATION.VIDEO_ORDERS_INVALID,
      'array.includesRequiredUnknowns': MESSAGES.VALIDATION.VIDEO_ORDERS_REQUIRED,
      'any.required': MESSAGES.VALIDATION.VIDEO_ORDERS_REQUIRED,
      'custom.duplicate-video-id': '影片ID不能重複',
      'custom.duplicate-order': '顯示順序不能重複',
      'custom.invalid-sequence': '顯示順序必須連續（從1開始）',
    }),
}).required()

/**
 * 課程ID參數驗證 Schema (用於PUT)
 */
export const courseIdForUpdateParamSchema = Joi.object({
  course_id: courseIdSchema,
}).required()

/**
 * 移除課程影片關聯參數驗證 Schema
 */
export const removeCourseVideoParamSchema = Joi.object({
  course_id: courseIdSchema,
  video_id: videoIdSchema,
}).required()

// ========================================
// 驗證中間件函式
// ========================================

import { Request, Response, NextFunction } from 'express'
import { Errors } from '@utils/errors'

/**
 * 驗證連結影片到課程的請求
 */
export const validateLinkVideosToCourse = (req: Request, res: Response, next: NextFunction) => {
  // 驗證課程ID參數
  const { error: paramError } = courseVideoIdParamSchema.validate({ id: parseInt(req.params.id) })
  if (paramError) {
    const formattedErrors: Record<string, string[]> = {}
    paramError.details.forEach((detail: any) => {
      const key = detail.path.join('.')
      if (!formattedErrors[key]) {
        formattedErrors[key] = []
      }
      formattedErrors[key].push(detail.message)
    })
    return next(Errors.validation(formattedErrors, '參數驗證失敗'))
  }

  // 驗證請求體
  const { error: bodyError } = linkVideosToCourseBodySchema.validate(req.body)
  if (bodyError) {
    const formattedErrors: Record<string, string[]> = {}
    bodyError.details.forEach((detail: any) => {
      const key = detail.path.join('.')
      if (!formattedErrors[key]) {
        formattedErrors[key] = []
      }
      formattedErrors[key].push(detail.message)
    })
    return next(Errors.validation(formattedErrors, '參數驗證失敗'))
  }
  
  next()
}

/**
 * 驗證更新課程影片順序的請求
 */
export const validateUpdateVideoOrder = (req: Request, res: Response, next: NextFunction) => {
  // 驗證課程ID參數
  const { error: paramError } = courseIdForUpdateParamSchema.validate({ course_id: parseInt(req.params.course_id) })
  if (paramError) {
    const formattedErrors: Record<string, string[]> = {}
    paramError.details.forEach((detail: any) => {
      const key = detail.path.join('.')
      if (!formattedErrors[key]) {
        formattedErrors[key] = []
      }
      formattedErrors[key].push(detail.message)
    })
    return next(Errors.validation(formattedErrors, '參數驗證失敗'))
  }

  // 驗證請求體
  const { error: bodyError } = updateVideoOrderBodySchema.validate(req.body)
  if (bodyError) {
    const formattedErrors: Record<string, string[]> = {}
    bodyError.details.forEach((detail: any) => {
      const key = detail.path.join('.')
      if (!formattedErrors[key]) {
        formattedErrors[key] = []
      }
      formattedErrors[key].push(detail.message)
    })
    return next(Errors.validation(formattedErrors, '參數驗證失敗'))
  }
  
  next()
}

/**
 * 驗證移除課程影片關聯的請求
 */
export const validateRemoveCourseVideo = (req: Request, res: Response, next: NextFunction) => {
  const { error } = removeCourseVideoParamSchema.validate({ 
    course_id: parseInt(req.params.course_id),
    video_id: parseInt(req.params.video_id)
  })
  
  if (error) {
    const formattedErrors: Record<string, string[]> = {}
    error.details.forEach((detail: any) => {
      const key = detail.path.join('.')
      if (!formattedErrors[key]) {
        formattedErrors[key] = []
      }
      formattedErrors[key].push(detail.message)
    })
    return next(Errors.validation(formattedErrors, '參數驗證失敗'))
  }
  
  next()
}

/**
 * 驗證取得課程影片列表的請求
 */
export const validateGetCourseVideos = (req: Request, res: Response, next: NextFunction) => {
  const { error } = courseVideoIdParamSchema.validate({ id: parseInt(req.params.id) })
  
  if (error) {
    const formattedErrors: Record<string, string[]> = {}
    error.details.forEach((detail: any) => {
      const key = detail.path.join('.')
      if (!formattedErrors[key]) {
        formattedErrors[key] = []
      }
      formattedErrors[key].push(detail.message)
    })
    return next(Errors.validation(formattedErrors, '參數驗證失敗'))
  }
  
  next()
}

// ========================================
// 匯出所有驗證 Schemas 和中間件
// ========================================

export const courseVideoSchemas = {
  linkVideosToCourseBodySchema,
  updateVideoOrderBodySchema,
  courseVideoIdParamSchema,
  courseIdForUpdateParamSchema,
  removeCourseVideoParamSchema,
}

export default courseVideoSchemas