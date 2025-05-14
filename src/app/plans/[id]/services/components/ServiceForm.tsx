'use client';

import React, { useState, useEffect } from 'react';
import { Service } from './ServiceCard';

interface ServiceFormProps {
  service: Service;
  onSave: (updatedService: Service) => void;
  onCancel: () => void;
}

/**
 * Composant formulaire pour l'édition d'un service
 */
const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave, onCancel }) => {
  const [currentService, setCurrentService] = useState<Service>(service);
  const [billingMode, setBillingMode] = useState<'hourly' | 'package' | 'subscription'>(
    (service.billingMode as 'hourly' | 'package' | 'subscription') || 'hourly'
  );

  // Mettre à jour le mode de facturation quand il change
  useEffect(() => {
    // Lorsque le mode de facturation change, réinitialiser les valeurs non pertinentes
    // tout en conservant la durée estimée pour les deux modes
    if (billingMode === 'hourly') {
      // Si on passe au mode horaire, réinitialiser les prix forfaitaires et d'abonnement
      setCurrentService(prev => ({
        ...prev,
        billingMode,
        packagePrice: undefined,  // Réinitialiser le prix forfaitaire
        subscriptionPrice: undefined, // Réinitialiser le prix d'abonnement
        subscriptionDuration: undefined, // Réinitialiser la durée d'abonnement
        // La durée estimée est conservée
      }));
    } else if (billingMode === 'package') {
      // Si on passe au mode forfait, réinitialiser le taux horaire et les données d'abonnement
      setCurrentService(prev => ({
        ...prev,
        billingMode,
        hourlyRate: undefined,  // Réinitialiser le taux horaire
        subscriptionPrice: undefined, // Réinitialiser le prix d'abonnement
        subscriptionDuration: undefined, // Réinitialiser la durée d'abonnement
        // La durée estimée est conservée
      }));
    } else if (billingMode === 'subscription') {
      // Si on passe au mode abonnement, réinitialiser le taux horaire et le prix forfaitaire
      setCurrentService(prev => ({
        ...prev,
        billingMode,
        hourlyRate: undefined,  // Réinitialiser le taux horaire
        packagePrice: undefined,  // Réinitialiser le prix forfaitaire
        // La durée estimée est conservée (représente les heures mensuelles)
      }));
    }
  }, [billingMode]);

  // Fonction pour mettre à jour les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Pour les champs numériques, convertir en nombres
    if (name === 'hourlyRate' || name === 'packagePrice' || name === 'subscriptionPrice' || name === 'subscriptionDuration' || name === 'estimatedHours') {
      setCurrentService({
        ...currentService,
        [name]: value === '' ? undefined : Number(value)
      });
    } else {
      setCurrentService({
        ...currentService,
        [name]: value
      });
    }
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation de base
    if (!currentService.name || currentService.name.trim() === '') {
      alert('Le nom du service est requis');
      return;
    }
    
    // Si mode horaire, vérifier le taux horaire
    if (billingMode === 'hourly' && (!currentService.hourlyRate || currentService.hourlyRate <= 0)) {
      alert('Le taux horaire doit être supérieur à 0');
      return;
    }
    
    // Si mode forfait, vérifier le prix du forfait
    if (billingMode === 'package' && (!currentService.packagePrice || currentService.packagePrice <= 0)) {
      alert('Le prix du forfait doit être supérieur à 0');
      return;
    }
    
    // Si mode abonnement, vérifier le prix d'abonnement et la durée
    if (billingMode === 'subscription') {
      if (!currentService.subscriptionPrice || currentService.subscriptionPrice <= 0) {
        alert('Le prix mensuel de l\'abonnement doit être supérieur à 0');
        return;
      }
      if (!currentService.subscriptionDuration || currentService.subscriptionDuration <= 0) {
        alert('La durée d\'engagement doit être supérieure à 0');
        return;
      }
    }
    
    // Envoyer le service mis à jour au parent
    onSave(currentService);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        {service.id ? 'Modifier le service' : 'Ajouter un service'}
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Nom du service <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={currentService.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={currentService.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Catégorie
          </label>
          <input
            type="text"
            name="category"
            value={currentService.category || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                     dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            Mode de facturation
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="billingMode"
                checked={billingMode === 'hourly'}
                onChange={() => setBillingMode('hourly')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Taux horaire</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="billingMode"
                checked={billingMode === 'package'}
                onChange={() => setBillingMode('package')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Forfait</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name="billingMode"
                checked={billingMode === 'subscription'}
                onChange={() => setBillingMode('subscription')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">Abonnement</span>
            </label>
          </div>
        </div>
        
        {billingMode === 'hourly' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Taux horaire (€/h) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={currentService.hourlyRate || ''}
                onChange={handleChange}
                min="0"
                step="5"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Heures estimées
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={currentService.estimatedHours || ''}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
        
        {billingMode === 'package' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Prix du forfait (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="packagePrice"
                value={currentService.packagePrice || ''}
                onChange={handleChange}
                min="0"
                step="100"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Heures estimées
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={currentService.estimatedHours || ''}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
        
        {billingMode === 'subscription' && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Prix mensuel (€/mois) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="subscriptionPrice"
                value={currentService.subscriptionPrice || ''}
                onChange={handleChange}
                min="0"
                step="10"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Durée d&apos;engagement (mois) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="subscriptionDuration"
                value={currentService.subscriptionDuration || ''}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Heures estimées par mois
              </label>
              <input
                type="number"
                name="estimatedHours"
                value={currentService.estimatedHours || ''}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;
