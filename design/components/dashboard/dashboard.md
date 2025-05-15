# Dashboard

## Description
Vue centrale de l'application qui présente une vision globale du plan d'affaires avec KPIs, visualisations et suggestions. Le Dashboard sert de point d'entrée principal après connexion et offre un aperçu de l'état général du projet.

## Fonctionnalités
- **Progress tracker** : Barre de progression globale du plan d'affaires
- **KPIs principaux** : 4 indicateurs clés en haut du dashboard
- **Projections trimestrielles** : Graphique à barres interactif
- **Suggestions intelligentes** : Carte latérale avec recommandations
- **Projets actifs** : Liste des projets financiers en cours
- **Prochains jalons** : Échéances à venir du plan d'action

## Structure du composant
```jsx
<Dashboard>
  <Header>
    <Title>Tableau de bord</Title>
    <TimeframePicker />
  </Header>
  
  <ProgressSection>
    <GlobalProgress value={65} />
    <SectionBreakdown />
  </ProgressSection>
  
  <KeyMetricsSection>
    <MetricCard title="Revenu Mensuel" value="4 500 €" trend="+12%" />
    <MetricCard title="Revenu Annuel" value="54 000 €" trend="+8%" />
    <MetricCard title="Point d'Équilibre" value="83%" trend="+5%" />
    <MetricCard title="Projets Actifs" value="3" trend="0" />
  </KeyMetricsSection>
  
  <ContentGrid>
    <GridItem colSpan={2}>
      <ProjectionsChart data={revenueData} />
    </GridItem>
    
    <GridItem colSpan={1}>
      <SmartSuggestions suggestions={suggestions} />
    </GridItem>
    
    <GridItem colSpan={1}>
      <ActiveProjects projects={projects} />
    </GridItem>
    
    <GridItem colSpan={1}>
      <UpcomingMilestones milestones={milestones} />
    </GridItem>
    
    <GridItem colSpan={1}>
      <RecentActivities activities={activities} />
    </GridItem>
  </ContentGrid>
</Dashboard>
```

## Composants détaillés

### ProgressSection
Affiche une barre de progression principale indiquant le pourcentage de complétion global du plan d'affaires, avec une répartition détaillée par section.

### KeyMetricsSection
Affiche 4 KPIs essentiels sous forme de cartes:
- **Revenu Mensuel** : Revenus moyens du mois en cours
- **Revenu Annuel** : Revenus projetés pour l'année en cours
- **Point d'Équilibre** : Pourcentage d'atteinte du seuil de rentabilité
- **Projets Actifs** : Nombre de projets financiers en cours

### ProjectionsChart
Graphique à barres qui affiche les projections de revenus trimestrielles avec:
- Barres segmentées par source de revenus
- Ligne de tendance
- Filtres temporels (année en cours, année précédente, prévisions)
- Légende interactive pour afficher/masquer des sources de revenus

### SmartSuggestions
Carte affichant des suggestions intelligentes basées sur l'état actuel du plan:
- Recommandations pour compléter des sections
- Alertes sur des échéances à venir
- Conseils d'optimisation financière
- Liens rapides vers les actions recommandées

### ActiveProjects
Liste des projets financiers en cours avec:
- Nom du projet et client
- Progression et statut
- Budget et rentabilité
- Actions rapides (voir détails, mettre à jour)

### UpcomingMilestones
Calendrier des prochains jalons importants avec:
- Date d'échéance
- Titre et description courte
- Pourcentage de complétion
- Tâches associées restantes

### RecentActivities
Journal des activités récentes dans l'application:
- Modifications de sections
- Mise à jour de projets financiers
- Complétion de jalons ou tâches
- Horodatage des activités

## Interactions
- Filtres temporels sur les graphiques (trimestre/mois/année)
- Suggestions cliquables menant aux sections correspondantes
- Boutons d'action pour accéder rapidement aux projets actifs
- Possibilité de personnaliser l'affichage des widgets (glisser-déposer)

## Responsive design
- **Desktop** : Affichage complet sur 2-3 colonnes
- **Tablette** : Réorganisation sur 1-2 colonnes
- **Mobile** : Empilement vertical des composants, priorité aux KPIs et suggestions

## Intégration avec les services
- Utilise BusinessPlanService pour obtenir la progression globale
- Utilise FinancialService pour les KPIs et projections
- Utilise ActionPlanService pour les jalons et tâches
- Mise à jour en temps réel des données via hooks personnalisés
