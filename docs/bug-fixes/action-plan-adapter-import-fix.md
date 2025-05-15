# Correction d'erreur d'import dans ActionPlanAdapter

## Problème
Une erreur d'import a été identifiée dans le fichier `ActionPlanAdapter.ts` : 
```
Export 'ItemStatus' doesn't exist in target module
```

Cette erreur est survenue suite à la standardisation et à la réorganisation des interfaces dans le cadre de la tâche 38 (migration vers des interfaces standardisées).

## Analyse

### Origine du problème
Au cours de la standardisation, certaines énumérations ont été déplacées de fichiers spécifiques vers des fichiers de types communs pour améliorer la réutilisabilité et maintenir la cohérence.

Spécifiquement, `ItemStatus` et `PriorityLevel` ont été déplacés de `action-plan.ts` vers `common-types.ts` car ces énumérations sont utilisées dans plusieurs contextes au-delà du plan d'action.

### Fichiers concernés
1. `/src/app/adapters/ActionPlanAdapter.ts` - Le fichier tentant d'importer `ItemStatus` depuis un emplacement incorrect
2. `/src/app/interfaces/action-plan/action-plan.ts` - L'emplacement précédent des énumérations
3. `/src/app/interfaces/common/common-types.ts` - Le nouvel emplacement des énumérations standardisées

## Solution appliquée

L'import a été corrigé en:

1. Supprimant `ItemStatus` et `PriorityLevel` de l'import depuis `action-plan.ts`
2. Ajoutant un nouvel import pour ces énumérations depuis leur nouvel emplacement

```typescript
// Avant
import { 
  // ...autres imports...
  MilestoneCategory,
  ItemStatus,
  PriorityLevel
} from '../interfaces/action-plan/action-plan';

// Après
import { 
  // ...autres imports...
  MilestoneCategory
} from '../interfaces/action-plan/action-plan';
import { ItemStatus, PriorityLevel } from '../interfaces/common/common-types';
```

## Leçons et bonnes pratiques

Cette correction met en évidence l'importance de:

1. **Centralisation des types communs**: Regrouper les énumérations et interfaces utilisées dans plusieurs contextes dans des fichiers dédiés.

2. **Refactoring progressif**: Lors de déplacements d'éléments, mettre à jour systématiquement tous les imports concernés.

3. **Tests de compilation automatisés**: Intégrer des tests qui vérifient que le projet compile sans erreur après des modifications structurelles.

4. **Documentation des changements**: Documenter les déplacements d'interfaces et types importants pour faciliter la migration des composants qui les utilisent.

## Fichiers similaires à vérifier

D'autres composants utilisant `ItemStatus` et `PriorityLevel` pourraient également nécessiter des corrections:

- Autres adaptateurs
- Composants UI liés au plan d'action
- Services manipulant des données de priorité ou de statut

## Corrections effectuées

Suite à l'analyse, les fichiers suivants ont été corrigés:

1. **ActionPlanAdapter.ts**
   - Correction initiale de l'erreur d'import

2. **ActionPlanAdapter.standardized.ts**
   - Import corrigé pour utiliser les types communs standardisés:
   ```typescript
   import { ItemStatus, PriorityLevel } from '../interfaces/common/common-types';
   ```

3. **useActionPlan.standardized.ts**
   - Import corrigé pour séparer les types spécifiques à action-plan et les types communs:
   ```typescript
   import { MilestoneCategory } from '../interfaces/action-plan/action-plan';
   import { ItemStatus, PriorityLevel } from '../interfaces/common/common-types';
   ```

4. **BusinessModelAdapter.standardized.ts**
   - Ce fichier avait déjà l'import correct de `PriorityLevel` depuis le nouveau module standardisé.