'use client';

import React, { useState } from 'react';
import { Service } from './ServiceCard';
import ServiceCard from './ServiceCard';
import ServiceForm from './ServiceForm';

interface ServiceListProps {
  services: Service[];
  editedOfferings: string[];
  onUpdateServices: (updatedServices: Service[]) => void;
  onUpdateOfferings: (updatedOfferings: string[]) => void;
  onSaveChanges: () => void;
}

/**
 * Composant pour afficher et gérer la liste des services
 */
const ServiceList: React.FC<ServiceListProps> = ({
  services,
  editedOfferings,
  onUpdateServices,
  onUpdateOfferings,
  onSaveChanges
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number | null>(null);
  const [newOffering, setNewOffering] = useState<string>('');
  
  // Ouvrir le formulaire d'édition pour un service spécifique
  const handleEditService = (index: number) => {
    setCurrentServiceIndex(index);
  };
  
  // Gérer la soumission du formulaire de service
  const handleServiceSubmit = (updatedService: Service) => {
    if (currentServiceIndex !== null) {
      // Mettre à jour le service dans la liste
      const updatedServices = [...services];
      updatedServices[currentServiceIndex] = updatedService;
      
      // Générer un ID si nécessaire
      if (!updatedServices[currentServiceIndex].id) {
        updatedServices[currentServiceIndex].id = Date.now().toString();
      }
      
      // Mettre à jour le nom de l'offre dans la liste principale si celui-ci a changé
      const updatedOfferings = [...editedOfferings];
      updatedOfferings[currentServiceIndex] = updatedService.name;
      
      // Propager les changements au composant parent
      onUpdateServices(updatedServices);
      onUpdateOfferings(updatedOfferings);
      
      // Fermer le formulaire
      setCurrentServiceIndex(null);
    }
  };
  
  // Ajouter un nouveau service
  const handleAddService = () => {
    if (!newOffering.trim()) return;
    
    // Créer un nouveau service avec juste le nom
    const newService: Service = {
      id: `service-${Date.now()}`,
      name: newOffering,
      description: 'Description détaillée à remplir',
      category: 'Prestation',
      hourlyRate: 0,
      packagePrice: 0,
      estimatedHours: 0,
      billingMode: 'hourly'
    };
    
    // Mettre à jour les listes
    onUpdateServices([...services, newService]);
    onUpdateOfferings([...editedOfferings, newOffering]);
    
    // Réinitialiser le champ de saisie
    setNewOffering('');
  };
  
  // Supprimer un service
  const handleRemoveService = (index: number) => {
    const updatedServices = services.filter((_, i) => i !== index);
    const updatedOfferings = editedOfferings.filter((_, i) => i !== index);
    
    onUpdateServices(updatedServices);
    onUpdateOfferings(updatedOfferings);
  };
  
  // Mettre à jour le nom d'un service
  const handleUpdateServiceName = (index: number, value: string) => {
    const updatedOfferings = [...editedOfferings];
    updatedOfferings[index] = value;
    onUpdateOfferings(updatedOfferings);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Prestations
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md"
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>
      
      {isEditing ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ajoutez ou modifiez vos prestations. Chaque prestation devrait être claire et concise.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md flex items-center"
                title="Annuler les modifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Annuler
              </button>
              <button
                onClick={onSaveChanges}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md flex items-center"
                title="Enregistrer les modifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enregistrer
              </button>
            </div>
          </div>
          
          {/* Liste des prestations existantes */}
          <div className="space-y-2 mb-4">
            {editedOfferings.map((offering, index) => (
              <div key={index} className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="flex items-center group bg-gray-50 dark:bg-gray-800 p-2">
                  <input
                    type="text"
                    value={offering}
                    onChange={(e) => handleUpdateServiceName(index, e.target.value)}
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={() => handleEditService(index)}
                    className="p-2 bg-blue-500 text-white"
                    title="Modifier les détails"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleRemoveService(index)}
                    className="p-2 bg-red-500 text-white rounded-r-md"
                    title="Supprimer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Ajout d'une nouvelle prestation */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newOffering}
              onChange={(e) => setNewOffering(e.target.value)}
              placeholder="Nouvelle prestation..."
              className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
            <button
              onClick={handleAddService}
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
              disabled={!newOffering.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service, index) => (
            <ServiceCard key={service.id || index} service={service} />
          ))}
          
          {services.length === 0 && (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">
                Aucun service défini. Cliquez sur &quot;Modifier&quot; pour ajouter des services.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Modal de détails du service */}
      {currentServiceIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <ServiceForm
              service={services[currentServiceIndex]}
              onSave={handleServiceSubmit}
              onCancel={() => setCurrentServiceIndex(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceList;
