# MainLayout - Guide d'implémentation

Ce document explique comment intégrer le composant `MainLayout` avec l'architecture existante de DevIndé Tracker.

## Vue d'ensemble

Le `MainLayout` est le composant de mise en page principal qui enveloppe toutes les pages de l'application. Il fournit :
- Une sidebar de navigation avec indicateurs de progression
- Un header avec fil d'Ariane, recherche et menu utilisateur
- Une structure réactive qui s'adapte aux différentes tailles d'écran
- Un support pour le thème clair/sombre

## Intégration avec les services existants

### Authentification

Ce composant doit être intégré avec l'`AuthService` existant :

```tsx
// À ajouter dans MainLayout.tsx
import { useAuth } from '@/app/hooks/useAuth'; 

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  
  // Utiliser user.name, user.email, etc. dans le menu utilisateur
  // Utiliser logout() pour la déconnexion
  
  // ... reste du composant
}
```

### Progression des sections

Pour obtenir la progression réelle des sections du plan d'affaires :

```tsx
// À ajouter dans MainLayout.tsx
import { useSectionService } from '@/app/hooks/useSectionService';

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const sectionService = useSectionService();
  const [sections, setSections] = useState([]);
  
  useEffect(() => {
    const loadSections = async () => {
      const businessPlanId = '/* récupérer l'ID actif */';
      const result = await sectionService.getSections(businessPlanId);
      
      if (result.success) {
        setSections(result.data);
      }
    };
    
    loadSections();
  }, [sectionService]);
  
  // Transformer les données de sections pour les utiliser dans la navigation
  const navItemsWithProgress = transformSectionsToNavItems(sections);
  
  // ... reste du composant
}
```

### Thème utilisateur

Pour persister le thème choisi par l'utilisateur :

```tsx
// À ajouter dans MainLayout.tsx
import { useUserPreferences } from '@/app/hooks/useUserPreferences';

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { preferences, updatePreferences } = useUserPreferences();
  const [darkMode, setDarkMode] = useState(preferences.theme === 'dark');
  
  const toggleDarkMode = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    setDarkMode(!darkMode);
    updatePreferences({ theme: newTheme });
  };
  
  // ... reste du composant
}
```

## Configuration et extensibilité

### Structure de navigation personnalisable

La structure de navigation peut être configurée via un fichier de configuration :

```tsx
// src/app/config/navigation.ts
export const navigationConfig = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'Home',
    path: '/dashboard',
  },
  // ... autres éléments
];

// Puis dans MainLayout.tsx
import { navigationConfig } from '@/app/config/navigation';
```

### Hooks d'événements de navigation

Vous pouvez ajouter des hooks personnalisés pour suivre les événements de navigation :

```tsx
// Ajouter dans useEffect lié au changement de pathname
useEffect(() => {
  // Ferme le menu mobile quand la route change
  setMobileMenuOpen(false);
  
  // Traque l'événement de navigation
  if (typeof window !== 'undefined') {
    trackPageView(pathname);
  }
}, [pathname]);
```

## Modifications nécessaires

1. **Remplacer les données statiques** par des données dynamiques provenant des services
2. **Adapter les chemins d'importation** selon votre structure de projet
3. **Ajouter la gestion des erreurs** pour les appels de service
4. **Configurer le système de thème** pour qu'il persiste dans le localStorage

## Considérations de performance

- Utilisez `React.memo` pour éviter des rendus inutiles des composants enfants
- Implémentez `useMemo` pour les calculs coûteux comme la transformation des sections
- Utilisez des techniques de skeleton loading pendant le chargement des données
- Préchargez les routes populaires pour améliorer la réactivité de la navigation
