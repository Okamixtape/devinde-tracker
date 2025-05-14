import { Service } from './ServiceCard';

/**
 * Sauvegarde les détails des services dans le localStorage
 * 
 * @param id Identifiant du business plan
 * @param services Liste des services à sauvegarder
 */
export const saveServiceDetailsToLocalStorage = (id: string, services: Service[]): void => {
  const servicesDetailsKey = `businessPlan_${id}_servicesDetails`;
  localStorage.setItem(servicesDetailsKey, JSON.stringify(services));
};

/**
 * Récupère les détails des services depuis le localStorage
 * 
 * @param id Identifiant du business plan
 * @param offerings Liste des offres de services (utilisée pour initialiser les services si nécessaire)
 * @returns Liste des services avec leurs détails
 */
export const loadServiceDetailsFromLocalStorage = (id: string, offerings: string[] = []): Service[] => {
  const servicesDetailsKey = `businessPlan_${id}_servicesDetails`;
  const savedDetailsJSON = localStorage.getItem(servicesDetailsKey);
  
  if (savedDetailsJSON) {
    try {
      // Utiliser les détails existants
      return JSON.parse(savedDetailsJSON);
    } catch (e) {
      console.error('Erreur lors du chargement des détails des services:', e);
    }
  }
  
  // Créer des objets Service de base à partir des offerings si aucun détail n'existe
  return offerings.map((offering: string, index: number) => ({
    id: `service-${index}`,
    name: offering,
    description: "Description détaillée à remplir",
    category: "Prestation",
    hourlyRate: 0,
    packagePrice: 0,
    subscriptionPrice: 0,
    subscriptionDuration: 12, // Durée d'engagement par défaut de 12 mois
    estimatedHours: 0,
    billingMode: 'hourly'
  }));
};

/**
 * Calcule le revenu potentiel total basé sur les services
 * 
 * @param services Liste des services avec leurs détails
 * @param projectsPerMonth Nombre de projets par mois (défaut: 1)
 * @returns Revenu potentiel total
 */
export const calculateTotalPotentialRevenue = (services: Service[], projectsPerMonth: number = 1): number => {
  let totalRevenue = 0;
  
  // Filtrer les services vides ou incomplets
  const validServices = services.filter(service => 
    service.name && (
      (service.billingMode === 'hourly' && service.hourlyRate) || 
      (service.billingMode === 'package' && service.packagePrice) || 
      (service.billingMode === 'subscription' && service.subscriptionPrice)
    )
  );
  
  validServices.forEach(service => {
    // Mode de facturation : forfaitaire, horaire ou abonnement
    if (service.billingMode === 'package' && service.packagePrice && service.packagePrice > 0) {
      // Mode forfaitaire : prix fixe par projet
      totalRevenue += service.packagePrice * projectsPerMonth;
    } else if (service.billingMode === 'hourly' && service.hourlyRate && service.hourlyRate > 0 && service.estimatedHours) {
      // Mode horaire : taux horaire × heures estimées
      totalRevenue += service.hourlyRate * service.estimatedHours * projectsPerMonth;
    } else if (service.billingMode === 'subscription' && service.subscriptionPrice && service.subscriptionPrice > 0) {
      // Mode abonnement : prix mensuel (on ne multiplie pas par le nombre de projets car c'est un abonnement récurrent)
      totalRevenue += service.subscriptionPrice;
    }
  });
  
  return totalRevenue;
};

/**
 * Compte le nombre de services valides
 * 
 * @param services Liste des services
 * @returns Nombre de services valides
 */
export const getValidServicesCount = (services: Service[]): number => {
  return services.filter(service => 
    service.name && (
      (service.billingMode === 'hourly' && service.hourlyRate) || 
      (service.billingMode === 'package' && service.packagePrice) || 
      (service.billingMode === 'subscription' && service.subscriptionPrice)
    )
  ).length;
};
