/**
 * Financial Projections Interfaces - Définition des interfaces pour les projections financières
 * 
 * Ces interfaces définissent la structure des données pour les projections financières,
 * incluant les flux de trésorerie, les analyses de rentabilité et les rapports financiers.
 * Suivent le pattern de séparation UI/Service établi dans le projet.
 * 
 * @version 1.0
 * @standardized true
 */

import { ExpenseCategory } from '../finances/expenses';
import { DocumentStatus } from '../finances/invoices';

/**
 * Types de rapports financiers
 */
export enum FinancialReportType {
  INCOME_STATEMENT = 'income_statement',   // Compte de résultat
  BALANCE_SHEET = 'balance_sheet',         // Bilan
  CASH_FLOW_STATEMENT = 'cash_flow',       // Tableau des flux de trésorerie
  TAX_PROJECTION = 'tax_projection',       // Projection fiscale
  PROFITABILITY_ANALYSIS = 'profitability' // Analyse de rentabilité
}

/**
 * Périodicité des rapports
 */
export enum ReportPeriodicity {
  MONTHLY = 'monthly',     // Mensuel
  QUARTERLY = 'quarterly', // Trimestriel
  ANNUAL = 'annual',       // Annuel
  CUSTOM = 'custom'        // Personnalisé
}

/**
 * Méthode de calcul de la TVA
 */
export enum VATCalculationMethod {
  CASH_BASIS = 'cash_basis',           // Au moment de l'encaissement
  ACCRUAL_BASIS = 'accrual_basis',     // Au moment de la facturation
  SIMPLIFIED = 'simplified'            // Régime simplifié
}

/**
 * Paramètres de simulation financière côté service
 */
export interface ServiceFinancialSimulationParams {
  // Paramètres fiscaux
  taxSystem: string;                  // Régime fiscal (AE, IS, IR)
  vatSystem: string;                  // Régime de TVA
  socialChargesRate: number;          // Taux de charges sociales
  incomeTaxRate: number;              // Taux d'imposition sur le revenu
  
  // Paramètres de trésorerie
  initialCashBalance: number;         // Solde de trésorerie initial
  clientPaymentDelay: number;         // Délai de paiement client (jours)
  vendorPaymentDelay: number;         // Délai de paiement fournisseur (jours)
  
  // Paramètres de dépenses
  fixedExpenses: {                    // Dépenses fixes mensuelles
    amount: number;                   // Montant
    category: string;                 // Catégorie
    startDate?: string;               // Date de début (si applicable)
    endDate?: string;                 // Date de fin (si applicable)
  }[];
  variableExpensesRate: number;       // Taux de dépenses variables (% du CA)
  equipmentInvestment: number;        // Investissement en équipement
  depreciationPeriod: number;         // Période d'amortissement (mois)
  
  // Paramètres de simulation
  simulationStartDate: string;        // Date de début de simulation
  simulationPeriod: number;           // Période de simulation (mois)
  forecastAccuracy: number;           // Précision des prévisions (0-1)
  economicGrowthFactor: number;       // Facteur de croissance économique
  inflationRate: number;              // Taux d'inflation
  
  // Autres paramètres
  cashReserveTarget: number;          // Trésorerie cible (mois de dépenses)
  profitReinvestmentRate: number;     // Taux de réinvestissement des bénéfices
}

/**
 * Paramètres de simulation financière côté UI
 */
export interface UIFinancialSimulationParams extends Omit<ServiceFinancialSimulationParams, 'taxSystem' | 'vatSystem'> {
  taxSystem: {                        // Régime fiscal
    type: string;                     // Type de régime
    options: Record<string, any>;     // Options spécifiques au régime
  };
  vatSystem: {                        // Régime de TVA
    isVATRegistered: boolean;         // Si assujetti à la TVA
    calculationMethod: VATCalculationMethod; // Méthode de calcul
    rate: number;                     // Taux de TVA
  };
  
  // États UI
  isEditing?: boolean;
  validationErrors?: Record<string, string>;
}

/**
 * Entrée de projection financière côté service
 */
export interface ServiceFinancialEntry {
  date: string;                    // Date de l'entrée
  category: string;                // Catégorie 
  type: string;                    // Type (revenue/expense/tax)
  amount: number;                  // Montant
  description?: string;            // Description
  isProjected: boolean;            // Si projeté ou réel
  confidence?: number;             // Niveau de confiance (0-1)
  sourceId?: string;               // ID de la source (facture, dépense)
}

/**
 * Entrée de projection financière côté UI
 */
export interface UIFinancialEntry extends ServiceFinancialEntry {
  formattedAmount: string;         // Montant formaté
  formattedDate: string;           // Date formatée
  color: string;                   // Couleur pour affichage
  icon: string;                    // Icône
  isHighlighted?: boolean;         // Si mis en évidence
}

/**
 * Compte de résultat projeté côté service
 */
export interface ServiceIncomeStatement {
  period: string;                  // Période (ex: "2023-01")
  
  // Revenus
  hourlyRevenue: number;           // Revenus horaires
  packageRevenue: number;          // Revenus forfaitaires
  subscriptionRevenue: number;     // Revenus abonnements
  otherRevenue: number;            // Autres revenus
  totalRevenue: number;            // Revenus totaux
  
  // Dépenses par catégorie
  expenses: {                      // Dépenses par catégorie
    category: string;              // Catégorie
    amount: number;                // Montant
  }[];
  totalExpenses: number;           // Dépenses totales
  
  // Résultats
  grossProfit: number;             // Bénéfice brut
  grossMargin: number;             // Marge brute (%)
  
  // Charges
  socialCharges: number;           // Charges sociales
  incomeTax: number;               // Impôt sur le revenu
  vat: number;                     // TVA
  totalTaxes: number;              // Total des taxes
  
  // Résultat net
  netProfit: number;               // Bénéfice net
  netMargin: number;               // Marge nette (%)
}

/**
 * Compte de résultat projeté côté UI
 */
export interface UIIncomeStatement extends ServiceIncomeStatement {
  periodLabel: string;             // Étiquette de période formatée
  isActual: boolean;               // Si les données sont réelles ou projetées
  formattedTotalRevenue: string;   // Revenus totaux formatés
  formattedTotalExpenses: string;  // Dépenses totales formatées
  formattedGrossProfit: string;    // Bénéfice brut formaté
  formattedGrossMargin: string;    // Marge brute formatée
  formattedNetProfit: string;      // Bénéfice net formaté
  formattedNetMargin: string;      // Marge nette formatée
  
  // Dépenses formatées
  expenses: {
    category: ExpenseCategory;     // Catégorie
    amount: number;                // Montant
    formattedAmount: string;       // Montant formaté
    percentage: number;            // Pourcentage du total
    formattedPercentage: string;   // Pourcentage formaté
    color: string;                 // Couleur pour affichage
  }[];
  
  // États UI
  isSelected?: boolean;            // Si la période est sélectionnée
  isExpanded?: boolean;            // Si les détails sont affichés
}

/**
 * Flux de trésorerie projeté côté service
 */
export interface ServiceCashFlowStatement {
  period: string;                  // Période (ex: "2023-01")
  
  // Soldes
  openingBalance: number;          // Solde d'ouverture
  closingBalance: number;          // Solde de clôture
  
  // Encaissements
  receivedPayments: number;        // Paiements reçus des clients
  otherInflows: number;            // Autres entrées de trésorerie
  totalInflows: number;            // Total des encaissements
  
  // Décaissements
  paidExpenses: number;            // Dépenses payées
  taxPayments: number;             // Paiements de taxes
  equipmentPurchases: number;      // Achats d'équipements
  otherOutflows: number;           // Autres sorties de trésorerie
  totalOutflows: number;           // Total des décaissements
  
  // Flux net
  netCashFlow: number;             // Flux net de trésorerie
  
  // Créances et dettes
  outstandingReceivables: number;  // Créances clients à encaisser
  outstandingPayables: number;     // Dettes fournisseurs à payer
}

/**
 * Flux de trésorerie projeté côté UI
 */
export interface UICashFlowStatement extends ServiceCashFlowStatement {
  periodLabel: string;             // Étiquette de période formatée
  isActual: boolean;               // Si les données sont réelles ou projetées
  formattedOpeningBalance: string; // Solde d'ouverture formaté
  formattedClosingBalance: string; // Solde de clôture formaté
  formattedTotalInflows: string;   // Total des encaissements formaté
  formattedTotalOutflows: string;  // Total des décaissements formaté
  formattedNetCashFlow: string;    // Flux net formaté
  
  // Indicateurs visuels
  cashFlowStatus: 'positive' | 'negative' | 'neutral'; // Statut du flux
  cashReserveWarning: boolean;     // Alerte si réserve de trésorerie faible
  
  // États UI
  isSelected?: boolean;            // Si la période est sélectionnée
  isExpanded?: boolean;            // Si les détails sont affichés
}

/**
 * Bilan projeté côté service
 */
export interface ServiceBalanceSheet {
  asOfDate: string;                // Date du bilan
  
  // Actifs
  assets: {                        // Actifs
    cashAndEquivalents: number;    // Trésorerie et équivalents
    accountsReceivable: number;    // Créances clients
    equipment: {                   // Équipements
      originalValue: number;       // Valeur d'origine
      accumulatedDepreciation: number; // Amortissements cumulés
      netBookValue: number;        // Valeur nette comptable
    };
    otherAssets: number;           // Autres actifs
    totalAssets: number;           // Total des actifs
  };
  
  // Passifs
  liabilities: {                   // Passifs
    accountsPayable: number;       // Dettes fournisseurs
    taxLiabilities: number;        // Dettes fiscales
    otherLiabilities: number;      // Autres passifs
    totalLiabilities: number;      // Total des passifs
  };
  
  // Capitaux propres
  equity: {                        // Capitaux propres
    capital: number;               // Capital
    retainedEarnings: number;      // Résultats cumulés
    currentEarnings: number;       // Résultat de l'exercice
    totalEquity: number;           // Total des capitaux propres
  };
  
  // Équilibre
  totalLiabilitiesAndEquity: number; // Total passif et capitaux propres
}

/**
 * Bilan projeté côté UI
 */
export interface UIBalanceSheet extends ServiceBalanceSheet {
  formattedAsOfDate: string;       // Date du bilan formatée
  isActual: boolean;               // Si les données sont réelles ou projetées
  
  // Actifs formatés
  assets: {
    cashAndEquivalents: number;    // Trésorerie et équivalents
    formattedCashAndEquivalents: string; // Formaté
    accountsReceivable: number;    // Créances clients
    formattedAccountsReceivable: string; // Formaté
    equipment: {
      originalValue: number;       // Valeur d'origine
      formattedOriginalValue: string; // Formaté
      accumulatedDepreciation: number; // Amortissements cumulés
      formattedAccumulatedDepreciation: string; // Formaté
      netBookValue: number;        // Valeur nette comptable
      formattedNetBookValue: string; // Formaté
    };
    otherAssets: number;           // Autres actifs
    formattedOtherAssets: string;  // Formaté
    totalAssets: number;           // Total des actifs
    formattedTotalAssets: string;  // Formaté
  };
  
  // Passifs formatés
  liabilities: {
    accountsPayable: number;       // Dettes fournisseurs
    formattedAccountsPayable: string; // Formaté
    taxLiabilities: number;        // Dettes fiscales
    formattedTaxLiabilities: string; // Formaté
    otherLiabilities: number;      // Autres passifs
    formattedOtherLiabilities: string; // Formaté
    totalLiabilities: number;      // Total des passifs
    formattedTotalLiabilities: string; // Formaté
  };
  
  // Capitaux propres formatés
  equity: {
    capital: number;               // Capital
    formattedCapital: string;      // Formaté
    retainedEarnings: number;      // Résultats cumulés
    formattedRetainedEarnings: string; // Formaté
    currentEarnings: number;       // Résultat de l'exercice
    formattedCurrentEarnings: string; // Formaté
    totalEquity: number;           // Total des capitaux propres
    formattedTotalEquity: string;  // Formaté
  };
  
  // Équilibre formaté
  formattedTotalLiabilitiesAndEquity: string; // Formaté
  
  // Indicateurs
  isBalanced: boolean;             // Si le bilan est équilibré
  healthIndicators: {              // Indicateurs de santé financière
    currentRatio: number;          // Ratio de liquidité
    debtToEquityRatio: number;     // Ratio d'endettement
    assetTurnover: number;         // Rotation des actifs
  };
}

/**
 * Projection fiscale côté service
 */
export interface ServiceTaxProjection {
  year: number;                      // Année fiscale
  
  // Revenus imposables
  taxableRevenue: number;            // Revenu imposable
  
  // TVA
  vatCollected: number;              // TVA collectée
  vatDeductible: number;             // TVA déductible
  vatDue: number;                    // TVA à payer
  
  // Charges sociales
  socialChargesBase: number;         // Base de calcul des charges sociales
  socialChargesAmount: number;       // Montant des charges sociales
  
  // Impôt sur le revenu
  incomeTaxBase: number;             // Base imposable IR
  incomeTaxAmount: number;           // Montant de l'IR
  
  // Autres taxes
  otherTaxes: {                      // Autres taxes
    name: string;                    // Nom de la taxe
    base: number;                    // Base de calcul
    amount: number;                  // Montant
  }[];
  
  // Total
  totalTaxLiability: number;         // Charge fiscale totale
  effectiveTaxRate: number;          // Taux d'imposition effectif
  
  // Échéancier
  paymentSchedule: {                 // Échéancier de paiement
    date: string;                    // Date d'échéance
    taxType: string;                 // Type de taxe
    amount: number;                  // Montant
    isPaid: boolean;                 // Si déjà payé
  }[];
}

/**
 * Projection fiscale côté UI
 */
export interface UITaxProjection extends ServiceTaxProjection {
  label: string;                     // Étiquette formatée (ex: "Année 2023")
  isActual: boolean;                 // Si les données sont réelles ou projetées
  
  // Valeurs formatées
  formattedTaxableRevenue: string;   // Revenu imposable formaté
  formattedVatDue: string;           // TVA à payer formatée
  formattedSocialChargesAmount: string; // Charges sociales formatées
  formattedIncomeTaxAmount: string;  // IR formaté
  formattedTotalTaxLiability: string; // Charge fiscale totale formatée
  formattedEffectiveTaxRate: string; // Taux effectif formaté
  
  // Autres taxes formatées
  otherTaxes: {
    name: string;                    // Nom de la taxe
    base: number;                    // Base de calcul
    amount: number;                  // Montant
    formattedBase: string;           // Base formatée
    formattedAmount: string;         // Montant formaté
  }[];
  
  // Échéancier formaté
  paymentSchedule: {
    date: string;                    // Date d'échéance
    formattedDate: string;           // Date formatée
    taxType: string;                 // Type de taxe
    amount: number;                  // Montant
    formattedAmount: string;         // Montant formaté
    isPaid: boolean;                 // Si déjà payé
    status: 'paid' | 'pending' | 'overdue'; // Statut de paiement
  }[];
  
  // Visualisations
  taxBreakdownData: {                // Données pour graphique de répartition
    label: string;                   // Étiquette
    value: number;                   // Valeur
    percentage: number;              // Pourcentage
    color: string;                   // Couleur
  }[];
}

/**
 * Analyse de rentabilité côté service
 */
export interface ServiceProfitabilityAnalysis {
  // Indicateurs globaux
  overallProfitMargin: number;       // Marge bénéficiaire globale
  operatingMargin: number;           // Marge opérationnelle
  returnOnInvestment: number;        // Retour sur investissement
  
  // Analyse par source de revenus
  byRevenueSource: {                 // Analyse par source de revenus
    sourceType: string;              // Type de source
    revenue: number;                 // Revenus
    directCosts: number;             // Coûts directs
    margin: number;                  // Marge
    marginRate: number;              // Taux de marge
  }[];
  
  // Analyse temporelle
  profitabilityTrend: {              // Évolution de la rentabilité
    period: string;                  // Période
    profitMargin: number;            // Marge bénéficiaire
    returnOnInvestment: number;      // Retour sur investissement
  }[];
  
  // Analyse de seuil de rentabilité
  breakEvenPoints: {                 // Points d'équilibre
    metric: string;                  // Métrique (revenu, clients, taux horaire)
    value: number;                   // Valeur
    currentValue: number;            // Valeur actuelle
    variance: number;                // Écart
  }[];
  
  // Analyse de sensibilité
  sensitivityAnalysis: {             // Analyse de sensibilité
    parameter: string;               // Paramètre
    baseValue: number;               // Valeur de base
    scenarioResults: {               // Résultats des scénarios
      change: number;                // Variation (en %)
      profitImpact: number;          // Impact sur le bénéfice
      marginImpact: number;          // Impact sur la marge
    }[];
  }[];
}

/**
 * Analyse de rentabilité côté UI
 */
export interface UIProfitabilityAnalysis extends ServiceProfitabilityAnalysis {
  // Valeurs formatées
  formattedOverallProfitMargin: string; // Marge globale formatée
  formattedOperatingMargin: string;     // Marge opérationnelle formatée
  formattedReturnOnInvestment: string;  // ROI formaté
  
  // Sources de revenus formatées
  byRevenueSource: {
    sourceType: string;              // Type de source
    sourceName: string;              // Nom de la source
    revenue: number;                 // Revenus
    formattedRevenue: string;        // Revenus formatés
    directCosts: number;             // Coûts directs
    formattedDirectCosts: string;    // Coûts formatés
    margin: number;                  // Marge
    formattedMargin: string;         // Marge formatée
    marginRate: number;              // Taux de marge
    formattedMarginRate: string;     // Taux formaté
    color: string;                   // Couleur
  }[];
  
  // Tendance formatée
  profitabilityTrend: {
    period: string;                  // Période
    label: string;                   // Étiquette formatée
    profitMargin: number;            // Marge bénéficiaire
    formattedProfitMargin: string;   // Marge formatée
    returnOnInvestment: number;      // ROI
    formattedROI: string;            // ROI formaté
  }[];
  
  // Points d'équilibre formatés
  breakEvenPoints: {
    metric: string;                  // Métrique
    metricLabel: string;             // Étiquette de la métrique
    value: number;                   // Valeur
    formattedValue: string;          // Valeur formatée
    currentValue: number;            // Valeur actuelle
    formattedCurrentValue: string;   // Valeur actuelle formatée
    variance: number;                // Écart
    formattedVariance: string;       // Écart formaté
    isAchieved: boolean;             // Si le seuil est atteint
  }[];
  
  // Analyse de sensibilité formatée
  sensitivityAnalysis: {
    parameter: string;               // Paramètre
    parameterLabel: string;          // Étiquette du paramètre
    baseValue: number;               // Valeur de base
    formattedBaseValue: string;      // Valeur de base formatée
    scenarioResults: {               // Résultats des scénarios
      change: number;                // Variation (en %)
      formattedChange: string;       // Variation formatée
      profitImpact: number;          // Impact sur le bénéfice
      formattedProfitImpact: string; // Impact sur le bénéfice formaté
      marginImpact: number;          // Impact sur la marge
      formattedMarginImpact: string; // Impact sur la marge formaté
      severity: 'low' | 'medium' | 'high'; // Sévérité de l'impact
    }[];
  }[];
  
  // Recommandations
  recommendations: {                 // Recommandations
    category: string;                // Catégorie
    title: string;                   // Titre
    description: string;             // Description
    potentialImpact: number;         // Impact potentiel (%)
    implementationDifficulty: 'easy' | 'medium' | 'hard'; // Difficulté
  }[];
}

/**
 * Rapport financier côté service
 */
export interface ServiceFinancialReport {
  id: string;                        // Identifiant unique
  name: string;                      // Nom du rapport
  type: string;                      // Type de rapport
  periodicity: string;               // Périodicité
  startDate: string;                 // Date de début
  endDate: string;                   // Date de fin
  
  // Configuration du rapport
  config: {                          // Configuration
    includedSections: string[];      // Sections incluses
    chartsToGenerate: string[];      // Graphiques à générer
    compareToPrevious: boolean;      // Comparer à période précédente
    includeTaxDetails: boolean;      // Inclure détails fiscaux
  };
  
  // Données du rapport (dépend du type)
  data: any;                         // Données (type spécifique selon le type de rapport)
  
  createdAt: string;                 // Date de création
  updatedAt: string;                 // Date de mise à jour
  generatedAt: string;               // Date de génération
  businessPlanId: string;            // ID du plan d'affaires
}

/**
 * Rapport financier côté UI
 */
export interface UIFinancialReport {
  id: string;                        // Identifiant unique
  name: string;                      // Nom du rapport
  type: FinancialReportType;         // Type de rapport
  periodicity: ReportPeriodicity;    // Périodicité
  startDate: string;                 // Date de début
  endDate: string;                   // Date de fin
  formattedDateRange: string;        // Plage de dates formatée
  
  // Configuration du rapport
  config: {                          // Configuration
    includedSections: string[];      // Sections incluses
    chartsToGenerate: string[];      // Graphiques à générer
    compareToPrevious: boolean;      // Comparer à période précédente
    includeTaxDetails: boolean;      // Inclure détails fiscaux
  };
  
  // Données du rapport
  data: any;                         // Données (type spécifique selon le type de rapport)
  
  // Méta-informations
  createdAt: string;                 // Date de création
  updatedAt: string;                 // Date de mise à jour
  generatedAt: string;               // Date de génération
  formattedGeneratedAt: string;      // Date de génération formatée
  businessPlanId: string;            // ID du plan d'affaires
  
  // États UI
  isEditing?: boolean;               // Si en cours d'édition
  isExporting?: boolean;             // Si en cours d'exportation
  isExpanded?: boolean;              // Si développé
  exportFormats?: ('pdf' | 'csv' | 'excel')[]; // Formats d'exportation disponibles
  validationErrors?: Record<string, string>; // Erreurs de validation
}