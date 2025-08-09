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
  // 🔧 強制序列執行測試避免資料庫衝突 (本地環境)
  // CI 環境會在 npm test 命令中指定 --runInBand
  maxWorkers: process.env.CI === 'true' ? undefined : 1,
  ...(process.env.CI !== 'true' && { runInBand: true }),
  // 🔧 測試失敗時的處理
  bail: false, // 不要在第一個測試失敗時停止
  // 🔧 清理設定
  clearMocks: true,
  restoreMocks: true
}
