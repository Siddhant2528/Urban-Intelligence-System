/**
 * Backend API TypeScript types.
 * These match the exact JSON shapes returned by FastAPI endpoints.
 */

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  token_type: string
  role: string
  username: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

// ── Areas ────────────────────────────────────────────────────────────────────

export interface BackendArea {
  id: number
  name: string
  population: number | null
  population_source: string | null
  geometry: object | null  // GeoJSON geometry
  created_at: string
}

export interface AreasListResponse {
  areas: BackendArea[]
  total: number
}

export interface AreaUISResponse {
  area_id: number
  area_name: string
  score: number
  methodology_version: string
  snapshot_id: number | null
  calculated_at: string
}

// ── Facilities ────────────────────────────────────────────────────────────────

export type BackendFacilityType = 'hospital' | 'school' | 'transit_stop' | 'police' | 'park' | 'railway_station'

export interface BackendFacility {
  id: number
  osm_id: string | null
  area_id: number | null
  area_name?: string
  name: string
  facility_type: BackendFacilityType
  category: string
  coordinates: { lat: number; lng: number }
  collected_at: string
}

export interface FacilitiesListResponse {
  total?: number
  total_returned: number
  facilities: BackendFacility[]
}

export interface AreaFacilitiesResponse {
  area_id: number
  area_name: string
  total_facilities: number
  facilities: BackendFacility[]
}

// ── Accessibility ─────────────────────────────────────────────────────────────

export interface BackendAccessibilityMetric {
  category: string          // "Hospital", "School", "Transit_stop", "Police"
  coverage_percentage: number
  threshold_km: number
  facilities_in_range: number
}

export interface AreaAccessibilityResponse {
  area_id: number
  area_name: string
  accessibility_metrics: BackendAccessibilityMetric[]
}

// ── Indicators ────────────────────────────────────────────────────────────────

export interface BackendIndicatorDefinition {
  id: number
  name: string
  category: string
  unit: string
  direction: 'positive' | 'negative'
  benchmark_min: number
  benchmark_max: number
  benchmark_source: string
  methodology_version: string
}

export interface IndicatorDefinitionsResponse {
  total: number
  indicators: BackendIndicatorDefinition[]
}

export interface BackendIndicatorScore {
  indicator_id: number
  name: string
  category: string
  score: number
  raw_metric: number | null
  unit: string
  direction: string
  benchmark_min_used: number
  benchmark_max_used: number
  calculated_at: string
}

export interface AreaIndicatorScoresResponse {
  area_id: number
  area_name: string
  indicators_count: number
  scores: BackendIndicatorScore[]
}

export interface IndicatorDetailResponse {
  id: number
  name: string
  category: string
  unit: string
  direction: string
  formula: string
  benchmark_min: number
  benchmark_max: number
  benchmark_source: string
  methodology_version: string
  citywide_average_score: number
  total_wards_evaluated: number
  data_provenance: {
    source_name: string
    update_frequency: string
    quality_flag: string
  }
}

// ── City ──────────────────────────────────────────────────────────────────────

export interface CityUISResponse {
  score: number
  methodology_version: string
  calculated_at: string
  area_breakdown: object | null
}

export interface CityGapItem {
  category: string
  average_gap: number
  max_gap: number
  critical_wards_affected: number
  urgency_score: number
}

export interface CityGapsResponse {
  total_city_population: number
  indicators_evaluated: number
  city_gaps_ranked: CityGapItem[]
}

export interface CityHistoryRecord {
  id: number
  evaluation_period: string
  score: number
  area_breakdown: object | null
  recorded_at: string
}

export interface CityHistoryResponse {
  total_historical_snapshots: number
  timeline: CityHistoryRecord[]
}

export interface CityInsightsResponse {
  city_score: number
  total_population: number
  executive_memo: string
}

// ── Area History ──────────────────────────────────────────────────────────────

export interface AreaHistoryRecord {
  id: number
  evaluation_period: string
  score: number
  indicators_breakdown: object | null
  weights_breakdown: object | null
  recorded_at: string
}

export interface AreaHistoryResponse {
  area_id: number
  area_name: string
  total_historical_snapshots: number
  timeline: AreaHistoryRecord[]
}

// ── Insights ──────────────────────────────────────────────────────────────────

export interface AreaInsightResponse {
  area_id: number
  area_name: string
  narrative: string
  model_used?: string
  generated_at?: string
}

// ── Development Profile ───────────────────────────────────────────────────────

export interface DevelopmentProfileResponse {
  profile_name?: string
  dominant_characteristics?: string[]
  strengths?: string[]
  constraints?: string[]
  contextual_priorities?: string[]
  evidence_indicators?: string[]
  limitations?: string | null
  [key: string]: unknown
}

// ── Compare Areas ─────────────────────────────────────────────────────────────

export interface CompareAreaEntry {
  area_id: number
  area_name: string
  population: number | null
  area_uis: number
  indicator_scores: Record<string, { score: number; raw_metric: number | null; unit: string }>
  weights: object | null
}

export interface CategoryDifference {
  category: string
  score_a: number
  score_b: number
  diff: number
}

export interface CompareAreasResponse {
  compared_areas: CompareAreaEntry[]
  category_differences: CategoryDifference[]
  comparative_analysis: string
}

// ── Priority ──────────────────────────────────────────────────────────────────

export interface PriorityScore {
  indicator_id: number
  current_score: number
  target_score: number
  gap: number
  severity: string
  priority: number
  population_impact: number
  calculated_at: string
}
