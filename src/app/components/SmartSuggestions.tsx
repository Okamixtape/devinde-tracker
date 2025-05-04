import React, { useState, useEffect } from "react";
import { Lightbulb, X, ChevronRight, AlertTriangle, Zap, TrendingUp, DollarSign, Users, FileText } from "lucide-react";
import type { BusinessPlanData } from "./types";
import { UI_CLASSES } from "../styles/ui-classes";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  section: keyof BusinessPlanData;
  type: "tip" | "warning" | "improvement" | "insight";
  priority: "high" | "medium" | "low";
  actionLabel?: string;
  dismissed?: boolean;
};

type SmartSuggestionsProps = {
  data: BusinessPlanData;
  onNavigateToSection: (section: keyof BusinessPlanData) => void;
};

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ data, onNavigateToSection }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  const [animate, setAnimate] = useState(false);
  
  // Générer des suggestions basées sur l'état du business plan
  useEffect(() => {
    const newSuggestions: Suggestion[] = [];
    
    // Vérifier si le pitch est complet
    if (!data.pitch?.summary || data.pitch.summary.length < 50) {
      newSuggestions.push({
        id: "pitch-incomplete",
        title: "Détaillez votre pitch",
        description: "Un bon pitch devrait clairement expliquer votre valeur ajoutée et ce qui vous distingue des autres développeurs. Ajoutez au moins 2-3 phrases décrivant votre approche unique.",
        section: "pitch",
        type: "improvement",
        priority: "high",
        actionLabel: "Améliorer mon pitch"
      });
    }
    
    // Vérifier si la vision est définie
    if (!data.pitch?.vision || data.pitch.vision.length < 30) {
      newSuggestions.push({
        id: "vision-missing",
        title: "Définissez votre vision",
        description: "Exprimez votre vision à long terme pour votre activité. Où vous voyez-vous dans 3-5 ans et quel impact souhaitez-vous avoir sur votre marché ?",
        section: "pitch",
        type: "improvement",
        priority: "medium",
        actionLabel: "Définir ma vision"
      });
    }
    
    // Vérifier si les services sont bien définis
    if (!data.services?.offerings || data.services.offerings.length < 3) {
      newSuggestions.push({
        id: "services-few",
        title: "Diversifiez vos services",
        description: "Proposer au moins 3-5 services différents peut vous aider à attirer une clientèle plus large et à mieux répondre aux besoins variés du marché.",
        section: "services",
        type: "improvement",
        priority: "medium",
        actionLabel: "Ajouter des services"
      });
    }
    
    // Vérifier si les technologies sont définies
    if (!data.services?.technologies || data.services.technologies.length < 3) {
      newSuggestions.push({
        id: "tech-stack-incomplete",
        title: "Précisez votre stack technique",
        description: "Définissez clairement les technologies que vous maîtrisez pour rassurer vos clients potentiels sur vos compétences techniques.",
        section: "services",
        type: "tip",
        priority: "medium",
        actionLabel: "Ajouter des technologies"
      });
    }
    
    // Vérifier si les tarifs sont compétitifs
    const hourlyRates = data.businessModel?.hourlyRates || [];
    if (hourlyRates.length === 0) {
      newSuggestions.push({
        id: "pricing-missing",
        title: "Définissez votre tarification",
        description: "Déterminer vos tarifs horaires est crucial pour valoriser correctement votre travail et fournir des devis précis à vos clients potentiels.",
        section: "businessModel",
        type: "warning",
        priority: "high",
        actionLabel: "Définir mes tarifs"
      });
    } else {
      // Vérification basique si les tarifs semblent trop bas
      const averageRate = hourlyRates
        .map(rate => {
          const match = rate.match(/(\d+)[-–]?(\d+)?€\/h/);
          return match ? parseInt(match[1]) : 0;
        })
        .reduce((sum, rate, _, array) => sum + rate / array.length, 0);
      
      if (averageRate < 30) {
        newSuggestions.push({
          id: "pricing-low",
          title: "Réévaluez vos tarifs",
          description: "Vos tarifs horaires semblent inférieurs à la moyenne du marché. Pour un développeur indépendant, un tarif de 40-60€/h est plus courant en fonction de votre expertise.",
          section: "businessModel",
          type: "insight",
          priority: "medium",
          actionLabel: "Revoir mes tarifs"
        });
      }
    }
    
    // Vérifier si des packages ou abonnements sont définis
    if ((!data.businessModel?.packages || data.businessModel.packages.length === 0) && 
        (!data.businessModel?.subscriptions || data.businessModel.subscriptions.length === 0)) {
      newSuggestions.push({
        id: "packages-missing",
        title: "Créez des offres packagées",
        description: "Proposer des forfaits ou abonnements permet d'augmenter votre revenu récurrent et de fidéliser vos clients sur le long terme.",
        section: "businessModel",
        type: "tip",
        priority: "medium",
        actionLabel: "Créer des packages"
      });
    }
    
    // Vérifier l'étude de marché
    if (!data.marketAnalysis?.competitors || data.marketAnalysis.competitors.length < 2) {
      newSuggestions.push({
        id: "market-competitors",
        title: "Analysez vos concurrents",
        description: "Identifiez au moins 3-5 concurrents directs et analysez leurs forces, faiblesses, et positionnement pour mieux vous différencier.",
        section: "marketAnalysis",
        type: "improvement",
        priority: "high",
        actionLabel: "Analyser la concurrence"
      });
    }
    
    // Vérifier si les clients cibles sont bien définis
    if (!data.marketAnalysis?.targetClients || data.marketAnalysis.targetClients.length < 2) {
      newSuggestions.push({
        id: "clients-undefined",
        title: "Définissez vos clients cibles",
        description: "Précisez les profils de clients que vous souhaitez attirer pour mieux cibler vos actions marketing et adapter votre offre.",
        section: "marketAnalysis",
        type: "improvement",
        priority: "high",
        actionLabel: "Définir mes clients cibles"
      });
    }
    
    // Vérifier les tendances du marché
    if (!data.marketAnalysis?.trends || data.marketAnalysis.trends.length < 2) {
      newSuggestions.push({
        id: "trends-missing",
        title: "Identifiez les tendances du marché",
        description: "Connaître les tendances actuelles et futures de votre marché vous permettra d'anticiper les besoins et de rester compétitif.",
        section: "marketAnalysis",
        type: "insight",
        priority: "low",
        actionLabel: "Explorer les tendances"
      });
    }
    
    // Vérifier les prévisions financières
    const quarterlyGoals = data.financials?.quarterlyGoals || [];
    const totalRevenue = quarterlyGoals.reduce((sum, val) => sum + val, 0);
    if (totalRevenue === 0) {
      newSuggestions.push({
        id: "financials-missing",
        title: "Définissez vos objectifs financiers",
        description: "Établir des objectifs trimestriels de revenus vous aidera à suivre votre progression et à planifier votre trésorerie.",
        section: "financials",
        type: "warning",
        priority: "high",
        actionLabel: "Définir mes objectifs"
      });
    } else if (totalRevenue < 15000) {
      newSuggestions.push({
        id: "financials-low",
        title: "Réévaluez vos objectifs financiers",
        description: "Vos prévisions de revenus semblent basses pour une activité à temps plein. Visez au moins 25 000€ pour la première année d'activité.",
        section: "financials",
        type: "insight",
        priority: "medium",
        actionLabel: "Revoir mes objectifs"
      });
    }
    
    // Vérifier les dépenses
    if (!data.financials?.expenses || data.financials.expenses.length < 3) {
      newSuggestions.push({
        id: "expenses-missing",
        title: "Détaillez vos dépenses",
        description: "Anticipez toutes vos dépenses professionnelles pour éviter les mauvaises surprises et optimiser votre fiscalité.",
        section: "financials",
        type: "improvement",
        priority: "medium",
        actionLabel: "Lister mes dépenses"
      });
    }
    
    // Vérifier l'investissement initial
    if (!data.financials?.initialInvestment || data.financials.initialInvestment === 0) {
      newSuggestions.push({
        id: "investment-missing",
        title: "Estimez votre investissement initial",
        description: "Calculez les fonds nécessaires pour démarrer votre activité (équipement, logiciels, formation, trésorerie initiale).",
        section: "financials",
        type: "tip",
        priority: "low",
        actionLabel: "Calculer mon investissement"
      });
    }
    
    // Vérifier le plan d'action
    if (!data.actionPlan?.milestones || data.actionPlan.milestones.length < 3) {
      newSuggestions.push({
        id: "action-plan-few",
        title: "Complétez votre plan d'action",
        description: "Définissez au moins 5-7 jalons clés pour les 12 prochains mois afin de structurer le développement de votre activité.",
        section: "actionPlan",
        type: "improvement",
        priority: "high",
        actionLabel: "Planifier mes jalons"
      });
    }
    
    // Filtrer les suggestions déjà ignorées
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed-suggestions') || '[]');
    const filteredSuggestions = newSuggestions.filter(s => !dismissedIds.includes(s.id));
    
    setSuggestions(filteredSuggestions);
    
    // Si on a des suggestions, animer l'icône périodiquement
    if (filteredSuggestions.length > 0 && !showSuggestions) {
      const interval = setInterval(() => {
        setAnimate(true);
        setTimeout(() => setAnimate(false), 1000);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [data, showSuggestions]);
  
  // Ignorer une suggestion
  const dismissSuggestion = (id: string) => {
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed-suggestions') || '[]');
    dismissedIds.push(id);
    localStorage.setItem('dismissed-suggestions', JSON.stringify(dismissedIds));
    
    setSuggestions(prev => prev.filter(s => s.id !== id));
    
    if (activeSuggestion?.id === id) {
      setActiveSuggestion(null);
    }
  };
  
  // Récupérer l'icône en fonction du type de suggestion et de la section
  const getSuggestionIcon = (type: string, section?: keyof BusinessPlanData) => {
    // Priorité au type
    switch (type) {
      case "warning":
        return <AlertTriangle className="text-yellow-500 dark:text-yellow-400" size={16} />;
      case "insight":
        return <Zap className="text-purple-500 dark:text-purple-400" size={16} />;
      case "improvement":
        return <TrendingUp className="text-green-500 dark:text-green-400" size={16} />;
      case "tip":
        return <Lightbulb className="text-blue-500 dark:text-blue-400" size={16} />;
    }
    
    // Fallback sur la section
    switch (section) {
      case "businessModel":
        return <DollarSign className="text-blue-500 dark:text-blue-400" size={16} />;
      case "marketAnalysis":
        return <Users className="text-green-500 dark:text-green-400" size={16} />;
      case "financials":
        return <TrendingUp className="text-purple-500 dark:text-purple-400" size={16} />;
      case "actionPlan":
        return <FileText className="text-blue-500 dark:text-blue-400" size={16} />;
      default:
        return <Lightbulb className="text-blue-500 dark:text-blue-400" size={16} />;
    }
  };
  
  // Récupérer la couleur en fonction du type de suggestion
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "tip":
        return "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20";
      case "warning":
        return "border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20";
      case "improvement":
        return "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20";
      case "insight":
        return "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20";
      default:
        return "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50";
    }
  };
  
  // Traduction des sections
  const getSectionLabel = (section: keyof BusinessPlanData): string => {
    switch (section) {
      case "pitch":
        return "Pitch";
      case "services":
        return "Services";
      case "businessModel":
        return "Modèle économique";
      case "marketAnalysis":
        return "Analyse de marché";
      case "financials":
        return "Finances";
      case "actionPlan":
        return "Plan d'action";
      default:
        return String(section).charAt(0).toUpperCase() + String(section).slice(1);
    }
  };

  // S'il n'y a pas de suggestions, ne rien afficher
  if (suggestions.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-20">
      {/* Bouton flottant pour afficher/masquer les suggestions */}
      <button
        className={`flex items-center p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 ${animate ? 'scale-110' : ''}`}
        onClick={() => setShowSuggestions(!showSuggestions)}
        aria-label="Afficher les suggestions intelligentes"
      >
        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
          <Lightbulb className="text-yellow-600 dark:text-yellow-400" size={24} />
        </div>
        {suggestions.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {suggestions.length}
          </span>
        )}
      </button>
      
      {/* Modal pour afficher les suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-16 left-0 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-600 dark:to-orange-600 text-white">
            <h3 className="font-medium flex items-center">
              <Lightbulb size={18} className="mr-2" />
              Suggestions intelligentes
            </h3>
            <button
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              onClick={() => setShowSuggestions(false)}
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
          </div>
          
          {activeSuggestion ? (
            <div className="p-4 animate-fadeIn">
              <button
                className="text-blue-500 dark:text-blue-400 flex items-center text-sm mb-3 hover:underline"
                onClick={() => setActiveSuggestion(null)}
              >
                <ChevronRight size={16} className="transform rotate-180 mr-1" />
                Retour
              </button>
              
              <div className={`p-3 border rounded ${getSuggestionColor(activeSuggestion.type)}`}>
                <h4 className="font-semibold flex items-center text-gray-900 dark:text-white">
                  {getSuggestionIcon(activeSuggestion.type, activeSuggestion.section)}
                  <span className="ml-2">{activeSuggestion.title}</span>
                </h4>
                <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">{activeSuggestion.description}</p>
                
                <div className="mt-4 flex justify-between">
                  <button
                    className={`${UI_CLASSES.BUTTON_PRIMARY} text-sm py-1 px-3`}
                    onClick={() => onNavigateToSection(activeSuggestion.section)}
                  >
                    {activeSuggestion.actionLabel || "Modifier"}
                  </button>
                  <button
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                    onClick={() => dismissSuggestion(activeSuggestion.id)}
                  >
                    Ignorer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
              {suggestions
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map(suggestion => (
                  <div 
                    key={suggestion.id}
                    className="flex items-start p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    onClick={() => setActiveSuggestion(suggestion)}
                  >
                    <div className="mr-3 mt-0.5">
                      {getSuggestionIcon(suggestion.type, suggestion.section)}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{suggestion.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {getSectionLabel(suggestion.section)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${
                      suggestion.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                    }`}>
                      {suggestion.priority === 'high' ? 'Haute' :
                       suggestion.priority === 'medium' ? 'Moyenne' : 'Basse'}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartSuggestions;