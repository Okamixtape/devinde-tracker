# Spécification de Standardisation des Interfaces - DevIndé Tracker

Ce document définit les conventions et standards pour les interfaces TypeScript dans le projet DevIndé Tracker.

## Objectifs

La standardisation des interfaces TypeScript vise à :

1. **Améliorer la clarté** du code et réduire les ambiguïtés
2. **Renforcer la sécurité des types** en utilisant des types explicites
3. **Faciliter la maintenance** grâce à des patterns cohérents
4. **Réduire la duplication** par la réutilisation d'interfaces communes
5. **Clarifier la séparation** entre les modèles service et UI

## Architecture d'Interfaces

L'architecture d'interfaces suit une structure hiérarchique avec une séparation claire entre modèles service et UI :

```
/interfaces
  /common                     # Types et interfaces de base
    base-models.ts            # Interfaces BaseModel, ServiceModel, UIModel
    common-types.ts           # Enums et types communs
  /business-model             # Interfaces spécifiques au modèle économique
    business-model.ts         # Canvas et modèles de tarification
    projections.ts            # Projections financières
    index.ts                  # Export consolidé
  /action-plan                # Interfaces spécifiques au plan d'action
    action-plan.ts            # Tâches, sous-tâches et jalons
    index.ts                  # Export consolidé
  /market-analysis            # Interfaces spécifiques à l'analyse de marché
    market-analysis.ts        # Segments de clientèle, concurrents, SWOT
    index.ts                  # Export consolidé
  index.ts                    # Export global de toutes les interfaces
```

## État Actuel de la Standardisation

La standardisation des interfaces est complétée pour les modules suivants :

✅ **Interfaces de base** : `BaseModel`, `ServiceModel`, `UIModel`  
✅ **Types communs** : Énumérations (`PriorityLevel`, `ItemStatus`, etc.)  
✅ **Business Model** : Interfaces UI et Service pour le canvas et les projections  
✅ **Action Plan** : Interfaces UI et Service pour les tâches et jalons  
✅ **Market Analysis** : Interfaces UI et Service pour l'analyse de marché  

Les modules restants à standardiser sont :

❌ **Clients à Risque** : À implémenter  
❌ **Facturation** : À implémenter  

## Conventions de Nommage

### Interfaces

- **Modèles Service** : `Service{Feature}` (ex: `ServiceTask`)
- **Modèles UI** : `UI{Feature}` (ex: `UITask`)
- **Interfaces de Base** : `BaseModel`, `ServiceModel`, `UIModel`
- **Interfaces de Données** : Noms descriptifs au singulier (ex: `MonthlyProjection`)

### Énumérations

- **Types Énumérés** : `{Feature}Type` ou nom descriptif (ex: `PriorityLevel`)
- **Valeurs d'Énumération** : Constantes majuscules (ex: `PriorityLevel.HIGH`)

### Propriétés

- **Propriétés Obligatoires** : Sans suffixe optionnel (ex: `id: string`)
- **Propriétés Optionnelles** : Avec suffixe optionnel (ex: `description?: string`)
- **Propriétés Communes** : Noms identiques entre interfaces service et UI pour les mêmes concepts

## Classes de Base

Les interfaces de base qui servent de fondation pour toutes les autres interfaces :

```typescript
// Interface de base pour tous les modèles de données
export interface BaseModel {
  /** Identifiant unique de l'objet */
  id: string;
}

// Interface de base pour tous les modèles côté service
export interface ServiceModel extends BaseModel {
  /** Date de création de l'objet (format ISO) */
  createdAt?: string;
  
  /** Date de dernière modification de l'objet (format ISO) */
  updatedAt?: string;
}

// Interface de base pour tous les modèles côté UI
export interface UIModel extends BaseModel {
  /** Date de création de l'objet (format ISO) */
  createdAt?: string;
  
  /** Date de dernière modification de l'objet (format ISO) */
  updatedAt?: string;
  
  /** Indique si l'objet est en cours d'édition dans l'UI */
  isEditing?: boolean;
  
  /** Erreurs de validation associées aux propriétés de l'objet */
  validationErrors?: Record<string, string>;
}
```

> **Note**: Les deux modèles `ServiceModel` et `UIModel` possèdent les propriétés `createdAt` et `updatedAt`. Cela marque un changement par rapport à la conception initiale où ces propriétés étaient uniquement dans `ServiceModel`. Les deux propriétés UI spécifiques (`isEditing` et `validationErrors`) restent exclusives à `UIModel`.

## Types Communs et Énumérations

Les types communs définis dans `common-types.ts` incluent :

```typescript
// Niveaux de priorité utilisés dans toute l'application
export enum PriorityLevel {
  /** Priorité faible */
  LOW = 'low',
  /** Priorité moyenne */
  MEDIUM = 'medium',
  /** Priorité élevée */
  HIGH = 'high',
  /** Priorité urgente */
  URGENT = 'urgent'
}

// Types de statut pour les éléments actionnables
export enum ItemStatus {
  /** Élément planifié mais pas encore commencé */
  PENDING = 'planned',
  /** Élément en cours de réalisation */
  IN_PROGRESS = 'in-progress',
  /** Élément terminé avec succès */
  COMPLETED = 'completed',
  /** Élément annulé */
  CANCELLED = 'cancelled',
  /** Élément en retard par rapport à sa planification */
  DELAYED = 'delayed'
}
```

## Documentation des Interfaces

Chaque interface et propriété est documentée avec des commentaires JSDoc :

```typescript
/**
 * Description de l'interface
 */
export interface ExampleInterface extends UIModel {
  /** Description de la propriété */
  property1: string;
  
  /** Description de la propriété optionnelle */
  property2?: number;
}
```

## Adaptateurs Standardisés

Les adaptateurs standardisés implémentent les méthodes principales suivantes :

```typescript
// Transforme les données du format service vers le format UI
static toUI(serviceData: ServiceModel): UIModel;

// Transforme les données du format UI vers le format service
static toService(uiData: UIModel): ServiceModel;

// Met à jour partiellement les données du service avec les changements UI
static updateServiceWithUIChanges(
  serviceData: ServiceModel, 
  uiChanges: Partial<UIModel>
): ServiceModel;
```

## Hooks Standardisés

Les hooks standardisés utilisent exclusivement les interfaces standardisées et les adaptateurs correspondants :

```typescript
// Hook standardisé pour la gestion du plan d'action
export const useActionPlan = (businessPlanId?: string): UseActionPlanResult => {
  // Utilise ActionPlanAdapter.standardized.ts
  // Retourne des données aux formats UIActionPlan, UIMilestone, UITask
};
```

## Utilisation dans les Composants

Exemple d'utilisation des interfaces standardisées dans un composant React :

```tsx
import { useActionPlan } from '../hooks';
import { UIMilestone, UITask, ItemStatus } from '../interfaces';

const ActionPlanComponent: React.FC = () => {
  const { 
    actionPlan, 
    createTask, 
    updateTaskStatus 
  } = useActionPlan('business-plan-id');
  
  const handleCompleteTask = (task: UITask) => {
    updateTaskStatus(task.id, ItemStatus.COMPLETED);
  };
  
  return (
    <div>
      {actionPlan?.tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onComplete={handleCompleteTask} 
        />
      ))}
    </div>
  );
};
```

## Prochaines Étapes de Standardisation

1. **Complétion des modules manquants** :
   - Interfaces standardisées pour les clients à risque
   - Interfaces standardisées pour la facturation

2. **Nettoyage des interfaces existantes** :
   - Suppression progressive des anciennes interfaces
   - Migration complète des composants UI vers les interfaces standardisées

3. **Documentation et formation** :
   - Documentation complète des conventions d'interfaces
   - Exemples d'utilisation pour les nouveaux développeurs

4. **Tests et validation** :
   - Tests TypeScript exhaustifs pour toutes les interfaces
   - Vérification automatisée de la conformité aux conventions

## Conclusion

La standardisation des interfaces a considérablement amélioré la cohérence et la maintenabilité du code de DevIndé Tracker. Les modules Business Model, Action Plan et Market Analysis sont maintenant entièrement standardisés, avec une séparation claire entre les modèles service et UI.

La suite de la standardisation se concentrera sur les modules restants et la migration progressive des composants vers les nouvelles interfaces, tout en maintenant la compatibilité avec le code existant.

## Annexe: Exemple d'Interface Standardisée

Exemple d'interface UI standardisée pour une tâche :

```typescript
/**
 * Tâche avec détails (UI)
 */
export interface UITask extends UIModel {
  /** Titre de la tâche */
  title: string;
  /** Description de la tâche */
  description: string;
  /** Priorité de la tâche */
  priority: PriorityLevel;
  /** Statut de la tâche */
  status: ItemStatus;
  /** Personne assignée à la tâche (optionnel) */
  assignee?: string;
  /** Date de début (optionnel) */
  startDate?: string;
  /** Date d'échéance (optionnel) */
  dueDate?: string;
  /** Heures estimées (optionnel) */
  estimatedHours?: number;
  /** Heures réelles (optionnel) */
  actualHours?: number;
  /** Sous-tâches (optionnel) */
  subtasks?: UISubTask[];
  /** IDs des tâches dont celle-ci dépend (optionnel) */
  dependencies?: string[];
  /** Commentaires sur la tâche */
  comments: UITaskComment[];
  /** Tags pour la catégorisation */
  tags: string[];
  /** Indique si cette tâche bloque d'autres tâches (optionnel) */
  isBlocking?: boolean;
  /** ID du jalon associé (optionnel) */
  milestoneId?: string;
}