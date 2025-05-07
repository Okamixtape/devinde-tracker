module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  plugins: ['@typescript-eslint', 'import', 'react-hooks'],
  rules: {
    // Nettoyer les imports non utilisés
    'no-unused-vars': 'off', // Désactivé car @typescript-eslint/no-unused-vars est plus précis
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_'
    }],
    
    // Désactivé temporairement pour permettre le build
    // Note: We'll gradually enable this in the future for better type safety
    '@typescript-eslint/no-explicit-any': 'error',
    
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // React-specific rules for HOCs
    'react/display-name': 'error',
    
    // Règles d'importation
    'import/order': [
      'error',
      {
        groups: [
          ['builtin', 'external'], // 1. Bibliothèques externes
          'internal',              // 2. Imports internes (avec alias @)
          'parent',                // 3. Imports relatifs (../../)
          'sibling',               // 4. Imports du même niveau (./)
          'index',                 // 5. Imports depuis index
          'type',                  // 6. Types
          'object'                 // 7. Styles et assets
        ],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal'
          },
          {
            pattern: '*.css',
            group: 'object',
            position: 'after'
          }
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    // Règles pour éviter les mauvais imports
    'import/no-unused-modules': ['error', { unusedExports: true }],
    'import/no-cycle': 'error', // Détecte les imports circulaires
    'import/no-deprecated': 'warn',
    'import/no-duplicates': 'error',
    'import/extensions': ['error', 'never', { css: 'always', json: 'always' }],
    'import/first': 'error', // Tous les imports doivent être en haut du fichier
    'import/exports-last': 'error', // Les exports doivent être à la fin
    'import/no-mutable-exports': 'error', // Pas d'exports de variables mutables
    'import/no-absolute-path': 'error', // Pas de chemins absolus
    'import/no-webpack-loader-syntax': 'error', // Pas de syntaxe de loader webpack dans les imports
    
    // Assurer une utilisation standardisée des import/require
    'import/no-commonjs': 'error', // Pas de require()
    'import/no-amd': 'error', // Pas de define()
    'import/no-dynamic-require': 'error', // Pas de require() dynamique
    
    // Assurer que les noms de fichiers en camelCase sont utilisés correctement
    'import/no-unresolved': 'error', // S'assurer que tous les imports sont résolvables
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json'
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/internal-regex': '^@/'
  }
};
