# État Global avec React Context API

Ce dossier contient l'implémentation du système de gestion d'état global de DevIndé Tracker.

## Architecture du système d'état global

Notre architecture de gestion d'état est basée sur React Context API et utilise un pattern similaire à Redux pour la mise à jour des états.

### Fichiers principaux

- **AppStateContext.tsx** : Le contexte principal qui gère l'état global de l'application.
- **hooks/*.ts** : Hooks personnalisés pour interagir avec l'état global.
- **app-providers.tsx** : Fournit tous les contextes à l'application.

## Utilisation de l'état global

### Hooks disponibles

- **useAppState()** : Accès direct au contexte global et aux méthodes principales.
- **useAppData()** : Pour les opérations liées aux données métier.
- **useAppUI()** : Pour les opérations liées à l'interface utilisateur.
- **useDataFetching()** : Pour les opérations asynchrones de récupération de données.

### Exemple d'utilisation

```tsx
import { useAppData } from '@/app/hooks/useAppData';
import { useAppUI } from '@/app/hooks/useAppUI';

function MyComponent() {
  const { isLoading, error, saveSectionData } = useAppData();
  const { darkMode, toggleDarkMode } = useAppUI();
  
  const handleSave = async (data) => {
    await saveSectionData('my-section-id', data);
  };
  
  return (
    <div>
      <button onClick={toggleDarkMode}>
        Mode {darkMode ? 'clair' : 'sombre'}
      </button>
      
      {isLoading && <p>Chargement en cours...</p>}
      {error && <p>Erreur: {error.message}</p>}
      
      <button onClick={() => handleSave({ foo: 'bar' })}>
        Enregistrer
      </button>
    </div>
  );
}
```

## Intégration avec les services

L'état global s'intègre avec les services standardisés via le contexte :

```tsx
// Dans un composant
import { useAppState } from '@/app/contexts/AppStateContext';

function MyComponent() {
  const { errorService, sectionService } = useAppState();
  
  // Utilisation directe des services
  const handleError = (error) => {
    errorService.handleError(error);
  };
}
```

## Avantages de cette architecture

1. **Centralisation des états** : Tous les états importants sont gérés au même endroit.
2. **Réduction des props drilling** : Évite de passer des props à travers de nombreux composants.
3. **Intégration avec les services** : Les services standardisés sont accessibles partout.
4. **Gestion d'erreurs cohérente** : Toutes les erreurs sont traitées de façon uniforme.
5. **Hooks spécialisés** : Séparation des préoccupations entre UI et données.
6. **Performance** : Utilisation de `useReducer` pour les mises à jour d'état efficaces.

## Bonnes pratiques

- Utilisez les hooks spécialisés plutôt que `useAppState` directement.
- Évitez de stocker trop de données dans l'état global.
- Utilisez `withAsyncHandler` pour gérer les appels asynchrones.
- Créez de nouveaux hooks spécialisés au besoin pour des fonctionnalités métier.