'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DocumentType } from '@/app/interfaces/invoicing';

/**
 * Interface pour la structure d'un service
 */
export interface Service {
  id?: string;
  name: string;
  description: string;
  hourlyRate?: number;
  packagePrice?: number;
  subscriptionPrice?: number;  // Prix mensuel de l'abonnement
  subscriptionDuration?: number; // Durée de l'abonnement en mois
  estimatedHours?: number;
  category?: string;
  billingMode?: 'hourly' | 'package' | 'subscription';
}

interface ServiceCardProps {
  service: Service;
}

/**
 * Composant pour afficher une carte de service avec ses détails
 */
const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const router = useRouter();
  const params = useParams();
  const businessPlanId = params?.id as string;
  
  // État pour contrôler l'affichage du menu d'action
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Fonction pour créer un projet à partir de ce service
  const handleCreateProject = () => {
    // Encode le service comme JSON et l'ajoute comme paramètre d'URL
    const serviceData = encodeURIComponent(JSON.stringify(service));
    router.push(`/plans/${businessPlanId}/finances?createProject=true&serviceData=${serviceData}`);
  };
  
  // Fonction pour créer un document (devis ou facture)
  const handleCreateDocument = (type: DocumentType) => {
    // Encode le service comme JSON et l'ajoute comme paramètre d'URL
    const serviceData = encodeURIComponent(JSON.stringify(service));
    router.push(`/plans/${businessPlanId}/documents/new?type=${type}&serviceId=${service.id}&serviceData=${serviceData}`);
    setShowActionMenu(false);
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {service.name}
          </h3>
          <div className="flex items-center">
            {/* N'afficher que le tarif horaire si le mode de facturation est horaire */}
            {service.billingMode === 'hourly' && service.hourlyRate && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                {service.hourlyRate}€/h
              </span>
            )}
            {/* N'afficher que le forfait si le mode de facturation est forfaitaire */}
            {service.billingMode === 'package' && service.packagePrice && (
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                {service.packagePrice}€
              </span>
            )}
            {/* N'afficher que l'abonnement si le mode de facturation est abonnement */}
            {service.billingMode === 'subscription' && service.subscriptionPrice && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
                {service.subscriptionPrice}€/mois
              </span>
            )}
            {service.category && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                {service.category}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300">
          {service.description}
        </p>
        
        {/* Afficher la durée estimée pour les modes horaire et forfait */}
        {service.estimatedHours && service.estimatedHours > 0 && service.billingMode !== 'subscription' && (
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Durée estimée: {service.estimatedHours} heure{service.estimatedHours > 1 ? 's' : ''}
            
            {/* Afficher le taux horaire implicite pour les forfaits fixes */}
            {service.billingMode === 'package' && service.packagePrice && service.packagePrice > 0 && (
              <span className="ml-2 text-sm text-blue-500 dark:text-blue-400">
                ({Math.round(service.packagePrice / service.estimatedHours)}€/h)
              </span>
            )}
          </div>
        )}
        
        {/* Afficher la durée d'abonnement pour le mode abonnement */}
        {service.billingMode === 'subscription' && service.subscriptionDuration && (
          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Durée d&apos;engagement: {service.subscriptionDuration} mois
            {service.estimatedHours && service.estimatedHours > 0 && (
              <span className="ml-2 text-sm text-purple-500 dark:text-purple-400">
                ({service.estimatedHours} heure{service.estimatedHours > 1 ? 's' : ''}/mois)
              </span>
            )}
          </div>
        )}
        
        {/* Boutons d'action pour le service */}
        <div className="mt-4 flex justify-end space-x-2 relative">
          {/* Menu d'action avec boutons de documents */}
          {showActionMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-2 min-w-48 z-10">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => handleCreateDocument(DocumentType.QUOTE)}
                  className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded transition-colors text-left"
                  aria-label="Créer un devis pour ce service"
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Créer un devis
                  </span>
                </button>
                <button
                  onClick={() => handleCreateDocument(DocumentType.INVOICE)}
                  className="text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded transition-colors text-left"
                  aria-label="Créer une facture pour ce service"
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Créer une facture
                  </span>
                </button>
              </div>
            </div>
          )}
          
          {/* Bouton d'action principal */}
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded transition-colors"
            aria-label="Actions pour ce service"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              Actions
            </span>
          </button>
          
          {/* Bouton pour créer un projet */}
          <button
            onClick={handleCreateProject}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
            aria-label="Créer un projet client à partir de ce service"
          >
            Créer un projet client
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
