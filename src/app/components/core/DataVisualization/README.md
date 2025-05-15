# DataVisualization Component

Le composant `DataVisualization` est un ensemble d'outils de visualisation de données conçus pour l'application DevIndé Tracker. Il fournit des composants de graphiques et de visualisation de métriques qui suivent les patterns de design établis dans les maquettes.

## Caractéristiques

- **Plusieurs types de visualisations** : Graphiques à barres, Graphiques circulaires, Cartes de métriques, Barres de progression
- **États de chargement, vide et erreur** intégrés
- **Personnalisation poussée** via des props
- **Intégration avec IErrorService** pour la gestion des erreurs
- **Accessibilité** : Visualisations accessibles avec descriptions
- **Thèmes cohérents** : Design basé sur les maquettes de l'application

## Intégration avec l'Architecture

Le composant DataVisualization suit notre architecture standardisée :

1. **Composant UI Core** : Bloc de construction fondamental pour les visualisations de données
2. **Utilise IErrorService** : Intégration avec notre service de gestion d'erreurs
3. **Suit les Patterns de Design** : Implémente un style cohérent avec les maquettes
4. **Composable** : S'intègre facilement avec d'autres composants

## Types de Graphiques

Le composant `DataVisualization` expose plusieurs types de visualisations :

```tsx
import { DataVisualization } from '../../core/DataVisualization';

// Accès aux différents composants
const { BarChart, PieChart, MetricCard, ProgressBar } = DataVisualization;
```

## Utilisation de Base

### Graphique à Barres

```tsx
import { DataVisualization } from '../../core/DataVisualization';
const { BarChart } = DataVisualization;

// Définir les données
const data = [
  { label: 'Jan', value: 1200 },
  { label: 'Feb', value: 1900 },
  { label: 'Mar', value: 1500 },
  { label: 'Apr', value: 2200 },
];

// Utiliser le composant
<BarChart
  title="Revenu Mensuel"
  description="Premier trimestre 2025"
  data={data}
  height={250}
  formatValue={(value) => `${value}€`}
/>
```

### Graphique Circulaire

```tsx
import { DataVisualization } from '../../core/DataVisualization';
const { PieChart } = DataVisualization;

// Définir les données
const data = [
  { label: 'Développement Web', value: 45, color: '#3b82f6' },
  { label: 'Applications Mobile', value: 28, color: '#10b981' },
  { label: 'Maintenance', value: 15, color: '#8b5cf6' },
  { label: 'Conseil', value: 12, color: '#f59e0b' },
];

// Utiliser le composant
<PieChart
  title="Répartition des Revenus par Service"
  data={data}
  height={300}
  donut={true} // Pour un graphique en anneau
  showDataLabels={true}
/>
```

### Carte Métrique

```tsx
import { DataVisualization } from '../../core/DataVisualization';
const { MetricCard } = DataVisualization;

// Définir les données
const data = {
  title: 'Revenu Mensuel',
  value: 12500,
  unit: '€',
  change: {
    value: 15,
    percentage: true,
    direction: 'up',
    label: 'vs mois précédent'
  },
  status: 'positive'
};

// Utiliser le composant
<MetricCard
  data={data}
  size="md" // sm, md, ou lg
/>
```

### Barre de Progression

```tsx
import { DataVisualization } from '../../core/DataVisualization';
const { ProgressBar } = DataVisualization;

// Utiliser le composant
<ProgressBar
  title="Complétion du Plan d'Affaires"
  description="Objectif: 80% avant fin du mois"
  value={65}
  target={80}
  color="blue" // blue, green, yellow, red, purple, gray
/>
```

## Gestion des États

Tous les composants de visualisation prennent en charge les états suivants :

### État de Chargement

```tsx
<BarChart
  title="Revenu Mensuel"
  data={data}
  isLoading={true}
/>
```

### État d'Erreur

```tsx
<BarChart
  title="Revenu Mensuel"
  data={data}
  error={error}
  onRetry={() => fetchData()}
/>
```

### État Vide

```tsx
<BarChart
  title="Revenu Mensuel"
  data={[]} // Données vides
/>
```

## Intégration avec les Composants Métier

Le composant DataVisualization est conçu pour fonctionner avec nos composants métier. Voici un exemple d'utilisation avec le composant `FinancialDashboard` :

```tsx
import { DataVisualization } from '../../core/CardContainer';
import { CardContainer } from '../../core/CardContainer';
import { useFinancialProjects } from '../../../hooks/useFinancialProjects';

const { BarChart, PieChart, MetricCard, ProgressBar } = DataVisualization;

const FinancialSummary = ({ businessPlanId }) => {
  const { data, isLoading, error, refetch } = useFinancialProjects(businessPlanId);
  
  // Préparer les données pour les graphiques
  const revenueData = data ? data.monthlyRevenue.map(item => ({
    label: item.month,
    value: item.amount,
    secondaryValue: item.previousAmount
  })) : [];
  
  const revenueByServiceData = data ? data.revenueByService.map(item => ({
    label: item.service,
    value: item.amount,
    color: item.color
  })) : [];
  
  // Métriques 
  const revenueMetric = data ? {
    title: 'Revenu Mensuel',
    value: data.totalRevenue,
    unit: '€',
    change: {
      value: data.revenueChange,
      percentage: true,
      direction: data.revenueChange >= 0 ? 'up' : 'down',
      label: 'vs mois précédent'
    }
  } : null;
  
  return (
    <CardContainer
      title="Résumé Financier"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
    >
      <div className="space-y-6">
        {data && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard data={revenueMetric} />
              <MetricCard 
                data={{
                  title: 'Clients Actifs',
                  value: data.activeClients,
                  change: {
                    value: data.newClients,
                    direction: 'up',
                    label: 'nouveaux clients'
                  }
                }}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <BarChart
                title="Tendance des Revenus"
                description="Actuel vs Période Précédente"
                data={revenueData}
                showComparison={true}
                height={200}
                formatValue={(value) => `${value}€`}
              />
              
              <PieChart
                title="Sources de Revenus"
                data={revenueByServiceData}
                height={200}
                donut={true}
              />
            </div>
            
            <ProgressBar
              title="Objectif de Revenu"
              description={`Objectif mensuel: ${data.revenueGoal}€`}
              value={(data.totalRevenue / data.revenueGoal) * 100}
              target={83}
              color="blue"
            />
          </>
        )}
      </div>
    </CardContainer>
  );
};
```

## Intégration avec la Matrice Design-Implementation

Le composant DataVisualization implémente les patterns de visualisation trouvés dans les maquettes :

- **Dashboard.tsx** : Utilisation des métriques, barres de progression et graphiques
- **BusinessModel.tsx** : Visualisation des sources de revenus et des impacts tarifaires
- **FinancialDashboard.tsx** : Graphiques de tendances, répartition des revenus et dépenses
- **MarketAnalysis.tsx** : Visualisation des segments de marché et opportunités

## Considérations d'Accessibilité

Les composants de visualisation respectent les bonnes pratiques d'accessibilité :

- Titres et descriptions pour chaque visualisation
- Textes alternatifs pour les données représentées visuellement
- Modes d'affichage adaptés aux lecteurs d'écran
- Contraste de couleurs suffisant

## Meilleures Pratiques

1. **Utiliser les formatters** pour personnaliser l'affichage des valeurs
2. **Limiter le nombre de points de données** pour une meilleure lisibilité
3. **Utiliser des couleurs cohérentes** à travers l'application
4. **Fournir du contexte** avec des titres et descriptions clairs
5. **Gérer les états** (chargement, erreur, vide) pour une meilleure expérience utilisateur
6. **Tester différentes tailles de données** pour s'assurer que les visualisations restent lisibles