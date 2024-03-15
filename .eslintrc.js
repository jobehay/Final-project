module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      project: './tsconfig.json',
      ecmaFeatures: {
        jsx: true,
      },
    },
    env: {
      'react-native/react-native': true,
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        node: {
          extensions: ['.ts', '.tsx'],
          paths: ['src'],
        },
      },
    },
    extends: [
      'plugin:react-native/all',
      'airbnb-typescript',
      'airbnb/hooks',
      'plugin:@typescript-eslint/recommended',
      'plugin:jest/recommended',
      'prettier',
      'prettier/react',
      'prettier/@typescript-eslint',
      'plugin:import/recommended',
      'plugin:import/typescript',
      'plugin:prettier/recommended',
    ],
    plugins: ['react', 'react-native', 'import', 'jest', '@typescript-eslint'],
    ignorePatterns: [
      '.eslintrc.js',
      '*/.stories.js',
      '*/.d.ts',
      'e2e/*/.*',
      'e2e*/*/.*',
    ],
    rules: {
      'react-native/no-raw-text': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'react-native/sort-styles': 'off',
      'react/prop-types': [0],
      '@typescript-eslint/no-var-requires': 0,
      '@typescript-eslint/return-await': 0,
      'react/jsx-props-no-spreading': [
        1,
        {
          html: 'enforce',
          custom: 'ignore',
        },
      ],
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto',
        },
      ],
      // 'react/destructuring-assignment': [0],
      '@typescript-eslint/no-use-before-define': ['error', { variables: false }],
      'no-unused-vars': ['error', { argsIgnorePattern: 'req|res|next|val' }],
      'import/no-cycle': [1, { ignoreExternal: true }],
      'react/require-default-props': 0,
      'react/default-props-match-prop-types': 0,
      'import/order': [
        2,
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: '{components/*,hooks/*}',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{store/**}',
              group: 'internal',
              position: 'after',
            },
            {
              pattern: '{services/*,utils/*}',
              group: 'internal',
              position: 'after',
            },
          ],
        },
      ],
    },
  }