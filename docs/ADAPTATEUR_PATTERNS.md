# Pattern d'Adaptateur Standardisé - DevIndé Tracker

Ce document détaille les patterns et conventions à suivre pour les adaptateurs dans le cadre du projet DevIndé Tracker. Ces adaptateurs servent d'interface entre les formats de données du service (stockage) et de l'UI (composants React).

## Objectif des Adaptateurs

Les adaptateurs ont pour mission de :
1. **Transformer** les données entre le format service et le format UI
2. **Normaliser** les structures de données pour garantir des formats cohérents
3. **Fournir** des valeurs par défaut pour les cas limites (null/undefined)
4. **Préserver** les données existantes lors des mises à jour partielles

## Structure Standard d'un Adaptateur (v2.0)

```typescript
/**
 * FeatureAdapter - Adaptateur pour [description fonctionnelle]
 * 
 * Transforme les données entre le format service (dataModels) et le format UI (FeatureInterfaces).
 * Implémente les conventions définies dans /docs/CONVENTIONS.md
 *
 * @version 2.0
 * @standardized true
 */

import { ServiceDataType } from '../services/interfaces/dataModels';
import { UIDataType } from '../interfaces/FeatureInterfaces';

// Enums pour améliorer la lisibilité et la maintenabilité
export enum FeatureCategory {
  TYPE_1 = 'type1',
  TYPE_2 = 'type2',
  TYPE_3 = 'type3'
}

/**
 * Adaptateur pour la fonctionnalité [Feature]
 * Classe statique avec méthodes de transformation bidirectionnelle
 */
export class FeatureAdapter {
  /**
   * Transforme les données du format service vers le format UI
   * Cette méthode est le point d'entrée principal pour obtenir des données formatées pour l'UI
   * 
   * @param serviceData Données provenant du service
   * @returns Données formatées pour l'UI avec valeurs par défaut pour les champs manquants
   */
  static toUI(serviceData: ServiceDataType): UIDataType {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return FeatureAdapter._createDefaultUIData();
    }
    
    // Logique de transformation
    // ...
    
    return transformedData;
  }

  /**
   * Transforme les données du format UI vers le format service
   * Utilisé lors de la création ou la sauvegarde complète de données
   * 
   * @param uiData Données provenant de l'UI
   * @returns Données formatées pour le service
   */
  static toService(uiData: UIDataType): ServiceDataType {
    // Protection contre les données nulles ou undefined
    if (!uiData) {
      return FeatureAdapter._createDefaultServiceData();
    }
    
    // Logique de transformation
    // ...
    
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
    serviceData: ServiceDataType,
    uiChanges: Partial<UIDataType>
  ): ServiceDataType {
    // Protection contre les données nulles ou undefined
    if (!serviceData) {
      return FeatureAdapter._createDefaultServiceData();
    }
    
    if (!uiChanges) {
      return serviceData;
    }
    
    // Créer une copie pour éviter des modifications directes
    const result = { ...serviceData };
    
    // Logique de fusion intelligente qui préserve les données non modifiées
    // Utiliser des méthodes privées comme _mergeArraysById pour fusionner les tableaux
    
    return result;
  }
  
  /**
   * Crée un objet UI par défaut pour les cas où les données d'entrée sont nulles
   * @private
   */
  private static _createDefaultUIData(): UIDataType {
    return {
      // Structure UI par défaut
    };
  }
  
  /**
   * Crée un objet service par défaut pour les cas où les données d'entrée sont nulles
   * @private
   */
  private static _createDefaultServiceData(): ServiceDataType {
    return {
      // Structure service par défaut
    };
  }
  
  /**
   * Fusionne deux tableaux en se basant sur l'ID des éléments
   * Si un élément avec le même ID existe dans les deux tableaux, celui du second remplace celui du premier
   * Les éléments uniques des deux tableaux sont conservés
   * 
   * @private
   */
  private static _mergeArraysById<T extends { id?: string }>(
    originalArray: T[], 
    updatedArray: T[]
  ): T[] {
    if (!Array.isArray(originalArray)) {
      originalArray = [];
    }
    
    if (!Array.isArray(updatedArray)) {
      updatedArray = [];
    }
    
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
  
  /**
   * @deprecated Utiliser toUI à la place
   */
  static transformToUIFormat(serviceData: ServiceDataType): UIDataType {
    console.warn('FeatureAdapter: transformToUIFormat est déprécié, utiliser toUI à la place');
    return FeatureAdapter.toUI(serviceData);
  }
}

// Export par défaut pour usage simple
export default FeatureAdapter;
```

## Patterns de Gestion des Valeurs Null/Undefined

La gestion correcte des valeurs null et undefined est essentielle pour garantir la robustesse des adaptateurs. Les patterns explicites suivants doivent être utilisés :

### 1. Vérification en Début de Méthode

```typescript
static toUI(serviceData: ServiceDataType): UIDataType {
  // Vérification explicite avec l'opérateur !
  if (!serviceData) {
    return this._createDefaultUIData();
  }
  // Traitement normal ensuite
}
```

### 2. Vérification pour les Propriétés Imbriquées

```typescript
// Vérification complète de l'arborescence
if (!serviceData || !serviceData.property || !serviceData.property.subProperty) {
  // Action à effectuer
}

// Vérification dans les affectations conditionnelles
const value = !serviceData || !serviceData.property 
  ? defaultValue 
  : serviceData.property;
```

### 3. Vérification dans les Boucles et Mappings

```typescript
const items = !serviceData || !serviceData.items 
  ? [] 
  : serviceData.items.map(item => ({
      title: !item.title ? '' : item.title,
      description: !item.description ? '' : item.description 
    }));
```

## Exemples Concrets d'Implémentation

### BusinessModelAdapter - Exemple de Transformation

```typescript
static toBusinessModelCanvas(businessPlanData: BusinessPlanData): BusinessModelCanvasData {
  if (!businessPlanData) {
    businessPlanData = {} as BusinessPlanData;
  }
  
  const businessModel = !businessPlanData.businessModel 
    ? {} as ExtendedBusinessModelData 
    : businessPlanData.businessModel;
  
  // Transformation des partenaires clés
  const partners: CanvasItem[] = !businessModel || !businessModel.partners 
    ? [] 
    : businessModel.partners.map(partner => ({
      id: `partner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: partner.name,
      description: !partner.description ? '' : partner.description,
      priority: !partner.priority ? 'medium' : partner.priority as 'low' | 'medium' | 'high'
    }));
    
  // (autres transformations similaires...)
  
  return {
    partners,
    activities,
    resources,
    valueProposition,
    customerRelations,
    channels,
    segments,
    costStructure,
    revenueStreams
  };
}
```

### BusinessModelProjectionsAdapter - Exemple de Méthode Privée Utilitaire

```typescript
/**
 * Crée une structure vide pour les projections de revenus
 * Utilisé quand les données d'entrée sont nulles ou incomplètes
 * 
 * @private
 */
private static _createEmptyRevenueProjections(): RevenueProjections {
  return {
    totalRevenue: 0,
    monthly: Array(12).fill(0),
    yearlyGrowth: [],
    bySource: {
      [RevenueSources.SERVICE]: 0,
      [RevenueSources.PRODUCT]: 0,
      [RevenueSources.SUBSCRIPTION]: 0,
      [RevenueSources.OTHER]: 0
    }
  };
}
```

### BusinessModelAdapter - Exemple de Fusion pour les Mises à Jour Partielles

```typescript
static updateServiceWithUIChanges(
  serviceData: BusinessPlanData, 
  uiChanges: Partial<UIBusinessModelData>
): BusinessPlanData {
  // Vérifications de base
  if (!serviceData) {
    return {} as BusinessPlanData;
  }
  
  if (!uiChanges) {
    return serviceData;
  }
  
  // Créer des copies pour éviter les modifications directes
  const result = { ...serviceData };
  
  if (!result.businessModel) {
    result.businessModel = {} as BusinessModelData;
  }
  
  // Mise à jour des sections du canvas si présentes dans les modifications
  if (uiChanges.canvas) {
    result.businessModel = {
      ...result.businessModel,
      // Exemple de fusion pour les partenaires
      ...(uiChanges.canvas.partners && {
        partners: BusinessModelAdapter.mergeArraysById(
          !result.businessModel || !result.businessModel.partners ? [] : result.businessModel.partners,
          BusinessModelAdapter.canvasItemsToService(uiChanges.canvas.partners, 'partner')
        )
      }),
      // (autres fusions similaires...)
    };
  }
  
  return result;
}
```

## Bonnes Pratiques et Conseils

1. **Utiliser des énumérations** pour les constantes et les types énumérés plutôt que des chaînes de caractères
2. **Factoriser** la création des structures par défaut dans des méthodes privées
3. **Préférer** les vérifications explicites avec `!` au lieu des opérateurs de coalescence nulles (`?.`, `??`, `||`)
4. **Documenter** clairement chaque méthode avec des commentaires JSDoc
5. **Maintenir** la compatibilité avec le code existant via des méthodes dépréciées qui redirigent vers les nouvelles
6. **Intégrer** les tags `@standardized` et `@version` pour faciliter le suivi de l'évolution

## Liste de Contrôle pour la Standardisation

- [ ] Classe statique avec nom conforme `[Feature]Adapter`
- [ ] Documentation JSDoc complète avec tags obligatoires
- [ ] Méthodes standardisées `toUI`, `toService`, `updateServiceWithUIChanges`
- [ ] Gestion robuste des null/undefined avec pattern explicite
- [ ] Méthodes privées pour création d'objets par défaut
- [ ] Double export (nommé et par défaut)
- [ ] Tests unitaires pour toutes les méthodes publiques
