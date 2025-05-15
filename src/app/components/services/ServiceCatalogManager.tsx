'use client';

import React, { useState, useEffect } from 'react';
import { 
  ServiceType, 
  PricingType, 
  UIServiceListItem,
  UIService,
  ServiceCategory,
  UIServiceCatalog
} from '@/app/interfaces/services/service-catalog';
import { UI_CLASSES } from '@/app/styles/ui-classes';
import { 
  Plus, 
  Edit, 
  Trash, 
  Filter, 
  Search, 
  Clock, 
  Package, 
  Repeat, 
  Settings, 
  Tag, 
  AlertCircle, 
  Save
} from 'lucide-react';

interface ServiceCatalogManagerProps {
  planId: string;
  initialData?: UIServiceCatalog;
  onSave: (service: UIService) => Promise<boolean>;
  onDelete: (serviceId: string) => Promise<boolean>;
  onCreateCategory: (category: ServiceCategory) => Promise<boolean>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * Gestionnaire de catalogue de services
 * 
 * Permet de créer, modifier et supprimer des services ainsi que de gérer les catégories.
 * Affiche la liste des services avec des options de filtrage et de tri.
 */
const ServiceCatalogManager: React.FC<ServiceCatalogManagerProps> = ({
  planId,
  initialData,
  onSave,
  onDelete,
  onCreateCategory,
  isLoading = false,
  error = null
}) => {
  // États locaux pour les données
  const [services, setServices] = useState<UIServiceListItem[]>(initialData?.services || []);
  const [categories, setCategories] = useState<ServiceCategory[]>(initialData?.categories || []);
  const [stats, setStats] = useState(initialData?.stats || { activeServicesCount: 0, categoriesCount: 0 });
  
  // État pour le service en cours d'édition
  const [editingService, setEditingService] = useState<UIService | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  
  // États pour le filtrage et la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<ServiceType | 'all'>('all');
  const [pricingFilter, setPricingFilter] = useState<PricingType | 'all'>('all');
  const [showInactiveServices, setShowInactiveServices] = useState(false);
  
  // État pour la nouvelle catégorie
  const [newCategory, setNewCategory] = useState({ name: '', description: '', order: 0 });
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  // Gestion des notifications internes
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // État interne de traitement
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mettre à jour les données locales lorsque les données initiales changent
  useEffect(() => {
    if (initialData) {
      setServices(initialData.services);
      setCategories(initialData.categories);
      setStats(initialData.stats);
    }
  }, [initialData]);
  
  // Services filtrés en fonction des critères
  const filteredServices = services.filter(service => {
    // Filtre de recherche
    const matchesSearch = searchQuery === '' || 
      service.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filtre par catégorie
    const matchesCategory = categoryFilter === 'all' || 
      service.category === categoryFilter;
    
    // Filtre par type
    const matchesType = typeFilter === 'all' || 
      service.type === typeFilter;
    
    // Filtre par type de tarification
    const matchesPricing = pricingFilter === 'all' || 
      service.pricingType === pricingFilter;
    
    // Filtre des services inactifs
    const matchesActive = showInactiveServices || service.isActive;
    
    return matchesSearch && matchesCategory && matchesType && matchesPricing && matchesActive;
  });
  
  // Gestionnaire pour commencer l'édition d'un service
  const handleEditService = (serviceId: string) => {
    // Dans une implémentation réelle, nous ferions un appel d'API pour obtenir les détails complets du service
    // Ici, nous simulons cela en trouvant le service dans la liste des services
    const serviceToEdit = services.find(s => s.id === serviceId);
    
    if (serviceToEdit) {
      // Créer un objet UIService complet à partir du service de liste
      // Dans une implémentation réelle, nous ferions un appel d'API pour obtenir ces données
      const fullService: UIService = {
        id: serviceToEdit.id,
        name: serviceToEdit.name,
        description: 'Description détaillée du service',
        type: serviceToEdit.type,
        category: serviceToEdit.category,
        tags: ['tag1', 'tag2'],
        isActive: serviceToEdit.isActive,
        pricingType: serviceToEdit.pricingType,
        pricing: {
          type: serviceToEdit.pricingType,
          hourlyRate: serviceToEdit.pricingType === PricingType.HOURLY ? 50 : undefined,
          fixedPrice: serviceToEdit.pricingType === PricingType.FIXED ? 1000 : undefined,
          recurringPrice: serviceToEdit.pricingType === PricingType.RECURRING ? 200 : undefined,
          priceRange: serviceToEdit.pricingType === PricingType.CUSTOM ? { min: 500, max: 2000 } : undefined
        }
      };
      
      setEditingService(fullService);
      setShowServiceForm(true);
    }
  };
  
  // Gestionnaire pour créer un nouveau service
  const handleCreateService = () => {
    // Créer un service vide
    const newService: UIService = {
      id: '',
      name: '',
      description: '',
      type: ServiceType.DEVELOPMENT,
      category: categories.length > 0 ? categories[0].id : '',
      tags: [],
      isActive: true,
      pricingType: PricingType.HOURLY,
      pricing: {
        type: PricingType.HOURLY,
        hourlyRate: 50
      }
    };
    
    setEditingService(newService);
    setShowServiceForm(true);
  };
  
  // Gestionnaire pour sauvegarder un service
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingService) return;
    
    setIsProcessing(true);
    
    try {
      const success = await onSave(editingService);
      
      if (success) {
        // Mettre à jour l'interface utilisateur
        // Dans une implémentation réelle, nous rechargerions les données du serveur
        
        if (editingService.id) {
          // Mise à jour d'un service existant
          setServices(prev => prev.map(s => 
            s.id === editingService.id 
              ? {
                  id: editingService.id,
                  name: editingService.name,
                  type: editingService.type,
                  category: editingService.category,
                  pricingType: editingService.pricing.type,
                  price: formatPriceForDisplay(editingService),
                  isActive: editingService.isActive
                }
              : s
          ));
        } else {
          // Création d'un nouveau service
          // Dans une implémentation réelle, le serveur fournirait l'ID
          const newId = `temp-${Date.now()}`;
          
          setServices(prev => [
            ...prev,
            {
              id: newId,
              name: editingService.name,
              type: editingService.type,
              category: editingService.category,
              pricingType: editingService.pricing.type,
              price: formatPriceForDisplay(editingService),
              isActive: editingService.isActive
            }
          ]);
        }
        
        // Mettre à jour les statistiques
        updateStats();
        
        // Réinitialiser le formulaire
        setShowServiceForm(false);
        setEditingService(null);
        
        // Afficher une notification de succès
        setNotification({
          message: `Service ${editingService.id ? 'mis à jour' : 'créé'} avec succès`,
          type: 'success'
        });
        
        // Cacher la notification après 3 secondes
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: 'Erreur lors de la sauvegarde du service',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setNotification({
        message: 'Erreur lors de la sauvegarde du service',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Gestionnaire pour supprimer un service
  const handleDeleteService = async (serviceId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      setIsProcessing(true);
      
      try {
        const success = await onDelete(serviceId);
        
        if (success) {
          // Mettre à jour l'interface utilisateur
          setServices(prev => prev.filter(s => s.id !== serviceId));
          
          // Mettre à jour les statistiques
          updateStats();
          
          // Afficher une notification de succès
          setNotification({
            message: 'Service supprimé avec succès',
            type: 'success'
          });
          
          // Cacher la notification après 3 secondes
          setTimeout(() => setNotification(null), 3000);
        } else {
          setNotification({
            message: 'Erreur lors de la suppression du service',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setNotification({
          message: 'Erreur lors de la suppression du service',
          type: 'error'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  // Gestionnaire pour créer une nouvelle catégorie
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    
    try {
      // Créer une nouvelle catégorie avec un ID temporaire
      const newCategoryWithId: ServiceCategory = {
        ...newCategory,
        id: `category-${Date.now()}`
      };
      
      const success = await onCreateCategory(newCategoryWithId);
      
      if (success) {
        // Mettre à jour l'interface utilisateur
        setCategories(prev => [...prev, newCategoryWithId]);
        
        // Mettre à jour les statistiques
        setStats(prev => ({
          ...prev,
          categoriesCount: prev.categoriesCount + 1
        }));
        
        // Réinitialiser le formulaire
        setNewCategory({ name: '', description: '', order: 0 });
        setShowCategoryForm(false);
        
        // Afficher une notification de succès
        setNotification({
          message: 'Catégorie créée avec succès',
          type: 'success'
        });
        
        // Cacher la notification après 3 secondes
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          message: 'Erreur lors de la création de la catégorie',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      setNotification({
        message: 'Erreur lors de la création de la catégorie',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Mettre à jour les statistiques
  const updateStats = () => {
    const activeCount = services.filter(s => s.isActive).length;
    
    setStats(prev => ({
      ...prev,
      activeServicesCount: activeCount,
      categoriesCount: categories.length
    }));
  };
  
  // Formater le prix pour l'affichage
  const formatPriceForDisplay = (service: UIService): string => {
    switch (service.pricing.type) {
      case PricingType.HOURLY:
        return `${service.pricing.hourlyRate || 0}€/h`;
      
      case PricingType.FIXED:
        return `${service.pricing.fixedPrice || 0}€`;
      
      case PricingType.RECURRING:
        return `${service.pricing.recurringPrice || 0}€/mois`;
      
      case PricingType.CUSTOM:
        return service.pricing.priceRange 
          ? `${service.pricing.priceRange.min}-${service.pricing.priceRange.max}€` 
          : 'Sur devis';
      
      default:
        return 'Prix non défini';
    }
  };
  
  // Si en cours de chargement
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
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className={UI_CLASSES.HEADING_2}>Catalogue de Services</h2>
          <p className={UI_CLASSES.TEXT_SMALL}>
            Gérez vos offres de services et leurs tarifs
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">Services actifs</p>
            <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{stats.activeServicesCount}</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
            <p className="text-xs text-purple-600 dark:text-purple-400">Catégories</p>
            <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">{stats.categoriesCount}</p>
          </div>
          
          {stats.averageHourlyRate && (
            <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg">
              <p className="text-xs text-green-600 dark:text-green-400">Taux horaire moyen</p>
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">{stats.averageHourlyRate}€</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Notification */}
      {notification && (
        <div className={`p-3 rounded-lg ${
          notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
        }`}>
          <div className="flex items-center">
            <AlertCircle size={18} className="mr-2" />
            <p>{notification.message}</p>
          </div>
        </div>
      )}
      
      {/* Barre d'outils et filtres */}
      <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700`}>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-grow">
            {/* Recherche */}
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un service..."
                className={`${UI_CLASSES.INPUT} pl-10`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filtres */}
            <div className="flex flex-wrap gap-2">
              {/* Filtre par catégorie */}
              <select
                className={UI_CLASSES.INPUT}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              
              {/* Filtre par type */}
              <select
                className={UI_CLASSES.INPUT}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as ServiceType | 'all')}
              >
                <option value="all">Tous les types</option>
                {Object.values(ServiceType).map(type => (
                  <option key={type} value={type}>
                    {type === ServiceType.DEVELOPMENT ? 'Développement' :
                     type === ServiceType.DESIGN ? 'Design' :
                     type === ServiceType.CONSULTING ? 'Conseil' :
                     type === ServiceType.TRAINING ? 'Formation' :
                     type === ServiceType.MAINTENANCE ? 'Maintenance' :
                     type === ServiceType.SUPPORT ? 'Support' :
                     'Autre'}
                  </option>
                ))}
              </select>
              
              {/* Filtre par type de tarification */}
              <select
                className={UI_CLASSES.INPUT}
                value={pricingFilter}
                onChange={(e) => setPricingFilter(e.target.value as PricingType | 'all')}
              >
                <option value="all">Tous les tarifs</option>
                {Object.values(PricingType).map(type => (
                  <option key={type} value={type}>
                    {type === PricingType.HOURLY ? 'Taux horaire' :
                     type === PricingType.FIXED ? 'Prix fixe' :
                     type === PricingType.RECURRING ? 'Abonnement' :
                     'Sur mesure'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Bouton pour créer une catégorie */}
            <button
              type="button"
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className={UI_CLASSES.BUTTON_SECONDARY}
              disabled={isProcessing}
            >
              <Tag size={16} className="mr-1" />
              {showCategoryForm ? 'Annuler' : 'Catégorie'}
            </button>
            
            {/* Bouton pour ajouter un service */}
            <button
              type="button"
              onClick={handleCreateService}
              className={UI_CLASSES.BUTTON_PRIMARY}
              disabled={isProcessing}
            >
              <Plus size={16} className="mr-1" />
              Service
            </button>
          </div>
        </div>
        
        {/* Afficher les services inactifs */}
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="showInactive"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={showInactiveServices}
            onChange={() => setShowInactiveServices(!showInactiveServices)}
          />
          <label htmlFor="showInactive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Afficher les services inactifs
          </label>
        </div>
      </div>
      
      {/* Formulaire de création de catégorie */}
      {showCategoryForm && (
        <form 
          onSubmit={handleCreateCategory}
          className={`${UI_CLASSES.CARD} border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20`}
        >
          <h3 className={UI_CLASSES.HEADING_3}>Nouvelle catégorie</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div>
              <label htmlFor="categoryName" className={UI_CLASSES.LABEL}>Nom</label>
              <input
                type="text"
                id="categoryName"
                className={UI_CLASSES.INPUT}
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label htmlFor="categoryOrder" className={UI_CLASSES.LABEL}>Ordre d'affichage</label>
              <input
                type="number"
                id="categoryOrder"
                className={UI_CLASSES.INPUT}
                value={newCategory.order}
                onChange={(e) => setNewCategory(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                min="0"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="categoryDescription" className={UI_CLASSES.LABEL}>Description</label>
              <textarea
                id="categoryDescription"
                className={`${UI_CLASSES.INPUT} min-h-[100px]`}
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowCategoryForm(false)}
              className={UI_CLASSES.BUTTON_SECONDARY}
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={UI_CLASSES.BUTTON_PRIMARY}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  Enregistrement...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save size={16} className="mr-1" />
                  Enregistrer
                </span>
              )}
            </button>
          </div>
        </form>
      )}
      
      {/* Formulaire d'édition de service */}
      {showServiceForm && editingService && (
        <form 
          onSubmit={handleSaveService}
          className={`${UI_CLASSES.CARD} border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20`}
        >
          <h3 className={UI_CLASSES.HEADING_3}>
            {editingService.id ? 'Modifier le service' : 'Nouveau service'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            {/* Informations de base */}
            <div>
              <label htmlFor="serviceName" className={UI_CLASSES.LABEL}>Nom du service</label>
              <input
                type="text"
                id="serviceName"
                className={UI_CLASSES.INPUT}
                value={editingService.name}
                onChange={(e) => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="serviceCategory" className={UI_CLASSES.LABEL}>Catégorie</label>
              <select
                id="serviceCategory"
                className={UI_CLASSES.INPUT}
                value={editingService.category}
                onChange={(e) => setEditingService(prev => prev ? { ...prev, category: e.target.value } : null)}
                required
              >
                <option value="" disabled>Sélectionnez une catégorie</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="serviceType" className={UI_CLASSES.LABEL}>Type de service</label>
              <select
                id="serviceType"
                className={UI_CLASSES.INPUT}
                value={editingService.type}
                onChange={(e) => setEditingService(prev => prev ? { ...prev, type: e.target.value as ServiceType } : null)}
                required
              >
                {Object.values(ServiceType).map(type => (
                  <option key={type} value={type}>
                    {type === ServiceType.DEVELOPMENT ? 'Développement' :
                     type === ServiceType.DESIGN ? 'Design' :
                     type === ServiceType.CONSULTING ? 'Conseil' :
                     type === ServiceType.TRAINING ? 'Formation' :
                     type === ServiceType.MAINTENANCE ? 'Maintenance' :
                     type === ServiceType.SUPPORT ? 'Support' :
                     'Autre'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="pricingType" className={UI_CLASSES.LABEL}>Type de tarification</label>
              <select
                id="pricingType"
                className={UI_CLASSES.INPUT}
                value={editingService.pricing.type}
                onChange={(e) => {
                  const newPricingType = e.target.value as PricingType;
                  setEditingService(prev => {
                    if (!prev) return null;
                    
                    // Réinitialiser les champs de tarification en fonction du nouveau type
                    let pricing: UIService['pricing'] = { type: newPricingType };
                    
                    switch (newPricingType) {
                      case PricingType.HOURLY:
                        pricing.hourlyRate = 50;
                        break;
                      case PricingType.FIXED:
                        pricing.fixedPrice = 1000;
                        break;
                      case PricingType.RECURRING:
                        pricing.recurringPrice = 200;
                        break;
                      case PricingType.CUSTOM:
                        pricing.priceRange = { min: 500, max: 2000 };
                        break;
                    }
                    
                    return {
                      ...prev,
                      pricing,
                      pricingType: newPricingType
                    };
                  });
                }}
                required
              >
                {Object.values(PricingType).map(type => (
                  <option key={type} value={type}>
                    {type === PricingType.HOURLY ? 'Taux horaire' :
                     type === PricingType.FIXED ? 'Prix fixe' :
                     type === PricingType.RECURRING ? 'Abonnement' :
                     'Sur mesure'}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="serviceDescription" className={UI_CLASSES.LABEL}>Description</label>
              <textarea
                id="serviceDescription"
                className={`${UI_CLASSES.INPUT} min-h-[100px]`}
                value={editingService.description}
                onChange={(e) => setEditingService(prev => prev ? { ...prev, description: e.target.value } : null)}
                required
              ></textarea>
            </div>
            
            {/* Champs spécifiques au type de tarification */}
            <div className="md:col-span-2 p-4 border rounded-lg bg-white dark:bg-gray-800">
              <h4 className="text-md font-medium mb-4 flex items-center">
                {editingService.pricing.type === PricingType.HOURLY && <Clock size={18} className="mr-2 text-blue-500" />}
                {editingService.pricing.type === PricingType.FIXED && <Package size={18} className="mr-2 text-green-500" />}
                {editingService.pricing.type === PricingType.RECURRING && <Repeat size={18} className="mr-2 text-purple-500" />}
                {editingService.pricing.type === PricingType.CUSTOM && <Settings size={18} className="mr-2 text-orange-500" />}
                
                {editingService.pricing.type === PricingType.HOURLY && 'Détails du taux horaire'}
                {editingService.pricing.type === PricingType.FIXED && 'Détails du prix fixe'}
                {editingService.pricing.type === PricingType.RECURRING && 'Détails de l\'abonnement'}
                {editingService.pricing.type === PricingType.CUSTOM && 'Détails du tarif personnalisé'}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Champs pour taux horaire */}
                {editingService.pricing.type === PricingType.HOURLY && (
                  <>
                    <div>
                      <label htmlFor="hourlyRate" className={UI_CLASSES.LABEL}>Taux horaire (€)</label>
                      <input
                        type="number"
                        id="hourlyRate"
                        className={UI_CLASSES.INPUT}
                        value={editingService.pricing.hourlyRate || 0}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              hourlyRate: parseFloat(e.target.value)
                            }
                          };
                        })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="minimumHours" className={UI_CLASSES.LABEL}>Heures minimales (optionnel)</label>
                      <input
                        type="number"
                        id="minimumHours"
                        className={UI_CLASSES.INPUT}
                        value={(editingService as any).minimumHours || ''}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            minimumHours: parseInt(e.target.value) || undefined
                          };
                        })}
                        min="0"
                      />
                    </div>
                  </>
                )}
                
                {/* Champs pour prix fixe */}
                {editingService.pricing.type === PricingType.FIXED && (
                  <>
                    <div>
                      <label htmlFor="fixedPrice" className={UI_CLASSES.LABEL}>Prix fixe (€)</label>
                      <input
                        type="number"
                        id="fixedPrice"
                        className={UI_CLASSES.INPUT}
                        value={editingService.pricing.fixedPrice || 0}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              fixedPrice: parseFloat(e.target.value)
                            }
                          };
                        })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="estimatedHours" className={UI_CLASSES.LABEL}>Heures estimées (optionnel)</label>
                      <input
                        type="number"
                        id="estimatedHours"
                        className={UI_CLASSES.INPUT}
                        value={(editingService as any).estimatedHours || ''}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            estimatedHours: parseInt(e.target.value) || undefined
                          };
                        })}
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="estimatedTimeframe" className={UI_CLASSES.LABEL}>Délai estimé (optionnel)</label>
                      <input
                        type="text"
                        id="estimatedTimeframe"
                        className={UI_CLASSES.INPUT}
                        value={(editingService as any).estimatedTimeframe || ''}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            estimatedTimeframe: e.target.value
                          };
                        })}
                        placeholder="Ex: 2-3 semaines"
                      />
                    </div>
                  </>
                )}
                
                {/* Champs pour abonnement */}
                {editingService.pricing.type === PricingType.RECURRING && (
                  <>
                    <div>
                      <label htmlFor="recurringPrice" className={UI_CLASSES.LABEL}>Prix par période (€)</label>
                      <input
                        type="number"
                        id="recurringPrice"
                        className={UI_CLASSES.INPUT}
                        value={editingService.pricing.recurringPrice || 0}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              recurringPrice: parseFloat(e.target.value)
                            }
                          };
                        })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="billingCycle" className={UI_CLASSES.LABEL}>Cycle de facturation</label>
                      <select
                        id="billingCycle"
                        className={UI_CLASSES.INPUT}
                        value={(editingService as any).billingCycle || 'monthly'}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            billingCycle: e.target.value
                          };
                        })}
                      >
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                        <option value="quarterly">Trimestriel</option>
                        <option value="annually">Annuel</option>
                      </select>
                    </div>
                  </>
                )}
                
                {/* Champs pour tarif personnalisé */}
                {editingService.pricing.type === PricingType.CUSTOM && (
                  <>
                    <div>
                      <label htmlFor="minPrice" className={UI_CLASSES.LABEL}>Prix minimum (€)</label>
                      <input
                        type="number"
                        id="minPrice"
                        className={UI_CLASSES.INPUT}
                        value={editingService.pricing.priceRange?.min || 0}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              priceRange: {
                                min: parseFloat(e.target.value),
                                max: prev.pricing.priceRange?.max || 0
                              }
                            }
                          };
                        })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="maxPrice" className={UI_CLASSES.LABEL}>Prix maximum (€)</label>
                      <input
                        type="number"
                        id="maxPrice"
                        className={UI_CLASSES.INPUT}
                        value={editingService.pricing.priceRange?.max || 0}
                        onChange={(e) => setEditingService(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              priceRange: {
                                min: prev.pricing.priceRange?.min || 0,
                                max: parseFloat(e.target.value)
                              }
                            }
                          };
                        })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className={UI_CLASSES.LABEL}>Consultation requise</label>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          id="requiresConsultation"
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          checked={(editingService as any).requiresConsultation || false}
                          onChange={(e) => setEditingService(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              requiresConsultation: e.target.checked
                            };
                          })}
                        />
                        <label htmlFor="requiresConsultation" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Ce service nécessite une consultation préalable pour établir un devis
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Tags */}
            <div className="md:col-span-2">
              <label htmlFor="serviceTags" className={UI_CLASSES.LABEL}>Tags (séparés par des virgules)</label>
              <input
                type="text"
                id="serviceTags"
                className={UI_CLASSES.INPUT}
                value={editingService.tags.join(', ')}
                onChange={(e) => setEditingService(prev => {
                  if (!prev) return null;
                  const tagsStr = e.target.value;
                  const tags = tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag);
                  return {
                    ...prev,
                    tags
                  };
                })}
                placeholder="Ex: web, react, frontend"
              />
            </div>
            
            {/* Statut actif/inactif */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="serviceActive"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  checked={editingService.isActive}
                  onChange={(e) => setEditingService(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                />
                <label htmlFor="serviceActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Service actif
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                setShowServiceForm(false);
                setEditingService(null);
              }}
              className={UI_CLASSES.BUTTON_SECONDARY}
              disabled={isProcessing}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={UI_CLASSES.BUTTON_PRIMARY}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                  Enregistrement...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save size={16} className="mr-1" />
                  Enregistrer
                </span>
              )}
            </button>
          </div>
        </form>
      )}
      
      {/* Liste des services */}
      <div className={`${UI_CLASSES.CARD} border border-gray-200 dark:border-gray-700 overflow-hidden`}>
        {filteredServices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className={`${UI_CLASSES.TABLE} w-full`}>
              <thead>
                <tr>
                  <th className={UI_CLASSES.TABLE_HEADER}>Nom</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Catégorie</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Type</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Tarification</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Prix</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Statut</th>
                  <th className={UI_CLASSES.TABLE_HEADER}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map(service => (
                  <tr key={service.id} className={`${UI_CLASSES.TABLE_ROW} ${!service.isActive ? 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400' : ''}`}>
                    <td className={UI_CLASSES.TABLE_CELL}>{service.name}</td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      {categories.find(c => c.id === service.category)?.name || service.category}
                    </td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      {service.type === ServiceType.DEVELOPMENT ? 'Développement' :
                       service.type === ServiceType.DESIGN ? 'Design' :
                       service.type === ServiceType.CONSULTING ? 'Conseil' :
                       service.type === ServiceType.TRAINING ? 'Formation' :
                       service.type === ServiceType.MAINTENANCE ? 'Maintenance' :
                       service.type === ServiceType.SUPPORT ? 'Support' :
                       'Autre'}
                    </td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      {service.pricingType === PricingType.HOURLY ? 'Taux horaire' :
                       service.pricingType === PricingType.FIXED ? 'Prix fixe' :
                       service.pricingType === PricingType.RECURRING ? 'Abonnement' :
                       'Sur mesure'}
                    </td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      <span className="font-medium">{service.price}</span>
                    </td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        service.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {service.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className={UI_CLASSES.TABLE_CELL}>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditService(service.id)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier"
                          disabled={isProcessing}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                          disabled={isProcessing}
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              {services.length === 0
                ? 'Aucun service n\'a été créé. Cliquez sur "Ajouter" pour créer votre premier service.'
                : 'Aucun service ne correspond aux critères de recherche.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCatalogManager;