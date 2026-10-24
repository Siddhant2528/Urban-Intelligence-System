// One function per backend endpoint (section 22 of the build document).
// VITE_USE_MOCK=true -> local demo data. false -> real backend. Pages never call fetch directly.
import type {
  Area, AreaUIS, AiInsight, CityGap, CityUIS, DevelopmentProfile, GovernmentDashboardData,
  PriorityItem, SimulationRequest, SimulationResult,
} from "../types";
import * as mock from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const delay = <T,>(v: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(v), ms));

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) throw new Error(`Request failed (${res.status}) for ${path}`);
  return res.json() as Promise<T>;
}

// ---- Citizen / shared ----
export const getAreas = (): Promise<Area[]> => (USE_MOCK ? delay(mock.areas) : http("/api/areas"));
export const getCityUIS = (): Promise<CityUIS> =>
  USE_MOCK ? delay(mock.buildCityUIS(mock.allAreaUIS())) : http("/api/city/uis");
export const getAreaUIS = (id: string): Promise<AreaUIS> =>
  USE_MOCK ? delay(mock.buildAreaUIS(id)) : http(`/api/areas/${id}/indicators`);
export const getAreaProfile = (id: string): Promise<DevelopmentProfile> =>
  USE_MOCK ? delay(mock.profiles[id]) : http(`/api/areas/${id}/profile`);
export const getAreaInsights = (id: string): Promise<AiInsight> =>
  USE_MOCK
    ? delay({ areaId: id, text: "AI explanation placeholder (demo).", model: "none", generatedAt: new Date().toISOString() })
    : http(`/api/areas/${id}/insights`);
export const compareAreas = (ids: string[]): Promise<AreaUIS[]> =>
  USE_MOCK ? delay(ids.map((i) => mock.buildAreaUIS(i))) : http(`/api/areas/compare?ids=${ids.join(",")}`);

// ---- Government ----
export const getPriorityAreas = (): Promise<PriorityItem[]> =>
  USE_MOCK ? delay(mock.buildPriorities(mock.allAreaUIS())) : http("/api/priority-areas");
export const getCityGaps = (): Promise<CityGap[]> =>
  USE_MOCK ? delay(mock.buildGaps(mock.allAreaUIS())) : http("/api/city/gaps");
export const getGovernmentDashboard = async (): Promise<GovernmentDashboardData> => {
  if (!USE_MOCK) return http("/api/government/dashboard");
  const list = mock.allAreaUIS();
  return delay({ city: mock.buildCityUIS(list), priorities: mock.buildPriorities(list), gaps: mock.buildGaps(list) });
};

// Mock simulation: raises one indicator score, then recalculates Area UIS and City UIS.
export const runSimulation = (req: SimulationRequest): Promise<SimulationResult> => {
  if (!USE_MOCK) return http("/api/simulation", { method: "POST", body: JSON.stringify(req) });
  const before = mock.buildAreaUIS(req.areaId);
  const current = before.indicators.find((i) => i.indicatorId === req.indicatorId)!.score;
  const newScore = Math.min(100, current + req.improvement);
  const override = { [req.areaId]: { [req.indicatorId]: newScore } };
  return delay({
    before,
    after: mock.buildAreaUIS(req.areaId, { [req.indicatorId]: newScore }),
    cityBefore: mock.buildCityUIS(mock.allAreaUIS()).score,
    cityAfter: mock.buildCityUIS(mock.allAreaUIS(override)).score,
    populationAffected: before.population,
    assumptions: [`Demo assumption: the intervention raises the indicator score by ${req.improvement} points.`],
    limitations: ["Model-based estimate, not a guaranteed real-world outcome."],
  });
};
export const runBudgetSimulation = (req: SimulationRequest): Promise<SimulationResult> =>
  USE_MOCK ? runSimulation(req) : http("/api/government/budget-simulation", { method: "POST", body: JSON.stringify(req) });
