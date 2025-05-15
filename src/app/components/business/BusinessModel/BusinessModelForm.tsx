'use client';

import React, { useState } from 'react';
import { Input } from '../../core/FormControls/Input';
import { useErrorHandling } from '../../../hooks/useErrorHandling';
import { AppError, ErrorCategory } from '../../../services/utils/errorHandling';
import { BusinessModelData, HourlyRate, ServicePackage } from '../../../services/interfaces/dataModels';

export interface BusinessModelFormProps {
  /** Données initiales du modèle d'affaires */
  initialData?: Partial<BusinessModelData>;
  /** Fonction appelée lors de la soumission du formulaire */
  onSubmit?: (data: BusinessModelData) => Promise<void>;
  /** Si le formulaire est en lecture seule */
  readOnly?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Formulaire de modèle d'affaires
 * Démontre l'utilisation des composants core et des hooks dans un composant business
 */
export const BusinessModelForm: React.FC<BusinessModelFormProps> = ({
  initialData,
  onSubmit,
  readOnly = false,
  className = ''
}) => {
  // Utiliser notre hook de gestion d'erreur
  const { handleError, error, withErrorHandling, isLoading, clearError } = useErrorHandling();
  
  // État du formulaire
  const [formData, setFormData] = useState<Partial<BusinessModelData>>(initialData || {
    hourlyRates: [],
    packages: [],
    subscriptions: []
  });
  
  // État pour le formulaire de taux horaire
  const [newRate, setNewRate] = useState<Partial<HourlyRate>>({
    serviceType: '',
    rate: 0,
    currency: 'EUR'
  });
  
  // État pour le formulaire de forfait
  const [newPackage, setNewPackage] = useState<Partial<ServicePackage>>({
    name: '',
    description: '',
    price: 0,
    currency: 'EUR',
    services: []
  });
  
  // Handler pour les champs de taux horaire
  const handleRateChange = (field: keyof HourlyRate, value: string | number) => {
    setNewRate(prev => ({
      ...prev,
      [field]: field === 'rate' ? Number(value) : value
    }));
  };
  
  // Handler pour les champs de forfait
  const handlePackageChange = (field: keyof ServicePackage, value: any) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: field === 'price' ? Number(value) : value
    }));
  };
  
  // Ajouter un nouveau taux horaire
  const addHourlyRate = () => {
    // Validation
    if (!newRate.serviceType) {
      handleError(new AppError('INVALID_INPUT', {
        message: 'Le type de service est requis',
        category: ErrorCategory.VALIDATION
      }));
      return;
    }
    
    if (newRate.rate <= 0) {
      handleError(new AppError('INVALID_INPUT', {
        message: 'Le taux horaire doit être supérieur à 0',
        category: ErrorCategory.VALIDATION
      }));
      return;
    }
    
    // Ajouter le taux
    setFormData(prev => ({
      ...prev,
      hourlyRates: [
        ...(prev.hourlyRates || []),
        { ...newRate, id: Date.now().toString() } as HourlyRate
      ]
    }));
    
    // Réinitialiser le formulaire
    setNewRate({
      serviceType: '',
      rate: 0,
      currency: 'EUR'
    });
    
    // Effacer les erreurs
    clearError();
  };
  
  // Ajouter un nouveau forfait
  const addPackage = () => {
    // Validation
    if (!newPackage.name) {
      handleError(new AppError('INVALID_INPUT', {
        message: 'Le nom du forfait est requis',
        category: ErrorCategory.VALIDATION
      }));
      return;
    }
    
    if (newPackage.price <= 0) {
      handleError(new AppError('INVALID_INPUT', {
        message: 'Le prix du forfait doit être supérieur à 0',
        category: ErrorCategory.VALIDATION
      }));
      return;
    }
    
    // Ajouter le forfait
    setFormData(prev => ({
      ...prev,
      packages: [
        ...(prev.packages || []),
        { ...newPackage, id: Date.now().toString() } as ServicePackage
      ]
    }));
    
    // Réinitialiser le formulaire
    setNewPackage({
      name: '',
      description: '',
      price: 0,
      currency: 'EUR',
      services: []
    });
    
    // Effacer les erreurs
    clearError();
  };
  
  // Soumettre le formulaire
  const submitForm = withErrorHandling(async () => {
    if (!onSubmit) return;
    
    // Validation du formulaire complet
    if (!(formData.hourlyRates?.length || formData.packages?.length)) {
      throw new AppError('INVALID_INPUT', {
        message: 'Vous devez ajouter au moins un taux horaire ou un forfait',
        category: ErrorCategory.VALIDATION
      });
    }
    
    // Soumettre les données
    await onSubmit(formData as BusinessModelData);
  });
  
  return (
    <div className={`space-y-8 ${className}`}>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Taux horaires</h2>
        
        {/* Liste des taux horaires */}
        {formData.hourlyRates && formData.hourlyRates.length > 0 ? (
          <div className="mb-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taux</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devise</th>
                  {!readOnly && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.hourlyRates.map((rate) => (
                  <tr key={rate.id || rate.serviceType}>
                    <td className="px-6 py-4 whitespace-nowrap">{rate.serviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rate.rate}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{rate.currency}</td>
                    {!readOnly && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            hourlyRates: prev.hourlyRates?.filter(r => r !== rate)
                          }))}
                        >
                          Supprimer
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic mb-6">Aucun taux horaire défini</p>
        )}
        
        {/* Formulaire d'ajout de taux horaire */}
        {!readOnly && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
            <Input
              label="Type de service"
              placeholder="Ex: Développement, Conception, Consultation"
              value={newRate.serviceType}
              onChange={(e) => handleRateChange('serviceType', e.target.value)}
              required
            />
            
            <Input
              label="Taux horaire"
              type="number"
              min="0"
              step="1"
              value={newRate.rate || ''}
              onChange={(e) => handleRateChange('rate', e.target.value)}
              required
            />
            
            <Input
              label="Devise"
              value={newRate.currency}
              onChange={(e) => handleRateChange('currency', e.target.value)}
              required
            />
            
            <div className="md:col-span-3 mt-2">
              <button
                type="button"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={addHourlyRate}
              >
                Ajouter ce taux
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Forfaits de service</h2>
        
        {/* Liste des forfaits */}
        {formData.packages && formData.packages.length > 0 ? (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.packages.map((pkg) => (
              <div key={pkg.id || pkg.name} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{pkg.name}</h3>
                    <p className="text-gray-600 mt-1">{pkg.description}</p>
                    <p className="font-semibold mt-2">
                      {pkg.price} {pkg.currency}
                    </p>
                    
                    {pkg.services && pkg.services.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700">Services inclus:</h4>
                        <ul className="list-disc pl-5 mt-1 text-sm">
                          {pkg.services.map((service, index) => (
                            <li key={index}>{service}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {!readOnly && (
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        packages: prev.packages?.filter(p => p !== pkg)
                      }))}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic mb-6">Aucun forfait défini</p>
        )}
        
        {/* Formulaire d'ajout de forfait */}
        {!readOnly && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
            <Input
              label="Nom du forfait"
              placeholder="Ex: Starter, Professional, Enterprise"
              value={newPackage.name || ''}
              onChange={(e) => handlePackageChange('name', e.target.value)}
              required
            />
            
            <Input
              label="Prix"
              type="number"
              min="0"
              step="1"
              value={newPackage.price || ''}
              onChange={(e) => handlePackageChange('price', e.target.value)}
              required
            />
            
            <Input
              label="Devise"
              value={newPackage.currency || ''}
              onChange={(e) => handlePackageChange('currency', e.target.value)}
              required
            />
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
                rows={3}
                value={newPackage.description || ''}
                onChange={(e) => handlePackageChange('description', e.target.value)}
                placeholder="Décrivez ce que ce forfait inclut"
              />
            </div>
            
            <div className="md:col-span-2 mt-2">
              <button
                type="button"
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={addPackage}
              >
                Ajouter ce forfait
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Erreur et bouton de soumission */}
      <div className="flex flex-col items-start">
        {error && (
          <div className="mb-4 w-full bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
            {error.message}
          </div>
        )}
        
        {!readOnly && onSubmit && (
          <button
            type="button"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={submitForm}
            disabled={isLoading}
          >
            {isLoading ? 'Enregistrement...' : 'Enregistrer le modèle d\'affaires'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BusinessModelForm;