'use strict';

module.exports = {
  root: false,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'script',
  },
  plugins: ['node'],
  extends: ['plugin:node/recommended'],
  env: {
    browser: false,
    node: true,
  },
  rules: {},

  overrides: [
    // test files
    {
      files: ['node-tests/**/*.js'],
      parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2017,
      },
      env: {
        browser: false,
        node: true,
        mocha: true,
      },

      rules: {
        'node/no-unpublished-require': 0,
      },
    },
  ],
};
