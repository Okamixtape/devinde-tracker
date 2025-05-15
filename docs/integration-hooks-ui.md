# Guide d'intégration : Hooks React et Composants UI

Ce document explique comment intégrer les nouveaux composants UI avec les hooks React et services existants dans l'architecture hybride de DevIndé Tracker.

## Architecture Hybride : Résumé

Notre architecture hybride se compose de :

1. **Services existants** : Couche d'accès aux données via localStorage
2. **Adaptateurs** : Transformation des données entre les formats service et UI
3. **Hooks React** : Logique métier et état pour les composants UI
4. **Composants UI** : Interface utilisateur moderne basée sur les maquettes

## Utilisation des Hooks dans les Composants

### Exemple: Business Model Canvas

```tsx
import React from 'react';
import { useBusinessModel } from '../app/hooks';

const BusinessModelCanvasPage: React.FC = () => {
  const { 
    canvas, 
    pricing, 
    projections, 
    isLoading, 
    error, 
    updateCanvas 
  } = useBusinessModel({
    planId: 'current-plan', // ID du plan actuel
    autoLoad: true // Chargement automatique au montage
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!canvas) return <div>Aucune donnée disponible</div>;

  // Modifier le canvas (exemple)
  const handlePartnerAdd = (partner) => {
    const updatedCanvas = {
      ...canvas,
      partners: [...canvas.partners, partner]
    };
    updateCanvas(updatedCanvas);
  };

  return (
    <div>
      {/* Rendu du Business Model Canvas */}
      <h1>Business Model Canvas</h1>
      {/* ... */}
    </div>
  );
};
```

### Exemple: Analyse de Marché

```tsx
import React from 'react';
import { useMarketAnalysis } from '../app/hooks';

const MarketAnalysisPage: React.FC = () => {
  const { 
    segments, 
    competitors, 
    opportunities, 
    addSegment, 
    updateSegment, 
    isLoading 
  } = useMarketAnalysis({
    planId: 'current-plan'
  });

  // Ajouter un segment
  const handleAddSegment = (segmentData) => {
    addSegment({
      name: segmentData.name,
      description: segmentData.description,
      needs: segmentData.needs,
      potentialSize: segmentData.potentialSize,
      profitability: segmentData.profitability,
      acquisition: segmentData.acquisition
    });
  };

  return (
    <div>
      {/* Rendu de l'Analyse de Marché */}
      {isLoading ? (
        <div>Chargement...</div>
      ) : (
        <>
          <h1>Analyse de Marché</h1>
          {/* ... */}
        </>
      )}
    </div>
  );
};
```

### Exemple: Plan d'Action

```tsx
import React from 'react';
import { useActionPlan } from '../app/hooks';

const ActionPlanPage: React.FC = () => {
  const { 
    milestones, 
    tasks, 
    createMilestone,
    toggleMilestoneCompletion,
    createTask,
    updateTaskStatus
  } = useActionPlan({
    planId: 'current-plan'
  });

  // Ajouter un jalon
  const handleAddMilestone = (milestoneData) => {
    createMilestone({
      title: milestoneData.title,
      description: milestoneData.description,
      dueDate: milestoneData.dueDate,
      isCompleted: false
    });
  };

  return (
    <div>
      {/* Rendu du Plan d'Action */}
      <h1>Plan d'Action</h1>
      {/* ... */}
    </div>
  );
};
```

## Cycle d'Amélioration Continue

Conformément à notre méthodologie de développement, l'intégration des hooks suit notre cycle d'amélioration continue :

1. **Phase de test** : Vérifiez le comportement des hooks dans les composants réels
2. **Création/Mise à jour de tâches** : Documentez les problèmes et améliorations dans task-master
3. **Implémentation** : Corrigez les problèmes identifiés
4. **Vérification** : Confirmez que les corrections fonctionnent comme prévu

## Bonnes Pratiques

1. **Toujours utiliser les hooks** pour accéder aux données plutôt que d'appeler directement les services
2. **Ne pas dupliquer la logique métier** dans les composants UI
3. **Utiliser les adaptateurs** pour toutes les transformations de données
4. **Gérer correctement les états de chargement et d'erreur** dans les composants UI
5. **S'assurer que les données sont sauvegardées** après les modifications

## Extensibilité

L'architecture hybride est conçue pour être facilement extensible :

1. Pour ajouter une nouvelle fonctionnalité :
   - Définir les interfaces TypeScript dans `/src/app/interfaces/`
   - Créer l'adaptateur dans `/src/app/adapters/`
   - Créer le hook dans `/src/app/hooks/`
   - Exposer le hook via `/src/app/hooks/index.ts`
   - L'utiliser dans les composants UI

2. Pour modifier un comportement existant :
   - Mettre à jour l'adaptateur correspondant
   - Mettre à jour le hook si nécessaire
   - Les composants UI devraient continuer à fonctionner sans modifications majeures

## Dépannage

### Problèmes courants

1. **Les données ne se mettent pas à jour** : Vérifier si `saveBusinessModel` ou équivalent a été appelé après les modifications
2. **Erreurs de type TypeScript** : Vérifier la correspondance entre les interfaces et les données utilisées
3. **Performances lentes** : Vérifier l'utilisation de `useMemo`, `useCallback` et éviter les re-renders inutiles
4. **Données incohérentes** : Vérifier les transformations dans les adaptateurs

### Journalisation

Les hooks fournissent des journalisations détaillées des erreurs dans la console. Vérifiez la console du navigateur pour diagnostiquer les problèmes.

## Développements futurs

1. **Intégration Backend** : La structure actuelle permettra facilement de remplacer les services localStorage par des appels API REST 
2. **Tests Unitaires** : Développer des tests pour les hooks et adaptateurs
3. **État global** : Évaluer l'ajout potentiel de React Context ou Redux pour la gestion de l'état global
