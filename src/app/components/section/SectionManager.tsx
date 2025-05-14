'use client';

import React, { useState } from 'react';
import { BusinessPlanData, Section } from "@/app/services/interfaces/dataModels";
import { SECTIONS_CONFIG, SECTION_ORDER } from '@/app/config/sections-config';

// Types pour les propriétés du composant
interface SectionManagerProps {
  businessPlan: BusinessPlanData;
  onSave: (updatedPlan: BusinessPlanData) => void;
  onCancel: () => void;
}

// Propriétés étendues pour les sections
interface SectionExtension {
  visible: boolean;
  order: number;
  name: string;
}

// Type étendu pour les sections avec ordre et visibilité
interface EnhancedSection extends Section, SectionExtension {}

// Type pour les sections avec des propriétés optionnelles
interface OptionalSectionProps {
  visible?: boolean;
  order?: number;
}

// Sections par défaut si aucune n'existe
const DEFAULT_SECTIONS: Section[] = SECTIONS_CONFIG.map(config => ({
  id: config.id,
  key: config.key,
  title: config.title,
  icon: config.icon,
  color: config.color,
  completion: 0,
  route: config.route,
  businessPlanId: '', // Sera rempli lors de l'assignation à un business plan
  order: config.order || 0 // Utiliser l'ordre du config ou 0 par défaut
}));

/**
 * SectionManager Component
 * 
 * Permet de gérer les sections d'un plan d'affaires via:
 * - Réorganisation avec boutons haut/bas
 * - Activation/désactivation via case à cocher
 * - Interface utilisateur intuitive
 */
export function SectionManager({ businessPlan, onSave, onCancel }: SectionManagerProps) {
  // Helper pour construire les routes complètes
  const buildSectionRoute = (route: string): string => {
    const planId = businessPlan.id || '';
    // Enlever le slash initial s'il existe
    const cleanRoute = route.startsWith('/') ? route.substring(1) : route;
    return `/plans/${planId}/${cleanRoute}`;
  };
  
  // Si les sections n'ont pas d'ordre/visibilité, initialiser ces propriétés
  const initSections = (): EnhancedSection[] => {
    // Si aucune section n'existe, utiliser les sections par défaut
    if (!businessPlan.sections || businessPlan.sections.length === 0) {
      // Trier selon l'ordre prédéfini 
      return DEFAULT_SECTIONS
        .map((section, index) => ({
          ...section,
          visible: true,
          order: SECTION_ORDER.indexOf(section.key) >= 0 
            ? SECTION_ORDER.indexOf(section.key)  
            : index + SECTION_ORDER.length,
          name: section.title
        }))
        .sort((a, b) => a.order - b.order);
    }
    
    return businessPlan.sections
      .map((section: Section, index: number) => {
        // Traiter la section comme ayant potentiellement ces propriétés
        const sectionWithOptionalProps = section as Section & OptionalSectionProps;
        
        // Créer une section étendue avec les propriétés supplémentaires
        const enhancedSection: EnhancedSection = {
          ...section,
          visible: sectionWithOptionalProps.visible !== undefined ? sectionWithOptionalProps.visible : true,
          order: sectionWithOptionalProps.order !== undefined 
            ? sectionWithOptionalProps.order 
            : SECTION_ORDER.indexOf(section.key) >= 0 
              ? SECTION_ORDER.indexOf(section.key) 
              : index + SECTION_ORDER.length,
          name: section.title // Utiliser le titre comme nom pour l'affichage
        };
        return enhancedSection;
      })
      .sort((a: EnhancedSection, b: EnhancedSection) => a.order - b.order);
  };
  
  // État pour les sections
  const [sections, setSections] = useState<EnhancedSection[]>(initSections());
  
  // Déplacer une section vers le haut
  const moveUp = (index: number) => {
    if (index === 0) return; // Déjà en haut
    
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index - 1];
    newSections[index - 1] = temp;
    
    // Mettre à jour l'ordre
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));
    
    setSections(updatedSections);
  };
  
  // Déplacer une section vers le bas
  const moveDown = (index: number) => {
    if (index === sections.length - 1) return; // Déjà en bas
    
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + 1];
    newSections[index + 1] = temp;
    
    // Mettre à jour l'ordre
    const updatedSections = newSections.map((section, idx) => ({
      ...section,
      order: idx
    }));
    
    setSections(updatedSections);
  };
  
  // Changer la visibilité d'une section
  const toggleVisibility = (index: number) => {
    const updatedSections = sections.map((section, i) => {
      if (i === index) {
        return { ...section, visible: !section.visible };
      }
      return section;
    });
    
    setSections(updatedSections);
  };
  
  // Réinitialiser les sections par défaut
  const resetToDefault = () => {
    // Trier selon l'ordre prédéfini
    const defaultSections = DEFAULT_SECTIONS
      .map((section, index) => ({
        ...section,
        visible: true,
        order: SECTION_ORDER.indexOf(section.key) >= 0 
          ? SECTION_ORDER.indexOf(section.key) 
          : index + SECTION_ORDER.length,
        name: section.title
      }))
      .sort((a, b) => a.order - b.order);
    
    setSections(defaultSections);
  };
  
  // Sauvegarder les modifications
  const handleSave = () => {
    const updatedPlan = {
      ...businessPlan,
      sections: sections
    };
    
    onSave(updatedPlan);
  };
  
  // Ouvrir une section
  const handleOpenSection = (section: EnhancedSection) => {
    window.location.href = buildSectionRoute(section.route);
  };
  
  // Rendu de l'icône selon la section
  const renderSectionIcon = (iconName: string, color: string) => {
    // Map des icônes correspondant à celles de l'interface existante
    const iconMap: { [key: string]: React.ReactNode } = {
      'lightbulb': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
        </svg>
      ),
      'briefcase': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"></path>
        </svg>
      ),
      'cash': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
        </svg>
      ),
      'chart-bar': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
        </svg>
      ),
      'currency-euro': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.736 6.979C9.208 6.193 9.696 6 10 6c.304 0 .792.193 1.264.979a1 1 0 001.715-1.029C12.279 4.784 11.232 4 10 4s-2.279.784-2.979 1.95c-.285.475-.507 1-.67 1.55H6a1 1 0 000 2h.013a9.358 9.358 0 000 1H6a1 1 0 100 2h.351c.163.55.385 1.075.67 1.55C7.721 15.216 8.768 16 10 16s2.279-.784 2.979-1.95a1 1 0 10-1.715-1.029c-.472.786-.96.979-1.264.979-.304 0-.792-.193-1.264-.979a4.265 4.265 0 01-.264-.521H10a1 1 0 100-2H8.017a7.36 7.36 0 010-1H10a1 1 0 100-2H8.472c.08-.185.167-.36.264-.521z" clipRule="evenodd"></path>
        </svg>
      ),
      'clipboard-list': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
        </svg>
      ),
      'chart-square-bar': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 10a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1zM2 4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1zm0 4a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1zM2 16a1 1 0 011-1h2a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1z"></path>
        <path d="M15 8h2a1 1 0 011 1v2m-4 4h2a1 1 0 011 1v2m-5 4h2a1 1 0 011 1v1a1 1 0 01-1 1H10a1 1 0 01-1-1v-1m-5 4h2a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z"></path>
        </svg>
      )
    };

    return (
      <div 
        className="flex-shrink-0 flex items-center justify-center rounded-md w-10 h-10" 
        style={{ backgroundColor: `${color}20`, color }}
      >
        {iconMap[iconName] || (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 01-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
        )}
      </div>
    );
  };

  // Rendu du bouton dropdown (conforme à l'UI existante)
  const renderDropdownButtons = (index: number) => (
    <div className="flex space-x-2">
      <button 
        type="button" 
        onClick={() => moveUp(index)}
        disabled={index === 0}
        className={`rounded-md h-8 w-8 flex items-center justify-center transition-colors ${
          index === 0 
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
            : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 dark:text-blue-400'
        }`}
        title="Déplacer vers le haut"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      
      <button 
        type="button" 
        onClick={() => moveDown(index)}
        disabled={index === sections.length - 1}
        className={`rounded-md h-8 w-8 flex items-center justify-center transition-colors ${
          index === sections.length - 1 
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
            : 'text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 dark:text-blue-400'
        }`}
        title="Déplacer vers le bas"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* En-tête */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Gestion des sections
        </h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Personnalisez l&rsquo;affichage et l&rsquo;organisation des sections de votre plan d&rsquo;affaires.
        </p>
      </div>
      
      {sections.length === 0 ? (
        <div className="p-10 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Aucune section configurée</h4>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Commencez par ajouter les sections par défaut pour votre plan d&rsquo;affaires</p>
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm"
          >
            Initialiser avec les sections par défaut
          </button>
        </div>
      ) : (
        <div className="p-5 space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={`group rounded-lg overflow-hidden border ${
                section.visible 
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900'
              }`}
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleOpenSection(section)}
                    className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
                    title={`Ouvrir la section ${section.name}`}
                  >
                    {renderSectionIcon(section.icon, section.color)}
                    <span 
                      className={`font-medium ${
                        section.visible 
                          ? 'text-gray-800 dark:text-gray-200' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {section.name}
                    </span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`visible-${section.id}`}
                      className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded transition duration-150 ease-in-out focus:ring-blue-500"
                      checked={section.visible}
                      onChange={() => toggleVisibility(index)}
                    />
                    <label 
                      htmlFor={`visible-${section.id}`} 
                      className="ml-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      Visible
                    </label>
                  </div>
                  
                  {renderDropdownButtons(index)}
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-sm">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <p className="text-blue-700 dark:text-blue-300">
                Cliquez sur une section pour l&apos;ouvrir. Notez que certaines sections peuvent ne pas être encore implémentées.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Pied de page avec boutons */}
      <div className="flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={resetToDefault}
          className="flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Réinitialiser
        </button>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
