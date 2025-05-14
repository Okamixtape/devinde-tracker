'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BusinessPlanData } from "@/app/services/interfaces/dataModels";
import { getBusinessPlanService } from '@/app/services/serviceFactory';
import { useToast } from '@/app/components/error';

// Importation des composants modulaires
import ServiceList from './components/ServiceList';
import { Service } from './components/ServiceCard';
import { saveServiceDetailsToLocalStorage, loadServiceDetailsFromLocalStorage } from './components/serviceUtils';

export default function ServicesPage() {
  const params = useParams();
  const id = params.id as string;
  const businessPlanService = getBusinessPlanService();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // States pour les services
  const [services, setServices] = useState<Service[]>([]);
  const [editedOfferings, setEditedOfferings] = useState<string[]>([]);
  
  useEffect(() => {
    const loadBusinessPlan = async () => {
      setLoading(true);
      try {
        const result = await businessPlanService.getItem(id);
        if (result.success && result.data) {
          setBusinessPlan(result.data);
          
          // Initialiser les offres
          setEditedOfferings(result.data.services?.offerings || []);
          
          // Charger les détails des services
          const loadedServices = loadServiceDetailsFromLocalStorage(
            id, 
            result.data.services?.offerings || []
          );
          setServices(loadedServices);
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
  
  // Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    if (!businessPlan) return;
    
    // Vérification des données 
    const validEditedOfferings = editedOfferings.filter(offering => offering.trim() !== '');
    setEditedOfferings(validEditedOfferings);
    
    // Mise à jour du business plan
    const updatedServices = {
      offerings: validEditedOfferings,
      // Conserver les technologies et process existants si présents
      technologies: businessPlan.services?.technologies || [],
      process: businessPlan.services?.process || []
    };
    
    const updatedBusinessPlan = {
      ...businessPlan,
      services: updatedServices
    };
    
    try {
      setIsSubmitting(true);
      const result = await businessPlanService.updateItem(id, updatedBusinessPlan);
      
      if (result.success) {
        setBusinessPlan(updatedBusinessPlan);
        
        // Mise à jour du localStorage
        // Filtrer les services pour qu'ils correspondent aux offerings
        const validServices = services.filter((service, index) => 
          service.name && 
          index < validEditedOfferings.length && 
          validEditedOfferings[index].trim() !== ''
        );
        
        // Mise à jour des noms
        const updatedServicesWithNames = validServices.map((service, index) => ({
          ...service,
          name: validEditedOfferings[index]
        }));
        
        saveServiceDetailsToLocalStorage(id, updatedServicesWithNames);
        setServices(updatedServicesWithNames);
        
        showSuccess('Les modifications ont été enregistrées avec succès.', 'Succès');
      } else {
        const errorMessage = result.error?.message || 'Erreur inconnue';
        showError(`Une erreur est survenue lors de l'enregistrement des modifications: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showError(`Une erreur s'est produite lors de la sauvegarde: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mise à jour des services
  const handleUpdateServices = (updatedServices: Service[]) => {
    setServices(updatedServices);
  };
  
  // Mise à jour des offerings
  const handleUpdateOfferings = (updatedOfferings: string[]) => {
    setEditedOfferings(updatedOfferings);
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
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Services
      </h1>
      
      <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
        <h2 className="text-lg font-medium mb-3 text-blue-800 dark:text-blue-300">
          À propos des Services
        </h2>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          Cette section présente la liste détaillée des services que vous proposez en tant qu&apos;indépendant.
          Créez, modifiez et gérez vos prestations pour les présenter à vos clients.
        </p>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          Une offre de services bien structurée est essentielle pour :
        </p>
        <ul className="list-disc pl-6 text-blue-700 dark:text-blue-400 mb-2 space-y-1">
          <li>Communiquer clairement votre expertise</li>
          <li>Aider les clients à comprendre ce que vous pouvez faire pour eux</li>
          <li>Établir votre positionnement et votre tarification</li>
          <li>Faciliter le processus de vente et de négociation</li>
        </ul>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          Note : Vos technologies maîtrisées et votre méthodologie de travail sont maintenant visibles dans 
          la section "Pitch" pour optimiser votre présentation à vos clients potentiels.
        </p>
      </div>
      
      <ServiceList 
        services={services}
        editedOfferings={editedOfferings}
        onUpdateServices={handleUpdateServices}
        onUpdateOfferings={handleUpdateOfferings}
        onSaveChanges={handleSaveChanges}
      />
    </div>
  );
}
