import Joi from 'joi'

/**
 * 更新個人資料請求驗證
 */
export const updateProfileSchema = Joi.object({
  nick_name: Joi.string().min(1).max(50).optional().messages({
    "string.empty": "暱稱不能為空",
    "string.min": "暱稱至少需要1個字元",
    "string.max": "暱稱長度不能超過50個字元"
  }),
  name: Joi.string().max(100).optional().allow(null, "").messages({
    "string.max": "姓名長度不能超過100個字元"
  }),
  birthday: Joi.date().optional().allow(null).messages({
    "date.base": "生日必須是有效的日期格式"
  }),
  contact_phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).max(20).optional().allow(null, "").messages({
    "string.pattern.base": "聯絡電話格式不正確",
    "string.max": "聯絡電話長度不能超過20個字元"
  }),
  avatar_image: Joi.string().uri().optional().allow(null, "").messages({
    "string.uri": "大頭貼必須是有效的網址"
  })
})