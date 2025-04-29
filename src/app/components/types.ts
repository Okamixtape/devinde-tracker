export type BusinessPlanData = {
  pitch: {
    title: string;
    summary: string;
    vision: string;
    values: string[];
  };
  services: {
    offerings: string[];
    technologies: string[];
    process: string[];
  };
  businessModel: {
    hourlyRates: string[];
    packages: string[];
    subscriptions: string[];
  };
  marketAnalysis: {
    competitors: string[];
    targetClients: string[];
    trends: string[];
  };
  financials: {
    initialInvestment: number;
    quarterlyGoals: number[];
    expenses: string[];
  };
  actionPlan: {
    milestones: string[];
  };
};

// Types utilitaires pour typage strict des callbacks
export type SectionKey = keyof BusinessPlanData;

export type FieldKey<S extends SectionKey> = S extends "pitch"
  ? keyof BusinessPlanData["pitch"]
  : S extends "services"
  ? keyof BusinessPlanData["services"]
  : S extends "businessModel"
  ? keyof BusinessPlanData["businessModel"]
  : S extends "marketAnalysis"
  ? keyof BusinessPlanData["marketAnalysis"]
  : S extends "financials"
  ? keyof BusinessPlanData["financials"]
  : S extends "actionPlan"
  ? keyof BusinessPlanData["actionPlan"]
  : never;
