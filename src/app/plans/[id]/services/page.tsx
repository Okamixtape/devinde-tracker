'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BusinessPlanData, ServicesData } from "@/app/services/interfaces/dataModels";
import { getBusinessPlanService } from '@/app/services/serviceFactory';

// Interface pour le service avec typages plus précis
interface Service {
  id?: string;
  name: string;
  description: string;
  hourlyRate?: number;
  packagePrice?: number;
  estimatedHours?: number;
  category?: string;
}

export default function ServicesPage() {
  const params = useParams();
  const id = params.id as string;
  const businessPlanService = getBusinessPlanService();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [businessPlan, setBusinessPlan] = useState<BusinessPlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // States pour l'édition
  const [isEditingOfferings, setIsEditingOfferings] = useState<boolean>(false);
  const [isEditingTechnologies, setIsEditingTechnologies] = useState<boolean>(false);
  const [isEditingProcess, setIsEditingProcess] = useState<boolean>(false);
  
  // States pour les valeurs en édition
  const [editedOfferings, setEditedOfferings] = useState<string[]>([]);
  const [editedTechnologies, setEditedTechnologies] = useState<string[]>([]);
  const [editedProcess, setEditedProcess] = useState<string[]>([]);
  const [newOffering, setNewOffering] = useState<string>('');
  const [newTechnology, setNewTechnology] = useState<string>('');
  const [newProcess, setNewProcess] = useState<string>('');
  
  useEffect(() => {
    const loadBusinessPlan = async () => {
      setLoading(true);
      try {
        const result = await businessPlanService.getItem(id);
        if (result.success && result.data) {
          setBusinessPlan(result.data);
          // Initialiser les états d'édition avec les données actuelles
          setEditedOfferings(result.data.services?.offerings || []);
          setEditedTechnologies(result.data.services?.technologies || []);
          setEditedProcess(result.data.services?.process || []);
          
          // Tenter de récupérer les détails des services
          let detailedServices: Service[] = [];
          
          // Vérifier si les détails existent dans le stockage local
          const servicesDetailsKey = `businessPlan_${id}_servicesDetails`;
          const savedDetailsJSON = localStorage.getItem(servicesDetailsKey);
          
          if (savedDetailsJSON) {
            try {
              // Utiliser les détails existants
              detailedServices = JSON.parse(savedDetailsJSON);
              console.log('Détails des services chargés :', detailedServices);
            } catch (e) {
              console.error('Erreur lors du chargement des détails des services:', e);
              // En cas d'erreur, créer des objets Service de base
              detailedServices = (result.data.services?.offerings || []).map((offering: string, index: number) => ({
                id: `service-${index}`,
                name: offering,
                description: "Description détaillée à remplir",
                category: "Prestation",
                hourlyRate: 0,
                packagePrice: 0,
                estimatedHours: 0
              }));
            }
          } else {
            // Créer des objets Service de base à partir des offerings si aucun détail n'existe
            detailedServices = (result.data.services?.offerings || []).map((offering: string, index: number) => ({
              id: `service-${index}`,
              name: offering,
              description: "Description détaillée à remplir",
              category: "Prestation",
              hourlyRate: 0,
              packagePrice: 0,
              estimatedHours: 0
            }));
          }
          
          setServices(detailedServices);
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
  const handleServiceDetailsSubmit = async () => {
    if (currentServiceIndex !== null && currentService) {
      // Mise à jour du service dans la liste des services
      const updatedServices = [...services];
      updatedServices[currentServiceIndex] = currentService;
      setServices(updatedServices);
      
      // Sauvegarder immédiatement les modifications 
      // pour éviter la perte de données si l'utilisateur ne clique pas sur Enregistrer après
      const servicesDetailsKey = `businessPlan_${id}_servicesDetails`;
      localStorage.setItem(servicesDetailsKey, JSON.stringify(updatedServices));
      console.log('Détails du service mis à jour :', currentService);
      
      // Mettre à jour le nom de l'offre dans la liste principale si celui-ci a changé
      const updatedOfferings = [...editedOfferings];
      updatedOfferings[currentServiceIndex] = currentService.name;
      setEditedOfferings(updatedOfferings);
      
      // Fermer le modal
      setShowServiceDetails(false);
      setCurrentServiceIndex(null);
    }
  };

  const saveChanges = async (section: 'offerings' | 'technologies' | 'process') => {
    if (!businessPlan) return;
    
    try {
      // Mettre à jour les services avec les détails
      let updatedServices: ServicesData;
      
      if (section === 'offerings') {
        // Extraire les noms de services pour la sauvegarde dans le format attendu
        const serviceNames = services.map(service => service.name);
        updatedServices = {
          ...businessPlan.services,
          offerings: serviceNames
        };
        
        const updatedBusinessPlan = {
          ...businessPlan,
          services: updatedServices
        };
        
        // 1. Sauvegarder les données de base dans le business plan
        const result = await businessPlanService.updateItem(id, updatedBusinessPlan);
        
        // 2. Sauvegarder séparément les détails des services
        const servicesDetailsKey = `businessPlan_${id}_servicesDetails`;
        localStorage.setItem(servicesDetailsKey, JSON.stringify(services));
        console.log('Détails des services sauvegardés :', services);
        
        if (result.success) {
          setBusinessPlan(updatedBusinessPlan);
          setIsEditingOfferings(false);
        } else {
          setError(result.error?.message || 'Erreur lors de la mise à jour');
        }
      } else {
        // Pour les autres sections, conserver le comportement actuel
        updatedServices = {
          ...businessPlan.services,
          [section]: section === 'technologies' ? editedTechnologies : editedProcess
        };
        
        const updatedBusinessPlan = {
          ...businessPlan,
          services: updatedServices
        };
        
        const result = await businessPlanService.updateItem(id, updatedBusinessPlan);
        
        if (result.success) {
          setBusinessPlan(updatedBusinessPlan);
          // Réinitialiser les états d'édition
          if (section === 'technologies') setIsEditingTechnologies(false);
          if (section === 'process') setIsEditingProcess(false);
        } else {
          setError(result.error?.message || 'Erreur lors de la mise à jour');
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur s\'est produite lors de la sauvegarde');
    }
  };
  
  // State pour les services complets (avec détails)
  const [services, setServices] = useState<Service[]>([]);
  const [currentServiceIndex, setCurrentServiceIndex] = useState<number | null>(null);
  const [currentService, setCurrentService] = useState<Service>({
    name: '',
    description: '',
    hourlyRate: undefined,
    packagePrice: undefined,
    estimatedHours: undefined,
    category: ''
  });
  const [showServiceDetails, setShowServiceDetails] = useState(false);
  
  // Fonctions pour gérer les éléments (ajout, suppression, etc.)
  const addItem = (type: 'offerings' | 'technologies' | 'process') => {
    const value = type === 'offerings' ? newOffering : 
                type === 'technologies' ? newTechnology : newProcess;
    
    if (!value.trim()) return;
    
    if (type === 'offerings') {
      // Ajouter une nouvelle prestation avec juste le nom
      const newService: Service = {
        id: `service-${Date.now()}`,
        name: value,
        description: 'Description détaillée à remplir',
        category: 'Prestation'
      };
      setServices([...services, newService]);
      setEditedOfferings([...editedOfferings, value]);
      setNewOffering('');
    } else if (type === 'technologies') {
      setEditedTechnologies([...editedTechnologies, value]);
      setNewTechnology('');
    } else {
      setEditedProcess([...editedProcess, value]);
      setNewProcess('');
    }
  };
  
  const removeItem = (type: 'offerings' | 'technologies' | 'process', index: number) => {
    if (type === 'offerings') {
      setEditedOfferings(editedOfferings.filter((_, i) => i !== index));
    } else if (type === 'technologies') {
      setEditedTechnologies(editedTechnologies.filter((_, i) => i !== index));
    } else {
      setEditedProcess(editedProcess.filter((_, i) => i !== index));
    }
  };
  
  const updateItem = (type: 'offerings' | 'technologies' | 'process', index: number, value: string) => {
    if (type === 'offerings') {
      const newOfferings = [...editedOfferings];
      newOfferings[index] = value;
      setEditedOfferings(newOfferings);
    } else if (type === 'technologies') {
      const newTechnologies = [...editedTechnologies];
      newTechnologies[index] = value;
      setEditedTechnologies(newTechnologies);
    } else {
      const newProcess = [...editedProcess];
      newProcess[index] = value;
      setEditedProcess(newProcess);
    }
  };
  
  // Render a service card
  const renderServiceCard = (service: Service) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {service.name}
            </h3>
            <div className="flex items-center">
              {service.hourlyRate && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                  {service.hourlyRate}€/h
                </span>
              )}
              {service.packagePrice && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  {service.packagePrice}€
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
          
          {service.estimatedHours && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Durée estimée: {service.estimatedHours} heure{service.estimatedHours > 1 ? 's' : ''}
            </div>
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
  
  // Récupérer les données de services
  const serviceOfferings = businessPlan.services?.offerings || [];
  
  // Ces données sont maintenant récupérées directement dans les composants d'édition
  
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
          Vos prestations, technologies maîtrisées et méthodologies de travail sont listées ici.
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
        <p className="text-blue-700 dark:text-blue-400">
          Pour gérer vos services, utilisez le menu &quot;Gérer les services&quot; qui vous permettra 
          d&apos;ajouter, modifier ou supprimer des services.
        </p>
      </div>
      
      {(editedOfferings.length === 0 && editedTechnologies.length === 0 && !isEditingOfferings && !isEditingTechnologies && !isEditingProcess) ? (
        <div className="text-center py-10">
          <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun service défini
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Vous n&apos;avez pas encore défini de services pour ce plan d&apos;affaires.
          </p>
          <button
            onClick={() => {
              setIsEditingOfferings(true);
              setIsEditingTechnologies(true);
              setIsEditingProcess(true);
            }}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md shadow-sm font-medium transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              Commencer à définir vos services
            </span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Services/Prestations */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                Prestations
              </h2>
              <button
                onClick={() => setIsEditingOfferings(!isEditingOfferings)}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md"
              >
                {isEditingOfferings ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            
            {isEditingOfferings ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ajoutez ou modifiez vos prestations. Chaque prestation devrait être claire et concise.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingOfferings(false)}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md flex items-center"
                      title="Annuler les modifications"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </button>
                    <button
                      onClick={() => saveChanges('offerings')}
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
                          onChange={(e) => updateItem('offerings', index, e.target.value)}
                          className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        />
                        <button
                          onClick={() => {
                            setCurrentServiceIndex(index);
                            setCurrentService(services[index]);
                            setShowServiceDetails(true);
                          }}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                          title="Modifier les détails de cette prestation"
                        >
                          Détails
                        </button>
                        <button
                          onClick={() => removeItem('offerings', index)}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-r-md transition-colors"
                          title="Supprimer cette prestation"
                        >
                          Supprimer
                        </button>
                      </div>
                      <div className="p-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 truncate">
                        {services[index]?.description || "Description non renseignée"}
                        {(services[index]?.hourlyRate || services[index]?.packagePrice) && (
                          <span className="ml-2 font-medium">
                            {services[index]?.hourlyRate && `${services[index]?.hourlyRate}€/h`}
                            {services[index]?.hourlyRate && services[index]?.packagePrice && " ou "}
                            {services[index]?.packagePrice && `${services[index]?.packagePrice}€`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Formulaire d'ajout */}
                <div className="flex items-center mt-6">
                  <input
                    type="text"
                    placeholder="Nouvelle prestation..."
                    value={newOffering}
                    onChange={(e) => setNewOffering(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && newOffering.trim() && addItem('offerings')}
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={() => addItem('offerings')}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-r-md transition-colors flex items-center"
                    disabled={!newOffering.trim()}
                    title="Ajouter cette prestation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-2 rounded">
                  <span className="font-medium">Astuce :</span> Appuyez sur Entrée après avoir saisi une nouvelle prestation pour l&apos;ajouter rapidement.
                </div>
              </div>
            ) : serviceOfferings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, index) => (
                  <div key={service.id || index}>
                    {renderServiceCard(service)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucune prestation définie. Cliquez sur &apos;Modifier&apos; pour ajouter des prestations.</p>
              </div>
            )}
          </div>
          
          {/* Technologies */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                Technologies
              </h2>
              <button
                onClick={() => setIsEditingTechnologies(!isEditingTechnologies)}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md"
              >
                {isEditingTechnologies ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            
            {isEditingTechnologies ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ajoutez ou modifiez les technologies que vous maîtrisez.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingTechnologies(false)}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md flex items-center"
                      title="Annuler les modifications"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </button>
                    <button
                      onClick={() => saveChanges('technologies')}
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
                
                {/* Liste des technologies existantes */}
                <div className="space-y-2 mb-4">
                  {editedTechnologies.map((tech, index) => (
                    <div key={index} className="flex items-center group">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => updateItem('technologies', index, e.target.value)}
                        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                      <button
                        onClick={() => removeItem('technologies', index)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-r-md transition-colors"
                        title="Supprimer cette technologie"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Formulaire d'ajout */}
                <div className="flex items-center mt-6">
                  <input
                    type="text"
                    placeholder="Nouvelle technologie..."
                    value={newTechnology}
                    onChange={(e) => setNewTechnology(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && newTechnology.trim() && addItem('technologies')}
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={() => addItem('technologies')}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-r-md transition-colors flex items-center"
                    disabled={!newTechnology.trim()}
                    title="Ajouter cette technologie"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-2 rounded">
                  <span className="font-medium">Astuce :</span> Appuyez sur Entrée après avoir saisi une nouvelle technologie pour l&apos;ajouter rapidement.
                </div>
              </div>
            ) : editedTechnologies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {editedTechnologies.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucune technologie définie. Cliquez sur &apos;Modifier&apos; pour ajouter des technologies.</p>
              </div>
            )}
          </div>
          
          {/* Process */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                Méthodologie de travail
              </h2>
              <button
                onClick={() => setIsEditingProcess(!isEditingProcess)}
                className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-md"
              >
                {isEditingProcess ? 'Annuler' : 'Modifier'}
              </button>
            </div>
            
            {isEditingProcess ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Décrivez votre méthodologie de travail étape par étape.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditingProcess(false)}
                      className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md flex items-center"
                      title="Annuler les modifications"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </button>
                    <button
                      onClick={() => saveChanges('process')}
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
                
                {/* Liste des étapes existantes */}
                <div className="space-y-2 mb-4">
                  {editedProcess.map((step, index) => (
                    <div key={index} className="flex items-center group">
                      <div className="mr-2 text-gray-500 dark:text-gray-400 font-semibold min-w-[2rem] text-center">{index + 1}.</div>
                      <input
                        type="text"
                        value={step}
                        onChange={(e) => updateItem('process', index, e.target.value)}
                        className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                      />
                      <button
                        onClick={() => removeItem('process', index)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-r-md transition-colors"
                        title="Supprimer cette étape"
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Formulaire d'ajout */}
                <div className="flex items-center mt-6">
                  <div className="mr-2 text-gray-500 dark:text-gray-400 font-semibold min-w-[2rem] text-center">{editedProcess.length + 1}.</div>
                  <input
                    type="text"
                    placeholder="Nouvelle étape..."
                    value={newProcess}
                    onChange={(e) => setNewProcess(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && newProcess.trim() && addItem('process')}
                    className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  />
                  <button
                    onClick={() => addItem('process')}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-r-md transition-colors flex items-center"
                    disabled={!newProcess.trim()}
                    title="Ajouter cette étape"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter
                  </button>
                </div>
                
                <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/10 p-2 rounded">
                  <span className="font-medium">Astuce :</span> Appuyez sur Entrée après avoir saisi une nouvelle étape pour l&apos;ajouter rapidement.
                </div>
              </div>
            ) : editedProcess.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
                <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
                  {editedProcess.map((step, index) => (
                    <li key={index} className="pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
                <p className="text-gray-500 dark:text-gray-400">Aucune méthodologie définie. Cliquez sur &apos;Modifier&apos; pour ajouter des étapes.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal pour les détails du service */}
      {showServiceDetails && currentService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détails de la prestation</h3>
              <button 
                onClick={() => setShowServiceDetails(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de la prestation</label>
                <input
                  type="text"
                  value={currentService.name}
                  onChange={(e) => setCurrentService({...currentService, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={currentService.description}
                  onChange={(e) => setCurrentService({...currentService, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 h-32"
                  placeholder="Description détaillée de votre prestation..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tarif horaire (€)</label>
                  <input
                    type="number"
                    value={currentService.hourlyRate || ''}
                    onChange={(e) => setCurrentService({...currentService, hourlyRate: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="ex: 50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix forfaitaire (€)</label>
                  <input
                    type="number"
                    value={currentService.packagePrice || ''}
                    onChange={(e) => setCurrentService({...currentService, packagePrice: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="ex: 500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durée estimée (heures)</label>
                  <input
                    type="number"
                    value={currentService.estimatedHours || ''}
                    onChange={(e) => setCurrentService({...currentService, estimatedHours: e.target.value ? Number(e.target.value) : undefined})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="ex: 10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select
                    value={currentService.category || ''}
                    onChange={(e) => setCurrentService({...currentService, category: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="Prestation">Prestation</option>
                    <option value="Développement">Développement</option>
                    <option value="Design">Design</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Formation">Formation</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowServiceDetails(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-md"
                >
                  Annuler
                </button>
                <button
                  onClick={handleServiceDetailsSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
