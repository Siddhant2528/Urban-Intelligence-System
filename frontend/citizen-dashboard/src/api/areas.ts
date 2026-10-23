import { apiFetch } from './client'
import type {
  AreasListResponse,
  BackendArea,
  AreaUISResponse,
  AreaFacilitiesResponse,
  FacilitiesListResponse,
  AreaAccessibilityResponse,
  DevelopmentProfileResponse,
  AreaInsightResponse,
  AreaHistoryResponse,
  CompareAreasResponse,
} from './types'

export const areasApi = {
  /** GET /api/v1/areas/ — all wards with GeoJSON boundaries */
  list: () => apiFetch<AreasListResponse>('/api/v1/areas/'),

  /** GET /api/v1/areas/{id} — single ward */
  getOne: (id: number) => apiFetch<BackendArea>(`/api/v1/areas/${id}`),

  /** GET /api/v1/areas/{id}/uis — latest UIS score for a ward */
  getUIS: (id: number) => apiFetch<AreaUISResponse>(`/api/v1/areas/${id}/uis`),

  /** GET /api/v1/areas/{id}/facilities — facilities inside this ward */
  getFacilities: (id: number, facilityType?: string) => {
    const qs = facilityType ? `?facility_type=${facilityType}` : ''
    return apiFetch<AreaFacilitiesResponse>(`/api/v1/areas/${id}/facilities${qs}`)
  },

  /** GET /api/v1/facilities/ — citywide facility list with optional filters */
  listFacilities: (areaId?: number, facilityType?: string, limit = 200) => {
    const params = new URLSearchParams()
    if (areaId != null) params.set('area_id', String(areaId))
    if (facilityType) params.set('facility_type', facilityType)
    params.set('limit', String(limit))
    return apiFetch<FacilitiesListResponse>(`/api/v1/facilities/?${params.toString()}`)
  },

  /** GET /api/v1/areas/{id}/accessibility — spatial coverage percentages */
  getAccessibility: (id: number) =>
    apiFetch<AreaAccessibilityResponse>(`/api/v1/areas/${id}/accessibility`),

  /** GET /api/v1/areas/{id}/profile — AI development profile JSON */
  getProfile: (id: number) =>
    apiFetch<DevelopmentProfileResponse>(`/api/v1/areas/${id}/profile`),

  /** GET /api/v1/areas/{id}/insights — AI narrative explanation */
  getInsights: (id: number) =>
    apiFetch<AreaInsightResponse>(`/api/v1/areas/${id}/insights`),

  /** GET /api/v1/areas/{id}/history — longitudinal UIS timeline */
  getHistory: (id: number) =>
    apiFetch<AreaHistoryResponse>(`/api/v1/areas/${id}/history`),

  /** GET /api/v1/areas/compare?area_ids=1,2 — side-by-side comparison */
  compare: (ids: number[]) =>
    apiFetch<CompareAreasResponse>(`/api/v1/areas/compare?area_ids=${ids.join(',')}`),
}
