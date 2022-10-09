module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'react-app',
  ],
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', '@typescript-eslint', 'prettier'],
  /*
  More: https://eslint.org/docs/rules/
  0: "off",
  1: "warn",
  2: "error",
  */
  rules: {
    'import/no-unresolved': 0,
    'jsx-a11y/accessible-emoji': 0,
    'jsx-a11y/iframe-has-title': 0,
    'no-const-assign': 1,
    'no-extra-boolean-cast': 1,
    'no-irregular-whitespace': 1,
    'no-unused-vars': 1,
    'prettier/prettier': 1,
    quotes: [1, 'single', { avoidEscape: true }],
    'spaced-comment': [1, 'always'],
    '@typescript-eslint/no-explicit-any': 0,
    'react/no-unescaped-entities': 0,
  },
}
