import React, { useState, useEffect } from "react";
import { Lightbulb, X, ChevronRight, AlertTriangle, Info } from "lucide-react";
import type { BusinessPlanData } from "./types";

type Suggestion = {
  id: string;
  title: string;
  description: string;
  section: keyof BusinessPlanData;
  type: "tip" | "warning" | "improvement";
  priority: "high" | "medium" | "low";
  dismissed?: boolean;
};

type SmartSuggestionsProps = {
  data: BusinessPlanData;
  onNavigateToSection: (section: keyof BusinessPlanData) => void;
};

const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ data, onNavigateToSection }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeSuggestion, setActiveSuggestion] = useState<Suggestion | null>(null);
  
  // Générer des suggestions basées sur l'état du business plan
  useEffect(() => {
    const newSuggestions: Suggestion[] = [];
    
    // Vérifier si le pitch est complet
    if (!data.pitch.summary || data.pitch.summary.length < 50) {
      newSuggestions.push({
        id: "pitch-incomplete",
        title: "Détaillez votre pitch",
        description: "Un bon pitch devrait clairement expliquer votre valeur ajoutée et ce qui vous distingue des autres développeurs. Ajoutez au moins 2-3 phrases décrivant votre approche unique.",
        section: "pitch",
        type: "improvement",
        priority: "high"
      });
    }
    
    // Vérifier si les services sont bien définis
    if (data.services.offerings.length < 3) {
      newSuggestions.push({
        id: "services-few",
        title: "Diversifiez vos services",
        description: "Proposer au moins 3-5 services différents peut vous aider à attirer une clientèle plus large et à mieux répondre aux besoins variés du marché.",
        section: "services",
        type: "improvement",
        priority: "medium"
      });
    }
    
    // Vérifier si les tarifs sont compétitifs
    const hourlyRates = data.businessModel.hourlyRates;
    if (hourlyRates.length === 0) {
      newSuggestions.push({
        id: "pricing-missing",
        title: "Définissez votre tarification",
        description: "Déterminer vos tarifs horaires est crucial pour valoriser correctement votre travail et fournir des devis précis à vos clients potentiels.",
        section: "businessModel",
        type: "warning",
        priority: "high"
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
          description: "Vos tarifs horaires semblent inférieurs à la moyenne du marché. Pour un développeur front-end, un tarif de 35-45€/h est plus courant.",
          section: "businessModel",
          type: "tip",
          priority: "medium"
        });
      }
    }
    
    // Vérifier l'étude de marché
    if (data.marketAnalysis.competitors.length < 2) {
      newSuggestions.push({
        id: "market-competitors",
        title: "Analysez vos concurrents",
        description: "Identifiez au moins 3-5 concurrents directs et analysez leurs forces, faiblesses, et positionnement pour mieux vous différencier.",
        section: "marketAnalysis",
        type: "improvement",
        priority: "high"
      });
    }
    
    // Vérifier les prévisions financières
    const totalRevenue = data.financials.quarterlyGoals.reduce((sum, val) => sum + val, 0);
    if (totalRevenue === 0) {
      newSuggestions.push({
        id: "financials-missing",
        title: "Définissez vos objectifs financiers",
        description: "Établir des objectifs trimestriels de revenus vous aidera à suivre votre progression et à planifier votre trésorerie.",
        section: "financials",
        type: "warning",
        priority: "high"
      });
    } else if (totalRevenue < 15000) {
      newSuggestions.push({
        id: "financials-low",
        title: "Réévaluez vos objectifs financiers",
        description: "Vos prévisions de revenus semblent basses pour une activité à temps plein. Visez au moins 21 000€ pour la première année.",
        section: "financials",
        type: "tip",
        priority: "medium"
      });
    }
    
    // Vérifier le plan d'action
    if (data.actionPlan.milestones.length < 3) {
      newSuggestions.push({
        id: "action-plan-few",
        title: "Complétez votre plan d'action",
        description: "Définissez au moins 5-7 jalons clés pour les 12 prochains mois afin de structurer le développement de votre activité.",
        section: "actionPlan",
        type: "improvement",
        priority: "high"
      });
    }
    
    // Ajoutez d'autres suggestions contextuelles en fonction des données
    
    // Filtrer les suggestions déjà ignorées
    const dismissedIds = JSON.parse(localStorage.getItem('dismissed-suggestions') || '[]');
    const filteredSuggestions = newSuggestions.filter(s => !dismissedIds.includes(s.id));
    
    setSuggestions(filteredSuggestions);
  }, [data]);
  
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
  
  // Récupérer l'icône en fonction du type de suggestion
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "tip":
        return <Lightbulb className="text-blue-500" size={16} />;
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case "improvement":
        return <Info className="text-green-500" size={16} />;
      default:
        return <Lightbulb className="text-blue-500" size={16} />;
    }
  };
  
  // Récupérer la couleur en fonction du type de suggestion
  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "tip":
        return "border-blue-200 bg-blue-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "improvement":
        return "border-green-200 bg-green-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-20">
      {/* Bouton flottant pour afficher/masquer les suggestions */}
      <button
        className="flex items-center p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 focus:outline-none"
        onClick={() => setShowSuggestions(!showSuggestions)}
      >
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
          <Lightbulb className="text-yellow-600" size={24} />
        </div>
        {suggestions.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {suggestions.length}
          </span>
        )}
      </button>
      
      {/* Modal pour afficher les suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-16 left-0 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
            <h3 className="font-medium flex items-center">
              <Lightbulb size={18} className="mr-2" />
              Suggestions intelligentes
            </h3>
            <button
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
              onClick={() => setShowSuggestions(false)}
            >
              <X size={16} />
            </button>
          </div>
          
          {activeSuggestion ? (
            <div className="p-4">
              <button
                className="text-blue-500 flex items-center text-sm mb-3"
                onClick={() => setActiveSuggestion(null)}
              >
                <ChevronRight size={16} className="transform rotate-180 mr-1" />
                Retour
              </button>
              
              <div className={`p-3 border rounded ${getSuggestionColor(activeSuggestion.type)}`}>
                <h4 className="font-semibold flex items-center">
                  {getSuggestionIcon(activeSuggestion.type)}
                  <span className="ml-2">{activeSuggestion.title}</span>
                </h4>
                <p className="text-sm mt-2 text-gray-600">{activeSuggestion.description}</p>
                
                <div className="mt-4 flex justify-between">
                  <button
                    className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                    onClick={() => onNavigateToSection(activeSuggestion.section)}
                  >
                    <ChevronRight size={16} className="mr-1" />
                    Modifier
                  </button>
                  <button
                    className="text-gray-500 hover:text-gray-700 text-sm"
                    onClick={() => dismissSuggestion(activeSuggestion.id)}
                  >
                    Ignorer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 max-h-96 overflow-y-auto">
              {suggestions
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map(suggestion => (
                  <div 
                    key={suggestion.id}
                    className="flex items-start p-2 border-b cursor-pointer hover:bg-gray-50"
                    onClick={() => setActiveSuggestion(suggestion)}
                  >
                    <div className="mr-2 mt-0.5">
                      {getSuggestionIcon(suggestion.type)}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium">{suggestion.title}</h4>
                      <p className="text-xs text-gray-500">
                        {suggestion.section === 'businessModel' ? 'Modèle économique' :
                         suggestion.section === 'marketAnalysis' ? 'Analyse de marché' :
                         suggestion.section === 'actionPlan' ? 'Plan d\'action' :
                         suggestion.section.charAt(0).toUpperCase() + suggestion.section.slice(1)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                      suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
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