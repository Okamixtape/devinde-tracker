# Dashboard - Guide d'implémentation

Ce document explique comment intégrer le composant `Dashboard` avec l'architecture existante de DevIndé Tracker.

## Vue d'ensemble

Le `Dashboard` est le composant central qui affiche une vision globale du plan d'affaires avec :
- Une barre de progression globale
- Des KPIs financiers clés
- Des projections de revenus sous forme de graphique
- Des suggestions intelligentes basées sur l'état actuel
- Des listes de projets actifs et jalons à venir
- Un journal des activités récentes

## Intégration avec les services existants

### Données du plan d'affaires

Pour obtenir la progression globale et par section :

```tsx
// À ajouter dans Dashboard.tsx
import { useBusinessPlanService } from '@/app/hooks/useBusinessPlanService';
import { useSectionService } from '@/app/hooks/useSectionService';

export const Dashboard: React.FC = () => {
  const businessPlanService = useBusinessPlanService();
  const sectionService = useSectionService();
  const [sections, setSections] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);
  
  useEffect(() => {
    const loadData = async () => {
      // Charger le plan d'affaires actif
      const businessPlanResult = await businessPlanService.getCurrentBusinessPlan();
      
      if (businessPlanResult.success && businessPlanResult.data) {
        const businessPlan = businessPlanResult.data;
        
        // Charger les sections avec leur progression
        const sectionsResult = await sectionService.getSections(businessPlan.id);
        
        if (sectionsResult.success) {
          setSections(sectionsResult.data);
          
          // Calculer la progression globale
          const totalCompletion = sectionsResult.data.reduce(
            (sum, section) => sum + section.completion, 0
          );
          setOverallProgress(
            Math.round(totalCompletion / sectionsResult.data.length)
          );
        }
      }
    };
    
    loadData();
  }, [businessPlanService, sectionService]);
  
  // ... reste du composant
}
```

### Métriques financières

Pour obtenir les KPIs financiers :

```tsx
// À ajouter dans Dashboard.tsx
import { useFinancialService } from '@/app/hooks/useFinancialService';

export const Dashboard: React.FC = () => {
  const financialService = useFinancialService();
  const [keyMetrics, setKeyMetrics] = useState([]);
  const [projectionData, setProjectionData] = useState([]);
  
  useEffect(() => {
    const loadFinancialData = async () => {
      // Charger les métriques clés
      const metricsResult = await financialService.getKeyMetrics(timeframe);
      
      if (metricsResult.success) {
        setKeyMetrics(metricsResult.data);
      }
      
      // Charger les projections
      const projectionsResult = await financialService.getProjections(timeframe);
      
      if (projectionsResult.success) {
        setProjectionData(projectionsResult.data);
      }
    };
    
    loadFinancialData();
  }, [financialService, timeframe]);
  
  // ... reste du composant
}
```

### Projets et jalons

Pour obtenir les projets actifs et les jalons à venir :

```tsx
// À ajouter dans Dashboard.tsx
import { useActionPlanService } from '@/app/hooks/useActionPlanService';
import { useProjectService } from '@/app/hooks/useProjectService';

export const Dashboard: React.FC = () => {
  const actionPlanService = useActionPlanService();
  const projectService = useProjectService();
  const [activeProjects, setActiveProjects] = useState([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState([]);
  
  useEffect(() => {
    const loadProjectsAndMilestones = async () => {
      // Charger les projets actifs
      const projectsResult = await projectService.getActiveProjects();
      
      if (projectsResult.success) {
        setActiveProjects(projectsResult.data);
      }
      
      // Charger les jalons à venir
      const milestonesResult = await actionPlanService.getUpcomingMilestones();
      
      if (milestonesResult.success) {
        setUpcomingMilestones(milestonesResult.data);
      }
    };
    
    loadProjectsAndMilestones();
  }, [actionPlanService, projectService]);
  
  // ... reste du composant
}
```

### Suggestions intelligentes

Pour générer des suggestions intelligentes basées sur l'état actuel :

```tsx
// À ajouter dans Dashboard.tsx
import { useSuggestionService } from '@/app/hooks/useSuggestionService';

export const Dashboard: React.FC = () => {
  const suggestionService = useSuggestionService();
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
    const loadSuggestions = async () => {
      const suggestionsResult = await suggestionService.getSuggestions();
      
      if (suggestionsResult.success) {
        setSuggestions(suggestionsResult.data);
      }
    };
    
    loadSuggestions();
  }, [suggestionService]);
  
  // ... reste du composant
}
```

## Graphiques et visualisations

Pour les graphiques de projection, utilisez le composant BarChart de Recharts :

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dans votre composant
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="quarter" />
    <YAxis />
    <Tooltip formatter={(value) => `${value.toLocaleString('fr-FR')} €`} />
    <Legend />
    <Bar name="Consulting" dataKey="sources[0].value" stackId="a" fill="#4299e1" />
    <Bar name="Formation" dataKey="sources[1].value" stackId="a" fill="#48bb78" />
    <Bar name="Produits" dataKey="sources[2].value" stackId="a" fill="#ecc94b" />
    <Bar name="Réel" dataKey="actual" fill="#718096" />
  </BarChart>
</ResponsiveContainer>
```

## Hooks personnalisés recommandés

Créez ces hooks pour simplifier l'intégration :

1. `useMetrics` : Pour charger et formater les KPIs
2. `useProjections` : Pour les données de projection avec filtrage
3. `useDashboardData` : Hook principal qui combine tous les chargements

## Modifications nécessaires

1. **Remplacer les données simulées** par des appels aux services
2. **Implémenter les graphiques** avec Recharts
3. **Adapter les chemins et URLs** selon votre structure de routage
4. **Ajouter la gestion d'erreur** pour tous les appels de service
5. **Implémenter des états de chargement** pour améliorer l'expérience utilisateur

## Considérations de performance

- Utilisez `useMemo` pour les calculs et transformations de données
- Implémentez la pagination pour les activités récentes
- Utilisez `React.lazy` pour charger les composants graphiques au besoin
- Ajoutez des optimisations de rendu avec React.memo pour les sous-composants

## État de chargement et fallbacks

Pour une meilleure expérience utilisateur, ajoutez des états de chargement :

```tsx
{isLoading ? (
  <div className="animate-pulse flex space-x-4">
    <div className="flex-1 space-y-4 py-1">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
) : (
  // Contenu normal
)}
```
