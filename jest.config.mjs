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
  testTimeout: 10000,
  verbose: true
}
