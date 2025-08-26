/**
 * 購物車驗證 Schemas
 * 提供購物車相關的請求驗證邏輯
 */

import Joi from 'joi'

// === 購物車項目新增驗證 ===
export const addCartItemBodySchema = Joi.object({
  course_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '課程 ID 必須是數字',
      'number.integer': '課程 ID 必須是整數',
      'number.positive': '課程 ID 必須大於 0',
      'any.required': '課程 ID 為必填欄位'
    }),
  price_option_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '價格方案 ID 必須是數字',
      'number.integer': '價格方案 ID 必須是整數',
      'number.positive': '價格方案 ID 必須大於 0',
      'any.required': '價格方案 ID 為必填欄位'
    }),
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .default(1)
    .messages({
      'number.base': '數量必須是數字',
      'number.integer': '數量必須是整數',
      'number.min': '數量必須大於 0',
      'number.max': '數量不可超過 999'
    })
})

// === 購物車項目更新驗證 ===
export const updateCartItemBodySchema = Joi.object({
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(999)
    .required()
    .messages({
      'number.base': '數量必須是數字',
      'number.integer': '數量必須是整數',
      'number.min': '數量必須大於 0',
      'number.max': '數量不可超過 999',
      'any.required': '數量為必填欄位'
    })
})

// === 購物車項目 ID 路徑參數驗證 ===
export const cartItemIdParamSchema = Joi.object({
  itemId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '購物車項目 ID 必須是數字',
      'number.integer': '購物車項目 ID 必須是整數',
      'number.positive': '購物車項目 ID 必須大於 0',
      'any.required': '購物車項目 ID 為必填參數'
    })
})