import { apiFetch } from './client'
import type {
  IndicatorDefinitionsResponse,
  IndicatorDetailResponse,
  AreaIndicatorScoresResponse,
} from './types'

export const indicatorsApi = {
  /** GET /api/v1/indicators/ — all approved indicator definitions */
  list: () => apiFetch<IndicatorDefinitionsResponse>('/api/v1/indicators/'),

  /** GET /api/v1/indicators/{id} — detail spec for a single indicator */
  getOne: (id: number) => apiFetch<IndicatorDetailResponse>(`/api/v1/indicators/${id}`),

  /** GET /api/v1/indicators/areas/{area_id} — latest scored indicators for a ward */
  getAreaScores: (areaId: number) =>
    apiFetch<AreaIndicatorScoresResponse>(`/api/v1/indicators/areas/${areaId}`),
}
