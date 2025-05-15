# Conventions de développement - DevIndé Tracker

Ce document définit les conventions de codage et d'architecture pour le projet DevIndé Tracker.

## Architecture Hybride

Le projet suit une architecture hybride qui sépare clairement :
1. **Services** : Accès aux données (localStorage)
2. **Adaptateurs** : Transformation des données entre formats service et UI
3. **Hooks React** : Logique métier et état
4. **Composants UI** : Interface utilisateur et rendu

## Convention des Interfaces

### Structure d'Organisation

Les interfaces sont organisées selon la structure suivante :

```
src/app/interfaces/
  ├── common/                  # Types et interfaces communs
  │    ├── base-models.ts      # Interfaces de base (BaseModel, ServiceModel, UIModel)
  │    └── common-types.ts     # Énumérations et types partagés
  ├── business-model/          # Interfaces spécifiques au modèle d'affaires
  │    └── business-model.ts   # Interfaces UI et Service pour le modèle d'affaires
  ├── action-plan/             # Interfaces pour le plan d'action
  └── market-analysis/         # Interfaces pour l'analyse de marché
```

### Modèles de Base

Trois interfaces de base sont définies pour établir une structure cohérente :

```typescript
/**
 * Modèle de base pour toutes les entités
 */
export interface BaseModel {
  /** Identifiant unique */
  id: string;
  /** Date de création (ISO 8601) */
  createdAt?: string;
  /** Date de dernière mise à jour (ISO 8601) */
  updatedAt?: string;
}

/**
 * Modèle de base pour les entités côté service
 */
export interface ServiceModel extends BaseModel {
  // Extensions spécifiques aux services
}

/**
 * Modèle de base pour les entités côté UI
 */
export interface UIModel extends BaseModel {
  /** Indique si l'élément est en cours d'édition */
  isEditing?: boolean;
  /** Erreurs de validation */
  validationErrors?: Record<string, string>;
}
```

### Pattern de Nommage

Pour chaque entité de données, nous définissons deux interfaces :

1. `UI[Entity]Model` - Pour les données affichées dans l'interface utilisateur
2. `Service[Entity]Model` - Pour les données manipulées côté service

Exemple :
```typescript
export interface UICanvasItem extends UIModel {
  name: string;
  description: string;
  priority: PriorityLevel;
}

export interface ServiceCanvasItem extends ServiceModel {
  name: string;
  description: string;
  priority: string;
}
```

### Convention pour les Énumérations

Utiliser des énumérations plutôt que des chaînes littérales pour améliorer la sécurité de type :

```typescript
export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum ItemStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

### Compatibilité dans la Transformation

Lors de la standardisation des interfaces et de la mise à jour des adaptateurs, il est crucial de maintenir la compatibilité bidirectionnelle. Les adaptateurs doivent gérer les transformations entre les nouveaux modèles standardisés et les anciens formats, en respectant ces principes :

1. **Robustesse des champs obligatoires** - Fournir des valeurs par défaut pour les champs requis
2. **Support des propriétés équivalentes** - Accepter des propriétés alternatives (ex: `rate`/`ratePerHour`)
3. **Préservation des données** - Ne pas perdre d'information lors des transformations aller-retour

Exemple de transformation robuste :
```typescript
// Transformation service -> UI
title: rate.serviceType || rate.name, // Priorité à serviceType
ratePerHour: rate.amount || rate.rate, // Accepte les deux propriétés

// Transformation UI -> service
serviceType: rate.title, // Correspondance inverse
name: rate.title, // Duplication pour compatibilité
rate: rate.ratePerHour,
amount: rate.ratePerHour, // Duplication pour compatibilité
```

## Convention des Adaptateurs

### Structure Standard (v1.0)

```typescript
/**
 * [Feature]Adapter - Adaptateur pour [description]
 *
 * Transforme les données entre le format service (dataModels) et le format UI ([Feature]Interfaces).
 * @version 1.0
 * @standardized true
 */
export class [Feature]Adapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param serviceData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(serviceData: ServiceType): UIType {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return defaultUIValues;
    }
    
    // Logique de transformation
    return transformedData;
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service
   */
  static toService(uiData: UIType): ServiceType {
    // Protection contre les données nulles ou undefined
    if (!uiData) return {};
    
    // Logique de transformation
    return transformedData;
  }
  
  /**
   * Met à jour partiellement les données du service avec les modifications de l'UI
   * Méthode clé pour les mises à jour partielles qui préserve les données non modifiées
   * 
   * @param serviceData Données complètes du service (existantes)
   * @param uiChanges Modifications partielles de l'UI
   * @returns Données service mises à jour avec fusion intelligente
   */
  static updateServiceWithUIChanges(
    serviceData: ServiceType,
    uiChanges: Partial<UIType>
  ): ServiceType {
    // Protection contre les données nulles ou undefined
    if (!serviceData) return {} as ServiceType;
    if (!uiChanges) return serviceData;
    
    // Créer une copie pour éviter des modifications directes
    const result = { ...serviceData };
    
    // Logique de fusion intelligente qui préserve les données non modifiées
    // Utiliser des fonctions utilitaires comme mergeArraysById pour fusionner les tableaux
    
    return result;
  }
  
  /**
   * @deprecated Utiliser toUI à la place
   */
  static transformToUIFormat(serviceData: ServiceType): UIType {
    console.warn('[Feature]Adapter: transformToUIFormat est déprécié, utiliser toUI à la place');
    return [Feature]Adapter.toUI(serviceData);
  }
}

// Export par défaut pour usage simple
export default [Feature]Adapter;
```

### Fonctions Utilitaires Recommandées

```typescript
/**
 * Fusionne deux tableaux en se basant sur l'ID des éléments
 * Utile pour les mises à jour partielles où on veut préserver les items non modifiés
 * 
 * @private
 */
function mergeArraysById<T extends { id?: string }>(originalArray: T[], updatedArray: T[]): T[] {
  const mergedMap = new Map<string, T>();
  
  // Ajouter tous les éléments originaux
  originalArray.forEach(item => {
    if (item && item.id) {
      mergedMap.set(item.id, item);
    }
  });
  
  // Remplacer ou ajouter les éléments mis à jour
  updatedArray.forEach(item => {
    if (item && item.id) {
      mergedMap.set(item.id, item);
    }
  });
  
  // Convertir la map en tableau
  return Array.from(mergedMap.values());
}
```

### Patterns Récurrents Identifiés

Lors de la standardisation des adaptateurs, nous avons identifié plusieurs patterns récurrents qui sont utiles pour maintenir l'uniformité et la robustesse du code.

#### 1. Conversion de Statuts

Les statuts sont souvent représentés différemment entre le modèle service et le modèle UI. Utilisez des méthodes dédiées pour ces conversions :

```typescript
/**
 * Convertit le statut du format UI vers le format service
 * @private
 */
private static convertUIStatusToServiceStatus(uiStatus: UIStatusType): ServiceStatusType {
  switch (uiStatus) {
    case 'completed': return 'done';
    case 'in-progress': return 'in-progress';
    case 'delayed': return 'in-progress';
    case 'cancelled': return 'todo';
    case 'planned':
    default: return 'todo';
  }
}

/**
 * Convertit le statut du format service vers le format UI
 * @private
 */
private static convertServiceStatusToUIStatus(serviceStatus: ServiceStatusType): UIStatusType {
  switch (serviceStatus) {
    case 'done': return 'completed';
    case 'in-progress': return 'in-progress';
    default: return 'planned';
  }
}
```

#### 2. Valeurs Par Défaut Sécurisées

Pour une robustesse maximale, utilisez des propriétés optionnelles avec des valeurs par défaut :

```typescript
// Objets
const title = item?.title || '';
const description = item?.description || '';

// Tableaux
const items = data?.items || [];
const properties = item?.properties || [];

// Valeurs numériques
const count = item?.count ?? 0;
const score = item?.score ?? 50; // Valeur médiane
```

#### 3. Fusion Par ID pour les Tableaux

Pour les mises à jour partielles d'un tableau d'objets avec IDs :

```typescript
function mergeById<T extends { id: string }>(original: T[], updates: T[]): T[] {
  const result = [...original];
  
  // Map pour accès rapide par ID
  const idToIndexMap = new Map<string, number>();
  result.forEach((item, index) => {
    idToIndexMap.set(item.id, index);
  });
  
  // Appliquer les mises à jour
  updates.forEach(update => {
    const existingIndex = idToIndexMap.get(update.id);
    
    if (existingIndex !== undefined) {
      // Mise à jour d'un élément existant
      result[existingIndex] = { ...result[existingIndex], ...update };
    } else {
      // Ajout d'un nouvel élément
      result.push(update);
    }
  });
  
  return result;
}
```

#### 4. Extraction d'Information à partir de Texte

Pour extraire des informations à partir de descriptions textuelles :

```typescript
/**
 * Extrait une information spécifique à partir d'une description textuelle
 * @private
 */
private static extractFromDescription(
  description?: string, 
  key?: string, 
  defaultValue: string = ''
): string {
  if (!description || !key) return defaultValue;
  
  const regexes = {
    'size': /taille:?\s*(\w+)|size:?\s*(\w+)/i,
    'priority': /priorit[ée]:?\s*(\w+)|priority:?\s*(\w+)/i,
  };
  
  const regex = regexes[key];
  if (!regex) return defaultValue;
  
  const match = description.match(regex);
  return match ? (match[1] || match[2]) : defaultValue;
}
```

#### 5. Gestion Récursive des Structures Hiérarchiques

Pour les structures de données imbriquées comme les tâches et sous-tâches :

```typescript
/**
 * Aplatit une hiérarchie d'objets en une liste simple
 * @private
 */
private static flattenHierarchy<T extends { children?: T[] }>(items: T[]): T[] {
  return items.reduce<T[]>((acc, item) => {
    acc.push(item);
    if (item.children && item.children.length > 0) {
      acc.push(...this.flattenHierarchy(item.children));
    }
    return acc;
  }, []);
}
```

### Adaptateurs Standardisés

À ce jour, les adaptateurs suivants ont été standardisés selon nos conventions :

| Nom de l'Adaptateur | Description | Niveau de Standardisation |
|---------------------|-------------|---------------------------|
| ActionPlanAdapter | Transforme les données du plan d'action | 100% |
| MarketAnalysisAdapter | Transforme les données d'analyse de marché | 100% |
| BusinessModelAdapter | Transforme les données du modèle d'affaires | 90% |

Chaque adaptateur standardisé offre :
- Méthodes principales : `toUI()`, `toService()`, `updateServiceWithUIChanges()`
- Gestion robuste des données nulles/undefined
- Documentation JSDoc complète
- Types TypeScript précis
- Méthodes utilitaires privées encapsulées
- Méthodes dépréciées pour la rétrocompatibilité

Vous pouvez vérifier le niveau de standardisation des adaptateurs en exécutant : 
```
node scripts/analyze-adapters.js
```

### Nomenclature des Méthodes

#### Méthodes Principales

- `toUI(serviceData: ServiceType): UIType` - Transforme du format service vers le format UI
- `toService(uiData: UIType): ServiceType` - Transforme du format UI vers le format service
- `updateServiceWithUIChanges(serviceData: ServiceType, uiChanges: Partial<UIType>): ServiceType` - Fusionne intelligemment des modifications UI partielles

#### Méthodes Dépréciées (pour compatibilité)

Pour maintenir la compatibilité lors de la standardisation, utilisez les annotations `@deprecated` et des redirections :

```typescript
/**
 * @deprecated Utiliser toUI à la place
 */
static transformToUIFormat(serviceData: ServiceType): UIType {
  console.warn('[Feature]Adapter: transformToUIFormat est déprécié, utiliser toUI à la place');
  return [Feature]Adapter.toUI(serviceData);
}
```

### Checklist de Standardisation des Adaptateurs

Lors de la standardisation d'un adaptateur existant, suivez cette checklist :

1. **Analyse de l'existant**
   - [ ] Identifier les méthodes existantes et leur utilisation dans les hooks
   - [ ] Noter les formats de données d'entrée et de sortie

2. **Création de la structure standard**
   - [ ] Convertir en classe statique avec export nommé et par défaut
   - [ ] Implémenter la méthode `toUI` pour transformation complète
   - [ ] Implémenter la méthode `toService` pour transformation inverse
   - [ ] Implémenter `updateServiceWithUIChanges` pour les mises à jour partielles
   - [ ] Maintenir les anciennes méthodes avec `@deprecated` pour compatibilité

3. **Gestion des erreurs et robustesse**
   - [ ] Ajouter des vérifications pour null/undefined sur toutes les entrées
   - [ ] Fournir des valeurs par défaut pour tous les champs optionnels
   - [ ] Gérer les cas où les IDs sont manquants
   - [ ] Utiliser des types précis plutôt que `any`

4. **Documentation**
   - [ ] Ajouter des commentaires JSDoc détaillés pour chaque méthode
   - [ ] Documenter les paramètres et valeurs de retour
   - [ ] Inclure `@version 1.0` et `@standardized true`

5. **Tests**
   - [ ] Tester la transformation service → UI complète
   - [ ] Tester la transformation UI → service complète
   - [ ] Tester les mises à jour partielles
   - [ ] Tester la gestion des valeurs null/undefined/vides
   - [ ] Tester la rétro-compatibilité des méthodes dépréciées

6. **Intégration**
   - [ ] Mettre à jour les hooks pour utiliser les nouvelles méthodes
   - [ ] Vérifier que les fonctionnalités existantes sont préservées

Pour une cohérence maximale, nous standardisons les noms de méthodes :

- **toUI** : Transformation du modèle service vers le modèle UI
- **toService** : Transformation du modèle UI vers le modèle service
- **toDetailedUI** : Transformation vers une version détaillée du modèle UI (si nécessaire)
- **toSpecificFormat** : Pour des transformations spécifiques (ex: toCanvasFormat)
- **updateServiceWithUIChanges** : Pour les mises à jour partielles

### Implémentation des Transformations Partielles

```typescript
/**
 * Met à jour partiellement les données du service avec les modifications de l'UI
 * @param serviceData Données complètes du service
 * @param uiChanges Modifications partielles de l'UI
 * @returns Données service mises à jour
 */
static updateServiceWithUIChanges(
  serviceData: ServiceType,
  uiChanges: Partial<UIType>
): ServiceType {
  // Protection contre les données nulles
  if (!serviceData) return {} as ServiceType;
  if (!uiChanges) return serviceData;
  
  // Copie profonde pour éviter mutations
  const result = JSON.parse(JSON.stringify(serviceData));
  
  // Exemple : mise à jour spécifique à une propriété
  if (uiChanges.title) {
    result.title = uiChanges.title;
  }
  
  // Exemple : mise à jour d'un tableau d'objets
  if (uiChanges.items && Array.isArray(uiChanges.items)) {
    result.items = mergeArraysById(result.items || [], uiChanges.items);
  }
  
  return result;
}
```

## Convention des Tests d'Adaptateurs

### Structure de Base des Tests

```typescript
import { [Feature]Adapter } from '../src/app/adapters/[Feature]Adapter';

describe('[Feature]Adapter', () => {
  // Données de test
  const mockServiceData = {
    // ...données fictives pour les tests
  };
  
  describe('toUI', () => {
    test('devrait transformer correctement les données service en données UI', () => {
      // Arrange (déjà fait via mockServiceData)
      
      // Act
      const uiData = [Feature]Adapter.toUI(mockServiceData);
      
      // Assert
      expect(uiData).toBeDefined();
      expect(uiData.someProperty).toBe(expectedValue);
      // ...autres assertions
    });
    
    test('devrait gérer les données nulles ou undefined', () => {
      // Act
      const emptyResult = [Feature]Adapter.toUI(null);
      
      // Assert
      expect(emptyResult).toBeDefined();
      expect(Array.isArray(emptyResult.items)).toBe(true);
      expect(emptyResult.items.length).toBe(0);
      // ...autres assertions
    });
  });
  
  // Tester toService, updateServiceWithUIChanges, et méthodes dépréciées...
});
```

## Convention des Hooks

### Structure Standard

```typescript
/**
 * Hook pour la fonctionnalité X
 */
export function useX() {
  // State
  const [data, setData] = useState<DataType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Services
  const xService = useXService();
  
  // Méthodes
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await xService.getData();
      // Transformation avec l'adaptateur
      const uiData = XAdapter.toUI(result);
      setData(uiData);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [xService]);
  
  const updateData = useCallback(async (changes: Partial<DataType>) => {
    if (!data) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Mise à jour partielle
      const updatedServiceData = XAdapter.updateServiceWithUIChanges(
        await xService.getData(), // Données service actuelles
        changes // Changements UI
      );
      
      await xService.updateData(updatedServiceData);
      
      // Recharger les données
      await loadData();
    } catch (err) {
      setError('Erreur lors de la mise à jour des données');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [data, xService, loadData]);
  
  // Effet pour charger les données au montage
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Return API publique du hook
  return {
    data,
    isLoading,
    error,
    loadData,
    updateData
  };
}
```

### Test des Hooks

```typescript
describe('use[Feature]', () => {
  it('should load data correctly', async () => {
    // Arrange
    const { result, waitForNextUpdate } = renderHook(() => use[Feature]());
    
    // Act
    await waitForNextUpdate();
    
    // Assert
    expect(result.current.data).toBeDefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  // ...autres tests
});
```
