import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const restrictLayer = (files, forbidden, message) => ({
  files,
  rules: {
    'no-restricted-imports': ['error', { patterns: [{ group: forbidden, message }] }],
  },
})

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  restrictLayer(
    ['src/domain/**'],
    [
      'react',
      'react-dom',
      'zustand',
      '**/store/**',
      '**/services/**',
      '**/hooks/**',
      '**/components/**',
      '**/containers/**',
    ],
    'domain/ is pure logic: no React, stores, services or UI.',
  ),
  restrictLayer(
    ['src/services/**'],
    [
      'react',
      'react-dom',
      'zustand',
      '**/store/**',
      '**/hooks/**',
      '**/components/**',
      '**/containers/**',
    ],
    'services/ only talk to the network: no React, stores or UI.',
  ),
  restrictLayer(
    ['src/components/**'],
    ['zustand', '**/store/**', '**/services/**', '**/hooks/**', '**/containers/**'],
    'components/ are presentational: data comes in through props only.',
  ),
  restrictLayer(
    ['src/store/**'],
    ['**/components/**', '**/containers/**', '**/hooks/**'],
    'store/ must not depend on UI.',
  ),
  prettier,
])
