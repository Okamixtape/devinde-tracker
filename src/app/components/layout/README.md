# Système de Layout et Navigation

Ce dossier contient l'implémentation du layout principal et du système de navigation de DevIndé Tracker.

## Architecture du layout

Le système de layout est organisé selon les principes suivants:

### Composants de base

- **AppLayout** : Composant racine qui organise la structure principale (header, sidebar, contenu, footer)
- **Header** : Barre supérieure avec le logo, la recherche, les notifications et le menu utilisateur
- **Sidebar** : Navigation latérale avec les sections de l'application
- **Breadcrumb** : Fil d'Ariane pour indiquer la position dans l'application
- **Footer** : Pied de page avec les liens utiles et informations
- **SkipLink** : Lien d'accessibilité pour sauter au contenu principal

### Intégration avec l'état global

Les composants de layout s'intègrent avec l'état global via:

1. **useAppUI** : Pour les états d'interface (mode sombre, sidebar collapse)
2. **useAppState** : Pour l'accès aux données (sections, plan actuel)
3. **useNavigation** : Pour la gestion des routes et navigation

## Fonctionnalités principales

### AppLayout

Le layout principal gère:
- La disposition responsive des éléments
- Les transitions entre les pages
- L'état de la sidebar (étendue/réduite)
- L'interaction avec le système de routing

### Système de navigation

La navigation est organisée en plusieurs niveaux:

1. **Navigation principale** (Sidebar)
   - Sections du plan d'affaires (Dashboard, Pitch, etc.)
   - Outils (Calculateur, Documents)
   - Paramètres

2. **Fil d'Ariane** (Breadcrumb)
   - Indique la position actuelle
   - Permet de remonter dans la hiérarchie

3. **Navigation secondaire** (dans les pages)
   - Utilise TabNavigation pour naviguer entre les sous-sections

## Accessibilité

- Skip link pour sauter au contenu principal
- Gestion du focus pour la navigation au clavier
- Support des attributs ARIA (aria-current, aria-expanded, etc.)
- Transitions fluides pour réduire les distractions visuelles

## Responsive design

Le layout s'adapte à différentes tailles d'écran:

- **Desktop** : Sidebar étendue par défaut
- **Tablette** : Sidebar réduite automatiquement
- **Mobile** : Sidebar masquée, accessible via menu hamburger

## Utilisation

Pour utiliser le layout dans d'autres parties de l'application:

```tsx
import { AppLayout } from '@/app/components/layout';

export default function MyPage() {
  return (
    <AppLayout>
      <div>Mon contenu</div>
    </AppLayout>
  );
}
```

Pour la navigation programmatique:

```tsx
import { useNavigation } from '@/app/hooks/useNavigation';

function MyComponent() {
  const { navigateToSection, currentPlanId } = useNavigation();
  
  const handleClick = () => {
    navigateToSection(currentPlanId, 'dashboard');
  };
  
  return (
    <button onClick={handleClick}>
      Aller au tableau de bord
    </button>
  );
}
```