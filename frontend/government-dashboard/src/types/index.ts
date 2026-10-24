// Shared API contract between frontend and backend. Change only after agreeing with your teammate.
export interface Area {
  id: string;
  name: string;
  population: number;
  lat: number; // approximate centroid for the demo; real boundaries come from GeoJSON/PostGIS
  lng: number;
}

export interface IndicatorDefinition {
  id: string;
  category: string;
  name: string;
  unit: string;
  direction: "positive" | "negative";
  benchmark: string;
  source: string;
  method: string;
}

export interface IndicatorScore {
  indicatorId: string;
  category: string;
  name: string;
  rawValue: number | null; // null when raw data is not available (never silently use 0)
  unit: string;
  score: number; // 0-100, standardized
  weight: number; // validated contextual weight
  contribution: number; // score x weight
  benchmark: string;
  source: string;
  method: string;
}

export interface AreaUIS {
  areaId: string;
  areaName: string;
  population: number;
  score: number;
  methodologyVersion: string;
  indicators: IndicatorScore[];
  topStrength: string;
  areaToImprove: string;
  isDemo: boolean;
}

export interface DevelopmentProfile {
  areaId: string;
  profileName: string;
  dominantCharacteristics: string[];
  strengths: string[];
  constraints: string[];
  contextualPriorities: string[];
  limitations: string[];
}

export interface AiInsight {
  areaId: string;
  text: string;
  model: string;
  generatedAt: string;
}

export interface CityUIS {
  score: number;
  methodologyVersion: string;
  areas: { areaId: string; areaName: string; score: number; population: number }[];
  isDemo: boolean;
}

export interface PriorityItem {
  areaId: string;
  areaName: string;
  indicator: string;
  currentScore: number;
  target: number;
  gap: number; // target - current
  severity: number; // 0-1
  populationImpact: number; // 0-1 (share of the largest area)
  contextualFactor: number; // 0-1
  priority: number; // 0-100, always shown together with the factors above
}

export interface CityGap { indicator: string; averageScore: number; target: number; gap: number; }

export interface SimulationRequest { areaId: string; indicatorId: string; improvement: number; budget?: number; }
export interface SimulationResult {
  before: AreaUIS;
  after: AreaUIS;
  cityBefore: number;
  cityAfter: number;
  populationAffected: number;
  assumptions: string[];
  limitations: string[];
}

export interface GovernmentDashboardData {
  city: CityUIS;
  priorities: PriorityItem[];
  gaps: CityGap[];
}
