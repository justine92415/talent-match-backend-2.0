import { describe, test, expect } from '@jest/globals'

// 測試工具函式
const mathUtils = {
  add: (a: number, b: number): number => a + b,
  subtract: (a: number, b: number): number => a - b,
  multiply: (a: number, b: number): number => a * b,
  divide: (a: number, b: number): number => {
    if (b === 0) {
      throw new Error('除數不能為零')
    }
    return a / b
  },
  isEven: (num: number): boolean => num % 2 === 0,
  factorial: (n: number): number => {
    if (n < 0) throw new Error('階乘不接受負數')
    if (n === 0 || n === 1) return 1
    return n * mathUtils.factorial(n - 1)
  }
}

describe('數學工具函式測試', () => {
  describe('基本運算', () => {
    test('1 + 1 應該等於 2', () => {
      expect(mathUtils.add(1, 1)).toBe(2)
    })

    test('加法應該正確處理正數', () => {
      expect(mathUtils.add(5, 3)).toBe(8)
      expect(mathUtils.add(10, 15)).toBe(25)
    })

    test('加法應該正確處理負數', () => {
      expect(mathUtils.add(-5, 3)).toBe(-2)
      expect(mathUtils.add(-10, -5)).toBe(-15)
    })

    test('減法應該正確運算', () => {
      expect(mathUtils.subtract(10, 5)).toBe(5)
      expect(mathUtils.subtract(0, 5)).toBe(-5)
    })

    test('乘法應該正確運算', () => {
      expect(mathUtils.multiply(3, 4)).toBe(12)
      expect(mathUtils.multiply(-2, 5)).toBe(-10)
    })

    test('除法應該正確運算', () => {
      expect(mathUtils.divide(10, 2)).toBe(5)
      expect(mathUtils.divide(15, 3)).toBe(5)
    })

    test('除以零應該拋出錯誤', () => {
      expect(() => mathUtils.divide(10, 0)).toThrow('除數不能為零')
    })
  })

  describe('進階函式', () => {
    test('isEven 應該正確判斷奇偶數', () => {
      expect(mathUtils.isEven(2)).toBe(true)
      expect(mathUtils.isEven(3)).toBe(false)
      expect(mathUtils.isEven(0)).toBe(true)
      expect(mathUtils.isEven(-2)).toBe(true)
      expect(mathUtils.isEven(-3)).toBe(false)
    })

    test('factorial 應該正確計算階乘', () => {
      expect(mathUtils.factorial(0)).toBe(1)
      expect(mathUtils.factorial(1)).toBe(1)
      expect(mathUtils.factorial(5)).toBe(120)
      expect(mathUtils.factorial(3)).toBe(6)
    })

    test('負數階乘應該拋出錯誤', () => {
      expect(() => mathUtils.factorial(-1)).toThrow('階乘不接受負數')
    })
  })

  describe('邊界條件測試', () => {
    test('大數加法', () => {
      expect(mathUtils.add(Number.MAX_SAFE_INTEGER, 0)).toBe(Number.MAX_SAFE_INTEGER)
    })

    test('小數運算', () => {
      expect(mathUtils.add(0.1, 0.2)).toBeCloseTo(0.3)
      expect(mathUtils.multiply(0.1, 3)).toBeCloseTo(0.3)
    })
  })
})
