/**
 * Configuration centralisée des sections
 * 
 * Ce fichier définit toutes les sections disponibles dans l'application
 * afin d'assurer la cohérence entre les différents composants qui les utilisent.
 */

// Types pour la configuration des sections
export interface SectionConfig {
  id: string;
  key: string;
  title: string;
  icon: string;
  color: string;
  route: string;
  order: number;
}

// Configuration des sections disponibles
export const SECTIONS_CONFIG: SectionConfig[] = [
  {
    id: "section-dashboard",
    key: "dashboard",
    title: "Tableau de Bord",
    icon: "grid",
    color: "#3B82F6",
    route: "/dashboard",
    order: 0
  },
  {
    id: "section-pitch",
    key: "pitch", 
    title: "Pitch",
    icon: "lightbulb",
    color: "#3B82F6",
    route: "/pitch",
    order: 1
  },
  {
    id: "section-services",
    key: "services",
    title: "Services",
    icon: "briefcase",
    color: "#10B981",
    route: "/services",
    order: 2
  },
  {
    id: "section-business-model",
    key: "business-model",
    title: "Modèle Économique",
    icon: "cash",
    color: "#F59E0B",
    route: "/business-model",
    order: 3
  },
  {
    id: "section-market-analysis",
    key: "market-analysis",
    title: "Analyse Marché",
    icon: "chart-bar",
    color: "#8B5CF6",
    route: "/market-analysis",
    order: 4
  },
  {
    id: "section-finances",
    key: "finances",
    title: "Finances",
    icon: "currency-euro",
    color: "#EC4899",
    route: "/finances",
    order: 5
  },
  {
    id: "section-action-plan",
    key: "action-plan",
    title: "Plan d'Action",
    icon: "clipboard-list",
    color: "#6366F1",
    route: "/action-plan",
    order: 6
  },
  {
    id: "section-revenue",
    key: "revenue",
    title: "Projections",
    icon: "chart-line",
    color: "#0EA5E9",
    route: "/revenue",
    order: 7
  },
  {
    id: "section-financial-dashboard",
    key: "financial-dashboard",
    title: "Dashboard Financier",
    icon: "chart-pie",
    color: "#14B8A6",
    route: "/financial-dashboard",
    order: 8
  },
  {
    id: "section-documents",
    key: "documents",
    title: "Documents",
    icon: "document-text",
    color: "#6B7280",
    route: "/documents",
    order: 9
  }
];

// Ordre des sections pour l'affichage
export const SECTION_ORDER = SECTIONS_CONFIG.map(section => section.key);

// Map pour accéder rapidement aux sections par clé
export const SECTIONS_BY_KEY = SECTIONS_CONFIG.reduce((acc, section) => {
  acc[section.key] = section;
  return acc;
}, {} as Record<string, SectionConfig>);

// Map pour accéder rapidement aux sections par route
export const SECTIONS_BY_ROUTE = SECTIONS_CONFIG.reduce((acc, section) => {
  const routeKey = section.route.startsWith('/') ? section.route.substring(1) : section.route;
  acc[routeKey] = section;
  return acc;
}, {} as Record<string, SectionConfig>);

/**
 * Obtient la configuration d'une section par sa clé
 * @param key Clé de la section
 * @returns Configuration de la section ou undefined si non trouvée
 */
export function getSectionByKey(key: string): SectionConfig | undefined {
  return SECTIONS_BY_KEY[key];
}

/**
 * Obtient la configuration d'une section par sa route
 * @param route Route de la section
 * @returns Configuration de la section ou undefined si non trouvée
 */
export function getSectionByRoute(route: string): SectionConfig | undefined {
  const routeKey = route.startsWith('/') ? route.substring(1) : route;
  return SECTIONS_BY_ROUTE[routeKey];
}

/**
 * Construit le chemin complet vers une section d'un plan d'affaires
 * @param planId ID du plan d'affaires
 * @param sectionKey Clé de la section
 * @returns Chemin complet vers la section
 */
export function buildSectionPath(planId: string, sectionKey: string): string {
  const section = getSectionByKey(sectionKey);
  if (!section) return '';
  
  return `/plans/${planId}${section.route}`;
}
