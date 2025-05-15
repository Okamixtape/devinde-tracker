'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Service as ServiceCardType } from './components/ServiceCard';
import { saveServiceDetailsToLocalStorage, loadServiceDetailsFromLocalStorage } from './components/serviceUtils';
import ServiceList from './components/ServiceList';
import { useToast } from '@/app/components/error';
import useServices from '@/app/hooks/useServices';
import { UIService, ServiceType, PricingType } from '@/app/interfaces/services/service-catalog';

// Components for availability management
import AvailabilityCalendar from '@/app/components/services/AvailabilityCalendar';

// Tab types
type TabType = 'services' | 'availability';

export default function ServicesPage() {
  const params = useParams();
  const id = params.id as string;
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  
  // States for legacy service handling
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [services, setServices] = useState<ServiceCardType[]>([]);
  const [editedOfferings, setEditedOfferings] = useState<string[]>([]);

  // Use the standardized hook for services
  const {
    businessPlanData,
    serviceCatalog,
    availabilitySettings,
    isLoading: servicesLoading,
    isSaving: servicesSaving,
    error: servicesError,
    loadServiceCatalog,
    loadAvailabilitySettings,
    saveService,
    deleteService,
    saveAvailabilitySettings,
    updateAvailabilityRule,
    addBlockedPeriod,
    deleteBlockedPeriod,
    getAvailability
  } = useServices({ planId: id, autoLoad: true });

  // Load business plan data for legacy compatibility
  useEffect(() => {
    if (!servicesLoading && businessPlanData) {
      // Initialize offerings from business plan
      const offerings = businessPlanData.services?.offerings || [];
      setEditedOfferings(offerings);
      
      // Load service details from localStorage
      const loadedServices = loadServiceDetailsFromLocalStorage(id, offerings);
      setServices(loadedServices);
      
      setLoading(false);
    }
  }, [id, businessPlanData, servicesLoading]);

  // Map legacy service format to standardized format
  const mapLegacyToStandardService = (legacyService: ServiceCardType): UIService => {
    return {
      id: legacyService.id || `service-${Date.now()}`,
      name: legacyService.name,
      description: legacyService.description,
      type: legacyService.category?.toLowerCase() === 'development' 
        ? ServiceType.DEVELOPMENT 
        : ServiceType.OTHER,
      pricingType: legacyService.billingMode === 'hourly' 
        ? PricingType.HOURLY 
        : legacyService.billingMode === 'package' 
          ? PricingType.FIXED 
          : PricingType.RECURRING,
      pricing: {
        type: legacyService.billingMode === 'hourly' 
          ? PricingType.HOURLY 
          : legacyService.billingMode === 'package' 
            ? PricingType.FIXED 
            : PricingType.RECURRING,
        hourlyRate: legacyService.hourlyRate,
        fixedPrice: legacyService.packagePrice,
        recurringPrice: legacyService.subscriptionPrice,
      },
      category: legacyService.category || 'Other',
      tags: [],
      isActive: true,
      estimatedHours: legacyService.estimatedHours,
      billingCycle: 'monthly',
      minimumCommitment: legacyService.subscriptionDuration,
      deliverables: [],
      isEditing: false
    };
  };

  // Function to save changes (legacy approach)
  const handleSaveChanges = async () => {
    if (!businessPlanData) return;
    
    // Validation of data
    const validEditedOfferings = editedOfferings.filter(offering => offering.trim() !== '');
    setEditedOfferings(validEditedOfferings);
    
    // Update business plan
    const updatedServices = {
      offerings: validEditedOfferings,
      // Keep existing technologies and process if present
      technologies: businessPlanData.services?.technologies || [],
      process: businessPlanData.services?.process || []
    };
    
    const updatedBusinessPlan = {
      ...businessPlanData,
      services: updatedServices
    };
    
    try {
      setIsSubmitting(true);
      
      // Also update using the standardized approach
      const validServices = services.filter((service, index) => 
        service.name && 
        index < validEditedOfferings.length && 
        validEditedOfferings[index].trim() !== ''
      );
      
      // Update names
      const updatedServicesWithNames = validServices.map((service, index) => ({
        ...service,
        name: validEditedOfferings[index]
      }));
      
      saveServiceDetailsToLocalStorage(id, updatedServicesWithNames);
      setServices(updatedServicesWithNames);
      
      // Convert and save each service using the standardized approach
      const savePromises = updatedServicesWithNames.map(service => 
        saveService(mapLegacyToStandardService(service))
      );
      
      await Promise.all(savePromises);
      
      showSuccess('Les modifications ont été enregistrées avec succès.', 'Succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      showError(`Une erreur s'est produite lors de la sauvegarde: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Service update handlers
  const handleUpdateServices = (updatedServices: ServiceCardType[]) => {
    setServices(updatedServices);
  };
  
  const handleUpdateOfferings = (updatedOfferings: string[]) => {
    setEditedOfferings(updatedOfferings);
  };

  // Availability management handlers
  const handleAvailabilityUpdate = async (startDate: Date, endDate: Date, isAvailable: boolean) => {
    // Implementation of availability update logic
    try {
      // Simple date formatter
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
      };
      
      // Example rule creation - this would be replaced with actual UI inputs
      const rule = {
        id: `date-range-${Date.now()}`,
        name: `Disponibilité ${isAvailable ? 'Ouverte' : 'Bloquée'}: ${startDate.toLocaleDateString()}`,
        type: 'dateRange' as const,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        status: isAvailable ? 'available' : 'unavailable',
        priority: 10,
        isActive: true
      };
      
      await updateAvailabilityRule(rule);
      showSuccess('Disponibilité mise à jour avec succès', 'Succès');
    } catch (error) {
      showError(`Erreur lors de la mise à jour de la disponibilité: ${
        error instanceof Error ? error.message : 'Erreur inconnue'
      }`);
    }
  };

  // Loading state
  if (loading || servicesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Error state
  if (servicesError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
        <p>{servicesError}</p>
      </div>
    );
  }
  
  // No business plan state
  if (!businessPlanData) {
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
          Cette section vous permet de gérer les services que vous proposez en tant qu&apos;indépendant.
          Créez, modifiez et gérez vos prestations et votre disponibilité pour les présenter à vos clients.
        </p>
        <p className="text-blue-700 dark:text-blue-400 mb-2">
          L&apos;onglet &quot;Services&quot; vous permet de définir vos offres, tarifs et description détaillée.
          L&apos;onglet &quot;Disponibilité&quot; vous permet de configurer vos plages de disponibilité et de
          bloquer des périodes pour les vacances ou autres engagements.
        </p>
      </div>
      
      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'services'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('services')}
            >
              Catalogue de Services
            </button>
          </li>
          <li className="mr-2">
            <button
              className={`inline-block p-4 border-b-2 rounded-t-lg ${
                activeTab === 'availability'
                  ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('availability')}
            >
              Disponibilité
            </button>
          </li>
        </ul>
      </div>
      
      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'services' && (
          <ServiceList 
            services={services}
            editedOfferings={editedOfferings}
            onUpdateServices={handleUpdateServices}
            onUpdateOfferings={handleUpdateOfferings}
            onSaveChanges={handleSaveChanges}
          />
        )}
        
        {activeTab === 'availability' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <AvailabilityCalendar 
              businessPlanId={id}
              availabilitySettings={availabilitySettings} 
              onUpdateAvailabilityRule={updateAvailabilityRule}
              onAddBlockedPeriod={addBlockedPeriod}
              onDeleteBlockedPeriod={deleteBlockedPeriod}
              onSaveSettings={saveAvailabilitySettings}
              fetchAvailability={(startDate, endDate) => {
                // This function should match the signature expected by the component
                return getAvailability(startDate, endDate);
              }}
              isLoading={servicesLoading || servicesSaving}
            />
          </div>
        )}
      </div>
    </div>
  );
}