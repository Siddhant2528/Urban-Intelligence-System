import { apiFetch } from './client'
import type {
  CityUISResponse,
  CityGapsResponse,
  CityHistoryResponse,
  CityInsightsResponse,
} from './types'

export const cityApi = {
  /** GET /api/v1/city/uis — latest population-weighted City UIS score */
  getUIS: () => apiFetch<CityUISResponse>('/api/v1/city/uis'),

  /** GET /api/v1/city/gaps — citywide gap analysis ranked by urgency */
  getGaps: () => apiFetch<CityGapsResponse>('/api/v1/city/gaps'),

  /** GET /api/v1/city/history — historical city UIS timeline */
  getHistory: () => apiFetch<CityHistoryResponse>('/api/v1/city/history'),

  /** GET /api/v1/city/insights — executive policy memo */
  getInsights: () => apiFetch<CityInsightsResponse>('/api/v1/city/insights'),
}
