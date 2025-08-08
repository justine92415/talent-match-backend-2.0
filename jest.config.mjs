export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>'],
  testMatch: ['**/tests/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: ['**/*.ts', '!**/*.d.ts', '!**/index.ts', '!**/node_modules/**', '!**/dist/**', '!**/tests/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30000, // 增加測試超時時間
  verbose: true,
  // 🔧 新增：在 CI 環境中使用序列執行避免資料庫衝突
  maxWorkers: process.env.CI ? 1 : '50%',
  // 🔧 強制序列執行測試
  runInBand: process.env.CI === 'true',
  // 🔧 測試失敗時的處理
  bail: false, // 不要在第一個測試失敗時停止
  // 🔧 清理設定
  clearMocks: true,
  restoreMocks: true
}
