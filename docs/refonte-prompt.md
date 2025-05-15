# Prompt pour la refonte de DevIndé Tracker

## État actuel de l'application

### Architecture existante
- Application Next.js 15.3.1 avec React 19
- Architecture basée sur des services bien structurés (LocalStorageService, BusinessPlanService, etc.)
- Modèles de données TypeScript bien définis
- Utilisation de TailwindCSS pour le styling
- Conventions de nommage et d'organisation établies dans CONVENTIONS.md

### Structure clé des dossiers
```
/src/app/
  /components/ - Composants réutilisables
  /services/ - Services et logique métier
    /core/ - Implémentations des services
    /interfaces/ - Interfaces TypeScript des services et modèles de données
    /utils/ - Utilitaires partagés
  /hooks/ - Hooks personnalisés
  /contexts/ - Gestion d'état global
  /[section-name]/ - Routes principales (en kebab-case)
```

### Modèles de données principaux
- BusinessPlanData - Structure globale des données
- ActionPlanData - Plan d'action avec milestones et tâches
- FinancialsData - Données financières et projets
- Autres modèles pour chaque section (BusinessModelData, MarketAnalysisData, etc.)

## Objectifs de la refonte

Notre refonte suit une approche hybride qui vise à:
1. Préserver la couche de services et les modèles de données existants
2. Moderniser complètement l'interface utilisateur selon les nouvelles maquettes
3. Améliorer l'architecture, la performance et la maintenabilité 
4. Créer une expérience utilisateur plus intuitive et efficace

## Questions sur les maquettes et le design

Pour implémenter efficacement cette refonte, nous avons besoin de détails sur:

1. **Structure et navigation**
   - Comment est organisée la nouvelle sidebar/navigation?
   - Quelle est la structure de layout principal (header, sidebar, contenu)?
   - Comment les différentes sections sont-elles accessibles?

2. **Dashboard principal**
   - Quels KPIs et visualisations sont présents sur le dashboard?
   - Comment les données sont-elles organisées et présentées?
   - Y a-t-il des widgets interactifs spécifiques?

3. **Modules fonctionnels**
   - Comment s'organisent les sections de modèle économique, finances, et plan d'action?
   - Quelles sont les interactions spécifiques (édition inline, drag-and-drop, etc.)?
   - Comment les données entre modules sont-elles liées visuellement?

4. **Système de design**
   - Quelle palette de couleurs et typographie sont utilisées?
   - Quels sont les composants UI communs (boutons, cards, inputs)?
   - Y a-t-il des transitions ou animations spécifiques?

5. **Responsive design**
   - Comment les interfaces s'adaptent-elles aux différentes tailles d'écran?
   - Y a-t-il des variations de layout pour mobile/tablette?

6. **Recommandations techniques**
   - Quelles bibliothèques UI sont recommandées pour l'implémentation?
   - Comment intégrer le design avec notre architecture de services existante?
   - Y a-t-il des considérations de performance particulières?

## Plan d'implémentation proposé

Nous prévoyons d'implémenter cette refonte selon les étapes suivantes:

1. **Analyse et préparation** (en cours)
   - Documenter l'architecture existante
   - Définir les principes de la nouvelle architecture
   - Établir des conventions et standards

2. **Modèles de données et services**
   - Adapter/étendre les modèles existants si nécessaire
   - Créer des adaptateurs pour les services existants
   - Mettre en place une architecture de gestion d'état efficace

3. **Layout et navigation**
   - Implémenter le nouveau layout global
   - Développer la sidebar et le système de navigation
   - Établir les routes et transitions

4. **Modules fonctionnels**
   - Implémenter chaque section/module selon les maquettes
   - Intégrer les services de données existants
   - Développer les interactions spécifiques

5. **Tests et optimisation**
   - Tests unitaires et d'intégration
   - Optimisations de performance
   - Tests de compatibilité

Pour avancer efficacement, nous avons besoin d'accéder aux maquettes complètes et de comprendre en détail les intentions de design pour chaque module.

## Bibliothèques et dépendances

Notre projet utilise actuellement:
- Next.js 15.3.1
- React 19
- TailwindCSS 4
- Headless UI
- Recharts
- React Icons

Avez-vous des recommandations spécifiques pour d'autres bibliothèques qui pourraient faciliter l'implémentation du nouveau design?
