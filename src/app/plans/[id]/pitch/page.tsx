'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BusinessPlanData, PitchData } from "@/app/services/interfaces/dataModels";
import { getBusinessPlanService } from '@/app/services/serviceFactory';

// Interface locale pour les sections d'affichage uniquement
interface DisplaySection {
  title: string;
  content: string;
  isComplete: boolean;
}

/**
 * PitchViewerPage - Page de visualisation du pitch d'un business plan
 * 
 * Cette page affiche les détails du pitch dans un format visuel adapté à la lecture
 * et offre un bouton pour rediriger vers l'éditeur complet
 */
export default function PitchViewerPage() {
  const params = useParams();
  const id = params.id as string;
  const businessPlanService = getBusinessPlanService();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadBusinessPlan = async () => {
      setLoading(true);
      try {
        const result = await businessPlanService.getItem(id);
        if (result.success && result.data) {
          setBusinessPlan(result.data);
        } else {
          setError(result.error?.message || 'Impossible de charger le plan d\'affaires');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
      } finally {
        setLoading(false);
      }
    };
    
    loadBusinessPlan();
  }, [id, businessPlanService]);
  
  // États pour suivre les sections en cours d'édition
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});
  
  // Activer/désactiver l'édition d'une section spécifique
  const toggleSectionEdit = (fieldKey: string) => {
    setEditingSections(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };
  
  // Fonction pour mettre à jour les champs texte
  const handleInputChange = (field: keyof PitchData, value: string) => {
    if (!businessPlan) return;
    
    const updatedPitch = {
      ...businessPlan.pitch,
      [field]: value
    };
    
    setBusinessPlan({
      ...businessPlan,
      pitch: updatedPitch
    });
  };
  
  // Fonction pour sauvegarder les modifications
  const handleSave = async () => {
    if (!businessPlan) return;
    
    setLoading(true);
    try {
      const result = await businessPlanService.updateItem(id, businessPlan);
      if (result.success) {
        // Réinitialiser toutes les sections en édition
        setEditingSections({});
      } else {
        setError(result.error?.message || 'Échec de la sauvegarde');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de rendu d'une section
  const renderSection = (section: DisplaySection) => {
    // Détermination du champ correspondant dans le modèle PitchData
    let fieldKey: keyof PitchData | null = null;
    switch(section.title) {
      case 'Problème': fieldKey = 'problem'; break;
      case 'Solution': fieldKey = 'solution'; break;
      case 'Proposition Unique de Valeur': fieldKey = 'uniqueValueProposition'; break;
      case 'Public Cible': fieldKey = 'targetAudience'; break;
      case 'Avantage Concurrentiel': fieldKey = 'competitiveAdvantage'; break;
      default: fieldKey = null;
    }

    const isEditingThisSection = fieldKey ? editingSections[fieldKey as string] : false;

    return (
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{section.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              section.isComplete 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            }`}>
              {section.isComplete ? 'Complété' : 'À compléter'}
            </span>
            
            {fieldKey && (
              isEditingThisSection ? (
                <button 
                  onClick={() => toggleSectionEdit(fieldKey as string)}
                  className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  title="Annuler"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              ) : (
                <button 
                  onClick={() => toggleSectionEdit(fieldKey as string)}
                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40"
                  title="Modifier cette section"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              )
            )}
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
          {isEditingThisSection && fieldKey ? (
            <div className="space-y-3">
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md
                          dark:border-gray-600 dark:bg-gray-700 dark:text-white
                          focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                value={businessPlan?.pitch[fieldKey] as string || ""}
                onChange={(e) => handleInputChange(fieldKey as keyof PitchData, e.target.value)}
                placeholder={section.content}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => toggleSectionEdit(fieldKey as string)}
                  className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded
                            dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{section.content}</p>
          )}
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!businessPlan) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-yellow-700 dark:text-yellow-400">
        <p>Aucun plan d&apos;affaires trouvé</p>
      </div>
    );
  }
  
  // Récupérer ou initialiser les éléments du pitch
  const pitch = businessPlan.pitch || {};
  
  // Création des sections à afficher
  const sections: DisplaySection[] = [
    {
      title: 'Problème',
      content: pitch.problem || "Décrivez ici le problème que vous résolvez pour vos clients.",
      isComplete: !!pitch.problem
    },
    {
      title: 'Solution',
      content: pitch.solution || "Expliquez ici votre solution à ce problème.",
      isComplete: !!pitch.solution
    },
    {
      title: 'Proposition Unique de Valeur',
      content: pitch.uniqueValueProposition || "Qu'est-ce qui rend votre offre unique et attractive ?",
      isComplete: !!pitch.uniqueValueProposition
    },
    {
      title: 'Public Cible',
      content: pitch.targetAudience || "Décrivez précisément qui sont vos clients idéaux.",
      isComplete: !!pitch.targetAudience
    },
    {
      title: 'Avantage Concurrentiel',
      content: pitch.competitiveAdvantage || "Quels sont vos avantages par rapport à la concurrence ?",
      isComplete: !!pitch.competitiveAdvantage
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Pitch de Présentation
        </h1>
        
        {Object.keys(editingSections).length > 0 ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md 
                       flex items-center transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Enregistrer
            </button>
            <button
              onClick={() => setEditingSections({})}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md 
                       flex items-center transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Annuler
            </button>
          </div>
        ) : null}
      </div>
      
      <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-medium mb-3 text-blue-800 dark:text-blue-300">
          À propos du Pitch
        </h2>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          Le pitch est votre présentation concise et percutante de votre activité en tant qu&apos;indépendant.
          Il doit vous permettre d&apos;expliquer clairement et rapidement ce que vous faites et pourquoi
          vos clients devraient vous choisir.
        </p>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          Un bon pitch répond à ces questions essentielles :
        </p>
        <ul className="list-disc pl-6 text-blue-700 dark:text-blue-400 mb-2 space-y-1">
          <li>Quel problème résolvez-vous ?</li>
          <li>Comment le résolvez-vous ?</li>
          <li>Quelle est votre proposition unique de valeur ?</li>
          <li>Qui sont vos clients idéaux ?</li>
          <li>Pourquoi êtes-vous mieux placé que vos concurrents ?</li>
        </ul>
      </div>
      
      <div className="space-y-8">
        {sections.map((section, index) => (
          <React.Fragment key={index}>
            {renderSection(section)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
