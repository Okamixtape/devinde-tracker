# Guide du Système de Layout et Navigation

Ce document explique l'architecture, l'utilisation et les bonnes pratiques du système de layout et de navigation de DevIndé Tracker.

## Table des matières

1. [Architecture](#architecture)
2. [Composants de Layout](#composants-de-layout)
3. [Système de navigation](#système-de-navigation)
4. [Intégration avec l'état global](#intégration-avec-létat-global)
5. [Routes protégées](#routes-protégées)
6. [Lazy loading](#lazy-loading)
7. [Bonnes pratiques](#bonnes-pratiques)

## Architecture

Le système de layout et de navigation est construit selon une architecture en couches :

```
┌──────────────────────────────────────────────────┐
│                    AppLayout                     │
├────────────┬───────────────────────┬─────────────┤
│  Sidebar   │                       │   Header    │
│            │                       │             │
│            │   Contenu principal   ├─────────────┤
│            │                       │ Breadcrumb  │
│            │                       │             │
├────────────┴───────────────────────┴─────────────┤
│                     Footer                       │
└──────────────────────────────────────────────────┘
```

- **AppLayout** : Composant racine qui organise la structure principale
- **Sidebar** : Navigation latérale avec les sections
- **Header** : Barre supérieure avec logo, recherche, notifications et profil
- **Breadcrumb** : Fil d'Ariane indiquant la position actuelle
- **Footer** : Pied de page avec liens et informations

## Composants de Layout

### AppLayout

```tsx
import { AppLayout } from '@/app/components/layout';

function MyPage() {
  return (
    <AppLayout>
      <div>Mon contenu</div>
    </AppLayout>
  );
}
```

Propriétés:
- `children` : Contenu principal à afficher

### Header

Fonctionnalités:
- Barre de recherche
- Notifications
- Menu utilisateur
- Thème clair/sombre
- Navigation burger sur mobile

### Sidebar

Fonctionnalités:
- Navigation principale
- Indicateurs de progression
- Mode réduit (icônes uniquement)
- Adaptation pour mobile

### Breadcrumb

Fonctionnalités:
- Génération automatique basée sur l'URL
- Possibilité de personnaliser les éléments
- Intégration avec l'état global pour obtenir les noms des plans

## Système de navigation

### useNavigation Hook

Ce hook centralise la logique de navigation:

```tsx
import { useNavigation } from '@/app/hooks/useNavigation';

function MyComponent() {
  const { 
    navigateToSection, 
    currentPlanId, 
    activeSection,
    isPathActive
  } = useNavigation();
  
  // Navigation programmée
  const handleClick = () => {
    navigateToSection(currentPlanId, 'dashboard');
  };
  
  return (
    <button 
      onClick={handleClick}
      className={isPathActive('/dashboard') ? 'active' : ''}
    >
      Aller au tableau de bord
    </button>
  );
}
```

### Structure de routes

La structure de routes suit ce modèle:

- `/` - Page d'accueil
- `/dashboard` - Tableau de bord utilisateur
- `/plans` - Liste des plans d'affaires
- `/plans/[id]` - Vue d'ensemble d'un plan
- `/plans/[id]/[section]` - Section spécifique d'un plan
- `/settings` - Paramètres utilisateur
- `/profile` - Profil utilisateur

## Intégration avec l'état global

Le système de layout s'intègre avec l'état global via:

```tsx
// Dans un composant layout
import { useAppUI } from '@/app/hooks/useAppUI';
import { useAppState } from '@/app/contexts/AppStateContext';

function SidebarComponent() {
  const { navigationCollapsed, toggleNavigation } = useAppUI();
  const { state } = useAppState();
  
  // Utilisation des données de l'état global
  const sections = state.sections;
  
  return (
    <nav className={navigationCollapsed ? 'collapsed' : 'expanded'}>
      {/* Rendu du menu basé sur sections */}
    </nav>
  );
}
```

## Routes protégées

Pour protéger une route nécessitant une authentification:

```tsx
// Approche 1: Avec le composant ProtectedPage
import { ProtectedPage } from '@/app/components/auth';

export default function AdminPage() {
  return (
    <ProtectedPage 
      title="Administration" 
      requiredRoles={['admin']}
    >
      <div>Contenu réservé aux administrateurs</div>
    </ProtectedPage>
  );
}

// Approche 2: Avec le composant RouteGuard seul
import { RouteGuard } from '@/app/components/auth';
import { AppLayout } from '@/app/components/layout';

export default function SecurePage() {
  return (
    <RouteGuard>
      <AppLayout>
        <div>Contenu protégé</div>
      </AppLayout>
    </RouteGuard>
  );
}
```

## Lazy loading

Pour optimiser les performances, vous pouvez utiliser le lazy loading des modules:

```tsx
// Import dynamique d'un composant lourd
import React, { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@/app/components/HeavyComponent'));

function MyPage() {
  return (
    <div>
      <h1>Ma page</h1>
      <Suspense fallback={<div>Chargement...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

## Bonnes pratiques

1. **Utiliser le chemin d'importation standard**
   ```tsx
   // Correct - utilise le barrel export
   import { AppLayout, Header, Sidebar } from '@/app/components/layout';
   
   // À éviter - import direct
   import AppLayout from '@/app/components/layout/AppLayout';
   ```

2. **Protéger les routes appropriées**
   - Utilisez `ProtectedPage` pour les pages nécessitant une authentification
   - Précisez les rôles requis avec la prop `requiredRoles`

3. **Navigation programmée**
   - Préférez `useNavigation` aux imports directs de useRouter
   - Utilisez `navigateToSection` pour la navigation entre sections

4. **Ajout de nouvelles sections**
   - Mettez à jour le fichier de configuration des sections
   - Ajoutez l'icône correspondante dans le composant Sidebar
   - Créez le layout et la page pour la nouvelle section

5. **Personnalisation du Breadcrumb**
   - Pour des chemins complexes, fournissez des items personnalisés au composant
   ```tsx
   <Breadcrumb
     items={[
       { label: 'Accueil', path: '/' },
       { label: 'Projets', path: '/projects' },
       { label: 'Projet X', isActive: true }
     ]}
   />
   ```

6. **Optimisation des performances**
   - Utilisez le lazy loading pour les composants lourds
   - Évitez les re-renders inutiles en utilisant React.memo et useCallback