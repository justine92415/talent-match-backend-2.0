/**
 * 時間處理工具類
 * 統一處理預約系統中的時間格式轉換和比較邏輯
 * 解決不同時間格式間的轉換問題
 */

export class TimeUtils {
  /**
   * 將日期和時間轉換為 UTC 時間戳
   * @param date 日期字串 (YYYY-MM-DD)
   * @param time 時間字串 (HH:mm 或 HH:mm:ss)
   * @returns UTC Date 物件
   */
  static dateTimeToUTC(date: string, time: string): Date {
    // 確保時間格式包含秒數
    const normalizedTime = time.includes(':') && time.split(':').length === 2 
      ? `${time}:00` 
      : time
    
    const utcString = `${date}T${normalizedTime}.000Z`
    return new Date(utcString)
  }

  /**
   * 將時間字串轉換為分鐘數（從 00:00 開始計算）
   * @param time 時間字串 (HH:mm 或 HH:mm:ss)
   * @returns 分鐘數
   */
  static timeToMinutes(time: string): number {
    const timeParts = time.split(':')
    const hour = parseInt(timeParts[0], 10)
    const minute = parseInt(timeParts[1], 10)
    
    if (isNaN(hour) || isNaN(minute)) {
      throw new Error(`Invalid time format: ${time}`)
    }
    
    return hour * 60 + minute
  }

  /**
   * 將分鐘數轉換為時間字串
   * @param minutes 分鐘數
   * @returns 時間字串 (HH:mm)
   */
  static minutesToTime(minutes: number): string {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  /**
   * 檢查目標時間是否在時間範圍內
   * @param targetTime 目標時間 (HH:mm 或 HH:mm:ss)
   * @param startTime 開始時間 (HH:mm 或 HH:mm:ss)
   * @param endTime 結束時間 (HH:mm 或 HH:mm:ss)
   * @returns 是否在範圍內
   */
  static isTimeInRange(targetTime: string, startTime: string, endTime: string): boolean {
    try {
      const target = this.timeToMinutes(targetTime)
      const start = this.timeToMinutes(startTime)
      const end = this.timeToMinutes(endTime)
      
      return target >= start && target < end
    } catch (error) {
      console.error('Time range validation error:', error)
      return false
    }
  }

  /**
   * 從 Date 物件提取時間字串
   * @param date Date 物件
   * @returns 時間字串 (HH:mm:ss)
   */
  static extractTimeString(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  /**
   * 從 Date 物件提取 UTC 時間字串
   * @param date Date 物件
   * @returns UTC 時間字串 (HH:mm:ss)
   */
  static extractUTCTimeString(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0')
    const minutes = date.getUTCMinutes().toString().padStart(2, '0')
    const seconds = date.getUTCSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  /**
   * 驗證日期格式 (YYYY-MM-DD)
   * @param date 日期字串
   * @returns 是否為有效格式
   */
  static isValidDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(date)) {
      return false
    }

    // 檢查日期是否實際存在
    const dateObj = new Date(date + 'T00:00:00.000Z')
    return !isNaN(dateObj.getTime()) && 
           dateObj.toISOString().split('T')[0] === date
  }

  /**
   * 驗證時間格式 (HH:mm 或 HH:mm:ss)
   * @param time 時間字串
   * @returns 是否為有效格式
   */
  static isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/
    return timeRegex.test(time)
  }

  /**
   * 正規化時間格式（統一為 HH:mm:ss）
   * @param time 時間字串 (HH:mm 或 HH:mm:ss)
   * @returns 正規化後的時間字串 (HH:mm:ss)
   */
  static normalizeTimeFormat(time: string): string {
    if (!this.isValidTimeFormat(time)) {
      throw new Error(`Invalid time format: ${time}`)
    }

    const parts = time.split(':')
    if (parts.length === 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`
    }
    
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:${parts[2].padStart(2, '0')}`
  }

  /**
   * 計算星期幾（使用 UTC 時間避免時區問題）
   * @param date 日期字串 (YYYY-MM-DD)
   * @returns 星期幾 (0=週日, 1=週一, ..., 6=週六)
   */
  static getUTCWeekday(date: string): number {
    const dateObj = new Date(date + 'T00:00:00.000Z')
    return dateObj.getUTCDay()
  }
}