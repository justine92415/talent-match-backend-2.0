import * as dotenv from 'dotenv'
import { Config } from '../types'
import dbConfig from './db'
import webConfig from './web'
import secretConfig from './secret'

// 只有在非 production 環境下才載入 .env 檔
if (process.env.NODE_ENV !== 'production') {
  const result = dotenv.config()

  if (result.error) {
    throw result.error
  }
}

const config: Config = {
  db: dbConfig,
  web: webConfig,
  secret: secretConfig
}

class ConfigManager {
  /**
   * 根據提供的點分隔路徑檢索設定值。
   * 如果找不到指定的設定路徑，則拋出錯誤。
   *
   * @param path - 表示設定路徑的點分隔字串。
   * @returns 對應於給定路徑的設定值。
   * @throws 如果找不到設定路徑，將拋出錯誤。
   */
  static get<T = unknown>(path: string): T {
    if (!path || typeof path !== 'string') {
      throw new Error(`incorrect path: ${path}`)
    }

    const keys = path.split('.')
    let configValue: unknown = config

    keys.forEach(key => {
      if (typeof configValue !== 'object' || configValue === null || !Object.prototype.hasOwnProperty.call(configValue, key)) {
        throw new Error(`config ${path} not found`)
      }
      configValue = (configValue as Record<string, unknown>)[key]
    })

    return configValue as T
  }
}

export default ConfigManager
