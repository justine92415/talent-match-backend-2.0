import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/*.test.mjs', '**/*.spec.mjs'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        test: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    }
  },
  {
    ignores: ['**/*.ts', 'dist/**', 'node_modules/**', 'coverage/**']
  }
]
