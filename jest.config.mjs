export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests', '<rootDir>/src'],
  testMatch: ['**/src/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: ['src/**/*.ts', '!**/*.d.ts', '!**/index.ts', '!**/node_modules/**', '!**/dist/**', '!**/src/tests/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/jest-setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000, // 增加測試超時時間
  verbose: true,
  // 🔧 強制序列執行測試避免資料庫衝突
  // 統一使用 maxWorkers: 1 來確保序列執行，避免 runInBand 驗證問題
  maxWorkers: 1,
  // 🔧 測試失敗時的處理
  bail: false, // 不要在第一個測試失敗時停止
  // 🔧 清理設定
  clearMocks: true,
  restoreMocks: true
}
