/**
 * Data Models - Core interfaces for the DevIndé Tracker application
 */

/**
 * Business Plan Data - Top level data structure
 */
export interface BusinessPlanData {
  id?: string;
  userId?: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  pitch: PitchData;
  services: ServicesData;
  businessModel: BusinessModelData;
  marketAnalysis: MarketAnalysisData;
  financials: FinancialsData;
  actionPlan: ActionPlanData;
  meta?: BusinessPlanMetaData;
  settings?: UserSettingsData;
  sections?: Section[];
}

/**
 * Business Plan Metadata
 */
export interface BusinessPlanMetaData {
  lastUpdated?: string;
  version: number;
  exportCount: number;
}

/**
 * User Settings
 */
export interface UserSettingsData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
}

/**
 * Section data structure
 */
export interface Section {
  id: string;
  businessPlanId: string; // Changed from optional to required to match serviceInterfaces.ts
  key: string;
  title: string;
  icon: string;
  color: string;
  completion: number;
  route: string;
  order: number;
  data?: Record<string, unknown>;
  updatedAt?: string;
}

/**
 * Pitch Data
 */
export interface PitchData {
  // Champs originaux
  title: string;
  summary: string;
  vision: string;
  values: string[];
  
  // Champs additionnels utilisés dans la vue détaillée
  problem?: string;
  solution?: string;
  uniqueValueProposition?: string;
  targetAudience?: string;
  competitiveAdvantage?: string;
}

/**
 * Services Data
 */
export interface ServicesData {
  offerings: string[];
  technologies: string[];
  process: string[];
}

/**
 * Business Model Data
 */
export interface BusinessModelData {
  hourlyRates: HourlyRate[];
  packages: ServicePackage[];
  subscriptions: Subscription[];
}

export interface HourlyRate {
  id?: string;
  serviceType: string;
  rate: number;
  currency: string;
}

export interface ServicePackage {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  services: string[];
}

export interface Subscription {
  id?: string;
  name: string;
  description: string;
  monthlyPrice: number;
  currency: string;
  features: string[];
}

/**
 * Market Analysis Data
 */
export interface MarketAnalysisData {
  competitors: Competitor[];
  targetClients: TargetClient[];
  trends: string[];
}

export interface Competitor {
  id?: string;
  name: string;
  strengths: string[];
  weaknesses: string[];
  url?: string;
}

export interface TargetClient {
  id?: string;
  segment: string;
  needs: string[];
  description: string;
}

/**
 * Financials Data
 */
export interface FinancialsData {
  initialInvestment: number;
  quarterlyGoals: number[];
  expenses: Expense[];
  projects?: FinancialProject[];
}

export interface Expense {
  id?: string;
  category: string;
  name: string;
  amount: number;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annual';
}

/**
 * Financial Project - Représente un projet financier
 */
export interface FinancialProject {
  id: string;
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate?: string;
  budget: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  category: 'client' | 'internal' | 'investment';
  transactions: FinancialTransaction[];
  roi?: number;
  totalIncome?: number;
  totalExpenses?: number;
  balance?: number;
}

/**
 * Financial Transaction - Représente une transaction liée à un projet financier
 */
export interface FinancialTransaction {
  id?: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string; 
  status: 'pending' | 'completed';
  paymentMethod?: string;
  invoice?: string;
}

/**
 * Action Plan Data
 */
export interface ActionPlanData {
  milestones: Milestone[];
  tasks: Task[];
  startDate?: string;
  endDate?: string;
}

export interface Milestone {
  id?: string;
  title: string;
  description: string;
  targetDate: string;
  isCompleted: boolean;
  tasks?: Task[];
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  milestoneId?: string;
}

/**
 * Service Operation Results
 */
export interface ServiceResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ServiceError;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}
