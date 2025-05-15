# Prototype de Composants UI : Gestion d'Erreurs

Ce document présente les composants prototypes développés pour illustrer l'application des principes d'architecture UI dans le contexte de la gestion d'erreurs. Ces composants démontrent concrètement l'application des principes SOLID et des meilleures pratiques architecturales définies dans notre stratégie.

## Vue d'ensemble

Nous avons développé deux composants clés qui travaillent ensemble pour fournir une expérience de gestion d'erreur robuste et flexible :

1. **ErrorBoundary** - Composant de classe React qui capture les erreurs dans son arbre d'enfants
2. **ErrorDisplay** - Composant de présentation qui affiche les erreurs de manière standardisée

Ces composants ont été conçus pour illustrer spécifiquement :
- L'inversion de dépendance via l'injection d'un service
- La ségrégation d'interface avec des props spécifiques et ciblées
- La composition pour combiner des responsabilités distinctes
- Le principe ouvert/fermé à travers l'extensibilité

## ErrorBoundary

### Principes illustrés

#### 1. Inversion de Dépendance

```tsx
interface ErrorBoundaryProps {
  // Injection du service d'erreur
  errorService?: IErrorService;
  // ...autres props
}

constructor(props: ErrorBoundaryProps) {
  // Utiliser le service injecté ou l'instance par défaut
  this.errorSvc = props.errorService || errorService;
}
```

Ce composant illustre l'inversion de dépendance en :
- Permettant d'injecter un service d'erreur personnalisé via les props
- Utilisant l'interface `IErrorService` plutôt qu'une implémentation spécifique
- Fournissant une valeur par défaut pour maintenir la simplicité d'utilisation

#### 2. Substitution de Liskov

Le composant respecte le contrat du pattern Error Boundary de React tout en étendant ses fonctionnalités :

```tsx
// Comportement standard des Error Boundaries
static getDerivedStateFromError(error: Error): ErrorBoundaryState {
  return { hasError: true, error };
}

componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
  // Extension : journalisation standardisée via notre service
  this.errorSvc.handleError(error, { /* contexte enrichi */ });
}
```

#### 3. Open/Closed Principle

Le composant est ouvert à l'extension mais fermé à la modification grâce à plusieurs mécanismes :

```tsx
// Extension via un fallback personnalisé
if (hasError && error) {
  if (fallback) {
    if (typeof fallback === 'function') {
      return fallback(error, this.resetError);
    }
    return fallback;
  }
  
  // Fallback par défaut si aucun n'est fourni
  return (/* UI de secours standard */);
}
```

Cette approche permet :
- De remplacer complètement l'UI d'erreur
- De fournir une fonction qui peut utiliser l'état de l'erreur et la fonction de réinitialisation
- De maintenir un comportement par défaut raisonnable

## ErrorDisplay

### Principes illustrés

#### 1. Responsabilité Unique

Ce composant a une seule responsabilité : présenter visuellement une erreur. Il ne gère pas :
- La capture des erreurs (c'est le rôle de ErrorBoundary)
- La journalisation des erreurs (c'est le rôle du service d'erreur)
- La logique métier de récupération (déléguée aux props `onRetry` et `onDismiss`)

```tsx
export interface ErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'banner' | 'card' | 'inline' | 'toast';
  // ...autres props d'affichage
}
```

#### 2. Ségrégation d'Interface

Le composant n'exige que les props dont il a besoin :

```tsx
// Usage minimal
<ErrorDisplay error={error} />

// Usage étendu seulement quand nécessaire
<ErrorDisplay 
  error={error} 
  variant="card"
  onRetry={() => fetchData()}
  showDetails={isDevelopment}
/>
```

#### 3. Adaptabilité et Polymorphisme

Le composant adapte son comportement en fonction des différents types d'erreurs :

```tsx
// Extraction adaptative des informations d'erreur
const getErrorInfo = () => {
  if (error instanceof AppError) {
    // Extraction spécifique pour nos AppError typées
  } else if (error instanceof Error) {
    // Extraction pour les Error standard
  } else if (typeof error === 'object' && error !== null && 'message' in error) {
    // Extraction pour les objets avec propriété message
  } else {
    // Cas par défaut
  }
};
```

## Utilisation combinée

Ces composants sont conçus pour fonctionner ensemble de manière modulaire :

```tsx
// Utilisation basique
<ErrorBoundary>
  <ComponentPotentiellementBugué />
</ErrorBoundary>

// Utilisation avancée avec composition
<ErrorBoundary
  errorService={customErrorService}
  fallback={(error, resetError) => (
    <ErrorDisplay
      error={error}
      variant="card"
      onRetry={resetError}
      onDismiss={closeModal}
      showDetails={isDevEnvironment}
    />
  )}
>
  <ComplexComponent />
</ErrorBoundary>
```

## Composants supplémentaires

Pour compléter le prototype, nous avons ajouté les composants et hooks suivants :

### 1. ErrorContainer

Composant qui affiche les erreurs récentes capturées par le service d'erreur. Il montre comment :
- S'abonner aux erreurs émises par le service
- Gérer un état local pour les erreurs capturées
- Composer avec le composant ErrorDisplay

```tsx
// Usage basique
<ErrorContainer />

// Usage avancé
<ErrorContainer 
  errorService={customErrorService}
  context="checkout" 
  maxErrors={3}
  variant="toast"
  autoDismissAfter={5000}
/>
```

### 2. useErrorHandling Hook

Hook qui simplifie la gestion d'erreur dans les composants fonctionnels :

```tsx
const { 
  error,                // L'erreur actuelle
  isLoading,           // État de chargement
  handleError,         // Fonction pour gérer une erreur
  withErrorHandling,   // HOF qui encapsule une fonction async
  withServiceResult,   // Version retournant un ServiceResult
  clearError           // Fonction pour effacer l'erreur
} = useErrorHandling();

// Usage avec withErrorHandling
const handleSubmit = withErrorHandling(async (formData) => {
  await api.submitForm(formData);
}, { context: { form: 'checkout' } });
```

### 3. Composant d'exemple ExampleUsage

Un composant de démonstration qui montre l'utilisation pratique de tous les composants et hooks, illustrant :
- Différentes manières de capturer et afficher les erreurs
- Différents types d'erreurs (standard et AppError)
- Intégration des approches dans un flux utilisateur réaliste

## Avantages démontrés

1. **Découplage** - Les composants peuvent être utilisés indépendamment ou ensemble
2. **Flexibilité** - Multiples options de personnalisation sans modifier les composants
3. **Testabilité** - Interfaces claires pour les tests unitaires et snapshot
4. **Cohérence** - Apparence et comportement standardisés pour les erreurs
5. **Maintenabilité** - Séparation claire des responsabilités

## Applications pratiques

Ces composants peuvent être utilisés de plusieurs façons :

1. **Niveau application** - Encapsuler l'application entière pour une capture globale des erreurs
2. **Niveau page** - Protéger des sections critiques d'une page
3. **Niveau composant** - Isoler les composants instables ou en développement
4. **Niveau formulaire** - Capture et affichage des erreurs de validation ou de soumission

## Conclusion

Ce prototype démontre comment les principes SOLID peuvent être appliqués concrètement à des composants React pour créer une architecture UI robuste, maintenable et évolutive. Il établit un modèle que nous pouvons étendre à d'autres parties de l'interface utilisateur.

L'importance de ces composants dépasse leur simple fonctionnalité. Ils servent de preuve de concept pour notre approche architecturale et offrent un exemple concret de la façon dont nous pouvons équilibrer standardisation et pragmatisme pour délivrer une valeur métier immédiate.