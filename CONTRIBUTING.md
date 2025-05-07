# Guide de contribution à DevIndé Tracker

Ce document définit les règles et standards à suivre pour contribuer au projet DevIndé Tracker.

## Convention de code

### Structure des imports

Les imports doivent suivre la structure suivante et être séparés par des sauts de ligne entre chaque groupe :

```typescript
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

### Utilisation des alias

- **Toujours** utiliser l'alias `@` pour les imports internes au lieu des chemins relatifs complexes.
- Exemple: `import { useAuth } from '@/app/hooks/useAuth';` au lieu de `import { useAuth } from '../../hooks/useAuth';`
- Les imports relatifs sont acceptables uniquement pour les fichiers du même répertoire ou d'un sous-répertoire direct.

### Nommage des fichiers de service et utilitaires

- Les fichiers de services et utilitaires doivent utiliser le format **camelCase**.
- Exemple: `authService.ts`, `dataOperations.ts`, `jwtHelper.ts`

### Points à vérifier avant d'envoyer une pull request

- Les imports suivent les conventions ci-dessus
- Aucun import en kebab-case pour les services et utilitaires 
- Pas d'imports inutilisés
- Pas d'imports circulaires

## Process de développement

### Installation des dépendances de développement

```bash
npm install
```

### Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire l'application
- `npm run lint` - Exécuter le linter
- `npm run organize-imports` - Standardiser les imports selon les conventions
- `npm run pre-commit` - Vérifications à exécuter avant de commit (automatiquement via husky)

### Process de contribution

1. Créer une branche à partir de `main`
2. Faire les modifications nécessaires
3. Exécuter `npm run pre-commit` pour vérifier la qualité du code
4. Soumettre une pull request
5. Attendre la revue de code

## Résolution des problèmes fréquents

### Erreurs d'import

Si vous rencontrez des erreurs d'import, essayez d'exécuter `npm run organize-imports` pour standardiser automatiquement les imports.

### Imports circulaires

Les imports circulaires peuvent causer des problèmes difficiles à déboguer. Si vous en rencontrez :
1. Identifiez les fichiers impliqués dans la circularité
2. Déplacez les interfaces partagées dans un fichier séparé
3. Utilisez l'injection de dépendances plutôt que des imports directs quand c'est possible
