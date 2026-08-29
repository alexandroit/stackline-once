import js from '@eslint/js'

const globals = {
  Buffer: 'readonly',
  URL: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  console: 'readonly',
  module: 'readonly',
  process: 'readonly',
  require: 'readonly',
  setTimeout: 'readonly'
}

export default [
  { ignores: ['coverage/**', 'node_modules/**', 'release-candidate/**', 'site-dist/**'] },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.cjs'],
    languageOptions: { ecmaVersion: 2020, sourceType: 'commonjs', globals },
    rules: {
      curly: ['error', 'multi-line'],
      'no-unused-vars': ['error', { caughtErrors: 'none' }]
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals },
    rules: { 'no-unused-vars': ['error', { caughtErrors: 'none' }] }
  },
  {
    files: ['docs-site/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: { document: 'readonly' }
    }
  }
]
