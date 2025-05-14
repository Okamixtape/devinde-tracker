/**
 * Utilitaire de calculs fiscaux pour auto-entrepreneurs
 */

/**
 * Taux de TVA standard en France
 */
export const TVA_STANDARD_RATE = 0.20; // 20%

/**
 * Taux de cotisations sociales pour les auto-entrepreneurs
 * Selon le type d'activité
 * Source: https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/toutes-les-actualites/nouveautes-2023.html
 */
export const COTISATIONS_RATES = {
  // Prestations de services commerciales ou artisanales
  SERVICES_COMMERCIAUX: 0.128, // 12.8%
  
  // Prestations de services libérales
  SERVICES_LIBERAUX: 0.218, // 21.8%
  
  // Vente de marchandises
  VENTE_MARCHANDISES: 0.063, // 6.3%
};

/**
 * Plafonds d'exonération pour la première année d'activité (ACRE)
 * ACRE = Aide à la création et à la reprise d'une entreprise
 * Source: https://www.urssaf.fr/portail/home/independant/je-beneficie-dexonerations/accre/exonerations-de-debut-dactivite.html
 */
export const ACRE_EXONERATION = {
  // Première année: 50% de réduction
  YEAR_1: 0.5,
  
  // Deuxième année: 25% de réduction
  YEAR_2: 0.25,
  
  // Troisième année: 10% de réduction
  YEAR_3: 0.1,
};

/**
 * Calcule le montant de TVA à partir d'un montant HT
 * 
 * @param amountHT Montant hors taxes
 * @param tvaRate Taux de TVA (par défaut 20%)
 * @returns Montant de la TVA
 */
export const calculateTVA = (amountHT: number, tvaRate: number = TVA_STANDARD_RATE): number => {
  return amountHT * tvaRate;
};

/**
 * Calcule le montant TTC à partir d'un montant HT
 * 
 * @param amountHT Montant hors taxes
 * @param tvaRate Taux de TVA (par défaut 20%)
 * @returns Montant TTC
 */
export const calculateTTC = (amountHT: number, tvaRate: number = TVA_STANDARD_RATE): number => {
  return amountHT + calculateTVA(amountHT, tvaRate);
};

/**
 * Calcule le montant des cotisations sociales pour un auto-entrepreneur
 * 
 * @param revenue Chiffre d'affaires HT
 * @param activityType Type d'activité (utiliser les constantes COTISATIONS_RATES)
 * @param firstYear Si c'est la première année d'activité (ACRE)
 * @returns Montant des cotisations sociales
 */
export const calculateCotisations = (
  revenue: number, 
  activityType: number = COTISATIONS_RATES.SERVICES_LIBERAUX,
  firstYearReduction: number = 0 // 0 = pas de réduction, sinon utiliser ACRE_EXONERATION
): number => {
  const baseRate = activityType;
  const reducedRate = baseRate * (1 - firstYearReduction);
  return revenue * reducedRate;
};

/**
 * Calcule le revenu net après déduction des cotisations sociales
 * 
 * @param revenue Chiffre d'affaires HT
 * @param activityType Type d'activité
 * @param firstYear Si c'est la première année d'activité (ACRE)
 * @returns Revenu net après cotisations
 */
export const calculateNetRevenue = (
  revenue: number,
  activityType: number = COTISATIONS_RATES.SERVICES_LIBERAUX,
  firstYearReduction: number = 0
): number => {
  const cotisations = calculateCotisations(revenue, activityType, firstYearReduction);
  return revenue - cotisations;
};

/**
 * Type pour les résultats de la simulation fiscale
 */
export interface FiscalSimulation {
  revenueHT: number;        // Chiffre d'affaires HT
  tva: number;              // Montant de la TVA
  revenueTTC: number;       // Chiffre d'affaires TTC
  cotisations: number;      // Montant des cotisations sociales
  revenueNet: number;       // Revenu net après cotisations
  cotisationsRate: number;  // Taux de cotisations appliqué
  isTVAApplicable: boolean; // Si la TVA est applicable
  acreReduction: number;    // Taux de réduction ACRE appliqué
}

/**
 * Effectue une simulation fiscale complète
 * 
 * @param revenueHT Chiffre d'affaires HT
 * @param activityType Type d'activité
 * @param firstYearReduction Taux de réduction pour la première année
 * @param isTVAApplicable Si la TVA est applicable
 * @returns Objet contenant tous les détails de la simulation
 */
export const simulateFiscalImpact = (
  revenueHT: number,
  activityType: number = COTISATIONS_RATES.SERVICES_LIBERAUX,
  firstYearReduction: number = 0,
  isTVAApplicable: boolean = true
): FiscalSimulation => {
  // Calcul de la TVA (si applicable)
  const tva = isTVAApplicable ? calculateTVA(revenueHT) : 0;
  const revenueTTC = revenueHT + tva;
  
  // Calcul des cotisations avec réduction éventuelle
  const cotisationsRate = activityType * (1 - firstYearReduction);
  const cotisations = revenueHT * cotisationsRate;
  
  // Revenu net
  const revenueNet = revenueHT - cotisations;
  
  return {
    revenueHT,
    tva,
    revenueTTC,
    cotisations,
    revenueNet,
    cotisationsRate,
    isTVAApplicable,
    acreReduction: firstYearReduction
  };
};
