# Standardisation des Interfaces et Adaptateurs

Ce document suit la progression de la standardisation des interfaces et adaptateurs dans le projet DevIndé Tracker.

## Résumé de la progression

| Module | Interfaces | Adaptateur | Hook | Service | Score |
|--------|------------|------------|------|---------|-------|
| Base Models | ✅ | N/A | N/A | N/A | 100% |
| Common Types | ✅ | N/A | N/A | N/A | 100% |
| Business Model | ✅ | ✅ | ✅ | ✅ | 100% |
| Business Model Projections | ✅ | ✅ | ✅ | ✅ | 100% |
| Action Plan | ✅ | ✅ | ✅ | ✅ | 100% |
| Market Analysis | ✅ | ✅ | ✅ | ✅ | 100% |
| Clients à Risque | ✅ | ✅ | ✅ | ✅ | 100% |
| Facturation | ✅ | ✅ | ✅ | ⏳ | 90% |
| BusinessPlanService | ✅ | N/A | N/A | ✅ | 100% |

## Structure standardisée

```
src/app/interfaces/
├── common/
│   ├── base-models.ts        # Interfaces de base (BaseModel, ServiceModel, UIModel)
│   └── common-types.ts       # Types et énumérations communs à plusieurs modules
├── ActionPlanInterfaces.ts   # Interfaces standardisées pour le plan d'action
├── BusinessModelInterfaces.ts # Interfaces standardisées pour le modèle d'affaires
├── MarketAnalysisInterfaces.ts # Interfaces standardisées pour l'analyse de marché
├── UIModels.ts              # Interfaces UI générales
└── client-risk/
    └── client-risk.ts       # Interfaces pour les clients à risque
```

## Adaptateurs standardisés

```
src/app/adapters/
├── ActionPlanAdapter.ts
├── BusinessModelAdapter.ts
├── BusinessModelProjectionsAdapter.ts
├── MarketAnalysisAdapter.ts
└── RiskClientAdapter.standardized.ts
```

## Hooks standardisés

```
src/app/hooks/
├── useBusinessModel.ts       # Migré vers interfaces standardisées
├── useActionPlan.ts          # Migré vers interfaces standardisées  
├── useMarketAnalysis.ts      # Migré vers interfaces standardisées
├── useRiskClient.ts          # Déjà standardisé
├── useBusinessPlan.ts        # À migrer prochainement
└── useFinancialProjects.ts   # À migrer prochainement
```

## Services standardisés

```
src/app/services/core/
├── businessPlanService.ts    # Migré vers interfaces standardisées
├── authService.ts            # À migrer prochainement
├── searchService.ts          # À migrer prochainement
└── sectionService.ts         # À migrer prochainement
```

## Conventions principales

1. **Interfaces** :
   - `BaseModel` → Interface racine avec propriété `id`
   - `ServiceModel` → Données côté service (extends BaseModel)
   - `UIModel` → Données côté UI (extends BaseModel)
   - Préfixe `UI` pour interfaces UI (`UITask`) 
   - Préfixe `Service` pour interfaces service (`ServiceTask`)

2. **Types** :
   - Enumérations au lieu des string literals
   - Types communs dans `common-types.ts`

3. **Adaptateurs** :
   - Méthodes standardisées : `toUI()`, `toService()`, `updateServiceWithUIChanges()`
   - Méthodes de conversion privées
   - Handling robuste des valeurs nulles et par défaut

4. **Hooks** :
   - API cohérente et complète
   - Fonctions d'aide spécialisées pour opérations courantes
   - Utilisation des adaptateurs standardisés
   - Support simultané des interfaces anciennes et standardisées

5. **Services** :
   - Support des interfaces standardisées via la propriété `standardized`
   - Conversion bidirectionnelle entre formats ancien et standardisé
   - Maintien de la compatibilité descendante

## Migration des composants core - Tâche 38.1

Dans le cadre de la tâche 38.1, les composants core suivants ont été migrés pour utiliser les interfaces standardisées:

1. **BusinessPlanService**:
   - Support complet des interfaces standardisées
   - Conversion bidirectionnelle entre formats
   - Tests unitaires pour valider la migration

2. **Hooks React**:
   - `useActionPlan`: Support des interfaces standardisées avec retour de données formatées
   - `useBusinessModel`: Support complet avec projections financières standardisées
   - `useMarketAnalysis`: Support des interfaces standardisées via adaptateur
   - `useRiskClient`: Déjà entièrement standardisé

3. **Tests**:
   - Test de migration pour BusinessPlanService
   - Tests unitaires pour useActionPlan et useBusinessModel

Ces migrations permettent une transition progressive vers les interfaces standardisées tout en maintenant la compatibilité avec le code existant.

## Prochaines étapes

1. **Finaliser les composants core restants**:
   - Migrer useBusinessPlan et useFinancialProjects
   - Mettre à jour authService et searchService

2. **Migration des composants UI**:
   - Mettre à jour les composants pour utiliser les hooks standardisés
   - Adapter les props et state pour utiliser les interfaces standardisées

3. **Tests et documentation**:
   - Compléter les tests pour tous les composants migrés
   - Finaliser la documentation des interfaces standardisées

## Notes importantes

- Les interfaces existantes incompatibles sont conservées temporairement pour compatibilité
- Les fichiers standardisés sont marqués avec `@standardized true` dans leur en-tête JSDoc
- À terme, tous les fichiers non-standardisés seront supprimés
- La migration se fait progressivement pour minimiser les risques de régression