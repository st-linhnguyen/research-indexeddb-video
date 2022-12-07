module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // possible-errors
    'no-console': ['off'],

    // best-practices
    'curly': ['error'],
    'default-ca.se': ['off'],
    'default-case-last': ['warn'],
    'eqeqeq': ['error', 'always'],
    'no-multi-spaces': ['warn'],
    'no-alert': ['warn'],
    'indent': ['error', 2],

    // variables
    'no-undef-init': ['error'],

    // stylistic-issues
    'array-bracket-newline': ['warn', 'consistent'],
    'brace-style': ['error'],
    'camelcase': ['off', { properties: 'never' }],
    'comma-spacing': ['warn', { 'before': false, 'after': true }],
    'eol-last': ['error', 'always'],
    'object-curly-newline': ['warn', { consistent: true }],
    'object-curly-spacing': ['warn', 'always'],
    'func-style': ['warn', 'expression'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'semi-style': ['error', 'last'],
    'no-nested-ternary': ['warn'],
    'no-unneeded-ternary': ['error'],
    'no-whitespace-before-property': ['error'],
    'no-trailing-spaces': ['warn', { 'skipBlankLines': true }],
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0, 'maxBOF': 0 }],

    // es 6
    'arrow-spacing': ['warn', { 'before': true, 'after': true }],
    'no-duplicate-imports': ['warn'],
    'no-case-declarations': ['off'],

    // others
    'no-useless-escape': ['off'],
    'no-global-assign': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-unused-vars': ['off']
  },
};
