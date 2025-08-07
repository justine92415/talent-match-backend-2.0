describe('基本數學運算測試', () => {
  test('1 + 1 應該等於 2', () => {
    expect(1 + 1).toBe(2)
  })

  test('加法函式應該正確運算', () => {
    const add = (a: number, b: number): number => a + b
    expect(add(1, 1)).toBe(2)
    expect(add(5, 3)).toBe(8)
    expect(add(-1, 1)).toBe(0)
  })

  test('減法運算應該正確', () => {
    expect(5 - 3).toBe(2)
    expect(10 - 5).toBe(5)
  })

  test('乘法運算應該正確', () => {
    expect(2 * 3).toBe(6)
    expect(4 * 4).toBe(16)
  })

  test('除法運算應該正確', () => {
    expect(6 / 2).toBe(3)
    expect(10 / 5).toBe(2)
  })
})
