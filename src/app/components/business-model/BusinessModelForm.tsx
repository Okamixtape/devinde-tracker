'use client';

import React, { useState, useEffect } from 'react';
import { useBusinessModel } from '@/app/hooks/useBusinessModel';
import { PricingModel, HourlyRateModel, PackageModel, SubscriptionModel, BusinessModelSimulationParams } from '@/app/interfaces/BusinessModelInterfaces';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { DollarSign, Clock, Package, Repeat, Edit, Trash, Plus, Save, AlertCircle } from 'lucide-react';

// Type de formulaire actif
type FormType = 'hourly' | 'package' | 'subscription';

// Props du composant
interface BusinessModelFormProps {
  planId: string;
  onSaved?: () => void;
}

/**
 * Formulaire principal du modèle économique
 * 
 * Permet de configurer les différentes options tarifaires :
 * - Taux horaires
 * - Forfaits
 * - Abonnements
 */
const BusinessModelForm: React.FC<BusinessModelFormProps> = ({ planId, onSaved }) => {
  // Utiliser le hook de gestion du modèle économique
  const {
    pricing,
    isLoading,
    error,
    dirty,
    saveBusinessModel,
    updatePricing,
    loadBusinessModel
  } = useBusinessModel({ planId, autoLoad: true });

  // États locaux
  const [activeForm, setActiveForm] = useState<FormType>('hourly');
  const [formData, setFormData] = useState<HourlyRateModel | PackageModel | SubscriptionModel | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Effet pour initialiser le formulaire lors du changement d'onglet
  useEffect(() => {
    resetForm();
  }, [activeForm]);

  // Réinitialiser le formulaire
  const resetForm = () => {
    setEditingIndex(null);
    
    if (activeForm === 'hourly') {
      setFormData({
        id: `hourly-${Date.now()}`,
        title: '',
        description: '',
        ratePerHour: 0,
        currency: '€',
        specialConditions: '',
        minHours: 1
      });
    } else if (activeForm === 'package') {
      setFormData({
        id: `package-${Date.now()}`,
        title: '',
        description: '',
        price: 0,
        currency: '€',
        duration: '',
        features: [],
        popular: false
      });
    } else if (activeForm === 'subscription') {
      setFormData({
        id: `subscription-${Date.now()}`,
        title: '',
        description: '',
        monthlyPrice: 0,
        annualPrice: 0,
        currency: '€',
        billingFrequency: 'monthly',
        features: [],
        cancellationTerms: '',
        popular: false
      });
    }
  };

  // Gérer les changements dans les champs de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      // Gérer les champs numériques
      if (type === 'number') {
        return { ...prev, [name]: parseFloat(value) || 0 };
      }
      
      // Gérer les champs checkbox
      if (type === 'checkbox') {
        const isChecked = (e.target as HTMLInputElement).checked;
        return { ...prev, [name]: isChecked };
      }
      
      // Pour tous les autres champs
      return { ...prev, [name]: value };
    });
  };

  // Gérer l'ajout d'une caractéristique (pour forfaits et abonnements)
  const handleAddFeature = (feature: string) => {
    if (!feature.trim() || !formData) return;
    
    if ('features' in formData) {
      setFormData({
        ...formData,
        features: [...formData.features, feature]
      });
    }
  };

  // Gérer la suppression d'une caractéristique
  const handleRemoveFeature = (index: number) => {
    if (!formData || !('features' in formData)) return;
    
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  // Éditer un élément existant
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    
    if (activeForm === 'hourly' && pricing?.hourlyRates[index]) {
      setFormData(pricing.hourlyRates[index]);
    } else if (activeForm === 'package' && pricing?.packages[index]) {
      setFormData(pricing.packages[index]);
    } else if (activeForm === 'subscription' && pricing?.subscriptions[index]) {
      setFormData(pricing.subscriptions[index]);
    }
  };

  // Supprimer un élément
  const handleDelete = (index: number) => {
    if (!pricing) return;
    
    // Créer une copie du modèle de tarification actuel
    const updatedPricing: PricingModel = { ...pricing };
    
    // Supprimer l'élément spécifique
    if (activeForm === 'hourly') {
      updatedPricing.hourlyRates = updatedPricing.hourlyRates.filter((_, i) => i !== index);
    } else if (activeForm === 'package') {
      updatedPricing.packages = updatedPricing.packages.filter((_, i) => i !== index);
    } else if (activeForm === 'subscription') {
      updatedPricing.subscriptions = updatedPricing.subscriptions.filter((_, i) => i !== index);
    }
    
    // Mettre à jour le modèle de tarification
    updatePricing(updatedPricing);
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !pricing) return;
    
    // Créer une copie du modèle de tarification actuel
    const updatedPricing: PricingModel = { ...pricing };
    
    if (activeForm === 'hourly') {
      const hourlyRate = formData as HourlyRateModel;
      
      // Si nous éditons un élément existant
      if (editingIndex !== null) {
        updatedPricing.hourlyRates[editingIndex] = hourlyRate;
      } else {
        // Sinon, ajout d'un nouvel élément
        updatedPricing.hourlyRates = [...updatedPricing.hourlyRates, hourlyRate];
      }
    } else if (activeForm === 'package') {
      const packageItem = formData as PackageModel;
      
      if (editingIndex !== null) {
        updatedPricing.packages[editingIndex] = packageItem;
      } else {
        updatedPricing.packages = [...updatedPricing.packages, packageItem];
      }
    } else if (activeForm === 'subscription') {
      const subscriptionItem = formData as SubscriptionModel;
      
      if (editingIndex !== null) {
        updatedPricing.subscriptions[editingIndex] = subscriptionItem;
      } else {
        updatedPricing.subscriptions = [...updatedPricing.subscriptions, subscriptionItem];
      }
    }
    
    // Mettre à jour le modèle de tarification
    updatePricing(updatedPricing);
    
    // Réinitialiser le formulaire
    resetForm();
  };

  // Sauvegarder les modifications
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const result = await saveBusinessModel();
      
      if (result) {
        // Notifier le parent que les données ont été sauvegardées
        if (onSaved) onSaved();
        
        // Recharger les données pour s'assurer qu'elles sont à jour
        await loadBusinessModel(planId);
      } else {
        setSaveError("Échec de la sauvegarde. Veuillez réessayer.");
      }
    } catch (err) {
      setSaveError(`Erreur lors de la sauvegarde: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Si les données sont en cours de chargement
  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si une erreur s'est produite
  if (error) {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erreur</h3>
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => loadBusinessModel(planId)}
          className={`${UI_CLASSES.BUTTON_SECONDARY} mt-4`}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Si les données de pricing ne sont pas disponibles
  if (!pricing) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-2">Aucune donnée disponible</h3>
        <p className="text-yellow-600 dark:text-yellow-400">Aucun modèle économique n'a été défini pour ce plan.</p>
        <button
          onClick={() => loadBusinessModel(planId)}
          className={`${UI_CLASSES.BUTTON_SECONDARY} mt-4`}
        >
          Charger les données
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onglets pour les différents types de tarification */}
      <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
        <button
          className={`py-3 px-4 flex items-center space-x-2 font-medium border-b-2 ${
            activeForm === 'hourly'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveForm('hourly')}
        >
          <Clock size={18} />
          <span>Taux horaires</span>
        </button>
        
        <button
          className={`py-3 px-4 flex items-center space-x-2 font-medium border-b-2 ${
            activeForm === 'package'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveForm('package')}
        >
          <Package size={18} />
          <span>Forfaits</span>
        </button>
        
        <button
          className={`py-3 px-4 flex items-center space-x-2 font-medium border-b-2 ${
            activeForm === 'subscription'
            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
            : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          onClick={() => setActiveForm('subscription')}
        >
          <Repeat size={18} />
          <span>Abonnements</span>
        </button>
      </div>

      {/* Affichage des éléments existants */}
      <div className="space-y-4">
        {activeForm === 'hourly' && (
          <>
            <h3 className={UI_CLASSES.HEADING_3}>Taux horaires</h3>
            {pricing.hourlyRates.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">Aucun taux horaire défini.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pricing.hourlyRates.map((rate, index) => (
                  <div 
                    key={rate.id || index}
                    className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">{rate.title}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {rate.ratePerHour} {rate.currency}/h
                    </div>
                    {rate.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rate.description}</p>
                    )}
                    {rate.minHours && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={14} className="mr-1" />
                        <span>Minimum {rate.minHours} heure{rate.minHours > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {rate.specialConditions && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span className="font-medium">Conditions: </span>
                        {rate.specialConditions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeForm === 'package' && (
          <>
            <h3 className={UI_CLASSES.HEADING_3}>Forfaits</h3>
            {pricing.packages.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">Aucun forfait défini.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pricing.packages.map((pkg, index) => (
                  <div 
                    key={pkg.id || index}
                    className={`${UI_CLASSES.CARD} border ${pkg.popular ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'} hover:border-blue-300 dark:hover:border-blue-700`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">{pkg.title}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {pkg.price} {pkg.currency}
                    </div>
                    {pkg.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{pkg.description}</p>
                    )}
                    {pkg.duration && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Durée: {pkg.duration}
                      </div>
                    )}
                    {pkg.features.length > 0 && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inclus:</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {pkg.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {pkg.popular && (
                      <div className="mt-2 inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                        Populaire
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeForm === 'subscription' && (
          <>
            <h3 className={UI_CLASSES.HEADING_3}>Abonnements</h3>
            {pricing.subscriptions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">Aucun abonnement défini.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pricing.subscriptions.map((sub, index) => (
                  <div 
                    key={sub.id || index}
                    className={`${UI_CLASSES.CARD} border ${sub.popular ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'} hover:border-purple-300 dark:hover:border-purple-700`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800 dark:text-white">{sub.title}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {sub.monthlyPrice} {sub.currency}/mois
                    </div>
                    {sub.annualPrice && sub.annualPrice > 0 && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Abonnement annuel: {sub.annualPrice} {sub.currency}/an
                      </div>
                    )}
                    {sub.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{sub.description}</p>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Facturation 
                      {sub.billingFrequency === 'monthly' && ' mensuelle'}
                      {sub.billingFrequency === 'quarterly' && ' trimestrielle'}
                      {sub.billingFrequency === 'biannual' && ' semestrielle'}
                      {sub.billingFrequency === 'annual' && ' annuelle'}
                    </div>
                    {sub.features.length > 0 && (
                      <div className="mt-2">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Inclus:</h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {sub.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {sub.cancellationTerms && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span className="font-medium">Conditions d'annulation: </span>
                        {sub.cancellationTerms}
                      </div>
                    )}
                    {sub.popular && (
                      <div className="mt-2 inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs font-medium rounded">
                        Populaire
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Formulaire pour ajouter/éditer un élément */}
      <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700 mt-6`}>
        <h3 className={UI_CLASSES.HEADING_3}>
          {editingIndex !== null ? 'Modifier' : 'Ajouter'} 
          {activeForm === 'hourly' && ' un taux horaire'}
          {activeForm === 'package' && ' un forfait'}
          {activeForm === 'subscription' && ' un abonnement'}
        </h3>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Champs communs à tous les types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className={UI_CLASSES.LABEL}>Titre</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData?.title || ''}
                onChange={handleInputChange}
                className={UI_CLASSES.INPUT}
                required
              />
            </div>
            
            <div>
              <label htmlFor="currency" className={UI_CLASSES.LABEL}>Devise</label>
              <select
                id="currency"
                name="currency"
                value={formData?.currency || '€'}
                onChange={handleInputChange}
                className={UI_CLASSES.INPUT}
              >
                <option value="€">Euro (€)</option>
                <option value="$">Dollar ($)</option>
                <option value="£">Livre (£)</option>
                <option value="CHF">Franc Suisse (CHF)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className={UI_CLASSES.LABEL}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData?.description || ''}
              onChange={handleInputChange}
              className={`${UI_CLASSES.INPUT} min-h-[100px]`}
              placeholder="Description détaillée..."
            />
          </div>
          
          {/* Champs spécifiques au type Taux horaire */}
          {activeForm === 'hourly' && formData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ratePerHour" className={UI_CLASSES.LABEL}>Taux horaire</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="ratePerHour"
                    name="ratePerHour"
                    min="0"
                    step="0.01"
                    value={(formData as HourlyRateModel).ratePerHour || ''}
                    onChange={handleInputChange}
                    className={`${UI_CLASSES.INPUT} pl-10`}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="minHours" className={UI_CLASSES.LABEL}>Heures minimales</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="number"
                    id="minHours"
                    name="minHours"
                    min="1"
                    step="1"
                    value={(formData as HourlyRateModel).minHours || ''}
                    onChange={handleInputChange}
                    className={`${UI_CLASSES.INPUT} pl-10`}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="specialConditions" className={UI_CLASSES.LABEL}>Conditions spéciales</label>
                <input
                  type="text"
                  id="specialConditions"
                  name="specialConditions"
                  value={(formData as HourlyRateModel).specialConditions || ''}
                  onChange={handleInputChange}
                  className={UI_CLASSES.INPUT}
                  placeholder="Ex: Réduction de 10% pour les projets de plus de 40h"
                />
              </div>
            </div>
          )}
          
          {/* Champs spécifiques au type Forfait */}
          {activeForm === 'package' && formData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className={UI_CLASSES.LABEL}>Prix du forfait</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      step="0.01"
                      value={(formData as PackageModel).price || ''}
                      onChange={handleInputChange}
                      className={`${UI_CLASSES.INPUT} pl-10`}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="duration" className={UI_CLASSES.LABEL}>Durée du forfait</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={(formData as PackageModel).duration || ''}
                    onChange={handleInputChange}
                    className={UI_CLASSES.INPUT}
                    placeholder="Ex: 2 semaines, 1 mois, etc."
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="popular"
                  name="popular"
                  checked={(formData as PackageModel).popular || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="popular" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Marquer comme populaire
                </label>
              </div>
              
              <div>
                <label className={UI_CLASSES.LABEL}>Caractéristiques incluses</label>
                <div className="space-y-2">
                  {(formData as PackageModel).features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex">
                    <input
                      type="text"
                      id="newFeature"
                      name="newFeature"
                      placeholder="Ajouter une caractéristique..."
                      className={`${UI_CLASSES.INPUT} flex-1 mr-2`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = document.getElementById('newFeature') as HTMLInputElement;
                        handleAddFeature(input.value);
                        input.value = '';
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Champs spécifiques au type Abonnement */}
          {activeForm === 'subscription' && formData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthlyPrice" className={UI_CLASSES.LABEL}>Prix mensuel</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="monthlyPrice"
                      name="monthlyPrice"
                      min="0"
                      step="0.01"
                      value={(formData as SubscriptionModel).monthlyPrice || ''}
                      onChange={handleInputChange}
                      className={`${UI_CLASSES.INPUT} pl-10`}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="annualPrice" className={UI_CLASSES.LABEL}>Prix annuel (facultatif)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="annualPrice"
                      name="annualPrice"
                      min="0"
                      step="0.01"
                      value={(formData as SubscriptionModel).annualPrice || ''}
                      onChange={handleInputChange}
                      className={`${UI_CLASSES.INPUT} pl-10`}
                      placeholder="Laissez vide s'il n'y a pas d'offre annuelle"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="billingFrequency" className={UI_CLASSES.LABEL}>Fréquence de facturation</label>
                  <select
                    id="billingFrequency"
                    name="billingFrequency"
                    value={(formData as SubscriptionModel).billingFrequency || 'monthly'}
                    onChange={handleInputChange}
                    className={UI_CLASSES.INPUT}
                  >
                    <option value="monthly">Mensuelle</option>
                    <option value="quarterly">Trimestrielle</option>
                    <option value="biannual">Semestrielle</option>
                    <option value="annual">Annuelle</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="cancellationTerms" className={UI_CLASSES.LABEL}>Conditions d'annulation</label>
                  <input
                    type="text"
                    id="cancellationTerms"
                    name="cancellationTerms"
                    value={(formData as SubscriptionModel).cancellationTerms || ''}
                    onChange={handleInputChange}
                    className={UI_CLASSES.INPUT}
                    placeholder="Ex: Préavis de 30 jours"
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="popular"
                  name="popular"
                  checked={(formData as SubscriptionModel).popular || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600"
                />
                <label htmlFor="popular" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Marquer comme populaire
                </label>
              </div>
              
              <div>
                <label className={UI_CLASSES.LABEL}>Caractéristiques incluses</label>
                <div className="space-y-2">
                  {(formData as SubscriptionModel).features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex">
                    <input
                      type="text"
                      id="newFeature"
                      name="newFeature"
                      placeholder="Ajouter une caractéristique..."
                      className={`${UI_CLASSES.INPUT} flex-1 mr-2`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = document.getElementById('newFeature') as HTMLInputElement;
                        handleAddFeature(input.value);
                        input.value = '';
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className={UI_CLASSES.BUTTON_SECONDARY}
            >
              Annuler
            </button>
            
            <button
              type="submit"
              className={UI_CLASSES.BUTTON_PRIMARY}
            >
              {editingIndex !== null ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>

      {/* Bouton de sauvegarde global */}
      {dirty && (
        <div className="mt-6 flex justify-end">
          {saveError && (
            <div className="flex-1 flex items-center text-red-600 dark:text-red-400 mr-4">
              <AlertCircle size={16} className="mr-1" />
              <span>{saveError}</span>
            </div>
          )}
          
          <button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className={`${UI_CLASSES.BUTTON_PRIMARY} flex items-center`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                <span>Sauvegarde en cours...</span>
              </>
            ) : (
              <>
                <Save size={18} className="mr-2" />
                <span>Sauvegarder les modifications</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessModelForm;