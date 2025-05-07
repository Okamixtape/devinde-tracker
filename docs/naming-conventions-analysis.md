# Analyse des conventions de nommage - DevIndé Tracker

## Situation actuelle

Cette analyse identifie les incohérences de nommage dans le projet DevIndé Tracker et propose un plan d'action pour standardiser les conventions.

### Dossiers de routes

| Type                | Convention actuelle | Exemples                                 | Standard cible    |
|---------------------|---------------------|------------------------------------------|-------------------|
| Anciennes routes    | camelCase           | `/businessModel`, `/marketAnalysis`      | kebab-case        |
| Nouvelles routes    | kebab-case          | `/business-model`, `/market-analysis`    | ✅ kebab-case     |

### Structure de dossiers

| Problème                                  | Situation actuelle                       | Résolution proposée          |
|-------------------------------------------|------------------------------------------|------------------------------|
| Duplication de dossiers de contextes      | `/app/context` et `/app/contexts`        | Utiliser uniquement `/app/contexts` |
| Inconsistance dans le nommage des dossiers| Mélange de singulier et pluriel          | Standardiser sur le pluriel pour les collections |

### Composants

| Type                | Convention actuelle | Exemples                                 | Standard cible    |
|---------------------|---------------------|------------------------------------------|-------------------|
| Fichiers de composants | PascalCase      | `FloatingActions.tsx`, `Dashboard.tsx`   | ✅ PascalCase     |
| Noms de composants  | PascalCase          | `function Dashboard() {}`                | ✅ PascalCase     |

### Services et utilitaires

| Type                | Convention actuelle | Exemples                                 | Standard cible    |
|---------------------|---------------------|------------------------------------------|-------------------|
| Fichiers de services| kebab-case          | `auth-service.ts`, `error-service.ts`    | camelCase         |
| Implémentations     | Probablement camelCase | `authService`, `errorService`         | ✅ camelCase      |

### Hooks personnalisés

| Type                | Convention actuelle | Exemples                                 | Standard cible    |
|---------------------|---------------------|------------------------------------------|-------------------|
| Fichiers de hooks   | camelCase           | `useAuth.ts`, `useErrorHandler.ts`       | ✅ camelCase      |
| Noms des hooks      | camelCase avec prefix `use` | `useAuth()`, `useErrorHandler()` | ✅ camelCase avec prefix `use` |

## Incohérences majeures à résoudre

1. **Renommer les dossiers de routes anciennes** de camelCase à kebab-case
   - `/businessModel` → `/business-model`
   - `/marketAnalysis` → `/market-analysis`
   - `/actionPlan` → `/action-plan`

2. **Résoudre la duplication des contextes**
   - Analyser les deux implémentations
   - Choisir la plus complète
   - Unifier vers `/contexts` (pluriel)

3. **Standardiser les noms de fichiers services**
   - Passer de kebab-case à camelCase (plus cohérent avec les conventions JavaScript)
   - `auth-service.ts` → `authService.ts`
   - `error-service.ts` → `errorService.ts`

4. **Vérifier et standardiser les imports**
   - Favoriser l'utilisation de l'alias @ pour les chemins absolus
   - Rendre cohérente la façon d'importer les différents types de modules

## Impact sur le code existant

La standardisation des conventions de nommage aura un impact sur :

1. Les imports dans tous les fichiers faisant référence aux ressources renommées
2. Les liens de navigation dans l'application
3. La configuration des routes dans Next.js

## Approche recommandée

1. Commencer par les contextes dupliqués pour réduire la complexité
2. Standardiser les dossiers de routes en créant des redirections
3. Mettre à jour les noms de fichiers services en respectant les dépendances
4. Finir par une passe sur les imports et les références

La mise à jour progressive permettra de maintenir l'application fonctionnelle tout au long du processus de standardisation.
