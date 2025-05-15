# Plan de Migration des Services Associés au Plan d'Affaires

Ce document identifie les services liés aux plans d'affaires qui devraient être priorisés pour la prochaine phase de migration, suite à la migration réussie du `SectionService`.

## Services Identifiés

### 1. ApiServiceFactory 🔄

**Priorité: Élevée**

Ce service est utilisé pour créer des instances de services adaptées à l'environnement (stockage local ou API externe). Il doit être mis à jour pour utiliser les nouvelles interfaces standardisées:

- Références actuelles aux anciennes interfaces:
  ```typescript
  import { StorageService, BusinessPlanService, SectionService } from "../interfaces/serviceInterfaces";
  ```

- À mettre à jour pour utiliser les nouvelles interfaces:
  ```typescript
  import { StorageService, BusinessPlanService, ISectionService } from "../interfaces/service-interfaces";
  ```

- Méthode à mettre à jour:
  ```typescript
  export function getSectionApiService(): ISectionService {
    return getSectionService();
  }
  ```

### 2. BusinessModelService (à vérifier si existant)

**Priorité: Moyenne**

Un service dédié à la gestion du modèle d'affaires pourrait exister ou être nécessaire. Il serait étroitement lié au BusinessPlanService et au SectionService.

- Fonctionnalités potentielles:
  - Gestion des données du modèle d'affaires
  - Calculs financiers et projections
  - Intégration avec les sections du plan d'affaires

### 3. DocumentService (déjà migré)

Ce service est déjà migré mais ses intégrations avec les plans d'affaires devraient être vérifiées pour s'assurer de la compatibilité avec les modifications récentes.

## Composants UI à Tester

Ces composants UI interagissent directement avec les services liés aux plans d'affaires et devraient être testés après chaque migration:

1. `PlanNavigationDropdown.tsx`
2. `SectionNavigation.tsx`
3. `DataDashboard.tsx`
4. Pages de sections dans `/plans/[id]/`

## Approche de Migration

Pour chaque service identifié:

1. **Analyse préliminaire**:
   - Examiner les dépendances actuelles
   - Identifier les interactions avec d'autres services
   - Vérifier les utilisations dans les composants UI

2. **Création d'interface**:
   - Suivre le pattern établi avec `ISectionService`
   - Ajouter une documentation JSDoc complète
   - Maintenir la compatibilité avec les anciennes interfaces

3. **Implémentation**:
   - Mettre à jour l'implémentation pour utiliser les nouvelles interfaces
   - Implémenter le pattern singleton
   - Ajouter le support pour l'injection de dépendances

4. **Tests**:
   - Vérifier les intégrations avec les autres services
   - Tester les composants UI qui utilisent ce service
   - S'assurer que les performances restent acceptables

5. **Documentation**:
   - Mettre à jour `STANDARDIZATION_PROGRESS.md`
   - Créer une documentation détaillée pour chaque migration

## Priorités de Migration

1. **Phase 1** (Haute priorité):
   - ApiServiceFactory
   - BusinessModelService (si existant)

2. **Phase 2** (Moyenne priorité):
   - SearchService pour les fonctionnalités de recherche dans les plans
   - Autres services utilitaires liés aux plans d'affaires

La migration méthodique et bien documentée facilitera la maintenance future et permettra de construire progressivement une architecture cohérente pour DevIndé Tracker.