# Rapport de Migration des Adaptateurs

Date de génération: 14/05/2025 20:41:46

## Résumé

- **Fichiers analysés**: 2
- **Fichiers utilisant des méthodes dépréciées**: 0
- **Fichiers utilisant des adaptateurs standardisés**: 2

## Plan de Migration

### Fichiers à Migrer en Priorité

| Fichier | Méthodes Dépréciées | Nombre Total d'Utilisations |
|---------|---------------------|-----------------------------|

## Détails par Fichier

### useBusinessModel.ts

#### Adaptateurs Standardisés

**BusinessModelAdapter**

| Méthode | Nombre d'Utilisations |
|---------|------------------------|
| toUI | 1 |
| updateServiceWithUIChanges | 1 |

### useMarketAnalysis.ts

#### Adaptateurs Standardisés

**MarketAnalysisAdapter**

| Méthode | Nombre d'Utilisations |
|---------|------------------------|
| toUI | 2 |
| updateServiceWithUIChanges | 1 |

## Guide de Migration

Pour chaque méthode dépréciée, utilisez le tableau de correspondance suivant :

| Méthode Dépréciée | Méthode Standardisée Recommandée |
|-------------------|----------------------------------|
| `transformToDetailedMilestones` | `ActionPlanAdapter.toDetailedMilestones` |
| `transformToDetailedTasks` | `ActionPlanAdapter.toDetailedTasks` |
| `buildTaskHierarchy` | `ActionPlanAdapter.buildTaskHierarchy` |
| `transformToCustomerSegments` | `MarketAnalysisAdapter.toCustomerSegments` |
| `transformToCompetitors` | `MarketAnalysisAdapter.toCompetitors` |
| `transformToBusinessModel` | `BusinessModelAdapter.toUI` |
| `transformToClientOffers` | `BusinessModelAdapter.toClientOffers` |

### Exemple de Migration

```typescript
// Avant
import { transformToDetailedMilestones } from '../adapters/ActionPlanAdapter';
const milestones = transformToDetailedMilestones(businessPlanData);

// Après
import { ActionPlanAdapter } from '../adapters/ActionPlanAdapter';
const milestones = ActionPlanAdapter.toDetailedMilestones(businessPlanData);
```
