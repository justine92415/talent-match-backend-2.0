/**
 * 訂單驗證 Schemas
 * 提供訂單相關的請求驗證邏輯
 */

import Joi from 'joi'

// === 訂單建立驗證 ===
export const createOrderBodySchema = Joi.object({
  cart_item_ids: Joi.array()
    .items(Joi.number().integer().positive())
    .required()
    .messages({
      'array.base': '購物車項目 ID 必須是陣列',
      'any.required': '請選擇要結帳的購物車項目'
    }),
  purchase_way: Joi.string()
    .valid('line_pay', 'credit_card', 'bank_transfer')
    .required()
    .messages({
      'string.empty': '付款方式不可為空',
      'any.only': '付款方式必須是 line_pay, credit_card 或 bank_transfer 其中之一',
      'any.required': '付款方式為必填欄位'
    }),
  buyer_name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': '購買者姓名不可為空',
      'string.min': '購買者姓名不可為空',
      'string.max': '購買者姓名不可超過 50 個字元',
      'any.required': '購買者姓名為必填欄位'
    }),
  buyer_phone: Joi.string()
    .pattern(/^09\d{8}$/)
    .required()
    .messages({
      'string.pattern.base': '手機號碼格式不正確，請輸入 09 開頭的 10 位數字',
      'any.required': '手機號碼為必填欄位'
    }),
  buyer_email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '電子信箱格式不正確',
      'any.required': '電子信箱為必填欄位'
    })
})

// === 訂單列表查詢驗證 ===
export const getOrderListQuerySchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'paid', 'cancelled')
    .optional()
    .messages({
      'any.only': '訂單狀態必須是 pending, paid 或 cancelled 其中之一'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.base': '頁數必須是數字',
      'number.integer': '頁數必須是整數',
      'number.min': '頁數必須大於 0'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .messages({
      'number.base': '每頁筆數必須是數字',
      'number.integer': '每頁筆數必須是整數',
      'number.min': '每頁筆數必須大於 0',
      'number.max': '每頁筆數不可超過 100'
    })
})

// === 訂單 ID 路徑參數驗證 ===
export const orderIdParamSchema = Joi.object({
  orderId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': '訂單 ID 必須是數字',
      'number.integer': '訂單 ID 必須是整數',
      'number.positive': '訂單 ID 必須大於 0',
      'any.required': '訂單 ID 為必填參數'
    })
})