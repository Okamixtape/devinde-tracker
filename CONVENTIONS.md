# Conventions de développement pour DevIndé Tracker

Ce document définit les conventions de code et de nommage à suivre dans le projet DevIndé Tracker pour assurer un code uniforme, lisible et maintenable.

## Structure du projet

### Organisation des dossiers

- `/src/app` - Contient le code source principal de l'application
  - `/components` - Composants React réutilisables
  - `/hooks` - Hooks React personnalisés
  - `/services` - Services et logique métier
  - `/contexts` - Contextes React pour la gestion d'état
  - `/[section-name]` - Routes principales (format kebab-case)
  - `/plans/[id]/[section-name]` - Routes des sections de plan d'affaires (format kebab-case)

## Conventions de nommage

### Dossiers et Fichiers

| Type                       | Convention  | Exemple                     |
|----------------------------|-------------|----------------------------|
| Dossiers de routes         | kebab-case  | `business-model/`          |
| Fichiers de composants     | PascalCase  | `UserProfile.tsx`          |
| Fichiers de hooks          | camelCase   | `useAuth.ts`               |
| Fichiers de services       | camelCase   | `authService.ts`           |
| Fichiers d'utilitaires     | camelCase   | `fileHelper.ts`            |
| Fichiers de test           | same.test   | `Component.test.tsx`       |
| Fichiers CSS/SCSS          | kebab-case  | `button-styles.css`        |
| Fichiers de configuration  | kebab-case  | `next-config.js`           |

### Code

| Type                       | Convention  | Exemple                     |
|----------------------------|-------------|----------------------------|
| Composants React           | PascalCase  | `function UserProfile() {}` |
| Hooks personnalisés        | useCamelCase| `function useLocalStorage()`|
| Services                   | camelCase   | `const authService = {}`    |
| Interfaces/Types           | PascalCase  | `interface UserData {}`     |
| Variables/Constantes       | camelCase   | `const userData = {}`       |
| Fonctions                  | camelCase   | `function getData() {}`     |
| Props React                | camelCase   | `{isActive, onClick}`       |
| Énumérations               | PascalCase  | `enum UserRole {}`          |
| Valeurs d'énumération      | PascalCase  | `UserRole.Administrator`    |
| Constantes globales        | UPPER_SNAKE | `const MAX_RETRY_COUNT = 3` |

## Imports et Exports

### Ordre des imports

```tsx
// 1. Bibliothèques externes
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. Composants et hooks internes (via alias @)
import { useAuth } from '@/app/hooks/useAuth';
import Button from '@/app/components/Button';

// 3. Services et utilitaires
import { authService } from '@/app/services/authService';
import { formatDate } from '@/app/utils/dateUtils';

// 4. Types et interfaces
import type { UserData } from '@/app/types';

// 5. Styles et assets
import styles from './component.module.css';
```

### Utilisation d'alias

- Utiliser l'alias `@` pour les imports internes au lieu de chemins relatifs
- Exemple: `import { useAuth } from '@/app/hooks/useAuth';` au lieu de `import { useAuth } from '../../hooks/useAuth';`

## Style de code

### React/JSX

- Un composant par fichier
- Props sur plusieurs lignes si plus de 3 props
- Destructuration des props dans les paramètres de fonction
- Utiliser des fragments (`<>...</>`) au lieu de `<div>` inutiles

### TypeScript

- Toujours définir les types pour les props, états et valeurs de retour
- Éviter `any` autant que possible, préférer `unknown` si nécessaire
- Utiliser des interfaces pour les structures de données complexes
- Utiliser des types pour les unions et les intersections

## Organisation du code

- Les importations en haut du fichier
- Les types et interfaces ensuite
- Puis les constantes et variables
- Finalement le composant/fonction principale
- Les fonctions utilitaires après le composant principal

## Commentaires

- Commenter le "pourquoi", pas le "quoi"
- Utiliser JSDoc pour documenter les fonctions et composants publics
- Marquer les TODO avec format: `// TODO: [description] [JIRA-123]`

## Bonnes pratiques

- Éviter la duplication de code
- Privilégier les composants petits et ciblés
- Favoriser la composition sur l'héritage
- Tester les composants et fonctions critiques
- Optimiser les performances (mémoisation, lazy loading)
