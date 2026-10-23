// DEMO DATA ONLY. Scores are illustrative (based on the worked examples in the UIS methodology PDF).
// Do not present these as official statistics. Set VITE_USE_MOCK=false to use the real API.
import type { Area, AreaUIS, CityGap, CityUIS, DevelopmentProfile, IndicatorScore, PriorityItem } from "../types";
import { round2 } from "../utils/uis";

export const METHODOLOGY_VERSION = "demo-v0.1";
const TARGET = 80;

export const areas: Area[] = [
  { id: "cidco", name: "CIDCO", population: 50000, lat: 19.9617, lng: 73.7596 },
  { id: "panchavati", name: "Panchavati", population: 42000, lat: 20.013, lng: 73.792 },
  { id: "satpur", name: "Satpur", population: 38000, lat: 19.999, lng: 73.728 },
  { id: "gangapur", name: "Gangapur", population: 30000, lat: 20.009, lng: 73.75 },
  { id: "dwarka", name: "Dwarka", population: 34000, lat: 19.996, lng: 73.789 },
  { id: "deolali", name: "Deolali", population: 20000, lat: 19.946, lng: 73.835 },
];

// id, category, name, unit, contextual weight (sums to 1.00)
const defs = [
  { id: "env", category: "Environment", name: "Environment score", unit: "0-100", weight: 0.15 },
  { id: "health", category: "Healthcare", name: "Healthcare score", unit: "0-100", weight: 0.2 },
  { id: "edu", category: "Education", name: "Education score", unit: "0-100", weight: 0.12 },
  { id: "safety", category: "Safety", name: "Safety score", unit: "0-100", weight: 0.1 },
  { id: "transport", category: "Transport", name: "Transport score", unit: "0-100", weight: 0.16 },
  { id: "infra", category: "Infrastructure", name: "Infrastructure score", unit: "0-100", weight: 0.17 },
  { id: "access", category: "Accessibility", name: "Accessibility score", unit: "0-100", weight: 0.1 },
];

// scores in the same order as defs
const scores: Record<string, number[]> = {
  cidco: [62, 42.2, 78, 76, 64, 48, 69],
  panchavati: [55, 40, 70, 68, 58, 45, 60],
  satpur: [48, 52, 50, 60, 55, 50, 58],
  gangapur: [66, 58, 72, 74, 62, 66, 70],
  dwarka: [52, 62, 68, 64, 72, 60, 74],
  deolali: [70, 45, 56, 70, 48, 40, 50],
};

export function buildAreaUIS(areaId: string, override: Record<string, number> = {}): AreaUIS {
  const area = areas.find((a) => a.id === areaId)!;
  const indicators: IndicatorScore[] = defs.map((d, i) => {
    const score = override[d.id] ?? scores[areaId][i];
    return {
      indicatorId: d.id, category: d.category, name: d.name, unit: d.unit,
      rawValue: null, score, weight: d.weight, contribution: round2(score * d.weight),
      benchmark: "Demo benchmark (replace with documented reference range)",
      source: "Demo dataset", method: "Reference-based 0-100 standardization",
    };
  });
  const sorted = [...indicators].sort((a, b) => b.score - a.score);
  return {
    areaId, areaName: area.name, population: area.population,
    score: round2(indicators.reduce((s, x) => s + x.contribution, 0)),
    methodologyVersion: METHODOLOGY_VERSION, indicators,
    topStrength: sorted[0].category, areaToImprove: sorted[sorted.length - 1].category, isDemo: true,
  };
}

export const allAreaUIS = (override: Record<string, Record<string, number>> = {}) =>
  areas.map((a) => buildAreaUIS(a.id, override[a.id]));

export function buildCityUIS(list: AreaUIS[]): CityUIS {
  const pop = list.reduce((s, a) => s + a.population, 0);
  const score = list.reduce((s, a) => s + a.score * a.population, 0) / pop;
  return {
    score: round2(score), methodologyVersion: METHODOLOGY_VERSION, isDemo: true,
    areas: list.map((a) => ({ areaId: a.areaId, areaName: a.areaName, score: a.score, population: a.population })),
  };
}

export function buildPriorities(list: AreaUIS[]): PriorityItem[] {
  const maxPop = Math.max(...list.map((a) => a.population));
  const maxW = Math.max(...defs.map((d) => d.weight));
  const items: PriorityItem[] = [];
  for (const a of list) for (const ind of a.indicators) {
    const gap = Math.max(0, TARGET - ind.score);
    const severity = gap / TARGET;
    const populationImpact = a.population / maxPop;
    const contextualFactor = ind.weight / maxW;
    // Illustrative weights only. The real, versioned formula lives in backend priorityEngine.js
    const priority = 100 * (0.35 * severity + 0.35 * populationImpact + 0.3 * contextualFactor) * severity;
    items.push({
      areaId: a.areaId, areaName: a.areaName, indicator: ind.category, currentScore: ind.score,
      target: TARGET, gap: round2(gap), severity: round2(severity), populationImpact: round2(populationImpact),
      contextualFactor: round2(contextualFactor), priority: round2(Math.min(100, priority)),
    });
  }
  return items.sort((a, b) => b.priority - a.priority);
}

export function buildGaps(list: AreaUIS[]): CityGap[] {
  return defs.map((d, i) => {
    const avg = list.reduce((s, a) => s + a.indicators[i].score, 0) / list.length;
    return { indicator: d.category, averageScore: round2(avg), target: TARGET, gap: round2(Math.max(0, TARGET - avg)) };
  });
}

export const profiles: Record<string, DevelopmentProfile> = Object.fromEntries(
  areas.map((a) => [a.id, {
    areaId: a.id, profileName: "Demo profile (AI profile will appear here)",
    dominantCharacteristics: ["Placeholder"], strengths: ["Placeholder"], constraints: ["Placeholder"],
    contextualPriorities: ["Placeholder"], limitations: ["AI profiles are interpretations, not measurements."],
  }]),
);
