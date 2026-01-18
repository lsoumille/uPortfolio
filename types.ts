
export interface ClientProfile {
  firstName: string;
  age: number;
  profession: string;
  taxBracket: number; // TMI (11, 30, 41, 45%)
  monthlyIncome: number;
  monthlySavings: number;
}

export interface LifeGoal {
  id: string;
  title: string;
  horizon: number; // years
  targetAmount: number;
}

export interface CurrentAsset {
  id: string;
  type: string; // Immobilier, Cash, Bourse, Obligations, Autre
  value: number;
  description: string;
}

export interface Debt {
  id: string;
  type: string; // Immobilier, Consommation, Autre
  remainingCapital: number;
  monthlyPayment: number;
  interestRate: number;
}

export interface RiskProfile {
  score: number; // 1 to 10
  label: string; // Prudent, Equilibré, Dynamique
  description: string;
}

export interface AssetAllocation {
  category: string;
  percentage: number;
  reason?: string; // Justification du poids
  examples: string[];
}

export interface GoalAttainability {
  goalTitle: string;
  status: 'Atteignable' | 'Partiel' | 'Difficile';
  analysis: string;
}

export interface Portfolio {
  name: string;
  riskLevel: string;
  expectedReturn: number;
  volatility: number;
  recommendedWrappers: string[]; // PEA, Assurance Vie, PER...
  allocation: AssetAllocation[];
  analysis: string;
  projectedValue10y?: number;
  qualityScore: number; // Score de qualité des actifs de 1 à 100
  diversificationHighlights: string[]; // Points clés sur la diversification
  attainability: GoalAttainability[]; // Analyse de faisabilité des projets de vie
}

export interface AnalysisResponse {
  portfolios: Portfolio[];
  summary: string;
}
