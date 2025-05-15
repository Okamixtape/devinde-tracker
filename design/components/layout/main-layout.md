# MainLayout

## Description
Structure principale de l'application qui contient la sidebar de navigation, le header et la zone de contenu principale. Le MainLayout est présent sur toutes les pages de l'application (sauf login/register).

## Fonctionnalités
- **Sidebar de navigation** : Menu latéral avec les liens vers toutes les sections
- **Indicateurs de progression** : Pourcentages indiquant l'avancement dans chaque section
- **Header** : Barre supérieure avec fil d'Ariane, recherche et menu utilisateur
- **Zone de contenu** : Espace principal adaptif pour le contenu des pages

## Structure du composant
```jsx
<MainLayout>
  <Sidebar>
    <SidebarHeader />
    <SidebarNavigation />
    <SidebarProgress />
  </Sidebar>
  <MainContent>
    <Header>
      <Breadcrumb />
      <SearchBar />
      <UserMenu />
    </Header>
    <PageContent>
      {children} // Contenu de la page
    </PageContent>
  </MainContent>
</MainLayout>
```

## Représentation visuelle
```
+-----------------------------------------------------+
|  [Logo] DevIndé Tracker       [Search] [UserMenu]   | <- Header (h-16)
+-----+-----------------------------------------------+
|     |                                               |
|  S  |                                               |
|  I  |                                               |
|  D  |                                               |
|  E  |             CONTENU PRINCIPAL                 |
|  B  |                                               |
|  A  |                                               |
|  R  |                                               |
|     |                                               |
|     |                                               |
| 260px|                                              |
+-----+-----------------------------------------------+
```

## Sidebar

### Structure de navigation
- **Dashboard** : Vue d'ensemble
- **Plan d'affaires**
  - Pitch
  - Modèle économique
  - Analyse de marché
  - Services
  - Finances
  - Plan d'action
- **Outils**
  - Calculateur financier
  - Générateur de documents
  - Ressources
- **Paramètres**

### Indicateurs de progression
Chaque section du plan d'affaires affiche un pourcentage de complétion basé sur le contenu rempli. Un indicateur global de progression est affiché en haut.

### États de la sidebar
- **Étendu** : Affichage complet avec texte (260px)
- **Réduit** : Affichage compact avec icônes uniquement (64px)
- **Mobile** : Masqué avec menu hamburger pour l'ouvrir

## Header

### Fil d'Ariane (Breadcrumb)
- Affiche le chemin de navigation actuel
- Cliquable pour naviguer rapidement vers les niveaux supérieurs

### Barre de recherche
- Recherche globale dans toute l'application
- Suggestions de résultats en temps réel
- Filtres de recherche contextuels

### Menu utilisateur
- Avatar de l'utilisateur
- Menu déroulant avec:
  - Profil utilisateur
  - Paramètres
  - Mode sombre/clair
  - Déconnexion

## Responsive design
- **Desktop** : Layout complet avec sidebar étendue
- **Tablette** : Sidebar réduite automatiquement
- **Mobile** : Sidebar masquée, accessible via bouton hamburger

## Intégration avec les services
- Utilise l'AuthService pour vérifier l'authentification
- Utilise le SectionService pour obtenir les pourcentages de progression
- S'intègre avec le système de routes de Next.js
