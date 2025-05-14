const { ESLint } = require('eslint');

async function main() {
  // Initialiser ESLint avec une configuration spécifique aux imports
  const eslint = new ESLint({
    fix: true,
    useEslintrc: false,
    overrideConfig: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      plugins: ['import'],
      rules: {
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
            'newlines-between': 'always',
            pathGroups: [
              {
                pattern: '@/**',
                group: 'internal',
                position: 'before'
              }
            ],
            alphabetize: {
              order: 'asc',
              caseInsensitive: true
            }
          }
        ]
      },
      settings: {
        'import/resolver': {
          node: {
            extensions: ['.js', '.jsx', '.ts', '.tsx']
          }
        }
      }
    }
  });

  // Linter tous les fichiers src/**/*.{ts,tsx}
  const results = await eslint.lintFiles('src/**/*.{ts,tsx}');
  
  // Appliquer les corrections automatiques
  await ESLint.outputFixes(results);

  // Formatter et afficher les résultats
  const formatter = await eslint.loadFormatter('stylish');
  const resultText = formatter.format(results);

  console.log('Organisation des imports terminée !');
  if (resultText) {
    console.log('Problèmes restants (ne nécessitant pas d\'action immédiate):');
    console.log(resultText);
  }
}

main().catch(error => {
  console.error('Erreur pendant l\'organisation des imports:', error);
  process.exit(1);
});
