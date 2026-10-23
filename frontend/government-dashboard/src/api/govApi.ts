import { apiFetch, ApiError } from './client'
export { ApiError }

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  token_type: string
  role: string
  username: string
}

export const authApi = {
  login: (username: string, password: string) =>
    apiFetch<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => {
    sessionStorage.removeItem('uis_token')
    sessionStorage.removeItem('uis_gov_auth')
    sessionStorage.removeItem('uis_username')
  },
}

// ── Government endpoints ──────────────────────────────────────────────────────

export interface WardRanking {
  area_id: number
  area_name: string
  population: number | null
  area_uis: number
  has_calculation: boolean
  constraints: string[]
  rank: number
}

export interface PriorityItem {
  priority_id: number
  area_id: number
  area_name: string
  indicator_id: number
  current_score: number
  target_score: number
  gap: number
  severity: string
  population_impact: number
  priority_score: number
  calculated_at: string
}

export interface BudgetAllocationItem {
  area_id: number
  area_name: string
  population: number | null
  need_share_percentage: number
  allocated_budget: number
}

export const governmentApi = {
  getWardRankings: () =>
    apiFetch<{ total_wards: number; rankings: WardRanking[] }>('/api/v1/government/ward-rankings'),

  getPriorityMatrix: (severity?: string) => {
    const qs = severity ? `?severity=${severity}` : ''
    return apiFetch<{ total_priorities_found: number; priorities: PriorityItem[] }>(
      `/api/v1/government/priority-matrix${qs}`,
    )
  },

  getBudgetAllocation: (totalBudget?: number) => {
    const qs = totalBudget != null ? `?total_budget=${totalBudget}` : ''
    return apiFetch<{ total_budget: number; methodology: string; allocations: BudgetAllocationItem[] }>(
      `/api/v1/government/budget-allocation${qs}`,
    )
  },
}

// ── City ──────────────────────────────────────────────────────────────────────

export const cityApi = {
  getUIS: () =>
    apiFetch<{ score: number; methodology_version: string; calculated_at: string; area_breakdown: unknown }>(
      '/api/v1/city/uis',
    ),

  getGaps: () =>
    apiFetch<{
      total_city_population: number
      indicators_evaluated: number
      city_gaps_ranked: Array<{
        category: string
        average_gap: number
        max_gap: number
        critical_wards_affected: number
        urgency_score: number
      }>
    }>('/api/v1/city/gaps'),

  getInsights: () =>
    apiFetch<{ city_score: number; total_population: number; executive_memo: string }>(
      '/api/v1/city/insights',
    ),

  calculate: () =>
    apiFetch<{ status: string; city_uis: { city_uis: number } }>(
      '/api/v1/city/calculate',
      { method: 'POST' },
    ),
}

// ── Simulation ────────────────────────────────────────────────────────────────

export interface SimulationRequest {
  area_id: number
  intervention_type: string
  intervention_value: number
  budget?: number
}

export interface BackendSimulationResponse {
  area_id: number
  area_name: string | null
  intervention_type: string
  intervention_value: number
  before_uis: number
  after_uis: number
  uis_change: number
  affected_indicators: Array<{
    indicator: string
    before: number
    after: number
    change: number
  }>
  estimated_cost: number | null
  budget_provided: number | null
  budget_feasible: boolean | null
  max_units_within_budget: number | null
  cost_efficiency_roi: number | null
  assumptions: string[]
  limitations: string[]
  model_note: string | null
}

export interface SimulationAssumption {
  intervention_type: string
  label: string
  affects_categories: string[]
  unit_cost: number
  score_improvement_per_unit: number
  assumptions: string[]
  limitations: string[]
}

export const simulationApi = {
  getAssumptions: () =>
    apiFetch<{ total_supported_interventions: number; interventions: SimulationAssumption[] }>(
      '/api/v1/simulation/assumptions',
    ),

  run: (req: SimulationRequest) =>
    apiFetch<BackendSimulationResponse>('/api/v1/simulation/', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  getHistory: (areaId: number) =>
    apiFetch<{
      area_id: number
      total_simulations: number
      simulations: Array<{ id: number; intervention_type: string; input: unknown; output: unknown; created_at: string }>
    }>(`/api/v1/simulation/history/${areaId}`),
}

// ── Areas ─────────────────────────────────────────────────────────────────────

export const areasApi = {
  list: () =>
    apiFetch<{ areas: Array<{ id: number; name: string; population: number | null; population_source: string | null; geometry: unknown; created_at: string }>; total: number }>(
      '/api/v1/areas/',
    ),

  calculate: (areaId: number) =>
    apiFetch<{ status: string; result: { area_id: number; area_uis: number } }>(
      `/api/v1/areas/${areaId}/calculate`,
      { method: 'POST' },
    ),
}

// ── Indicator scores per area ─────────────────────────────────────────────────

export const indicatorsApi = {
  getAreaScores: (areaId: number) =>
    apiFetch<{
      area_id: number
      area_name: string
      indicators_count: number
      scores: Array<{ indicator_id: number; name: string; category: string; score: number; raw_metric: number | null; unit: string; direction: string }>
    }>(`/api/v1/indicators/areas/${areaId}`),
}

// ── Facilities ────────────────────────────────────────────────────────────────

export interface BackendFacility {
  id: number
  osm_id: string | null
  area_id: number | null
  name: string
  facility_type: string
  category: string
  coordinates: { lat: number; lng: number }
  collected_at: string
}

export const facilitiesApi = {
  list: (areaId?: number, facilityType?: string, limit = 200) => {
    const params = new URLSearchParams()
    if (areaId != null) params.set('area_id', String(areaId))
    if (facilityType) params.set('facility_type', facilityType)
    params.set('limit', String(limit))
    return apiFetch<{ total: number; facilities: BackendFacility[] }>(`/api/v1/facilities/?${params.toString()}`)
  },
}
