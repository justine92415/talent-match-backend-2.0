/**
 * Schema 彙整檔案
 * 統一匯出所有模組的 Schema
 */

import { commonSchemas } from './common'
import { authSchemas } from './auth'
import { userAvatarSchemas } from './userAvatar'

// 合併所有 Schema
export const allSchemas = {
  ...commonSchemas,
  ...authSchemas,
  ...userAvatarSchemas
}

// 也可以分別匯出，供特定需求使用
export { commonSchemas, authSchemas, userAvatarSchemas }