# Task ID: 2
# Title: Fixer les problèmes ESLint
# Status: pending
# Dependencies: 1
# Priority: medium
# Description: Corriger les avertissements et erreurs ESLint pour améliorer la qualité et la maintenabilité du code

# Details:
Cette tâche vise à résoudre les problèmes identifiés par ESLint dans le codebase de DevIndé Tracker. Les principaux problèmes à traiter sont :

1. Utilisation de types 'any' trop génériques
   - Remplacer les types 'any' par des types plus spécifiques
   - Corriger les erreurs "@typescript-eslint/no-explicit-any"
   - Typages appropriés pour les paramètres de fonction et les valeurs de retour

2. Balises non échappées dans les composants React
   - Échapper correctement les apostrophes et guillemets dans les composants
   - Corriger les erreurs "react/no-unescaped-entities"

3. Variables et importations non utilisées
   - Supprimer les imports non utilisés
   - Résoudre les erreurs "@typescript-eslint/no-unused-vars"

4. Dépendances manquantes dans les hooks React
   - Ajouter les dépendances manquantes dans les tableaux de dépendances des hooks useEffect et useCallback
   - Corriger les avertissements "react-hooks/exhaustive-deps"

5. Importations require() au lieu d'imports ES6
   - Remplacer les importations CommonJS par des importations ES6
   - Corriger les erreurs "@typescript-eslint/no-require-imports"

# Test Strategy:
1. Exécuter "npx eslint --max-warnings=0 ." pour vérifier qu'aucun avertissement ou erreur ESLint ne reste
2. S'assurer que les modifications n'ont pas introduit de régressions
3. Vérifier que les composants React fonctionnent correctement, particulièrement ceux avec des entités échappées
