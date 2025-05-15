# Plan de Migration pour ApiServiceFactory

## Aperçu
L'ApiServiceFactory est un service critique qui permet de basculer entre le stockage local et les API externes. Suite à la migration réussie du SectionService, ce service doit être mis à jour pour utiliser les nouvelles interfaces standardisées.

## État Actuel

Actuellement, l'ApiServiceFactory importe et utilise les anciennes interfaces:

```typescript
import { StorageService, BusinessPlanService, SectionService } from "../interfaces/serviceInterfaces";
```

La méthode `getSectionApiService()` retourne l'ancienne interface `SectionService`:

```typescript
export function getSectionApiService(): SectionService {
  return getSectionService();
}
```

## Plan de Migration

### 1. Mise à jour des imports

Remplacer les imports des interfaces par leurs versions standardisées:

```typescript
import { 
  StorageService, 
  BusinessPlanService, 
  ISectionService, 
  // Autres interfaces si nécessaire
} from "../interfaces/service-interfaces";
```

### 2. Mise à jour des signatures de méthodes

Modifier la signature de la méthode `getSectionApiService()` pour retourner la nouvelle interface:

```typescript
export function getSectionApiService(): ISectionService {
  return getSectionService();
}
```

### 3. Mise à jour de la documentation

Mettre à jour les commentaires pour refléter les changements:

```typescript
/**
 * Retourne le service Section approprié selon l'environnement
 * @returns Une implementation de ISectionService basée sur la configuration actuelle
 */
export function getSectionApiService(): ISectionService {
  // Pour le moment, nous retournons simplement le service local
  return getSectionService();
}
```

### 4. Tests d'intégration

Après les modifications:
1. Vérifier que tous les composants qui utilisent `getSectionApiService()` fonctionnent correctement
2. S'assurer que les fonctionnalités du service sont inchangées
3. Tester spécifiquement les scénarios de basculement entre local et API (si applicable)

### 5. Mise à jour du TypeScript Config

S'assurer que la configuration TypeScript ne génère pas d'erreurs avec les chemins d'accès modifiés:

```json
{
  "compilerOptions": {
    "paths": {
      "@/app/services/interfaces/*": ["./src/app/services/interfaces/*"]
    }
  }
}
```

## Impacts et Risques

### Impacts positifs
- Meilleure cohérence avec les standards établis
- Amélioration de la documentation
- Support pour de futures extensions via l'API

### Risques potentiels
- Erreurs de compilation si des fichiers importent directement l'ancienne interface
- Problèmes lors de la transition entre local et API si les interfaces ne sont pas parfaitement alignées

## Prochaines étapes après migration

1. Documenter la migration dans `STANDARDIZATION_PROGRESS.md`
2. Vérifier tous les composants UI qui utilisent indirectement l'ApiServiceFactory
3. Planifier la migration du service suivant selon le plan établi